# Silent Mode Implementation Guide

## Overview

Silent Mode suppresses backend error toasts, debug logs, and system notifications to provide a clean user experience in production.

## Features

✅ **Automatic Production Enforcement**: Auto-enabled on Render production  
✅ **Admin Control**: Toggle on/off in development via admin panel  
✅ **Console Log Suppression**: Disables console.log, info, warn, debug  
✅ **Backend Error Hiding**: Prevents technical error messages from reaching users  
✅ **Visual Indicator**: Shows "Silent Mode" badge when active

## Implementation Steps

### 1. Database Schema

Add `SystemConfig` model to `backend/prisma/schema.prisma`:

```prisma
model SystemConfig {
  id        Int      @id @default(autoincrement())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  @@map("system_config")
}
```

Run migration:

```bash
cd backend
npx prisma migrate dev --name add_system_config
npx prisma generate
```

### 2. Backend API Route

File: `backend/src/routes/admin/config.ts` (created)

**Features:**

- GET `/api/admin/config/silent-mode` - Check status
- POST `/api/admin/config/silent-mode` - Toggle on/off
- Auto-enables in Render production
- Prevents disabling in production

**Register Route:**

In `backend/src/index.ts`, add:

```typescript
import adminConfigRouter from "./routes/admin/config";

// After other admin routes
app.use("/api/admin/config", adminConfigRouter);
```

### 3. Frontend Components

**A. Silent Mode Switch (Admin Panel)**

File: `frontend/src/components/admin/SilentModeSwitch.tsx`

Usage in admin settings:

```tsx
import SilentModeSwitch from "@/components/admin/SilentModeSwitch";

export default function AdminSettings() {
  return (
    <div>
      <h1>System Settings</h1>
      <SilentModeSwitch />
    </div>
  );
}
```

**B. Silent Mode Indicator**

File: `frontend/src/components/SilentModeIndicator.tsx`

Add to root layout:

```tsx
import SilentModeIndicator from "@/components/SilentModeIndicator";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SilentModeIndicator />
      </body>
    </html>
  );
}
```

**C. Silent Mode Utility**

File: `frontend/src/utils/silentMode.ts`

Usage in app initialization:

```typescript
import { initSilentMode } from "@/utils/silentMode";

// In _app.tsx or root layout
useEffect(() => {
  initSilentMode();
}, []);
```

### 4. Backend Error Handling

Update backend error responses to be generic in production:

```typescript
// backend/src/routes/transactions.ts
try {
  const result = await processTransaction(data);
  res.json({ success: true, transactionId: result.id });
} catch (err) {
  console.error("Backend error:", err); // Logs stay in backend

  // Generic message for frontend
  res.status(500).json({
    success: false,
    message: "Transaction failed. Please try again.",
  });
}
```

### 5. Frontend Toast Suppression

Use utility to conditionally show toasts:

```typescript
import { showToastIfAllowed } from "@/utils/silentMode";
import { toast } from "react-hot-toast";

// For backend errors
showToastIfAllowed(
  () => toast.error("Transaction failed"),
  true // isBackendError
);

// For user actions (always shown)
toast.success("Settings saved!"); // Not suppressed
```

### 6. Environment Variables

**Backend (.env):**

```bash
NODE_ENV=production  # or development
RENDER=true         # Set by Render automatically
```

**Frontend (.env.local):**

```bash
NEXT_PUBLIC_API_URL=https://advancia-backend.onrender.com
```

## Behavior Matrix

| Environment | Platform | Silent Mode | Console Logs | Backend Toasts |
| ----------- | -------- | ----------- | ------------ | -------------- |
| Production  | Render   | ✅ Forced   | ❌ Disabled  | ❌ Hidden      |
| Production  | Local    | ⚙️ Optional | ⚙️ Optional  | ⚙️ Optional    |
| Development | Any      | ⚙️ Optional | ⚙️ Optional  | ⚙️ Optional    |

## Testing

### Local Development

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Visit http://localhost:3000/admin/settings
# Toggle Silent Mode switch
```

### Production Verification

```bash
# Check status
curl https://advancia-backend.onrender.com/api/admin/config/silent-mode

# Expected response:
{
  "silentMode": true,
  "autoEnabled": true,
  "environment": "production",
  "platform": "render"
}
```

## Admin Panel Integration

Add to admin settings page:

```tsx
// frontend/src/app/admin/settings/page.tsx
import SilentModeSwitch from "@/components/admin/SilentModeSwitch";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1>System Settings</h1>

      <section>
        <h2>Notifications</h2>
        <SilentModeSwitch />
      </section>

      {/* Other settings */}
    </div>
  );
}
```

## What Gets Suppressed

When Silent Mode is active:

✅ **Suppressed:**

- `console.log()`, `console.info()`, `console.warn()`, `console.debug()`
- Backend error toasts (transaction failures, API errors)
- System maintenance notifications
- Debug messages
- Stack traces in error toasts

❌ **Not Suppressed:**

- `console.error()` (for critical debugging)
- User action confirmations (e.g., "Settings saved!")
- Security warnings
- Required user notifications

## Security Considerations

1. **Production Enforcement**: Cannot disable in Render production
2. **Admin-Only Access**: Only admins can toggle silent mode
3. **Audit Trail**: All changes logged to `SystemConfig.updatedAt`
4. **Error Logging**: Backend errors still logged server-side
5. **Critical Errors**: Console.error preserved for debugging

## Rollback

If issues arise:

```bash
# Disable in database directly
cd backend
npx prisma studio

# Find SystemConfig record with key='silent_mode'
# Set value='false'
```

Or via API:

```bash
curl -X POST https://advancia-backend.onrender.com/api/admin/config/silent-mode \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"enabled": false}'
```

## Monitoring

Check logs for Silent Mode activity:

```bash
# Backend logs (Render dashboard)
grep "Silent Mode" logs.txt

# Frontend console (browser)
# Look for: "🛑 Silent Mode Active" or "✅ Dev Mode"
```

---

**Status**: Ready for implementation  
**Version**: 1.0  
**Last Updated**: October 25, 2025
