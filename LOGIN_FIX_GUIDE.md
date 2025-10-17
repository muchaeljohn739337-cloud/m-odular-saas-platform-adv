# 🔧 LOGIN SYSTEM FIX - 30 MINUTE GUIDE

## ❌ **PROBLEMS FOUND:**

### **Problem 1: NextAuth Not Connected to Backend**
**Location:** `frontend/src/app/api/auth/[...nextauth]/route.ts`  
**Issue:** Authorization function is a placeholder - doesn't call backend API  
**Line 26-37:** Has TODO comment with fake authentication

### **Problem 2: Backend Uses OTP System**
**Location:** `backend/src/routes/auth.ts`  
**Issue:** No traditional email/password login endpoint  
**Current endpoints:**
- `/api/auth/send-otp-email` - Sends OTP to email
- `/api/auth/send-otp-sms` - Sends OTP to phone  
- `/api/auth/verify-otp` - Verifies OTP code

### **Problem 3: Frontend Expects Password Login**
**Location:** `frontend/src/app/auth/login/page.tsx`  
**Issue:** Tries to use NextAuth credentials provider  
**But:** Backend doesn't have password validation

---

## ✅ **SOLUTION OPTIONS:**

### **OPTION A: Add Password Auth to Backend** (Recommended - 30 min)
Add traditional email/password authentication alongside OTP.

### **OPTION B: Use OTP-Only** (15 min)
Remove password login from frontend, use only OTP.

### **OPTION C: Quick Test Mode** (5 min)
Enable test login that works immediately (dev only).

---

## 🚀 **OPTION A: ADD PASSWORD AUTH (RECOMMENDED)**

### **Step 1: Add bcrypt for password hashing** (2 min)

Backend already has `bcryptjs` installed! ✅

### **Step 2: Add Registration Endpoint** (10 min)

Add to `backend/src/routes/auth.ts`:

```typescript
import bcrypt from 'bcryptjs';

/**
 * Register new user with email/password
 * POST /api/auth/register
 * Body: { email: string, password: string, firstName?: string, lastName?: string }
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        emailVerified: false,
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

/**
 * Login with email/password
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});
```

### **Step 3: Update NextAuth to Call Backend** (10 min)

Update `frontend/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  try {
    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.user && data.token) {
      return {
        id: data.user.id,
        email: data.user.email,
        name: `${data.user.firstName} ${data.user.lastName}`.trim(),
        accessToken: data.token
      };
    }

    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
```

### **Step 4: Update Database Schema** (5 min)

Check if User model has password field:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String?  // This field should exist
  firstName String?
  lastName  String?
  // ... other fields
}
```

If missing, add it and run migration.

### **Step 5: Test** (3 min)

```bash
# Register a user
curl -X POST https://advancia-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'

# Login
curl -X POST https://advancia-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

---

## ⚡ **OPTION C: QUICK TEST MODE (5 MIN)**

For immediate testing, enable test mode in NextAuth:

```typescript
async authorize(credentials) {
  // TEST MODE - Remove in production!
  if (process.env.NODE_ENV === 'development') {
    if (credentials?.email && credentials?.password) {
      return {
        id: "test-user-1",
        email: credentials.email,
        name: "Test User"
      };
    }
  }
  return null;
}
```

This allows ANY email/password to login in development.

---

## 📋 **QUICK ACTION PLAN (30 MINUTES):**

### **Minutes 0-5: Check Database**
✅ Verify User model has password field  
✅ Run migration if needed

### **Minutes 5-15: Add Backend Endpoints**
✅ Add /register endpoint  
✅ Add /login endpoint  
✅ Test with curl

### **Minutes 15-25: Fix Frontend NextAuth**
✅ Update authorize function  
✅ Call backend API  
✅ Handle response

### **Minutes 25-30: Test & Deploy**
✅ Test registration  
✅ Test login  
✅ Push to GitHub  
✅ Auto-deploy via CI/CD

---

## 🎯 **WHICH OPTION DO YOU WANT?**

**A)** Add full password authentication (30 min, production-ready)  
**B)** Use OTP-only system (15 min, already built)  
**C)** Quick test mode (5 min, works immediately)

**Tell me which option and I'll implement it!** 🚀
