# User Feedback and System Monitoring Implementation

## Features Delivered

### 1. ✅ User Feedback System
**When a page isn't working well:**
- System displays a colored banner at the top of the page
- Red banner: "System experiencing issues" (when services are down)
- Yellow banner: "System performance degraded" (when services are slow)
- Banner updates every 30 seconds automatically
- Users can dismiss the banner
- Shows which services are affected

### 2. ✅ Admin Site Monitoring Dashboard
**Admin can check all sites are working:**
- New page at `/admin/monitoring`
- Real-time status of all services (Frontend, Backend, Database)
- Alert levels: None, Warning, Danger
- Summary metrics showing:
  - Total alerts
  - Critical alerts
  - High priority alerts
  - Services down
  - Services degraded
- Auto-refreshes every 30 seconds
- Manual refresh button available
- Color-coded status indicators:
  - 🟢 Green: Operational
  - 🟡 Yellow: Degraded/Warning
  - 🔴 Red: Down/Danger

### 3. ✅ Enhanced Security System
**Tight security against attackers:**
- **Rate Limiting**:
  - Login/Authentication: Max 5 attempts per 15 minutes
  - General API: Max 100 requests per minute
  - Returns 429 error when exceeded with retry-after time
- **Input Validation**:
  - All user inputs are sanitized
  - Null byte removal
  - Protection against injection attacks
- **Security Headers**:
  - X-Frame-Options: Prevents clickjacking
  - X-Content-Type-Options: Prevents MIME sniffing
  - X-XSS-Protection: Cross-site scripting protection
  - Content-Security-Policy: Restricts resource loading
  - Referrer-Policy: Controls referrer information

### 4. ✅ Agreement Acceptance on Login/Registration
**Terms acceptance checkboxes:**
- **Login Page** (`/auth/login`):
  - Required checkbox before login
  - Links to Terms of Service and Privacy Policy
  - Cannot login without accepting terms
- **Registration Page** (`/auth/register`):
  - New registration page created
  - Required checkbox for terms acceptance
  - Email validation
  - Password confirmation field
  - Username field
  - Cannot register without accepting terms
- **Database**:
  - `termsAccepted` field (Boolean)
  - `termsAcceptedAt` field (DateTime)

## API Endpoints Created

### System Monitoring
- `GET /api/system/status` - Get overall system status
- `GET /api/system/health` - Quick health check
- `GET /api/system/alerts` - Get all alerts
- `POST /api/system/alerts` - Create alert (Admin)
- `PUT /api/system/alerts/:id/resolve` - Resolve alert (Admin)
- `GET /api/system/monitoring` - Full monitoring data (Admin)

## Database Models Added

1. **SystemStatus**
   - Tracks service health (frontend, backend, database, etc.)
   - Status levels: operational, degraded, down, maintenance
   - Alert levels: none, warning, danger
   - Response time and uptime tracking

2. **SystemAlert**
   - Alert types: security, performance, error, warning
   - Severity: low, medium, high, critical
   - Resolution tracking

3. **User Updates**
   - Added `termsAccepted` field
   - Added `termsAcceptedAt` field

## Pages Created/Updated

### New Pages
1. `/auth/register` - User registration with terms acceptance
2. `/admin/monitoring` - System monitoring dashboard

### Updated Pages
1. `/auth/login` - Added terms acceptance checkbox
2. Root layout - Added SystemFeedbackBanner component

## Security Features

1. **Rate Limiting**
   - In-memory rate limiter (production: use Redis)
   - Separate limits for auth vs. general API
   - Includes rate limit headers in responses

2. **Input Validation**
   - Middleware sanitizes all inputs
   - Prevents injection attacks

3. **Security Headers**
   - Comprehensive security headers applied to all responses

## How It Works

### For Users
1. Visit site → See feedback banner if issues exist
2. Try to login → Must accept terms first
3. Registration → Complete form with terms acceptance

### For Admins
1. Visit `/admin/monitoring` dashboard
2. See real-time status of all services
3. View unresolved alerts
4. Monitor system health metrics

## Testing the Features

### 1. Test System Status
```bash
curl http://localhost:4000/api/system/status
```

### 2. Test Health Check
```bash
curl http://localhost:4000/api/system/health
```

### 3. Test Rate Limiting
```bash
# Try login 6 times rapidly - should get rate limited on 6th attempt
for i in {1..6}; do
  curl -X POST http://localhost:4000/api/auth/verify-otp \
    -H "Content-Type: application/json" \
    -d '{"identifier":"test","code":"123456"}'
  sleep 1
done
```

### 4. Access Admin Dashboard
Navigate to: `http://localhost:3000/admin/monitoring`

### 5. Try Login/Registration
- Login: `http://localhost:3000/auth/login`
- Register: `http://localhost:3000/auth/register`

## Documentation
See `SYSTEM_MONITORING_GUIDE.md` for comprehensive documentation.
