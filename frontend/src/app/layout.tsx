import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import LiveSupportScript from "@/components/LiveSupportScript";
import SystemFeedbackBanner from "@/components/SystemFeedbackBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import ChatbotWidget from "@/components/ChatbotWidget";
import SilentModeProvider from "@/components/SilentModeProvider";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Advancia Pay Ledger - Fintech Dashboard",
  description:
    "Modern fintech platform for transaction tracking and crypto trading",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ErrorBoundary>
          <ScrollToTop />
          <AuthProvider>
            <SilentModeProvider />
            <SystemFeedbackBanner />
            <LiveSupportScript />
            <ServiceWorkerRegistration />
            {children}
            <ChatbotWidget />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
