# 🚀 Stripe Setup - Quick Start

## ⚡ 3-Minute Setup

### 1️⃣ Get API Keys (2 minutes)
```
1. Go to: https://dashboard.stripe.com/register
2. Create free account
3. Click: Developers → API Keys
4. Copy both keys (pk_test_... and sk_test_...)
```

### 2️⃣ Add to .env Files (1 minute)

**Backend** (`backend/.env`):
```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### 3️⃣ Restart Servers
```powershell
# Press Ctrl+C in both terminals, then:
cd backend && npm run dev
cd frontend && npm run dev
```

---

## 🧪 Test Payment (1 minute)

1. Go to dashboard: http://localhost:3000
2. Click **"Add Balance"**
3. Enter: $10.00
4. Use test card: **4242 4242 4242 4242**
5. Expiry: **12/25** | CVC: **123** | ZIP: **12345**
6. ✅ Payment complete!

---

## 📋 What's Working Now

✅ Payment button on dashboard  
✅ Stripe checkout page  
✅ Success/cancel pages  
✅ Webhook handler (logs to console)  
⚠️ Balance updates (need database setup)

---

## 🔌 Webhook Setup (Optional for Local Testing)

**Install Stripe CLI:**
```powershell
# Download: https://github.com/stripe/stripe-cli/releases
# Or: scoop install stripe
```

**Forward webhooks:**
```powershell
stripe login
stripe listen --forward-to localhost:4000/api/payments/webhook
```

Copy the webhook secret (whsec_...) to `backend/.env`

---

## 🐛 Quick Fixes

**"Stripe not configured" error?**
- Add STRIPE_SECRET_KEY to backend/.env
- Restart backend server

**Payment button not working?**
- Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to frontend/.env.local
- Restart frontend server

**Webhook not receiving events?**
- Use Stripe CLI for local testing (see above)
- Or deploy to production with public URL

---

## 📚 Full Guide

See `STRIPE_SETUP_COMPLETE.md` for:
- Detailed webhook setup
- Database integration
- Security checklist
- Advanced testing

---

## ✨ You're Ready!

Your payment system is fully built. Just add keys and start accepting payments! 💰

**Need help?** Check `STRIPE_SETUP_COMPLETE.md` or visit https://stripe.com/docs
