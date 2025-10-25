# Botpress Setup Helper Script
# Run this script after you've obtained your Bot ID from Botpress Cloud

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "    Botpress Setup Helper for Advancia" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Botpress CLI is installed
Write-Host "Checking Botpress CLI installation..." -ForegroundColor Yellow
$bpVersion = bp --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Botpress CLI is installed: $bpVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Botpress CLI not found. Installing..." -ForegroundColor Red
    npm install -g @botpress/cli
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Botpress CLI installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install Botpress CLI" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "STEP 1: Login to Botpress Cloud" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need a Personal Access Token (PAT) from Botpress Cloud." -ForegroundColor Yellow
Write-Host ""
Write-Host "To get your PAT:" -ForegroundColor White
Write-Host "1. Go to https://app.botpress.cloud/" -ForegroundColor White
Write-Host "2. Sign up or login" -ForegroundColor White
Write-Host "3. Go to Account Settings > API Tokens" -ForegroundColor White
Write-Host "4. Click 'Generate New Token'" -ForegroundColor White
Write-Host "5. Copy the token" -ForegroundColor White
Write-Host ""

$loginChoice = Read-Host "Do you have your PAT ready? (y/n)"
if ($loginChoice -eq 'y') {
    Write-Host ""
    Write-Host "Running 'bp login'..." -ForegroundColor Yellow
    Write-Host "Paste your Personal Access Token when prompted." -ForegroundColor Yellow
    bp login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully logged in to Botpress!" -ForegroundColor Green
    } else {
        Write-Host "✗ Login failed. Please check your token." -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative: You can create your bot directly in Botpress Cloud UI" -ForegroundColor Yellow
        Write-Host "Visit: https://app.botpress.cloud/" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "Please get your PAT first, then run this script again." -ForegroundColor Yellow
    Write-Host "Or create your bot directly at: https://app.botpress.cloud/" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "STEP 2: Create Bot Project" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$createChoice = Read-Host "Do you want to create 'advancia-bot' project? (y/n)"
if ($createChoice -eq 'y') {
    Write-Host ""
    Write-Host "Creating bot project..." -ForegroundColor Yellow
    bp create advancia-bot
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Bot project created successfully!" -ForegroundColor Green
        
        # Try to read Bot ID from config
        if (Test-Path "advancia-bot/bot.config.json") {
            Write-Host ""
            Write-Host "Reading bot configuration..." -ForegroundColor Yellow
            $botConfig = Get-Content "advancia-bot/bot.config.json" | ConvertFrom-Json
            $botId = $botConfig.id
            
            if ($botId) {
                Write-Host "✓ Found Bot ID: $botId" -ForegroundColor Green
                
                # Update backend .env
                $backendEnvPath = "backend\.env"
                if (Test-Path $backendEnvPath) {
                    Write-Host ""
                    Write-Host "Updating backend/.env..." -ForegroundColor Yellow
                    $envContent = Get-Content $backendEnvPath -Raw
                    
                    if ($envContent -match "BOTPRESS_BOT_ID=") {
                        $envContent = $envContent -replace "BOTPRESS_BOT_ID=.*", "BOTPRESS_BOT_ID=$botId"
                    } else {
                        $envContent += "`n`n# Botpress Configuration`nBOTPRESS_BOT_ID=$botId`n"
                    }
                    
                    Set-Content -Path $backendEnvPath -Value $envContent
                    Write-Host "✓ Backend .env updated!" -ForegroundColor Green
                } else {
                    Write-Host "! Backend .env not found. Please create it manually." -ForegroundColor Yellow
                }
                
                # Update frontend .env.local
                $frontendEnvPath = "frontend\.env.local"
                if (Test-Path $frontendEnvPath) {
                    Write-Host "Updating frontend/.env.local..." -ForegroundColor Yellow
                    $envContent = Get-Content $frontendEnvPath -Raw
                    
                    if ($envContent -match "NEXT_PUBLIC_BOTPRESS_BOT_ID=") {
                        $envContent = $envContent -replace "NEXT_PUBLIC_BOTPRESS_BOT_ID=.*", "NEXT_PUBLIC_BOTPRESS_BOT_ID=$botId"
                    } else {
                        $envContent += "`n`n# Botpress Configuration`nNEXT_PUBLIC_BOTPRESS_BOT_ID=$botId`n"
                    }
                    
                    Set-Content -Path $frontendEnvPath -Value $envContent
                    Write-Host "✓ Frontend .env.local updated!" -ForegroundColor Green
                } else {
                    Write-Host "! Frontend .env.local not found. Creating it..." -ForegroundColor Yellow
                    $newEnvContent = "# Botpress Configuration`nNEXT_PUBLIC_BOTPRESS_BOT_ID=$botId`n"
                    Set-Content -Path $frontendEnvPath -Value $newEnvContent
                    Write-Host "✓ Frontend .env.local created!" -ForegroundColor Green
                }
            }
        }
    } else {
        Write-Host "✗ Failed to create bot project" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "STEP 3: Next Steps" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start bot development:" -ForegroundColor White
Write-Host "  cd advancia-bot" -ForegroundColor Yellow
Write-Host "  bp start" -ForegroundColor Yellow
Write-Host ""
Write-Host "To deploy your bot to production:" -ForegroundColor White
Write-Host "  cd advancia-bot" -ForegroundColor Yellow
Write-Host "  bp deploy" -ForegroundColor Yellow
Write-Host ""
Write-Host "To add chatbot widget to frontend:" -ForegroundColor White
Write-Host "  Edit frontend/src/app/layout.tsx" -ForegroundColor Yellow
Write-Host "  Add: import ChatbotWidget from '@/components/ChatbotWidget'" -ForegroundColor Yellow
Write-Host "  Add: <ChatbotWidget /> before </body>" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test the API:" -ForegroundColor White
Write-Host "  cd backend && npm run dev" -ForegroundColor Yellow
Write-Host "  Invoke-RestMethod -Uri 'http://localhost:4000/api/chatbot/health'" -ForegroundColor Yellow
Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor White
Write-Host "  - BOTPRESS_MANUAL_SETUP.md" -ForegroundColor Cyan
Write-Host "  - CHATBOT_IMPLEMENTATION_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
