# Restore-Database.ps1
# Restores database from a backup

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupPath,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🔄 DATABASE RESTORE SYSTEM                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Validate backup path
if (-not (Test-Path $BackupPath)) {
    Write-Host "❌ Error: Backup path not found: $BackupPath" -ForegroundColor Red
    exit 1
}

# Check if backup is a ZIP file
if ($BackupPath -like "*.zip") {
    Write-Host "📦 Extracting ZIP backup..." -ForegroundColor Yellow
    $extractPath = Join-Path $env:TEMP "restore-$(Get-Date -Format 'yyyyMMddHHmmss')"
    Expand-Archive -Path $BackupPath -DestinationPath $extractPath -Force
    $BackupPath = $extractPath
    Write-Host "✅ Extracted to: $extractPath`n" -ForegroundColor Green
}

# Check for manifest
$manifestPath = Join-Path $BackupPath "MANIFEST.json"
if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath | ConvertFrom-Json
    Write-Host "📋 Backup Information:" -ForegroundColor Cyan
    Write-Host "  • Date: $($manifest.backupDate)" -ForegroundColor White
    Write-Host "  • Version: $($manifest.version)" -ForegroundColor White
    Write-Host "  • System: $($manifest.system.hostname)`n" -ForegroundColor White
}

# Warn if database exists
if (Test-Path ".\backend\dev.db" -and -not $Force) {
    Write-Host "⚠️  WARNING: Existing database found!" -ForegroundColor Yellow
    Write-Host "   This will overwrite: .\backend\dev.db" -ForegroundColor Yellow
    Write-Host "`n   Use -Force to proceed without confirmation`n" -ForegroundColor Gray
    
    $response = Read-Host "Continue? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "`n❌ Restore cancelled" -ForegroundColor Red
        exit 0
    }
}

Write-Host "`n🔄 Starting restore process...`n" -ForegroundColor Yellow

# 1. BACKUP CURRENT DATABASE (just in case)
if (Test-Path ".\backend\dev.db") {
    Write-Host "💾 Backing up current database..." -ForegroundColor Yellow
    $backupName = "dev.db.backup-$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item ".\backend\dev.db" ".\backend\$backupName"
    Write-Host "  ✅ Current database backed up as: $backupName`n" -ForegroundColor Green
}

# 2. RESTORE DATABASE FILE
$dbBackupPath = Join-Path $BackupPath "database\dev.db"
if (Test-Path $dbBackupPath) {
    Write-Host "📥 Restoring database file..." -ForegroundColor Yellow
    Copy-Item $dbBackupPath ".\backend\dev.db" -Force
    $dbSize = [math]::Round((Get-Item ".\backend\dev.db").Length / 1KB, 2)
    Write-Host "  ✅ Database restored ($dbSize KB)`n" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  No database file found in backup`n" -ForegroundColor Yellow
}

# 3. RESTORE SCHEMA
$schemaBackupPath = Join-Path $BackupPath "database\schema.prisma"
if (Test-Path $schemaBackupPath) {
    Write-Host "📋 Restoring schema..." -ForegroundColor Yellow
    Copy-Item $schemaBackupPath ".\backend\prisma\schema.prisma" -Force
    Write-Host "  ✅ Schema restored`n" -ForegroundColor Green
}

# 4. RESTORE MIGRATIONS
$migrationsBackupPath = Join-Path $BackupPath "database\migrations"
if (Test-Path $migrationsBackupPath) {
    Write-Host "📜 Restoring migrations..." -ForegroundColor Yellow
    
    if (Test-Path ".\backend\prisma\migrations") {
        Remove-Item ".\backend\prisma\migrations" -Recurse -Force
    }
    
    Copy-Item $migrationsBackupPath ".\backend\prisma\migrations" -Recurse -Force
    $migrationCount = (Get-ChildItem ".\backend\prisma\migrations" -Directory).Count
    Write-Host "  ✅ Migrations restored ($migrationCount folders)`n" -ForegroundColor Green
}

# 5. VERIFY RESTORE
Write-Host "🔍 Verifying restore..." -ForegroundColor Yellow

$verifications = @(
    @{ Name = "Database file"; Path = ".\backend\dev.db" },
    @{ Name = "Schema"; Path = ".\backend\prisma\schema.prisma" },
    @{ Name = "Migrations"; Path = ".\backend\prisma\migrations" }
)

$allGood = $true
foreach ($check in $verifications) {
    if (Test-Path $check.Path) {
        Write-Host "  ✅ $($check.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($check.Name) - MISSING!" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# 6. SUMMARY
if ($allGood) {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║           ✅ RESTORE COMPLETED SUCCESSFULLY!           ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-Host "📖 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Restore .env files manually (not included in backup)" -ForegroundColor White
    Write-Host "  2. Start backend server: cd backend && npm run dev" -ForegroundColor White
    Write-Host "  3. Verify data in admin panel: http://localhost:3000/admin/crypto" -ForegroundColor White
    Write-Host "  4. Test functionality thoroughly before going to production`n" -ForegroundColor White
} else {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║           ⚠️  RESTORE INCOMPLETE!                      ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Red
    
    Write-Host "⚠️  Some files were not restored. Check the backup contents." -ForegroundColor Yellow
}

Write-Host "💡 Tip: Check README.md in the backup folder for more details`n" -ForegroundColor Cyan
