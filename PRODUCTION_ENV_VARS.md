# 🔐 Production Environment Variables
## advanciapayledger.com

This file shows the environment variables needed for production deployment on Render.

---

## 📋 Backend Service Environment Variables

Copy these to your Render Backend Service → Environment tab:

```bash
# ========================================
# 🌐 URLs and Domains
# ========================================
FRONTEND_URL=https://advanciapayledger.com
BACKEND_URL=https://api.advanciapayledger.com
NODE_ENV=production
PORT=4000

# ========================================
# 🗄️ Database
# ========================================
# This will be automatically set by Render PostgreSQL
DATABASE_URL=<render-will-provide-this>

# ========================================
# 🔐 JWT Secrets
# ========================================
# Use the encrypted values from GitHub Secrets
JWT_SECRET_ENCRYPTED=<from-github-secrets>
JWT_ENCRYPTION_KEY=<from-github-secrets>
JWT_ENCRYPTION_IV=<from-github-secrets>
JWT_EXPIRATION=7d

# Alternative: Use Base64 encoded secret
# JWT_SECRET_BASE64=<base64-encoded-secret>

# Fallback: Plain secret (less secure, not recommended for production)
# JWT_SECRET=<your-secret-key-minimum-32-characters>

# ========================================
# 🔒 Session Secret
# ========================================
SESSION_SECRET=<generate-random-32-char-string>

# ========================================
# 📱 Twilio (SMS OTP)
# ========================================
TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone-number>

# ========================================
# 📧 Email Service (Optional)
# ========================================
# For SendGrid
SENDGRID_API_KEY=<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=noreply@advanciapayledger.com

# OR for Resend
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=noreply@advanciapayledger.com

# ========================================
# 💳 Stripe (Payment Processing)
# ========================================
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_PUBLIC_KEY=<your-stripe-public-key>

# ========================================
# 📊 Redis (Caching & Rate Limiting)
# ========================================
# This will be automatically set by Render Redis
REDIS_URL=<render-will-provide-this>

# ========================================
# 🤖 Botpress (Chatbot)
# ========================================
BOTPRESS_BOT_ID=<your-botpress-bot-id>
BOTPRESS_WEBHOOK_URL=https://chat.botpress.cloud/<bot-id>

# ========================================
# 📝 Logging & Monitoring
# ========================================
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# ========================================
# 🔧 Feature Flags
# ========================================
ENABLE_SMS_OTP=true
ENABLE_EMAIL_OTP=true
ENABLE_PAYMENTS=true
ENABLE_CHATBOT=true

# ========================================
# 🛡️ Security
# ========================================
# Rate limiting is handled in code, but you can override:
# RATE_LIMIT_WINDOW_MS=900000
# RATE_LIMIT_MAX_REQUESTS=100
# OTP_RATE_LIMIT_MAX=5

# CORS is configured in code to allow your domain
```

---

## 📋 Frontend Service Environment Variables

Copy these to your Render Frontend Service → Environment tab:

```bash
# ========================================
# 🌐 URLs
# ========================================
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
NEXT_PUBLIC_FRONTEND_URL=https://advanciapayledger.com
NODE_ENV=production

# ========================================
# 🔐 Public Keys
# ========================================
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=<your-stripe-public-key>

# ========================================
# 🤖 Botpress (Chatbot)
# ========================================
NEXT_PUBLIC_BOTPRESS_BOT_ID=<your-botpress-bot-id>
NEXT_PUBLIC_BOTPRESS_CLIENT_ID=<your-botpress-client-id>

# ========================================
# 📊 Analytics (Optional)
# ========================================
NEXT_PUBLIC_GA_TRACKING_ID=<google-analytics-id>
NEXT_PUBLIC_MIXPANEL_TOKEN=<mixpanel-token>

# ========================================
# 🔧 Build Configuration
# ========================================
# These are usually not needed but included for completeness
# NEXT_TELEMETRY_DISABLED=1
# ANALYZE=false
```

---

## 🚀 How to Set Environment Variables in Render

### Backend Service:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your Backend service**
3. **Click "Environment" tab** on the left sidebar
4. **Add each variable**:
   - Click "Add Environment Variable"
   - Enter Key and Value
   - Click "Save Changes"
5. **Service will automatically redeploy** with new variables

### Frontend Service:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your Frontend service**
3. **Click "Environment" tab** on the left sidebar
4. **Add each variable**:
   - Click "Add Environment Variable"
   - Enter Key and Value
   - Click "Save Changes"
5. **Service will automatically redeploy** with new variables

---

## 🔐 Secure Values to Generate

### JWT_SECRET (if not using encrypted)
```bash
# Generate secure random string (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### SESSION_SECRET
```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ✅ Validation Checklist

After setting environment variables:

### Backend:
- [ ] `FRONTEND_URL` = `https://advanciapayledger.com`
- [ ] `DATABASE_URL` is set (from Render PostgreSQL)
- [ ] `JWT_SECRET_*` or `JWT_SECRET` is set
- [ ] `SESSION_SECRET` is set
- [ ] `TWILIO_*` credentials set (if using SMS)
- [ ] `NODE_ENV` = `production`

### Frontend:
- [ ] `NEXT_PUBLIC_API_URL` = `https://api.advanciapayledger.com`
- [ ] `NEXT_PUBLIC_FRONTEND_URL` = `https://advanciapayledger.com`
- [ ] `NODE_ENV` = `production`

### Test After Deployment:
```bash
# Test backend health
curl https://api.advanciapayledger.com/health

# Should return:
# {"status":"ok","timestamp":"..."}

# Test CORS
curl -H "Origin: https://advanciapayledger.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.advanciapayledger.com/api/auth/login

# Should return CORS headers with status 204
```

---

## 🔍 Environment Variables Reference

### Critical (Must Have):
- ✅ `DATABASE_URL` - PostgreSQL connection
- ✅ `JWT_SECRET_*` or `JWT_SECRET` - Authentication
- ✅ `FRONTEND_URL` - CORS configuration
- ✅ `NEXT_PUBLIC_API_URL` - Frontend API calls

### Important (Recommended):
- ⚠️ `SESSION_SECRET` - Session security
- ⚠️ `TWILIO_*` - SMS OTP functionality
- ⚠️ `STRIPE_*` - Payment processing
- ⚠️ `REDIS_URL` - Caching and rate limiting

### Optional (Nice to Have):
- 📧 Email service credentials
- 🤖 Botpress configuration
- 📊 Analytics tokens
- 🔧 Feature flags

---

## 🐛 Common Issues

### Issue: CORS Errors After Deployment

**Solution**: Ensure `FRONTEND_URL` in backend matches your domain:
```bash
FRONTEND_URL=https://advanciapayledger.com
```

### Issue: "No JWT secret found"

**Solution**: Set at least one JWT secret method:
```bash
# Option 1: Encrypted (most secure)
JWT_SECRET_ENCRYPTED=<encrypted>
JWT_ENCRYPTION_KEY=<key>
JWT_ENCRYPTION_IV=<iv>

# Option 2: Base64 (secure)
JWT_SECRET_BASE64=<base64-string>

# Option 3: Plain (works but less secure)
JWT_SECRET=<minimum-32-characters>
```

### Issue: API Calls Return 404

**Solution**: Check `NEXT_PUBLIC_API_URL` in frontend:
```bash
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
```

### Issue: SMS OTP Not Working

**Solution**: Verify Twilio credentials and phone number format:
```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📝 Local Development vs Production

### Local (.env files):
```bash
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NODE_ENV=development
```

### Production (Render):
```bash
FRONTEND_URL=https://advanciapayledger.com
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
NODE_ENV=production
```

**Pro Tip**: Keep local values in `.env` files (gitignored), set production values directly in Render dashboard.

---

## 🎯 Next Steps

1. **Set Backend Variables** in Render (15 variables)
2. **Set Frontend Variables** in Render (5 variables)
3. **Wait for Redeploy** (3-5 minutes)
4. **Test Endpoints** (health check, CORS)
5. **Configure Custom Domains** (see CLOUDFLARE_DOMAIN_SETUP.md)
6. **Test Full Functionality** (login, API calls)

---

**Domain**: advanciapayledger.com  
**Last Updated**: October 18, 2025  
**Status**: Ready for Production Configuration 🚀
