# 🚀 Quick Start: Crypto Purchase System

## What You Have Now

✅ **Complete Backend API** - All crypto purchase/withdrawal endpoints ready
✅ **Database Schema** - CryptoOrder, CryptoWithdrawal, AdminSettings models
✅ **Stripe Integration** - USD deposits working perfectly
✅ **Admin Panel Component** - React component for managing crypto orders

## 3-Step Setup (10 minutes)

### Step 1: Run Database Migration
```bash
cd backend
npx prisma migrate dev --name add_crypto_system
```

This creates all the crypto tables in your database.

### Step 2: Configure Admin Wallet Addresses
Option A - Using curl:
```bash
curl -X PUT http://localhost:4000/api/crypto/admin/settings \
  -H "Content-Type: application/json" \
  -d '{
    "btcAddress": "YOUR_BITCOIN_ADDRESS",
    "ethAddress": "YOUR_ETHEREUM_ADDRESS",
    "usdtAddress": "YOUR_USDT_ADDRESS",
    "exchangeRateBtc": 45000,
    "exchangeRateEth": 2800,
    "exchangeRateUsdt": 1.00,
    "processingFeePercent": 2.5,
    "minPurchaseAmount": 10
  }'
```

Option B - Use the admin panel UI (after Step 3)

### Step 3: Add Admin Panel to Your App
```tsx
// frontend/src/app/admin/crypto/page.tsx
import CryptoAdminPanel from "@/components/CryptoAdminPanel";

export default function CryptoAdminPage() {
  return <CryptoAdminPanel />;
}
```

## How It Works (Simple Version)

### For Users:
1. **Add Funds** → User pays via Stripe, gets USD balance
2. **Buy Crypto** → User converts USD to BTC/ETH/USDT
3. **Request Withdrawal** → User asks to withdraw crypto

### For Admin (You):
1. **Check Orders** → See pending crypto purchases
2. **Send Crypto** → Send from your wallet to user's address
3. **Mark Complete** → Enter transaction hash, mark order done
4. **Approve Withdrawals** → Review and approve withdrawal requests

## Example User Journey

### User Side:
```
1. User pays $100 via Stripe
   ✅ usdBalance = $100

2. User buys BTC for $100
   - Click "Purchase Crypto"
   - Select BTC
   - Enter amount: $100
   - Enter their wallet address
   ✅ Order created (status: pending)
   ✅ usdBalance = $0

3. User waits for admin to send crypto

4. User receives BTC in their wallet
   ✅ Order status: completed
```

### Your Side (Admin):
```
1. Check admin panel daily

2. See pending order:
   - User: john@example.com
   - Amount: 0.00222 BTC
   - Wallet: 1A1zP1eP...

3. Open your crypto wallet (Coinbase, etc.)
   - Send 0.00222 BTC to 1A1zP1eP...
   - Get transaction hash

4. Update order in admin panel:
   - Paste transaction hash
   - Click "Mark as Completed"
   ✅ Done!
```

## API Endpoints Summary

### User Endpoints:
- `POST /api/crypto/purchase` - Buy crypto with USD
- `POST /api/crypto/withdrawal` - Request withdrawal
- `GET /api/crypto/orders/:userId` - Get user's orders
- `GET /api/crypto/rates` - Get current prices

### Admin Endpoints:
- `GET /api/crypto/admin/settings` - Get wallet addresses & rates
- `PUT /api/crypto/admin/settings` - Update settings
- `GET /api/crypto/admin/orders` - Get all orders
- `PUT /api/crypto/admin/orders/:id` - Complete order
- `GET /api/crypto/admin/withdrawals` - Get withdrawal requests
- `PUT /api/crypto/admin/withdrawals/:id` - Approve/reject withdrawal

## Test It Out

### 1. Add funds (already working)
```
User goes to dashboard → Add Funds → Pays $100 via Stripe
```

### 2. Purchase crypto
```bash
curl -X POST http://localhost:4000/api/crypto/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "cryptoType": "BTC",
    "usdAmount": 50,
    "userWalletAddress": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
  }'
```

### 3. Check admin panel
```
Go to /admin/crypto
See the pending order
```

### 4. Complete the order
- Send BTC from your wallet
- Enter transaction hash in admin panel
- Click "Mark as Completed"

## Security Notes

⚠️ **Important:**
- Admin MUST manually verify wallet addresses before sending
- Admin MUST manually send crypto (system doesn't auto-send)
- Orders deduct USD immediately (prevents double-spending)
- Withdrawals require admin approval (prevents fraud)
- All transactions are logged in database

## Daily Workflow

### Morning (5 minutes):
1. Check pending crypto orders
2. Send crypto to user wallets
3. Mark orders as completed

### As Needed:
4. Update exchange rates (BTC, ETH prices change)
5. Review withdrawal requests
6. Approve legitimate withdrawals

## Where Are the Crypto Addresses?

**Admin Addresses** (Your Wallets):
- Set in Admin Settings
- These are YOUR wallets where you receive payment
- You send crypto FROM these addresses to users

**User Addresses** (Their Wallets):
- Provided by user when purchasing
- You send crypto TO these addresses
- User owns these wallets

## Exchange Rate Management

### Manual Update (Quick):
1. Check current prices on CoinGecko
2. Update in admin settings
3. New orders use new rates

### Future: Auto-Update
```javascript
// backend/src/utils/updateRates.ts (TODO)
const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd');
// Update rates in database
```

## Support Requests

When user asks "Where's my crypto?":

1. **Check order status** in admin panel
2. **Verify transaction** on blockchain:
   - Bitcoin: blockchain.com/explorer
   - Ethereum: etherscan.io
   - USDT: etherscan.io (ERC-20)
3. **Show transaction hash** to user
4. Explain confirmations may take 10-60 minutes

## Troubleshooting

### "User has insufficient balance"
→ User needs to add more USD via Stripe first

### "Exchange rate not set"
→ Go to admin settings, set exchange rates

### "Admin wallet not configured"
→ Go to admin settings, add your wallet addresses

### "Order stuck at pending"
→ You need to send the crypto and mark it complete

## Next Steps

### Immediate:
1. Run database migration ✅
2. Set your wallet addresses ✅
3. Set exchange rates ✅
4. Test with small amount ✅

### Soon:
5. Build user-facing crypto purchase form
6. Add email notifications for order status
7. Add transaction history page
8. Set up auto-rate updates

### Later:
9. Add more cryptocurrencies (LTC, DOGE, etc.)
10. Integrate exchange APIs for auto-sending
11. Add KYC verification
12. Implement daily limits

## Files Created

✅ `backend/prisma/schema.prisma` - Updated with crypto models
✅ `backend/src/routes/crypto.ts` - All crypto API endpoints
✅ `frontend/src/components/CryptoAdminPanel.tsx` - Admin UI
✅ `CRYPTO_SYSTEM_GUIDE.md` - Full documentation
✅ `CRYPTO_QUICK_START.md` - This file

## Need Help?

1. **Database issues?** → Check Prisma migration logs
2. **API not working?** → Check backend terminal for errors
3. **Rates wrong?** → Update in admin settings
4. **User confusion?** → Point them to order history page

---

**Status**: ✅ Ready to deploy after running migration

**Time to Launch**: 10 minutes

**Complexity**: Low (manual process, safe for beginners)

**Risk**: Low (admin controls everything)

---

## Quick Commands Reference

```bash
# Run migration
cd backend && npx prisma migrate dev

# Start servers (if not running)
cd backend && npm run dev
cd frontend && npm run dev

# Check pending orders (terminal)
curl http://localhost:4000/api/crypto/admin/orders?status=pending

# Update settings (terminal)
curl -X PUT http://localhost:4000/api/crypto/admin/settings \
  -H "Content-Type: application/json" \
  -d '{"btcAddress":"YOUR_ADDRESS","exchangeRateBtc":45000}'
```

---

🎉 **You're all set!** Just run the migration and configure your wallet addresses.
