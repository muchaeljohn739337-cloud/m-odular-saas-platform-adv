# Cloudflare Setup Progress Tracker
# Run this to see what you've completed and what's next

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CLOUDFLARE SETUP PROGRESS TRACKER" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$domain = "advancia.com"
$progress = @{
    Total = 0
    Completed = 0
}

function Test-Step {
    param([string]$description, [scriptblock]$test, [string]$helpText = "")
    
    $progress.Total++
    Write-Host "  Testing: " -NoNewline -ForegroundColor Gray
    Write-Host $description -ForegroundColor White
    
    try {
        $result = & $test
        if ($result) {
            Write-Host "    ✅ Complete" -ForegroundColor Green
            $progress.Completed++
            return $true
        } else {
            Write-Host "    ⏳ Pending" -ForegroundColor Yellow
            if ($helpText) {
                Write-Host "    💡 $helpText" -ForegroundColor Cyan
            }
            return $false
        }
    } catch {
        Write-Host "    ⏳ Pending" -ForegroundColor Yellow
        if ($helpText) {
            Write-Host "    💡 $helpText" -ForegroundColor Cyan
        }
        return $false
    }
}

Write-Host "📍 STEP 1: NAMESERVER MIGRATION" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray

$nsCompleted = Test-Step -description "Cloudflare nameservers active" -test {
    try {
        $ns = Resolve-DnsName -Name $domain -Type NS -ErrorAction Stop
        $isCloudflare = $false
        foreach ($nameserver in $ns) {
            if ($nameserver.NameHost -like "*.ns.cloudflare.com") {
                $isCloudflare = $true
                break
            }
        }
        return $isCloudflare
    } catch {
        return $false
    }
} -helpText "Update nameservers at GoDaddy to Cloudflare's nameservers"

Write-Host ""

Write-Host "📍 STEP 2: DNS RECORDS CONFIGURATION" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray

Test-Step -description "api.$domain subdomain" -test {
    try {
        $result = Resolve-DnsName -Name "api.$domain" -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
} -helpText "Add CNAME: api → advancia-backend.onrender.com"

Test-Step -description "eth-gateway.$domain subdomain" -test {
    try {
        $result = Resolve-DnsName -Name "eth-gateway.$domain" -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
} -helpText "Add CNAME: eth-gateway → advancia-backend.onrender.com"

Write-Host ""

Write-Host "📍 STEP 3: SSL/TLS CONFIGURATION" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray

Test-Step -description "HTTPS on main domain" -test {
    try {
        $response = Invoke-WebRequest -Uri "https://$domain" -Method Head -TimeoutSec 10 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
} -helpText "Enable SSL in Cloudflare (Full strict mode)"

Test-Step -description "HTTPS on www subdomain" -test {
    try {
        $response = Invoke-WebRequest -Uri "https://www.$domain" -Method Head -TimeoutSec 10 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
} -helpText "Ensure www subdomain has SSL"

Write-Host ""

Write-Host "📍 STEP 4: API ENDPOINTS" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray

Test-Step -description "API health endpoint accessible" -test {
    try {
        $response = Invoke-WebRequest -Uri "https://api.$domain/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
} -helpText "Ensure DNS record exists and backend is running"

Test-Step -description "ETH gateway endpoint accessible" -test {
    try {
        $response = Invoke-WebRequest -Uri "https://eth-gateway.$domain" -Method Head -TimeoutSec 10 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
} -helpText "Ensure DNS record exists and routes to backend"

Write-Host ""

Write-Host "📍 STEP 5: EMAIL ROUTING" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray

$mxCloudflare = Test-Step -description "Cloudflare MX records configured" -test {
    try {
        $mx = Resolve-DnsName -Name $domain -Type MX -ErrorAction Stop
        $hasCloudflare = $false
        foreach ($record in $mx) {
            if ($record.NameExchange -like "*cloudflare.net") {
                $hasCloudflare = $true
                break
            }
        }
        return $hasCloudflare
    } catch {
        return $false
    }
} -helpText "Enable Email Routing in Cloudflare dashboard"

Write-Host ""
Write-Host "  📧 Email addresses to create (after MX setup):" -ForegroundColor Cyan
Write-Host "     • support@$domain" -ForegroundColor White
Write-Host "     • admin@$domain" -ForegroundColor White
Write-Host "     • noreply@$domain" -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PROGRESS SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$percentComplete = [math]::Round(($progress.Completed / $progress.Total) * 100, 0)
$progressBar = ""
$completed = [math]::Floor($percentComplete / 10)
$remaining = 10 - $completed

for ($i = 0; $i -lt $completed; $i++) { $progressBar += "█" }
for ($i = 0; $i -lt $remaining; $i++) { $progressBar += "░" }

Write-Host "  Progress: " -NoNewline
Write-Host $progressBar -NoNewline -ForegroundColor Green
Write-Host " $percentComplete% " -ForegroundColor White
Write-Host "  Completed: $($progress.Completed) / $($progress.Total) steps" -ForegroundColor White
Write-Host ""

if ($percentComplete -eq 100) {
    Write-Host "  🎉 ALL STEPS COMPLETE! Your Cloudflare setup is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Final verification:" -ForegroundColor Cyan
    Write-Host "  1. Test website: https://$domain" -ForegroundColor White
    Write-Host "  2. Test API: https://api.$domain/health" -ForegroundColor White
    Write-Host "  3. Send test email to: support@$domain" -ForegroundColor White
} elseif ($percentComplete -ge 50) {
    Write-Host "  🚀 You're making great progress!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next priority steps:" -ForegroundColor Cyan
    if (-not $nsCompleted) {
        Write-Host "  • Update nameservers at GoDaddy (most important!)" -ForegroundColor Yellow
    }
    if (-not $mxCloudflare) {
        Write-Host "  • Enable Email Routing in Cloudflare" -ForegroundColor Yellow
    }
} else {
    Write-Host "  📝 Just getting started - follow the guide!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Start here:" -ForegroundColor Cyan
    Write-Host "  1. Read: CLOUDFLARE_NEXT_STEPS.md" -ForegroundColor White
    Write-Host "  2. Update nameservers at GoDaddy" -ForegroundColor White
    Write-Host "  3. Add DNS records in Cloudflare" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • Full guide: CLOUDFLARE_NEXT_STEPS.md" -ForegroundColor White
Write-Host "   • Email setup: CLOUDFLARE_EMAIL_SETUP.md" -ForegroundColor White
Write-Host "   • Run diagnostics: .\Check-Cloudflare-Setup.ps1" -ForegroundColor White
Write-Host ""

# Save progress report
$reportFile = "cloudflare-progress.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$report = @"
Cloudflare Setup Progress Report
Generated: $timestamp
Domain: $domain

Progress: $($progress.Completed) / $($progress.Total) steps ($percentComplete%)

Status:
- Nameservers: $(if($nsCompleted){"✅"}else{"⏳"})
- DNS Records: In progress
- SSL/TLS: In progress  
- Email Routing: $(if($mxCloudflare){"✅"}else{"⏳"})
- API Endpoints: Testing

Next Steps:
$(if(-not $nsCompleted){"1. Update nameservers at GoDaddy to Cloudflare"}else{"✓ Nameservers updated"})
$(if(-not $mxCloudflare){"2. Enable Email Routing in Cloudflare"}else{"✓ Email Routing enabled"})
3. Add CNAME records for api and eth-gateway subdomains
4. Configure SSL to Full (strict) mode
5. Test all endpoints and email forwarding
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8
Write-Host "💾 Progress saved to: $reportFile" -ForegroundColor Green
Write-Host ""
