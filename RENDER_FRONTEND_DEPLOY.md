# Deploy Next.js Frontend to Render + Cloudflare

## 🎯 Goal

Deploy your Next.js frontend to Render.com and configure Cloudflare to serve both frontend and backend through your custom domain.

---

## Architecture Overview

```
Internet Traffic
    ↓
Cloudflare CDN (advancia.app)
    ↓
    ├── https://advancia.app → Frontend (Render)
    ├── https://www.advancia.app → Frontend (Render)
    ├── https://admin.advancia.app → Frontend (Render)
    └── https://api.advancia.app → Backend (Render) via Worker
```

---

## Part 1: Deploy Frontend to Render (15 min)

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Connect your GitHub account
4. Authorize Render to access repositories

### Step 2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your repository: `pdtribe181-prog/-modular-saas-platform`
3. Configure the service:

```yaml
Name: advancia-frontend
Region: Oregon (US West) or closest to your users
Branch: main
Root Directory: frontend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 3: Configure Environment Variables

Add these in Render dashboard under **Environment**:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.advancia.app

# Node Environment
NODE_ENV=production

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS=your-ga-id
```

### Step 4: Advanced Settings

```yaml
Instance Type: Free (or Starter for production)
Auto-Deploy: Yes
Health Check Path: /
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build
3. Copy the Render URL: `https://advancia-frontend.onrender.com`

**Test the deployment:**

```bash
curl -I https://advancia-frontend.onrender.com
# Should return 200 OK
```

---

## Part 2: Update Backend CORS (5 min)

Your backend needs to allow requests from the new frontend domain.

### Edit `backend/.env`

Add your Render frontend URL:

```bash
# CORS Configuration
ALLOWED_ORIGINS=https://advancia-frontend.onrender.com,https://advancia.app,https://www.advancia.app,https://admin.advancia.app,http://localhost:3000,http://localhost:4000

# Or if already exists, append to the list
```

### Edit `backend/src/config/index.ts`

Find the `allowedOrigins` section and update:

```typescript
export const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:3000",
      "http://localhost:4000",
      "https://advancia-frontend.onrender.com",
      "https://advancia.app",
      "https://www.advancia.app",
      "https://admin.advancia.app",
    ];
```

### Redeploy Backend

In Render dashboard for your backend:

1. Go to **Environment** tab
2. Add `ALLOWED_ORIGINS` variable
3. Click **"Save Changes"**
4. Backend will auto-redeploy (or click "Manual Deploy")

---

## Part 3: Configure Cloudflare DNS (10 min)

### Step 1: Add DNS Records

Go to Cloudflare Dashboard → Your domain → DNS → Records

Add these A/CNAME records:

#### Option A: Using Render's IP (Recommended)

Get Render's IP address:

```bash
nslookup advancia-frontend.onrender.com
# Note the IP address (e.g., 216.24.57.1)
```

Create DNS records:

| Type  | Name  | Content                       | Proxy      | TTL  |
| ----- | ----- | ----------------------------- | ---------- | ---- |
| A     | @     | 216.24.57.1                   | ✅ Proxied | Auto |
| CNAME | www   | advancia.app                  | ✅ Proxied | Auto |
| CNAME | admin | advancia.app                  | ✅ Proxied | Auto |
| CNAME | api   | advancia-backend.onrender.com | ✅ Proxied | Auto |

#### Option B: Using CNAME to Render (Alternative)

| Type  | Name  | Content                        | Proxy      | TTL  |
| ----- | ----- | ------------------------------ | ---------- | ---- |
| CNAME | @     | advancia-frontend.onrender.com | ✅ Proxied | Auto |
| CNAME | www   | advancia.app                   | ✅ Proxied | Auto |
| CNAME | admin | advancia.app                   | ✅ Proxied | Auto |
| CNAME | api   | advancia-backend.onrender.com  | ✅ Proxied | Auto |

**Note:** Some DNS providers don't allow CNAME at root (@). If you get an error, use Option A.

### Step 2: Verify DNS Propagation

```bash
# Check root domain
nslookup advancia.app

# Check API subdomain
nslookup api.advancia.app

# Online checker
# Visit: https://dnschecker.org/#A/advancia.app
```

---

## Part 4: Configure Render Custom Domain (5 min)

### For Frontend Service

1. Go to Render dashboard → advancia-frontend service
2. Click **Settings** → **Custom Domains**
3. Click **"Add Custom Domain"**
4. Add these domains:
   - `advancia.app`
   - `www.advancia.app`
   - `admin.advancia.app`
5. Render will verify DNS and issue SSL certificates (5-10 min)

### For Backend Service

1. Go to Render dashboard → advancia-backend service
2. Click **Settings** → **Custom Domains**
3. Click **"Add Custom Domain"**
4. Add: `api.advancia.app`
5. Wait for SSL certificate

**Verification:**

```bash
# Test SSL certificates
curl -I https://advancia.app
curl -I https://api.advancia.app
# Should return 200 OK with valid SSL
```

---

## Part 5: Configure Cloudflare SSL/TLS (3 min)

### SSL/TLS Settings

Go to Cloudflare Dashboard → SSL/TLS

1. **SSL/TLS encryption mode:**

   - Select **"Full (strict)"**
   - This ensures end-to-end encryption

2. **Edge Certificates:**

   - Enable **"Always Use HTTPS"** → ON
   - Enable **"Automatic HTTPS Rewrites"** → ON
   - Minimum TLS Version → **TLS 1.2**

3. **HSTS (HTTP Strict Transport Security):**
   - Enable HSTS
   - Max Age: 6 months (15768000 seconds)
   - Include subdomains: Yes
   - Preload: Yes

---

## Part 6: Update Cloudflare Worker (Optional, 5 min)

If you deployed the API gateway Worker, update it:

### Edit `.infrastructure/cloudflare/workers/api-gateway.js`

```javascript
const CONFIG = {
  BACKEND_ORIGIN: "https://advancia-backend.onrender.com", // ← Your actual backend
  ALLOWED_ORIGINS: [
    "https://advancia.app",
    "https://www.advancia.app",
    "https://admin.advancia.app",
    "https://advancia-frontend.onrender.com", // ← Add Render URL
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60,
};
```

### Redeploy Worker

Via dashboard:

1. Go to Workers & Pages → advancia-api-gateway
2. Click **"Edit code"**
3. Paste updated code
4. Click **"Save and deploy"**

Via CLI:

```bash
cd .infrastructure/cloudflare/workers
wrangler deploy api-gateway.js --name advancia-api-gateway
```

---

## Part 7: Configure Page Rules (Optional, 5 min)

Optimize caching for your frontend:

Go to Cloudflare Dashboard → Rules → Page Rules

### Rule 1: Cache Static Assets

```
URL: advancia.app/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 month
```

### Rule 2: Bypass API Cache

```
URL: api.advancia.app/*
Settings:
  - Cache Level: Bypass
  - Disable Performance
```

### Rule 3: Cache HTML Pages

```
URL: advancia.app/*
Settings:
  - Cache Level: Standard
  - Edge Cache TTL: 2 hours
  - Browser Cache TTL: 4 hours
```

---

## Part 8: Update Frontend Environment Variables (3 min)

### In Render Dashboard

Go to advancia-frontend → Environment

Update or add:

```bash
NEXT_PUBLIC_API_URL=https://api.advancia.app
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://advancia.app
```

### Redeploy Frontend

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait 5 minutes for build
3. Test deployment

---

## Part 9: Testing & Verification (10 min)

### Frontend Tests

```bash
# Root domain
curl -I https://advancia.app
# Should return 200 OK with Cloudflare headers

# WWW subdomain
curl -I https://www.advancia.app
# Should return 200 OK

# Admin subdomain
curl -I https://admin.advancia.app
# Should return 200 OK

# Test HTTPS redirect
curl -I http://advancia.app
# Should return 301 or 308 redirect to https://
```

### Backend API Tests

```bash
# Health check
curl https://api.advancia.app/api/health
# Should return: {"status":"ok"}

# Test CORS
curl -X OPTIONS https://api.advancia.app/api/health \
  -H "Origin: https://advancia.app" \
  -H "Access-Control-Request-Method: GET" \
  -v
# Should include Access-Control-Allow-Origin header
```

### Browser Tests

1. Open https://advancia.app
   - [ ] Page loads correctly
   - [ ] No console errors
   - [ ] Assets loading from \_next/static
2. Open https://www.advancia.app
   - [ ] Should work or redirect to advancia.app
3. Test login flow

   - [ ] Can log in successfully
   - [ ] JWT token stored in localStorage
   - [ ] API calls to https://api.advancia.app work

4. Test registration
   - [ ] Doctor registration form works
   - [ ] API calls succeed
   - [ ] Email verification works

### Security Headers Check

```bash
curl -I https://advancia.app | grep -i "x-"
```

Should include:

```
x-frame-options: DENY
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
```

### Performance Tests

1. **PageSpeed Insights:** https://pagespeed.web.dev/

   - Enter: https://advancia.app
   - Should score 90+ on performance

2. **SSL Labs:** https://www.ssllabs.com/ssltest/

   - Enter: advancia.app
   - Should score A or A+

3. **Security Headers:** https://securityheaders.com/
   - Enter: https://advancia.app
   - Should score B+ or higher

---

## Part 10: Production Checklist

### Before Going Live

- [ ] Frontend deployed to Render successfully
- [ ] Backend CORS includes all frontend domains
- [ ] DNS records created and propagated
- [ ] SSL certificates issued for all domains
- [ ] Cloudflare SSL mode set to "Full (strict)"
- [ ] HTTPS redirect enabled
- [ ] Custom domains verified in Render
- [ ] Environment variables updated in both services
- [ ] Worker deployed and routing correctly
- [ ] Page rules configured for caching
- [ ] All endpoints return 200 OK
- [ ] CORS working from frontend to backend
- [ ] Login/registration flows tested
- [ ] Security headers present
- [ ] Performance optimizations enabled

### Post-Launch Monitoring

**Day 1:**

- [ ] Monitor Render logs for errors
- [ ] Check Cloudflare Analytics for traffic
- [ ] Review Security Events for blocks
- [ ] Test all critical user flows

**Week 1:**

- [ ] Review performance metrics
- [ ] Check error rates in logs
- [ ] Optimize cache hit ratio
- [ ] Review WAF rules effectiveness

**Month 1:**

- [ ] Analyze user behavior in Analytics
- [ ] Review bandwidth usage
- [ ] Optimize expensive API calls
- [ ] Consider upgrading Render plan if needed

---

## Troubleshooting

### Issue: Frontend shows 502 Bad Gateway

**Cause:** Render service is down or restarting

**Fix:**

1. Check Render dashboard for service status
2. View logs: Render dashboard → Logs
3. Restart service: Render dashboard → Manual Deploy
4. Check build logs for errors

### Issue: API calls fail with CORS error

**Cause:** Backend CORS not configured for frontend domain

**Fix:**

1. Add frontend domain to backend ALLOWED_ORIGINS
2. Redeploy backend
3. Clear browser cache
4. Test with curl to verify CORS headers

### Issue: SSL certificate not issued

**Cause:** DNS not propagated or misconfigured

**Fix:**

1. Verify DNS with: `nslookup advancia.app`
2. Wait 30-60 minutes for propagation
3. Check Cloudflare DNS settings are "Proxied"
4. Verify Render custom domain status

### Issue: Slow page loads

**Cause:** Assets not cached, large bundle size

**Fix:**

1. Enable Cloudflare page rules for static assets
2. Check Next.js bundle size: `npm run build` and review output
3. Enable Brotli compression in Cloudflare
4. Use Next.js Image optimization
5. Consider upgrading Render instance type

### Issue: Random 503 errors

**Cause:** Free Render instances spin down after inactivity

**Fix:**

1. Upgrade to Starter plan ($7/month) for always-on
2. Or implement a health check ping every 10 minutes:

```javascript
// In a separate service or GitHub Action
setInterval(() => {
  fetch("https://advancia.app");
}, 10 * 60 * 1000); // Every 10 minutes
```

### Issue: Environment variables not updating

**Cause:** Render cache or Next.js build cache

**Fix:**

1. In Render dashboard, click "Manual Deploy" → "Clear build cache & deploy"
2. Verify variables in Render dashboard → Environment
3. Check build logs for env var output

---

## Cost Breakdown

### Free Tier (Development)

```
Cloudflare Free: $0/month
  - Unlimited bandwidth
  - Basic DDoS protection
  - SSL certificates
  - Basic WAF rules

Render Free: $0/month
  - 750 hours/month
  - Spins down after 15 min inactivity
  - 512MB RAM
  - Shared CPU

Total: $0/month
```

### Production Tier (Recommended)

```
Cloudflare Pro: $20/month
  - Advanced DDoS
  - Enhanced WAF
  - Image optimization
  - Web Analytics

Render Starter: $7/month (per service)
  - Always on
  - 1GB RAM
  - Shared CPU
  - Custom domain

Total: $34/month ($20 + $7 + $7 for backend+frontend)
```

### Enterprise Tier

```
Cloudflare Business: $200/month
Render Standard: $25/month (per service)

Total: $250/month
```

---

## Performance Optimization Tips

### 1. Enable Next.js Image Optimization

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ["advancia.app", "api.advancia.app"],
    formats: ["image/avif", "image/webp"],
  },
};
```

### 2. Use Cloudflare Image Resizing (Pro plan)

```javascript
// Resize images on-the-fly
<img src="https://advancia.app/cdn-cgi/image/width=800,format=auto/image.jpg" />
```

### 3. Implement Service Worker for Offline Support

```javascript
// public/sw.js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 4. Enable Cloudflare Argo Smart Routing (Paid)

- Reduces latency by 30%
- $5/month + $0.10/GB

### 5. Use Next.js Middleware for Edge Functions

```javascript
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request) {
  // Redirect logic, auth checks, etc.
  return NextResponse.next();
}
```

---

## Monitoring & Alerts

### Cloudflare Web Analytics

Add to your frontend `layout.tsx`:

```javascript
<Script
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "your-token-here"}'
  strategy="afterInteractive"
/>
```

### Render Metrics

1. Go to Render dashboard → advancia-frontend
2. Click **"Metrics"** tab
3. Monitor:
   - CPU usage
   - Memory usage
   - Request rate
   - Response times

### Set Up Uptime Monitoring

Use free services:

- **UptimeRobot:** https://uptimerobot.com
- **StatusCake:** https://www.statuscake.com
- **Pingdom:** https://www.pingdom.com

Monitor these URLs:

- https://advancia.app
- https://api.advancia.app/api/health

---

## Next Steps

1. **Deploy Frontend to Render** (Part 1)
2. **Update Backend CORS** (Part 2)
3. **Configure Cloudflare DNS** (Part 3)
4. **Add Custom Domains in Render** (Part 4)
5. **Test Everything** (Part 9)
6. **Monitor for 24 hours** (Part 10)

**Estimated Total Time:** 45-60 minutes

**Need help?** Check:

- [Render Documentation](https://render.com/docs)
- [Cloudflare Docs](https://developers.cloudflare.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## Quick Commands Reference

```bash
# Check DNS
nslookup advancia.app
dig advancia.app

# Test SSL
curl -I https://advancia.app
openssl s_client -connect advancia.app:443

# Test CORS
curl -X OPTIONS https://api.advancia.app/api/health \
  -H "Origin: https://advancia.app" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Check Cloudflare cache
curl -I https://advancia.app | grep -i "cf-"

# Force purge Cloudflare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Check Render service status
curl https://api.render.com/v1/services/{service_id} \
  -H "Authorization: Bearer {api_key}"
```

---

## 🎉 Deployment Complete!

Your Advancia Pay Ledger is now:

- ✅ Frontend deployed on Render
- ✅ Backend deployed on Render
- ✅ Both protected by Cloudflare CDN
- ✅ SSL/TLS encrypted
- ✅ Custom domain configured
- ✅ CORS configured correctly
- ✅ Performance optimized
- ✅ Ready for production traffic!

**Your URLs:**

- Frontend: https://advancia.app
- Admin: https://admin.advancia.app
- API: https://api.advancia.app

**Share with your team and start onboarding users!** 🚀
