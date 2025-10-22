# Update Environment Variables for Cloudflare Domain
# Run this after Cloudflare nameservers are active

Write-Host "🌐 Updating Environment Variables for Cloudflare" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$ZONE_ID = "0bff66558872c58ed5b8b7942acc34d9"
$ACCOUNT_ID = "74ecde4d46d4b399c7295cf599d2886b"
$DOMAIN = "advanciapayledger.com"

# Prompt for API Token
Write-Host "📝 Cloudflare API Token" -ForegroundColor Yellow
Write-Host "If you don't have one, create it at:" -ForegroundColor Gray
Write-Host "https://dash.cloudflare.com/profile/api-tokens`n" -ForegroundColor Gray

$API_TOKEN = Read-Host "Enter your Cloudflare API Token (or press Enter to skip)"

# Backend .env file
$backendEnvPath = ".\backend\.env"
Write-Host "`n📁 Updating backend .env file..." -ForegroundColor Cyan

if (Test-Path $backendEnvPath) {
    $envContent = Get-Content $backendEnvPath -Raw
    
    # Update or add Cloudflare variables
    if ($envContent -match "CLOUDFLARE_ZONE_ID=") {
        $envContent = $envContent -replace "CLOUDFLARE_ZONE_ID=.*", "CLOUDFLARE_ZONE_ID=$ZONE_ID"
    } else {
        $envContent += "`nCLOUDFLARE_ZONE_ID=$ZONE_ID"
    }
    
    if ($envContent -match "CLOUDFLARE_ACCOUNT_ID=") {
        $envContent = $envContent -replace "CLOUDFLARE_ACCOUNT_ID=.*", "CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID"
    } else {
        $envContent += "`nCLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID"
    }
    
    if ($API_TOKEN) {
        if ($envContent -match "CLOUDFLARE_API_TOKEN=") {
            $envContent = $envContent -replace "CLOUDFLARE_API_TOKEN=.*", "CLOUDFLARE_API_TOKEN=$API_TOKEN"
        } else {
            $envContent += "`nCLOUDFLARE_API_TOKEN=$API_TOKEN"
        }
    }
    
    # Update domain variables
    if ($envContent -match "DOMAIN=") {
        $envContent = $envContent -replace "DOMAIN=.*", "DOMAIN=$DOMAIN"
    } else {
        $envContent += "`nDOMAIN=$DOMAIN"
    }
    
    if ($envContent -match "FRONTEND_URL=") {
        $envContent = $envContent -replace "FRONTEND_URL=.*", "FRONTEND_URL=https://$DOMAIN"
    } else {
        $envContent += "`nFRONTEND_URL=https://$DOMAIN"
    }
    
    if ($envContent -match "BACKEND_URL=") {
        $envContent = $envContent -replace "BACKEND_URL=.*", "BACKEND_URL=https://api.$DOMAIN"
    } else {
        $envContent += "`nBACKEND_URL=https://api.$DOMAIN"
    }
    
    # Update ALLOWED_ORIGINS
    $newOrigins = "https://$DOMAIN,https://www.$DOMAIN,https://admin.$DOMAIN,https://api.$DOMAIN"
    if ($envContent -match "ALLOWED_ORIGINS=") {
        # Get existing origins and merge
        if ($envContent -match "ALLOWED_ORIGINS=(.*)") {
            $existingOrigins = $matches[1].Trim()
            # Add localhost origins if they exist
            if ($existingOrigins -match "localhost") {
                $newOrigins += ",http://localhost:3000,http://localhost:4000"
            }
        }
        $envContent = $envContent -replace "ALLOWED_ORIGINS=.*", "ALLOWED_ORIGINS=$newOrigins"
    } else {
        $envContent += "`nALLOWED_ORIGINS=$newOrigins"
    }
    
    Set-Content -Path $backendEnvPath -Value $envContent
    Write-Host "✅ Backend .env updated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend .env not found at $backendEnvPath" -ForegroundColor Yellow
}

# Frontend .env.local file
$frontendEnvPath = ".\frontend\.env.local"
Write-Host "📁 Updating frontend .env.local file..." -ForegroundColor Cyan

if (Test-Path $frontendEnvPath) {
    $envContent = Get-Content $frontendEnvPath -Raw
    
    if ($envContent -match "NEXT_PUBLIC_API_URL=") {
        $envContent = $envContent -replace "NEXT_PUBLIC_API_URL=.*", "NEXT_PUBLIC_API_URL=https://api.$DOMAIN"
    } else {
        $envContent += "`nNEXT_PUBLIC_API_URL=https://api.$DOMAIN"
    }
    
    if ($envContent -match "NEXT_PUBLIC_DOMAIN=") {
        $envContent = $envContent -replace "NEXT_PUBLIC_DOMAIN=.*", "NEXT_PUBLIC_DOMAIN=$DOMAIN"
    } else {
        $envContent += "`nNEXT_PUBLIC_DOMAIN=$DOMAIN"
    }
    
    Set-Content -Path $frontendEnvPath -Value $envContent
    Write-Host "✅ Frontend .env.local updated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env.local not found, creating new file..." -ForegroundColor Yellow
    $newEnvContent = @"
NEXT_PUBLIC_API_URL=https://api.$DOMAIN
NEXT_PUBLIC_DOMAIN=$DOMAIN
"@
    Set-Content -Path $frontendEnvPath -Value $newEnvContent
    Write-Host "✅ Frontend .env.local created" -ForegroundColor Green
}

# Summary
Write-Host "`n📊 Configuration Summary" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "Domain:        $DOMAIN" -ForegroundColor White
Write-Host "Frontend URL:  https://$DOMAIN" -ForegroundColor White
Write-Host "API URL:       https://api.$DOMAIN" -ForegroundColor White
Write-Host "Admin URL:     https://admin.$DOMAIN" -ForegroundColor White
Write-Host "Zone ID:       $ZONE_ID" -ForegroundColor Gray
Write-Host "Account ID:    $ACCOUNT_ID" -ForegroundColor Gray

if ($API_TOKEN) {
    Write-Host "API Token:     ********** (configured)" -ForegroundColor Green
} else {
    Write-Host "API Token:     Not configured (run script again to add)" -ForegroundColor Yellow
}

Write-Host "`n⏳ Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update nameservers at your domain registrar:" -ForegroundColor White
Write-Host "   - dom.ns.cloudflare.com" -ForegroundColor Gray
Write-Host "   - monroe.ns.cloudflare.com" -ForegroundColor Gray
Write-Host "2. Wait 2-48 hours for DNS propagation" -ForegroundColor White
Write-Host "3. Configure DNS records in Cloudflare dashboard" -ForegroundColor White
Write-Host "4. Set SSL/TLS mode to 'Full (strict)'" -ForegroundColor White
Write-Host "5. Add firewall rules for security" -ForegroundColor White
Write-Host "6. Update environment variables in Render/Vercel" -ForegroundColor White

Write-Host "`n✅ Environment variables updated successfully!" -ForegroundColor Green
Write-Host "Run 'git status' to see changes (DO NOT COMMIT .env files!)" -ForegroundColor Yellow
