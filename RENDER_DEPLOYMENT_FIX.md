# Render Deployment Configuration Fix

## Problem

Frontend deployment failing with error: `"cd": executable file not found in $PATH`

## Root Cause

Render is trying to execute a shell command with `cd` that isn't available in the container's minimal PATH.

## Solution

### Frontend Service Settings (Render Dashboard)

1. **Go to**: https://dashboard.render.com → Your Frontend Service → Settings

2. **Build & Deploy Section**:

   - **Docker Context**: `/` (root of repo)
   - **Dockerfile Path**: `frontend/Dockerfile`

3. **Start Command** - Choose ONE option:

   **Option A (Recommended)**: Leave it **BLANK**

   - This uses the CMD from Dockerfile: `["node", "server.js"]`

   **Option B**: Set explicitly to:

   ```
   node server.js
   ```

4. **Environment Variables** (under Environment tab):
   ```bash
   NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
   NEXT_PUBLIC_APP_NAME=Advancia PayLedger
   NEXT_PUBLIC_CURRENCY_LIST=USD,EUR,BTC,ETH,USDT,TRUMP,MEDBED
   NEXT_PUBLIC_FEATURE_FLAGS=notifications,bonus_tokens,debit_card,crypto_recovery
   NEXT_PUBLIC_VAPID_KEY=<your-vapid-public-key>
   NEXT_PUBLIC_API_KEY=<your-api-key>
   NEXT_PUBLIC_ADMIN_KEY=<your-admin-key>
   NEXT_PUBLIC_BOTPRESS_BOT_ID=<your-botpress-id>
   NODE_ENV=production
   ```

### Backend Service Settings (Render Dashboard)

1. **Go to**: https://dashboard.render.com → Your Backend Service → Settings

2. **Start Command**:

   ```
   node dist/index.js
   ```

   OR if you want to run Prisma migrations first:

   ```
   npx prisma migrate deploy && node dist/index.js
   ```

3. **Build Command**:

   ```
   cd backend && npm install && npm run build && npx prisma generate
   ```

4. **Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<your-postgres-connection-string>
   JWT_SECRET=<strong-random-secret>
   ADMIN_KEY=<strong-admin-key>
   DOCTOR_INVITE_CODE=<your-invite-code>
   JITSI_DOMAIN=meet.jit.si
   STRIPE_SECRET_KEY=<your-stripe-secret>
   STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
   TWILIO_ACCOUNT_SID=<your-twilio-sid>
   TWILIO_AUTH_TOKEN=<your-twilio-token>
   TWILIO_VERIFY_SERVICE_SID=<your-verify-service-sid>
   TWILIO_PHONE_NUMBER=<your-twilio-phone>
   VAPID_PUBLIC_KEY=<your-vapid-public>
   VAPID_PRIVATE_KEY=<your-vapid-private>
   EMAIL_USER=<your-email>
   EMAIL_PASSWORD=<your-email-password>
   ```

## Common Mistakes to Avoid

❌ **DON'T use shell commands in Start Command**:

- `cd frontend && node server.js`
- `sh -c "cd /app && node server.js"`
- `bash -c "node server.js"`

✅ **DO use direct executable**:

- `node server.js` (for frontend)
- `node dist/index.js` (for backend)

## Verification Steps

After updating settings:

1. **Trigger Manual Deploy**:

   - Click "Manual Deploy" → "Clear build cache & deploy"

2. **Check Build Logs**:

   - Should see: `Building with API URL: https://api.advanciapayledger.com`
   - Should see: `==> Uploading build...`
   - Should see: `==> Deploying...`
   - Should see: `==> Your service is live 🎉`

3. **Check Runtime Logs**:

   - Should see Next.js server starting
   - Should NOT see any "cd" errors

4. **Test Frontend**:

   ```bash
   curl https://your-frontend.onrender.com
   # Should return HTML, not error
   ```

5. **Test Backend**:
   ```bash
   curl https://api.advanciapayledger.com/api/health
   # Should return: {"status":"healthy","service":"advancia-backend"}
   ```

## Dockerfile Reference (Current Correct Configuration)

### Frontend Dockerfile (Already Correct ✅)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
# ... build steps ...

FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]  # ← This is what runs (no cd needed)
```

### Backend Build (via Render Build Command)

- Build command handles `cd backend`
- Start command just runs the built artifact
- No shell navigation in Start Command

## If Problem Persists

1. **Check Render Service Type**:

   - Frontend: Should be "Web Service" with Docker
   - Backend: Should be "Web Service" (Node.js or Docker)

2. **Verify Docker Context**:

   - Must be `/` (repo root), not `/frontend`
   - Dockerfile Path: `frontend/Dockerfile` (relative to root)

3. **Clear Build Cache**:

   - Settings → "Clear build cache & deploy"

4. **Check Service Logs** for specific errors:
   - Dashboard → Your Service → Logs tab
   - Look for startup errors after "Deploying..."

## Quick Fix Checklist

- [ ] Frontend Start Command is blank OR `node server.js`
- [ ] Backend Start Command is `node dist/index.js`
- [ ] Docker Context is `/` (root)
- [ ] Dockerfile Path is `frontend/Dockerfile`
- [ ] All NEXT*PUBLIC*\* env vars set in Render
- [ ] Manual deploy triggered with clear cache
- [ ] Logs show successful deployment
- [ ] Health endpoints return 200 OK

## Support

If still failing after these changes:

1. Copy the **full error message** from Render logs
2. Check if it's a build error (during npm install/build) or runtime error (after "Deploying")
3. Verify all environment variables are set correctly
4. Ensure DATABASE_URL is accessible from Render's region
