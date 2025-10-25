# Generate secure random keys
$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
$random = New-Object System.Random

function New-RandomKey {
    $key = ""
    for ($i = 0; $i -lt 44; $i++) {
        $key += $chars[$random.Next($chars.Length)]
    }
    return $key
}

Write-Host "=== STAGING ENVIRONMENT ===" -ForegroundColor Green
Write-Host "STAGING_API_KEY=$(New-RandomKey)"
Write-Host "STAGING_JWT_SECRET=$(New-RandomKey)"

Write-Host ""
Write-Host "=== PRODUCTION ENVIRONMENT ===" -ForegroundColor Green
Write-Host "PRODUCTION_API_KEY=$(New-RandomKey)"
Write-Host "PRODUCTION_JWT_SECRET=$(New-RandomKey)"

Write-Host ""
Write-Host "Copy these keys to:" -ForegroundColor Yellow
Write-Host "1. Render Dashboard Environment Variables"
Write-Host "2. Your local .env file (for testing)"
