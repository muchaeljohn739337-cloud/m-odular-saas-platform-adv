# 🔑 GitHub Secrets Required for Deployment

## Overview

Your GitHub Actions workflow needs **2 secrets** to automatically deploy to Render.

---

## Required GitHub Secrets

### 1. `RENDER_DEPLOY_HOOK_BACKEND`

**Purpose:** Triggers backend service deployment on Render

**How to Get It:**
1. Go to https://dashboard.render.com
2. Click on your **Backend Service**
3. Go to **Settings** tab
4. Scroll to **Deploy Hook** section
5. Click **Create Deploy Hook** (if not already created)
6. Copy the URL

**URL Format:**
```
https://api.render.com/deploy/srv-XXXXXXXXXXXXXX?key=YYYYYYYYYYYY
```

**Example:**
```
https://api.render.com/deploy/srv-abc123def456?key=xyz789
```

---

### 2. `RENDER_DEPLOY_HOOK_FRONTEND`

**Purpose:** Triggers frontend service deployment on Render

**How to Get It:**
1. Go to https://dashboard.render.com
2. Click on your **Frontend Service**
3. Go to **Settings** tab
4. Scroll to **Deploy Hook** section
5. Click **Create Deploy Hook** (if not already created)
6. Copy the URL

**URL Format:**
```
https://api.render.com/deploy/srv-XXXXXXXXXXXXXX?key=YYYYYYYYYYYY
```

**Example:**
```
https://api.render.com/deploy/srv-ghi789jkl012?key=mno345
```

---

## How to Add Secrets to GitHub

### Step 1: Go to Repository Settings

Visit: https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions

Or navigate manually:
1. Go to your repository: https://github.com/pdtribe181-prog/-modular-saas-platform
2. Click **Settings** (top menu bar)
3. Click **Secrets and variables** → **Actions** (left sidebar)

### Step 2: Add Backend Secret

1. Click **New repository secret** button
2. **Name:** `RENDER_DEPLOY_HOOK_BACKEND`
3. **Value:** Paste your backend deploy hook URL
4. Click **Add secret**

### Step 3: Add Frontend Secret

1. Click **New repository secret** button
2. **Name:** `RENDER_DEPLOY_HOOK_FRONTEND`
3. **Value:** Paste your frontend deploy hook URL
4. Click **Add secret**

### Step 4: Verify

You should see **2 secrets** listed:
- ✅ RENDER_DEPLOY_HOOK_BACKEND
- ✅ RENDER_DEPLOY_HOOK_FRONTEND

---

## Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│                 GitHub Secrets Needed                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Secret 1: RENDER_DEPLOY_HOOK_BACKEND                      │
│  ├─ Get from: Render Dashboard → Backend Service           │
│  ├─ Go to: Settings → Deploy Hook                          │
│  ├─ Format: https://api.render.com/deploy/srv-...          │
│  └─ Used for: Triggering backend deployment                │
│                                                             │
│  Secret 2: RENDER_DEPLOY_HOOK_FRONTEND                     │
│  ├─ Get from: Render Dashboard → Frontend Service          │
│  ├─ Go to: Settings → Deploy Hook                          │
│  ├─ Format: https://api.render.com/deploy/srv-...          │
│  └─ Used for: Triggering frontend deployment               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflow Context

### Where These Secrets Are Used

In `.github/workflows/deploy-render.yml`:

```yaml
deploy:
  steps:
    - name: Trigger Render deployment
      env:
        RENDER_DEPLOY_HOOK_BACKEND: ${{ secrets.RENDER_DEPLOY_HOOK_BACKEND }}
        RENDER_DEPLOY_HOOK_FRONTEND: ${{ secrets.RENDER_DEPLOY_HOOK_FRONTEND }}
      run: |
        curl --request POST --url "$RENDER_DEPLOY_HOOK_BACKEND"
        curl --request POST --url "$RENDER_DEPLOY_HOOK_FRONTEND"
```

### What Happens When You Push

```
1. You push code to main branch
        ↓
2. GitHub Actions starts
        ↓
3. test-build job runs (build & test code)
        ↓
4. If tests pass → deploy job runs
        ↓
5. Reads secrets:
   ├─ RENDER_DEPLOY_HOOK_BACKEND
   └─ RENDER_DEPLOY_HOOK_FRONTEND
        ↓
6. Sends POST requests to Render
   ├─ Backend deploy hook (triggers backend rebuild)
   └─ Frontend deploy hook (triggers frontend rebuild)
        ↓
7. Render receives webhooks and rebuilds services
        ↓
8. ✅ New code deployed!
```

---

## Important Notes

### Security

- ✅ **Never** commit deploy hook URLs to your code
- ✅ **Always** store them as GitHub Secrets
- ✅ Secrets are **encrypted** by GitHub
- ✅ You **can't view** them after adding (only update/delete)

### Format Requirements

**Correct Format:**
```
https://api.render.com/deploy/srv-abc123def456?key=xyz789
```

**Common Mistakes to Avoid:**
```
❌ Missing https://
❌ Incomplete URL
❌ Extra spaces
❌ Wrong service ID
```

### What These Are NOT

These secrets are **NOT**:
- ❌ Render API keys
- ❌ Database connection strings
- ❌ Environment variables for your app
- ❌ JWT secrets

They are **ONLY** for triggering deployments from GitHub Actions.

---

## Verification Checklist

### Before Adding Secrets

- [ ] I have a Render account
- [ ] I have a backend service on Render
- [ ] I have a frontend service on Render
- [ ] I can access both services' settings
- [ ] I have deploy hooks enabled on both

### After Adding Secrets

- [ ] RENDER_DEPLOY_HOOK_BACKEND is in GitHub secrets
- [ ] RENDER_DEPLOY_HOOK_FRONTEND is in GitHub secrets
- [ ] Both secrets show in the Actions secrets list
- [ ] No typos in secret names
- [ ] URLs are complete and valid

### Test Deployment

- [ ] Push a change to main branch
- [ ] Check GitHub Actions runs
- [ ] Verify deploy job executes
- [ ] Check Render dashboard for deployments
- [ ] Confirm services rebuild

---

## Troubleshooting

### Secret Not Working

**Check:**
1. Secret name exactly matches: `RENDER_DEPLOY_HOOK_BACKEND` or `RENDER_DEPLOY_HOOK_FRONTEND`
2. No extra spaces in name
3. URL is complete (starts with https://)
4. Deploy hook is active on Render

### Deployment Not Triggering

**Check:**
1. Push went to `main` branch (not other branches)
2. test-build job passed successfully
3. Secrets are added in GitHub
4. Workflow file is correct

### Wrong Service Deploying

**Check:**
1. Backend URL goes to RENDER_DEPLOY_HOOK_BACKEND
2. Frontend URL goes to RENDER_DEPLOY_HOOK_FRONTEND
3. Not mixed up

---

## Quick Reference

### GitHub Secrets URL
https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions

### Render Dashboard
https://dashboard.render.com

### Secrets Needed
- `RENDER_DEPLOY_HOOK_BACKEND`
- `RENDER_DEPLOY_HOOK_FRONTEND`

### Time to Setup
- Get URLs: 5 minutes
- Add secrets: 5 minutes
- **Total: 10 minutes**

---

## Summary

```
┌───────────────────────────────────────────────────┐
│         GITHUB SECRETS REQUIRED                   │
├───────────────────────────────────────────────────┤
│ Total Secrets Needed:              2              │
│                                                   │
│ Secret 1: RENDER_DEPLOY_HOOK_BACKEND             │
│ Secret 2: RENDER_DEPLOY_HOOK_FRONTEND            │
│                                                   │
│ Where to Get:   Render Dashboard → Settings      │
│ Where to Add:   GitHub Settings → Secrets        │
│ Time Required:  10 minutes                       │
│                                                   │
│ Status: ⏳ Pending Your Action                   │
└───────────────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ **Read this document** (you're here!)
2. ⏳ **Get backend deploy hook URL** from Render
3. ⏳ **Get frontend deploy hook URL** from Render
4. ⏳ **Add both secrets** to GitHub
5. ⏳ **Test** by pushing to main
6. ✅ **Done!** Automatic deployment active

---

*Last Updated: October 18, 2025*  
*Secrets Required: 2*  
*Setup Time: 10 minutes*  
*Status: Ready to Configure*
