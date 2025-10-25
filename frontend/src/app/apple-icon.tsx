import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Hexagon shape */}
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
          <path
            d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
            stroke="white"
            strokeWidth="3"
            fill="none"
          />
          {/* Dollar/Crypto symbol */}
          <path d="M50 25 L50 75" stroke="white" strokeWidth="2" />
          <path
            d="M42 32 C42 28 45 25 50 25 C55 25 58 28 58 32 C58 36 55 38 50 38"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M50 62 C55 62 58 65 58 69 C58 73 55 75 50 75 C45 75 42 73 42 69"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          {/* Chart line */}
          <path
            d="M30 70 L40 55 L50 60 L60 40 L70 45"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
