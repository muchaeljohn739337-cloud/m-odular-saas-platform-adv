# 🎯 Quick Deployment Commands

**Last Updated:** October 18, 2025

---

## 📊 Check Deployment Status

### Quick Status Check
```powershell
.\Check-Deployment-Status.ps1
```

Shows:
- ✅ Recent workflow runs with status
- ⏳ Currently running deployments
- ❌ Any failed deployments
- 🔑 GitHub secrets verification

---

## 👀 Watch Live Deployment

### Real-time Monitoring
```powershell
gh run watch
```
- Shows live logs as workflow runs
- Press `Ctrl+C` to exit

### List Recent Runs
```powershell
gh run list --limit 10
```

### View Specific Run
```powershell
gh run view <RUN_ID>
```

### View Failed Run Logs
```powershell
gh run view <RUN_ID> --log-failed
```

---

## 🚀 Deploy Your Changes

### Standard Deployment Flow
```powershell
# 1. Make your changes to the code

# 2. Add all changes
git add .

# 3. Commit with descriptive message
git commit -m "Your descriptive message"

# 4. Push to main branch (triggers auto-deploy!)
git push origin main

# 5. Watch deployment
gh run watch
# OR
.\Check-Deployment-Status.ps1
```

### Deploy Only Backend
```powershell
# Make changes ONLY in backend/ folder
git add backend/
git commit -m "Backend changes"
git push origin main

# Only backend workflow will trigger!
```

### Deploy Only Frontend
```powershell
# Make changes ONLY in frontend/ folder
git add frontend/
git commit -m "Frontend changes"
git push origin main

# Only frontend workflow will trigger!
```

---

## 🔄 Manual Deploy Trigger

### Using GitHub CLI
```powershell
# Trigger backend deploy manually
gh workflow run deploy-backend.yml

# Trigger frontend deploy manually
gh workflow run deploy-frontend.yml
```

### Using Render Dashboard
1. Go to https://dashboard.render.com
2. Select your service
3. Click **Manual Deploy**
4. Select **Deploy latest commit**

---

## 🛠️ Troubleshooting Commands

### Check Workflow Status
```powershell
# List all workflows
gh workflow list

# View workflow details
gh workflow view deploy-backend.yml
gh workflow view deploy-frontend.yml
```

### Rerun Failed Workflow
```powershell
# Get the run ID from `gh run list`
gh run rerun <RUN_ID>
```

### Cancel Running Workflow
```powershell
gh run cancel <RUN_ID>
```

### Check Secrets
```powershell
# List all GitHub secrets
gh secret list

# Add/update secret
gh secret set SECRET_NAME
# Paste value when prompted

# Delete secret
gh secret delete SECRET_NAME
```

---

## 📋 Useful One-Liners

### Quick Status
```powershell
gh run list --limit 5 --json status,conclusion,workflowName --jq '.[] | "[\(.status)] \(.workflowName) - \(.conclusion // "running")"'
```

### Check Latest Deploy Status
```powershell
gh run view --log
```

### View GitHub Actions URL
```powershell
echo "https://github.com/pdtribe181-prog/-modular-saas-platform/actions"
```

### View Render Dashboard URL
```powershell
echo "https://dashboard.render.com"
```

---

## 🎨 Example Workflows

### Fix a Bug and Deploy
```powershell
# Fix the bug in your code
# Test locally: npm run dev

# Commit and deploy
git add .
git commit -m "🐛 Fix: Issue with user login"
git push origin main

# Monitor
gh run watch
```

### Add New Feature
```powershell
# Create feature branch (optional but recommended)
git checkout -b feature/new-dashboard

# Make changes, test locally
npm run dev

# Commit
git add .
git commit -m "✨ Add: New dashboard analytics"

# Push feature branch
git push origin feature/new-dashboard

# Create PR on GitHub, review, then merge to main
# Merge will trigger auto-deploy!
```

### Update Dependencies
```powershell
# Update package
cd frontend  # or backend
npm install ethers@latest

# Commit package.json and package-lock.json
cd ..
git add frontend/package.json frontend/package-lock.json
git commit -m "⬆️ Update: ethers to latest version"
git push origin main

# Auto-deploys with new dependencies!
```

### Hotfix Production Issue
```powershell
# Make urgent fix
# Test quickly: npm run dev

# Quick commit and deploy
git add .
git commit -m "🔥 Hotfix: Critical security patch"
git push origin main

# Watch closely
gh run watch
```

---

## 🎯 Deployment Timing

### GitHub Actions (CI/CD)
- **Checkout & Setup**: ~30 seconds
- **Install Dependencies**: ~1-2 minutes
- **Prisma Generate**: ~10 seconds (backend only)
- **Trigger Deploy**: ~5 seconds
- **Total GitHub**: ~2-3 minutes

### Render Build & Deploy
- **Backend**: ~5-10 minutes (includes dependencies, Prisma, DB migrations)
- **Frontend**: ~3-5 minutes (Next.js build)

### Total Pipeline
- **From push to live**: ~7-13 minutes

---

## 🔔 Notifications

### Email Notifications
- GitHub sends email on workflow failure
- Configure in: GitHub Settings → Notifications

### Desktop Notifications (GitHub CLI)
```powershell
# Enable desktop notifications
gh config set prompt disabled

# Get notified when run completes
gh run watch
```

---

## 📊 Monitoring Best Practices

### Before Pushing
1. Test locally with `npm run dev`
2. Check for TypeScript errors: `npm run build`
3. Verify tests pass: `npm test`

### After Pushing
1. Run `gh run watch` immediately
2. Check for errors in logs
3. Verify deployment in Render dashboard
4. Test live site after deployment completes

### Regular Checks
- Run `.\Check-Deployment-Status.ps1` daily
- Review failed deployments weekly
- Update dependencies monthly

---

## 🎉 Quick Reference Card

```
┌─────────────────────────────────────────────┐
│        DEPLOYMENT QUICK COMMANDS            │
├─────────────────────────────────────────────┤
│ Status Check:                               │
│   .\Check-Deployment-Status.ps1             │
│                                             │
│ Deploy Changes:                             │
│   git add . && git commit -m "msg" && \     │
│   git push origin main                      │
│                                             │
│ Watch Deployment:                           │
│   gh run watch                              │
│                                             │
│ View Logs:                                  │
│   gh run view --log                         │
│                                             │
│ List Runs:                                  │
│   gh run list --limit 5                     │
│                                             │
│ Rerun Failed:                               │
│   gh run rerun <ID>                         │
│                                             │
│ Check Secrets:                              │
│   gh secret list                            │
└─────────────────────────────────────────────┘
```

---

## 🔗 Important URLs

- **GitHub Actions**: https://github.com/pdtribe181-prog/-modular-saas-platform/actions
- **Render Dashboard**: https://dashboard.render.com
- **Repo Settings**: https://github.com/pdtribe181-prog/-modular-saas-platform/settings
- **Secrets**: https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions

---

💡 **Pro Tip**: Bookmark this file for quick command reference!

🚀 **Current Status**: Auto-deployment is ACTIVE and WORKING!
