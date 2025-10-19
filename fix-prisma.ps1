# Quick Fix Script - Regenerate Prisma Client
Write-Host "==> Stopping all Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "==> Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "==> Cleaning Prisma cache..." -ForegroundColor Yellow
Set-Location backend
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "==> Regenerating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Prisma Client regenerated successfully!" -ForegroundColor Green
    Write-Host "`nYou can now:" -ForegroundColor White
    Write-Host "  1. Run: npm run build" -ForegroundColor Cyan
    Write-Host "  2. Push to GitHub for deployment" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Failed to regenerate Prisma Client" -ForegroundColor Red
    exit 1
}

Set-Location ..
