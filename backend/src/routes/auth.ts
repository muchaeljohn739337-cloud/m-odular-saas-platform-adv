import express from "express";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import prisma from "../prismaClient";
import { config } from "../config";

const router = express.Router();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Store OTPs in-memory (use Redis in production for scalability)
interface OTPEntry {
  code: string;
  expires: number;
  type: "email" | "sms";
}

const otps = new Map<string, OTPEntry>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via Email
 * POST /api/auth/send-otp-email
 * Body: { email: string }
 */
router.post("/send-otp-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const code = generateOTP();
    const expires = Date.now() + 5 * 60_000; // 5 minutes

    otps.set(email, { code, expires, type: "email" });

    // TODO: Send actual email via SendGrid/AWS SES
    // For now, log to console (DEVELOPMENT ONLY)
    console.log(`📧 OTP for ${email}: ${code} (expires in 5 min)`);

    res.json({
      message: "OTP sent to your email",
      // Include code in response for development/testing only
      ...(process.env.NODE_ENV === "development" && { code }),
    });
  } catch (error) {
    console.error("Error sending email OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/**
 * Send OTP via SMS (Twilio Verify API)
 * POST /api/auth/send-otp-sms
 * Body: { phone: string }
 */
router.post("/send-otp-sms", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Validate Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.error("❌ Twilio credentials not configured");
      return res.status(500).json({ error: "SMS service not configured" });
    }

    const code = generateOTP();
    const expires = Date.now() + 5 * 60_000; // 5 minutes

    otps.set(phone, { code, expires, type: "sms" });

    // Use Twilio Verify API if Service SID is configured
    if (twilioVerifyServiceSid) {
      try {
        const verification = await twilioClient.verify.v2
          .services(twilioVerifyServiceSid)
          .verifications.create({ to: phone, channel: "sms" });

        console.log(`📱 Verify API - SMS OTP sent to ${phone} (SID: ${verification.sid})`);

        return res.json({
          message: "OTP sent to your phone via Verify API",
          verificationSid: verification.sid,
          status: verification.status,
        });
      } catch (verifyError: any) {
        console.error("Verify API error, falling back to direct SMS:", verifyError.message);
        // Fall through to direct SMS method
      }
    }

    // Fallback: Send SMS via Twilio Messaging API
    if (!twilioFromNumber) {
      console.error("❌ TWILIO_PHONE_NUMBER not configured");
      return res.status(500).json({ error: "SMS sender not configured" });
    }

    await twilioClient.messages.create({
      body: `Your Advancia Pay verification code is: ${code}\n\nValid for 5 minutes.`,
      from: twilioFromNumber,
      to: phone,
    });

    console.log(`📱 Direct SMS OTP sent to ${phone}`);

    res.json({
      message: "OTP sent to your phone",
      // Include code in response for development/testing only
      ...(process.env.NODE_ENV === "development" && { code }),
    });
  } catch (error: any) {
    console.error("Error sending SMS OTP:", error);
    res.status(500).json({
      error: "Failed to send SMS",
      details: error.message,
    });
  }
});

/**
 * Verify OTP and issue JWT token
 * POST /api/auth/verify-otp
 * Body: { identifier: string (email or phone), code: string }
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { identifier, code } = req.body;

    if (!identifier || !code) {
      return res.status(400).json({ error: "Identifier and code are required" });
    }

    // Determine if this is a phone number (for Twilio Verify) or email
    const isPhone = identifier.startsWith("+") || /^\d+$/.test(identifier);
    let isValidOTP = false;
    let otpType = "email";

    // If it's a phone number and Verify API is configured, use Twilio Verify
    if (isPhone && twilioVerifyServiceSid) {
      try {
        console.log(`🔍 Verifying code via Twilio Verify API for ${identifier}`);
        
        const verificationCheck = await twilioClient.verify.v2
          .services(twilioVerifyServiceSid)
          .verificationChecks.create({
            to: identifier,
            code: code,
          });

        console.log(`📊 Twilio Verify response: ${verificationCheck.status}`);

        if (verificationCheck.status === "approved") {
          isValidOTP = true;
          otpType = "sms";
          console.log(`✅ Code verified via Twilio Verify API`);
        } else {
          return res.status(400).json({ error: "Invalid code" });
        }
      } catch (twilioError: any) {
        console.error("❌ Twilio Verify API error:", twilioError.message);
        // Fall back to in-memory check
        console.log("⚠️ Falling back to in-memory OTP check");
      }
    }

    // If not validated via Twilio Verify, check in-memory storage
    if (!isValidOTP) {
      const entry = otps.get(identifier);

      // Validate OTP
      if (!entry) {
        return res.status(400).json({ error: "No OTP found for this identifier" });
      }

      if (entry.code !== code) {
        return res.status(400).json({ error: "Invalid code" });
      }

      if (entry.expires < Date.now()) {
        otps.delete(identifier);
        return res.status(400).json({ error: "Code has expired" });
      }

      // OTP is valid - clean up
      otps.delete(identifier);
      isValidOTP = true;
      otpType = entry.type;
      console.log(`✅ Code verified via in-memory storage`);
    }

    // Create or get user
    let user;
    try {
      if (otpType === "email") {
        user = await prisma.user.upsert({
          where: { email: identifier },
          update: { lastLogin: new Date() },
          create: {
            email: identifier,
            username: identifier.split("@")[0],
            passwordHash: "", // OTP-based, no password
          },
        });
      } else {
        // For phone authentication, use phone as identifier
        // Check if user exists by phone or create with phone as email temporarily
        const phoneAsEmail = `${identifier.replace(/\+/g, "")}@phone.temp`;
        user = await prisma.user.upsert({
          where: { email: phoneAsEmail },
          update: { lastLogin: new Date() },
          create: {
            email: phoneAsEmail,
            username: identifier.replace(/\+/g, ""),
            passwordHash: "", // OTP-based, no password
          },
        });
      }
    } catch (dbError: any) {
      console.error("⚠️ Database error (continuing with temp user):", dbError.message);
      // Create a temporary user object if database is unavailable
      const tempUserId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      user = {
        id: tempUserId,
        email: otpType === "email" ? identifier : `${identifier.replace(/\+/g, "")}@phone.temp`,
        name: null,
        username: otpType === "email" ? identifier.split("@")[0] : identifier.replace(/\+/g, ""),
      };
      console.log(`⚠️ Using temporary user ID: ${tempUserId}`);
    }

    // Issue JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: "otp-auth",
      },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    console.log(`🎉 User authenticated successfully: ${user.id}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 * Body: { identifier: string, type: "email" | "sms" }
 */
router.post("/resend-otp", async (req, res) => {
  try {
    const { identifier, type } = req.body;

    if (type === "email") {
      // Generate new OTP for email
      const code = generateOTP();
      const expires = Date.now() + 5 * 60_000;
      otps.set(identifier, { code, expires, type: "email" });
      
      console.log(`📧 OTP for ${identifier}: ${code} (expires in 5 min)`);
      
      return res.status(200).json({
        success: true,
        message: "New OTP sent to your email",
        ...(process.env.NODE_ENV === "development" && { code }),
      });
    } else if (type === "sms") {
      // Generate new OTP for SMS
      const code = generateOTP();
      const expires = Date.now() + 5 * 60_000;
      otps.set(identifier, { code, expires, type: "sms" });
      
      // Send SMS via Twilio
      await twilioClient.messages.create({
        body: `Your verification code is: ${code}`,
        from: twilioFromNumber,
        to: identifier,
      });
      
      return res.status(200).json({
        success: true,
        message: "New OTP sent to your phone",
      });
    }

    res.status(400).json({ error: "Invalid type" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});

export default router;
