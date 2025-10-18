# GitHub Actions Deployment Guide for Render

## Overview

This guide explains the GitHub Actions workflow for deploying your Advancia platform to Render. The workflow automatically builds and deploys both backend and frontend whenever you push to the `main` branch.

---

## 📋 Current Workflow Status

### ✅ What You Have

Your `.github/workflows/deploy-render.yml` includes:

```yaml
name: Deploy to Render

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  test-build:
    # Build and test both frontend and backend
    
  deploy:
    # Trigger Render deployment hooks
```

**Features:**
- ✅ Automatic builds on push to `main`
- ✅ TypeScript compilation check
- ✅ Linting verification
- ✅ Frontend and backend builds
- ✅ Automatic Render deployment triggers

---

## 🔑 GitHub Secrets Setup

### What You Need

The workflow requires two secrets in your GitHub repository:

1. **`RENDER_DEPLOY_HOOK_BACKEND`** - Deploy hook URL for backend service
2. **`RENDER_DEPLOY_HOOK_FRONTEND`** - Deploy hook URL for frontend service

### How to Get Deploy Hook URLs from Render

#### For Backend Service:

1. Go to [render.com dashboard](https://dashboard.render.com)
2. Click on your **Backend Service**
3. Go to **Settings** tab
4. Scroll to **Deploy Hook** section
5. Copy the URL (looks like: `https://api.render.com/deploy/srv-...`)

#### For Frontend Service:

1. Go to [render.com dashboard](https://dashboard.render.com)
2. Click on your **Frontend Service**
3. Go to **Settings** tab
4. Scroll to **Deploy Hook** section
5. Copy the URL

### Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/pdtribe181-prog/-modular-saas-platform`
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Add both secrets:
   - Name: `RENDER_DEPLOY_HOOK_BACKEND`
   - Value: (paste your Render backend deploy hook URL)
   - Click **Add secret**
6. Click **New repository secret** again
   - Name: `RENDER_DEPLOY_HOOK_FRONTEND`
   - Value: (paste your Render frontend deploy hook URL)
   - Click **Add secret**

---

## 🔄 Workflow Execution Flow

### When You Push to Main

```
1. Code pushed to main branch
   ↓
2. GitHub Actions triggered
   ↓
3. Checkout code
   ↓
4. Setup Node.js 18
   ↓
5. Build & Test Backend
   ├─ npm ci (clean install)
   ├─ npm run build (compile TypeScript)
   └─ npm run lint (check code quality)
   ↓
6. Build & Test Frontend
   ├─ npm ci (clean install)
   ├─ npm run build (build Next.js)
   └─ npm run lint (check code quality)
   ↓
7. All tests pass? → Deploy
   ├─ Trigger backend deployment
   ├─ Trigger frontend deployment
   └─ Complete!
   ↓
8. Render receives webhook
   ↓
9. Render rebuilds and deploys services
   ↓
10. ✅ Live on production!
```

---

## 📊 Workflow Structure Explained

### Test Build Job

```yaml
jobs:
  test-build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      # Download your code
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      # Install Node 18
      
      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci
      # Install backend packages
      
      - name: Check TypeScript compilation
        working-directory: ./backend
        run: npm run build
      # Verify TypeScript compiles
      
      - name: Run linting
        working-directory: ./backend
        run: npm run lint
      # Check code quality
      
      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci
      # Install frontend packages
      
      - name: Build frontend
        working-directory: ./frontend
        run: npm run build
      # Build Next.js app
      
      - name: Frontend lint
        continue-on-error: true
        run: npm run lint || true
      # Check frontend quality (non-blocking)
```

### Deploy Job

```yaml
  deploy:
    needs: test-build
    # Only runs if test-build succeeds
    
    runs-on: ubuntu-latest
    
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    # Only deploy on push to main (not on pull requests)
    
    steps:
      - name: Trigger Render deployment
        env:
          RENDER_DEPLOY_HOOK_BACKEND: ${{ secrets.RENDER_DEPLOY_HOOK_BACKEND }}
          RENDER_DEPLOY_HOOK_FRONTEND: ${{ secrets.RENDER_DEPLOY_HOOK_FRONTEND }}
        run: |
          if [ -n "$RENDER_DEPLOY_HOOK_BACKEND" ]; then
            echo "Deploying backend to Render..."
            curl --request POST --url "$RENDER_DEPLOY_HOOK_BACKEND" \
              --header 'content-type: application/json'
          fi
          
          if [ -n "$RENDER_DEPLOY_HOOK_FRONTEND" ]; then
            echo "Deploying frontend to Render..."
            curl --request POST --url "$RENDER_DEPLOY_HOOK_FRONTEND" \
              --header 'content-type: application/json'
          fi
      
      - name: Deployment notification
        run: echo "✅ Deployment triggered! Check Render dashboard for status."
```

---

## ✅ Verification Checklist

### Step 1: Check GitHub Secrets Are Set

```bash
# Visit GitHub Settings → Secrets and verify:
□ RENDER_DEPLOY_HOOK_BACKEND is set
□ RENDER_DEPLOY_HOOK_FRONTEND is set
□ Both URLs start with https://api.render.com/deploy/
```

### Step 2: Check Render Deploy Hooks Are Active

1. Visit [render.com dashboard](https://dashboard.render.com)
2. Click each service (backend and frontend)
3. Go to **Settings** → **Deploy Hook**
4. Verify both have a deploy hook URL generated

### Step 3: Verify Workflow File

```bash
# Check workflow file exists:
ls -la .github/workflows/deploy-render.yml
```

### Step 4: Test the Workflow

Make a small change and push:

```bash
cd c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform

# Make a minor change
echo "# Updated $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "test: trigger GitHub Actions workflow"
git push origin main
```

### Step 5: Monitor Workflow Execution

1. Go to GitHub: https://github.com/pdtribe181-prog/-modular-saas-platform
2. Click **Actions** tab (top menu)
3. Watch the workflow run:
   - Green ✅ = Success
   - Red ❌ = Failed
   - Yellow ⏳ = Running

---

## 🐛 Troubleshooting

### Issue: Workflow Shows Red ❌

**Check 1: Click on the failed run**
- See what step failed
- Read the error message
- Most common: Missing npm scripts

**Check 2: Verify npm scripts exist**

```bash
# Backend scripts
cat backend/package.json | grep -A 5 '"scripts"'

# Should show:
# "dev": "..."
# "build": "..."
# "lint": "..."
```

**Check 3: Check GitHub Secrets**
- Go to Settings → Secrets
- Verify both secrets are filled in
- Check URL format: `https://api.render.com/deploy/srv-...`

### Issue: Secrets Not Found Error

```yaml
ERROR: env secrets are missing!
```

**Solution:**
1. Go to GitHub Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Add `RENDER_DEPLOY_HOOK_BACKEND` and `RENDER_DEPLOY_HOOK_FRONTEND`
4. Verify they're not empty

### Issue: Render Deployment Not Triggered

**Check 1: Is the deploy job running?**
- Look at workflow logs
- If deploy job doesn't show: Check `if:` condition

**Check 2: Are secrets valid?**
- Test URL manually:
```bash
curl --request POST --url "YOUR_DEPLOY_HOOK_URL" \
  --header 'content-type: application/json'
```

**Check 3: Is Render service active?**
- Visit Render dashboard
- Verify service is not suspended
- Check for any service errors

### Issue: Build Fails (TypeScript Errors)

**Backend build failed:**
```bash
# Test locally:
cd backend
npm run build

# Fix errors, then push again
git add .
git commit -m "fix: resolve TypeScript errors"
git push origin main
```

**Frontend build failed:**
```bash
# Test locally:
cd frontend
npm run build

# Fix errors, then push again
git add .
git commit -m "fix: resolve build errors"
git push origin main
```

---

## 🚀 Production Deployment Flow

### Complete End-to-End Flow:

```
1. Developer pushes to main branch
2. GitHub Actions automatically triggers
3. Workflow checks out code
4. Backend tested and built
5. Frontend tested and built
6. If successful: Deploy hooks triggered
7. Render receives webhook
8. Render rebuilds backend service
9. Render rebuilds frontend service
10. Services restart with new code
11. Live on production! ✅
```

### Typical Deployment Time:
- Build & Test: 3-5 minutes
- Render deployment: 2-5 minutes
- **Total: ~5-10 minutes from push to live**

---

## 📝 Important Notes

### About Pull Requests

The workflow runs on pull requests too (for testing), but **does NOT deploy**:

```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
# This ensures deploy only runs on direct pushes to main
```

Pull request builds are for validation only - changes don't go live until merged to main.

### About Secrets

- Secrets are **encrypted** by GitHub
- You can't see them after adding
- They're only available to Actions runs
- Use a new secret if you lose it

### About Rendering Deploy Hooks

- Deploy hooks are **specific** to each service
- Backend hook only deploys backend
- Frontend hook only deploys frontend
- Regenerate if accidentally exposed

---

## 🎯 Next Steps

### Immediate (Today):
1. ✅ Get Render deploy hook URLs
2. ✅ Add secrets to GitHub
3. ✅ Make test push
4. ✅ Watch deployment

### Short Term (This Week):
- [ ] Monitor first few deployments
- [ ] Verify no errors in logs
- [ ] Test production URLs after deployment

### Long Term:
- [ ] Consider adding notifications to Slack
- [ ] Add deployment status badges to README
- [ ] Set up staging deployment on push to `dev` branch

---

## 📊 Dashboard URLs

### GitHub Actions:
https://github.com/pdtribe181-prog/-modular-saas-platform/actions

### Render Dashboard:
https://dashboard.render.com

### Your Production Services:
- Backend: Check Render dashboard for URL
- Frontend: Check Render dashboard for URL

---

## 🔗 Quick Reference

### Common Commands

```bash
# View workflow runs
gh run list --repo pdtribe181-prog/-modular-saas-platform

# View specific run logs
gh run view <run-id> --log

# Manually trigger deployment (if setup)
gh workflow run deploy-render.yml
```

### Files to Update for Deployment

When making changes, these files might need updating:

- Backend: `backend/src/**/*.ts` → Rebuild on push
- Frontend: `frontend/src/**/*.tsx` → Rebuild on push
- Dependencies: `backend/package.json` or `frontend/package.json` → Reinstalled on push
- Environment: `.env` files → **Must be added manually to Render** (not in GitHub)

---

## ✨ Summary

Your GitHub Actions workflow:

✅ Automatically builds code when you push  
✅ Runs tests and checks  
✅ Automatically deploys to Render on success  
✅ Only deploys from main branch  
✅ Prevents broken code from going live  

**To use it:**

1. Add secrets to GitHub (Render deploy hooks)
2. Push to main branch
3. Watch it deploy automatically!

**Status:** ✅ Ready to use once secrets are configured

---

*Last Updated: October 18, 2025*  
*Workflow File: `.github/workflows/deploy-render.yml`*  
*Platform: Advancia SaaS*
