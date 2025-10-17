# 🔐 Backup Authentication Tokens (KEEP SECURE!)

## ⚠️ IMPORTANT SECURITY NOTES

**These tokens are for emergency/recovery purposes ONLY:**
- ✅ Store in encrypted format
- ✅ Never commit to GitHub
- ✅ Only share via secure channels
- ✅ Rotate regularly
- ❌ Never use in production code directly
- ❌ Never log or display these tokens

---

## 📋 Your Backup Tokens

Store these in `backend/.env.backup` (NOT in Git):

```env
# Backup Authentication Tokens (For Recovery/Emergency Use)
BACKUP_TOKEN_1=37242004
BACKUP_TOKEN_2=71294384
BACKUP_TOKEN_3=48334941
BACKUP_TOKEN_4=20312906
BACKUP_TOKEN_5=82373992
BACKUP_TOKEN_6=69498131
BACKUP_TOKEN_7=57083253
BACKUP_TOKEN_8=05483717
```

---

## 🛡️ How to Use Backup Tokens Safely

### **Option 1: Emergency Authentication Endpoint** (Recommended)

Add to `backend/src/routes/auth.ts`:

```typescript
// Emergency backup authentication (for recovery only)
router.post("/auth/emergency-login", async (req, res) => {
  const { token } = req.body;
  
  const backupTokens = [
    process.env.BACKUP_TOKEN_1,
    process.env.BACKUP_TOKEN_2,
    process.env.BACKUP_TOKEN_3,
    process.env.BACKUP_TOKEN_4,
    process.env.BACKUP_TOKEN_5,
    process.env.BACKUP_TOKEN_6,
    process.env.BACKUP_TOKEN_7,
    process.env.BACKUP_TOKEN_8,
  ];
  
  if (!backupTokens.includes(token)) {
    return res.status(401).json({ error: "Invalid backup token" });
  }
  
  // Log emergency access
  console.log("⚠️ EMERGENCY LOGIN USED - Review immediately!");
  
  // Return temporary JWT
  const jwtToken = jwt.sign(
    { emergency: true, timestamp: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Short expiry for safety
  );
  
  return res.json({
    token: jwtToken,
    warning: "Emergency access - valid for 1 hour only",
    expiresIn: "1h"
  });
});
```

### **Option 2: Use as Admin Override Keys**

Add to middleware:

```typescript
const isBackupToken = (token: string): boolean => {
  const backupTokens = [
    process.env.BACKUP_TOKEN_1,
    process.env.BACKUP_TOKEN_2,
    // ... rest
  ];
  return backupTokens.includes(token);
};

app.use((req, res, next) => {
  const adminToken = req.headers["x-admin-token"];
  
  if (adminToken && isBackupToken(adminToken as string)) {
    req.user = { admin: true, emergency: true };
    console.warn("🔴 ADMIN OVERRIDE USED");
  }
  
  next();
});
```

---

## 📝 Setup Steps

### Step 1: Create .env.backup File

```bash
# DO NOT COMMIT THIS FILE!
cat > backend/.env.backup << 'EOF'
BACKUP_TOKEN_1=37242004
BACKUP_TOKEN_2=71294384
BACKUP_TOKEN_3=48334941
BACKUP_TOKEN_4=20312906
BACKUP_TOKEN_5=82373992
BACKUP_TOKEN_6=69498131
BACKUP_TOKEN_7=57083253
BACKUP_TOKEN_8=05483717
EOF
```

### Step 2: Update .gitignore

Add to `backend/.gitignore`:

```
# Backup tokens - NEVER commit!
.env.backup
.env.*.backup
backup-tokens.txt
tokens.backup
```

### Step 3: Load in Code Only if Needed

In `backend/src/config/index.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";

// Load backup tokens from .env.backup if it exists
function loadBackupTokens() {
  const backupPath = path.join(__dirname, "../../.env.backup");
  if (fs.existsSync(backupPath)) {
    const content = fs.readFileSync(backupPath, "utf-8");
    // Parse and load into process.env if needed for recovery
  }
}

export { loadBackupTokens };
```

### Step 4: Store Securely (Not in Code!)

**Option A: Use Render Secrets**
1. Go to Render Dashboard → Settings → Secrets
2. Add each backup token as a secret variable
3. Reference in code: `process.env.BACKUP_TOKEN_1`

**Option B: Use Encrypted File** (Recommended)
1. Use git-crypt or similar
2. Encrypt .env.backup before committing
3. Only decrypt when needed

**Option C: Use LastPass/1Password**
1. Store tokens in password manager
2. Reference locally only during development

---

## 🧪 Test Backup Login

```powershell
# Test with backup token
$body = @{
    token = "37242004"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/auth/emergency-login" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

Expected response:
```json
{
  "token": "eyJhbGc...",
  "warning": "Emergency access - valid for 1 hour only",
  "expiresIn": "1h"
}
```

---

## 📊 Backup Token Security Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| Storage | ✅ | .env.backup (not in Git) |
| Encryption | ⚠️ | Consider git-crypt |
| Expiry | ✅ | 1-hour JWT after backup token use |
| Audit | ✅ | Log all emergency access |
| Rotation | ⚠️ | Rotate every 90 days |
| Access | 🔴 | Admin/Emergency only |

---

## 🚨 Emergency Use Checklist

If you need to use backup tokens:

- [ ] Verify the emergency reason
- [ ] Check server logs for suspicious activity
- [ ] Use token only once
- [ ] Change all passwords immediately after
- [ ] Notify your team
- [ ] Generate new backup tokens
- [ ] Review security practices

---

## 🔄 Rotate Backup Tokens Regularly

Run this every 90 days:

```powershell
# Generate new backup tokens
.\Generate-APIKeys.ps1

# Update in Render Secrets
# Update in .env.backup

# Invalidate old tokens
# Restart services
```

---

## 📍 Files to Update

- `backend/.env.backup` - Store backup tokens locally
- `backend/.gitignore` - Add .env.backup
- `backend/src/routes/auth.ts` - Add emergency endpoint
- `backend/src/config/index.ts` - Load backup tokens safely

