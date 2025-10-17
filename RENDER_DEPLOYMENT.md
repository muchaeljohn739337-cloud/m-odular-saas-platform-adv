# Render Deployment Guide

This guide walks you through deploying Advancia SaaS Platform to Render.com.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Connected to this project
3. **Environment Variables**: Set up secrets in Render dashboard

## Step 1: Connect GitHub Repository to Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **+ New** → **Web Service**
3. Select **Connect a repository**
4. Authorize GitHub and select: `-modular-saas-platform`
5. Click **Connect**

## Step 2: Configure Backend Service

### Create Backend Web Service

1. **Name**: `advancia-backend`
2. **Environment**: `Node`
3. **Build Command**: 
   ```bash
   cd backend && npm ci && npm run build
   ```
4. **Start Command**:
   ```bash
   cd backend && npm start
   ```
5. **Plan**: Select your desired plan (Free/Paid)
6. **Auto-deploy**: Enable from branch `main` (or `copilot/vscode...` for testing)

### Add Environment Variables

In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=<PostgreSQL connection string from Render Database>
FRONTEND_URL=https://advancia-frontend.onrender.com
JWT_SECRET_ENCRYPTED=<from your .env file>
JWT_ENCRYPTION_KEY=<from your .env file>
JWT_ENCRYPTION_IV=<from your .env file>
SESSION_SECRET=<from your .env file>
REDIS_URL=<from your .env file>
STRIPE_SECRET_KEY=<your Stripe secret>
STRIPE_PUBLISHABLE_KEY=<your Stripe key>
TWILIO_ACCOUNT_SID=<your Twilio SID>
TWILIO_AUTH_TOKEN=<your Twilio token>
TWILIO_PHONE_NUMBER=<your Twilio number>
```

**Note**: Mark sensitive variables as **secret** so they're encrypted in Render.

## Step 3: Create PostgreSQL Database (Optional)

For production, use PostgreSQL instead of SQLite:

1. In Render Dashboard, click **+ New** → **PostgreSQL**
2. **Name**: `advancia-db`
3. **Database**: `advancia_prod`
4. **User**: `advancia_user`
5. **Region**: Choose your region
6. **Plan**: Free tier available
7. Copy the **Internal Database URL**

## Step 4: Configure Frontend Service

1. Click **+ New** → **Web Service**
2. **Name**: `advancia-frontend`
3. **Environment**: `Node`
4. **Build Command**:
   ```bash
   cd frontend && npm ci && npm run build
   ```
5. **Start Command**:
   ```bash
   cd frontend && npm start
   ```
6. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://advancia-backend.onrender.com/api
   ```

## Step 5: Deploy Using render.yaml (Recommended)

For advanced multi-service deployment:

1. Create `render.yaml` in repository root (already created)
2. In Render Dashboard, click **+ New** → **Blueprint**
3. Select your repository
4. Render will automatically parse `render.yaml` and create services

## Step 6: Verify Deployment

### Backend Health Check
```bash
curl https://advancia-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-17T09:00:00Z"
}
```

### Frontend Access
Visit: `https://advancia-frontend.onrender.com`

## Step 7: GitHub Integration

### Enable Auto-Deployment

1. In Render service settings, check **Auto-deploy from Git**
2. Select branch: `main` (or your deployment branch)
3. Render automatically redeploys on push

### Manual Redeployment

If needed, manually trigger from Render Dashboard:
1. Select service
2. Click **Manual Deploy** → **Deploy latest commit**

## Environment Variable Management

### Securely Store Secrets

**Option 1: Render Dashboard (Simple)**
- Add environment variables directly in Render UI
- Mark sensitive ones as "secret"
- Encrypted at rest

**Option 2: GitHub Secrets + Render Integration**
- Store in GitHub Secrets
- Reference in `render.yaml`:
  ```yaml
  envVars:
    - key: SECRET_NAME
      sync: false
  ```

## Database Migrations

Render automatically runs migrations via `postbuild` script:

```json
"postbuild": "prisma migrate deploy"
```

To manually run migrations:
1. Connect to Render database (see connection string in dashboard)
2. Run: `npx prisma migrate deploy`

## Monitoring & Debugging

### View Logs
1. Render Dashboard → Select service → **Logs** tab
2. Real-time logs from both stdout and stderr

### Health Checks
- Backend: `/health` endpoint monitored
- Frontend: Root path monitored
- Render alerts on failure

### Common Issues

**Service crashes on start:**
- Check logs in Render dashboard
- Verify environment variables are set
- Ensure database connection string is correct

**Build fails:**
- Run build locally: `cd backend && npm run build`
- Check for TypeScript errors
- Verify all dependencies are in package.json

**Database connection errors:**
- Confirm DATABASE_URL is set correctly
- Check Prisma migrations: `npx prisma migrate status`
- Verify PostgreSQL is accepting connections

## Custom Domain (Optional)

1. Render Dashboard → Service → **Settings**
2. Scroll to **Custom Domain**
3. Add your domain (e.g., `api.example.com`)
4. Update DNS records as instructed
5. SSL certificate auto-provisioned

## Rollback Deployment

If deployment fails:
1. Render Dashboard → Service → **Deployments**
2. Select previous successful deployment
3. Click **Revert**

## Production Checklist

- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] Health endpoint returns 200
- [ ] Frontend can connect to backend
- [ ] SSL certificates installed
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] Custom domain configured (optional)
- [ ] Monitoring alerts set up

## Support

For Render support: https://render.com/support
For project issues: See project repository
