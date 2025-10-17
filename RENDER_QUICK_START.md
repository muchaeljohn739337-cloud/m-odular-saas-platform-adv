# 🚀 Render Deployment - Quick Start

## What's Been Set Up

✅ **render.yaml** - Multi-service infrastructure as code
✅ **GitHub Actions workflow** - Automatic deployment on push
✅ **Deployment guides** - Step-by-step instructions
✅ **Backend build script** - TypeScript compilation + Prisma migrations
✅ **Environment templates** - Production-ready config

## Deployment in 5 Steps

### Step 1: Create Render Services (One-time setup)

```
1. Visit: https://render.com/dashboard
2. Click: "+ New" → "Web Service"
3. Connect: Your GitHub repository
4. Deploy: Using render.yaml (Blueprint) - OR manually configure
```

### Step 2: Get Deploy Hooks from Render

**Backend Service:**
1. Settings → Scroll to "Deploy Hook"
2. Copy URL (save for next step)

**Frontend Service:**
1. Settings → Scroll to "Deploy Hook"  
2. Copy URL (save for next step)

### Step 3: Add GitHub Secrets

1. GitHub Repo → Settings → Secrets → New secret
2. Add `RENDER_DEPLOY_HOOK_BACKEND` = (paste backend hook URL)
3. Add `RENDER_DEPLOY_HOOK_FRONTEND` = (paste frontend hook URL)

### Step 4: Push Code

```bash
git push origin main
# OR create manual deployment in Render dashboard
```

### Step 5: Monitor Deployment

**GitHub**: Actions tab → Watch workflow run
**Render**: Dashboard → Deployments tab → Watch progress

---

## What Gets Deployed

### Backend
- Node.js Express API server
- TypeScript compilation
- Prisma ORM with database migrations
- Port: 4000
- Health check: `/health`

### Frontend  
- Next.js React application
- Environment variable: `NEXT_PUBLIC_API_URL`
- Port: 3000 (on local, 443 on Render)

### Database
- PostgreSQL (optional, can use SQLite initially)
- Auto-migrated on deploy

---

## Testing After Deployment

### Backend Health Check
```bash
curl https://your-backend-service.onrender.com/health
# Expected: {"status":"healthy","timestamp":"..."}
```

### Frontend Access
Visit: `https://your-frontend-service.onrender.com`

### API Connectivity
Frontend should automatically connect to backend via `NEXT_PUBLIC_API_URL`

---

## Environment Variables Needed

### Backend (Render Dashboard)
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET_ENCRYPTED=...
JWT_ENCRYPTION_KEY=...
JWT_ENCRYPTION_IV=...
SESSION_SECRET=...
FRONTEND_URL=https://your-frontend.onrender.com
```

### Frontend (Render Dashboard)
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

---

## Automatic Deployment Workflow

**Trigger**: Push to `main` branch

**Process**:
1. GitHub Actions runs tests/builds
2. If successful, triggers Render deploy hooks
3. Render receives webhook
4. Render rebuilds and deploys both services
5. Database migrations run automatically
6. Services come online with new code

**Time**: ~5-10 minutes for full deployment

---

## Manual Deployment (If Needed)

If automatic fails or you want manual control:

1. Render Dashboard → Select service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for completion
4. Check logs if issues occur

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check GitHub Actions logs, verify dependencies |
| Service won't start | Check Render logs for runtime errors |
| Can't connect to DB | Verify DATABASE_URL in environment |
| Frontend can't reach API | Check NEXT_PUBLIC_API_URL and CORS settings |
| Deployment hook not working | Verify webhook URL in GitHub secrets is exact |

---

## Monitoring & Alerts

### View Logs
- Render Dashboard → Logs tab (real-time)
- GitHub Actions → Workflow runs (build logs)

### Health Checks
- Render auto-monitors `/health` endpoint
- Alerts on service failure

### Performance
- Render Dashboard → Metrics tab
- Monitor CPU, memory, response times

---

## Rollback Strategy

If deployment breaks production:

1. Render Dashboard → Deployments tab
2. Click on previous successful deployment
3. Click "Revert" button
4. Service rolls back to previous version (~2 min)

---

## Next: Custom Domain (Optional)

Want your own domain? (e.g., api.example.com)

1. Render Dashboard → Service → Settings
2. Scroll to "Custom Domain"
3. Add domain and follow DNS setup
4. SSL auto-provisioned ✅

---

## Documentation Links

📖 [Full Render Deployment Guide](./RENDER_DEPLOYMENT.md)
📖 [GitHub & Render Integration Setup](./GITHUB_RENDER_SETUP.md)
📖 [render.yaml Configuration](./render.yaml)
📖 [GitHub Actions Workflow](./.github/workflows/deploy-render.yml)

---

## Support Resources

- 🤝 Render Support: https://render.com/support
- 📚 Render Docs: https://render.com/docs
- 🔧 GitHub Actions: https://docs.github.com/en/actions
- 💬 Project Issues: Create issue in repository

---

## Deployment Checklist

- [ ] Render account created
- [ ] GitHub repository connected to Render
- [ ] Backend service created
- [ ] Frontend service created
- [ ] PostgreSQL database created (if using)
- [ ] Deploy hooks obtained
- [ ] GitHub secrets configured
- [ ] Environment variables set in Render
- [ ] First deployment tested
- [ ] Health checks passing
- [ ] Frontend-backend connection verified
- [ ] Monitoring enabled
- [ ] Rollback tested (optional)

✅ **All Set!** Your application is ready to deploy automatically on every push to `main`.
