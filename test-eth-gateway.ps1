# 🌐 Ethereum Gateway Test Script
# Tests all Ethereum gateway endpoints

Write-Host "🌐 Testing Ethereum Gateway Integration..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:4000/api/eth"
$script:passCount = 0
$script:failCount = 0

function Test-EthEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-Host "🧪 Testing: $Name" -ForegroundColor Yellow
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 30
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = 'application/json'
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "✅ $Name - SUCCESS" -ForegroundColor Green
        $script:passCount++
        return @{ Success = $true; Data = $response }
    } catch {
        Write-Host "❌ $Name - FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:failCount++
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# ============================================
# 1. GATEWAY HEALTH CHECK
# ============================================
Write-Host ""
Write-Host "📡 1. TESTING GATEWAY HEALTH" -ForegroundColor Magenta
Write-Host "----------------------------" -ForegroundColor Magenta

$healthResult = Test-EthEndpoint -Name "Gateway Health" -Url "$baseUrl/health"

if ($healthResult.Success) {
    $health = $healthResult.Data
    Write-Host "   Status: $($health.status)" -ForegroundColor Cyan
    Write-Host "   Network: $($health.network.name) (Chain ID: $($health.network.chainId))" -ForegroundColor Cyan
    Write-Host "   Current Block: $($health.currentBlock)" -ForegroundColor Cyan
    Write-Host "   Gas Price: $($health.gasPriceGwei) Gwei" -ForegroundColor Cyan
    Write-Host "   Gateway: $($health.gateway)" -ForegroundColor Cyan
}

# ============================================
# 2. GET BALANCE (VITALIK'S WALLET)
# ============================================
Write-Host ""
Write-Host "💰 2. TESTING BALANCE LOOKUP" -ForegroundColor Magenta
Write-Host "----------------------------" -ForegroundColor Magenta

# Vitalik Buterin's public address
$vitalikAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

$balanceResult = Test-EthEndpoint -Name "Get ETH Balance" -Url "$baseUrl/balance/$vitalikAddress"

if ($balanceResult.Success) {
    $balance = $balanceResult.Data
    Write-Host "   Address: $($balance.address)" -ForegroundColor Cyan
    Write-Host "   Balance: $($balance.balance) ETH" -ForegroundColor Cyan
}

# ============================================
# 3. GET GAS PRICE
# ============================================
Write-Host ""
Write-Host "⛽ 3. TESTING GAS PRICE LOOKUP" -ForegroundColor Magenta
Write-Host "------------------------------" -ForegroundColor Magenta

$gasPriceResult = Test-EthEndpoint -Name "Get Gas Price" -Url "$baseUrl/gas-price"

if ($gasPriceResult.Success) {
    $gasPrice = $gasPriceResult.Data
    Write-Host "   Gas Price: $($gasPrice.gasPriceGwei) Gwei" -ForegroundColor Cyan
    Write-Host "   Gas Price (Wei): $($gasPrice.gasPriceWei)" -ForegroundColor Cyan
}

# ============================================
# 4. GET BLOCK NUMBER
# ============================================
Write-Host ""
Write-Host "🔢 4. TESTING BLOCK NUMBER" -ForegroundColor Magenta
Write-Host "--------------------------" -ForegroundColor Magenta

$blockResult = Test-EthEndpoint -Name "Get Block Number" -Url "$baseUrl/block-number"

if ($blockResult.Success) {
    $block = $blockResult.Data
    Write-Host "   Current Block: $($block.blockNumber)" -ForegroundColor Cyan
}

# ============================================
# 5. ESTIMATE TRANSACTION COST
# ============================================
Write-Host ""
Write-Host "💸 5. TESTING COST ESTIMATION" -ForegroundColor Magenta
Write-Host "-----------------------------" -ForegroundColor Magenta

$estimateBody = @{
    toAddress = $vitalikAddress
    amountEth = 0.1
}

$estimateResult = Test-EthEndpoint -Name "Estimate Transfer Cost" -Url "$baseUrl/estimate-cost" -Method "POST" -Body $estimateBody

if ($estimateResult.Success) {
    $estimate = $estimateResult.Data
    Write-Host "   Sending: $($estimate.amountEth) ETH" -ForegroundColor Cyan
    Write-Host "   Gas Limit: $($estimate.gasLimit)" -ForegroundColor Cyan
    Write-Host "   Gas Price: $($estimate.gasPriceGwei) Gwei" -ForegroundColor Cyan
    Write-Host "   Estimated Gas Cost: $($estimate.estimatedCostEth) ETH" -ForegroundColor Cyan
    Write-Host "   Total Cost: $($estimate.totalCostEth) ETH" -ForegroundColor Cyan
}

# ============================================
# 6. GET NETWORK INFO
# ============================================
Write-Host ""
Write-Host "🌐 6. TESTING NETWORK INFO" -ForegroundColor Magenta
Write-Host "--------------------------" -ForegroundColor Magenta

$networkResult = Test-EthEndpoint -Name "Get Network Info" -Url "$baseUrl/network"

if ($networkResult.Success) {
    $network = $networkResult.Data
    Write-Host "   Network Name: $($network.name)" -ForegroundColor Cyan
    Write-Host "   Chain ID: $($network.chainId)" -ForegroundColor Cyan
}

# ============================================
# 7. TEST TRANSACTION LOOKUP (EXAMPLE)
# ============================================
Write-Host ""
Write-Host "🔍 7. TESTING TRANSACTION LOOKUP" -ForegroundColor Magenta
Write-Host "--------------------------------" -ForegroundColor Magenta

# Famous Ethereum transaction (First ever ETH transaction)
$txHash = "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060"

$txResult = Test-EthEndpoint -Name "Get Transaction" -Url "$baseUrl/transaction/$txHash"

if ($txResult.Success) {
    Write-Host "   ✅ Transaction found!" -ForegroundColor Green
    Write-Host "   From: $($txResult.Data.from)" -ForegroundColor Gray
    Write-Host "   To: $($txResult.Data.to)" -ForegroundColor Gray
    Write-Host "   Block: $($txResult.Data.blockNumber)" -ForegroundColor Gray
}

# ============================================
# SUMMARY
# ============================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 ETHEREUM GATEWAY TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = $script:passCount + $script:failCount
$successRate = if ($totalTests -gt 0) { [math]::Round(($script:passCount / $totalTests) * 100, 1) } else { 0 }

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "✅ Passed: $script:passCount" -ForegroundColor Green

if ($script:failCount -gt 0) {
    Write-Host "❌ Failed: $script:failCount" -ForegroundColor Red
} else {
    Write-Host "❌ Failed: 0" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 85) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

if ($successRate -eq 100) {
    Write-Host "🎉 PERFECT! Ethereum gateway is fully functional!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Gateway URL: https://eth-gateway.advancia.com" -ForegroundColor Cyan
    Write-Host "✅ All endpoints responding correctly" -ForegroundColor Cyan
    Write-Host "✅ Real-time Ethereum data available" -ForegroundColor Cyan
} elseif ($successRate -ge 70) {
    Write-Host "✅ GOOD! Most gateway features working" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  ISSUES DETECTED! Check backend logs" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Ensure backend is running" -ForegroundColor White
    Write-Host "  2. Check ETH_PROVIDER_URL in .env" -ForegroundColor White
    Write-Host "  3. Verify Cloudflare gateway is accessible" -ForegroundColor White
    Write-Host "  4. Check internet connection" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
