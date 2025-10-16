# 🔐 Quick Start Guide - Manage-Secrets.ps1

## Unified Secret Management Tool

Single script to handle encryption, decryption, and GitHub upload of your environment secrets!

---

## 📋 Usage

### Run the script:
```powershell
.\Manage-Secrets.ps1
```

### When prompted, enter:
- **Type `1`** → Encrypt mode (.env → encrypted file) + optional GitHub upload
- **Type `2`** → Decrypt mode (encrypted file → .env)
- **Type `3`** → Upload secrets directly to GitHub repository

---

## 🔐 Mode 1: Encrypt (+ Optional GitHub Upload)

**What it does:**
- Reads your `.\backend\.env` file
- Converts all variables to Base64
- Saves to timestamped file: `encrypted_secrets_2025-10-15_14-30-22.env`
- **NEW:** Optionally uploads to GitHub repository secrets

**Example:**
```
Choose mode: 
1️⃣ Encrypt (.env → encrypted file)
2️⃣ Decrypt (encrypted file → .env)
3️⃣ Upload secrets to GitHub repository

Enter 1, 2, or 3: 1

 Reading from .\backend\.env...
✅ Encrypted secrets saved as encrypted_secrets_2025-10-15_14-30-22.env
🗝 Store it safely (password manager, encrypted drive, etc).

🚀 Upload secrets to your GitHub repository? (y/n): y
Enter your GitHub repo (e.g., username/repo): pdtribe181/modular-saas-platform
🛠 Adding secret: DATABASE_URL ...
🛠 Adding secret: JWT_SECRET ...
🛠 Adding secret: REDIS_URL ...
✅ All secrets uploaded securely to GitHub repository pdtribe181/modular-saas-platform
```

---

## 🔓 Mode 2: Decrypt

**What it does:**
- Prompts for encrypted file name
- Restores secrets to `.\backend\.env`

**Example:**
```
Enter 1, 2, or 3: 2

Enter encrypted file name: encrypted_secrets_2025-10-15_14-30-22.env
✅ Secrets successfully restored to .\backend\.env
```

---

## 🚀 Mode 3: Upload to GitHub (NEW!)

**What it does:**
- Uploads all secrets from `.\backend\.env` directly to GitHub
- Makes them available in GitHub Actions & Codespaces
- Checks authentication automatically

**Prerequisites:**
1. GitHub CLI installed (run `setup-github.bat` to install)
2. Authenticated with GitHub (run `gh auth login`)

**Example:**
```
Enter 1, 2, or 3: 3

📦 Found GitHub CLI: gh version 2.81.0
🔍 Checking GitHub authentication...
✅ Authenticated with GitHub

Enter your GitHub repo (e.g., username/repo): pdtribe181/modular-saas-platform

🚀 Uploading secrets to pdtribe181/modular-saas-platform...
🛠  Setting secret: DATABASE_URL ...
🛠  Setting secret: JWT_SECRET ...
�  Setting secret: REDIS_URL ...

✅ Upload complete!
   Successfully uploaded: 3 secret(s)

💡 These secrets are now available in:
   • GitHub Actions workflows
   • GitHub Codespaces
```

---

## 🎯 Features

### Smart File Detection
- Auto-detects encrypted files
- Handles Base64 encoding/decoding
- **NEW:** GitHub CLI integration

### GitHub Integration
- ✅ Direct upload to repository secrets
- ✅ Auto-checks authentication
- ✅ Works with Actions & Codespaces
- ✅ Secure encrypted storage on GitHub

### Safety First
- ✅ Protected by .gitignore
- ✅ Clear success/error messages
- ✅ Counts secrets processed
- ✅ GitHub handles encryption at rest

### Flexible Workflow
- Encrypt → Store locally → Upload to GitHub
- Or upload directly without encryption file
- Your choice!

---

## 💡 Common Scenarios

### 1. First Time Setup (New Machine)
```powershell
# Copy encrypted file from password manager to project folder
.\Manage-Secrets.ps1
# Choose: 2
# Enter encrypted filename
# Secrets restored to backend\.env
```

### 2. Backup Current Secrets
```powershell
.\Manage-Secrets.ps1
# Choose: 1
# Script reads backend\.env automatically
# Save output file to password manager
```

### 3. Upload to GitHub for CI/CD
```powershell
# First time: Authenticate
.\setup-github.bat  # or: gh auth login

# Then upload
.\Manage-Secrets.ps1
# Choose: 3
# Enter: pdtribe181/modular-saas-platform
# Secrets now available in Actions/Codespaces!
```

### 4. Encrypt + Upload in One Go
```powershell
.\Manage-Secrets.ps1
# Choose: 1
# Press 'y' when asked about GitHub upload
# Enter: pdtribe181/modular-saas-platform
# Done! Encrypted locally AND uploaded to GitHub
```

---

## 🛡️ Security Notes

**✅ Safe Operations:**
- Encrypted files use Base64 encoding
- Protected by .gitignore (won't commit)
- Backup created automatically
- Files timestamped for version control

**⚠️ Remember:**
- Base64 is **encoding**, not encryption
- Treat encrypted files as sensitive
- Store in password manager or secure location
- Don't share via unencrypted channels

---

## 📂 File Structure

After running, you'll have:
```
your-project/
├── Manage-Secrets.ps1              ← The unified tool
├── encrypted_secrets_*.env         ← Encrypted backups
└── backend/
    ├── .env                        ← Active secrets
    └── .env.backup                 ← Auto-backup
```

---

## 🆚 vs Individual Scripts

You also have standalone scripts:
- `Encrypt-Secrets.ps1` - Encryption only
- `Decrypt-Secrets.ps1` - Decryption only

**Use `Manage-Secrets.ps1` when:**
- ✅ You want a simple menu interface
- ✅ You're switching between encrypt/decrypt often
- ✅ You prefer one tool for everything

**Use individual scripts when:**
- ✅ You only need one operation
- ✅ You're automating with other scripts
- ✅ You prefer specialized tools

---

## 🚀 Quick Reference

| Task | Steps |
|------|-------|
| **Encrypt** | `.\Manage-Secrets.ps1` → `1` |
| **Decrypt** | `.\Manage-Secrets.ps1` → `2` → Enter filename |
| **Upload to GitHub** | `.\Manage-Secrets.ps1` → `3` → Enter repo |
| **Encrypt + Upload** | `.\Manage-Secrets.ps1` → `1` → `y` → Enter repo |
| **Setup GitHub CLI** | `.\setup-github.bat` or `gh auth login` |
| **Check GitHub auth** | `gh auth status` |
| **View secrets on GitHub** | Go to repo → Settings → Secrets → Actions |

---

## 🔧 GitHub CLI Setup

### Quick Setup:
```powershell
# Option 1: Use the helper script
.\setup-github.bat

# Option 2: Manual setup
gh auth login
```

### Verify Setup:
```powershell
gh --version      # Check installation
gh auth status    # Check authentication
```

**Need help?** See `GITHUB_SECRETS_SETUP.md` for detailed instructions.

---

**Created:** October 15, 2025  
**Project:** Advancia Pay Ledger - Modular SaaS Platform  
**Note:** For production, use proper secret management (Azure Key Vault, AWS Secrets Manager, etc.)
