# 🔑 API Keys Setup - Staging & Production

## Overview

API keys allow your frontend and third-party services to authenticate requests to your backend. You'll need separate keys for **Staging** and **Production** environments.

---

## 📋 Types of API Keys to Create

### 1. **Render API Token** (for CI/CD & Deployments)
- Authenticates you with Render's API
- Used for automated deployments
- Used for managing services via CLI

### 2. **Backend Service API Key** (for Client Authentication)
- Used by frontend to authenticate requests
- Used by external services
- Different keys for staging/production

### 3. **JWT Secret** (for Token Generation)
- Signs and verifies JWT tokens
- Must be different for staging/production
- Should be very secure and random

---

## ✅ Step 1: Create Render API Token

### Get Your Render API Token:

1. Go to: https://dashboard.render.com/account/api-tokens
2. Click **Create API Token**
3. **Name:** `Production Deployments`
4. **Scopes:** Select all (or at minimum: services, deploys)
5. Copy the token (you won't see it again!)
6. Save it securely

**Store it as an environment variable:**

```powershell
# Create .env file in workspace root
$env:RENDER_API_TOKEN = "your-token-here"
```

---

## ✅ Step 2: Backend Service API Keys

### For Staging Environment:

1. **Generate a random key:**
```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (Get-Random) + (Get-Random)))
```

2. **Add to backend/.env (staging):**
```env
STAGING_API_KEY=your-generated-key-here
STAGING_JWT_SECRET=your-random-jwt-secret-here
```

### For Production Environment:

1. **Generate another random key:**
```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (Get-Random) + (Get-Random)))
```

2. **Add to Render Environment Variables:**
   - Go to: https://dashboard.render.com (Backend Service)
   - **Settings** → **Environment**
   - Add:
     ```
     PRODUCTION_API_KEY=your-generated-key-here
     PRODUCTION_JWT_SECRET=your-random-jwt-secret-here
     ```

---

## ✅ Step 3: Update Backend to Use API Keys

### Modify `backend/src/routes/auth.ts`:

Add API key validation middleware:

```typescript
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Apply to protected routes
router.post('/login', validateApiKey, async (req, res) => {
  // ... existing code
});

router.post('/register', validateApiKey, async (req, res) => {
  // ... existing code
});
```

---

## ✅ Step 4: Update Frontend to Send API Key

### Modify `frontend/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
async authorize(credentials) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.NEXT_PUBLIC_API_KEY, // Add this
    },
    body: JSON.stringify({
      email: credentials?.email,
      password: credentials?.password,
    }),
  });
  
  const data = await response.json();
  if (data.token) {
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.firstName,
      accessToken: data.token,
    };
  }
  return null;
}
```

---

## 📊 Environment Setup Summary

### **Local Development** (`backend/.env`)
```env
NODE_ENV=development
DATABASE_URL=your-database-url
JWT_SECRET=your-local-jwt-secret
API_KEY=local-api-key-123
NEXT_PUBLIC_API_KEY=local-api-key-123
```

### **Staging** (Render Environment Variables)
```env
NODE_ENV=staging
DATABASE_URL=your-staging-db-url
JWT_SECRET=your-staging-jwt-secret
API_KEY=your-staging-api-key
NEXT_PUBLIC_API_KEY=your-staging-api-key
```

### **Production** (Render Environment Variables)
```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
JWT_SECRET=your-production-jwt-secret
API_KEY=your-production-api-key
NEXT_PUBLIC_API_KEY=your-production-api-key
```

---

## 🔒 Security Best Practices

✅ **DO:**
- Use strong random keys (32+ characters)
- Keep keys separate for each environment
- Rotate keys regularly
- Use HTTPS only
- Store in environment variables, never in code
- Add API key to .gitignore

❌ **DON'T:**
- Commit keys to GitHub
- Use same key for all environments
- Share keys publicly
- Use predictable keys
- Log full keys in error messages

---

## 🧪 Test Your API Keys

### Test Staging Backend:
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "your-staging-api-key"
}

Invoke-RestMethod -Uri "https://advancia-backend-staging.onrender.com/api/auth/login" `
  -Method Post `
  -Headers $headers `
  -Body (@{email="test@example.com"; password="Test123"} | ConvertTo-Json)
```

### Test Production Backend:
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "your-production-api-key"
}

Invoke-RestMethod -Uri "https://advancia-backend.onrender.com/api/auth/login" `
  -Method Post `
  -Headers $headers `
  -Body (@{email="test@example.com"; password="Test123"} | ConvertTo-Json)
```

---

## 📍 Quick Links

- **Render API Tokens:** https://dashboard.render.com/account/api-tokens
- **Backend Service Settings:** https://dashboard.render.com/services
- **Environment Variables:** Each service → Settings → Environment

---

## 🎯 Next Steps

1. ✅ Generate API keys (use the commands above)
2. ✅ Add to Render environment variables
3. ✅ Update backend auth middleware
4. ✅ Update frontend to send API key
5. ✅ Test endpoints with curl/Postman
6. ✅ Deploy to Render
7. ✅ Verify login works!

