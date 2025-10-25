# Set Admin Crypto Wallet Addresses
# This script configures the admin wallet addresses for crypto payments

Write-Host "🔐 Setting up Admin Crypto Wallet Addresses..." -ForegroundColor Cyan

# Your wallet addresses
$BTC_ADDRESS = "bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k"
$ETH_ADDRESS = "0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8"
$USDT_ADDRESS = "0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8"  # Same as ETH (ERC-20)
$XRP_ADDRESS = "rs2birCXZiaBzQFaq4rx34yhSz7qaHAH8u"  # For future use
$XLM_ADDRESS = "GADCJCRK3ACDGSDPJAOSAUEJPA56O2LTTDBZQKQRKERQUTA7RS5XGVSL"  # For future use

# Backend API URL
$API_URL = "http://localhost:5000"

Write-Host "`n📋 Wallet Addresses to Configure:" -ForegroundColor Yellow
Write-Host "  BTC:  $BTC_ADDRESS" -ForegroundColor Green
Write-Host "  ETH:  $ETH_ADDRESS" -ForegroundColor Green
Write-Host "  USDT: $USDT_ADDRESS" -ForegroundColor Green
Write-Host "  XRP:  $XRP_ADDRESS (not yet supported)" -ForegroundColor Gray
Write-Host "  XLM:  $XLM_ADDRESS (not yet supported)" -ForegroundColor Gray

# Prompt for admin credentials
Write-Host "`n🔑 Admin Login Required" -ForegroundColor Cyan
$adminEmail = Read-Host "Enter admin email"
$adminPassword = Read-Host "Enter admin password" -AsSecureString
$adminPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword))

# Login as admin
Write-Host "`n🔐 Logging in as admin..." -ForegroundColor Cyan
try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" -Method POST -ContentType "application/json" -Body (@{
        email = $adminEmail
        password = $adminPasswordPlain
    } | ConvertTo-Json)
    
    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Get current admin settings
Write-Host "`n📊 Fetching current admin settings..." -ForegroundColor Cyan
try {
    $currentSettings = Invoke-RestMethod -Uri "$API_URL/api/crypto/admin/settings" -Method GET -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "✅ Current settings retrieved" -ForegroundColor Green
    Write-Host "  Current BTC Address: $($currentSettings.btcAddress)" -ForegroundColor Gray
    Write-Host "  Current ETH Address: $($currentSettings.ethAddress)" -ForegroundColor Gray
    Write-Host "  Current USDT Address: $($currentSettings.usdtAddress)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  No existing settings found (this is OK for first run)" -ForegroundColor Yellow
}

# Update admin settings with wallet addresses
Write-Host "`n🔄 Updating admin wallet addresses..." -ForegroundColor Cyan
try {
    $updateResponse = Invoke-RestMethod -Uri "$API_URL/api/crypto/admin/settings" -Method PUT -ContentType "application/json" -Headers @{
        "Authorization" = "Bearer $token"
    } -Body (@{
        btcAddress = $BTC_ADDRESS
        ethAddress = $ETH_ADDRESS
        usdtAddress = $USDT_ADDRESS
        processingFeePercent = 2.5
        minPurchaseAmount = 10
    } | ConvertTo-Json)
    
    Write-Host "✅ Wallet addresses updated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update settings: $_" -ForegroundColor Red
    exit 1
}

# Verify the update
Write-Host "`n✅ Verification:" -ForegroundColor Cyan
try {
    $verifySettings = Invoke-RestMethod -Uri "$API_URL/api/crypto/admin/settings" -Method GET -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "  BTC Address:  $($verifySettings.btcAddress)" -ForegroundColor Green
    Write-Host "  ETH Address:  $($verifySettings.ethAddress)" -ForegroundColor Green
    Write-Host "  USDT Address: $($verifySettings.usdtAddress)" -ForegroundColor Green
    Write-Host "  Processing Fee: $($verifySettings.processingFeePercent)%" -ForegroundColor Green
    Write-Host "  Min Purchase: `$$($verifySettings.minPurchaseAmount)" -ForegroundColor Green
} catch {
    Write-Host "❌ Verification failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Success! Admin wallet addresses are now configured." -ForegroundColor Green
Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test a crypto purchase: http://localhost:3000/crypto/buy" -ForegroundColor White
Write-Host "  2. When users purchase crypto, they'll send to these addresses" -ForegroundColor White
Write-Host "  3. You approve orders in admin panel: http://localhost:3000/admin/crypto" -ForegroundColor White
Write-Host "`n⚠️  Note: XRP and XLM are not yet supported in the system." -ForegroundColor Yellow
Write-Host "   To add them, you'll need to update the schema and frontend." -ForegroundColor Yellow

# Save addresses to a reference file
$addressInfo = @"
# Admin Crypto Wallet Addresses
**Last Updated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Active Addresses (Configured)

### Bitcoin (BTC)
\`\`\`
$BTC_ADDRESS
\`\`\`

### Ethereum (ETH)
\`\`\`
$ETH_ADDRESS
\`\`\`

### Tether USDT (ERC-20)
\`\`\`
$USDT_ADDRESS
\`\`\`

## Future Expansion (Not Yet Supported)

### Ripple (XRP)
\`\`\`
$XRP_ADDRESS
\`\`\`
**Status:** Schema update required

### Stellar (XLM)
\`\`\`
$XLM_ADDRESS
\`\`\`
**Status:** Schema update required

## How to Add XRP/XLM Support

1. **Update Prisma Schema:**
   \`\`\`prisma
   model AdminSettings {
     // ... existing fields
     xrpAddress  String?
     xlmAddress  String?
   }
   \`\`\`

2. **Run Migration:**
   \`\`\`bash
   cd backend
   npx prisma migrate dev --name add_xrp_xlm_support
   \`\`\`

3. **Update Frontend Components:**
   - Add "XRP" and "XLM" to crypto selection dropdowns
   - Update LiveCryptoPrice to fetch XRP/XLM prices
   - Add wallet address validation for XRP/XLM formats

4. **Update Backend API:**
   - Add XRP/XLM to Binance API calls (if supported)
   - Or integrate alternative price API (CoinGecko, CoinMarketCap)
   - Update crypto.ts routes to handle XRP/XLM

5. **Update TokenWallet:**
   - Add xrpBalance and xlmBalance fields
   - Update transaction logic

## Security Notes

- ✅ Never commit wallet private keys to Git
- ✅ These are receiving addresses only (public addresses)
- ✅ Store private keys in hardware wallet or secure vault
- ✅ Use multi-signature wallets for high-value operations
- ✅ Regularly verify addresses match your actual wallets

## Testing Checklist

- [ ] Test BTC purchase → Verify address shown to user
- [ ] Test ETH purchase → Verify address shown to user
- [ ] Test USDT purchase → Verify address shown to user
- [ ] Admin approval flow → Verify crypto credited correctly
- [ ] Withdrawal flow → Verify external addresses work
"@

$addressInfo | Out-File -FilePath ".\ADMIN_WALLET_ADDRESSES.md" -Encoding UTF8
Write-Host "`n📄 Address reference saved to: ADMIN_WALLET_ADDRESSES.md" -ForegroundColor Cyan
