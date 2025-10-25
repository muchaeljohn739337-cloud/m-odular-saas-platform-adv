import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Advancia Pay Ledger - Modern Fintech Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            marginBottom: "40px",
          }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            <path
              d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
              stroke="url(#og-gradient1)"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M50 25 L50 75"
              stroke="url(#og-gradient2)"
              strokeWidth="2"
            />
            <path
              d="M42 32 C42 28 45 25 50 25 C55 25 58 28 58 32 C58 36 55 38 50 38"
              stroke="url(#og-gradient2)"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M50 62 C55 62 58 65 58 69 C58 73 55 75 50 75 C45 75 42 73 42 69"
              stroke="url(#og-gradient2)"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M30 70 L40 55 L50 60 L60 40 L70 45"
              stroke="url(#og-gradient3)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="og-gradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
              <linearGradient
                id="og-gradient2"
                x1="50%"
                y1="0%"
                x2="50%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient
                id="og-gradient3"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                background:
                  "linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)",
                backgroundClip: "text",
                color: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Advancia Pay Ledger
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "36px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          Modern fintech platform for transaction tracking and crypto trading
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "60px",
          }}
        >
          {["Secure Payments", "Crypto Trading", "Real-time Analytics"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 32px",
                  background: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                <span style={{ fontSize: "24px", color: "#06b6d4" }}>✓</span>
                <span style={{ fontSize: "24px", color: "#e2e8f0" }}>
                  {feature}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
