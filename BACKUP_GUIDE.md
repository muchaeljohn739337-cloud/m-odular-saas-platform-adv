# 🗄️ Database Backup & Restore Guide

## Quick Commands

### Create Backup
```powershell
# Basic backup
.\Backup-Database.ps1

# Backup with environment files (USE WITH CAUTION - contains secrets)
.\Backup-Database.ps1 -IncludeEnv

# Verbose output
.\Backup-Database.ps1 -Verbose
```

### Restore Backup
```powershell
# Restore from folder
.\Restore-Database.ps1 -BackupPath ".\backups\2025-10-16_14-30-00"

# Restore from ZIP
.\Restore-Database.ps1 -BackupPath ".\backups\backup-2025-10-16_14-30-00.zip"

# Force restore (skip confirmation)
.\Restore-Database.ps1 -BackupPath ".\backups\2025-10-16_14-30-00" -Force
```

### Import from JSON
```powershell
cd backend
node scripts/import-data.js "../backups/2025-10-16_14-30-00/database/data-export.json"
```

---

## 📋 What Gets Backed Up

### 1. Database Files ✅
- `backend/dev.db` - Main SQLite database
- `backend/dev.db-journal` - Database journal (if exists)

### 2. Schema & Migrations ✅
- `backend/prisma/schema.prisma` - Database schema definition
- `backend/prisma/migrations/` - All migration history

### 3. Configuration Files ✅
- `backend/.env` (REDACTED by default)
- `backend/package.json`
- `backend/tsconfig.json`
- `frontend/.env.local` (REDACTED by default)
- `frontend/package.json`
- `frontend/next.config.js`
- `frontend/tailwind.config.js`
- `docker-compose.yml`

### 4. Utility Scripts ✅
- All PowerShell setup scripts
- Backend Node.js scripts
- Seeding scripts

### 5. Documentation ✅
- All CRYPTO_*.md files
- Setup guides
- API references

### 6. JSON Data Export ✅
- Complete database export in portable JSON format
- Includes: Users, AdminSettings, CryptoOrders, CryptoWithdrawals, Transactions

---

## 🔐 Security Notes

### Environment Variables
By default, `.env` files are **REDACTED** in backups:
```
DATABASE_URL=***REDACTED***
STRIPE_SECRET_KEY=***REDACTED***
```

**To include actual values** (use with extreme caution):
```powershell
.\Backup-Database.ps1 -IncludeEnv
```

⚠️ **WARNING**: Never commit backups with real .env values to Git or share publicly!

### Recommended Security Practices
1. ✅ Store backups on encrypted external drives
2. ✅ Use cloud storage with encryption (Google Drive, OneDrive with encryption)
3. ✅ Keep .env files separate and secure
4. ✅ Test restore process in isolated environment
5. ✅ Rotate backups (keep last 7 days, 4 weeks, 12 months)
6. ❌ Never commit backups to version control
7. ❌ Never share backups via unsecured channels

---

## 📁 Backup Structure

```
backups/
├── 2025-10-16_14-30-00/           # Timestamped backup folder
│   ├── MANIFEST.json               # Backup metadata
│   ├── README.md                   # Restore instructions
│   ├── database/
│   │   ├── dev.db                  # SQLite database
│   │   ├── schema.prisma           # Schema definition
│   │   ├── migrations/             # Migration history
│   │   └── data-export.json        # Portable JSON export
│   ├── config/
│   │   ├── backend/
│   │   │   ├── .env.redacted
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   ├── frontend/
│   │   │   ├── .env.local.redacted
│   │   │   ├── package.json
│   │   │   └── next.config.js
│   │   └── root/
│   │       └── docker-compose.yml
│   ├── scripts/
│   │   ├── Backup-Database.ps1
│   │   ├── Restore-Database.ps1
│   │   └── backend/
│   │       ├── seedAdminSettings.mjs
│   │       └── seedTestData.mjs
│   └── documentation/
│       ├── CRYPTO_SYSTEM_READY.md
│       ├── CRYPTO_QUICK_START.md
│       └── WHATS_NEXT.md
└── backup-2025-10-16_14-30-00.zip  # Compressed archive
```

---

## 🔄 Restore Methods

### Method 1: Full Restore (Recommended)
Restores complete database with all data.

```powershell
# 1. Run restore script
.\Restore-Database.ps1 -BackupPath ".\backups\2025-10-16_14-30-00"

# 2. Manually restore .env files
Copy-Item "your-secure-location\.env" ".\backend\.env"
Copy-Item "your-secure-location\.env.local" ".\frontend\.env.local"

# 3. Start servers
cd backend
npm run dev

cd frontend
npm run dev

# 4. Verify in admin panel
# Open: http://localhost:3000/admin/crypto
```

### Method 2: JSON Import
Imports data into existing database (useful for merging data).

```powershell
# 1. Ensure backend is NOT running
# 2. Run import
cd backend
node scripts/import-data.js "../backups/2025-10-16_14-30-00/database/data-export.json"

# 3. Start backend
npm run dev
```

### Method 3: Fresh Setup from Schema
Rebuilds database from scratch using schema and migrations.

```powershell
# 1. Copy schema
Copy-Item ".\backups\2025-10-16_14-30-00\database\schema.prisma" ".\backend\prisma\schema.prisma"

# 2. Copy migrations
Copy-Item ".\backups\2025-10-16_14-30-00\database\migrations" ".\backend\prisma\migrations" -Recurse -Force

# 3. Reset and migrate
cd backend
npx prisma migrate reset --force

# 4. Import data (optional)
node scripts/import-data.js "../backups/2025-10-16_14-30-00/database/data-export.json"
```

---

## 🔍 Verification After Restore

### 1. Check Database File
```powershell
Test-Path ".\backend\dev.db"
# Should return: True
```

### 2. Check Database Content
```powershell
cd backend
npx prisma studio
# Opens GUI to browse database
```

### 3. Test Backend API
```powershell
# Start backend
cd backend
npm run dev

# Test health endpoint
curl http://localhost:4000/health

# Should return: {"status":"healthy","timestamp":"..."}
```

### 4. Test Admin Panel
1. Open: http://localhost:3000/admin/crypto
2. Check **Settings** tab - should show wallet addresses
3. Check **Orders** tab - should show orders (if any were backed up)
4. Check **Withdrawals** tab - should show withdrawals (if any)

---

## 📅 Backup Schedule Recommendations

### Development
- **Daily**: Before making major changes
- **After**: Successful feature completion
- **Before**: Database migrations

### Production
- **Daily**: Automated backup at 2 AM
- **Weekly**: Full backup with off-site storage
- **Monthly**: Archived backup for compliance
- **Before**: Any deployment or update

### Example Automated Backup (Windows Task Scheduler)
```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\path\to\Backup-Database.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "CryptoSystemBackup" -Description "Daily database backup"
```

---

## 🆘 Troubleshooting

### "Database file is locked"
**Problem**: SQLite database is in use.

**Solution**:
```powershell
# Stop backend server
Get-Process node | Stop-Process -Force

# Try backup again
.\Backup-Database.ps1
```

### "JSON export failed"
**Problem**: Prisma client not generated or database empty.

**Solution**:
```powershell
cd backend
npx prisma generate
.\Backup-Database.ps1
```

### "Restore failed - file not found"
**Problem**: Backup structure incomplete.

**Solution**:
```powershell
# Check backup contents
Get-ChildItem -Path ".\backups\2025-10-16_14-30-00" -Recurse

# Read manifest
Get-Content ".\backups\2025-10-16_14-30-00\MANIFEST.json" | ConvertFrom-Json
```

### "Data not showing after restore"
**Problem**: Frontend cached or database connection issue.

**Solution**:
```powershell
# Clear browser cache (Ctrl+Shift+Delete)
# Hard refresh (Ctrl+F5)

# Restart backend
cd backend
npm run dev
```

---

## 📊 Backup Best Practices

### 1. Test Your Backups
- ✅ Restore in test environment monthly
- ✅ Verify data integrity
- ✅ Test all functionality after restore

### 2. Multiple Backup Locations
- ✅ Local backup on external drive
- ✅ Cloud backup (encrypted)
- ✅ Off-site backup (different physical location)

### 3. Backup Rotation
```
Daily:   Keep last 7 days
Weekly:  Keep last 4 weeks
Monthly: Keep last 12 months
Yearly:  Keep indefinitely (for compliance)
```

### 4. Document Your Process
- ✅ Keep restore instructions accessible
- ✅ Document .env variable locations
- ✅ Test restore procedure with team
- ✅ Update backup scripts as system evolves

---

## 🎯 Quick Reference Card

| Task | Command |
|------|---------|
| **Create backup** | `.\Backup-Database.ps1` |
| **Restore backup** | `.\Restore-Database.ps1 -BackupPath ".\backups\folder"` |
| **Import JSON** | `node scripts/import-data.js "path/to/data-export.json"` |
| **View database** | `npx prisma studio` |
| **Check backup** | `Get-Content ".\backups\folder\MANIFEST.json"` |
| **List backups** | `Get-ChildItem ".\backups" -Directory` |
| **Delete old backups** | `Get-ChildItem ".\backups" -Directory \| Where-Object CreationTime -lt (Get-Date).AddDays(-30) \| Remove-Item -Recurse` |

---

## 📞 Emergency Restore Procedure

If production database is corrupted:

1. **DON'T PANIC** - You have backups!

2. **Stop All Services**
   ```powershell
   Get-Process node | Stop-Process -Force
   ```

3. **Identify Latest Good Backup**
   ```powershell
   Get-ChildItem ".\backups" -Directory | Sort-Object CreationTime -Descending | Select-Object -First 5
   ```

4. **Restore Database**
   ```powershell
   .\Restore-Database.ps1 -BackupPath ".\backups\LATEST-GOOD-BACKUP" -Force
   ```

5. **Restore Environment Variables**
   ```powershell
   # Copy from secure location
   Copy-Item ".\secure\.env" ".\backend\.env"
   ```

6. **Start Backend**
   ```powershell
   cd backend
   npm run dev
   ```

7. **Verify Data**
   - Open Prisma Studio: `npx prisma studio`
   - Check admin panel: http://localhost:3000/admin/crypto

8. **Start Frontend**
   ```powershell
   cd frontend
   npm run dev
   ```

9. **Test Thoroughly**
   - Process test order
   - Check all data visible
   - Test Stripe integration

10. **Document Incident**
    - What went wrong?
    - Which backup was used?
    - Data loss (if any)?
    - Prevention measures?

---

**Remember**: Regular backups are your insurance policy. Test them regularly! 🛡️
