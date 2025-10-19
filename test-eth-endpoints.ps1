# ETH Endpoints Test Script
Write-Host "🧪 Testing Ethereum Functionality" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Wait for server to be ready
Write-Host "⏳ Waiting for backend server..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$baseUrl = "http://localhost:4000"

# Test 1: ETH Gateway Health
Write-Host "`n1️⃣ Testing ETH Gateway Health" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/eth/health" -Method Get
    Write-Host "✅ Gateway Status: " -NoNewline
    Write-Host $response.isConnected -ForegroundColor $(if($response.isConnected){"Green"}else{"Red"})
    Write-Host "   Network: $($response.network.name) (Chain ID: $($response.network.chainId))"
    Write-Host "   Block Number: $($response.blockNumber)"
    Write-Host "   Gas Price: $($response.gasPrice.gwei) Gwei"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get Gas Price
Write-Host "`n2️⃣ Testing Gas Price Endpoint" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/eth/gas-price" -Method Get
    Write-Host "✅ Current Gas Price: $($response.gasPrice.gwei) Gwei"
    Write-Host "   Wei: $($response.gasPrice.wei)"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Block Number
Write-Host "`n3️⃣ Testing Block Number Endpoint" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/eth/block-number" -Method Get
    Write-Host "✅ Latest Block: $($response.blockNumber)"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get ETH Balance
Write-Host "`n4️⃣ Testing ETH Balance Endpoint" -ForegroundColor Green
$testAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"  # Vitalik's address
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/eth/balance/$testAddress" -Method Get
    Write-Host "✅ Balance for $testAddress"
    Write-Host "   ETH: $($response.balance.eth)"
    Write-Host "   Wei: $($response.balance.wei)"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Network Info
Write-Host "`n5️⃣ Testing Network Info Endpoint" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/eth/network" -Method Get
    Write-Host "✅ Network: $($response.name)"
    Write-Host "   Chain ID: $($response.chainId)"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Estimate Gas Cost
Write-Host "`n6️⃣ Testing Gas Cost Estimation" -ForegroundColor Green
try {
    $body = @{
    toAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        amountEth = 0.1
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/eth/estimate-cost" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Estimated Gas Cost for 0.1 ETH transfer:"
    Write-Host "   Gas Price: $($response.gasPrice.gwei) Gwei"
    Write-Host "   Estimated Gas Fee: $($response.estimatedGasFee.eth) ETH"
    Write-Host "   Total Cost: $($response.totalCost.eth) ETH"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get Recent Transaction (Example)
Write-Host "`n7️⃣ Testing Transaction Lookup" -ForegroundColor Green
$recentTxHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/eth/transaction/$recentTxHash" -Method Get
    Write-Host "✅ Transaction found"
} catch {
    Write-Host "⚠️ Transaction not found (expected for test hash)" -ForegroundColor Yellow
}

# Test 8: Test Withdrawal Endpoint (Mock)
Write-Host "`n8️⃣ Testing Withdrawal Endpoint" -ForegroundColor Green
try {
    $body = @{
        userId = "test-user-123"
    toAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        amountEth = 0.5
        note = "Test withdrawal"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/eth/withdrawal" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Withdrawal Request Created:"
    Write-Host "   Withdrawal ID: $($response.withdrawalId)"
    Write-Host "   Status: $($response.status)"
    Write-Host "   Amount: $($response.amountEth) ETH"
    Write-Host "   Gas Fee: $($response.estimatedGasFee) ETH"
    Write-Host "   Total Cost: $($response.totalCost) ETH"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "✅ ETH Functionality Tests Complete!" -ForegroundColor Green
Write-Host ""
