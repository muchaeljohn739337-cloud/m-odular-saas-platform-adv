# 🚀 GitHub Secrets Upload Guide

## Complete Setup for GitHub Integration

---

## ⚡ Quick Start (3 Steps)

### **Step 1: Install GitHub CLI** ✅ DONE!
The GitHub CLI has been installed. You need to **restart your terminal** for it to work.

### **Step 2: Authenticate with GitHub**
After restarting your terminal, run:
```powershell
gh auth login
```

**Follow the prompts:**
1. Choose: **GitHub.com**
2. Protocol: **HTTPS** (recommended)
3. Authenticate: **Login with a web browser**
4. Copy the one-time code shown
5. Press Enter to open browser
6. Paste code and authorize

### **Step 3: Upload Your Secrets**
```powershell
.\Manage-Secrets.ps1
```
Choose option **3** and enter your repo name!

---

## 📋 Full Workflow

### **Option 1: Upload After Encrypt**
```powershell
.\Manage-Secrets.ps1
```
1. Press `1` (Encrypt)
2. When asked "Upload to GitHub?", press `y`
3. Enter your repo: `pdtribe181/modular-saas-platform`
4. Done! ✅

### **Option 2: Direct Upload**
```powershell
.\Manage-Secrets.ps1
```
1. Press `3` (Upload to GitHub)
2. Enter your repo: `pdtribe181/modular-saas-platform`
3. Done! ✅

---

## 🔍 Verify Setup

### Check if GitHub CLI is installed:
```powershell
gh --version
```
**Expected output:** `gh version 2.81.0 (or newer)`

### Check authentication status:
```powershell
gh auth status
```
**Expected output:** 
```
✓ Logged in to github.com as YOUR_USERNAME
✓ Token: ***********************************
```

---

## 🎯 What Gets Uploaded?

All variables from your `.\backend\.env` file become GitHub repository secrets:

**Your secrets:**
- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- Any other variables you add

**Where they're available:**
- ✅ GitHub Actions workflows
- ✅ GitHub Codespaces
- ✅ Protected and encrypted by GitHub

---

## 💡 Using Secrets in GitHub Actions

After upload, use them in your workflows:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy with secrets
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          REDIS_URL: ${{ secrets.REDIS_URL }}
        run: |
          echo "Deploying with secure secrets..."
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Upload production secrets only to private repositories
- Use different secrets for dev/staging/production
- Rotate secrets regularly
- Review who has repository access

### ❌ DON'T:
- Upload to public repositories (unless intended for CI/CD)
- Share repository secrets via screenshots
- Use the same secrets across multiple projects
- Commit `.env` files to Git (protected by `.gitignore`)

---

## 🛠️ Troubleshooting

### Problem: `gh: command not found`
**Solution:** Restart your terminal after installation
```powershell
# Close and reopen PowerShell
gh --version
```

### Problem: `Not authenticated`
**Solution:** Login first
```powershell
gh auth login
```

### Problem: `Repository not found`
**Solution:** Check repo name format
- ✅ Correct: `username/repo-name`
- ❌ Wrong: `github.com/username/repo-name`
- ❌ Wrong: `https://github.com/username/repo-name`

### Problem: Permission denied
**Solution:** Make sure you have admin access to the repository

---

## 📱 Managing Secrets on GitHub

### View your secrets:
1. Go to your repository on GitHub.com
2. Click **Settings** → **Secrets and variables** → **Actions**
3. See all uploaded secrets

### Update a secret:
```powershell
gh secret set SECRET_NAME -b"new_value" -R username/repo
```

### Delete a secret:
```powershell
gh secret delete SECRET_NAME -R username/repo
```

### List all secrets:
```powershell
gh secret list -R username/repo
```

---

## 🎮 Quick Commands Reference

| Command | Description |
|---------|-------------|
| `gh auth login` | Authenticate with GitHub |
| `gh auth status` | Check authentication |
| `gh auth logout` | Logout from GitHub |
| `gh secret list -R repo` | List all secrets |
| `gh secret set NAME -R repo` | Set a secret |
| `gh secret delete NAME -R repo` | Delete a secret |

---

## 🚀 Next Steps

1. **Restart your terminal** (important!)
2. Run: `gh auth login`
3. Run: `.\Manage-Secrets.ps1`
4. Choose option **3**
5. Enter: `pdtribe181/modular-saas-platform`
6. ✅ Your secrets are now on GitHub!

---

**Last Updated:** October 15, 2025  
**Project:** Advancia Pay Ledger - Modular SaaS Platform  
**GitHub CLI:** v2.81.0
