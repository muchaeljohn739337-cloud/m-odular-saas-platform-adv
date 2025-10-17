# 🔐 Your Generated API Keys - KEEP SECURE!

## 🚨 IMPORTANT: Store These Securely!

These keys were just generated. Store them in:
1. **Render Dashboard** (Environment Variables)
2. **Your local .env file** (for testing)
3. **NOT in GitHub!**

---

## ✅ Your Keys

### **STAGING ENVIRONMENT**
```
STAGING_API_KEY=kTXHa%8HNc*dcQj^QIuNmGdcrzxvjHf0UGyLl7u!mYkc
STAGING_JWT_SECRET=eT3WIyu6zWvN9hOYV%9QV7KDc83j$*s*ohJrkE1lLGk7
```

### **PRODUCTION ENVIRONMENT**
```
PRODUCTION_API_KEY=Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg
PRODUCTION_JWT_SECRET=rpAUlBoRZ56LY@zqPat9uLUZJwbY0cnSqd#^rKRX3uJA
```

---

## ✅ Step-by-Step Setup

### Step 1: Add to Render (Backend Service)

1. Go to: https://dashboard.render.com
2. Select: **advancia-backend** service
3. Go to: **Settings** → **Environment**
4. Add these variables:

```
STAGING_API_KEY=kTXHa%8HNc*dcQj^QIuNmGdcrzxvjHf0UGyLl7u!mYkc
STAGING_JWT_SECRET=eT3WIyu6zWvN9hOYV%9QV7KDc83j$*s*ohJrkE1lLGk7
PRODUCTION_API_KEY=Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg
PRODUCTION_JWT_SECRET=rpAUlBoRZ56LY@zqPat9uLUZJwbY0cnSqd#^rKRX3uJA
API_KEY=${PRODUCTION_API_KEY}
JWT_SECRET=${PRODUCTION_JWT_SECRET}
```

5. Click **Save**

### Step 2: Add to Render (Frontend Service)

1. Go to: https://dashboard.render.com
2. Select: **advancia-frontend** service
3. Go to: **Settings** → **Environment**
4. Add:

```
NEXT_PUBLIC_API_KEY=Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg
```

5. Click **Save**

### Step 3: Create Local .env File

Create `backend/.env`:

```env
NODE_ENV=development
DATABASE_URL=your-local-database-url
JWT_SECRET=eT3WIyu6zWvN9hOYV%9QV7KDc83j$*s*ohJrkE1lLGk7
API_KEY=kTXHa%8HNc*dcQj^QIuNmGdcrzxvjHf0UGyLl7u!mYkc
```

### Step 4: Create Local .env.local for Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_KEY=kTXHa%8HNc*dcQj^QIuNmGdcrzxvjHf0UGyLl7u!mYkc
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🛡️ Verify .gitignore Entries

Make sure your `.gitignore` includes:

```
# Environment variables
.env
.env.local
.env.*.local
.env*.local

# Sensitive files
*.key
*.pem
```

---

## 🧪 Test Your Setup

### Test Backend with API Key:

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "kTXHa%8HNc*dcQj^QIuNmGdcrzxvjHf0UGyLl7u!mYkc"
}

$body = @{
    email = "test@example.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
  -Method Post `
  -Headers $headers `
  -Body $body
```

Expected response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "Test"
  }
}
```

### Test Without API Key (Should Fail):

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
  -Method Post `
  -Body (@{email="test@example.com"; password="Test123456"} | ConvertTo-Json) `
  -ContentType "application/json"
```

Expected: **401 Unauthorized - Invalid API key**

---

## 📋 Checklist

- [ ] Keys generated ✅
- [ ] Added to Render Backend Environment
- [ ] Added to Render Frontend Environment  
- [ ] Created local .env files
- [ ] Verified .gitignore
- [ ] Tested backend with API key
- [ ] Tested that requests fail without key
- [ ] Deployed to Render
- [ ] Verified production login works

---

## 🔄 If You Need New Keys

Run this command anytime:

```powershell
c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\Generate-APIKeys.ps1
```

Then update Render and your .env files.

---

## ⚠️ Security Reminders

✅ **DO:**
- Rotate keys every 90 days
- Use different keys per environment
- Keep .env files locally only
- Add .env to .gitignore
- Use HTTPS in production

❌ **DON'T:**
- Commit .env files to GitHub
- Share keys in emails/chat
- Use same key for all environments
- Store keys in plain text in code
- Log full keys in error messages

