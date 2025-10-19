$loansPageContent = @'
'use client'

import { motion } from 'framer-motion'
import { Banknote, Lock, Sparkles, Calendar, TrendingUp, Bell, ArrowRight } from 'lucide-react'

export default function LoansPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
              <Banknote className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Loan Services
              </h1>
              <p className="text-slate-600 text-sm">Feature Coming Soon</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-6 h-6" />
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                DEMO MODE
              </span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              Loan Services Coming Soon!
            </h2>
            
            <p className="text-lg text-white/90 mb-6">
              We are building an amazing loan platform with competitive rates, flexible terms, and instant approvals. 
              This feature is currently in development and will be available in a future update.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm font-medium mb-2">What to expect:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  Competitive interest rates starting at 5% APR
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  Flexible repayment terms (6-60 months)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  Instant credit decisions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  No hidden fees or prepayment penalties
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
          >
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-3 rounded-lg w-fit mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Competitive Rates</h3>
            <p className="text-sm text-slate-600">
              Best-in-class interest rates tailored to your credit profile
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
          >
            <div className="bg-gradient-to-br from-blue-400 to-cyan-600 p-3 rounded-lg w-fit mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Flexible Terms</h3>
            <p className="text-sm text-slate-600">
              Choose repayment schedules that fit your budget and lifestyle
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
          >
            <div className="bg-gradient-to-br from-purple-400 to-pink-600 p-3 rounded-lg w-fit mb-4">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Instant Decisions</h3>
            <p className="text-sm text-slate-600">
              Get pre-approved in minutes with our automated credit system
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 text-center"
        >
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            Want to be notified when loans launch?
          </h3>
          <p className="text-slate-600 mb-6">
            Join our waitlist to get early access and exclusive launch offers
          </p>
          
          <button 
            disabled
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg opacity-50 cursor-not-allowed"
          >
            <Bell className="w-5 h-5" />
            Join Waitlist
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-xs text-slate-500 mt-4">
            Waitlist feature coming soon
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Platform Update:</strong> Our loan services are currently under development. 
              In the meantime, explore our other features like crypto trading, token management, 
              and ETH transactions. Stay tuned for updates!
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
'@

$loansPageContent | Out-File -FilePath "C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\frontend\src\app\loans\page.tsx" -Encoding UTF8 -NoNewline
Write-Host "✓ Created demo loans page" -ForegroundColor Green
