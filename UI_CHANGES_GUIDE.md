# UI Changes Visual Guide

## New User-Facing Features

### 1. System Feedback Banner (SystemFeedbackBanner Component)

**Location**: Top of every page (global component)

**Purpose**: Inform users when the site is experiencing issues

**Visual States**:

#### Operational State (Hidden)
- Banner is not displayed when all systems are working normally

#### Warning State (Yellow Banner)
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠  System performance degraded                            [X]   │
│    Affected services: database                                  │
└─────────────────────────────────────────────────────────────────┘
```
- **Color**: Yellow background (#EAB308)
- **Icon**: Warning triangle
- **Dismissible**: Yes
- **Auto-refresh**: Every 30 seconds

#### Danger State (Red Banner)
```
┌─────────────────────────────────────────────────────────────────┐
│ ✕  System experiencing issues                             [X]   │
│    Affected services: backend, database                         │
└─────────────────────────────────────────────────────────────────┘
```
- **Color**: Red background (#EF4444)
- **Icon**: X Circle
- **Dismissible**: Yes
- **Auto-refresh**: Every 30 seconds

---

### 2. Updated Login Page

**Location**: `/auth/login`

**New Elements**:

```
┌─────────────────────────────────────────────┐
│         [Logo Icon]                         │
│       Advancia Pay                          │
│   Secure Banking Platform                   │
│                                             │
│  Email                                      │
│  ┌─────────────────────────────────────┐   │
│  │ you@example.com                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Password                                   │
│  ┌─────────────────────────────────────┐   │
│  │ ••••••••                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ☑ I accept the Terms of Service and       │ ← NEW CHECKBOX
│    Privacy Policy                           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         Sign In                     │   │ ← DISABLED IF UNCHECKED
│  └─────────────────────────────────────┘   │
│                                             │
│              OR                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🔒 Login with One-Time Code        │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**Changes**:
- Added required checkbox for Terms of Service and Privacy Policy
- Links to `/terms` and `/privacy` (open in new tab)
- Sign In button is disabled until terms are accepted
- Validation message if user tries to submit without accepting terms

---

### 3. New Registration Page

**Location**: `/auth/register`

**Full Page Layout**:

```
┌─────────────────────────────────────────────┐
│         [Logo Icon]                         │
│       Create Account                        │
│    Join Advancia Pay today                  │
│                                             │
│  Username                                   │
│  ┌─────────────────────────────────────┐   │
│  │ johndoe                             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Email                                      │
│  ┌─────────────────────────────────────┐   │
│  │ you@example.com                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Password                                   │
│  ┌─────────────────────────────────────┐   │
│  │ ••••••••                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Confirm Password                           │
│  ┌─────────────────────────────────────┐   │
│  │ ••••••••                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ☑ I accept the Terms of Service and       │
│    Privacy Policy                           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │      Create Account                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Already have an account? Sign In           │
│                                             │
└─────────────────────────────────────────────┘
```

**Features**:
- Username field (required)
- Email field with validation
- Password field with minimum 6 characters
- Confirm password field
- Required terms acceptance checkbox
- Create Account button (disabled if terms not accepted or passwords don't match)
- Link back to login page

---

### 4. Admin Monitoring Dashboard

**Location**: `/admin/monitoring` (Admin only)

**Page Layout**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Activity Icon] System Monitoring                        [🔄 Refresh]  │
│  Real-time system status and health monitoring                          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ✓ All Systems Operational                                          │ │
│  │ Last updated: 10/16/2025, 6:50:00 PM                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │Total     │ │Critical  │ │High      │ │Services  │ │Degraded  │     │
│  │Alerts    │ │Alerts    │ │Priority  │ │Down      │ │          │     │
│  │   0      │ │   0      │ │   0      │ │   0      │ │   0      │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        Service Status                               │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ ✓ Frontend                                                          │ │
│  │   Frontend server running                     Uptime: 99.9%         │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ ✓ Backend                                                           │ │
│  │   Backend API operational                     Uptime: 99.9%         │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ ✓ Database                                                          │ │
│  │   Database connected                Response: 25ms  Uptime: 99.9%   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  (If there are alerts, they appear here)                                │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      Unresolved Alerts                              │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ [CRITICAL] Security Alert                        10/16/25 6:30 PM   │ │
│  │ Unusual login activity detected                                     │ │
│  │ Service: authentication                                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

**Color Coding**:
- 🟢 Green boxes: Operational/Healthy
- 🟡 Yellow boxes: Warning/Degraded
- 🔴 Red boxes: Critical/Down

**Features**:
- Overall system status at the top
- Summary statistics in cards
- Detailed service status for each service
- Unresolved alerts section (only appears if there are alerts)
- Auto-refresh every 30 seconds
- Manual refresh button
- Restricted to admin users only

---

## Color Scheme

### System Feedback Banner
- **Operational**: Hidden (no banner)
- **Warning**: Yellow (#F59E0B background, white text)
- **Danger**: Red (#EF4444 background, white text)

### Admin Dashboard Status
- **Operational**: Green (#10B981)
- **Degraded**: Yellow (#F59E0B)
- **Down**: Red (#EF4444)

### Alert Severity
- **Low/Info**: Blue (#3B82F6)
- **Medium**: Yellow (#F59E0B)
- **High**: Orange (#F97316)
- **Critical**: Red (#EF4444)

---

## User Flow Examples

### Scenario 1: User Tries to Login Without Accepting Terms
1. User visits `/auth/login`
2. User enters email and password
3. User clicks "Sign In" without checking the terms box
4. ❌ Button is disabled, cannot proceed
5. User checks the terms box
6. ✅ Button becomes enabled, can now login

### Scenario 2: User Registers for New Account
1. User visits `/auth/register`
2. User fills out all fields
3. User checks terms acceptance box
4. User clicks "Create Account"
5. ✅ Account created, redirected to login page

### Scenario 3: System Issues Detected
1. Database becomes slow
2. System status endpoint detects degraded performance
3. 🟡 Yellow banner appears at top of page: "System performance degraded"
4. Banner shows "Affected services: database"
5. User can continue using the site
6. User can dismiss the banner if desired
7. Banner reappears on next page load if issue persists

### Scenario 4: Admin Monitors System
1. Admin logs in with admin credentials
2. Admin navigates to `/admin/monitoring`
3. Dashboard shows real-time status of all services
4. Admin sees 1 critical alert
5. Admin investigates the alert details
6. Admin takes action to resolve the issue
7. Dashboard auto-refreshes to show updated status

---

## Technical Notes

### Animation/Transitions
- System feedback banner slides down from top with spring animation
- Login/registration forms have fade-in animation
- Admin dashboard cards have staggered fade-in
- All buttons have hover effects

### Responsive Design
- All pages are mobile-responsive
- Admin dashboard adapts to smaller screens
- Forms stack vertically on mobile
- Banner remains at top on all screen sizes

### Accessibility
- All form inputs have proper labels
- Checkboxes are keyboard accessible
- Links open in new tabs with proper attributes
- Color contrast meets WCAG standards
- Screen reader friendly
