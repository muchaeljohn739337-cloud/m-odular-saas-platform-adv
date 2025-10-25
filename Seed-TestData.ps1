# Quick script to seed test data for crypto demo
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Seeding Test Data for Crypto System Demo            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

try {
  Push-Location (Join-Path $PSScriptRoot 'backend')
  
  # Ensure deps are available
  if (-not (Test-Path 'node_modules')) { 
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install 
  }
  
  if (-not (Test-Path '.\node_modules\.prisma')) { 
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate 
  }
  
  Write-Host "`n🌱 Seeding test data..." -ForegroundColor Green
  node .\scripts\seedTestData.mjs
  
  Pop-Location
  
  Write-Host "`n✅ Done! You can now visit http://localhost:3000/admin/crypto" -ForegroundColor Green
  
} catch {
  Write-Host "❌ Error:" $_.Exception.Message -ForegroundColor Red
  exit 1
}
