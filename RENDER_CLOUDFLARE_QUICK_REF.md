# Frontend to Render + Cloudflare - Quick Reference

## 🚀 5-Minute Quick Start

### Option 1: Automated Script (Easiest)

```powershell
# Run the deployment script
.\scripts\deploy-frontend-render.ps1 -Action all -Domain advancia.app

# Follow the prompts:
# 1. Enter Render API key
# 2. Enter service ID (or leave empty for new)
# 3. Configure Cloudflare? (y/n)
# 4. Enter Cloudflare API token
# 5. Enter Cloudflare Zone ID
# Done! ✅
```

### Option 2: Manual Render Setup (10 min)

1. Go to https://render.com/dashboard
2. Click **New +** → **Web Service**
3. Connect GitHub repo: `pdtribe181-prog/-modular-saas-platform`
4. Settings:
   - Name: `advancia-frontend`
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Environment variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.advancia.app
   ```
6. Click **Create Web Service**
7. Wait 5-10 minutes ⏳

### Option 3: GitHub Actions (Automated)

```bash
# Push to main branch
git add .
git commit -m "Deploy frontend"
git push origin main

# Or manually trigger
gh workflow run deploy-frontend.yml
```

---

## 🔧 Prerequisites Checklist

- [ ] Render account created (https://render.com/signup)
- [ ] GitHub repo connected to Render
- [ ] Cloudflare account (https://dash.cloudflare.com)
- [ ] Domain added to Cloudflare
- [ ] Backend already deployed (`advancia-backend.onrender.com`)

---

## 📋 Environment Variables

### Frontend (Render)

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.advancia.app
NEXT_PUBLIC_SITE_URL=https://advancia.app
```

### Backend (Update CORS)

```bash
ALLOWED_ORIGINS=https://advancia-frontend.onrender.com,https://advancia.app,https://www.advancia.app,https://admin.advancia.app,http://localhost:3000
```

---

## 🌐 Cloudflare DNS Records

| Type  | Name  | Content                       | Proxy | TTL  |
| ----- | ----- | ----------------------------- | ----- | ---- |
| A     | @     | [Render IP]                   | ✅ ON | Auto |
| CNAME | www   | advancia.app                  | ✅ ON | Auto |
| CNAME | admin | advancia.app                  | ✅ ON | Auto |
| CNAME | api   | advancia-backend.onrender.com | ✅ ON | Auto |

**Get Render IP:**

```powershell
nslookup advancia-frontend.onrender.com
# Use the first IP address
```

---

## 🔒 Cloudflare SSL Settings

Go to: **SSL/TLS** tab

- Encryption Mode: **Full (strict)** ✅
- Always Use HTTPS: **ON** ✅
- Automatic HTTPS Rewrites: **ON** ✅
- Minimum TLS Version: **1.2** ✅
- TLS 1.3: **ON** ✅

---

## 🎯 Render Custom Domains

Add in Render dashboard → Settings → Custom Domains:

- `advancia.app`
- `www.advancia.app`
- `admin.advancia.app`

Render will auto-verify and issue SSL certificates.

---

## ✅ Testing Commands

```powershell
# Test root domain
curl -I https://advancia.app

# Test WWW
curl -I https://www.advancia.app

# Test admin
curl -I https://admin.advancia.app

# Test API
curl https://api.advancia.app/api/health

# Test HTTPS redirect
curl -I http://advancia.app
# Should return 301/308 to https://

# Check SSL
openssl s_client -connect advancia.app:443 -servername advancia.app
```

---

## 🐛 Common Issues & Fixes

### Issue: 502 Bad Gateway

**Fix:** Render service is starting. Wait 2-3 minutes.

### Issue: CORS errors in browser console

**Fix:** Update backend `ALLOWED_ORIGINS` to include frontend domain.

```bash
# In backend .env
ALLOWED_ORIGINS=https://advancia.app,https://www.advancia.app
```

### Issue: DNS not resolving

**Fix:** Wait 30-60 minutes for propagation. Check:

```powershell
nslookup advancia.app 1.1.1.1
```

### Issue: SSL certificate not issued in Render

**Fix:**

1. Verify DNS points to Render
2. Remove and re-add custom domain
3. Wait 5-10 minutes

### Issue: Frontend shows old version

**Fix:** Clear Cloudflare cache

```powershell
# Via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" `
  -H "Authorization: Bearer {api_token}" `
  -H "Content-Type: application/json" `
  --data '{"purge_everything":true}'
```

### Issue: Free tier spins down (503 after inactivity)

**Fix:**

- Upgrade to Starter plan ($7/month) for always-on
- Or set up ping service (UptimeRobot, Pingdom)

---

## 📊 Monitoring

### Render Dashboard

- View logs: Render dashboard → Logs tab
- Monitor metrics: Render dashboard → Metrics tab
- CPU, Memory, Request rate, Response time

### Cloudflare Analytics

- Traffic overview: Cloudflare → Analytics → Traffic
- Security events: Cloudflare → Security → Events
- Performance: Cloudflare → Speed → Observatory

---

## 🔑 Secrets & API Keys

### GitHub Secrets (for Actions)

```
RENDER_API_KEY          - Get from Render → Account Settings → API Keys
RENDER_FRONTEND_SERVICE_ID - Get from Render service URL
NEXT_PUBLIC_API_URL     - https://api.advancia.app
CLOUDFLARE_API_TOKEN    - Get from Cloudflare → My Profile → API Tokens
CLOUDFLARE_ZONE_ID      - Get from Cloudflare → Overview → Zone ID
```

### Where to Find Them

**Render API Key:**

1. https://dashboard.render.com/account/api-keys
2. Click **Create API Key**
3. Copy and save

**Render Service ID:**

- From service URL: `https://dashboard.render.com/web/srv-abc123xyz`
- Service ID = `srv-abc123xyz`

**Cloudflare API Token:**

1. https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: "Edit zone DNS"
4. Copy token (only shown once!)

**Cloudflare Zone ID:**

- Cloudflare dashboard → Your domain → Overview
- Right sidebar: Zone ID

---

## 💰 Pricing Quick Reference

### Free Tier (Development)

```
Render Free:     $0/month
  - 750 hours/month
  - Spins down after 15min
  - 512MB RAM

Cloudflare Free: $0/month
  - Unlimited bandwidth
  - Basic DDoS
  - SSL certificates

Total: $0/month ✅
```

### Recommended Production

```
Render Starter:  $7/month (per service)
  - Always on
  - 1GB RAM
  - Custom domain

Cloudflare Pro:  $20/month
  - Advanced WAF
  - Image optimization
  - Web Analytics

Total: $34/month ($7 frontend + $7 backend + $20 Cloudflare)
```

---

## 🚀 Deployment Workflow

```
Local Development
    ↓ git push
GitHub Repository
    ↓ Auto-deploy
Render Build & Deploy
    ↓
Frontend Live at: advancia-frontend.onrender.com
    ↓
Cloudflare CDN
    ↓
Users access: https://advancia.app
```

---

## 📝 Quick Command Reference

```powershell
# Build locally
cd frontend
npm install
npm run build
npm start

# Test build
$env:NEXT_PUBLIC_API_URL="https://api.advancia.app"
npm run build

# Deploy via script
.\scripts\deploy-frontend-render.ps1 -Action deploy

# Verify deployment
.\scripts\deploy-frontend-render.ps1 -Action verify

# Full automated deployment
.\scripts\deploy-frontend-render.ps1 -Action all

# Check Render service
curl https://advancia-frontend.onrender.com

# Check Cloudflare cache
curl -I https://advancia.app | Select-String "cf-"

# Purge Cloudflare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/$zoneId/purge_cache" `
  -H "Authorization: Bearer $apiToken" `
  -H "Content-Type: application/json" `
  -d '{"purge_everything":true}'
```

---

## 📚 Documentation Files

- **RENDER_FRONTEND_DEPLOY.md** - Complete step-by-step guide
- **CLOUDFLARE_SETUP_GUIDE.md** - Comprehensive Cloudflare config
- **CLOUDFLARE_QUICK_START.md** - 30-minute setup checklist
- **scripts/deploy-frontend-render.ps1** - Automated deployment script

---

## ⏱️ Time Estimates

| Task                     | Time          |
| ------------------------ | ------------- |
| Create Render account    | 2 min         |
| Create Render service    | 5 min         |
| First deployment         | 10 min        |
| Add custom domain        | 3 min         |
| Configure Cloudflare DNS | 5 min         |
| Wait for DNS propagation | 5-30 min      |
| SSL certificate issued   | 5-10 min      |
| Configure Cloudflare SSL | 3 min         |
| Testing & verification   | 10 min        |
| **Total**                | **45-75 min** |

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Frontend accessible at https://advancia.app
- [ ] WWW redirect working (www.advancia.app → advancia.app)
- [ ] Admin accessible at https://admin.advancia.app
- [ ] API accessible at https://api.advancia.app
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid (A+ rating)
- [ ] No CORS errors in browser console
- [ ] Login/registration flows work
- [ ] Static assets loading from \_next/static
- [ ] Security headers present (X-Frame-Options, etc.)
- [ ] Cloudflare analytics tracking
- [ ] Render logs showing requests
- [ ] Environment variables configured
- [ ] GitHub Actions workflow passing

---

## 🆘 Support & Resources

- **Render Docs:** https://render.com/docs
- **Cloudflare Docs:** https://developers.cloudflare.com
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **GitHub Actions:** https://docs.github.com/actions

**Status Pages:**

- Render: https://status.render.com
- Cloudflare: https://www.cloudflarestatus.com

**Community:**

- Render Community: https://community.render.com
- Cloudflare Community: https://community.cloudflare.com

---

## 🎯 Next Steps After Deployment

1. **Monitor for 24 hours**

   - Check Render logs for errors
   - Monitor Cloudflare Analytics
   - Watch for 502/503 errors

2. **Set up monitoring**

   - UptimeRobot for uptime monitoring
   - Cloudflare Web Analytics
   - Render metrics dashboard

3. **Optimize performance**

   - Enable Cloudflare page rules
   - Configure caching strategies
   - Optimize Next.js bundle size

4. **Security hardening**

   - Configure WAF rules
   - Set up rate limiting
   - Enable bot protection

5. **Plan for scaling**
   - Consider upgrading to Starter plan
   - Set up auto-scaling rules
   - Implement CDN caching

---

**🎊 You're ready to deploy! Choose your method and start:**

- **Automated:** `.\scripts\deploy-frontend-render.ps1 -Action all`
- **Manual:** Follow RENDER_FRONTEND_DEPLOY.md
- **GitHub Actions:** Push to main branch

**Good luck! 🚀**
