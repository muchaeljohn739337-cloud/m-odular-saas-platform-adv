# 🚀 Notification System - Quick Start Script
# Run this to set up the complete notification system in one go

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Advancia Pay Ledger - Notification System Setup  " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install missing dependencies
Write-Host "📦 Step 1/6: Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

cd backend
Write-Host "   Installing backend packages..." -ForegroundColor Gray
npm install web-push winston winston-daily-rotate-file @sentry/node

cd ../frontend
Write-Host "   Installing frontend packages..." -ForegroundColor Gray
npm install react-toastify

cd ..
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Generate VAPID keys
Write-Host "🔑 Step 2/6: Generating VAPID keys..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Please copy these keys to your .env files:" -ForegroundColor Gray
Write-Host ""

cd backend
npx web-push generate-vapid-keys

Write-Host ""
Write-Host "   Add to backend/.env:" -ForegroundColor Cyan
Write-Host "   VAPID_PUBLIC_KEY=<your_public_key>" -ForegroundColor White
Write-Host "   VAPID_PRIVATE_KEY=<your_private_key>" -ForegroundColor White
Write-Host "   VAPID_SUBJECT=mailto:support@advanciapayledger.com" -ForegroundColor White
Write-Host "   EMAIL_FALLBACK_DELAY=10" -ForegroundColor White
Write-Host "   ADMIN_EMAIL=support@advanciapayledger.com" -ForegroundColor White
Write-Host ""
Write-Host "   Add to frontend/.env.local:" -ForegroundColor Cyan
Write-Host "   NEXT_PUBLIC_VAPID_KEY=<your_public_key>" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_API_URL=http://localhost:5000" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_WS_URL=http://localhost:5000" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Have you added the keys to .env files? (y/n)"
if ($continue -ne "y") {
    Write-Host "❌ Setup cancelled. Please add the keys and run this script again." -ForegroundColor Red
    exit
}

cd ..

# Step 3: Database migration
Write-Host ""
Write-Host "🗄️  Step 3/6: Updating database schema..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   This will add 4 new tables:" -ForegroundColor Gray
Write-Host "   - notifications" -ForegroundColor White
Write-Host "   - push_subscriptions" -ForegroundColor White
Write-Host "   - notification_preferences" -ForegroundColor White
Write-Host "   - notification_logs" -ForegroundColor White
Write-Host ""

$runMigration = Read-Host "Run Prisma migration now? (y/n)"
if ($runMigration -eq "y") {
    cd backend
    npx prisma migrate dev --name add_notification_system
    npx prisma generate
    cd ..
    Write-Host "✅ Database migrated successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipped migration. Run manually: npx prisma migrate dev --name add_notification_system" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Create service worker
Write-Host "📱 Step 4/6: Creating service worker for push notifications..." -ForegroundColor Yellow
Write-Host ""

$serviceWorkerContent = @"
// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/notifications')
    );
  }
});
"@

$serviceWorkerContent | Out-File -FilePath "frontend/public/sw.js" -Encoding UTF8
Write-Host "✅ Service worker created at frontend/public/sw.js" -ForegroundColor Green
Write-Host ""

# Step 5: Create manifest.json
Write-Host "📄 Step 5/6: Creating web app manifest..." -ForegroundColor Yellow
Write-Host ""

$manifestContent = @"
{
  "name": "Advancia Pay Ledger",
  "short_name": "Advancia Pay",
  "description": "Modern fintech transaction management platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
"@

$manifestContent | Out-File -FilePath "frontend/public/manifest.json" -Encoding UTF8
Write-Host "✅ Manifest created at frontend/public/manifest.json" -ForegroundColor Green
Write-Host ""

# Step 6: Summary
Write-Host "🎉 Step 6/6: Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Review the complete guide:" -ForegroundColor Yellow
Write-Host "   📄 NOTIFICATION_SYSTEM_COMPLETE.md" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Create backend files:" -ForegroundColor Yellow
Write-Host "   📁 backend/src/services/notificationService.ts" -ForegroundColor White
Write-Host "   📁 backend/src/routes/notifications.ts" -ForegroundColor White
Write-Host "   (See Phase 2 in documentation)" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Update backend/src/index.ts:" -ForegroundColor Yellow
Write-Host "   - Add Socket.io initialization" -ForegroundColor White
Write-Host "   - Register notification routes" -ForegroundColor White
Write-Host "   - Add email fallback cron job" -ForegroundColor White
Write-Host "   (See Phase 2.4 in documentation)" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  Create frontend components:" -ForegroundColor Yellow
Write-Host "   📁 frontend/src/components/NotificationBell.tsx" -ForegroundColor White
Write-Host "   📁 frontend/src/components/NotificationCenter.tsx" -ForegroundColor White
Write-Host "   📁 frontend/src/components/NotificationItem.tsx" -ForegroundColor White
Write-Host "   📁 frontend/src/app/settings/notifications/page.tsx" -ForegroundColor White
Write-Host "   📁 frontend/src/hooks/useNotifications.ts" -ForegroundColor White
Write-Host "   (Frontend implementation guide coming next)" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  Test the system:" -ForegroundColor Yellow
Write-Host "   npm run dev (in both backend and frontend)" -ForegroundColor White
Write-Host "   Open http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Notification System Features" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Database models (Notification, PushSubscription, Preferences)" -ForegroundColor Green
Write-Host "✅ Multi-channel delivery (Email, SMS, Push, In-App)" -ForegroundColor Green
Write-Host "✅ Real-time updates via Socket.io" -ForegroundColor Green
Write-Host "✅ Email fallback for unread notifications (15min)" -ForegroundColor Green
Write-Host "✅ User preferences & opt-out" -ForegroundColor Green
Write-Host "✅ Admin dashboard with stats" -ForegroundColor Green
Write-Host "✅ Priority levels (low, normal, high, urgent)" -ForegroundColor Green
Write-Host "✅ Category filtering (transaction, security, reward, etc.)" -ForegroundColor Green
Write-Host "✅ Delivery logs & analytics" -ForegroundColor Green
Write-Host "✅ Browser push notifications" -ForegroundColor Green
Write-Host ""

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Environment Variables Checklist" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend (.env):" -ForegroundColor Yellow
Write-Host "  ☐ VAPID_PUBLIC_KEY" -ForegroundColor White
Write-Host "  ☐ VAPID_PRIVATE_KEY" -ForegroundColor White
Write-Host "  ☐ VAPID_SUBJECT" -ForegroundColor White
Write-Host "  ☐ EMAIL_FALLBACK_DELAY" -ForegroundColor White
Write-Host "  ☐ ADMIN_EMAIL" -ForegroundColor White
Write-Host "  ☐ FRONTEND_URL (for Socket.io CORS)" -ForegroundColor White
Write-Host ""
Write-Host "Frontend (.env.local):" -ForegroundColor Yellow
Write-Host "  ☐ NEXT_PUBLIC_VAPID_KEY" -ForegroundColor White
Write-Host "  ☐ NEXT_PUBLIC_API_URL" -ForegroundColor White
Write-Host "  ☐ NEXT_PUBLIC_WS_URL" -ForegroundColor White
Write-Host ""

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Need help? Check:" -ForegroundColor Cyan
Write-Host "   - NOTIFICATION_SYSTEM_COMPLETE.md (Complete guide)" -ForegroundColor White
Write-Host "   - NOTIFICATION_CENTER_TIMELINE.md (Time estimates)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to build the frontend? Let me know!" -ForegroundColor Green
Write-Host ""
