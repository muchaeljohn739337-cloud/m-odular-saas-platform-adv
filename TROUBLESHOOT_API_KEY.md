# 🔍 TROUBLESHOOTING: API Key Still Being Rejected

## Current Status

✅ **Backend is healthy:** https://advancia-backend.onrender.com/health  
❌ **API key validation failing:** Environment variables may not be loaded yet

---

## 🔍 Why This Happens

**Most Common Reasons:**

### 1. **Environment Group Not Linked Properly**
- You created the group but didn't link it to the service
- Or you linked it but backend hasn't redeployed yet

### 2. **Deployment Still in Progress**
- Render is still deploying the new code
- Environment variables load during deployment

### 3. **Environment Variables Added Wrong**
- Values might have extra characters or spaces
- Key names might be incorrect

---

## ✅ HOW TO FIX

### **Step 1: Verify Environment Group is Linked**

1. Go to: https://dashboard.render.com
2. Click: **advancia-backend**
3. Click: **Settings** → **Environment**
4. Scroll down to **Environment Groups** section
5. Check: Is `advancia-production` listed there?
   - ✅ **YES:** Go to Step 2
   - ❌ **NO:** Click "Link Environment Group" → Select `advancia-production` → Click Link

---

### **Step 2: Check Individual Environment Variables**

Still in Backend → Settings → Environment, check if you see:

```
DATABASE_URL = postgresql://advancia_user:... (from advancia-production)
API_KEY = Q&ozq^zgqp7... (from advancia-production)
JWT_SECRET = rpAUlBoRZ... (from advancia-production)
NODE_ENV = production (from advancia-production)
```

**Do you see "(from advancia-production)" next to each variable?**
- ✅ **YES:** Environment Group is linked correctly
- ❌ **NO:** Variables aren't loading from the group

---

### **Step 3: Manual Deploy**

If the environment group is linked but API key still fails:

1. Go to: **advancia-backend** service
2. Click: **Manual Deploy** → **Deploy latest commit**
3. Wait 2-3 minutes for deployment
4. Try registration test again

---

## 🧪 ALTERNATIVE: Add Variables Directly

If Environment Group isn't working, add variables directly to the service:

1. Go to: **advancia-backend** → **Settings** → **Environment**
2. Click: **Add Environment Variable** (4 times)
3. Add each one **WITHOUT** the key name in the value:

**Variable 1:**
```
Key: DATABASE_URL
Value: postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a/advancia_prod
```

**Variable 2:**
```
Key: API_KEY
Value: Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg
```

**Variable 3:**
```
Key: JWT_SECRET
Value: rpAUlBoRZ56LY@zqPat9uLUZJwbY0cnSqd#^rKRX3uJA
```

**Variable 4:**
```
Key: NODE_ENV
Value: production
```

4. Click **Save Changes**
5. Wait for auto-redeploy (3 minutes)

---

## 📊 How to Know It's Working

Once environment variables are properly set, you'll see in Render logs:

```
API_KEY loaded: Q&ozq^zgqp7Re... (first 15 chars shown)
JWT_SECRET loaded: ******** (hidden)
DATABASE_URL loaded: postgresql://advancia_user...
```

---

## 🧪 Test After Fixing

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg"
}

$body = @{
    email = "test@example.com"
    password = "Test123456"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://advancia-backend.onrender.com/api/auth/register" `
  -Method Post `
  -Headers $headers `
  -Body $body
```

**Expected Success Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "email": "test@example.com",
    "firstName": "Test"
  }
}
```

---

## 🎯 Quick Checklist

- [ ] Environment Group created: `advancia-production`
- [ ] Environment Group has 4 variables (DATABASE_URL, API_KEY, JWT_SECRET, NODE_ENV)
- [ ] Environment Group linked to `advancia-backend` service
- [ ] Backend shows variables "(from advancia-production)"
- [ ] Backend deployed after linking (manual deploy if needed)
- [ ] Registration test returns success (not "Invalid API key")

---

**Next:** Check your Render dashboard and verify the environment group is properly linked, then let me know! 🚀
