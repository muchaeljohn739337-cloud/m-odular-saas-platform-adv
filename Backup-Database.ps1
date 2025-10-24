# Backup-Database.ps1
# Creates timestamped backups of SQLite database and critical data

param(
    [string]$BackupDir = ".\backups",
    [switch]$IncludeEnv = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# Create timestamp for backup
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = Join-Path $BackupDir $timestamp

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🗄️  DATABASE BACKUP SYSTEM                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Create backup directory structure
Write-Host "📁 Creating backup directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
New-Item -ItemType Directory -Path "$backupFolder\database" -Force | Out-Null
New-Item -ItemType Directory -Path "$backupFolder\config" -Force | Out-Null
New-Item -ItemType Directory -Path "$backupFolder\scripts" -Force | Out-Null
New-Item -ItemType Directory -Path "$backupFolder\documentation" -Force | Out-Null

Write-Host "✅ Backup directory created: $backupFolder`n" -ForegroundColor Green

# 1. BACKUP DATABASE FILES
Write-Host "🗄️  Backing up database files..." -ForegroundColor Yellow

if (Test-Path ".\backend\dev.db") {
    Copy-Item ".\backend\dev.db" "$backupFolder\database\dev.db"
    $dbSize = (Get-Item ".\backend\dev.db").Length / 1KB
    Write-Host "  ✅ dev.db ($([math]::Round($dbSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  dev.db not found" -ForegroundColor Yellow
}

if (Test-Path ".\backend\dev.db-journal") {
    Copy-Item ".\backend\dev.db-journal" "$backupFolder\database\dev.db-journal"
    Write-Host "  ✅ dev.db-journal" -ForegroundColor Green
}

# 2. BACKUP SCHEMA
Write-Host "`n📋 Backing up schema..." -ForegroundColor Yellow

if (Test-Path ".\backend\prisma\schema.prisma") {
    Copy-Item ".\backend\prisma\schema.prisma" "$backupFolder\database\schema.prisma"
    Write-Host "  ✅ schema.prisma" -ForegroundColor Green
}

# Copy migrations folder
if (Test-Path ".\backend\prisma\migrations") {
    Copy-Item ".\backend\prisma\migrations" "$backupFolder\database\migrations" -Recurse
    $migrationCount = (Get-ChildItem ".\backend\prisma\migrations" -Directory).Count
    Write-Host "  ✅ migrations ($migrationCount migration folders)" -ForegroundColor Green
}

# 3. BACKUP CONFIGURATION FILES
Write-Host "`n⚙️  Backing up configuration..." -ForegroundColor Yellow

$configFiles = @(
    ".\backend\.env",
    ".\backend\package.json",
    ".\backend\tsconfig.json",
    ".\frontend\.env.local",
    ".\frontend\package.json",
    ".\frontend\tsconfig.json",
    ".\frontend\next.config.js",
    ".\frontend\tailwind.config.js",
    ".\docker-compose.yml"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        $subDir = if ($file -like "*backend*") { "backend" } elseif ($file -like "*frontend*") { "frontend" } else { "root" }
        $destDir = Join-Path "$backupFolder\config" $subDir
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        
        if ($file -like "*.env*" -and -not $IncludeEnv) {
            # Create redacted version
            $content = Get-Content $file
            $redacted = $content | ForEach-Object {
                if ($_ -match "=") {
                    $key = ($_ -split "=")[0]
                    "$key=***REDACTED***"
                } else {
                    $_
                }
            }
            $redacted | Out-File "$destDir\$fileName.redacted"
            Write-Host "  ✅ $fileName (redacted)" -ForegroundColor Green
        } else {
            Copy-Item $file "$destDir\$fileName"
            Write-Host "  ✅ $fileName" -ForegroundColor Green
        }
    }
}

# 4. BACKUP SCRIPTS
Write-Host "`n📜 Backing up utility scripts..." -ForegroundColor Yellow

$scriptFiles = @(
    ".\Seed-CryptoSettings.ps1",
    ".\Seed-TestData.ps1",
    ".\Start-Servers.ps1",
    ".\Setup-CryptoSystem.ps1",
    ".\Backup-Database.ps1"
)

foreach ($script in $scriptFiles) {
    if (Test-Path $script) {
        $scriptName = Split-Path $script -Leaf
        Copy-Item $script "$backupFolder\scripts\$scriptName"
        Write-Host "  ✅ $scriptName" -ForegroundColor Green
    }
}

if (Test-Path ".\backend\scripts") {
    Copy-Item ".\backend\scripts" "$backupFolder\scripts\backend" -Recurse
    Write-Host "  ✅ backend/scripts folder" -ForegroundColor Green
}

# 5. BACKUP DOCUMENTATION
Write-Host "`n📚 Backing up documentation..." -ForegroundColor Yellow

$docFiles = Get-ChildItem -Path "." -Filter "*.md" | Where-Object { $_.Name -like "CRYPTO*" -or $_.Name -like "WHATS_NEXT*" }

foreach ($doc in $docFiles) {
    Copy-Item $doc.FullName "$backupFolder\documentation\$($doc.Name)"
    Write-Host "  ✅ $($doc.Name)" -ForegroundColor Green
}

# 6. EXPORT DATA AS JSON (for portability)
Write-Host "`n📤 Exporting data to JSON..." -ForegroundColor Yellow

$exportScript = @"
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  const data = {
    exportDate: new Date().toISOString(),
    users: await prisma.user.findMany(),
    adminSettings: await prisma.adminSettings.findMany(),
    cryptoOrders: await prisma.cryptoOrder.findMany({ include: { user: true } }),
    cryptoWithdrawals: await prisma.cryptoWithdrawal.findMany({ include: { user: true } }),
    transactions: await prisma.transaction.findMany({ include: { user: true } }),
  };
  
  const outputPath = path.join(__dirname, '..', '..', '$($backupFolder.Replace('\', '\\'))', 'database', 'data-export.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log('✅ Data exported to:', outputPath);
}

exportData()
  .catch(console.error)
  .finally(() => prisma.`$disconnect());
"@

$exportScript | Out-File ".\backend\scripts\temp-export.js" -Encoding UTF8

try {
    Push-Location ".\backend"
    $output = node scripts/temp-export.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Data exported to JSON" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  JSON export failed (database may be empty)" -ForegroundColor Yellow
        if ($Verbose) { Write-Host "     $output" -ForegroundColor Gray }
    }
} catch {
    Write-Host "  ⚠️  JSON export failed: $($_.Exception.Message)" -ForegroundColor Yellow
} finally {
    Pop-Location
    Remove-Item ".\backend\scripts\temp-export.js" -ErrorAction SilentlyContinue
}

# 7. CREATE BACKUP MANIFEST
Write-Host "`n📋 Creating backup manifest..." -ForegroundColor Yellow

$manifest = @{
    backupDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    timestamp = $timestamp
    version = "1.0"
    system = @{
        platform = $PSVersionTable.Platform
        psVersion = $PSVersionTable.PSVersion.ToString()
        hostname = $env:COMPUTERNAME
    }
    contents = @{
        database = Test-Path "$backupFolder\database\dev.db"
        schema = Test-Path "$backupFolder\database\schema.prisma"
        migrations = Test-Path "$backupFolder\database\migrations"
        dataExport = Test-Path "$backupFolder\database\data-export.json"
        config = (Get-ChildItem "$backupFolder\config" -Recurse -File).Count
        scripts = (Get-ChildItem "$backupFolder\scripts" -Recurse -File).Count
        documentation = (Get-ChildItem "$backupFolder\documentation" -File).Count
    }
    instructions = @{
        restore = "To restore: Copy dev.db to backend/ folder, then run 'npx prisma migrate deploy'"
        importData = "To import JSON: Use backend/scripts/import-data.js"
        viewBackup = "Browse the backup folder to see all backed up files"
    }
}

$manifest | ConvertTo-Json -Depth 10 | Out-File "$backupFolder\MANIFEST.json" -Encoding UTF8
Write-Host "  ✅ MANIFEST.json created" -ForegroundColor Green

# 8. CREATE README
$readme = @"
# Database Backup - $timestamp

## Backup Information
- **Created:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **System:** $env:COMPUTERNAME
- **Platform:** $($PSVersionTable.Platform)

## Contents

### 📁 database/
- \`dev.db\` - SQLite database file
- \`schema.prisma\` - Database schema
- \`migrations/\` - Migration history
- \`data-export.json\` - Portable JSON export of all data

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
``````powershell
# 1. Copy database file
Copy-Item "$backupFolder\database\dev.db" ".\backend\dev.db"

# 2. Restart backend
cd backend
npm run dev
``````

### Option 2: Import from JSON
``````powershell
# Use the included import script
cd backend
node scripts/import-data.js "$backupFolder\database\data-export.json"
``````

### Option 3: Fresh Setup with Schema
``````powershell
# 1. Copy schema
Copy-Item "$backupFolder\database\schema.prisma" ".\backend\prisma\schema.prisma"

# 2. Copy migrations
Copy-Item "$backupFolder\database\migrations" ".\backend\prisma\migrations" -Recurse

# 3. Run migration
cd backend
npx prisma migrate deploy
``````

## ⚠️ Important Notes

- **Environment Variables**: Backup contains REDACTED .env files for security
- **Restore .env manually** with your actual keys before running servers
- **Test restored database** before deploying to production
- **Keep backups secure** - they contain sensitive user data

## 📊 Backup Statistics

- Database Size: $(if (Test-Path "$backupFolder\database\dev.db") { [math]::Round((Get-Item "$backupFolder\database\dev.db").Length / 1KB, 2) } else { "N/A" }) KB
- Total Files: $((Get-ChildItem $backupFolder -Recurse -File).Count)
- Total Size: $([math]::Round((Get-ChildItem $backupFolder -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 2)) MB

---

**Backup Location:** \`$backupFolder\`
"@

$readme | Out-File "$backupFolder\README.md" -Encoding UTF8

# 9. COMPRESS BACKUP (OPTIONAL)
Write-Host "`n📦 Creating ZIP archive..." -ForegroundColor Yellow

try {
    $zipPath = "$BackupDir\backup-$timestamp.zip"
    Compress-Archive -Path $backupFolder -DestinationPath $zipPath -Force
    $zipSize = [math]::Round((Get-Item $zipPath).Length / 1KB, 2)
    Write-Host "  ✅ Compressed backup: $zipPath ($zipSize KB)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Compression failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 10. SUMMARY
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ BACKUP COMPLETED!                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Backup Summary:" -ForegroundColor Cyan
Write-Host "  • Location: $backupFolder" -ForegroundColor White
Write-Host "  • Database: $(if (Test-Path "$backupFolder\database\dev.db") { '✅' } else { '❌' }) dev.db" -ForegroundColor White
Write-Host "  • Schema: $(if (Test-Path "$backupFolder\database\schema.prisma") { '✅' } else { '❌' }) schema.prisma" -ForegroundColor White
Write-Host "  • Migrations: $(if (Test-Path "$backupFolder\database\migrations") { '✅' } else { '❌' }) migrations/" -ForegroundColor White
Write-Host "  • JSON Export: $(if (Test-Path "$backupFolder\database\data-export.json") { '✅' } else { '❌' }) data-export.json" -ForegroundColor White
Write-Host "  • Config Files: $((Get-ChildItem "$backupFolder\config" -Recurse -File).Count)" -ForegroundColor White
Write-Host "  • Scripts: $((Get-ChildItem "$backupFolder\scripts" -Recurse -File).Count)" -ForegroundColor White
Write-Host "  • Documentation: $((Get-ChildItem "$backupFolder\documentation" -File).Count)" -ForegroundColor White

$totalSize = [math]::Round((Get-ChildItem $backupFolder -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
Write-Host "  • Total Size: $totalSize MB" -ForegroundColor White

if (Test-Path "$BackupDir\backup-$timestamp.zip") {
    Write-Host "  • ZIP Archive: ✅ backup-$timestamp.zip" -ForegroundColor White
}

Write-Host "`n📖 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review backup: Open $backupFolder" -ForegroundColor White
Write-Host "  2. Read README.md for restore instructions" -ForegroundColor White
Write-Host "  3. Store backup securely (external drive, cloud storage)" -ForegroundColor White
Write-Host "  4. Test restore process in dev environment" -ForegroundColor White

Write-Host "`n💡 Tip: Run this script regularly to keep backups up-to-date!" -ForegroundColor Cyan
Write-Host "   Schedule: .\Backup-Database.ps1`n" -ForegroundColor Gray
