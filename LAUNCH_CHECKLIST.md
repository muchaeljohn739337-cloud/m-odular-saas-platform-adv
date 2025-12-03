# 🚀 Advancia Pay Ledger - Production Launch Checklist

## ✅ VERIFICATION COMPLETE

### Frontend (Vercel) - All Present ✅
| Item | Status | Location |
|------|--------|----------|
| package.json | ✅ | `frontend/package.json` |
| app/layout.tsx | ✅ | `frontend/src/app/layout.tsx` |
| app/page.tsx | ✅ | `frontend/src/app/page.tsx` |
| vercel.json | ✅ | `frontend/vercel.json` |
| next.config.js | ✅ | `frontend/next.config.js` |
| tailwind.config.js | ✅ | `frontend/tailwind.config.js` |

### UI Components - All Present ✅
| Component | Status | Location |
|-----------|--------|----------|
| Avatar.tsx | ✅ | `frontend/src/components/ui/Avatar.tsx` |
| Input.tsx | ✅ | `frontend/src/components/ui/Input.tsx` |
| Modal.tsx | ✅ | `frontend/src/components/ui/Modal.tsx` |
| Table.tsx | ✅ | `frontend/src/components/ui/Table.tsx` |
| button.tsx | ✅ | `frontend/src/components/ui/button.tsx` |
| card.tsx | ✅ | `frontend/src/components/ui/card.tsx` |
| badge.tsx | ✅ | `frontend/src/components/ui/badge.tsx` |
| tabs.tsx | ✅ | `frontend/src/components/ui/tabs.tsx` |

### Backend (Render) - All Present ✅
| Item | Status | Location |
|------|--------|----------|
| package.json | ✅ | `backend/package.json` |
| Procfile | ✅ | `backend/Procfile` |
| render.yaml | ✅ | `backend/render.yaml` |
| Dockerfile | ✅ | `backend/Dockerfile` |
| src/index.ts | ✅ | `backend/src/index.ts` |
| prisma/schema.prisma | ✅ | `backend/prisma/schema.prisma` |

### Infrastructure - All Present ✅
| Item | Status | Location |
|------|--------|----------|
| Terraform main.tf | ✅ | `infrastructure/terraform/main.tf` |
| K8s service.yaml | ✅ | `k8s/service.yaml` |
| K8s deployment.yaml | ✅ | `k8s/deployment.yaml` |
| Cloudflare Workers | ✅ | `.infrastructure/cloudflare/workers/api-gateway.js` |
| wrangler.toml | ✅ | `frontend/wrangler.toml` |

---

## 🔧 DEPLOYMENT STEPS

### 1️⃣ Vercel (Frontend)
```bash
# In frontend directory
cd frontend

# Install dependencies
npm install

# Test build locally
npm run build

# Deploy to Vercel
vercel --prod
```

**Vercel Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node.js Version:** 20.x

**Environment Variables (Vercel Dashboard):**
```
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
NEXT_PUBLIC_SOCKET_URL=https://api.advanciapayledger.com
NEXTAUTH_URL=https://advanciapayledger.com
NEXTAUTH_SECRET=<generate-32-char-secret>
SENTRY_DSN=<your-sentry-dsn>
```

### 2️⃣ Render (Backend)
```bash
# In backend directory
cd backend

# Install & build
npm ci
npm run build

# Prisma setup
npx prisma generate
npx prisma migrate deploy
```

**Render Web Service Settings:**
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm run start:render`
- **Health Check Path:** `/api/health`
- **Plan:** Starter or Standard
- **Region:** Oregon (us-west-2)

**Environment Variables (Render Dashboard):**
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<32-char-secret>
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
OPENAI_API_KEY=sk-xxx
SENDGRID_API_KEY=SG.xxx
REDIS_URL=redis://xxx
FRONTEND_URL=https://advanciapayledger.com
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 3️⃣ Cloudflare
**DNS Records (already configured in Cloudflare):**
| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | 76.76.21.21 (Vercel) | ✅ |
| CNAME | www | advanciapayledger.com | ✅ |
| CNAME | api | advancia-pay-ledger-backend.onrender.com | ✅ |

**Workers (optional):**
```bash
cd frontend
wrangler deploy
```

### 4️⃣ Database Migrations
```bash
# On Render after deploy
npx prisma migrate deploy

# Seed admin user if needed
npm run seed:admin
```

---

## ✔️ PRE-LAUNCH CHECKLIST

### Security
- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enforced on all domains
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] JWT tokens have proper expiration
- [ ] SQL injection protection (Prisma ORM)
- [ ] XSS protection headers enabled

### Monitoring
- [ ] Sentry error tracking configured
- [ ] Health check endpoints responding
- [ ] Log aggregation set up
- [ ] Uptime monitoring (e.g., UptimeRobot)

### Performance
- [ ] Static assets cached (Cloudflare CDN)
- [ ] Images optimized
- [ ] Database indexes created
- [ ] Redis caching enabled

### Backups
- [ ] Database backups scheduled
- [ ] Point-in-time recovery enabled
- [ ] Disaster recovery plan documented

---

## 🧪 POST-DEPLOYMENT VERIFICATION

```bash
# Test health endpoints
curl https://api.advanciapayledger.com/api/health
curl https://advanciapayledger.com

# Test API endpoints
curl https://api.advanciapayledger.com/api/medbeds/info
curl https://api.advanciapayledger.com/api/currency/supported

# Check SSL certificates
curl -I https://advanciapayledger.com
curl -I https://api.advanciapayledger.com
```

---

## 📞 Support Contacts
- **Vercel:** support@vercel.com
- **Render:** support@render.com
- **Cloudflare:** https://dash.cloudflare.com/support
- **Stripe:** https://dashboard.stripe.com/support
