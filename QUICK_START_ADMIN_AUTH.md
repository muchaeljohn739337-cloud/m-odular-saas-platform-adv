# 🚀 Quick Start Guide - Admin Auth & Subscriber System

## ✅ What's Done

All code is implemented and ready! Here's what was built:

### Backend
- ✅ Admin JWT authentication (`requireAdmin` middleware)
- ✅ Login/refresh endpoints with email alerts
- ✅ Session tracking and revocation
- ✅ Real-time session updates via Socket.IO
- ✅ Secured subscriber endpoints (admin-only)
- ✅ Email notifications for security events

### Frontend
- ✅ Admin login page (`/admin/login`)
- ✅ Session manager with live updates (`/admin/sessions`)
- ✅ Auto token refresh utility
- ✅ Protected route checks

### Database
- ✅ Subscriber model added to Prisma schema
- ⏳ **NEEDS**: Table creation (run migration)

---

## 📋 Setup Steps (5 minutes)

### Step 1: Configure Environment Variables

Edit `backend/.env` and add:

```env
# JWT Secrets (generate random strings)
JWT_SECRET="your_secret_key_min_32_characters_long"
REFRESH_SECRET="your_refresh_secret_key_min_32_chars"

# Admin Credentials (CHANGE THESE!)
ADMIN_EMAIL="admin@advancia.com"
ADMIN_PASS="YourStrongPassword123!"

# Email Alerts (Gmail example)
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
ALERT_TO="security@advancia.com"
```

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate app password for "Mail"
3. Copy the 16-character code
4. Paste in `SMTP_PASS`

### Step 2: Create Subscriber Table

```powershell
cd backend
npx prisma db push
npx prisma generate
```

This will:
- Create the `subscribers` table in your database
- Update Prisma client with typed access

### Step 3: Start Development Servers

**Backend:**
```powershell
cd backend
npm run dev
```
Server starts at http://localhost:4000

**Frontend:**
```powershell
cd frontend
npm run dev
```
Frontend starts at http://localhost:3000

---

## 🧪 Test the System

### Test 1: Admin Login

1. Navigate to: http://localhost:3000/admin/login
2. Enter credentials:
   - Email: `admin@advancia.com` (or your ADMIN_EMAIL)
   - Password: `Admin@123` (or your ADMIN_PASS)
3. Check "Remember me"
4. Click Login

**Expected:**
- ✅ Redirects to `/admin/subscribers`
- ✅ Email alert sent to `ALERT_TO`
- ✅ JWT token stored in localStorage

### Test 2: Session Manager

1. Navigate to: http://localhost:3000/admin/sessions
2. View active sessions in real-time
3. Click "Revoke" on any session

**Expected:**
- ✅ Live session list
- ✅ Session removed on revoke
- ✅ Email alert sent
- ✅ UI updates instantly (Socket.IO)

### Test 3: Subscriber API (via curl)

**Subscribe (Public):**
```bash
curl -X POST http://localhost:4000/api/subscribers/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**List Subscribers (Admin Only):**
```bash
# First, get token from login response or localStorage
TOKEN="your_jwt_token_here"

curl http://localhost:4000/api/subscribers \
  -H "Authorization: Bearer $TOKEN"
```

**Export CSV (Admin Only):**
```bash
curl http://localhost:4000/api/subscribers/export/csv \
  -H "Authorization: Bearer $TOKEN" \
  --output subscribers.csv
```

---

## 🔍 Verify Email Alerts Work

### Test Email Configuration

Create `backend/test-email.js`:
```javascript
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.sendMail({
  from: process.env.SMTP_USER,
  to: process.env.ALERT_TO,
  subject: '✅ SMTP Test',
  text: 'Email configuration working!'
}, (err, info) => {
  if (err) console.error('❌ Error:', err);
  else console.log('✅ Email sent:', info.messageId);
});
```

Run test:
```powershell
cd backend
node test-email.js
```

---

## 📊 API Endpoints Reference

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/login` | Admin login |
| POST | `/api/auth/admin/refresh` | Refresh token |
| POST | `/api/subscribers/subscribe` | Subscribe email |

### Protected Endpoints (Require Admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List active sessions |
| POST | `/api/sessions/revoke` | Revoke session |
| GET | `/api/subscribers` | List subscribers |
| DELETE | `/api/subscribers/:id` | Delete subscriber |
| GET | `/api/subscribers/export/csv` | Export CSV |
| GET | `/api/subscribers/summary` | Get stats |

---

## 🛠️ Troubleshooting

### "Missing token" error
- **Cause:** Not logged in or token expired
- **Fix:** Go to `/admin/login` and login again

### Email alerts not working
- **Cause:** Invalid SMTP credentials
- **Fix:** Run `node test-email.js` to verify SMTP config
- **Gmail:** Enable 2FA and create app password

### Socket.IO not connecting
- **Cause:** CORS or backend not running
- **Fix:** Check backend console for Socket.IO connection logs
- **Verify:** NEXT_PUBLIC_API_URL matches backend URL

### Prisma client errors
- **Cause:** Database schema not synced
- **Fix:** Run `npx prisma db push && npx prisma generate`

### 403 Forbidden on subscriber endpoints
- **Cause:** Missing or invalid admin token
- **Fix:** Check Authorization header format: `Bearer <token>`

---

## 🎯 Next Steps

1. **Change Default Credentials**
   - Update `ADMIN_EMAIL` and `ADMIN_PASS` in .env
   - Use a strong password

2. **Generate Secure JWT Secrets**
   ```powershell
   # In PowerShell
   [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
   ```

3. **Test Production Deploy**
   - Update environment variables on Render/Vercel
   - Test login flow on production
   - Verify email alerts work

4. **Add More Admin Features**
   - Subscriber dashboard UI
   - Analytics/charts
   - Bulk operations
   - Email campaigns

---

## 📚 Additional Documentation

- Full implementation details: `ADMIN_AUTH_COMPLETE.md`
- Environment template: `backend/.env.template`
- Prisma schema: `backend/prisma/schema.prisma`

---

**Status:** ✅ Ready to Test
**Dependencies:** All installed (nodemailer, socket.io-client, zod)
**Database:** ⏳ Needs migration (Step 2 above)
