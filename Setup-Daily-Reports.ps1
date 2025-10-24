# Quick Setup Script for Daily Admin Reports
# This script helps you configure and test the RPA report automation

Write-Host "🚀 Daily Admin Reports - Quick Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
$envPath = "backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Error: backend\.env file not found!" -ForegroundColor Red
    Write-Host "📝 Creating a new .env file..." -ForegroundColor Yellow
    New-Item -Path $envPath -ItemType File -Force | Out-Null
}

Write-Host "✅ Found .env file" -ForegroundColor Green
Write-Host ""

# Prompt for email settings
Write-Host "📧 Email Configuration" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow
Write-Host ""

$adminEmail = Read-Host "Enter your admin email (to receive reports)"
$senderEmail = Read-Host "Enter Gmail sender email (for SMTP)"
$appPassword = Read-Host "Enter Gmail App Password (16 chars, from https://myaccount.google.com/apppasswords)" -AsSecureString
$appPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($appPassword))

Write-Host ""
Write-Host "⏰ Report Schedule" -ForegroundColor Yellow
Write-Host "------------------" -ForegroundColor Yellow
Write-Host "1) Daily at 8:00 AM (default)"
Write-Host "2) Daily at 8:00 PM"
Write-Host "3) Daily at 9:00 AM"
Write-Host "4) Twice daily (8 AM and 8 PM)"
Write-Host "5) Weekly (Monday 9 AM)"
Write-Host "6) Custom cron schedule"
Write-Host ""

$scheduleChoice = Read-Host "Select schedule (1-6)"

$schedule = switch ($scheduleChoice) {
    "1" { "0 8 * * *" }
    "2" { "0 20 * * *" }
    "3" { "0 9 * * *" }
    "4" { "0 8,20 * * *" }
    "5" { "0 9 * * 1" }
    "6" { Read-Host "Enter custom cron schedule (e.g., '0 8 * * *')" }
    default { "0 8 * * *" }
}

Write-Host ""
Write-Host "📊 Configuration Summary" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan
Write-Host "Admin Email: $adminEmail" -ForegroundColor White
Write-Host "Sender Email: $senderEmail" -ForegroundColor White
Write-Host "Schedule: $schedule" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Apply this configuration? (y/n)"

if ($confirm -ne "y") {
    Write-Host "❌ Setup cancelled" -ForegroundColor Red
    exit
}

# Backup existing .env
if (Test-Path $envPath) {
    $backupPath = "backend\.env.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $envPath $backupPath
    Write-Host "💾 Backed up existing .env to $backupPath" -ForegroundColor Green
}

# Read existing .env content
$envContent = Get-Content $envPath -Raw -ErrorAction SilentlyContinue

# Remove existing RPA report settings if present
$envContent = $envContent -replace "(?m)^RPA_REPORTS_ENABLED=.*`r?`n", ""
$envContent = $envContent -replace "(?m)^RPA_REPORTS_SCHEDULE=.*`r?`n", ""
$envContent = $envContent -replace "(?m)^RPA_REPORTS_EMAIL_TO=.*`r?`n", ""
$envContent = $envContent -replace "(?m)^RPA_REPORTS_PDF_ENABLED=.*`r?`n", ""
$envContent = $envContent -replace "(?m)^EMAIL_USER=.*`r?`n", ""
$envContent = $envContent -replace "(?m)^EMAIL_PASSWORD=.*`r?`n", ""
$envContent = $envContent -replace "(?m)^RPA_ADMIN_EMAIL=.*`r?`n", ""
$envContent = $envContent -replace "(?m)^RPA_AUTO_START=.*`r?`n", ""

# Add new settings
$newSettings = @"

# ============================================
# RPA DAILY REPORTS CONFIGURATION
# ============================================
RPA_REPORTS_ENABLED=true
RPA_REPORTS_SCHEDULE="$schedule"
RPA_REPORTS_EMAIL_TO=$adminEmail
RPA_REPORTS_PDF_ENABLED=false
RPA_ADMIN_EMAIL=$adminEmail
RPA_AUTO_START=false

# Email SMTP Configuration (Gmail)
EMAIL_USER=$senderEmail
EMAIL_PASSWORD=$appPasswordPlain
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
"@

$envContent = $envContent.TrimEnd() + "`n" + $newSettings

# Write updated .env
Set-Content -Path $envPath -Value $envContent -NoNewline

Write-Host ""
Write-Host "✅ Configuration saved to $envPath" -ForegroundColor Green
Write-Host ""

# Test email configuration
Write-Host "🧪 Testing Configuration..." -ForegroundColor Yellow
Write-Host ""

$testEmail = Read-Host "Send a test report now? (y/n)"

if ($testEmail -eq "y") {
    Write-Host ""
    Write-Host "📤 Starting backend server and sending test report..." -ForegroundColor Cyan
    Write-Host "⏳ This may take 10-20 seconds..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start backend in background
    $backendJob = Start-Job -ScriptBlock {
        Set-Location "C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend"
        npm run dev
    }
    
    # Wait for server to start
    Start-Sleep -Seconds 8
    
    try {
        # Start RPA scheduler
        Write-Host "🔧 Starting RPA scheduler..." -ForegroundColor Yellow
        $startResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/rpa/start" -Method Post -ContentType "application/json"
        Write-Host "✅ RPA scheduler started" -ForegroundColor Green
        
        Start-Sleep -Seconds 2
        
        # Generate test report
        Write-Host "📊 Generating test report..." -ForegroundColor Yellow
        $reportBody = @{
            reportType = "balances"
            startDate = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
            endDate = (Get-Date).ToString("yyyy-MM-dd")
        } | ConvertTo-Json
        
        $reportResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/rpa/report/generate" -Method Post -Body $reportBody -ContentType "application/json"
        
        Write-Host ""
        Write-Host "✅ Test report generated and sent!" -ForegroundColor Green
        Write-Host "📧 Check your email: $adminEmail" -ForegroundColor Cyan
        Write-Host ""
        
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
        Write-Host "1. Make sure no other process is using port 5000" -ForegroundColor White
        Write-Host "2. Verify your Gmail App Password is correct" -ForegroundColor White
        Write-Host "3. Check if 2FA is enabled on your Gmail account" -ForegroundColor White
        Write-Host "4. Check backend logs for detailed error messages" -ForegroundColor White
    } finally {
        # Stop background job
        Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start your backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Start RPA automation: curl -X POST http://localhost:5000/api/rpa/start" -ForegroundColor White
Write-Host "3. Check status: curl http://localhost:5000/api/rpa/status" -ForegroundColor White
Write-Host ""
Write-Host "📧 Reports will be automatically sent to: $adminEmail" -ForegroundColor Cyan
Write-Host "⏰ Schedule: $schedule" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation: DAILY_ADMIN_REPORTS_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
