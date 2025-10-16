# 🚀 Quick Reference Card - Advancia Pay Ledger

## ⚡ Instant Commands

### First Time Setup
```bash
# Install everything
cd backend && npm install && cd ../frontend && npm install

# Start PostgreSQL
docker run -d --name advancia-postgres -e POSTGRES_USER=dev_user -e POSTGRES_PASSWORD=dev_password -e POSTGRES_DB=advancia_ledger -p 5432:5432 postgres:14-alpine

# Setup database
cd backend && npx prisma migrate dev --name init && npx prisma generate
```

### Daily Development
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Open dashboard
start http://localhost:3000
```

---

## 🎯 URLs

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| Login | http://localhost:3000/auth/login |
| API | http://localhost:4000 |
| Health | http://localhost:4000/health |
| Prisma Studio | npx prisma studio (in backend/) |

---

## 🛠️ Common Issues & Quick Fixes

| Issue | Command |
|-------|---------|
| Port 3000 busy | `npx kill-port 3000` |
| Port 4000 busy | `npx kill-port 4000` |
| Page not updating | Restart `npm run dev` |
| Clear frontend cache | `rm -rf .next && npm run dev` |
| Import error | Use `@/components/...` |
| Tailwind not working | Check `@tailwind` in `globals.css` |

**Interactive Fix Tool:**
```powershell
.\quick-fix.ps1      # Menu with 9 options
```

**Full Troubleshooting:** See `TROUBLESHOOTING.md` for detailed solutions

---

## 📦 New Components (Just Added!)

```typescript
// Route protection (wraps protected pages)
import DashboardRouteGuard from '@/components/DashboardRouteGuard'

// Health insights (R&D feature)
import MedbedSection from '@/components/MedbedSection'

// Token wallet management
import TokenSection from '@/components/TokenSection'

// Authentication wrapper
import AuthProvider from '@/components/AuthProvider'
```

**Login Page:** `http://localhost:3000/auth/login` (demo mode - any credentials work)

---

## 🎯 URLs

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/health |
| Prisma Studio | npx prisma studio (in backend/) |

---

## 🎨 Dashboard Features

### Summary Cards (Top Row)
1. **💰 Total Credits** (green) - All incoming money
2. **💸 Total Debits** (red) - All outgoing money
3. **🧾 Net Balance** (blue) - **CLICK** to see breakdown
4. **🎁 Bonus Earnings** (amber) - **HOVER** for tooltip

### Balance Modal (Click Net Balance)
- Main Account: $4,000.00
- Earnings: $1,250.00
- Rewards: $0.00
- **Total**: $5,250.00

### Transaction List
- Filter: All / Credits / Debits / Bonus
- Real-time updates via Socket.IO
- Shows last 10 transactions

---

## 🔌 API Endpoints

```bash
# Health check
GET http://localhost:4000/health

# Create transaction
POST http://localhost:4000/api/transaction
{
  "userId": "user-123",
  "amount": 100.50,
  "type": "credit",
  "description": "Test"
}

# Get balance
GET http://localhost:4000/api/transactions/balance/user-123

# Get recent transactions
GET http://localhost:4000/api/transactions/recent/user-123
```

---

## 🎭 Key Interactions

### Animations
- **Cards**: Scale to 103% on hover
- **Icons**: Rotate 360° on hover
- **Counters**: Animate from 0 to value
- **Lists**: Slide in from left

### Sounds
- **Click**: Short beep (800Hz)
- **Success**: Two-tone chime (600Hz → 800Hz)
- **Error**: Low tone (300Hz)
- **Haptic**: 10ms vibration on mobile

---

## 🗄️ Database Models

| Model | Purpose |
|-------|---------|
| User | Authentication & profile |
| Transaction | Financial records |
| DebitCard | Card management |
| Session | Token auth |
| AuditLog | Compliance tracking |

---

## 📦 Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript 5.9
- Framer Motion 11
- Tailwind CSS 3.4
- Socket.IO Client 4.8

### Backend
- Express 4.21
- Socket.IO 4.8
- Prisma 5.22
- TypeScript 5.9
- PostgreSQL 14

---

## 🐛 Quick Fixes

```bash
# Port in use
taskkill /PID <pid> /F

# Prisma issues
npx prisma generate

# Database connection
docker start advancia-postgres

# Install missing deps
npm install
```

---

## 📊 Project Structure

```
-modular-saas-platform/          ← Root (scripts are here)
├── Start-Dev.ps1                ← Helper script
├── Check-Services.ps1           ← Diagnostic script
├── backend/                     ← Backend code
│   └── npm run dev              ← Start backend
└── frontend/                    ← You are here
    └── npm run dev              ← Start frontend
```

---

## 🎯 Quick Test

```bash
# Run automated tests
START-HEALTH-TEST.bat

# Or manual test
curl http://localhost:4000/health
```

---

## 📚 Documentation

- `README.md` - Project overview
- `BUILD_COMPLETE.md` - Complete build guide
- `DASHBOARD_IMPLEMENTATION.md` - Dashboard details
- `backend/README.md` - Backend API docs
- `backend/PRISMA_SETUP.md` - Database setup
- `frontend/README.md` - Frontend docs
- `frontend/SETUP_COMPLETE.md` - Frontend setup

---

## ✨ Feature Checklist

Dashboard:
- [x] 4 animated summary cards
- [x] Clickable balance breakdown
- [x] Real-time transaction feed
- [x] Transaction filters
- [x] Sound feedback
- [x] Haptic feedback
- [x] Responsive design
- [x] Smooth animations

Backend:
- [x] REST API endpoints
- [x] Socket.IO server
- [x] Prisma ORM
- [x] 5 database models
- [x] Error handling
- [x] CORS enabled
- [x] Health checks

---

**🎉 Everything is ready! Run `npm install` in both folders and start coding!**
