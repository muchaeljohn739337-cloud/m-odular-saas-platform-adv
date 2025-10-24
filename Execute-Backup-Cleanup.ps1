# 🔒 CRITICAL BACKUP & CLEANUP SCRIPT
# Date: October 19, 2025
# Purpose: Backup essential files and remove unused/temporary files

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$backupDir = "backups/critical-backup-$timestamp"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔒 CRITICAL BACKUP & CLEANUP UTILITY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ============================================
# STEP 1: CREATE BACKUP
# ============================================

Write-Host "📦 STEP 1: Creating Critical Backup..." -ForegroundColor Yellow
Write-Host ""

# Create backup directories
New-Item -ItemType Directory -Force -Path "$backupDir/backend/src" | Out-Null
New-Item -ItemType Directory -Force -Path "$backupDir/backend/prisma" | Out-Null
New-Item -ItemType Directory -Force -Path "$backupDir/frontend/src" | Out-Null
New-Item -ItemType Directory -Force -Path "$backupDir/config" | Out-Null
New-Item -ItemType Directory -Force -Path "$backupDir/docs" | Out-Null

Write-Host "  ✓ Backup directories created" -ForegroundColor Green

# Backup Backend Source Code
Write-Host "  → Backing up backend source code..." -ForegroundColor Gray
Copy-Item -Path "backend/src" -Destination "$backupDir/backend/src" -Recurse -Force
Copy-Item -Path "backend/prisma" -Destination "$backupDir/backend/prisma" -Recurse -Force
Copy-Item -Path "backend/package.json" -Destination "$backupDir/backend/" -Force
Copy-Item -Path "backend/tsconfig.json" -Destination "$backupDir/backend/" -Force
if (Test-Path "backend/.env.example") {
    Copy-Item -Path "backend/.env.example" -Destination "$backupDir/backend/" -Force
}
if (Test-Path "backend/.env.encrypted") {
    Copy-Item -Path "backend/.env.encrypted" -Destination "$backupDir/backend/" -Force
}
Write-Host "  ✓ Backend backed up" -ForegroundColor Green

# Backup Frontend Source Code
Write-Host "  → Backing up frontend source code..." -ForegroundColor Gray
Copy-Item -Path "frontend/src" -Destination "$backupDir/frontend/src" -Recurse -Force
Copy-Item -Path "frontend/package.json" -Destination "$backupDir/frontend/" -Force
Copy-Item -Path "frontend/tsconfig.json" -Destination "$backupDir/frontend/" -Force
Copy-Item -Path "frontend/next.config.js" -Destination "$backupDir/frontend/" -Force
Copy-Item -Path "frontend/tailwind.config.js" -Destination "$backupDir/frontend/" -Force
Write-Host "  ✓ Frontend backed up" -ForegroundColor Green

# Backup Configuration Files
Write-Host "  → Backing up configuration files..." -ForegroundColor Gray
Copy-Item -Path ".github" -Destination "$backupDir/config/.github" -Recurse -Force
Copy-Item -Path "render.yaml" -Destination "$backupDir/config/" -Force
Copy-Item -Path ".gitignore" -Destination "$backupDir/config/" -Force
Copy-Item -Path "docker-compose.yml" -Destination "$backupDir/config/" -Force
Write-Host "  ✓ Configuration backed up" -ForegroundColor Green

# Backup Essential Documentation
Write-Host "  → Backing up essential documentation..." -ForegroundColor Gray
$essentialDocs = @(
    "README.md",
    "SECURITY_AUDIT_REPORT.md",
    "VALIDATION_REPORT.md",
    "FIXES_SUMMARY.md",
    "COMMIT_READY.md",
    "IMPLEMENTATION_GUIDE.md",
    "TROUBLESHOOTING.md",
    "DEPLOYMENT_GUIDE.md"
)

foreach ($doc in $essentialDocs) {
    if (Test-Path $doc) {
        Copy-Item -Path $doc -Destination "$backupDir/docs/" -Force
    }
}
Write-Host "  ✓ Documentation backed up" -ForegroundColor Green

Write-Host ""
Write-Host "✅ BACKUP COMPLETE: $backupDir" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 2: IDENTIFY FILES TO REMOVE
# ============================================

Write-Host "🗑️  STEP 2: Identifying Files to Remove..." -ForegroundColor Yellow
Write-Host ""

$filesToRemove = @()

# Test Scripts
$testScripts = @(
    "Test-Registration.ps1",
    "test-sms-simple.ps1",
    "test-twilio-sms.ps1",
    "test-twilio-verify-direct.ps1"
)
$filesToRemove += $testScripts
Write-Host "  → Found $($testScripts.Count) test scripts" -ForegroundColor Gray

# Check/Fix Scripts
$checkScripts = @(
    "Check-Cloudflare-Progress.ps1",
    "Check-Cloudflare-Setup.ps1",
    "Check-Deployment-Status.ps1",
    "check-status.ps1",
    "Check-Workflow-Status.ps1",
    "Fix-Database.ps1",
    "Fix-GitHub-Repo.ps1",
    "fix-prisma.ps1",
    "Quick-Upload-Secrets.ps1"
)
$filesToRemove += $checkScripts
Write-Host "  → Found $($checkScripts.Count) check/fix scripts" -ForegroundColor Gray

# Redundant Documentation (keeping only essential ones)
$redundantDocs = Get-ChildItem -Filter "*.md" | Where-Object {
    $_.Name -notmatch "^(README|SECURITY_AUDIT|VALIDATION|FIXES_SUMMARY|COMMIT_READY|IMPLEMENTATION_GUIDE|TROUBLESHOOTING|DEPLOYMENT_GUIDE)" -and
    $_.Name -match "(COMPLETE|SUCCESS|FIXED|STATUS|GUIDE|SETUP|READY|NOW|CHECKLIST|SUMMARY|INDEX)"
} | Select-Object -ExpandProperty Name

$filesToRemove += $redundantDocs
Write-Host "  → Found $($redundantDocs.Count) redundant docs" -ForegroundColor Gray

# Old encrypted secrets
$oldSecrets = Get-ChildItem -Filter "encrypted_secrets_*.env" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
$filesToRemove += $oldSecrets
Write-Host "  → Found $($oldSecrets.Count) old encrypted files" -ForegroundColor Gray

# Log files
$logFiles = Get-ChildItem -Filter "*.log" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
$filesToRemove += $logFiles
Write-Host "  → Found $($logFiles.Count) log files" -ForegroundColor Gray

# Temporary text files
$tempTxtFiles = Get-ChildItem -Filter "*.txt" | Where-Object {
    $_.Name -match "(STATUS|PROGRESS|RESULTS|QUICK|TEMP)"
} | Select-Object -ExpandProperty Name
$filesToRemove += $tempTxtFiles
Write-Host "  → Found $($tempTxtFiles.Count) temporary text files" -ForegroundColor Gray

Write-Host ""
Write-Host "📊 CLEANUP SUMMARY:" -ForegroundColor Cyan
Write-Host "  Total files to remove: $($filesToRemove.Count)" -ForegroundColor White
Write-Host ""

# ============================================
# STEP 3: REMOVE FILES (WITH CONFIRMATION)
# ============================================

Write-Host "🗑️  STEP 3: Removing Unnecessary Files..." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Do you want to remove these $($filesToRemove.Count) files? (yes/no)"

if ($confirm -eq "yes") {
    $removedCount = 0
    $skippedCount = 0
    
    foreach ($file in $filesToRemove) {
        if (Test-Path $file) {
            try {
                Remove-Item $file -Force
                Write-Host "  ✓ Removed: $file" -ForegroundColor Green
                $removedCount++
            } catch {
                Write-Host "  ✗ Failed: $file - $($_.Exception.Message)" -ForegroundColor Red
                $skippedCount++
            }
        } else {
            $skippedCount++
        }
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ✅ CLEANUP COMPLETE" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Files removed: $removedCount" -ForegroundColor Green
    Write-Host "  Files skipped: $skippedCount" -ForegroundColor Yellow
    Write-Host "  Backup location: $backupDir" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  ℹ️  All critical files have been backed up before removal" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "❌ Cleanup cancelled. No files were removed." -ForegroundColor Yellow
    Write-Host "   Backup is still available at: $backupDir" -ForegroundColor Cyan
    Write-Host ""
}

# ============================================
# STEP 4: CLEANUP BUILD ARTIFACTS
# ============================================

Write-Host "🧹 STEP 4: Cleaning Build Artifacts..." -ForegroundColor Yellow
Write-Host ""

$cleanupBuild = Read-Host "Do you want to clean build artifacts (.next/cache, node_modules/.cache)? (yes/no)"

if ($cleanupBuild -eq "yes") {
    if (Test-Path "frontend/.next/cache") {
        Remove-Item "frontend/.next/cache" -Recurse -Force
        Write-Host "  ✓ Removed .next/cache" -ForegroundColor Green
    }
    
    if (Test-Path "backend/node_modules/.cache") {
        Remove-Item "backend/node_modules/.cache" -Recurse -Force
        Write-Host "  ✓ Removed backend cache" -ForegroundColor Green
    }
    
    if (Test-Path "frontend/node_modules/.cache") {
        Remove-Item "frontend/node_modules/.cache" -Recurse -Force
        Write-Host "  ✓ Removed frontend cache" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "  ✅ Build artifacts cleaned" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎉 ALL OPERATIONS COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review changes with: git status" -ForegroundColor White
Write-Host "  2. Commit cleaned workspace: git add -A" -ForegroundColor White
Write-Host "  3. Push changes: git push origin main" -ForegroundColor White
Write-Host ""
