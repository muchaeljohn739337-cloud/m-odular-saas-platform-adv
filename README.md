# Advancia Pay Ledger - Backend API

> **Modern fintech backend with Express.js, Socket.IO, and real-time transaction management**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black.svg)](https://socket.io/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Windows (for batch file automation)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/pdtribe181-prog/-modular-saas-platform.git

# Navigate to project
cd -modular-saas-platform

# Install backend dependencies
cd backend
npm install

# Return to root and run tests
cd ..
START-HEALTH-TEST.bat
```

**That's it!** The batch file will:
1. ✅ Start the backend server on port 4000
2. ✅ Run 4 automated API tests
3. ✅ Open two terminal windows for easy monitoring

---

## 📋 What Gets Tested

The automated health test script validates:

| Test | Endpoint | What It Checks |
|------|----------|----------------|
| 1️⃣ Health Check | `GET /health` | Backend is running and responsive |
| 2️⃣ POST Transaction | `POST /api/transaction` | Can create new transactions |
| 3️⃣ GET Recent | `GET /api/transaction/recent/:userId` | Can retrieve user transactions |
| 4️⃣ GET Balance | `GET /api/transactions/balance/:userId` | Can calculate user balance |

---

## 🛠️ Manual Testing

If you prefer to test manually:

### Start the Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 4000
📡 Socket.IO server ready
```

### Test Endpoints

#### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/health"
```

#### Create Transaction
```powershell
$body = @{
  userId = "user_1"
  amount = 150.00
  type   = "credit"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/transaction" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

#### Get Recent Transactions
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/transaction/recent/user_1"
```

#### Get Balance
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/transactions/balance/user_1"
```

---

## 📡 API Endpoints

### Health
- **GET** `/health` - Server health check

### Transactions
- **POST** `/api/transaction` - Create new transaction
- **GET** `/api/transaction/recent/:userId` - Get last 10 transactions
- **GET** `/api/transactions/user/:userId` - Get all user transactions
- **GET** `/api/transactions/balance/:userId` - Get user balance
- **GET** `/api/transactions` - Get last 50 transactions (admin)

### WebSocket Events
- `connection` - Client connects
- `join-room` - Join user-specific room
- `transaction-created` - New transaction notification
- `global-transaction` - Broadcast to all clients

---

## 🏗️ Project Structure

```
-modular-saas-platform/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main Express server
│   │   └── routes/
│   │       └── transaction.ts     # Transaction API routes
│   ├── package.json              # Dependencies
│   └── tsconfig.json             # TypeScript config
│
├── .devcontainer/                # VS Code DevContainer
├── START-HEALTH-TEST.bat         # One-click test automation
├── CHECKLIST-RESULTS.md          # Health check report
└── README.md                     # This file
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client (when DB is set up)
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| TypeScript | 5.9 | Type-safe JavaScript |
| Express | 4.21 | Web framework |
| Socket.IO | 4.8 | WebSocket server |
| Prisma | 5.22 | Database ORM |
| CORS | 2.8 | Cross-origin requests |
| dotenv | 16.6 | Environment variables |

---

## 🔒 Security

- ✅ **No vulnerabilities** (verified with `npm audit`)
- ✅ CORS configured for specific origins
- ✅ Input validation on all endpoints
- ✅ Error handling with proper status codes

---

## 📊 Health Status

**Last Check:** October 15, 2025

| Metric | Status |
|--------|--------|
| Dependencies | ✅ All installed |
| TypeScript | ✅ No errors |
| Security | ✅ 0 vulnerabilities |
| API Endpoints | ✅ All working |
| Portability | ✅ Works anywhere |
| Score | **100%** |

See [`CHECKLIST-RESULTS.md`](CHECKLIST-RESULTS.md) for detailed report.

---

## 🚀 Production Deployment

### Environment Variables

Create a `.env` file:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=your_database_url
NODE_ENV=production
```

### Using Docker (Coming Soon)

```bash
docker-compose up -d
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 To-Do / Roadmap

- [ ] Replace in-memory storage with Prisma + PostgreSQL
- [ ] Add JWT authentication
- [ ] Add frontend application
- [ ] Add unit tests (Jest)
- [ ] Add integration tests (Supertest)
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add rate limiting
- [ ] Add request logging (Morgan)
- [ ] Deploy to production (AWS/Azure/Vercel)

---

## 🐛 Troubleshooting

### Port 4000 Already in Use

```powershell
# Find and kill process on port 4000
Get-NetTCPConnection -LocalPort 4000 | 
  Select-Object -Unique OwningProcess | 
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Dependencies Not Installing

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Rebuild TypeScript
npm run build
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Project Owner:** pdtribe181-prog
- **Repository:** https://github.com/pdtribe181-prog/-modular-saas-platform

---

## 📞 Support

Having issues? Check:
1. [`CHECKLIST-RESULTS.md`](CHECKLIST-RESULTS.md) - Health check details
2. [GitHub Issues](https://github.com/pdtribe181-prog/-modular-saas-platform/issues) - Report bugs
3. Server logs in the terminal windows

---

**Happy Coding!** 💻✨

Made with ❤️ by the Advancia Pay Ledger Team
