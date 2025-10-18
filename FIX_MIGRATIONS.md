# Fix PostgreSQL Migration Issues

## Problem

Your Prisma migrations use `DATETIME` which is invalid for PostgreSQL. PostgreSQL uses `TIMESTAMP` instead.

**Error in CI:**
```
ERROR: type "datetime" does not exist
```

## Quick Fix

Run this PowerShell script to fix all migrations:

```powershell
# Navigate to migrations folder
cd c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend\prisma\migrations

# Replace DATETIME with TIMESTAMP in all migration files
Get-ChildItem -Path . -Filter "*.sql" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace 'DATETIME', 'TIMESTAMP'
    Set-Content -Path $_.FullName -Value $newContent -NoNewline
    Write-Host "Fixed: $($_.Name)"
}

Write-Host "`n✅ All migrations fixed!"
```

## Then Commit and Push

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform
git add backend/prisma/migrations
git commit -m "fix: replace DATETIME with TIMESTAMP for PostgreSQL compatibility"
git push origin main
```

## What This Fixes

Changes all occurrences of:
- `DATETIME` → `TIMESTAMP`
- `DATETIME NOT NULL` → `TIMESTAMP NOT NULL`
- `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` → `TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`

This makes your migrations compatible with PostgreSQL which is what GitHub Actions CI uses.
