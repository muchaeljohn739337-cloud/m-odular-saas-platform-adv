"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthMethod = "email" | "sms";
type Step = "choose-method" | "enter-identifier" | "enter-code";

export default function OtpLogin() {
  const [step, setStep] = useState<Step>("choose-method");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) {
      return err.message;
    }
    return "Unexpected error";
  };

  // Step 1: Choose authentication method
  const selectMethod = (method: AuthMethod) => {
    setAuthMethod(method);
    setStep("enter-identifier");
    setError("");
  };

  // Step 2: Send OTP
  const sendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const endpoint =
        authMethod === "email"
          ? `${API_URL}/api/auth/send-otp-email`
          : `${API_URL}/api/auth/send-otp-sms`;

      const body =
        authMethod === "email" ? { email: identifier } : { phone: identifier };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setMessage(data.message);
      // Show code in development for easy testing
      if (data.code) {
        setMessage(`${data.message} | Code: ${data.code} (dev mode)`);
      }
      setStep("enter-code");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const verifyOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid code");
      }

      // Store token and redirect
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setCode("");
    await sendOtp();
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg">
      {/* Step 1: Choose Method */}
      {step === "choose-method" && (
        <>
          <h2 className="text-2xl font-bold text-blue-700 mb-2">
            Login with One-Time Code
          </h2>
          <p className="text-gray-600 mb-6">Choose your preferred method</p>

          <div className="space-y-4">
            <button
              onClick={() => selectMethod("email")}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Login with Email OTP
            </button>

            <button
              onClick={() => selectMethod("sms")}
              className="w-full flex items-center justify-center gap-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Login with SMS OTP
            </button>
          </div>
        </>
      )}

      {/* Step 2: Enter Email/Phone */}
      {step === "enter-identifier" && (
        <>
          <button
            onClick={() => setStep("choose-method")}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-2xl font-bold text-blue-700 mb-2">
            {authMethod === "email" ? "Enter Your Email" : "Enter Your Phone"}
          </h2>
          <p className="text-gray-600 mb-6">
            We&apos;ll send you a verification code
          </p>

          <input
            type={authMethod === "email" ? "email" : "tel"}
            placeholder={
              authMethod === "email"
                ? "you@example.com"
                : "+1234567890"
            }
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            disabled={loading}
          />

          {authMethod === "sms" && (
            <p className="text-sm text-gray-500 mb-4">
              Include country code (e.g., +1 for USA)
            </p>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={sendOtp}
            disabled={loading || !identifier}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Code"}
          </button>
        </>
      )}

      {/* Step 3: Enter Verification Code */}
      {step === "enter-code" && (
        <>
          <button
            onClick={() => setStep("enter-identifier")}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-2xl font-bold text-blue-700 mb-2">
            Enter Verification Code
          </h2>
          <p className="text-gray-600 mb-2">
            Code sent to {identifier}
          </p>

          {message && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm mb-4">
              {message}
            </div>
          )}

          <input
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            maxLength={6}
            disabled={loading}
          />

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={verifyOtp}
            disabled={loading || code.length !== 6}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <button
            onClick={resendOtp}
            disabled={loading}
            className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
          >
            Resend Code
          </button>
        </>
      )}
    </div>
  );
}
