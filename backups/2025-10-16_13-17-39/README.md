# Database Backup - 2025-10-16_13-17-39

## Backup Information
- **Created:** 2025-10-16 13:17:41
- **System:** DESKTOP-H7T9NPM
- **Platform:** Win32NT

## Contents

### 📁 database/
- \dev.db\ - SQLite database file
- \schema.prisma\ - Database schema
- \migrations/\ - Migration history
- \data-export.json\ - Portable JSON export of all data

### 📁 config/
- Backend configuration (.env, package.json, tsconfig.json)
- Frontend configuration (.env.local, package.json, next.config.js)
- Root configuration (docker-compose.yml)

### 📁 scripts/
- PowerShell utility scripts
- Backend Node.js scripts
- Setup and seeding scripts

### 📁 documentation/
- Crypto system documentation
- Setup guides and references

## 🔄 How to Restore

### Option 1: Restore Database File
```powershell
# 1. Copy database file
Copy-Item ".\backups\2025-10-16_13-17-39\database\dev.db" ".\backend\dev.db"

# 2. Restart backend
cd backend
npm run dev
```

### Option 2: Import from JSON
```powershell
# Use the included import script
cd backend
node scripts/import-data.js ".\backups\2025-10-16_13-17-39\database\data-export.json"
```

### Option 3: Fresh Setup with Schema
```powershell
# 1. Copy schema
Copy-Item ".\backups\2025-10-16_13-17-39\database\schema.prisma" ".\backend\prisma\schema.prisma"

# 2. Copy migrations
Copy-Item ".\backups\2025-10-16_13-17-39\database\migrations" ".\backend\prisma\migrations" -Recurse

# 3. Run migration
cd backend
npx prisma migrate deploy
```

## ⚠️ Important Notes

- **Environment Variables**: Backup contains REDACTED .env files for security
- **Restore .env manually** with your actual keys before running servers
- **Test restored database** before deploying to production
- **Keep backups secure** - they contain sensitive user data

## 📊 Backup Statistics

- Database Size: N/A KB
- Total Files: 29
- Total Size: 0.14 MB

---

**Backup Location:** \$backupFolder\
