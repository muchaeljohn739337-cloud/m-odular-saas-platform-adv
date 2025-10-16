# Start backend and frontend servers in separate terminals reliably

Write-Host "`n=== Starting Servers ===" -ForegroundColor Green

# Start Backend
Write-Output "Launching backend (port 4000)..."
Start-Process pwsh -ArgumentList '-NoExit','-Command','cd "$PSScriptRoot/backend"; $env:NODE_ENV="development"; npm run dev'

Start-Sleep -Seconds 2

# Start Frontend
Write-Output "Launching frontend (port 3000)..."
Start-Process pwsh -ArgumentList '-NoExit','-Command','cd "$PSScriptRoot/frontend"; npm run dev'

Write-Host "`nTip: When both are up, run .\\Setup-CryptoSystem.ps1 in this window." -ForegroundColor Yellow
