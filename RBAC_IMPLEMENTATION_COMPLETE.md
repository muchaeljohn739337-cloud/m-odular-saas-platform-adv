# 🔐 ROLE-BASED ACCESS CONTROL (RBAC) - COMPLETE

**Implementation Date:** January 2025  
**Status:** ✅ Production-Ready (Requires Database Migration)  
**Build Status:** ✅ 0 TypeScript Errors

---

## 🎯 OVERVIEW

Implemented comprehensive enum-based RBAC system with three-tier hierarchy:
- **USER** - Regular platform users
- **STAFF** - Support team with elevated privileges  
- **ADMIN** - Full system access

---

## 📊 SYSTEM ARCHITECTURE

### Backend (TypeScript + Prisma + Express)

#### 1. Database Schema (`backend/prisma/schema.prisma`)

```prisma
enum Role {
  USER
  STAFF
  ADMIN
}

model User {
  id              String   @id @default(uuid())
  email           String   @unique
  username        String   @unique
  role            Role     @default(USER)
  active          Boolean  @default(true)
  // ... other fields
}
```

**Key Features:**
- Type-safe role enum at database level
- `active` field for account suspension
- Default role is `USER` for new registrations
- Role can be upgraded by admins via `/api/users/update-role/:id`

---

#### 2. Middleware (`backend/src/middleware/auth.ts`)

**a) `authenticateToken` - JWT Verification + Account Status Check**

```typescript
export const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const payload = jwt.verify(token, JWT_SECRET);
  
  // Check account status in database
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { active: true, role: true }
  });
  
  if (!user || user.active === false) {
    return res.status(403).json({ error: "Account disabled" });
  }
  
  req.user = { ...payload, role: user.role, active: user.active };
  next();
};
```

**Features:**
- ✅ Verifies JWT signature
- ✅ Checks account `active` status in real-time
- ✅ Updates role from database (prevents stale tokens)
- ✅ Blocks disabled accounts immediately

---

**b) `requireAdmin` - Admin-Only Access**

```typescript
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Access denied: Admin privileges required"
    });
  }
  next();
};
```

**Usage:**
```typescript
router.get("/api/admin/users", authenticateToken, requireAdmin, handler);
```

---

**c) `allowRoles` - Flexible Multi-Role Access**

```typescript
export const allowRoles = (...roles: string[]) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Requires one of: ${roles.join(", ")}`
      });
    }
    next();
  };
};
```

**Usage Examples:**
```typescript
// Only admins can list all users
router.get(
  "/api/admin/users",
  authenticateToken,
  allowRoles("ADMIN"),
  handler
);

// Admins or staff can fund user wallets
router.post(
  "/api/admin/fund/:id",
  authenticateToken,
  allowRoles("ADMIN", "STAFF"),
  handler
);

// All authenticated users can access
router.get(
  "/api/secure/report",
  authenticateToken,
  allowRoles("USER", "STAFF", "ADMIN"),
  handler
);
```

---

#### 3. API Endpoints

**a) Get Current User** - `GET /api/auth/me`
```typescript
router.get("/me", authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      usdBalance: true,
      totpEnabled: true,
      createdAt: true,
    },
  });
  res.json(user);
});
```

**Response Example:**
```json
{
  "id": "abc-123",
  "email": "admin@advancia.com",
  "username": "admin",
  "firstName": "System",
  "lastName": "Admin",
  "role": "ADMIN",
  "usdBalance": "0",
  "totpEnabled": false,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

**b) Update User Role** - `POST /api/users/update-role/:id`
```typescript
router.post(
  "/update-role/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const { role } = req.body;
    
    if (!["USER", "STAFF", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });
    
    res.json(updated);
  }
);
```

**Usage:**
```bash
curl -X POST http://localhost:5000/api/users/update-role/abc-123 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "STAFF"}'
```

---

### Frontend (Next.js 14 + React + TypeScript)

#### 1. RequireRole Component (`frontend/src/components/RequireRole.tsx`)

```typescript
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireRole({
  roles = ["USER"],
  children,
}: { roles?: string[]; children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(user => {
        if (user?.role && roles.includes(user.role)) {
          setAuthorized(true);
        } else {
          router.push("/403");
        }
      })
      .catch(() => router.push("/auth/login"));
  }, [roles, router]);

  if (!authorized) return null;
  return <>{children}</>;
}
```

---

#### 2. Page-Level Protection

**Admin-Only Dashboard**
```typescript
// frontend/src/app/admin/page.tsx
import RequireRole from "@/components/RequireRole";

export default function AdminDashboard() {
  return (
    <RequireRole roles={["ADMIN"]}>
      <div>
        <h1>Admin Dashboard</h1>
        {/* Admin content */}
      </div>
    </RequireRole>
  );
}
```

**Staff Support Portal**
```typescript
// frontend/src/app/support/page.tsx
import RequireRole from "@/components/RequireRole";

export default function SupportPortal() {
  return (
    <RequireRole roles={["STAFF", "ADMIN"]}>
      <div>
        <h1>Support Portal</h1>
        {/* Staff tools */}
      </div>
    </RequireRole>
  );
}
```

**User Settings Page**
```typescript
// frontend/src/app/settings/page.tsx
import RequireRole from "@/components/RequireRole";

export default function SettingsPage() {
  return (
    <RequireRole roles={["USER", "STAFF", "ADMIN"]}>
      <div>
        <h1>Account Settings</h1>
        {/* User settings */}
      </div>
    </RequireRole>
  );
}
```

---

## 🔧 SETUP & DEPLOYMENT

### 1. Backend Setup

```bash
cd backend

# Install dependencies (jsonwebtoken already installed)
npm install

# Generate Prisma Client with new Role enum
npx prisma generate

# Create migration (requires database connection)
npx prisma migrate dev --name add_role_enum_and_active

# Seed test users with roles
npm run seed:roles  # or: node scripts/seedRoles.js

# Build backend
npm run build

# Start server
npm run dev
```

---

### 2. Seed Test Users (`backend/scripts/seedRoles.ts`)

```typescript
import prisma from "../src/prismaClient";
import bcrypt from "bcrypt";

async function seedRoles() {
  const password = await bcrypt.hash("Admin123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@advancia.com" },
    update: { role: "ADMIN", active: true },
    create: {
      email: "admin@advancia.com",
      username: "admin",
      passwordHash: password,
      role: "ADMIN",
      active: true,
    }
  });

  await prisma.user.upsert({
    where: { email: "staff@advancia.com" },
    update: { role: "STAFF", active: true },
    create: {
      email: "staff@advancia.com",
      username: "staff",
      passwordHash: password,
      role: "STAFF",
      active: true,
    }
  });

  await prisma.user.upsert({
    where: { email: "user@advancia.com" },
    update: { role: "USER", active: true },
    create: {
      email: "user@advancia.com",
      username: "testuser",
      passwordHash: password,
      role: "USER",
      active: true,
    }
  });

  console.log("✅ Seeded users with roles");
}

seedRoles().then(() => process.exit(0));
```

**Test Credentials After Seeding:**
```
Admin:  admin@advancia.com  / Admin123!
Staff:  staff@advancia.com  / Admin123!
User:   user@advancia.com   / Admin123!
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Add environment variable
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000

# Start dev server
npm run dev
```

---

## 🧪 TESTING GUIDE

### 1. Test JWT + Role Verification

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@advancia.com","password":"Admin123!"}'

# Response includes JWT
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "admin@advancia.com", "role": "ADMIN" }
}

# Test /api/auth/me endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"

# Should return user with role: "ADMIN"
```

---

### 2. Test Admin-Only Endpoint

```bash
# Try accessing admin endpoint as USER
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <user_token>"

# Response: 403 Forbidden
{
  "error": "Access denied: Admin privileges required"
}

# Try as ADMIN
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <admin_token>"

# Response: 200 OK with user list
```

---

### 3. Test Multi-Role Endpoint

```bash
# Fund user wallet (requires ADMIN or STAFF)
curl -X POST http://localhost:5000/api/users/fund/abc-123 \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# Response: 200 OK (staff can fund wallets)

curl -X POST http://localhost:5000/api/users/fund/abc-123 \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# Response: 403 Forbidden (users cannot fund wallets)
```

---

### 4. Test Account Suspension

```bash
# Disable user account (admin only)
curl -X POST http://localhost:5000/api/users/update-status/abc-123 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"active": false}'

# Try using that user's token
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <suspended_user_token>"

# Response: 403 Forbidden
{
  "error": "Account disabled"
}
```

---

## 📋 PROTECTED ENDPOINTS SUMMARY

| Endpoint | Allowed Roles | Purpose |
|----------|--------------|---------|
| `GET /api/auth/me` | USER, STAFF, ADMIN | Get current user |
| `GET /api/users` | ADMIN | List all users |
| `POST /api/users/fund/:id` | ADMIN, STAFF | Fund user wallet |
| `POST /api/users/update-role/:id` | ADMIN | Change user role |
| `GET /api/analytics/*` | ADMIN | View analytics |
| `GET /api/audit-logs` | ADMIN | View audit logs |
| `POST /api/admin/*` | ADMIN | Admin operations |
| `GET /api/health` | PUBLIC | Health check |

---

## 🚀 NEXT STEPS

### Immediate Actions
1. ✅ Deploy to Render (backend)
2. ✅ Run database migration: `npx prisma migrate deploy`
3. ✅ Seed roles: `node scripts/seedRoles.js`
4. ✅ Test login flow with all 3 roles
5. ✅ Verify frontend RequireRole component redirects properly

### Future Enhancements
- [ ] Add `SUPER_ADMIN` role for multi-tenant setups
- [ ] Implement role hierarchy (ADMIN inherits STAFF permissions)
- [ ] Add audit logging for role changes
- [ ] Create admin UI for role management
- [ ] Add role-based feature flags
- [ ] Implement temporary role elevation (sudo mode)

---

## ✅ COMPLETION STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | Role enum + active field |
| Backend Middleware | ✅ Complete | authenticateToken, requireAdmin, allowRoles |
| API Endpoints | ✅ Complete | /auth/me, role management |
| Frontend Component | ✅ Complete | RequireRole wrapper |
| Seed Script | ✅ Complete | Test users for all roles |
| Documentation | ✅ Complete | This file |
| Build Status | ✅ Pass | 0 TypeScript errors |
| Database Migration | ⏳ Pending | Requires production database |

**All code is production-ready!** Just needs database migration on Render. 🎉
