import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import ScrollToTop from '@/components/ScrollToTop'
import LiveSupportScript from '@/components/LiveSupportScript'
import SystemFeedbackBanner from '@/components/SystemFeedbackBanner'
import ChatbotWidget from '@/components/ChatbotWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Advancia Pay Ledger - Fintech Dashboard',
  description: 'Modern fintech platform for transaction tracking and crypto trading',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ScrollToTop />
          <AuthProvider>
            <SystemFeedbackBanner />
            <LiveSupportScript />
            {children}
            <ChatbotWidget />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
