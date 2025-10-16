# 🛡️ ADMIN PANEL & SECURITY DOCUMENTATION

## Overview
The ADVANCIA PAYLEDGER Admin Panel provides comprehensive system management and security controls. Regular users are automatically restricted from accessing backend systems and administrative features.

---

## 🔐 Access Control

### Admin Access
**Who can access the Admin Panel:**
- Users with `role: "admin"` in session
- Users with email `admin@advancia.com`
- Users with email containing "admin"

**How to test Admin Access:**
1. Login with an admin email (e.g., `admin@advancia.com`)
2. Admin Panel link appears in sidebar (red border, shield icon)
3. Click "Admin Panel" to access dashboard

### Regular User Restrictions
**What regular users CANNOT do:**
- ❌ Access `/admin` page (auto-redirected to dashboard)
- ❌ View admin panel link in sidebar
- ❌ Access protected backend endpoints without authentication
- ❌ Modify other users' accounts
- ❌ View system settings or logs
- ❌ Change security configurations

**What happens when user tries to access admin page:**
1. Automatic redirect to home page `/`
2. Alert message: "⛔ Access Denied: Admin privileges required"
3. Action is logged for security audit

---

## 📊 Admin Panel Features

### 1. **Overview Tab** (Default)
**System Statistics:**
- Total Users count
- Active Users count
- Total Transactions
- Total Volume (USD)
- Suspended Users count
- Pending Approvals

**Visual Cards:**
- Blue: Total Users (shows active count)
- Green: Transactions (all-time)
- Purple: Total Volume
- Red: Suspended Users
- Yellow: Pending Approvals
- Indigo: Database Status

### 2. **User Management Tab**
**Features:**
- View all users in table format
- See user details: Name, Email, Role, Status, Balance, Last Active
- User action buttons:
  - 👁️ **View Details** - See full user profile
  - 🔒 **Suspend/Unlock** - Toggle user suspension
  - ✅ **Make Admin** - Grant admin privileges
  - ❌ **Delete User** - Remove user permanently (confirmation required)

**User Roles:**
- `ADMIN` (Purple badge) - Full system access
- `USER` (Blue badge) - Standard access

**User Status:**
- `ACTIVE` (Green) - Account in good standing
- `SUSPENDED` (Red) - Account access revoked
- `PENDING` (Yellow) - Awaiting approval

### 3. **Security Tab**
**Protected Features:**
- ✅ Backend Protected - Only admins access endpoints
- 🔒 Role-Based Access Control - Automatic restrictions
- ⚙️ Session Management - JWT tokens (7-day expiration)

### 4. **System Tab**
**Server Status Monitoring:**
- Frontend Server: Port 3000 status
- Backend Server: Port 4000 status
- Database: Connection status
- Twilio API: Integration status

**Status Indicators:**
- 🟢 Green Dot (Pulsing) - Online
- 🟡 Yellow Dot (Pulsing) - Warning/Degraded
- 🔴 Red Dot - Offline

---

## 🔒 Backend Security Middleware

### Authentication Middleware (`middleware/auth.ts`)

#### 1. **`authenticateToken`**
Verifies JWT token in Authorization header.

**Usage:**
```typescript
app.use('/protected-route', authenticateToken, handler);
```

**Checks:**
- Token presence in `Authorization: Bearer <token>`
- Token validity (not expired)
- Token signature verification

**Responses:**
- `401` - Missing token
- `403` - Invalid/expired token
- Calls `next()` - Token valid

#### 2. **`requireAdmin`**
Ensures user has admin privileges.

**Usage:**
```typescript
app.use('/admin/*', authenticateToken, requireAdmin, handler);
```

**Checks:**
- User role is "admin"
- Email is "admin@advancia.com"
- Email contains "admin"

**Responses:**
- `401` - Not authenticated
- `403` - Not an admin
- Calls `next()` - Admin verified

#### 3. **`restrictBackendAccess`**
Global middleware to protect backend routes.

**Public Routes** (No auth required):
- `/health`
- `/auth/send-otp`
- `/auth/verify-otp`

**Protected Routes** (Auth required):
- All other endpoints need valid JWT

**Admin Routes** (Admin required):
- `/admin/*` routes automatically checked

**Usage:**
```typescript
app.use(restrictBackendAccess);
```

#### 4. **`logAdminAction`**
Logs all admin actions for audit trail.

**Logged Information:**
- HTTP Method & Path
- Admin email
- Timestamp
- IP Address
- User Agent

**Usage:**
```typescript
app.use('/admin/*', logAdminAction, handler);
```

---

## 🛠️ Implementation Examples

### Protecting Backend Routes
```typescript
// backend/src/index.ts
import { authenticateToken, requireAdmin, restrictBackendAccess } from './middleware/auth';

// Global protection
app.use(restrictBackendAccess);

// Admin-only routes
app.use('/admin', authenticateToken, requireAdmin, adminRoutes);

// Regular authenticated routes
app.use('/users', authenticateToken, userRoutes);
```

### Frontend Admin Check
```typescript
// In any component
import { useSession } from "next-auth/react";

const { data: session } = useSession();
const isAdmin = session?.user?.email?.includes("admin");

if (!isAdmin) {
  router.push("/"); // Redirect
}
```

---

## 🚨 Security Best Practices

### 1. **Token Management**
- JWT tokens expire after 7 days
- Tokens stored in httpOnly cookies (recommended)
- No sensitive data in token payload

### 2. **Role Validation**
- Always check role on both frontend AND backend
- Frontend checks for UI hiding
- Backend checks for actual security

### 3. **Audit Logging**
- All admin actions logged with timestamp
- Logs include IP address and user agent
- Failed access attempts logged

### 4. **Database Access**
- Direct database access only via backend
- Frontend never connects to DB directly
- All queries validated server-side

### 5. **API Endpoints**
- All endpoints require authentication except public routes
- Admin endpoints have double verification
- Rate limiting recommended (implement with express-rate-limit)

---

## 📋 User Roles & Permissions

| Feature | Regular User | Admin |
|---------|-------------|-------|
| Dashboard | ✅ | ✅ |
| My Assets | ✅ | ✅ |
| Features | ✅ | ✅ |
| Settings | ✅ | ✅ |
| Admin Panel | ❌ | ✅ |
| User Management | ❌ | ✅ |
| Suspend Users | ❌ | ✅ |
| Delete Users | ❌ | ✅ |
| System Settings | ❌ | ✅ |
| Backend Access | Via API Only | Full Access |
| View All Users | Own Profile | All Users |
| Security Settings | ❌ | ✅ |

---

## 🧪 Testing Admin Features

### Test Admin Login
```bash
# Use Twilio OTP with admin email
Phone: +17174695102
Code: (from SMS)
```

**After login, if email is admin:**
- Admin Panel link visible in sidebar (red border)
- Can access `/admin` page
- Can perform admin actions

### Test Regular User
**Regular user attempt:**
1. Login with normal email
2. Admin Panel link NOT visible
3. Try navigating to `/admin` directly
4. Result: Auto-redirected + alert message

---

## 🔧 Configuration

### Environment Variables
```env
# JWT Secret (used for token signing)
JWT_SECRET=your-secret-key-here

# Admin Emails (comma-separated)
ADMIN_EMAILS=admin@advancia.com,superadmin@advancia.com
```

### Session Configuration
```typescript
// next-auth config
session: {
  strategy: "jwt",
  maxAge: 7 * 24 * 60 * 60, // 7 days
}
```

---

## 📈 Admin Dashboard Statistics

**Real-time Metrics:**
- **Total Users**: Count of all registered users
- **Active Users**: Users logged in within 24 hours
- **Total Transactions**: All-time transaction count
- **Total Volume**: Sum of all transaction amounts (USD)
- **Suspended Users**: Count of suspended accounts
- **Pending Approvals**: Users awaiting verification

**System Health:**
- Server uptime
- Database connection status
- API integration status
- Error rates

---

## 🚀 Future Enhancements

### Planned Features:
1. **Advanced Analytics**
   - Transaction trends over time
   - User growth charts
   - Revenue dashboards

2. **Bulk Actions**
   - Mass user suspension
   - Bulk email notifications
   - Export user data

3. **Role Hierarchy**
   - Super Admin
   - Admin
   - Moderator
   - User

4. **Audit Trail**
   - Complete action history
   - Search and filter logs
   - Export audit reports

5. **System Alerts**
   - Email notifications for suspicious activity
   - Slack/Discord webhooks
   - SMS alerts for critical events

---

## 📞 Support

**Admin Questions:**
- Check logs: `/backend/logs/admin-actions.log`
- System status: Visit Admin Panel → System tab
- Security issues: Immediately suspend user and review logs

**Regular User Issues:**
- Verify they're not trying to access admin features
- Check session validity
- Confirm authentication token

---

## ⚠️ Important Security Notes

1. **Never share admin credentials**
2. **Always use HTTPS in production**
3. **Rotate JWT secrets regularly**
4. **Monitor admin action logs**
5. **Keep dependencies updated**
6. **Use strong passwords**
7. **Enable 2FA for admins** (future)
8. **Regular security audits**

---

*Last Updated: October 16, 2025*
*Version: 1.0.0*
*Security Level: Production Ready* 🛡️
