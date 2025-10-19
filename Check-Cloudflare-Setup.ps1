# Cloudflare Domain & Email Setup Checker
# Run this script to verify your domain and email configuration

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CLOUDFLARE DOMAIN & EMAIL SETUP VERIFICATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$domain = "advancia.com"  # Your main domain
$subdomains = @("api", "www", "eth-gateway", "mail")

Write-Host "🔍 Checking Domain: $domain" -ForegroundColor Yellow
Write-Host ""

# Function to check DNS records
function Test-DNSRecord {
    param([string]$hostname, [string]$recordType = "A")
    
    Write-Host "  Checking $recordType record for: $hostname" -ForegroundColor Gray
    try {
        $result = Resolve-DnsName -Name $hostname -Type $recordType -ErrorAction Stop
        Write-Host "  ✅ $recordType record found" -ForegroundColor Green
        foreach ($record in $result) {
            if ($recordType -eq "A") {
                Write-Host "     IP: $($record.IPAddress)" -ForegroundColor White
            } elseif ($recordType -eq "MX") {
                Write-Host "     Mail Server: $($record.NameExchange) (Priority: $($record.Preference))" -ForegroundColor White
            } elseif ($recordType -eq "TXT") {
                Write-Host "     TXT: $($record.Strings)" -ForegroundColor White
            } elseif ($recordType -eq "CNAME") {
                Write-Host "     Points to: $($record.NameHost)" -ForegroundColor White
            }
        }
        return $true
    } catch {
        Write-Host "  ❌ No $recordType record found" -ForegroundColor Red
        return $false
    }
}

# Function to test HTTP/HTTPS connectivity
function Test-WebEndpoint {
    param([string]$url)
    
    Write-Host "  Testing: $url" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -ErrorAction Stop
        Write-Host "  ✅ Accessible (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ❌ Not accessible: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 1. Check Main Domain
Write-Host "1️⃣  MAIN DOMAIN CHECK" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray
$mainDomainExists = Test-DNSRecord -hostname $domain -recordType "A"
Test-DNSRecord -hostname $domain -recordType "AAAA" | Out-Null  # IPv6
Write-Host ""

# 2. Check Subdomains
Write-Host "2️⃣  SUBDOMAIN CHECK" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray
$subdomainResults = @{}
foreach ($sub in $subdomains) {
    $fullDomain = "$sub.$domain"
    Write-Host "  Subdomain: $fullDomain" -ForegroundColor Yellow
    $subdomainResults[$sub] = Test-DNSRecord -hostname $fullDomain -recordType "A"
    if (-not $subdomainResults[$sub]) {
        Test-DNSRecord -hostname $fullDomain -recordType "CNAME" | Out-Null
    }
    Write-Host ""
}

# 3. Check Email (MX) Records
Write-Host "3️⃣  EMAIL (MX) RECORDS CHECK" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray
$mxExists = Test-DNSRecord -hostname $domain -recordType "MX"
Write-Host ""

# 4. Check SPF/DKIM/DMARC Records
Write-Host "4️⃣  EMAIL AUTHENTICATION RECORDS" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  Checking SPF (TXT record)..." -ForegroundColor Gray
Test-DNSRecord -hostname $domain -recordType "TXT" | Out-Null
Write-Host ""
Write-Host "  Checking DMARC..." -ForegroundColor Gray
Test-DNSRecord -hostname "_dmarc.$domain" -recordType "TXT" | Out-Null
Write-Host ""

# 5. Check Cloudflare Nameservers
Write-Host "5️⃣  NAMESERVER CHECK" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  Checking nameservers for $domain" -ForegroundColor Gray
try {
    $ns = Resolve-DnsName -Name $domain -Type NS -ErrorAction Stop
    $isCloudflare = $false
    Write-Host "  Current Nameservers:" -ForegroundColor White
    foreach ($nameserver in $ns) {
        Write-Host "     • $($nameserver.NameHost)" -ForegroundColor White
        if ($nameserver.NameHost -like "*.ns.cloudflare.com") {
            $isCloudflare = $true
        }
    }
    if ($isCloudflare) {
        Write-Host "  ✅ Using Cloudflare nameservers" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Not using Cloudflare nameservers" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Could not resolve nameservers" -ForegroundColor Red
}
Write-Host ""

# 6. Test Web Endpoints
Write-Host "6️⃣  WEB ENDPOINT CONNECTIVITY" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray
$endpoints = @(
    "https://$domain",
    "https://www.$domain",
    "https://api.$domain/health",
    "https://eth-gateway.$domain"
)

foreach ($endpoint in $endpoints) {
    Test-WebEndpoint -url $endpoint
}
Write-Host ""

# 7. Summary & Recommendations
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SUMMARY & NEXT STEPS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($mainDomainExists) {
    Write-Host "✅ Domain $domain is resolving correctly" -ForegroundColor Green
} else {
    Write-Host "❌ Domain $domain is NOT resolving" -ForegroundColor Red
    Write-Host "   👉 Add your domain to Cloudflare first" -ForegroundColor Yellow
}

if ($mxExists) {
    Write-Host "✅ Email (MX) records are configured" -ForegroundColor Green
} else {
    Write-Host "❌ No email (MX) records found" -ForegroundColor Red
    Write-Host "   👉 Set up Cloudflare Email Routing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 SETUP GUIDES GENERATED:" -ForegroundColor Cyan
Write-Host "   • CLOUDFLARE_EMAIL_SETUP.md - Email routing configuration" -ForegroundColor White
Write-Host "   • CLOUDFLARE_DOMAIN_SETUP.md - Complete domain setup" -ForegroundColor White
Write-Host ""

# Save results to file
$reportFile = "cloudflare-check-results.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$subdomainList = $subdomains | ForEach-Object { "  - $_.$domain`: $(if($subdomainResults[$_]){'✅'}else{'❌'})" }
$subdomainText = $subdomainList -join "`n"

$report = @"
Cloudflare Domain & Email Check Report
Generated: $timestamp
Domain: $domain

Main Domain: $(if($mainDomainExists){"✅ Configured"}else{"❌ Not Configured"})
MX Records: $(if($mxExists){"✅ Configured"}else{"❌ Not Configured"})

Subdomains:
$subdomainText

Next Steps:
1. $(if(-not $mainDomainExists){"Add domain to Cloudflare"}else{"Domain OK"})
2. $(if(-not $mxExists){"Configure Email Routing"}else{"Email OK"})
3. Verify SSL/TLS settings in Cloudflare
4. Set up custom email addresses
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8
Write-Host "💾 Full report saved to: $reportFile" -ForegroundColor Green
Write-Host ""
