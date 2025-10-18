# 🔧 Render Environment Variables Setup Script

<#
.SYNOPSIS
    Generates environment variable configuration for Render deployment

.DESCRIPTION
    This script creates a complete list of environment variables needed for
    Render backend and frontend services for advanciapayledger.com

.NOTES
    Domain: advanciapayledger.com
    Date: October 18, 2025
#>

Write-Host "🚀 Render Environment Variables Setup" -ForegroundColor Cyan
Write-Host "Domain: advanciapayledger.com" -ForegroundColor Yellow
Write-Host ""

# ============================================
# BACKEND ENVIRONMENT VARIABLES
# ============================================

Write-Host "📦 BACKEND SERVICE ENVIRONMENT VARIABLES" -ForegroundColor Green
Write-Host "Copy these to Render Backend Service → Environment tab:" -ForegroundColor Yellow
Write-Host ""

$backendVars = @"
# ========================================
# 🌐 URLs and Domains
# ========================================
FRONTEND_URL=https://advanciapayledger.com
BACKEND_URL=https://api.advanciapayledger.com
NODE_ENV=production
PORT=4000

# ========================================
# 🗄️ Database (Render will provide this)
# ========================================
# DATABASE_URL will be automatically set by Render PostgreSQL

# ========================================
# 🔐 JWT Secrets (from GitHub Secrets)
# ========================================
# Get these from your GitHub repository secrets
# JWT_SECRET_ENCRYPTED=<from-github-secrets>
# JWT_ENCRYPTION_KEY=<from-github-secrets>
# JWT_ENCRYPTION_IV=<from-github-secrets>

# Alternative: Use Base64 encoded secret
# JWT_SECRET_BASE64=<base64-encoded-secret>

# Or use plain secret (generate with script below)
# JWT_SECRET=<your-secret-key-minimum-32-characters>

JWT_EXPIRATION=7d

# ========================================
# 🔒 Session Secret
# ========================================
# SESSION_SECRET=<generate-random-32-char-string>

# ========================================
# 📱 Twilio (SMS OTP)
# ========================================
# TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
# TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
# TWILIO_PHONE_NUMBER=<your-twilio-phone-number>

# ========================================
# 📧 Email Service (Optional)
# ========================================
# SendGrid
# SENDGRID_API_KEY=<your-sendgrid-api-key>
# SENDGRID_FROM_EMAIL=noreply@advanciapayledger.com

# Resend
# RESEND_API_KEY=<your-resend-api-key>
# RESEND_FROM_EMAIL=noreply@advanciapayledger.com

# ========================================
# 💳 Stripe (Payment Processing)
# ========================================
# STRIPE_SECRET_KEY=<your-stripe-secret-key>
# STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

# ========================================
# 📊 Redis (Optional - Render will provide)
# ========================================
# REDIS_URL will be automatically set if you add Redis

# ========================================
# 🤖 Botpress (Chatbot)
# ========================================
# BOTPRESS_BOT_ID=<your-botpress-bot-id>
# BOTPRESS_WEBHOOK_URL=https://chat.botpress.cloud/<bot-id>

# ========================================
# 🔧 Feature Flags
# ========================================
ENABLE_SMS_OTP=true
ENABLE_EMAIL_OTP=true
ENABLE_PAYMENTS=false
ENABLE_CHATBOT=true
"@

Write-Host $backendVars
Write-Host ""

# ============================================
# FRONTEND ENVIRONMENT VARIABLES
# ============================================

Write-Host "📦 FRONTEND SERVICE ENVIRONMENT VARIABLES" -ForegroundColor Green
Write-Host "Copy these to Render Frontend Service → Environment tab:" -ForegroundColor Yellow
Write-Host ""

$frontendVars = @"
# ========================================
# 🌐 URLs
# ========================================
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
NEXT_PUBLIC_FRONTEND_URL=https://advanciapayledger.com
NODE_ENV=production

# ========================================
# 🔐 Public Keys
# ========================================
# NEXT_PUBLIC_STRIPE_PUBLIC_KEY=<your-stripe-public-key>

# ========================================
# 🤖 Botpress (Chatbot)
# ========================================
# NEXT_PUBLIC_BOTPRESS_BOT_ID=<your-botpress-bot-id>
# NEXT_PUBLIC_BOTPRESS_CLIENT_ID=<your-botpress-client-id>
"@

Write-Host $frontendVars
Write-Host ""

# ============================================
# GENERATE SECURE SECRETS
# ============================================

Write-Host "🔐 GENERATE SECURE SECRETS" -ForegroundColor Green
Write-Host ""

Write-Host "Generating JWT_SECRET..." -ForegroundColor Yellow
$jwtSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor Cyan
Write-Host ""

Write-Host "Generating SESSION_SECRET..." -ForegroundColor Yellow
$sessionSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host "SESSION_SECRET=$sessionSecret" -ForegroundColor Cyan
Write-Host ""

# ============================================
# SAVE TO FILE
# ============================================

Write-Host "💾 Saving to files..." -ForegroundColor Green

$backendVars | Out-File "render-backend-env.txt" -Encoding UTF8
Write-Host "✅ Backend vars saved to: render-backend-env.txt" -ForegroundColor Green

$frontendVars | Out-File "render-frontend-env.txt" -Encoding UTF8
Write-Host "✅ Frontend vars saved to: render-frontend-env.txt" -ForegroundColor Green

# Save secrets separately
$secrets = @"
# Generated Secrets - $(Get-Date)
JWT_SECRET=$jwtSecret
SESSION_SECRET=$sessionSecret
"@
$secrets | Out-File "render-secrets.txt" -Encoding UTF8
Write-Host "✅ Secrets saved to: render-secrets.txt" -ForegroundColor Green
Write-Host ""

# ============================================
# NEXT STEPS
# ============================================

Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to Render Dashboard: https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Select your Backend service" -ForegroundColor White
Write-Host "3. Go to Environment tab" -ForegroundColor White
Write-Host "4. Copy variables from render-backend-env.txt" -ForegroundColor White
Write-Host "5. Add JWT_SECRET and SESSION_SECRET from render-secrets.txt" -ForegroundColor White
Write-Host "6. Repeat for Frontend service with render-frontend-env.txt" -ForegroundColor White
Write-Host "7. Save changes (services will redeploy automatically)" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  IMPORTANT: Keep render-secrets.txt secure and delete after use!" -ForegroundColor Red
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
