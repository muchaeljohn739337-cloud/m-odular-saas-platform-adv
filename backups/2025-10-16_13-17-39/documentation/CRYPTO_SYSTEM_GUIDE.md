# 🪙 Crypto Purchase & Withdrawal System

## Overview
Complete system for users to purchase real cryptocurrency using Stripe payments, with admin management of crypto transactions.

## 🔄 How It Works

### User Flow:
1. **Add USD Funds** → User pays via Stripe, USD is added to their account
2. **Purchase Crypto** → User converts USD to crypto (BTC, ETH, USDT)
3. **Admin Processes** → Admin sends real crypto to user's wallet
4. **Request Withdrawal** → User can request to withdraw crypto
5. **Admin Approves** → Admin reviews and approves/rejects withdrawal

### Admin Flow:
1. **Configure Wallet Addresses** → Set receiving addresses for each crypto
2. **Set Exchange Rates** → Update BTC, ETH, USDT prices
3. **Process Orders** → Send crypto to users and mark orders complete
4. **Review Withdrawals** → Approve/reject withdrawal requests

---

## 📊 Database Schema Added

### User Model (Updated)
```prisma
model User {
  usdBalance          Decimal @default(0)  // USD from Stripe payments
  role                String @default("user")  // "admin" or "user"
  cryptoOrders        CryptoOrder[]
  cryptoWithdrawals   CryptoWithdrawal[]
}
```

### AdminSettings
Stores admin wallet addresses and exchange rates:
- `btcAddress` - Bitcoin receiving address
- `ethAddress` - Ethereum receiving address  
- `usdtAddress` - USDT receiving address
- `exchangeRateBtc` - Current BTC/USD rate
- `exchangeRateEth` - Current ETH/USD rate
- `exchangeRateUsdt` - Current USDT/USD rate
- `processingFeePercent` - Fee charged (default 2.5%)
- `minPurchaseAmount` - Minimum purchase (default $10)

### CryptoOrder
Tracks user crypto purchases:
- `userId` - Who made the purchase
- `cryptoType` - BTC, ETH, USDT, etc.
- `usdAmount` - Amount paid in USD
- `cryptoAmount` - Amount of crypto to receive
- `exchangeRate` - Rate at time of purchase
- `processingFee` - Fee charged
- `totalUsd` - Total USD deducted
- `status` - pending, processing, completed, cancelled
- `adminAddress` - Where user should receive crypto
- `txHash` - Blockchain transaction hash (when admin sends)
- `userWalletAddress` - User's wallet for receiving

### CryptoWithdrawal
Tracks user withdrawal requests:
- `userId` - Who requested withdrawal
- `cryptoType` - BTC, ETH, USDT, etc.
- `cryptoAmount` - Amount to withdraw
- `usdEquivalent` - USD value at time of request
- `withdrawalAddress` - User's wallet address
- `status` - pending, approved, rejected, completed, cancelled
- `adminApprovedBy` - Admin ID who approved/rejected
- `adminNotes` - Reason for decision
- `txHash` - Blockchain transaction hash
- `networkFee` - Fee paid for transaction

---

## 🔌 API Endpoints

### Admin Endpoints

#### `GET /api/crypto/admin/settings`
Get current crypto settings
```json
{
  "btcAddress": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "ethAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "usdtAddress": "TJRabPrwbZy45FFMrCLZcRdWWF7E6mWvJ",
  "exchangeRateBtc": 45000.00,
  "exchangeRateEth": 2800.00,
  "exchangeRateUsdt": 1.00,
  "processingFeePercent": 2.50,
  "minPurchaseAmount": 10.00
}
```

#### `PUT /api/crypto/admin/settings`
Update crypto settings
```json
{
  "btcAddress": "your-btc-address",
  "ethAddress": "your-eth-address",
  "usdtAddress": "your-usdt-address",
  "exchangeRateBtc": 45000,
  "exchangeRateEth": 2800,
  "exchangeRateUsdt": 1.00,
  "processingFeePercent": 2.5,
  "minPurchaseAmount": 10
}
```

#### `GET /api/crypto/admin/orders?status=pending&limit=50`
Get all crypto orders (admin view)
- Query params: `status`, `cryptoType`, `limit`, `offset`
- Returns: Array of orders with user details

#### `PUT /api/crypto/admin/orders/:orderId`
Update crypto order status
```json
{
  "status": "completed",
  "txHash": "0x1234abcd...",
  "adminNotes": "Sent via Coinbase"
}
```
Status options: `pending`, `processing`, `completed`, `cancelled`

#### `GET /api/crypto/admin/withdrawals?status=pending`
Get all withdrawal requests
- Query params: `status`, `cryptoType`, `limit`, `offset`
- Returns: Array of withdrawals with user details

#### `PUT /api/crypto/admin/withdrawals/:withdrawalId`
Approve/reject withdrawal request
```json
{
  "status": "approved",
  "adminApprovedBy": "admin-user-id",
  "adminNotes": "Approved. Wallet verified.",
  "txHash": "0xabcd1234...",
  "networkFee": 0.0005
}
```
Status options: `pending`, `approved`, `rejected`, `completed`, `cancelled`

### User Endpoints

#### `POST /api/crypto/purchase`
Create crypto purchase order
```json
{
  "userId": "user-123",
  "cryptoType": "BTC",
  "usdAmount": 100,
  "userWalletAddress": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```
- Deducts USD from user balance immediately
- Creates pending order for admin to process
- Returns order details with crypto amount calculated

#### `POST /api/crypto/withdrawal`
Request crypto withdrawal
```json
{
  "userId": "user-123",
  "cryptoType": "BTC",
  "cryptoAmount": 0.005,
  "withdrawalAddress": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```
- Creates pending withdrawal request
- Admin must approve before processing

#### `GET /api/crypto/orders/:userId`
Get user's crypto purchase orders
- Returns: Array of user's orders sorted by date

#### `GET /api/crypto/withdrawals/:userId`
Get user's withdrawal requests
- Returns: Array of user's withdrawals sorted by date

#### `GET /api/crypto/rates`
Get current exchange rates
```json
{
  "BTC": 45000.00,
  "ETH": 2800.00,
  "USDT": 1.00,
  "processingFeePercent": 2.50,
  "minPurchaseAmount": 10.00
}
```

---

## 🚀 Setup Instructions

### 1. Run Database Migration
```bash
cd backend
npx prisma migrate dev --name add_crypto_system
```

This creates:
- `AdminSettings` table
- `CryptoOrder` table
- `CryptoWithdrawal` table
- Updates `User` table with `usdBalance` and `role`

### 2. Configure Admin Settings
As an admin, make a PUT request to `/api/crypto/admin/settings`:

```bash
curl -X PUT http://localhost:4000/api/crypto/admin/settings \
  -H "Content-Type: application/json" \
  -d '{
    "btcAddress": "YOUR_BTC_ADDRESS",
    "ethAddress": "YOUR_ETH_ADDRESS",
    "usdtAddress": "YOUR_USDT_ADDRESS",
    "exchangeRateBtc": 45000,
    "exchangeRateEth": 2800,
    "exchangeRateUsdt": 1.00,
    "processingFeePercent": 2.5,
    "minPurchaseAmount": 10
  }'
```

### 3. Update Exchange Rates Regularly
Exchange rates should be updated frequently (hourly/daily). You can:
- Manually update via API
- Use a cron job to fetch rates from CoinGecko/CoinMarketCap
- Implement auto-update in admin panel

---

## 💡 Example User Journey

### Step 1: User Adds Funds via Stripe
```
User clicks "Add Funds" → Pays $100 via Stripe
✅ User's usdBalance = $100
```

### Step 2: User Purchases BTC
```
POST /api/crypto/purchase
{
  "userId": "user-123",
  "cryptoType": "BTC",
  "usdAmount": 100,
  "userWalletAddress": "1A1z..."
}

Calculation:
- USD Amount: $100
- Processing Fee (2.5%): $2.50
- Total Charged: $102.50
- BTC Rate: $45,000/BTC
- BTC Amount: 0.00222222 BTC

✅ User's usdBalance = $0 (if only had $102.50)
✅ CryptoOrder created with status "pending"
```

### Step 3: Admin Processes Order
1. Admin views pending orders
2. Sends 0.00222222 BTC to user's wallet
3. Gets transaction hash from blockchain
4. Updates order:
```json
PUT /api/crypto/admin/orders/order-456
{
  "status": "completed",
  "txHash": "0xabc123...",
  "adminNotes": "Sent via Coinbase"
}
```
✅ Order marked complete
✅ User receives BTC in their wallet

### Step 4: User Requests Withdrawal (Later)
```
User has 0.005 BTC they want to withdraw

POST /api/crypto/withdrawal
{
  "userId": "user-123",
  "cryptoType": "BTC",
  "cryptoAmount": 0.005,
  "withdrawalAddress": "1B2c..."
}

✅ Withdrawal request created with status "pending"
```

### Step 5: Admin Reviews & Approves
```
Admin checks:
- User's wallet address is valid
- Amount is reasonable
- No suspicious activity

PUT /api/crypto/admin/withdrawals/withdrawal-789
{
  "status": "approved",
  "adminApprovedBy": "admin-001",
  "adminNotes": "Wallet verified, approved"
}

Admin sends crypto, then:
{
  "status": "completed",
  "txHash": "0xdef456...",
  "networkFee": 0.0001
}

✅ Withdrawal completed
✅ User receives crypto
```

---

## 🛡️ Security Features

1. **Two-Step Process**: Orders are created but admin must manually send crypto
2. **Withdrawal Approval**: Admin must approve all withdrawals
3. **Balance Checks**: System verifies sufficient USD balance before creating orders
4. **Transaction Records**: All transactions logged in database
5. **Status Tracking**: Clear status for every order/withdrawal
6. **Admin Notes**: Ability to document decisions

---

## 📝 Admin Daily Workflow

### Morning:
1. Check pending crypto orders
2. Send crypto to user wallets
3. Update orders with transaction hashes

### Throughout Day:
4. Monitor new orders coming in
5. Review withdrawal requests
6. Approve/reject based on criteria

### Evening:
7. Update exchange rates
8. Review completed transactions
9. Check for any issues

---

## 🎨 Frontend Components (To Build)

### User Dashboard:
- [ ] USD Balance Display
- [ ] "Purchase Crypto" Button
- [ ] Crypto Purchase Form (amount, type, wallet address)
- [ ] Order History Table
- [ ] Withdrawal Request Form
- [ ] Withdrawal Status Table

### Admin Panel:
- [ ] Admin Settings Form (wallet addresses, rates)
- [ ] Pending Orders Table
- [ ] Order Action Buttons (Complete, Cancel)
- [ ] Pending Withdrawals Table
- [ ] Withdrawal Action Buttons (Approve, Reject)
- [ ] Transaction Hash Input Field

---

## ⚠️ Important Notes

1. **Exchange Rates**: Must be updated regularly or prices will be wrong
2. **Wallet Addresses**: Double-check all addresses before sending
3. **Transaction Fees**: Network fees vary by blockchain
4. **Minimum Amounts**: Set reasonable minimums to avoid tiny orders
5. **KYC/AML**: Consider compliance requirements for your jurisdiction
6. **Tax Reporting**: Keep records for tax purposes
7. **Customer Support**: Have process for handling issues

---

## 🔜 Future Enhancements

- [ ] Auto-update exchange rates from CoinGecko API
- [ ] Support for more cryptocurrencies (LTC, DOGE, etc.)
- [ ] Automatic crypto sending via exchange APIs
- [ ] Email notifications for order status changes
- [ ] SMS notifications for withdrawals
- [ ] Two-factor authentication for withdrawals
- [ ] Daily withdrawal limits
- [ ] KYC verification integration
- [ ] Transaction fee estimation
- [ ] Price charts and analytics

---

## 📞 Support

If you need help:
1. Check order/withdrawal status in admin panel
2. Verify blockchain transaction on explorer (blockchain.com, etherscan.io)
3. Contact support with transaction hash

---

**System Status**: ✅ Ready to deploy after database migration

**Next Step**: Run `npx prisma migrate dev` in backend directory
