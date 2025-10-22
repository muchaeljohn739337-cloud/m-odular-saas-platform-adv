# Frontend Environment Variables for Render

## 🎯 Copy These to Render Dashboard

**Service:** `modular-saas-frontend`  
**Location:** Environment tab

---

## Required Variables (Copy-Paste Ready)

### 🔗 API Configuration
```
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
```

```
NEXT_PUBLIC_API_KEY=d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d
```

### 🔔 Push Notifications
```
NEXT_PUBLIC_VAPID_KEY=BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI
```

### 🔐 NextAuth Configuration
```
NEXTAUTH_URL=https://advanciapayledger.com
```

```
NEXTAUTH_SECRET=793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc6761381569lcc2ab55
```

### 💳 Stripe (Test Mode)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SCrKDBRIxWx70ZdaKH7GCHGXVzQf0Y2YkPBCXlGBqVxqX5qJR8X9wF7Y0wCz3qM5qKL6gT8nR4jW2vB1sA3eZ00abcdefgh
```
*Note: Replace with your actual Stripe publishable key from dashboard.stripe.com*

### 🎨 App Configuration
```
NODE_ENV=production
```

```
NEXT_PUBLIC_APP_NAME=Advancia PayLedger
```

```
NEXT_PUBLIC_CURRENCY_LIST=USD,EUR,BTC,ETH,USDT,TRUMP,MEDBED
```

```
NEXT_PUBLIC_FEATURE_FLAGS=notifications,bonus_tokens,debit_card,crypto_recovery
```

### 🤖 Optional: Botpress Chatbot
```
NEXT_PUBLIC_BOTPRESS_BOT_ID=your-botpress-bot-id
```
*Leave blank if not using Botpress*

---

## 📋 Step-by-Step Instructions

### 1. Go to Render Dashboard
- URL: https://dashboard.render.com
- Login if needed

### 2. Select Frontend Service
- Click on **`modular-saas-frontend`** (or your frontend service name)

### 3. Open Environment Tab
- Click **Environment** in the left sidebar

### 4. Add Each Variable
For each variable above:
1. Click **Add Environment Variable**
2. Enter the **Key** (e.g., `NEXT_PUBLIC_API_URL`)
3. Enter the **Value** (e.g., `https://api.advanciapayledger.com`)
4. Repeat for all variables

### 5. Save Changes
- Click **Save Changes** at the bottom
- Render will automatically redeploy (takes ~3-5 minutes)

---

## ✅ Verification Checklist

After deployment, verify these are set:
- [ ] `NEXT_PUBLIC_API_URL` → Points to backend
- [ ] `NEXT_PUBLIC_API_KEY` → Matches backend API_KEY
- [ ] `NEXT_PUBLIC_VAPID_KEY` → Matches backend VAPID_PUBLIC_KEY
- [ ] `NEXTAUTH_URL` → Your custom domain
- [ ] `NEXTAUTH_SECRET` → Strong secret (min 32 chars)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Test mode key from Stripe
- [ ] `NODE_ENV` → Set to `production`
- [ ] `NEXT_PUBLIC_APP_NAME` → App name
- [ ] `NEXT_PUBLIC_CURRENCY_LIST` → Supported currencies
- [ ] `NEXT_PUBLIC_FEATURE_FLAGS` → Enabled features

---

## 🚨 Important Notes

### API Key Must Match
The `NEXT_PUBLIC_API_KEY` in frontend **MUST** match the `API_KEY` in backend.

**Backend API_KEY:**
```
d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d
```

### VAPID Key Must Match
The `NEXT_PUBLIC_VAPID_KEY` in frontend **MUST** match `VAPID_PUBLIC_KEY` in backend.

**Backend VAPID_PUBLIC_KEY:**
```
BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI
```

### Get Stripe Publishable Key
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the **Publishable key** (starts with `pk_test_`)
3. Use that value for `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## 🔄 After Deployment

Once Render finishes deploying (watch the Events tab):

### Test Frontend
```powershell
Invoke-WebRequest "https://advanciapayledger.com" -UseBasicParsing
```

### Test API Connection
Open browser → https://advanciapayledger.com  
Check browser console → Should see API calls to `https://api.advanciapayledger.com`

---

## 📞 Quick Copy Commands

### All Required Variables (One Block)
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
NEXT_PUBLIC_API_KEY=d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d
NEXT_PUBLIC_VAPID_KEY=BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI
NEXT_PUBLIC_APP_NAME=Advancia PayLedger
NEXT_PUBLIC_CURRENCY_LIST=USD,EUR,BTC,ETH,USDT,TRUMP,MEDBED
NEXT_PUBLIC_FEATURE_FLAGS=notifications,bonus_tokens,debit_card,crypto_recovery
NEXTAUTH_URL=https://advanciapayledger.com
NEXTAUTH_SECRET=793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc6761381569lcc2ab55
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_KEY_HERE
```

*Note: You'll need to add these one by one in Render dashboard - copy each line individually*

---

**Ready to proceed?** Go to Render Dashboard and add these variables! 🚀
