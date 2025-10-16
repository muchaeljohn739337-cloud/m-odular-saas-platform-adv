# 🔐 Secrets Management Guide
*For Advancia Pay Ledger Project*

---

## 📋 Overview

This project uses Base64-encoded files to safely store and transport environment variables. This is useful for:
- ✅ Moving secrets between machines
- ✅ Storing in password managers
- ✅ Sharing with team securely
- ✅ Backup before fresh installs

---

## 🔒 Encrypt-Secrets.ps1

### What it does:
Converts your environment variables to Base64 and saves them to a timestamped file.

### Usage:

```powershell
.\Encrypt-Secrets.ps1
```

### Two modes:

**1. From existing .env file:**
- Automatically detects `.\backend\.env`
- Encrypts all variables found
- Quick and easy!

**2. Manual entry:**
- Prompts for DATABASE_URL, JWT_SECRET, REDIS_URL
- Enter values interactively
- Good for first-time setup

### Output:
Creates: `encrypted_secrets_2025-10-15_13-55-16.env`

---

## 🔓 Decrypt-Secrets.ps1

### What it does:
Restores your original environment variables from encrypted files.

### Usage:

```powershell
.\Decrypt-Secrets.ps1
```

### Features:
- 📁 Auto-detects all encrypted files
- 🕐 Shows timestamps if multiple files exist
- 📺 Displays decrypted values on screen
- 💾 Option to save to `.\backend\.env`
- 📦 Backs up existing .env before overwriting

---

## 🛡️ Security Best Practices

### ✅ DO:
- Store encrypted files in password manager (1Password, Bitwarden, etc.)
- Keep encrypted files in secure cloud storage (OneDrive Personal Vault, etc.)
- Use these for migrating between dev environments
- Verify `.gitignore` protects these files

### ❌ DON'T:
- Commit encrypted files to Git (protected by .gitignore)
- Share via unencrypted email or messaging
- Treat as "secure" - Base64 is encoding, not encryption!
- Store in public locations

---

## 🔄 Common Workflows

### 1️⃣ New Machine Setup:
```powershell
# Copy encrypted file from password manager
.\Decrypt-Secrets.ps1
# Select your file
# Choose 'y' to save to backend\.env
```

### 2️⃣ Backup Current Secrets:
```powershell
.\Encrypt-Secrets.ps1
# Choose 'y' to use existing .env
# Store output file in password manager
```

### 3️⃣ Update Secrets:
```powershell
# Edit backend\.env manually
.\Encrypt-Secrets.ps1
# Choose 'y' to encrypt updated file
```

---

## 📝 Manual Decode (Quick Reference)

If you need to decode a single value quickly:

```powershell
[System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("YOUR_BASE64_STRING_HERE"))
```

---

## 🗂️ File Protection

Your `.gitignore` includes:
```
encrypted_secrets_*.env
.env
.env.local
```

These files will **never** be committed to Git.

---

## 🚀 For Production

**Important:** This is for development only!

For production environments, use:
- 🔐 **Azure Key Vault**
- 🔐 **AWS Secrets Manager**
- 🔐 **GitHub Secrets** (for CI/CD)
- 🔐 **Environment variables** in your hosting platform

---

## 📞 Quick Help

| Task | Command |
|------|---------|
| Encrypt current .env | `.\Encrypt-Secrets.ps1` |
| Decrypt to .env | `.\Decrypt-Secrets.ps1` |
| View encrypted files | `Get-ChildItem encrypted_secrets_*.env` |
| Delete old encrypted files | `Remove-Item encrypted_secrets_*.env` |

---

**Last Updated:** October 15, 2025  
**Project:** Advancia Pay Ledger - Modular SaaS Platform
