# 🔍 BACKEND RUNNING BUT REGISTRATION FAILING

## Status

✅ Backend is LIVE at https://advancia-backend.onrender.com  
✅ Health check working: `/health` returns `{"status":"healthy"}`  
❌ Registration failing with: "Failed to register user"

---

## Most Likely Cause

**DATABASE_URL environment variable not properly set in Render**

The backend is running but can't connect to the database, so Prisma calls are failing.

---

## Quick Check - Environment Variables in Render

1. Go to: https://dashboard.render.com
2. Click: **advancia-backend** service
3. Click: **Settings** → **Environment**
4. Check if you see:
   - ✅ DATABASE_URL = `postgresql://advancia_user:...`
   - ✅ API_KEY = `Q&ozq^zgqp7Re...`
   - ✅ JWT_SECRET = `rpAUlBoRZ...`
   - ✅ NODE_ENV = `production`

**If ANY are missing:**
- Click **Add Environment Variable**
- Add the missing ones
- Click **Save Changes**
- Click **Manual Deploy** → **Deploy latest commit**

---

## Expected Values

```
DATABASE_URL = postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a/advancia_prod

API_KEY = Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg

JWT_SECRET = rpAUlBoRZ56LY@zqPat9uLUZJwbY0cnSqd#^rKRX3uJA

NODE_ENV = production
```

---

## If Variables Are Set Correctly

**Then the issue is database connectivity:**

1. Go to https://dashboard.render.com
2. Click **advancia-backend** 
3. Scroll to **Logs**
4. Look for errors containing:
   - "connection"
   - "ECONNREFUSED"
   - "ETIMEDOUT"
   - "ssl certificate"

**If you see connection errors:**
- Database might be in different region
- Database might have changed credentials
- Network rules might be blocking access

---

## Quick Fix Options

### Option 1: Redeploy with Fresh Build
1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait 3 minutes
3. Test again

### Option 2: Restart Service
1. Click **advancia-backend**
2. Click **Restart service** (top right)
3. Wait 1 minute
4. Test again

### Option 3: Check Database Connection
1. Verify DATABASE_URL is correct
2. Verify database is running on Render
3. Try connecting locally with the same URL

---

## Test Registration Again

Once env vars are confirmed/fixed:

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

**Expected Success:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "test@example.com"
  }
}
```

---

## What To Do NOW

1. **Check Render Backend → Settings → Environment**
2. **Verify all 4 variables are present**
3. **If any missing, add them**
4. **If all present, click Manual Deploy**
5. **Let me know what you find!**

---

**Go check the environment variables in Render now!** 🚀
