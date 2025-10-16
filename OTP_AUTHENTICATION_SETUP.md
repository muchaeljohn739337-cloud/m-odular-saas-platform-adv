# 🔐 OTP Authentication with Twilio SMS Setup Guide

## ✅ What's Been Implemented

Your application now supports **passwordless authentication** with two methods:

### 1. **Email OTP** (Ready to Use)
- ✅ Backend route: `/api/auth/send-otp-email`
- ✅ Frontend component with email input
- ✅ 6-digit code generation
- ✅ 5-minute expiration
- ⚠️ Currently logs OTP to console (needs email service integration)

### 2. **SMS OTP via Twilio** (Needs Configuration)
- ✅ Backend route: `/api/auth/send-otp-sms`
- ✅ Frontend component with phone input
- ✅ Twilio SDK integrated
- ⚠️ Requires Twilio account credentials

---

## 📱 Twilio Setup Instructions

### Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your phone number

### Step 2: Get Your Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Copy your **Account SID** and **Auth Token** from the dashboard
3. Go to **Phone Numbers** → **Manage** → **Active Numbers**
4. If you don't have one, click **Buy a Number** (free trial includes $15 credit)
5. Copy your **Twilio Phone Number** (format: +1234567890)

### Step 3: Update Backend Environment Variables

Open `backend/.env` and replace the placeholder values:

\`\`\`bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID="AC1234567890abcdef1234567890abcdef"  # From Twilio Console
TWILIO_AUTH_TOKEN="your_actual_auth_token_32_chars"      # From Twilio Console
TWILIO_PHONE_NUMBER="+15551234567"                        # Your Twilio number
\`\`\`

### Step 4: Upload Secrets to GitHub (Optional)

If using GitHub Actions, upload the new secrets:

\`\`\`powershell
gh secret set TWILIO_ACCOUNT_SID -b"AC1234567890..." -R pdtribe181-prog/-modular-saas-platform
gh secret set TWILIO_AUTH_TOKEN -b"your_token" -R pdtribe181-prog/-modular-saas-platform
gh secret set TWILIO_PHONE_NUMBER -b"+15551234567" -R pdtribe181-prog/-modular-saas-platform
\`\`\`

### Step 5: Restart Backend Server

\`\`\`powershell
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
cd backend
npm run dev
\`\`\`

---

## 🎯 How to Use

### Testing Email OTP (Available Now)

1. Navigate to **http://localhost:3000/auth/login**
2. Click **"Login with One-Time Code"**
3. Choose **"Login with Email OTP"**
4. Enter any email address
5. Check the **backend terminal** for the OTP code
6. Enter the code and login!

### Testing SMS OTP (After Twilio Setup)

1. Navigate to **http://localhost:3000/auth/login**
2. Click **"Login with One-Time Code"**
3. Choose **"Login with SMS OTP"**
4. Enter your phone number with country code (e.g., +1234567890)
5. Receive SMS with 6-digit code
6. Enter code and login!

---

## 🚀 API Endpoints

### Send Email OTP
\`\`\`bash
POST http://localhost:4000/api/auth/send-otp-email
Content-Type: application/json

{
  "email": "user@example.com"
}
\`\`\`

### Send SMS OTP
\`\`\`bash
POST http://localhost:4000/api/auth/send-otp-sms
Content-Type: application/json

{
  "phone": "+1234567890"
}
\`\`\`

### Verify OTP
\`\`\`bash
POST http://localhost:4000/api/auth/verify-otp
Content-Type: application/json

{
  "identifier": "user@example.com",  # or phone number
  "code": "123456"
}

# Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  }
}
\`\`\`

---

## 📋 Features Included

✅ **Two-step verification** (send code → verify code)
✅ **Multi-method support** (email or SMS)
✅ **JWT token generation** after successful verification
✅ **Code expiration** (5 minutes)
✅ **Resend functionality**
✅ **User-friendly UI** with step-by-step flow
✅ **Development mode** shows OTP in response for testing
✅ **Automatic user creation** on first login
✅ **Back navigation** between steps

---

## 🔒 Security Features

- ✅ **Time-limited codes** (5-minute expiration)
- ✅ **One-time use** (codes deleted after verification)
- ✅ **JWT authentication** (7-day token expiration)
- ✅ **Rate limiting ready** (add middleware as needed)
- ⚠️ **In-memory storage** (use Redis in production)

---

## 🎨 UI Flow

\`\`\`
Login Page
    ↓
[ Password Login ] ← Toggle → [ OTP Login ]
    ↓
Choose Method (Email or SMS)
    ↓
Enter Email/Phone
    ↓
Send OTP (displays code in dev mode)
    ↓
Enter 6-digit Code
    ↓
Verify & Redirect to Dashboard
\`\`\`

---

## 🛠 Production Considerations

### For Production Deployment:

1. **Email Service Integration**
   - Replace console.log with actual email service
   - Options: SendGrid, AWS SES, Mailgun, Postmark
   
2. **Redis for OTP Storage**
   - Replace in-memory Map with Redis
   - Better for distributed systems
   - Automatic expiration support

3. **Rate Limiting**
   - Add rate limiting middleware
   - Prevent OTP spam attacks
   
4. **Phone Number Validation**
   - Use library like `libphonenumber-js`
   - Validate format before sending SMS

5. **Remove Dev Code**
   - Remove OTP from API responses
   - Remove console.log statements

---

## 📞 Twilio Free Trial Limits

- ✅ **$15 credit** included
- ✅ **Verified numbers** can receive SMS (free)
- ⚠️ **Unverified numbers** require account upgrade
- 💰 **Cost**: ~$0.0075 per SMS after trial

To send to unverified numbers, you need to upgrade your Twilio account.

---

## 🐛 Troubleshooting

### SMS Not Sending
1. Check Twilio credentials in `.env`
2. Verify phone number format includes country code (+1234567890)
3. Check backend terminal for error messages
4. Ensure Twilio account has credit

### Email OTP Not Showing
1. Check backend terminal - code is logged there
2. Ensure backend server is running
3. Check browser console for API errors

### "SMS service not configured" Error
- Twilio credentials are missing or invalid in `.env`
- Restart backend after adding credentials

---

## 📚 Next Steps

1. ✅ **Get Twilio credentials** from console.twilio.com
2. ✅ **Update backend/.env** with real values
3. ✅ **Restart backend server**
4. ✅ **Test SMS OTP** with your phone number
5. 🚀 **Integrate email service** (SendGrid/AWS SES)
6. 🚀 **Add Redis** for production OTP storage
7. 🚀 **Deploy to production**

---

## 🎉 Success!

Your OTP authentication system is ready! Users can now log in with:
- 📧 Email OTP (console-based for dev)
- 📱 SMS OTP (Twilio-powered)
- 🔑 Traditional password login (existing)

The UI allows easy toggling between methods on the login page.
