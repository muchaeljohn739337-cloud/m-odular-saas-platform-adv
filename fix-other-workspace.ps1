# Script to fix TypeScript deprecation warnings in saas-fullstack workspace

$workspacePath = "c:\Users\mucha\workspace\saas-fullstack"

Write-Host "Fixing TypeScript configurations in $workspacePath..." -ForegroundColor Cyan

# Fix backend tsconfig.json
$backendTsConfig = "$workspacePath\backend\tsconfig.json"
if (Test-Path $backendTsConfig) {
    $content = Get-Content $backendTsConfig -Raw
    $content = $content -replace '"moduleResolution":\s*"node"', '"moduleResolution": "node16"'
    Set-Content $backendTsConfig -Value $content
    Write-Host "✓ Fixed backend/tsconfig.json" -ForegroundColor Green
}

# Fix frontend tsconfig.json
$frontendTsConfig = "$workspacePath\frontend\tsconfig.json"
if (Test-Path $frontendTsConfig) {
    $content = Get-Content $frontendTsConfig -Raw
    $content = $content -replace '"moduleResolution":\s*"node"', '"moduleResolution": "bundler"'
    # Remove deprecated baseUrl or comment it out
    $content = $content -replace '(\s*)"baseUrl":\s*"[^"]*",?', '$1// "baseUrl": ".", // Deprecated - use paths instead'
    Set-Content $frontendTsConfig -Value $content
    Write-Host "✓ Fixed frontend/tsconfig.json" -ForegroundColor Green
}

# Fix root tsconfig.json
$rootTsConfig = "$workspacePath\tsconfig.json"
if (Test-Path $rootTsConfig) {
    $content = Get-Content $rootTsConfig -Raw
    $content = $content -replace '"moduleResolution":\s*"node"', '"moduleResolution": "bundler"'
    # Remove deprecated baseUrl or comment it out
    $content = $content -replace '(\s*)"baseUrl":\s*"[^"]*",?', '$1// "baseUrl": ".", // Deprecated - use paths instead'
    Set-Content $rootTsConfig -Value $content
    Write-Host "✓ Fixed root tsconfig.json" -ForegroundColor Green
}

Write-Host "`nAll TypeScript configurations updated!" -ForegroundColor Green
Write-Host "The deprecated 'node' moduleResolution has been updated to 'node16' or 'bundler'." -ForegroundColor Yellow
Write-Host "The deprecated 'baseUrl' option has been commented out." -ForegroundColor Yellow
