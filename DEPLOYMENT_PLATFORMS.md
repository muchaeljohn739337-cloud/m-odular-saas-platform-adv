# 🚀 Deployment Platforms Reference

**Last Updated**: October 23, 2025

---

## Current Deployment Configuration

### ✅ Backend → Render

- **Platform**: Render (Node runtime)
- **Service**: `advancia-backend-upnrf`
- **Region**: Oregon
- **URL**: https://api.advanciapayledger.com
- **Health**: https://api.advanciapayledger.com/api/health
- **Auto-deploy**: ✅ Enabled (on git push to main)

### ✅ Frontend → Render

- **Platform**: Render (Docker)
- **Service**: `advancia-frontend`
- **Region**: Virginia
- **URL**: https://advanciapayledger.com
- **Health**: https://advanciapayledger.com/
- **Auto-deploy**: ✅ Enabled (on git push to main)

### ✅ Database → Render Postgres

- **Platform**: Render Postgres
- **Database**: `advancia-db`
- **Region**: Virginia
- **Plan**: Free
- **Connection**: Via DATABASE_URL secret

---

## ❌ Vercel — NOT USED

**Vercel has been removed from this project.**

- `frontend/vercel.json` deleted (Oct 23, 2025)
- All Vercel references in docs are historical
- Frontend deploys to **Render** using Docker

### Why Render Instead of Vercel?

1. **Unified Platform** - Both backend and frontend on same platform
2. **Docker Support** - Full control over runtime environment
3. **Database Included** - Render Postgres in same ecosystem
4. **Cost** - Free tier sufficient for both services
5. **Simplicity** - Single dashboard, single deployment pipeline

---

## Deployment Workflow

### Automatic Deployments (Current)

```
git push origin main
    ↓
GitHub Actions CI
    ↓
├─→ Backend Deploy (Render)
└─→ Frontend Deploy (Render)
```

### Manual Deployments

```bash
# Backend only
curl -X POST https://api.render.com/deploy/srv-d3rc04ngi27c738l9o8g?key=<secret>

# Frontend only
curl -X POST https://api.render.com/deploy/srv-d3qbuqu3jp1c738gjikg?key=<secret>
```

---

## Configuration Files

### ✅ Active Files

- `render.yaml` - Defines all Render services
- `Frontend/Dockerfile` - Frontend Docker image
- `backend/Procfile` - Backend start command (Render)
- `.github/workflows/deploy-*.yml` - CI/CD pipelines

### ❌ Removed Files

- ~~`frontend/vercel.json`~~ (deleted Oct 23, 2025)
- ~~`.vercelignore`~~ (never existed)

---

## Environment Variables

### Backend (Render)

Set in Render Dashboard → advancia-backend-upnrf → Environment:

- `DATABASE_URL` (from Render Postgres)
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `FRONTEND_URL=https://advanciapayledger.com`

### Frontend (Render)

Set in Render Dashboard → advancia-frontend → Environment:

- `NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXTAUTH_URL=https://advanciapayledger.com`

---

## DNS Configuration

### Custom Domains (via Cloudflare)

- `advanciapayledger.com` → Frontend (Render)
- `api.advanciapayledger.com` → Backend (Render)

### SSL/TLS

- Managed by Render (automatic Let's Encrypt)
- Proxied through Cloudflare

---

## Monitoring & Logs

### Render Dashboard

- Backend logs: https://dashboard.render.com/web/srv-d3rc04ngi27c738l9o8g
- Frontend logs: https://dashboard.render.com/web/srv-d3qbuqu3jp1c738gjikg

### Health Checks

- Backend: `GET /api/health` (every 5 min)
- Frontend: `GET /` (every 5 min)

### GitHub Actions

- CI status: https://github.com/pdtribe181-prog/-modular-saas-platform/actions
- Deploy workflows: `deploy-on-ci-success.yml`, `deploy-now.yml`

---

## Quick Reference

| Component       | Platform        | URL                               |
| --------------- | --------------- | --------------------------------- |
| **Backend API** | Render          | https://api.advanciapayledger.com |
| **Frontend**    | Render          | https://advanciapayledger.com     |
| **Database**    | Render Postgres | (internal)                        |
| **DNS**         | Cloudflare      | console.cloudflare.com            |
| **CI/CD**       | GitHub Actions  | github.com/.../actions            |

---

## Migration Notes

**October 23, 2025**: Removed Vercel

- Reason: Consolidation to single platform (Render)
- Impact: All deployment docs updated
- Action: `frontend/vercel.json` deleted, `render.yaml` is source of truth

**Previous Vercel URLs** (no longer valid):

- ~~advancia-pay-ledger.vercel.app~~
- Replaced with: advanciapayledger.com (Render)

---

**For deployment issues, see**:

- `docs/RENDER_LOG_TRIAGE_CHECKLIST.md`
- `docs/RENDER_SMOKE_TESTS.md`
- `.github/workflows/post-deploy-smoke.yml`

## ❌ Cloudflare Workers — REMOVED

**Cloudflare Workers integration has been removed from this project.**

- rontend/wrangler.toml archived to docs/archive/ (Oct 24, 2025)
- .github/workflows/cloudflare-*.yml deleted (Oct 24, 2025)
- Frontend deploys to **Render** using Docker, NOT Cloudflare Pages/Workers

### Why Removed?

1. **Redundant** - Render already handles frontend deployment
2. **Complexity** - Maintaining dual deployment paths unnecessary
3. **CI/CD Noise** - Cloudflare build failures blocking unrelated PRs
4. **Single Platform Strategy** - All services on Render for consistency

### Note on Cloudflare DNS

Cloudflare is still used for **DNS and proxying only**:
- DNS records point to Render services
- SSL/TLS proxied through Cloudflare
- No Workers/Pages deployment

---

