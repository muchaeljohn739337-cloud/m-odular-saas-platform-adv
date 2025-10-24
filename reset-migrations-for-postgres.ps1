# Reset Prisma migrations for PostgreSQL
# This script will create new migrations compatible with PostgreSQL

Write-Host "🔄 Resetting Prisma migrations for PostgreSQL..." -ForegroundColor Cyan

# Step 1: Backup existing migrations
$backupDir = "backend/prisma/migrations_backup_sqlite_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "`n📦 Backing up SQLite migrations to: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item "backend/prisma/migrations/*" $backupDir -Recurse -Force
Write-Host "✅ Backup complete!" -ForegroundColor Green

# Step 2: Remove old migrations folder
Write-Host "`n🗑️  Removing old SQLite migrations..." -ForegroundColor Yellow
Remove-Item "backend/prisma/migrations" -Recurse -Force
Write-Host "✅ Old migrations removed!" -ForegroundColor Green

# Step 3: Instructions for next steps
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ MIGRATIONS RESET COMPLETE!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Commit and push these changes:" -ForegroundColor White
Write-Host "   git add backend/prisma" -ForegroundColor Gray
Write-Host "   git commit -m 'Reset migrations for PostgreSQL'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  In Render Dashboard → advancia-backend → Shell, run:" -ForegroundColor White
Write-Host "   cd backend && npx prisma migrate deploy --create-only" -ForegroundColor Gray
Write-Host ""
Write-Host "   OR use Prisma's auto-migration on first deploy:" -ForegroundColor White
Write-Host "   cd backend && npx prisma db push" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  This will create PostgreSQL-compatible tables!" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
