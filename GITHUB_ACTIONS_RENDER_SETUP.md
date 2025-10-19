# GitHub Actions + Render Deployment Setup Guide

Complete guide to set up automatic deployments to Render when you push to GitHub.

---

## 📋 What Was Created

Two GitHub Actions workflows:
- ✅ `.github/workflows/deploy-backend.yml` - Deploys backend API
- ✅ `.github/workflows/deploy-frontend.yml` - Deploys frontend app

---

## 🔑 Step 1: Get Render Deploy Hooks

### For Backend:

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Click on your **Backend** service (e.g., `advancia-backend`)

2. **Get Deploy Hook URL**
   - Click **Settings** (left sidebar)
   - Scroll to **Deploy Hook** section
   - Click **Create Deploy Hook**
   - Name it: `GitHub Actions`
   - Copy the URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

### For Frontend:

1. **Go to Render Dashboard**
   - Click on your **Frontend** service (e.g., `advancia-frontend`)

2. **Get Deploy Hook URL**
   - Click **Settings**
   - Scroll to **Deploy Hook**
   - Click **Create Deploy Hook**
   - Name it: `GitHub Actions`
   - Copy the URL

---

## 🔐 Step 2: Add Secrets to GitHub

1. **Go to GitHub Repository**
   - Navigate to: https://github.com/pdtribe181-prog/-modular-saas-platform

2. **Open Settings**
   - Click **Settings** tab (top right)
   - Click **Secrets and variables** → **Actions** (left sidebar)

3. **Add Backend Deploy Hook**
   - Click **New repository secret**
   - Name: `RENDER_BACKEND_DEPLOY_HOOK`
   - Value: Paste the backend deploy hook URL from Step 1
   - Click **Add secret**

4. **Add Frontend Deploy Hook**
   - Click **New repository secret**
   - Name: `RENDER_FRONTEND_DEPLOY_HOOK`
   - Value: Paste the frontend deploy hook URL from Step 1
   - Click **Add secret**

5. **Optional: Add API URL**
   - Click **New repository secret**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://advancia-backend.onrender.com`
   - Click **Add secret**

---

## 📤 Step 3: Commit and Push Workflows

Run these commands to deploy the workflows:

```powershell
# Add the workflow files
git add .github/workflows/deploy-backend.yml
git add .github/workflows/deploy-frontend.yml

# Commit
git commit -m "🚀 Add GitHub Actions auto-deploy to Render"

# Push to trigger first deployment
git push origin main
```

---

## ✅ Step 4: Verify Deployment

1. **Check GitHub Actions**
   - Go to: https://github.com/pdtribe181-prog/-modular-saas-platform/actions
   - You should see workflows running
   - Click on a workflow to see details

2. **Check Render Dashboard**
   - Go to: https://dashboard.render.com
   - Select your service
   - Click **Events** to see deployment progress

---

## 🎯 How It Works

### Backend Deployment Triggers When:
- ✅ You push to `main` branch
- ✅ Files in `backend/` folder change
- ✅ The workflow file itself changes

### Frontend Deployment Triggers When:
- ✅ You push to `main` branch
- ✅ Files in `frontend/` folder change
- ✅ The workflow file itself changes

### What Happens:
1. GitHub Actions checks out your code
2. Installs Node.js and dependencies
3. Generates Prisma client (backend only)
4. Runs build check to catch errors
5. Triggers Render deploy via webhook
6. Render builds and deploys your app
7. Shows summary in GitHub Actions

---

## 🧪 Test Your Setup

### Test Backend Deployment:

```powershell
# Make a small change to backend
echo "# Test deployment" >> backend/README.md

# Commit and push
git add backend/README.md
git commit -m "Test backend deployment"
git push origin main

# Check GitHub Actions tab - should see "Deploy Backend to Render" running
```

### Test Frontend Deployment:

```powershell
# Make a small change to frontend
echo "# Test deployment" >> frontend/README.md

# Commit and push
git add frontend/README.md
git commit -m "Test frontend deployment"
git push origin main

# Check GitHub Actions tab - should see "Deploy Frontend to Render" running
```

---

## 🔍 Troubleshooting

### ❌ "RENDER_BACKEND_DEPLOY_HOOK secret not set"

**Solution:**
- Go to GitHub → Settings → Secrets → Actions
- Add secret named `RENDER_BACKEND_DEPLOY_HOOK`
- Value should be the full deploy hook URL from Render

### ❌ "Deploy trigger failed (HTTP 404)"

**Solution:**
- Deploy hook URL might be wrong
- Go to Render → Service → Settings → Deploy Hook
- Delete old hook, create new one
- Update the secret in GitHub with new URL

### ❌ Workflow doesn't run

**Solution:**
1. Check if files changed in `backend/` or `frontend/`
2. Verify you pushed to `main` branch
3. Check GitHub Actions tab for any errors
4. Make sure workflows are in `.github/workflows/` folder

### ❌ Build fails on GitHub Actions

**Solution:**
- Check the build logs in GitHub Actions
- Fix any TypeScript/build errors locally first
- Test with: `npm run build` in backend/frontend
- Push fixes to GitHub

---

## 📊 Monitoring Deployments

### GitHub Actions Dashboard:
- URL: https://github.com/pdtribe181-prog/-modular-saas-platform/actions
- Shows: Workflow status, logs, timing
- Notifications: Email on failure (can configure)

### Render Dashboard:
- URL: https://dashboard.render.com
- Shows: Build logs, deploy status, runtime logs
- Alerts: Email/Slack notifications

---

## 🎨 Workflow Features

### What the Workflows Do:

✅ **Smart Triggers** - Only deploy what changed
✅ **Dependency Caching** - Faster builds with npm cache
✅ **Pre-Deploy Checks** - Catch errors before deploying
✅ **Status Validation** - Verify deploy hook worked
✅ **Rich Summaries** - See deployment details in GitHub
✅ **Error Handling** - Clear messages if something fails

### Workflow Steps:

1. **📥 Checkout** - Get your code
2. **🔧 Setup Node** - Install Node.js 18
3. **📦 Install deps** - Run `npm ci`
4. **🛠 Generate Prisma** - Create database client (backend)
5. **✅ Build check** - Test if code compiles
6. **🚀 Deploy** - Trigger Render deployment
7. **📝 Summary** - Show deployment info

---

## 🔄 Manual Deployment (If Needed)

If you need to manually deploy without pushing code:

### Option 1: GitHub Actions UI
1. Go to **Actions** tab
2. Select workflow (Deploy Backend or Frontend)
3. Click **Run workflow**
4. Select branch and click **Run**

### Option 2: Render Dashboard
1. Go to https://dashboard.render.com
2. Select your service
3. Click **Manual Deploy** → **Deploy latest commit**

### Option 3: Using Deploy Hook Directly
```powershell
# Backend
curl -X POST "YOUR_BACKEND_DEPLOY_HOOK_URL"

# Frontend
curl -X POST "YOUR_FRONTEND_DEPLOY_HOOK_URL"
```

---

## 📚 Next Steps

### After First Successful Deploy:

1. ✅ **Set up branch protection**
   - GitHub → Settings → Branches
   - Protect `main` branch
   - Require status checks (workflows) to pass

2. ✅ **Configure notifications**
   - GitHub → Settings → Notifications
   - Enable Actions notifications
   - Get alerts on deployment failures

3. ✅ **Add status badges** (optional)
   ```markdown
   ![Backend Deploy](https://github.com/pdtribe181-prog/-modular-saas-platform/actions/workflows/deploy-backend.yml/badge.svg)
   ![Frontend Deploy](https://github.com/pdtribe181-prog/-modular-saas-platform/actions/workflows/deploy-frontend.yml/badge.svg)
   ```

4. ✅ **Consider staging environment**
   - Create `staging` branch
   - Add separate Render services for staging
   - Update workflows to support multi-environment

---

## 🎯 Quick Reference

### Required GitHub Secrets:
| Secret Name | Description | Where to Get |
|------------|-------------|--------------|
| `RENDER_BACKEND_DEPLOY_HOOK` | Backend deploy URL | Render → Backend → Settings → Deploy Hook |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Frontend deploy URL | Render → Frontend → Settings → Deploy Hook |
| `NEXT_PUBLIC_API_URL` | API endpoint (optional) | Your backend URL |

### Deployment Timing:
- **GitHub Actions**: ~2-3 minutes
- **Render Build**: ~5-10 minutes (backend), ~3-5 minutes (frontend)
- **Total**: ~7-13 minutes from push to live

### Costs:
- **GitHub Actions**: Free (2,000 minutes/month on free plan)
- **Render**: Depends on your plan (Free tier available)

---

## ✅ Success Checklist

- [ ] Backend deploy hook created in Render
- [ ] Frontend deploy hook created in Render
- [ ] Both secrets added to GitHub repository
- [ ] Workflow files committed and pushed
- [ ] First deployment successful
- [ ] Backend and frontend both accessible
- [ ] Tested with a small code change

---

## 📞 Need Help?

- **GitHub Actions Docs**: https://docs.github.com/actions
- **Render Deploy Hooks**: https://render.com/docs/deploy-hooks
- **Workflow Logs**: Check GitHub Actions tab for detailed logs
- **Render Logs**: Check Render Dashboard → Service → Logs

---

🎉 **Your CI/CD pipeline is ready!** Every push to `main` will automatically deploy your changes to Render.
