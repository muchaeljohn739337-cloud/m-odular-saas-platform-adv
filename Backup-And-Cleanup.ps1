# 🔒 Critical Backup & Cleanup Script
# Date: October 19, 2025
# Purpose: Backup critical files before cleanup

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$backupRoot = "backups/critical-backup-$timestamp"

Write-Host "📦 Starting Critical Backup..." -ForegroundColor Cyan

# Critical Backend Files
$backendCritical = @(
    "backend/src/**/*.ts",
    "backend/prisma/schema.prisma",
    "backend/prisma/migrations/**/*",
    "backend/package.json",
    "backend/tsconfig.json",
    "backend/.env.example",
    "backend/.env.encrypted"
)

# Critical Frontend Files
$frontendCritical = @(
    "frontend/src/**/*.{ts,tsx,css}",
    "frontend/package.json",
    "frontend/tsconfig.json",
    "frontend/next.config.js",
    "frontend/tailwind.config.js",
    "frontend/.env.local"
)

# Critical Config Files
$configCritical = @(
    ".github/workflows/*.yml",
    "render.yaml",
    ".gitignore",
    "docker-compose.yml"
)

# Critical Documentation
$docsCritical = @(
    "README.md",
    "SECURITY_AUDIT_REPORT.md",
    "VALIDATION_REPORT.md",
    "FIXES_SUMMARY.md",
    "COMMIT_READY.md"
)

Write-Host "✅ Backup plan created" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Files to backup:"
Write-Host "  - Backend source code (40+ files)"
Write-Host "  - Frontend source code (60+ files)"
Write-Host "  - Database schema & migrations"
Write-Host "  - Configuration files"
Write-Host "  - Critical documentation"
Write-Host ""
Write-Host "🗑️ Files to remove:"
Write-Host "  - Test scripts (Test-*.ps1)"
Write-Host "  - Quick fix scripts (quick-*.ps1)"
Write-Host "  - Debug scripts (debug-*.ps1)"
Write-Host "  - Temporary files (*.tmp, *.temp)"
Write-Host "  - Build artifacts (.next/cache, dist/temp)"
Write-Host "  - Old encrypted secrets"
Write-Host "  - Backup tokens (backup-tokens.txt)"
Write-Host ""

# Function to copy files matching pattern
function Backup-Files {
    param($pattern, $destination)
    
    $files = Get-ChildItem -Path . -Filter $pattern -Recurse -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
        $destPath = Join-Path $destination $relativePath
        $destDir = Split-Path $destPath -Parent
        
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        }
        
        Copy-Item $file.FullName $destPath -Force
    }
}

Write-Host "🚀 Run this script to execute backup and cleanup" -ForegroundColor Yellow
Write-Host ""
Write-Host "To execute: .\Backup-And-Cleanup.ps1" -ForegroundColor Cyan
