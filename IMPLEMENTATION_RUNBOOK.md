# 🚀 Implementation Runbook - UI/UX & Security

## Quick Start (Copy-Paste Ready Code)

### Step 1: Update Frontend Layout with Toast Provider

**File:** `frontend/src/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import ScrollToTop from '@/components/ScrollToTop'
import LiveSupportScript from '@/components/LiveSupportScript'
import SystemFeedbackBanner from '@/components/SystemFeedbackBanner'
import ChatbotWidget from '@/components/ChatbotWidget'
import { ToastProvider } from '@/components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Advancia Pay Ledger - Fintech Dashboard',
  description: 'Modern fintech platform for transaction tracking and crypto trading',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ScrollToTop />
          <ToastProvider>
            <AuthProvider>
              <SystemFeedbackBanner />
              <LiveSupportScript />
              {children}
              <ChatbotWidget />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

### Step 2: Update Backend Index with Security Middleware

**File:** `backend/src/index.ts`

```typescript
import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { 
  configureCORS, 
  forceHTTPS, 
  secureHeaders, 
  secureLogger,
  apiRateLimiter,
  otpRateLimiter 
} from './middleware/security'
import { auditLogMiddleware } from './utils/auditLog'

const app: Express = express()
const PORT = process.env.PORT || 4000

// Trust proxy (for Render and other reverse proxies)
app.set('trust proxy', 1)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Security middleware
app.use(forceHTTPS)
app.use(secureHeaders)
app.use(secureLogger)
configureCORS(app)

// Audit logging
app.use(auditLogMiddleware)

// Rate limiting
app.use(apiRateLimiter)

// Routes
import authRoutes from './routes/auth'
import healthRoutes from './routes/health'
// ... import other routes

app.use('/api/auth', otpRateLimiter, authRoutes)
app.use('/api/health', healthRoutes)
// ... use other routes

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})

export default app
```

---

### Step 3: Add Toast to API Calls

**Example File:** `frontend/src/app/dashboard/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ToastProvider'
import { LoadingSpinner, ErrorAlert } from '@/components/LoadingStates'

export default function DashboardPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/dashboard')
        if (!response.ok) throw new Error('Failed to load dashboard')

        const result = await response.json()
        setData(result)

        addToast({
          type: 'success',
          title: 'Dashboard Loaded',
          message: 'Your data has been refreshed',
          duration: 2000,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)

        addToast({
          type: 'error',
          title: 'Error',
          message,
          duration: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [addToast])

  if (loading) return <LoadingSpinner fullScreen message="Loading dashboard..." />
  if (error) return <ErrorAlert title="Dashboard Error" message={error} type="error" />

  return (
    <div className="p-6">
      {/* Dashboard content */}
    </div>
  )
}
```

---

### Step 4: Add Loading State to Forms

**Example File:** `frontend/src/components/LoginForm.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useToast } from '@/components/ToastProvider'
import { LoadingSpinner } from '@/components/LoadingStates'

export default function LoginForm() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      addToast({
        type: 'success',
        title: 'Welcome Back',
        message: 'You have been logged in successfully',
      })

      // Redirect
      window.location.href = '/dashboard'
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Login Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? <LoadingSpinner size="sm" /> : 'Log In'}
      </button>
    </form>
  )
}
```

---

### Step 5: Apply OTP Rate Limiting

**File:** `backend/src/routes/auth.ts`

```typescript
import { Router } from 'express'
import { otpRateLimiter } from '../middleware/security'
import { createAuditLog } from '../utils/auditLog'

const router = Router()

// Request OTP - rate limited to 5 per 15 minutes
router.post('/otp/request', otpRateLimiter, async (req, res) => {
  try {
    const { phone } = req.body

    // Your OTP logic here
    console.log(`OTP requested for: ${phone}`)

    // Log the action
    await createAuditLog({
      userId: req.query.userId as string || 'unknown',
      action: 'OTP_REQUESTED',
      resourceType: 'auth',
      resourceId: phone,
      metadata: {
        phone,
        ipAddress: req.ip,
      },
    })

    res.json({ success: true, message: 'OTP sent' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

// Verify OTP
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, code } = req.body

    // Your OTP verification logic here

    await createAuditLog({
      userId: req.query.userId as string || 'unknown',
      action: 'OTP_VERIFIED',
      resourceType: 'auth',
      resourceId: phone,
    })

    res.json({ success: true, token: 'auth_token_here' })
  } catch (error) {
    res.status(400).json({ error: 'Invalid OTP' })
  }
})

export default router
```

---

### Step 6: Test CORS Configuration

**In your browser console (http://localhost:3000):**

```javascript
// This should work (same origin)
fetch('http://localhost:4000/api/health')
  .then(r => r.json())
  .then(console.log)

// Check CORS headers
fetch('http://localhost:4000/api/health')
  .then(r => {
    console.log('CORS Headers:')
    console.log('Allow-Origin:', r.headers.get('access-control-allow-origin'))
    console.log('Allow-Methods:', r.headers.get('access-control-allow-methods'))
  })
```

---

### Step 7: Test Rate Limiting

```bash
# Test OTP rate limiting (should allow 5, block 6th)
for i in {1..7}; do
  echo "Request $i:"
  curl -X POST http://localhost:4000/api/auth/otp/request \
    -H "Content-Type: application/json" \
    -d '{"phone":"+1234567890"}' \
    -w "Status: %{http_code}\n"
  sleep 0.5
done

# 6th and 7th requests should return 429 (Too Many Requests)
```

---

### Step 8: Verify Security Headers

```bash
# Check security headers
curl -i http://localhost:4000/api/health | grep -i "x-\|content-security\|strict"

# Should see:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
```

---

## 🔄 Integration Workflow

```
1. Update backend security middleware
   ↓
2. Test CORS headers with curl
   ↓
3. Update frontend layout with ToastProvider
   ↓
4. Add toast calls to API handlers
   ↓
5. Add loading states to async operations
   ↓
6. Test rate limiting
   ↓
7. Mobile responsive testing
   ↓
8. Deploy to production
```

---

## 🧪 Testing Checklist

- [ ] Toast notifications appear and disappear
- [ ] Loading spinner shows during API calls
- [ ] Error messages display correctly
- [ ] CORS headers present in responses
- [ ] Rate limiting blocks 6th OTP request
- [ ] Sensitive data redacted from logs
- [ ] All pages responsive on mobile
- [ ] Forms work on touch devices
- [ ] No console errors
- [ ] Security headers present

---

## 📱 Mobile Testing Commands

```bash
# Open dashboard on mobile simulator
npm run dev  # Frontend
npm run dev  # Backend (separate terminal)

# Then open in browser:
# http://localhost:3000

# Chrome Mobile Emulation:
# 1. Press F12
# 2. Click device icon (Ctrl+Shift+M)
# 3. Test on iPhone 12/14
```

---

## 🐛 Troubleshooting

### Toast Not Showing
- Check `ToastProvider` is wrapping app in layout.tsx
- Verify `useToast` is called from client component
- Check console for errors (F12 → Console)

### CORS Errors
- Verify `FRONTEND_URL` environment variable
- Check `configureCORS` is called before routes
- Test with curl first, then browser

### Rate Limiting Not Working
- Verify middleware is applied
- Check rate limiter config (windowMs, max)
- Test with rapid requests
- Check if running behind proxy (may need `app.set('trust proxy', 1)`)

### Security Headers Missing
- Verify `secureHeaders` middleware is applied
- Check middleware order (should be early)
- Restart backend server
- Check network tab in DevTools

---

## 📚 Reference Files

- `UI_SECURITY_IMPLEMENTATION.md` - Full implementation guide
- `frontend/src/components/ToastProvider.tsx` - Toast implementation
- `frontend/src/components/LoadingStates.tsx` - Loading components
- `backend/src/middleware/security.ts` - Security middleware
- `backend/src/utils/auditLog.ts` - Audit logging

---

## ✅ Done!

All components are created and ready for integration. Follow the steps above to add them to your application.

**Next Steps:**
1. Copy the code samples above into your files
2. Update imports as needed
3. Test on both desktop and mobile
4. Deploy to production

---

*Status: Ready for Implementation*  
*Complexity: Medium*  
*Time Estimate: 2-4 hours*  
*Commit: c7f61c6*
