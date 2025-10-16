# System Monitoring and Security Features

## Overview
This implementation adds comprehensive system monitoring, user agreement acceptance, and enhanced security features to the Advancia Pay platform.

## Features Implemented

### 1. System Status Monitoring

#### Backend API Endpoints
- **GET /api/system/status** - Get overall system status and health
- **GET /api/system/health** - Quick health check endpoint
- **GET /api/system/alerts** - Get all system alerts
- **POST /api/system/alerts** - Create a new system alert (Admin only)
- **PUT /api/system/alerts/:id/resolve** - Resolve a system alert (Admin only)
- **GET /api/system/monitoring** - Get comprehensive monitoring data (Admin only)

#### Database Models
- **SystemStatus** - Tracks the health status of various services (frontend, backend, database, etc.)
- **SystemAlert** - Records system issues and alerts with severity levels

### 2. User Feedback System

#### Frontend Components
- **SystemFeedbackBanner** - Displays real-time system status to users
  - Shows banner when system is degraded or down
  - Auto-dismissible by users
  - Updates every 30 seconds
  - Color-coded based on severity:
    - Red: System down or danger
    - Yellow: System degraded or warning
    - Blue: Operational (normally hidden)

### 3. Admin Monitoring Dashboard

#### New Admin Page
- **`/admin/monitoring`** - Comprehensive system monitoring dashboard
  - Real-time service status
  - Alert management
  - System metrics
  - Auto-refresh every 30 seconds

#### Features
- View overall system health
- Monitor individual services
- Track unresolved alerts by severity
- View recently resolved issues
- Manual refresh capability

### 4. User Agreement Acceptance

#### Database Changes
- Added `termsAccepted` field to User model (Boolean)
- Added `termsAcceptedAt` field to User model (DateTime)

#### Frontend Updates
- **Login Page** (`/auth/login`)
  - Added terms acceptance checkbox
  - Required before login
  - Links to Terms of Service and Privacy Policy
  
- **Registration Page** (`/auth/register`)
  - New user registration page
  - Terms acceptance checkbox required
  - Password confirmation
  - Email validation

### 5. Security Enhancements

#### Rate Limiting
- **Authentication endpoints**: 5 requests per 15 minutes
- **General API endpoints**: 100 requests per minute
- Returns 429 status with Retry-After header when exceeded

#### Security Middleware
- **Input Validation**: Sanitizes all request inputs to prevent injection attacks
- **Security Headers**:
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff (prevents MIME type sniffing)
  - X-XSS-Protection: 1; mode=block (XSS protection)
  - Referrer-Policy: strict-origin-when-cross-origin
  - Content-Security-Policy: Restricts resource loading

## Usage

### For Users
1. **System Status**: Users will see a banner at the top of the page if there are system issues
2. **Login**: Users must accept terms before logging in
3. **Registration**: New page at `/auth/register` for creating accounts

### For Administrators
1. **Monitoring Dashboard**: Access at `/admin/monitoring`
2. **View Service Status**: See real-time status of all services
3. **Manage Alerts**: View and resolve system alerts
4. **System Health**: Monitor overall system health metrics

## API Response Examples

### System Status
```json
{
  "overall": {
    "status": "operational",
    "alertLevel": "none",
    "timestamp": "2025-10-16T18:50:00.000Z"
  },
  "services": [
    {
      "serviceName": "frontend",
      "status": "operational",
      "responseTime": 0,
      "uptime": 99.9,
      "statusMessage": "Frontend server running",
      "alertLevel": "none"
    },
    {
      "serviceName": "backend",
      "status": "operational",
      "responseTime": 0,
      "uptime": 99.9,
      "statusMessage": "Backend API operational",
      "alertLevel": "none"
    },
    {
      "serviceName": "database",
      "status": "operational",
      "responseTime": 25,
      "uptime": 99.9,
      "statusMessage": "Database connected",
      "alertLevel": "none"
    }
  ]
}
```

### Alert Levels
- **none**: No issues
- **warning**: Minor issues, service degraded
- **danger**: Critical issues, service down

### Severity Levels
- **low**: Informational
- **medium**: Needs attention
- **high**: Important issue
- **critical**: Immediate action required

## Security Best Practices

1. **Rate Limiting**: Prevents brute force attacks on authentication
2. **Input Validation**: Sanitizes all user inputs
3. **Security Headers**: Protects against common web vulnerabilities
4. **Terms Acceptance**: Ensures users agree to terms before using the platform

## Future Enhancements

1. **Email Notifications**: Send alerts to admins when critical issues occur
2. **Historical Data**: Store and display historical system performance data
3. **Automated Recovery**: Automatic service restart on failure
4. **External Monitoring**: Integration with third-party monitoring services
5. **Redis Integration**: Use Redis for distributed rate limiting

## Testing

To test the new features:

1. **System Status**:
   ```bash
   curl http://localhost:4000/api/system/status
   ```

2. **Health Check**:
   ```bash
   curl http://localhost:4000/api/system/health
   ```

3. **Admin Dashboard**: Navigate to `http://localhost:3000/admin/monitoring`

4. **Login/Register**: Navigate to `http://localhost:3000/auth/login` or `http://localhost:3000/auth/register`

## Notes

- The system feedback banner only appears when there are issues
- Rate limiting is in-memory and will reset on server restart (use Redis in production)
- All new features are designed to be minimal and non-intrusive to existing functionality
