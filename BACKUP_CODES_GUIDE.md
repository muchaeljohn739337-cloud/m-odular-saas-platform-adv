# 🔐 Backup Keys - Quick Reference

## ✅ Your Backup Keys Are Secure!

**File Location**: `AUTH_BACKUP_KEYS.md`  
**Status**: ✅ Protected (not tracked by Git)  
**Total Codes**: 8  
**Date**: October 18, 2025

---

## 🎯 What You Need to Know

### These are your **emergency backup codes** for:
- 🌐 **Platform**: Advancia Pay Ledger
- 🔗 **Domain**: advanciapayledger.com
- 🔐 **Purpose**: Account recovery when you can't access normal login

### Each code can be used **ONCE** - use them wisely!

---

## 💾 Next Steps (Important!)

### 1. **Save to Password Manager** (5 min)
```
✅ Recommended: 1Password, Bitwarden, LastPass
✅ Create secure note titled "Advancia Backup Codes"
✅ Copy all 8 codes
✅ Add creation date and context
```

### 2. **Print Physical Copy** (2 min)
```
✅ Print AUTH_BACKUP_KEYS.md
✅ Store in safe/lockbox
✅ Label: "Advancia Backup - DO NOT SHARE"
```

### 3. **Create Encrypted Backup** (3 min)
```powershell
# Option A: Simple encryption
Compress-Archive AUTH_BACKUP_KEYS.md backup-codes.zip
# Then password protect the zip in 7-Zip or WinRAR

# Option B: GPG encryption (if installed)
gpg --symmetric --cipher-algo AES256 AUTH_BACKUP_KEYS.md
```

---

## 🚨 When to Use These Codes

### Use a backup code when:
- 📱 Your phone is lost/stolen (can't receive SMS OTP)
- 📧 Email account is inaccessible
- 🔑 2FA device is unavailable
- 🆘 Emergency account access needed

### How to use:
1. Go to: `https://advanciapayledger.com/auth/login`
2. Click **"Use backup code"** or **"Can't access authenticator?"**
3. Enter one of your 8 codes
4. Gain immediate access
5. Code is automatically invalidated

---

## 🛡️ Security Status

| Item | Status |
|------|--------|
| File Created | ✅ October 18, 2025 |
| Git Protection | ✅ Added to .gitignore |
| Password Manager | ⏳ **Action Required** |
| Physical Backup | ⏳ **Action Required** |
| Encrypted Backup | ⏳ **Action Required** |

---

## ⚠️ Critical Reminders

### DO ✅:
- Keep codes in password manager
- Print and store in safe place
- Create encrypted backups
- Test one code to verify it works

### DON'T ❌:
- Share codes with anyone
- Email to yourself
- Store in plain text cloud storage
- Commit to Git (already protected)
- Post in Slack/Discord/Teams

---

## 🔄 When Codes Run Low

**Generate new codes when you have 4 or fewer remaining:**

1. Login to your account
2. Go to **Settings → Security**
3. Click **"Generate New Backup Codes"**
4. Save new codes using same secure methods
5. Old codes are automatically invalidated

---

## 📞 Lost All Access?

If you lose access AND all backup codes:

**Contact Support**:
- Email: support@advanciapayledger.com
- Subject: "Account Recovery Request"
- Include: Account email, last login date, transaction history

**Recovery Process**:
- Identity verification required
- May take 24-48 hours
- Additional documentation may be needed

---

## ✅ Complete These Actions Now

- [ ] Open `AUTH_BACKUP_KEYS.md` and review all codes
- [ ] Save codes in password manager
- [ ] Print physical copy and secure it
- [ ] Create encrypted backup
- [ ] Test one code (optional, saves 1 code)
- [ ] Set calendar reminder to review in 6 months
- [ ] Tell no one about these codes (keep secret!)

---

## 📁 File Locations

**Main File**: `AUTH_BACKUP_KEYS.md` (this directory)  
**Git Status**: Ignored (won't be committed)  
**This Guide**: `BACKUP_KEYS_QUICK_GUIDE.md`

---

**🔒 Remember: These codes are as important as your password!**

**Keep them secure and never share publicly!** 🛡️

---

**Created**: October 18, 2025  
**Platform**: Advancia Pay Ledger  
**Domain**: advanciapayledger.com  
**Codes**: 8 active codes
