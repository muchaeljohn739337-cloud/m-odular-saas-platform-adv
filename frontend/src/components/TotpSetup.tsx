"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TotpSetupProps {
  onComplete?: () => void;
}

export default function TotpSetup({ onComplete }: TotpSetupProps) {
  const [step, setStep] = useState<"setup" | "verify" | "complete">("setup");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetup = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/2fa/setup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to setup 2FA");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/2fa/enable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid verification code");
      }

      setStep("complete");
      if (onComplete) {
        setTimeout(() => onComplete(), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const blob = new Blob(
      [
        "ADVANCIA 2FA BACKUP CODES\n",
        "=========================\n\n",
        "Keep these codes safe! Each can be used once if you lose your authenticator.\n\n",
        backupCodes.join("\n"),
        "\n\nGenerated: " + new Date().toLocaleString(),
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "advancia-2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === "setup") {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Enable Two-Factor Authentication
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Add an extra layer of security to your account by requiring a verification code
          from your authenticator app when you sign in.
        </p>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📱 What you'll need:
            </h3>
            <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
              <li>Google Authenticator</li>
              <li>Authy</li>
              <li>Microsoft Authenticator</li>
              <li>Any TOTP-compatible app</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            onClick={handleSetup}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting up..." : "Start Setup"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Scan QR Code
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              {qrCode && (
                <img src={qrCode} alt="2FA QR Code" className="w-full h-auto" />
              )}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-semibold mb-2">Can't scan the QR code?</p>
              <p className="mb-2">Enter this code manually:</p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                {secret}
              </code>
            </div>
          </div>

          {/* Verification Section */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📝 Instructions:
              </h3>
              <ol className="list-decimal list-inside text-blue-800 dark:text-blue-200 space-y-2 text-sm">
                <li>Open your authenticator app</li>
                <li>Scan the QR code or enter the code manually</li>
                <li>Enter the 6-digit code shown in the app below</li>
              </ol>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Enable 2FA"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            2FA Enabled Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your account is now protected with two-factor authentication.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            ⚠️ Important: Save Your Backup Codes
          </h3>
          <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
            You have {backupCodes.length} backup codes. Each can be used once if you lose
            access to your authenticator app.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {backupCodes.map((code, idx) => (
              <code
                key={idx}
                className="text-center bg-white dark:bg-gray-700 p-2 rounded text-sm font-mono"
              >
                {code}
              </code>
            ))}
          </div>

          <button
            onClick={downloadBackupCodes}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            📥 Download Backup Codes
          </button>
        </div>

        <button
          onClick={() => router.push("/settings")}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          Back to Settings
        </button>
      </div>
    );
  }

  return null;
}
