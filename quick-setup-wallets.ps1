# Quick Wallet Address Setup
# Run this to configure your wallet addresses immediately

Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║  🪙 ADMIN WALLET ADDRESS CONFIGURATION                    ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`nThis will configure your wallet addresses:" -ForegroundColor Yellow
Write-Host "  BTC:  bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k" -ForegroundColor Green
Write-Host "  ETH:  0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8" -ForegroundColor Green
Write-Host "  USDT: 0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8" -ForegroundColor Green

Write-Host "`n⚠️  Note: XRP and XLM are not yet supported" -ForegroundColor Yellow

$confirm = Read-Host "`nProceed with configuration? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Configuration cancelled" -ForegroundColor Red
    exit
}

# Check if backend is running
Write-Host "`n🔍 Checking if backend is running..." -ForegroundColor Cyan
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 3
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running. Please start it first:" -ForegroundColor Red
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    exit 1
}

# Get admin credentials
Write-Host "`n🔐 Enter Admin Credentials" -ForegroundColor Cyan
$email = Read-Host "Admin email"
$password = Read-Host "Admin password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Login
Write-Host "`n🔄 Logging in..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = $email
        password = $passwordPlain
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed. Please check your credentials." -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}

# Configure wallet addresses
Write-Host "`n🔄 Configuring wallet addresses..." -ForegroundColor Cyan
try {
    $settingsBody = @{
        btcAddress = "bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k"
        ethAddress = "0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8"
        usdtAddress = "0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8"
        processingFeePercent = 2.5
        minPurchaseAmount = 10
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/crypto/admin/settings" `
        -Method PUT `
        -Headers $headers `
        -Body $settingsBody

    Write-Host "✅ Wallet addresses configured successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Configuration failed." -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    
    # Try to get more details from the response
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Gray
    }
    exit 1
}

# Verify configuration
Write-Host "`n✅ Verifying configuration..." -ForegroundColor Cyan
try {
    $verifyResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/crypto/admin/settings" `
        -Method GET `
        -Headers $headers

    Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ CONFIGURATION COMPLETE                                ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host "`n📋 Configured Addresses:" -ForegroundColor Cyan
    Write-Host "  BTC:  $($verifyResponse.btcAddress)" -ForegroundColor Green
    Write-Host "  ETH:  $($verifyResponse.ethAddress)" -ForegroundColor Green
    Write-Host "  USDT: $($verifyResponse.usdtAddress)" -ForegroundColor Green
    
    Write-Host "`n⚙️  Settings:" -ForegroundColor Cyan
    Write-Host "  Processing Fee: $($verifyResponse.processingFeePercent)%" -ForegroundColor White
    Write-Host "  Min Purchase: `$$($verifyResponse.minPurchaseAmount)" -ForegroundColor White
    
    Write-Host "`n🎯 What's Next:" -ForegroundColor Cyan
    Write-Host "  1. Test crypto purchase at: http://localhost:3000/crypto/buy" -ForegroundColor White
    Write-Host "  2. View admin panel at: http://localhost:3000/admin/crypto" -ForegroundColor White
    Write-Host "  3. Check wallet addresses in your hardware wallet" -ForegroundColor White
    Write-Host "  4. Test with small amounts first!" -ForegroundColor Yellow
    
    Write-Host "`n📊 Wallet Explorers:" -ForegroundColor Cyan
    Write-Host "  BTC: https://blockchair.com/bitcoin/address/$($verifyResponse.btcAddress)" -ForegroundColor Gray
    Write-Host "  ETH: https://etherscan.io/address/$($verifyResponse.ethAddress)" -ForegroundColor Gray
    
    Write-Host "`n💡 Pro Tips:" -ForegroundColor Yellow
    Write-Host "  • Monitor these addresses regularly" -ForegroundColor White
    Write-Host "  • Set up wallet alerts for incoming transactions" -ForegroundColor White
    Write-Host "  • Keep private keys in hardware wallet" -ForegroundColor White
    Write-Host "  • Test with testnet first if possible" -ForegroundColor White
    
} catch {
    Write-Host "⚠️  Configuration saved but verification failed." -ForegroundColor Yellow
    Write-Host "   You may need to check the admin panel manually." -ForegroundColor Gray
}

Write-Host "`n✨ Setup complete! Your crypto payment system is ready." -ForegroundColor Green
Write-Host ""
