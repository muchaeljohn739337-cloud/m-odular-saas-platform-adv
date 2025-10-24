# 🚀 Install Lite Notification Admin Panel
# Quick setup script for notification stats dashboard

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Notification Stats Dashboard - Quick Install  " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Files Created:" -ForegroundColor Green
Write-Host "   📁 backend/src/routes/notifyStats.ts" -ForegroundColor White
Write-Host "   📁 frontend/src/components/AdminNotifyLite.tsx" -ForegroundColor White
Write-Host "   ✏️  backend/src/index.ts (updated)" -ForegroundColor White
Write-Host "   ✏️  frontend/src/app/admin/page.tsx (updated)" -ForegroundColor White
Write-Host ""

Write-Host "📦 What This Adds:" -ForegroundColor Yellow
Write-Host "   • Real-time notification statistics" -ForegroundColor Gray
Write-Host "   • CSV export functionality" -ForegroundColor Gray
Write-Host "   • Auto-refresh every 60 seconds" -ForegroundColor Gray
Write-Host "   • Admin dashboard widget" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 API Endpoints Created:" -ForegroundColor Yellow
Write-Host "   GET  /api/notify/stats   - Get notification counts" -ForegroundColor White
Write-Host "   GET  /api/notify/export  - Download CSV report" -ForegroundColor White
Write-Host "   GET  /api/notify/recent  - Get recent notifications" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Note: These endpoints require the notification system to be set up first." -ForegroundColor Yellow
Write-Host "   If you haven't added notification models to Prisma schema yet," -ForegroundColor Yellow
Write-Host "   the widget will show 'Notification system not yet initialized'." -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Complete notification system setup:" -ForegroundColor Yellow
Write-Host "   • Add Notification models to backend/prisma/schema.prisma" -ForegroundColor Gray
Write-Host "   • Run: cd backend && npx prisma migrate dev --name add_notifications" -ForegroundColor Gray
Write-Host "   • See: NOTIFICATION_SYSTEM_COMPLETE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Start the servers:" -ForegroundColor Yellow
Write-Host "   Backend: " -ForegroundColor Gray -NoNewline
Write-Host "cd backend && npm run dev" -ForegroundColor White
Write-Host "   Frontend: " -ForegroundColor Gray -NoNewline
Write-Host "cd frontend && npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  View the dashboard:" -ForegroundColor Yellow
Write-Host "   Open: " -ForegroundColor Gray -NoNewline
Write-Host "http://localhost:3000/admin" -ForegroundColor White
Write-Host "   (Requires admin login)" -ForegroundColor Gray
Write-Host ""

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Widget Features" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Displays:" -ForegroundColor Yellow
Write-Host "   • 📩 Total Notifications" -ForegroundColor White
Write-Host "   • 🔔 Unread Count" -ForegroundColor White
Write-Host "   • ⚠️  Email Failures" -ForegroundColor White
Write-Host "   • 🕒 Last Update Time" -ForegroundColor White
Write-Host ""
Write-Host "💾 CSV Export Includes:" -ForegroundColor Yellow
Write-Host "   • All notification records" -ForegroundColor White
Write-Host "   • Email delivery logs" -ForegroundColor White
Write-Host "   • RPA automation logs" -ForegroundColor White
Write-Host "   • User information" -ForegroundColor White
Write-Host ""

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$startServers = Read-Host "Would you like to start the backend server now? (y/n)"
if ($startServers -eq "y") {
    Write-Host ""
    Write-Host "🚀 Starting backend server..." -ForegroundColor Green
    Write-Host ""
    
    Set-Location backend
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev"
    Set-Location ..
    
    Write-Host "✅ Backend starting in new window..." -ForegroundColor Green
    Write-Host ""
    Write-Host "To start frontend, run: cd frontend && npm run dev" -ForegroundColor Yellow
    Write-Host "Then visit: http://localhost:3000/admin" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Manual start commands:" -ForegroundColor Cyan
    Write-Host "  Backend:  cd backend && npm run dev" -ForegroundColor White
    Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Lite Notification Dashboard installed successfully!" -ForegroundColor Green
Write-Host ""
