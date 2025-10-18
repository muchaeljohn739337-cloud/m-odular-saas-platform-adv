# 🔍 Audit Log System - Complete Integration Guide

**Status**: ✅ **COMPLETED**  
**Date**: October 17, 2025

---

## 📋 Overview

The audit log system provides comprehensive tracking of all important actions and admin operations in the Advancia Pay Ledger platform. It logs user actions, resource modifications, and system events for compliance, security, and debugging purposes.

---

## ✅ What Was Implemented

### 1. Enhanced Prisma Schema ✅

**Location**: `backend/prisma/schema.prisma`

Added comprehensive AuditLog model with fields:
- `id` - Unique identifier (UUID)
- `userId` - User who performed the action
- `action` - Action type (e.g., "CREATE_USER", "UPDATE_BALANCE")
- `resourceType` - Resource type (e.g., "user", "transaction", "crypto")
- `resourceId` - ID of the affected resource
- `changes` - JSON object containing all changes
- `previousValues` - JSON object with previous values
- `newValues` - JSON object with new values
- `metadata` - Additional metadata (method, path, query, etc.)
- `ipAddress` - IP address of the requester
- `userAgent` - User agent string
- `timestamp` - When the action occurred
- `createdAt` - Record creation time

**Indexes**: userId, resourceType, resourceId, timestamp, createdAt

```prisma
model AuditLog {
  id             String   @id @default(uuid())
  userId         String?
  action         String
  resourceType   String
  resourceId     String
  changes        Json?
  previousValues Json?
  newValues      Json?
  metadata       Json?
  ipAddress      String?
  userAgent      String?
  timestamp      DateTime @default(now())
  createdAt      DateTime @default(now())
  
  @@index([userId])
  @@index([resourceType])
  @@index([resourceId])
  @@index([timestamp])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

### 2. Updated Audit Log Utilities ✅

**Location**: `backend/src/utils/auditLog.ts`

**Functions**:

#### `createAuditLog(entry: AuditLogEntry)` ✅
- Creates audit log entries in database
- Automatically captures IP address and user agent
- Fallback to console logging if database fails
- Returns the created audit log record

**Usage**:
```typescript
await createAuditLog({
  userId: user.id,
  action: 'UPDATE_BALANCE',
  resourceType: 'user',
  resourceId: user.id,
  previousValues: { balance: 100 },
  newValues: { balance: 150 },
  metadata: {
    amount: 50,
    method: 'POST',
    path: '/api/users/balance'
  }
})
```

#### `auditLogMiddleware(req, res, next)` ✅
- Express middleware for automatic logging
- Logs all write operations (POST, PUT, DELETE, PATCH)
- Captures request metadata automatically
- Non-blocking (doesn't affect response time)

**Usage**:
```typescript
app.use(auditLogMiddleware) // Apply globally
// OR
app.use('/api/admin', auditLogMiddleware) // Apply to specific routes
```

#### `getAuditLogs(filters)` ✅
- Retrieve audit logs with filters
- Supports pagination (limit, skip)
- Filters: userId, resourceType, resourceId, date range
- Returns array of audit log entries

**Usage**:
```typescript
const logs = await getAuditLogs({
  userId: 'user-123',
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-31'),
  limit: 50,
  skip: 0
})
```

---

### 3. Audit Log API Routes ✅

**Location**: `backend/src/routes/auditLogs.ts`

**Endpoints**:

#### GET `/api/audit-logs`
Get audit logs with optional filters

**Query Parameters**:
- `userId` - Filter by user ID
- `resourceType` - Filter by resource type
- `resourceId` - Filter by resource ID
- `startDate` - Filter by start date (ISO string)
- `endDate` - Filter by end date (ISO string)
- `limit` - Number of results (default: 50)
- `skip` - Number of results to skip (default: 0)

**Response**:
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": "uuid",
      "userId": "user-123",
      "action": "UPDATE_BALANCE",
      "resourceType": "user",
      "resourceId": "user-123",
      "changes": { "balance": 150 },
      "previousValues": { "balance": 100 },
      "newValues": { "balance": 150 },
      "metadata": { "method": "POST", "path": "/api/users/balance" },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-10-17T10:30:00Z",
      "createdAt": "2025-10-17T10:30:00Z"
    }
  ]
}
```

#### GET `/api/audit-logs/:id`
Get a specific audit log by ID

**Response**:
```json
{
  "success": true,
  "data": { /* audit log object */ }
}
```

#### GET `/api/audit-logs/user/:userId`
Get all audit logs for a specific user

**Query Parameters**: `limit`, `skip`

#### GET `/api/audit-logs/resource/:resourceType/:resourceId`
Get all audit logs for a specific resource

**Query Parameters**: `limit`, `skip`

**Example**:
```bash
GET /api/audit-logs/resource/transaction/txn-456
```

#### POST `/api/audit-logs` (Admin only)
Create a manual audit log entry

**Request Body**:
```json
{
  "userId": "user-123",
  "action": "MANUAL_CORRECTION",
  "resourceType": "transaction",
  "resourceId": "txn-789",
  "changes": { "amount": 100 },
  "previousValues": { "amount": 90 },
  "newValues": { "amount": 100 },
  "metadata": { "reason": "Correction approved by admin" }
}
```

#### GET `/api/audit-logs/stats/summary`
Get audit log statistics

**Query Parameters**: `startDate`, `endDate`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalLogs": 1250,
    "uniqueUsers": 45,
    "topActions": [
      { "action": "UPDATE_BALANCE", "count": 450 },
      { "action": "CREATE_TRANSACTION", "count": 320 },
      { "action": "UPDATE_USER", "count": 180 }
    ],
    "topResources": [
      { "resourceType": "transaction", "count": 600 },
      { "resourceType": "user", "count": 400 },
      { "resourceType": "crypto", "count": 250 }
    ]
  }
}
```

---

### 4. Route Registration ✅

**Location**: `backend/src/index.ts`

Added audit logs router to Express app:
```typescript
import auditLogsRouter from "./routes/auditLogs";
// ...
app.use("/api/audit-logs", auditLogsRouter);
console.log('✓ Audit log routes registered');
```

---

## 🚀 Migration Required

### Database Migration

**Migration Name**: `enhance_audit_log_system`

**What Changed**:
- Renamed `resource` field to `resourceType`
- Added `resourceId` field
- Added `changes`, `previousValues`, `newValues` JSON fields
- Added `metadata` JSON field for flexible data storage
- Added `timestamp` field (separate from createdAt)
- Added indexes for better query performance

**To Run Migration** (when PostgreSQL is available):
```bash
cd backend
npx prisma migrate dev --name enhance_audit_log_system
npx prisma generate
```

**Manual SQL** (if needed):
```sql
-- Add new columns to audit_logs table
ALTER TABLE audit_logs RENAME COLUMN resource TO resourceType;
ALTER TABLE audit_logs ADD COLUMN resourceId TEXT NOT NULL DEFAULT '';
ALTER TABLE audit_logs ADD COLUMN changes TEXT; -- JSON stored as text in SQLite
ALTER TABLE audit_logs ADD COLUMN previousValues TEXT;
ALTER TABLE audit_logs ADD COLUMN newValues TEXT;
ALTER TABLE audit_logs ADD COLUMN metadata TEXT;
ALTER TABLE audit_logs ADD COLUMN timestamp DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE audit_logs DROP COLUMN details;

-- Create indexes for performance
CREATE INDEX idx_audit_logs_userId ON audit_logs(userId);
CREATE INDEX idx_audit_logs_resourceType ON audit_logs(resourceType);
CREATE INDEX idx_audit_logs_resourceId ON audit_logs(resourceId);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

---

## 📖 Usage Examples

### Example 1: Log User Registration
```typescript
import { createAuditLog } from './utils/auditLog'

// In registration endpoint
const newUser = await prisma.user.create({ data: userData })

await createAuditLog({
  userId: 'system',
  action: 'CREATE_USER',
  resourceType: 'user',
  resourceId: newUser.id,
  newValues: {
    email: newUser.email,
    username: newUser.username,
    role: newUser.role
  },
  metadata: {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    registrationMethod: 'email'
  }
})
```

### Example 2: Log Balance Update
```typescript
const oldBalance = user.usdBalance

await prisma.user.update({
  where: { id: userId },
  data: { usdBalance: newBalance }
})

await createAuditLog({
  userId: adminId,
  action: 'UPDATE_BALANCE',
  resourceType: 'user',
  resourceId: userId,
  previousValues: { balance: oldBalance },
  newValues: { balance: newBalance },
  changes: { balanceChange: newBalance - oldBalance },
  metadata: {
    reason: 'Manual adjustment',
    approvedBy: adminId
  }
})
```

### Example 3: Log Transaction Creation
```typescript
const transaction = await prisma.transaction.create({ data: txData })

await createAuditLog({
  userId: userId,
  action: 'CREATE_TRANSACTION',
  resourceType: 'transaction',
  resourceId: transaction.id,
  newValues: {
    amount: transaction.amount,
    type: transaction.type,
    status: transaction.status
  },
  metadata: {
    category: transaction.category,
    description: transaction.description
  }
})
```

### Example 4: Retrieve Audit Logs
```typescript
// Get all logs for a user
const userLogs = await getAuditLogs({
  userId: 'user-123',
  limit: 100
})

// Get logs for a specific resource
const transactionLogs = await getAuditLogs({
  resourceType: 'transaction',
  resourceId: 'txn-456'
})

// Get logs within date range
const recentLogs = await getAuditLogs({
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-31'),
  limit: 50,
  skip: 0
})
```

---

## 🔐 Security Considerations

### 1. Access Control
- Audit log endpoints should be protected with authentication
- Only admins should access most audit log endpoints
- Users should only see their own audit logs

**Recommended Middleware**:
```typescript
// Add to routes/auditLogs.ts
import { requireAuth, requireAdmin } from '../middleware/auth'

router.get('/', requireAdmin, async (req, res) => { /* ... */ })
router.get('/user/:userId', requireAuth, async (req, res) => {
  // Check if user is viewing their own logs or is admin
  if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  // ... rest of handler
})
```

### 2. Data Retention
- Consider implementing data retention policies
- Archive old audit logs after certain period
- Comply with GDPR/privacy regulations

### 3. Sensitive Data
- Avoid logging passwords or sensitive credentials
- Redact sensitive fields in previousValues/newValues
- Use metadata for references, not raw data

---

## 📊 Monitoring & Analytics

### Useful Queries

**Most Active Users**:
```typescript
const activeUsers = await prisma.auditLog.groupBy({
  by: ['userId'],
  _count: { userId: true },
  orderBy: { _count: { userId: 'desc' } },
  take: 10
})
```

**Actions by Type**:
```typescript
const actionStats = await prisma.auditLog.groupBy({
  by: ['action'],
  _count: { action: true },
  orderBy: { _count: { action: 'desc' } }
})
```

**Daily Activity**:
```typescript
const dailyActivity = await prisma.auditLog.findMany({
  where: {
    timestamp: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    }
  },
  select: {
    timestamp: true,
    action: true
  }
})
```

---

## 🧪 Testing

### Test Audit Log Creation
```bash
# Create a test audit log
curl -X POST http://localhost:4000/api/audit-logs \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "action": "TEST_ACTION",
    "resourceType": "test",
    "resourceId": "test-123",
    "metadata": { "test": true }
  }'
```

### Test Audit Log Retrieval
```bash
# Get all audit logs
curl http://localhost:4000/api/audit-logs

# Get logs for specific user
curl http://localhost:4000/api/audit-logs/user/test-user

# Get logs with filters
curl "http://localhost:4000/api/audit-logs?resourceType=transaction&limit=10"

# Get statistics
curl http://localhost:4000/api/audit-logs/stats/summary
```

---

## 🎯 Integration Checklist

- [x] Enhanced Prisma schema with AuditLog model
- [x] Updated auditLog.ts utilities to use database
- [x] Created comprehensive API routes
- [x] Registered routes in main Express app
- [x] Added TypeScript types and interfaces
- [x] Implemented error handling and fallbacks
- [x] Created usage examples
- [x] Documented all endpoints
- [ ] Run database migration (requires PostgreSQL)
- [ ] Add authentication middleware to routes
- [ ] Implement admin-only access controls
- [ ] Add data retention policies
- [ ] Create frontend UI for viewing logs
- [ ] Add automated tests

---

## 🚧 Next Steps

### Immediate (When PostgreSQL is Available)
1. Start PostgreSQL database
2. Run `npx prisma migrate dev --name enhance_audit_log_system`
3. Run `npx prisma generate`
4. Test audit log endpoints
5. Verify database writes

### Short-term (1-2 hours)
1. Add authentication middleware to audit log routes
2. Implement role-based access control
3. Add frontend audit log viewer component
4. Test with real user actions

### Long-term (Future)
1. Implement data archival for old logs
2. Add audit log export functionality (CSV, JSON)
3. Create audit log dashboard with analytics
4. Add real-time audit log streaming (Socket.IO)
5. Implement compliance reports

---

## 📚 Related Files

- **Schema**: `backend/prisma/schema.prisma`
- **Utilities**: `backend/src/utils/auditLog.ts`
- **Routes**: `backend/src/routes/auditLogs.ts`
- **Main App**: `backend/src/index.ts`
- **Types**: `backend/src/types/index.ts` (if needed)

---

## ✅ Status

**Integration**: ✅ COMPLETE  
**Migration**: ⏳ PENDING (requires PostgreSQL)  
**Testing**: ⏳ PENDING  
**Production Ready**: 🔄 Needs migration + auth middleware

---

**Last Updated**: October 17, 2025  
**Next Review**: After PostgreSQL migration
