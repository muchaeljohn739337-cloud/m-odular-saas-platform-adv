import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import LiveSupportScript from "@/components/LiveSupportScript";
import SystemFeedbackBanner from "@/components/SystemFeedbackBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import ChatbotWidget from "@/components/ChatbotWidget";
import SilentModeProvider from "@/components/SilentModeProvider";

export const metadata: Metadata = {
  title: "Advancia Pay Ledger - Fintech Dashboard",
  description:
    "Modern fintech platform for transaction tracking and crypto trading",
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

