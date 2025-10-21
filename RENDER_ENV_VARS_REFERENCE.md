# Render Environment Variables Reference

## ✅ Complete Environment Variables for Render Services

### 🔧 Backend Service: `advancia-backend-upnf`

Copy these exact values into Render Dashboard → `advancia-backend-upnf` → **Environment** tab:

```env
NODE_ENV=production
PORT=4000

# ⚠️ CRITICAL: Use the COMPLETE PostgreSQL connection string (VIRGINIA region)
DATABASE_URL=postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a.virginia-postgres.render.com/advancia_prod

# ⚠️ CRITICAL: Add this API key (currently missing)
API_KEY=d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d

# JWT Secrets
JWT_SECRET=your-secure-jwt-secret-here-at-least-32-chars
SESSION_SECRET=your-secure-session-secret-here-at-least-32-chars

# JWT Encryption (if using encrypted tokens)
JWT_SECRET_ENCRYPTED=your-encrypted-jwt-secret
JWT_ENCRYPTION_KEY=your-32-byte-hex-encryption-key
JWT_ENCRYPTION_IV=your-16-byte-hex-iv

# Frontend URL (update after custom domain is live)
FRONTEND_URL=https://advanciapayledger.com

# ⚠️ CRITICAL: Use the CORRECT VAPID keys (ECC format, not short hex)
VAPID_PUBLIC_KEY=BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI
VAPID_PRIVATE_KEY=jKuvTOT7AS7CGMHH_d6-YbT26wE7mnWasyWkvj8JGeQ
VAPID_SUBJECT=mailto:support@advanciapayledger.com

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_51SCrKDBRIxWx70ZdM8rxm8BYZyoBorKGAwrWxX2jfdQkMiCaQqBwkgMZR2HydreOoqkJEQ3miODQZICZp773EkwH00Ci5KEuoz
# ⚠️ Get the correct webhook secret from Stripe webhook setup (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_STRIPE_DASHBOARD

# Email (optional, for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Twilio (optional, for SMS/OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid
TWILIO_PHONE_NUMBER=+1234567890
```

---

### 🎨 Frontend Service: `modular-saas-frontend`

Copy these into Render Dashboard → `modular-saas-frontend` → **Environment** tab:

```env
NODE_ENV=production

# ⚠️ CRITICAL: Use custom domain after DNS is configured
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com

# ⚠️ CRITICAL: Add the API key
NEXT_PUBLIC_API_KEY=d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d

# App Configuration
NEXT_PUBLIC_APP_NAME=Advancia PayLedger
NEXT_PUBLIC_CURRENCY_LIST=USD,EUR,BTC,ETH,USDT,TRUMP,MEDBED
NEXT_PUBLIC_FEATURE_FLAGS=notifications,bonus_tokens,debit_card,crypto_recovery

# ⚠️ CRITICAL: Use the CORRECT VAPID public key
NEXT_PUBLIC_VAPID_KEY=BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-at-least-32-chars
NEXTAUTH_URL=https://advanciapayledger.com

# Optional: Botpress chatbot
NEXT_PUBLIC_BOTPRESS_BOT_ID=your-botpress-bot-id
```

---

## 🚨 Critical Issues Found in Current Configuration

### Backend Issues:
1. ❌ **DATABASE_URL** was set to `https://advancia-backend.onrender.com` (WRONG!)
   - ✅ Must be: `postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a.oregon-postgres.render.com/advancia_prod`

2. ❌ **API_KEY** is missing
   - ✅ Must add: `d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d`

3. ❌ **VAPID_PUBLIC_KEY** was `a68b19713ecbd275413202ca7a28d40b` (short hex, WRONG!)
   - ✅ Must be: `BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI`

4. ❌ **VAPID_PRIVATE_KEY** was `0b857ee037d08004fee2543fa98c6fdc` (short hex, WRONG!)
   - ✅ Must be: `jKuvTOT7AS7CGMHH_d6-YbT26wE7mnWasyWkvj8JGeQ`

5. ❌ **STRIPE_WEBHOOK_SECRET** appears to be placeholder
   - ✅ Must be actual webhook secret from Stripe (starts with `whsec_`)

6. ⚠️ **FRONTEND_URL** is `https://advancia-frontend.onrender.com`
   - ✅ Should be: `https://advanciapayledger.com` (after custom domain is live)

### Frontend Issues:
1. ❌ **NEXT_PUBLIC_API_KEY** likely missing
2. ❌ **NEXT_PUBLIC_VAPID_KEY** likely missing or incorrect

---

## 📋 Step-by-Step Fix Instructions

### Step 1: Fix Backend Environment Variables
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on `advancia-backend-upnf` service
3. Click **Environment** tab
4. Update/add these variables (copy from above):
   - `DATABASE_URL` ← **MUST FIX**
   - `API_KEY` ← **MUST ADD**
   - `VAPID_PUBLIC_KEY` ← **MUST FIX**
   - `VAPID_PRIVATE_KEY` ← **MUST FIX**
   - `STRIPE_WEBHOOK_SECRET` ← **VERIFY/FIX**
   - `FRONTEND_URL` ← Update to custom domain
5. Click **Save Changes** (will trigger automatic redeploy)

### Step 2: Wait for Redeploy
- Watch the **Events** tab for deployment progress
- Should take ~3-5 minutes
- Look for "Deploy live" status

### Step 3: Test Backend Health
```powershell
Invoke-RestMethod "https://api.advanciapayledger.com/health"
```
Expected: `{ status: "healthy", service: "advancia-backend", ... }`

### Step 4: Test Database Connection
```powershell
cd backend
$env:DATABASE_URL="postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a.oregon-postgres.render.com/advancia_prod"
npx prisma studio
```

### Step 5: Fix Frontend Environment Variables
1. Go to `modular-saas-frontend` service
2. Click **Environment** tab
3. Add missing variables (copy from above)
4. Click **Save Changes**

---

## 🔗 Quick Reference

### Service URLs:
- Backend: https://api.advanciapayledger.com
- Frontend: https://advanciapayledger.com
- Database: `dpg-d3p5n1p5pdvs73ad8o1g-a.oregon-postgres.render.com`

### Critical Credentials:
- API Key: `d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d`
- DB User: `advancia_user`
- DB Name: `advancia_prod`

### Testing Commands:
```powershell
# Test health
Invoke-RestMethod "https://api.advanciapayledger.com/health"

# Test login (after env vars fixed)
$h = @{"x-api-key"="d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d"}
$b = '{"username":"admin","password":"AdminPassword123!"}'
Invoke-RestMethod "https://api.advanciapayledger.com/api/auth/login" -Method POST -Body $b -ContentType "application/json" -Headers $h

# Open Prisma Studio
cd backend
$env:DATABASE_URL="postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a.oregon-postgres.render.com/advancia_prod"
npx prisma studio
```

---

## ⚠️ Important Notes:

1. **DATABASE_URL format must be exact** - includes `.oregon-postgres.render.com`
2. **VAPID keys are ECC public/private keys** - not short hex strings
3. **API_KEY must match** between backend and frontend requests
4. **After changing env vars** - Render will automatically redeploy (takes ~3-5 min)
5. **Custom domain DNS** - Ensure CNAME is set: `api` → `advancia-backend-upnf.onrender.com`

---

Generated: October 20, 2025
