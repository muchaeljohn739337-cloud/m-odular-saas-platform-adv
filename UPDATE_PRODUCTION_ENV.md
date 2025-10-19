# 🔄 Update Production Environment Variables

## ✅ What We're Updating:

1. **Frontend:** Point to new custom backend domain
2. **Backend:** Add ETH Gateway configuration

---

## 📋 **Step 1: Update Frontend Environment Variable**

### **In Render Dashboard:**

1. **Go to:** https://dashboard.render.com/
2. **Click:** `modular-saas-frontend` service
3. **Click:** "Environment" (left sidebar)
4. **Find:** `NEXT_PUBLIC_API_URL`

### **Update this variable:**

**OLD VALUE:**
```
https://advancia-backend.onrender.com
```

**NEW VALUE:**
```
https://api.advanciapayledger.com
```

5. **Click:** "Save Changes"
6. **Wait:** 3-5 minutes for automatic redeploy

### **Expected Result:**
```
✅ Frontend will now use custom backend domain
✅ All API calls go to: https://api.advanciapayledger.com
✅ Professional branding complete
```

---

## 📋 **Step 2: Add ETH Gateway to Backend**

### **In Render Dashboard:**

1. **Go to:** https://dashboard.render.com/
2. **Click:** `advancia-backend` service
3. **Click:** "Environment" (left sidebar)
4. **Click:** "Add Environment Variable"

### **Add this new variable:**

**Key:**
```
ETH_PROVIDER_URL
```

**Value (Public Ethereum RPC - No API Key Required):**
```
https://ethereum.publicnode.com
```

### **Alternative Free Options (if primary has issues):**
```
https://eth.llamarpc.com
https://cloudflare-eth.com
https://rpc.ankr.com/eth
```

5. **Click:** "Save Changes"
6. **Wait:** 2-3 minutes for automatic redeploy

### **Expected Result:**
```
✅ Backend can connect to Ethereum blockchain
✅ Token/wallet features will work
✅ No API key required for public node
```

---

## 🎯 **Final Environment Variables:**

### **Frontend (modular-saas-frontend):**
```bash
# Core Config
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com  ← UPDATED!
NODE_ENV=production

# App Name
NEXT_PUBLIC_APP_NAME=Advancia Pay Ledger

# Stripe (Payment Processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SCrKDBRIxWx70ZdsfIT1MSMDyFYa0ke914P8qFm3knW16wmc7a4SLLx21I8dObEaGnx4IQcbTR5ZQoTnqNoZsIZ002l4i6QpB

# Botpress (Chatbot)
NEXT_PUBLIC_BOTPRESS_BOT_ID=77ea23f8-6bf2-4647-9d24-bcc0fdc3281d

# Web Push Notifications
NEXT_PUBLIC_VAPID_KEY=BLO1Omk_gOvP5kAG55P03sqh0poZ83S-saELgN4GDSTwMcWZ7xCsCIWQpY1vlLiqWSwNcZDLIk-txmLbPYjFww8
```

### **Backend (advancia-backend):**
```bash
# Core Config
NODE_ENV=production
BACKEND_URL=https://api.advanciapayledger.com
CORS_ORIGIN=https://advanciapayledger.com

# Security
JWT_SECRET=[your 48-character secret]

# Database
DATABASE_URL=postgresql://[your database URL]

# Ethereum Gateway
ETH_PROVIDER_URL=https://ethereum.publicnode.com  ← NEW!

# Twilio (SMS/OTP)
TWILIO_ACCOUNT_SID=AC437680f4bacdc2d19c0f5c6d3f43d7df
TWILIO_AUTH_TOKEN=ddf48b20cc428e610fa8f7debe5a6c2e
TWILIO_PHONE_NUMBER=+17174695102
TWILIO_VERIFY_SERVICE_SID=VAe6a39002df29f79be8bd961927028a47

# Twilio API Key
TWILIO_API_KEY_SID=SK295f3b2039dc66ae9381b3a30e93fda6
TWILIO_API_KEY_SECRET=7X5ZhHNmNUDwgTBtl7SOcJneDxJbhJ1F

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=[your Stripe secret key]
STRIPE_WEBHOOK_SECRET=[your webhook secret]
```

---

## 🧪 **Test After Updates:**

### **Test 1: Frontend → Backend Connection**
```powershell
# Open browser DevTools (F12)
# Go to: https://advanciapayledger.com
# Check Console for API calls
# Should see: https://api.advanciapayledger.com/api/...
```

### **Test 2: Backend Health Check**
```powershell
curl https://api.advanciapayledger.com/health
```
**Expected:** `{"status":"healthy","timestamp":"..."}`

### **Test 3: ETH Gateway Connection**
```powershell
curl https://api.advanciapayledger.com/api/eth/status
```
**Expected:** Information about Ethereum connection status

---

## 📸 **What You Should See in Render:**

### **Frontend Environment Variables:**
```
┌─────────────────────────────────────────────────────────┐
│ Environment Variables                                   │
├─────────────────────────────────────────────────────────┤
│ NEXT_PUBLIC_API_URL                                     │
│ https://api.advanciapayledger.com                       │
│                                                         │
│ NODE_ENV                                                │
│ production                                              │
│                                                         │
│ NEXT_PUBLIC_APP_NAME                                    │
│ Advancia Pay Ledger                                     │
└─────────────────────────────────────────────────────────┘
```

### **Backend Environment Variables:**
```
┌─────────────────────────────────────────────────────────┐
│ Environment Variables                                   │
├─────────────────────────────────────────────────────────┤
│ NODE_ENV                                                │
│ production                                              │
│                                                         │
│ JWT_SECRET                                              │
│ ••••••••••••••••••••••••••••••••••••••••••              │
│                                                         │
│ DATABASE_URL                                            │
│ postgresql://...                                        │
│                                                         │
│ CORS_ORIGIN                                             │
│ https://advanciapayledger.com                           │
│                                                         │
│ BACKEND_URL                                             │
│ https://api.advanciapayledger.com                       │
│                                                         │
│ ETH_PROVIDER_URL                                        │
│ https://ethereum.publicnode.com                         │
└─────────────────────────────────────────────────────────┘
```

---

## ⏱️ **Timeline:**

1. **Update frontend variable:** 30 seconds
2. **Frontend redeploy:** 3-5 minutes
3. **Add ETH gateway variable:** 30 seconds
4. **Backend redeploy:** 2-3 minutes
5. **Test connections:** 2 minutes

**Total Time:** ~10 minutes

---

## ⚠️ **Important Notes:**

### **About ETH Gateway:**

✅ **Free Public Node:** `https://ethereum.publicnode.com`
- No API key required
- Rate limits apply (should be fine for normal usage)
- Good for development and moderate production use

✅ **If You Need Higher Limits:**
Consider these providers:
- **Infura:** https://infura.io/ (3 requests/sec free tier)
- **Alchemy:** https://www.alchemy.com/ (generous free tier)
- **QuickNode:** https://www.quicknode.com/ (free trial)

### **Current ETH Gateway Features:**

Your backend is already configured to:
- ✅ Connect to Ethereum blockchain
- ✅ Query wallet balances
- ✅ Get transaction history
- ✅ Check token prices
- ✅ Validate wallet addresses

**Code Location:** `backend/src/config/index.ts` and ETH-related routes

---

## 🚀 **Quick Action Steps:**

### **Step-by-Step:**

1. **Open Render Dashboard:** https://dashboard.render.com/

2. **Update Frontend:**
   - Click: `modular-saas-frontend`
   - Environment → Edit `NEXT_PUBLIC_API_URL`
   - Change to: `https://api.advanciapayledger.com`
   - Save Changes
   - ⏱️ Wait 3-5 minutes

3. **Update Backend:**
   - Click: `advancia-backend`
   - Environment → Add Environment Variable
   - Key: `ETH_PROVIDER_URL`
   - Value: `https://ethereum.publicnode.com`
   - Save Changes
   - ⏱️ Wait 2-3 minutes

4. **Test:**
   ```powershell
   # Test backend health
   curl https://api.advanciapayledger.com/health
   
   # Open frontend
   start https://advanciapayledger.com
   
   # Check DevTools Console (F12)
   # Should see API calls to api.advanciapayledger.com
   ```

5. **Done!** ✅

---

## 📋 **Checklist:**

- [ ] Update `NEXT_PUBLIC_API_URL` in frontend
- [ ] Wait for frontend redeploy (3-5 min)
- [ ] Add `ETH_PROVIDER_URL` to backend
- [ ] Wait for backend redeploy (2-3 min)
- [ ] Test health endpoint
- [ ] Test frontend → backend connection
- [ ] Verify no CORS errors in DevTools
- [ ] Test wallet/ETH features (if implemented)

---

## 🎯 **Expected Outcome:**

After these updates:

```
✅ Frontend uses custom backend domain
✅ All API calls: https://api.advanciapayledger.com
✅ Ethereum gateway connected
✅ Wallet features ready to use
✅ No CORS errors
✅ Professional production setup complete
```

---

## 🔧 **Troubleshooting:**

### **Issue 1: CORS Error After Update**

**Symptom:** Console shows CORS error
**Solution:** Verify backend has:
```
CORS_ORIGIN=https://advanciapayledger.com
```
(No trailing slash!)

---

### **Issue 2: ETH Gateway Not Working**

**Test Connection:**
```bash
curl https://ethereum.publicnode.com -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Expected:** JSON response with block number

**If Fails:** Try alternative gateway:
```
ETH_PROVIDER_URL=https://eth.llamarpc.com
```

---

### **Issue 3: Frontend Still Using Old URL**

**Check:**
1. Environment variable saved in Render? ✅
2. Service redeployed? ✅
3. Browser cache cleared? (Ctrl+Shift+R)
4. Check Network tab in DevTools for actual URLs

---

## 📞 **Need Help?**

**Share with me:**
1. Screenshot of Render environment variables (both services)
2. Any error messages in Console (F12)
3. Result of health check: `curl https://api.advanciapayledger.com/health`

**I'll help you troubleshoot!** 🚀

---

## ✨ **You're Almost Done!**

After these two simple updates:
- ✅ Custom backend domain fully integrated
- ✅ Ethereum gateway connected
- ✅ Production environment 100% complete
- ✅ Ready to test full platform features

**Let's do this!** 💪
