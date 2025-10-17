# 🔑 Render Deploy Key Setup Guide

## Problem
Render cannot automatically deploy because it doesn't have permission to access your GitHub repository.

## ✅ Solution: Add Deploy Key to GitHub

### Step 1: Get Deploy Key from Render Dashboard

1. Go to: https://dashboard.render.com
2. Select your **Backend service** (advancia-backend)
3. Go to **Settings** tab
4. Look for **"Deploy Key"** section
5. **Copy the entire SSH public key** (starts with `ssh-rsa`)

### Step 2: Add Deploy Key to GitHub Repository

1. Go to: https://github.com/pdtribe181-prog/-modular-saas-platform
2. Click **Settings** (top right)
3. Go to **Deploy keys** (left sidebar, under Security section)
4. Click **Add deploy key** button
5. **Title:** `Render Backend Deploy Key`
6. **Key:** Paste the entire SSH key from Step 1
7. ✅ Check: **"Allow write access"** (required for GitHub Actions)
8. Click **Add key**

### Step 3: Repeat for Frontend Service

1. Select your **Frontend service** (advancia-frontend) in Render
2. Go to **Settings** → **Deploy Key**
3. Copy that SSH public key
4. Go back to GitHub → **Settings** → **Deploy keys**
5. Click **Add deploy key** button
6. **Title:** `Render Frontend Deploy Key`
7. **Key:** Paste the SSH key
8. ✅ Check: **"Allow write access"**
9. Click **Add key**

### Step 4: Test the Connection

1. Go back to Render Dashboard
2. For each service, click **Manual Deploy** button
3. Watch the build logs
4. Should see: `✅ Connected to GitHub` and start building

### What You'll See After Setup

```
✅ Cloning repository...
✅ Installing dependencies...
✅ Building project...
✅ Running tests...
✅ Deploying...
```

---

## 🚀 After Deploy Key is Set Up

**Automatic deployments will work like this:**

1. You push code: `git push origin main`
2. GitHub notifies Render (via webhook)
3. Render automatically:
   - ✅ Clones your repo using the deploy key
   - ✅ Installs dependencies
   - ✅ Builds your project
   - ✅ Runs tests
   - ✅ Deploys to production

**No more manual deploys needed!** 🎉

---

## ❓ Common Issues

### "Deploy key not found in Settings"
- Reload the Render dashboard page
- Check you're on the correct service
- Try viewing the service in a new tab

### "Key already exists"
- GitHub won't let you add the same key twice
- Remove old key first, then add the new one

### "Permission denied (publickey)"
- Make sure "Allow write access" is checked on GitHub
- Delete and re-add the key

---

## 📍 Quick Links

- Render Dashboard: https://dashboard.render.com
- GitHub Deploy Keys: https://github.com/pdtribe181-prog/-modular-saas-platform/settings/keys
- Backend Service: https://dashboard.render.com/services/srv-xxx (find in your dashboard)
- Frontend Service: https://dashboard.render.com/services/srv-xxx (find in your dashboard)

---

## ✨ Result

Once deploy keys are set up:
- ✅ Backend auto-deploys when you push to main
- ✅ Frontend auto-deploys when you push to main  
- ✅ GitHub Actions tests run automatically
- ✅ Login system goes live automatically!
- ✅ Users can login! 🎉

