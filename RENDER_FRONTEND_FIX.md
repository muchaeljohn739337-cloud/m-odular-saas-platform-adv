# Render Frontend Configuration Fix

## Problem

Frontend deployment failing with error:

```
npm error command failed
npm error command sh -c node server.js
```

## Root Cause

The Render dashboard service was configured incorrectly:

- Service type: Should be **Web Service** (not Static Site)
- Start Command: Was looking for `server.js` which was deleted

## Solution

### 1. Verify Render Dashboard Settings

Go to your frontend service in Render dashboard and ensure:

**Build & Deploy:**

- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `frontend`

**Environment Variables (Required):**

```
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
NEXTAUTH_URL=https://advanciapayledger.com
NEXTAUTH_SECRET=(your secret)
NEXT_PUBLIC_API_KEY=(your key)
NEXT_PUBLIC_VAPID_KEY=(your key)
```

### 2. Files Updated

✅ **render.yaml** - Updated to web service configuration
✅ **frontend/package.json** - Already has `"start": "next start"`
✅ **frontend/next.config.js** - Already has `output: 'standalone'`

### 3. Deploy

After committing these changes:

1. Push to GitHub: `git push origin main`
2. Render will auto-deploy with correct configuration
3. If still failing, go to Render dashboard → Settings → Build & Deploy
4. Manually update Start Command to: `npm start`
5. Click "Manual Deploy" → "Clear build cache & deploy"

## Verification

Once deployed successfully, verify:

- Frontend accessible at: https://advanciapayledger.com
- Health check: Should return 200 OK
- Login page: Input fields visible, can type
- Favicon: Displayed in browser tab

## Technical Details

**Next.js Standalone Mode:**

- `next build` creates `.next/standalone/server.js`
- `next start` runs the optimized production server
- Uses minimal Node.js footprint
- Better for Render's free tier resources

**Previous Issue:**

- Old setup tried to run `node server.js` directly
- `server.js` was deleted during cleanup
- `npm start` properly invokes Next.js built-in server
