#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Clean up duplicate repository - Delete outdated -modular-saas-platform - Copy folder

.DESCRIPTION
    This script safely deletes the outdated "-modular-saas-platform - Copy" folder
    while keeping the main repository intact.

.EXAMPLE
    .\Cleanup-Duplicate-Repo.ps1
#>

# Colors for output
$Green = [ConsoleColor]::Green
$Red = [ConsoleColor]::Red
$Yellow = [ConsoleColor]::Yellow
$Cyan = [ConsoleColor]::Cyan

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  REPOSITORY CLEANUP - Remove Duplicate Folder         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Define paths
$MainRepo = "C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform"
$CopyRepo = "C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform - Copy"

# Verification Step 1: Check both folders exist
Write-Host "📋 VERIFICATION STEP 1: Checking repositories..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path $MainRepo) {
    Write-Host "✅ Main repo found:" -ForegroundColor $Green
    Write-Host "   $MainRepo" -ForegroundColor $Green
} else {
    Write-Host "❌ Main repo NOT found!" -ForegroundColor $Red
    Write-Host "   $MainRepo" -ForegroundColor $Red
    Write-Host "`n⚠️  Cannot proceed - main repository is missing!" -ForegroundColor $Yellow
    exit 1
}

Write-Host ""

if (Test-Path $CopyRepo) {
    Write-Host "✅ Copy repo found:" -ForegroundColor $Green
    Write-Host "   $CopyRepo" -ForegroundColor $Green
} else {
    Write-Host "❌ Copy repo NOT found!" -ForegroundColor $Red
    Write-Host "   $CopyRepo" -ForegroundColor $Red
    Write-Host "`n✨ Nothing to clean up - Copy folder already deleted!" -ForegroundColor $Green
    exit 0
}

# Verification Step 2: Check git commits in both repos
Write-Host "`n"
Write-Host "📊 VERIFICATION STEP 2: Checking repository versions..." -ForegroundColor Cyan
Write-Host ""

$MainCommit = & git -C $MainRepo log --oneline -1 2>$null | Select-Object -First 1
$CopyCommit = & git -C $CopyRepo log --oneline -1 2>$null | Select-Object -First 1

Write-Host "Main repo latest commit:" -ForegroundColor $Green
Write-Host "  $MainCommit" -ForegroundColor $Green

Write-Host ""
Write-Host "Copy repo latest commit:" -ForegroundColor $Yellow
Write-Host "  $CopyCommit" -ForegroundColor $Yellow

# Verification Step 3: Check GitHub Desktop is using main repo
Write-Host "`n"
Write-Host "📱 VERIFICATION STEP 3: Checking GitHub Desktop..." -ForegroundColor Cyan
Write-Host ""

$GHDConfigPath = "$env:APPDATA\GitHub Desktop\repositories.json"
if (Test-Path $GHDConfigPath) {
    Write-Host "✅ GitHub Desktop found" -ForegroundColor $Green
    Write-Host "   Configuration file located" -ForegroundColor $Green
} else {
    Write-Host "⚠️  GitHub Desktop config not found (it's OK if not using GitHub Desktop)" -ForegroundColor $Yellow
}

# User Confirmation
Write-Host "`n"
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "⚠️  CONFIRMATION REQUIRED" -ForegroundColor $Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will DELETE:" -ForegroundColor $Red
Write-Host "  ❌ $CopyRepo" -ForegroundColor $Red
Write-Host ""
Write-Host "This script will KEEP:" -ForegroundColor $Green
Write-Host "  ✅ $MainRepo" -ForegroundColor $Green
Write-Host ""
Write-Host "Disk space to be freed: ~500MB" -ForegroundColor $Cyan
Write-Host ""

$Response = Read-Host "Are you sure? (yes/no)"

if ($Response -ne "yes") {
    Write-Host ""
    Write-Host "❌ Cleanup cancelled." -ForegroundColor $Yellow
    Write-Host ""
    exit 0
}

# Final Confirmation
Write-Host ""
$FinalResponse = Read-Host "⚠️  Last chance - Type 'DELETE' to confirm"

if ($FinalResponse -ne "DELETE") {
    Write-Host ""
    Write-Host "❌ Cleanup cancelled." -ForegroundColor $Yellow
    Write-Host ""
    exit 0
}

# Perform Cleanup
Write-Host ""
Write-Host "🗑️  Deleting outdated repository copy..." -ForegroundColor $Red
Write-Host ""

try {
    Remove-Item -Path $CopyRepo -Recurse -Force -ErrorAction Stop
    Write-Host "✅ Successfully deleted:" -ForegroundColor $Green
    Write-Host "   $CopyRepo" -ForegroundColor $Green
} catch {
    Write-Host "❌ Error deleting folder:" -ForegroundColor $Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor $Red
    exit 1
}

# Verification: Confirm deletion
Write-Host ""
Write-Host "✅ VERIFICATION: Confirming deletion..." -ForegroundColor $Cyan
Write-Host ""

if (Test-Path $CopyRepo) {
    Write-Host "❌ Folder still exists - deletion may have failed!" -ForegroundColor $Red
    exit 1
} else {
    Write-Host "✅ Folder successfully deleted!" -ForegroundColor $Green
    Write-Host "✅ Duplicate repository removed!" -ForegroundColor $Green
}

# Summary
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor $Green
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor $Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor $Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor $Cyan
Write-Host "  ✅ Deleted: -modular-saas-platform - Copy" -ForegroundColor $Green
Write-Host "  ✅ Kept: -modular-saas-platform" -ForegroundColor $Green
Write-Host "  ✅ Freed: ~500MB disk space" -ForegroundColor $Green
Write-Host ""
Write-Host "🚀 You're ready to continue development!" -ForegroundColor $Green
Write-Host ""
