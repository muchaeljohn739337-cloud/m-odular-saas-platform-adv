# GitHub & Render Integration Setup

## Step 1: Get Render Deploy Hooks

### For Backend Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Select **advancia-backend** service
3. Go to **Settings** tab
4. Scroll to **Deploy Hook**
5. Click **Copy** to get the webhook URL
6. Save this URL - you'll need it for GitHub

### For Frontend Service

1. Select **advancia-frontend** service
2. Go to **Settings** tab
3. Scroll to **Deploy Hook**
4. Click **Copy** to get the webhook URL
5. Save this URL

## Step 2: Add GitHub Secrets

1. Go to GitHub repository: https://github.com/pdtribe181-prog/-modular-saas-platform
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Add These Secrets:

**RENDER_DEPLOY_HOOK_BACKEND**
- Value: `<paste backend deploy hook URL>`
- Click **Add secret**

**RENDER_DEPLOY_HOOK_FRONTEND**
- Value: `<paste frontend deploy hook URL>`
- Click **Add secret**

**STRIPE_SECRET_KEY** (if using Stripe)
- Value: `sk_live_...` (from Stripe dashboard)

**TWILIO_ACCOUNT_SID** (if using Twilio)
- Value: `AC...` (from Twilio console)

**TWILIO_AUTH_TOKEN**
- Value: `...` (from Twilio console)

## Step 3: Verify Workflow Setup

1. In your GitHub repo, go to **Actions**
2. You should see **Deploy to Render** workflow
3. Click on it to view details

## Step 4: Test Deployment

### Option 1: Push to main branch
```bash
git add .
git commit -m "chore: prepare for Render deployment"
git push origin main
```

### Option 2: Trigger manually
1. Go to GitHub **Actions** tab
2. Select **Deploy to Render** workflow
3. Click **Run workflow** → **Run workflow**

## Step 5: Monitor Deployment

### GitHub Actions
1. Go to **Actions** tab
2. Watch the workflow execute in real-time
3. Check for ✅ or ❌ status

### Render Dashboard
1. Select service (backend or frontend)
2. Go to **Deployments** tab
3. See deployment progress and logs
4. Check **Health** status

## Environment Variables Reference

### Backend (.env in Render Dashboard)

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/db
FRONTEND_URL=https://advancia-frontend.onrender.com
JWT_SECRET_ENCRYPTED=<encrypted JWT secret>
JWT_ENCRYPTION_KEY=<encryption key>
JWT_ENCRYPTION_IV=<encryption IV>
SESSION_SECRET=<session secret>
REDIS_URL=redis://redis-host:6379
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

### Frontend (.env.production in Render Dashboard)

```env
NEXT_PUBLIC_API_URL=https://advancia-backend.onrender.com/api
```

## Troubleshooting

### Deployment Hook Not Working
- [ ] Verify hook URL is correctly copied (no extra spaces)
- [ ] Check GitHub secret name is exactly: `RENDER_DEPLOY_HOOK_BACKEND`
- [ ] Ensure workflow file exists at: `.github/workflows/deploy-render.yml`

### Build Fails in GitHub Actions
- [ ] Check logs in GitHub Actions tab
- [ ] Verify dependencies: `npm ci` succeeds locally
- [ ] Check for TypeScript errors: `npm run build`
- [ ] Review Node.js version compatibility

### Deployment Succeeds but Service Still Down
- [ ] Check Render logs for runtime errors
- [ ] Verify environment variables are set correctly
- [ ] Check database connectivity
- [ ] Review health check endpoint: `/health`

### Database Connection Issues
- [ ] Verify `DATABASE_URL` in Render dashboard
- [ ] Check Prisma migrations: `npx prisma migrate status`
- [ ] Ensure PostgreSQL is accessible from Render environment

## Manual Deployment (Without GitHub)

If automatic deployment fails, deploy manually:

1. Go to Render Dashboard
2. Select service
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for deployment to complete
5. Check logs for any errors

## Disable Auto-Deployment (Optional)

If you want to manually deploy only:

1. In Render service settings
2. Uncheck **Auto-deploy from Git**
3. Deployments must be triggered via webhook or manually

## Production Checklist

- [ ] GitHub secrets configured
- [ ] Render services created (backend & frontend)
- [ ] Environment variables set in Render
- [ ] PostgreSQL database created
- [ ] Deploy hooks working
- [ ] GitHub Actions workflow executing
- [ ] Health checks passing
- [ ] Logs showing no errors
- [ ] Frontend can access backend
- [ ] Custom domains configured (optional)

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Watch GitHub Actions run
3. ✅ Monitor Render deployment
4. ✅ Test endpoints
5. ✅ Configure monitoring & alerts
6. ✅ Set up backup strategy

For more help:
- Render Support: https://render.com/support
- GitHub Actions: https://docs.github.com/en/actions
- Project Issues: Create an issue in the repository
