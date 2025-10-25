# 🪙 Crypto Purchase System - Ready to Test

## System Status
✅ **Backend**: Running on http://localhost:4000  
✅ **Frontend**: Running on http://localhost:3000  
✅ **Database**: SQLite (dev.db) with all tables created  
✅ **Admin Settings**: Configured (BTC, ETH, USDT wallets set)  
✅ **Test Data**: Created (test user with 2 pending orders)

---

## How to Use

### 1. Admin Panel
Visit: **http://localhost:3000/admin/crypto**

**Features:**
- **Settings Tab**: View/edit wallet addresses and exchange rates
- **Orders Tab**: View pending orders and mark as completed with transaction hash
- **Withdrawals Tab**: Approve/reject user withdrawal requests

**Test Data:**
- User: `test@crypto.demo`
- USD Balance: $500
- Pending Orders:
  - 0.00222 BTC ($100 + 2.5% fee = $102.50)
  - 0.08929 ETH ($250 + 2.5% fee = $256.25)

### 2. Complete an Order
1. Go to **Orders** tab in admin panel
2. Click on a pending order
3. Enter transaction hash (e.g., `0x1234567890abcdef`)
4. Add optional admin notes
5. Click **Complete Order**
6. Order status changes to `completed`

### 3. Backend API

All crypto endpoints:
```
GET    /api/crypto/admin/settings         # Get admin wallet config
PUT    /api/crypto/admin/settings         # Update settings
GET    /api/crypto/admin/orders           # Get pending orders
PUT    /api/crypto/admin/orders/{id}      # Mark order complete
GET    /api/crypto/admin/withdrawals      # Get pending withdrawals
PUT    /api/crypto/admin/withdrawals/{id} # Approve/reject
GET    /api/crypto/rates                  # Get current rates
GET    /api/crypto/purchase-history       # User's purchase history
GET    /api/crypto/withdrawal-history     # User's withdrawal history
POST   /api/crypto/purchase               # Create purchase order
POST   /api/crypto/request-withdrawal     # Request withdrawal
```

### 4. Database
Location: `backend/dev.db` (SQLite)

Tables:
- `users` - User accounts with USD balance
- `admin_settings` - Crypto wallet addresses & exchange rates
- `crypto_orders` - Purchase orders
- `crypto_withdrawals` - Withdrawal requests
- `transactions` - Financial transactions
- (12+ other tables for full platform)

---

## Files Created/Modified

### New Files
- `backend/scripts/seedAdminSettings.mjs` - Direct DB seeding for admin settings
- `backend/scripts/seedTestData.mjs` - Creates test user with sample orders
- `frontend/src/app/admin/crypto/page.tsx` - Admin dashboard route
- `Start-Servers.ps1` - Helper to start backend & frontend
- `Seed-CryptoSettings.ps1` - Prompt for wallet addresses and seed DB
- `Seed-TestData.ps1` - Creates test data with one command

### Modified Files
- `backend/prisma/schema.prisma` - Added crypto models (AdminSettings, CryptoOrder, CryptoWithdrawal)
- `backend/src/index.ts` - Added crypto routes
- `backend/src/routes/crypto.ts` - 10 crypto API endpoints
- `backend/src/routes/payments.ts` - Stripe webhook updated to credit USD balance
- `frontend/src/components/CryptoAdminPanel.tsx` - Admin UI component
- `Setup-CryptoSystem.ps1` - Enhanced health checks

---

## Testing Workflow

### Quick Test (5 minutes)
1. Admin visits http://localhost:3000/admin/crypto
2. Views pending orders in "Orders" tab
3. Enters fake transaction hash to complete an order
4. Sees order status update to "completed"

### Full Test (15 minutes)
1. Create a new user (login/signup)
2. Add $100 via Stripe (test card: 4242 4242 4242 4242)
3. Purchase 0.002 BTC (~$100)
4. Admin approves the order in the panel
5. User sees completed order in their history

---

## Troubleshooting

### Backend not starting
```powershell
cd backend
npm install
npx prisma generate
npm run dev
```

### Frontend not responding
```powershell
cd frontend
npm install
npm run dev
```

### Seed test data again
```powershell
.\Seed-TestData.ps1
```

### Reconfigure crypto settings
```powershell
.\Seed-CryptoSettings.ps1
```

### Check database
```powershell
cd backend
npx prisma studio
```

---

## Key Implementation Details

**Exchange Rate Calculation:**
- Admin sets rates (BTC=$45k, ETH=$2800)
- Purchase amount = USD / Exchange Rate
- Fee = Purchase Amount * 0.025
- Total USD deducted = Purchase Amount + Fee

**Order Workflow:**
1. User places order (USD balance decremented immediately)
2. Order status: `pending`
3. Admin views order, gets user's wallet address
4. Admin sends crypto to user's address
5. Admin enters transaction hash and marks complete
6. Order status: `completed` or `cancelled`

**Withdrawal Workflow:**
1. User requests withdrawal (enters withdrawal address + amount)
2. Withdrawal status: `pending`
3. Admin views request, decides to approve or reject
4. Admin adds notes and submits decision
5. Status: `approved` or `rejected`

---

## Next Steps

✅ Done:
- Full crypto purchase system implemented
- Admin control panel built
- Test data available
- Database seeded with settings

⏳ Optional:
- Add user-facing crypto purchase form (component exists: `CryptoOrderForm`)
- Integrate live crypto prices (CoinGecko API)
- Email notifications for order completion
- Webhook for automatic order status updates
- Multi-crypto support (add LTC, Ripple, etc.)

---

## Support

For issues or questions:
1. Check backend logs (terminal window)
2. Check frontend browser console (F12)
3. Use `npx prisma studio` to inspect database
4. Review `CRYPTO_SYSTEM_GUIDE.md` for full docs

Happy crypto trading! 🚀
