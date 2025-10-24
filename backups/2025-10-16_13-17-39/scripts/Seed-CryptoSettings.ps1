# Prompt user for crypto admin settings and seed DB directly via Prisma
Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Seed Crypto Admin Settings (direct DB, no server)  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Enter your crypto wallet addresses (press Enter to skip):" -ForegroundColor Yellow
$btc = Read-Host "Bitcoin (BTC) Address"
$eth = Read-Host "Ethereum (ETH) Address"
$usdt = Read-Host "USDT Address (ERC-20 or TRC-20)"

$btcRate = Read-Host "BTC/USD Rate (default: 45000)"; if ([string]::IsNullOrWhiteSpace($btcRate)) { $btcRate = '45000' }
$ethRate = Read-Host "ETH/USD Rate (default: 2800)";  if ([string]::IsNullOrWhiteSpace($ethRate)) { $ethRate = '2800' }
$usdtRate = Read-Host "USDT/USD Rate (default: 1.00)"; if ([string]::IsNullOrWhiteSpace($usdtRate)) { $usdtRate = '1' }

$fee = Read-Host "Processing Fee % (default: 2.5)"; if ([string]::IsNullOrWhiteSpace($fee)) { $fee = '2.5' }
$min = Read-Host "Minimum Purchase USD (default: 10)"; if ([string]::IsNullOrWhiteSpace($min)) { $min = '10' }

$payload = [PSCustomObject]@{
  btcAddress = if ($btc) { $btc } else { $null }
  ethAddress = if ($eth) { $eth } else { $null }
  usdtAddress = if ($usdt) { $usdt } else { $null }
  exchangeRateBtc = [decimal]$btcRate
  exchangeRateEth = [decimal]$ethRate
  exchangeRateUsdt = [decimal]$usdtRate
  processingFeePercent = [decimal]$fee
  minPurchaseAmount = [decimal]$min
}

$temp = Join-Path $PSScriptRoot 'adminSettings.temp.json'
$payload | ConvertTo-Json | Out-File -FilePath $temp -Encoding UTF8

try {
  Push-Location (Join-Path $PSScriptRoot 'backend')
  if (-not (Test-Path 'node_modules')) { npm install }
  if (-not (Test-Path '.\node_modules\.prisma')) { npx prisma generate }
  node .\scripts\seedAdminSettings.mjs $temp
  Pop-Location
  Write-Host "`n✅ Settings seeded successfully!" -ForegroundColor Green
} catch {
  Write-Host "❌ Failed to seed settings: $($_.Exception.Message)" -ForegroundColor Red
} finally {
  if (Test-Path $temp) { Remove-Item $temp -Force }
}
