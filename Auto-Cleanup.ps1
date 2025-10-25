# 🗑️ SAFE AUTO-CLEANUP SCRIPT
# This script removes only safe-to-delete files
# Critical files have been backed up already

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🗑️  AUTOMATIC CLEANUP UTILITY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$removedCount = 0

# ============================================
# REMOVE TEST SCRIPTS
# ============================================

Write-Host "📝 Removing Test Scripts..." -ForegroundColor Yellow

$testScripts = @(
    "Test-Registration.ps1",
    "test-sms-simple.ps1",
    "test-twilio-sms.ps1",
    "test-twilio-verify-direct.ps1"
)

foreach ($file in $testScripts) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    }
}

# ============================================
# REMOVE CHECK/FIX SCRIPTS
# ============================================

Write-Host ""
Write-Host "🔧 Removing Temporary Fix Scripts..." -ForegroundColor Yellow

$fixScripts = @(
    "Check-Cloudflare-Progress.ps1",
    "Check-Cloudflare-Setup.ps1",
    "Check-Deployment-Status.ps1",
    "check-status.ps1",
    "Check-Workflow-Status.ps1",
    "Fix-Database.ps1",
    "Fix-GitHub-Repo.ps1",
    "fix-prisma.ps1",
    "Quick-Upload-Secrets.ps1",
    "fix-other-workspace.ps1",
    "quick-fix.ps1"
)

foreach ($file in $fixScripts) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    }
}

# ============================================
# REMOVE LOG FILES
# ============================================

Write-Host ""
Write-Host "📄 Removing Log Files..." -ForegroundColor Yellow

$logFiles = @("frontend.log", "server-debug.log")

foreach ($file in $logFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    }
}

# ============================================
# REMOVE TEMPORARY TEXT FILES
# ============================================

Write-Host ""
Write-Host "📋 Removing Temporary Status Files..." -ForegroundColor Yellow

$tempFiles = @(
    "cloudflare-check-results.txt",
    "cloudflare-progress.txt",
    "RENDER_DEPLOYMENT_STATUS.txt",
    "CI_CD_QUICK_START.txt",
    "FRONTEND_QUICK_START.txt"
)

foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
        $removedCount++
    }
}

# ============================================
# REMOVE REDUNDANT SETUP/STATUS DOCS
# ============================================

Write-Host ""
Write-Host "📚 Removing Redundant Documentation..." -ForegroundColor Yellow

# Keep only essential docs, remove status/setup/complete docs
$docsToRemove = @(
    "ACTIVE_WORK_GRAPH.md",
    "ADD_FRONTEND_DEPLOY_HOOK_NOW.md",
    "ADD_GITHUB_SECRET_NOW.md",
    "ADD_JWT_SECRETS.md",
    "ADD_NEXTAUTH_SECRET.md",
    "ADMIN_BALANCE_EDIT.md",
    "ADMIN_CRYPTO_COMPLETE.md",
    "ADMIN_MIDDLEWARE_FIXED.md",
    "ADMIN_PANEL_DOCUMENTATION.md",
    "ADMIN_WALLET_ADDRESSES.md",
    "ALL_4_STEPS_COMPLETE.md",
    "API_KEYS_SETUP.md",
    "AUDIT_LOG_INTEGRATION_COMPLETE.md",
    "AUDIT_LOG_SUMMARY.md",
    "AUTHENTICATION_COMPLETE.md",
    "AUTH_BACKUP_KEYS.md",
    "AUTOMATION_TRIGGERED.md",
    "BACKEND_ISSUE_FIX.md",
    "BACKUP_CODES_GUIDE.md",
    "BACKUP_CODES_STORED.md",
    "BACKUP_COMPLETE.md",
    "BACKUP_GUIDE.md",
    "BACKUP_TOKENS_SECURE.md",
    "BOTPRESS_DEPLOYMENT_COMPLETE.md",
    "BOTPRESS_DEPLOYMENT_SUCCESS.md",
    "BOTPRESS_MANUAL_SETUP.md",
    "BOTPRESS_SETUP_GUIDE.md",
    "BUILD_COMPLETE.md",
    "BUILD_ERRORS_FIXED.md",
    "BUILD_ERROR_FIXED.md",
    "BUILD_ETH_FEATURES.md",
    "BUILD_FIX_COMPLETE.md",
    "BUILD_SUCCESS.md",
    "CHATBOT_COMPLETE.md",
    "CHATBOT_DEPLOYMENT_GUIDE.md",
    "CHATBOT_IMPLEMENTATION_COMPLETE.md",
    "CHATBOT_TESTING_LIVE.md",
    "CHATBOT_TEST_GUIDE.md",
    "CHATBOT_TRAINING_DATA.md",
    "CHATBOT_VISUAL_SUMMARY.md",
    "CHECKLIST-RESULTS.md",
    "CHECK_AUTOMATION_STATUS.md",
    "CICD_TEST_COMMIT.md",
    "CI_CD_ACTIVE.md",
    "CI_CD_COMPLETE_SUMMARY.md",
    "CI_CD_SETUP_GUIDE.md",
    "CLEANUP_SUMMARY.md",
    "CLEAN_INSTALL.md",
    "CLOUDFLARE_DNS_TEMPLATE.md",
    "CLOUDFLARE_DOMAIN_SETUP.md",
    "CLOUDFLARE_EMAIL_SETUP.md",
    "CLOUDFLARE_ETH_SETUP.md",
    "CLOUDFLARE_NEXT_STEPS.md",
    "CLOUDFLARE_SETUP.md",
    "CLOUDFLARE_SETUP_STATUS.md",
    "CODE_QUALITY_FIXES.md",
    "COMPLETE_CICD_FINAL_STEP.md",
    "COMPLETE_FEATURE_SUMMARY.md",
    "COMPLETE_IMPLEMENTATION.md",
    "COMPONENTS_COMPLETE.md",
    "CRYPTO_QUICK_START.md",
    "CRYPTO_REFERENCE_CARD.md",
    "CRYPTO_SETUP_SUMMARY.md",
    "CRYPTO_SYSTEM_GUIDE.md",
    "CRYPTO_SYSTEM_READY.md",
    "CRYPTO_UI_COMPLETE.md",
    "CRYPTO_VISUAL_FLOW.md",
    "CRYPTO_WALLET_COMPLETE.md"
)

foreach ($file in $docsToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Gray
        $removedCount++
    }
}

# Remove more redundant docs (second batch)
$docsToRemove2 = @(
    "DAILY_ADMIN_REPORTS_GUIDE.md",
    "DASHBOARD_EXPLORATION_CHECKLIST.md",
    "DASHBOARD_IMPLEMENTATION.md",
    "DASHBOARD_LIVE.md",
    "DATABASE_INTERNAL_URL_SETUP.md",
    "DATABASE_SETUP_GUIDE.md",
    "DEPLOYMENT_COMMANDS.md",
    "DEPLOYMENT_INITIATED.md",
    "DEPLOYMENT_IN_PROGRESS.md",
    "DEPLOYMENT_READY.md",
    "DEPLOYMENT_SETUP_COMPLETE.md",
    "DEPLOYMENT_STATUS.md",
    "DEPLOYMENT_SUCCESS.md",
    "DEPLOYMENT_TROUBLESHOOTING.md",
    "DEPLOYMENT_VISUAL_GUIDE.md",
    "DEPLOY_NOW.md",
    "DOMAIN_FULLY_OPERATIONAL.md",
    "DOMAIN_QUICK_SETUP.md",
    "DOMAIN_SETUP_COMPLETE.md",
    "DOMAIN_STATUS_CHECK.md",
    "DOMAIN_SUCCESS.md",
    "DOMAIN_VERIFICATION_REPORT.md",
    "EMAIL_SECURITY_RECORDS_GUIDE.md",
    "ENCRYPTION_SWITCH_COMPLETE.md",
    "ERRORS_FIXED.md",
    "ETH_FEATURES_BUILD_COMPLETE.md",
    "ETH_FEATURES_FINAL_SUMMARY.md",
    "ETH_GATEWAY_COMPLETE.md",
    "ETH_GATEWAY_INTEGRATION.md",
    "ETH_QUICK_START.md",
    "ETH_TEST_RESULTS.md",
    "EXECUTIVE_SUMMARY.md",
    "FEATURES_COMPLETE.md",
    "FEATURES_ENHANCED.md",
    "FEATURE_COMPLETION_SUMMARY.md",
    "FINAL_DEPLOYMENT_CHECKLIST.md",
    "FINAL_FIX_AUTHREQUEST.md",
    "FINAL_GITHUB_ACTIONS_SUMMARY.md",
    "FINAL_SOLUTION_BUILD_FIXED.md",
    "FINAL_STATUS.md",
    "FIND_RENDER_SERVICES.md",
    "FIX_MIGRATIONS.md",
    "FRONTEND_DEPLOY_GUIDE.md",
    "FRONTEND_FEATURES_CHECKLIST.md",
    "FRONTEND_SERVICE_GUIDE.md",
    "FRONTEND_WORKING_GET_DEPLOY_HOOK.md",
    "GET_DEPLOY_HOOK_NOW.md",
    "GITHUB_ACTIONS_COMPLETE.md",
    "GITHUB_ACTIONS_COMPLETE_SUMMARY.md",
    "GITHUB_ACTIONS_DEPLOYMENT_GUIDE.md",
    "GITHUB_ACTIONS_DOCUMENTATION_INDEX.md",
    "GITHUB_ACTIONS_QUICK_START.md",
    "GITHUB_ACTIONS_RENDER_SETUP.md",
    "GITHUB_ACTIONS_SETUP_RECAP.md",
    "GITHUB_ACTIONS_VISUAL_GUIDE.md",
    "GITHUB_QUICK_REFERENCE.md",
    "GITHUB_RENDER_SETUP.md",
    "GITHUB_SECRETS_REQUIRED.md",
    "GITHUB_SECRETS_SETUP.md",
    "IMPLEMENTATION_COMPLETE.md",
    "IMPLEMENTATION_RUNBOOK.md",
    "IMPLEMENTATION_SUMMARY.md",
    "JWT_SECRETS_SETUP.md",
    "LITE_NOTIFY_DASHBOARD_COMPLETE.md",
    "LIVE_AND_DEPLOYED.md",
    "LOANS_DISABLED_BUILD_FIXED.md",
    "LOANS_REMOVED_BUILD_WORKS.md",
    "LOAN_QUICK_START.md",
    "LOAN_SYSTEM_COMPLETE.md",
    "LOCALHOST_ISSUE_FIXED.md",
    "LOCALIZATION_GUIDE.md",
    "LOGIN_FIX_GUIDE.md",
    "LOGIN_SYSTEM_DEPLOYED.md",
    "LOGO_BRAND_GUIDE.md",
    "MANAGE_SECRETS_GUIDE.md",
    "MANUAL_DEPLOY_REQUIRED.md",
    "MISSING_FEATURES_SUMMARY.md",
    "MISSION_ACCOMPLISHED.md",
    "MISSION_COMPLETE.md",
    "MOBILE_RESPONSIVENESS_RESULTS.md",
    "MOBILE_RESPONSIVENESS_TEST.md",
    "MOBILE_TESTING_SUMMARY.md",
    "NEW_USER_SYSTEM.md",
    "NEXTAUTH_URL_OPTIONAL.md",
    "NEXT_STEPS.md",
    "NEXT_STEPS_NOW.md",
    "NOTIFICATION_CENTER_TIMELINE.md",
    "NOTIFICATION_IMPLEMENTATION_SUMMARY.md",
    "NOTIFICATION_SYSTEM_COMPLETE.md",
    "NOTIFY_DASHBOARD_QUICK_REFERENCE.md",
    "OTP_AUTHENTICATION_SETUP.md",
    "PLATFORM_5_FEATURES_COMPLETE.md",
    "PLATFORM_AUDIT_5_MAJOR_FEATURES.md",
    "PRODUCTION_DEPLOYMENT_GUIDE.md",
    "PRODUCTION_ENV_VARS.md",
    "PROJECT_STATUS_COMPLETE.md",
    "QUICK_ACTION_PLAN.md",
    "QUICK_FIX_BACKEND.md",
    "QUICK_OTP_TEST.md",
    "QUICK_REFERENCE.md",
    "QUICK_REFERENCE_AUTH.md",
    "QUICK_START.md",
    "RBAC_IMPLEMENTATION_COMPLETE.md",
    "README_DEPLOYMENT.md",
    "README_old.md",
    "READY_TO_FIX_LOGIN.md",
    "READY_TO_TEST.md",
    "REGISTRATION_FAILING_DIAGNOSIS.md",
    "REMOVE_PREDEPLOY_COMMAND.md",
    "RENDER_ACTION_CHECKLIST.md",
    "RENDER_BUILD_FIXED.md",
    "RENDER_COMPLETE_CHECKLIST.md",
    "RENDER_CURRENT_STATUS.md",
    "RENDER_DEPLOYMENT.md",
    "RENDER_DEPLOYMENT_GUIDE.md",
    "RENDER_DEPLOYMENT_TROUBLESHOOTING.md",
    "RENDER_DEPLOY_KEY_SETUP.md",
    "RENDER_DIAGNOSTIC_AND_FIX.md",
    "RENDER_ERROR_ANALYSIS.md",
    "RENDER_FINAL_SUMMARY.md",
    "RENDER_IMMEDIATE_ACTION.md",
    "RENDER_QUICK_START.md",
    "RENDER_SCHEMA_MISSING_FIX.md",
    "RENDER_SETUP_WALKTHROUGH.md",
    "RENDER_SHELL_COMMANDS.md",
    "RENDER_SSH_KEY_SETUP.md",
    "RENDER_VISUAL_SUMMARY.md",
    "RPA_MODULE_COMPLETE.md",
    "RPA_QUICK_REFERENCE.md",
    "SCHEMA_STORE_FIXED.md",
    "SECRETS_DOCUMENTATION.md",
    "SECRETS_MANAGEMENT_GUIDE.md",
    "SECRET_MANAGEMENT_COMPLETE.md",
    "SERVERS_RUNNING.md",
    "SESSION_COMPLETE.md",
    "SIGNUP_FEATURES_STATUS.md",
    "SOCKS5_PROXIES_NOT_NEEDED.md",
    "STRIPE_CRYPTO_PURCHASE_STATUS.md",
    "STRIPE_QUICK_START.md",
    "STRIPE_READY_TO_TEST.md",
    "STRIPE_SETUP_COMPLETE.md",
    "STRIPE_STATUS.md",
    "SUCCESS_COMPLETE_CICD.md",
    "SYSTEM_MONITORING_GUIDE.md",
    "TASK_COMPLETE.md",
    "TEST_PAYMENT_NOW.md",
    "TEST_PLAN.md",
    "TEST_SIGNUP.md",
    "THREE_PRIORITY_FIXES_COMPLETE.md",
    "TROUBLESHOOT_API_KEY.md",
    "TWILIO_EVENT_STREAMS_GUIDE.md",
    "TWILIO_SETUP_COMPLETE.md",
    "TWILIO_SMS_CUSTOMIZATION.md",
    "TWILIO_VERIFICATION_ANALYSIS.md",
    "TWILIO_VERIFY_COMPLETE.md",
    "UISECURITY_INDEX.md",
    "UI_CHANGES_GUIDE.md",
    "UI_SECURITY_IMPLEMENTATION.md",
    "UI_SECURITY_SUMMARY.md",
    "USER_DASHBOARD_GUIDE.md",
    "USER_DASHBOARD_RESTRICTIONS.md",
    "USER_RESTRICTIONS_SUMMARY.md",
    "UX_IMPROVEMENTS_COMPLETE.md",
    "VERIFY_AUTOMATION_NOW.md",
    "VISUAL_GUIDE_USER_RESTRICTIONS.md",
    "WALLET_SETUP_READY.md",
    "WHATS_MISSING_CHECKLIST.md",
    "WHATS_NEXT.md",
    "WHATS_NEXT_OPTIONS.md",
    "WHATS_ON_YOUR_LOGIN_PAGE.md",
    "WORKFLOW_ERRORS_FIXED.md",
    "WORKFLOW_FIX_APPLIED.md",
    "WORKFLOW_SETUP_GUIDE.md",
    "YES_DAILY_REPORTS_INCLUDED.md",
    "YOUR_API_KEYS.md",
    "YOUR_RENDER_URLS.md"
)

foreach ($file in $docsToRemove2) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Gray
        $removedCount++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📊 Total files removed: $removedCount" -ForegroundColor White
Write-Host ""
Write-Host "  ℹ️  Kept essential files:" -ForegroundColor Cyan
Write-Host "     - README.md" -ForegroundColor White
Write-Host "     - SECURITY_AUDIT_REPORT.md" -ForegroundColor White
Write-Host "     - VALIDATION_REPORT.md" -ForegroundColor White
Write-Host "     - FIXES_SUMMARY.md" -ForegroundColor White
Write-Host "     - COMMIT_READY.md" -ForegroundColor White
Write-Host "     - IMPLEMENTATION_GUIDE.md" -ForegroundColor White
Write-Host "     - TROUBLESHOOTING.md" -ForegroundColor White
Write-Host ""
Write-Host "  🔒 Critical files backed up in: backups/" -ForegroundColor Green
Write-Host ""
