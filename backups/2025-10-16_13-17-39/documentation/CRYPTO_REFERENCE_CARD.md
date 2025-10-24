# 🎯 CRYPTO SYSTEM - QUICK REFERENCE CARD

## Setup Commands (Run Once)

```powershell
# 1. Database migration
cd backend
npx prisma migrate dev --name add_crypto_system

# 2. Auto-configure (interactive wizard)
.\Setup-CryptoSystem.ps1

# OR manual configuration
$config = @{
    btcAddress = "YOUR_BTC_WALLET"
    ethAddress = "YOUR_ETH_WALLET"
    exchangeRateBtc = 45000
    exchangeRateEth = 2800
    exchangeRateUsdt = 1.00
    processingFeePercent = 2.5
    minPurchaseAmount = 10
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:4000/api/crypto/admin/settings" `
    -Method PUT -Headers @{"Content-Type"="application/json"} -Body $config
```

## Daily Commands

```powershell
# Check pending orders
Invoke-RestMethod "http://localhost:4000/api/crypto/admin/orders?status=pending"

# Get exchange rates
Invoke-RestMethod "http://localhost:4000/api/crypto/rates"

# Check pending withdrawals
Invoke-RestMethod "http://localhost:4000/api/crypto/admin/withdrawals?status=pending"

# Update exchange rates (run this daily!)
$rates = @{
    exchangeRateBtc = 46000  # Update with current price
    exchangeRateEth = 2850   # Update with current price
    exchangeRateUsdt = 1.00
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:4000/api/crypto/admin/settings" `
    -Method PUT -Headers @{"Content-Type"="application/json"} -Body $rates
```

## API Quick Reference

### Admin APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/crypto/admin/settings` | GET | Get wallet addresses & rates |
| `/api/crypto/admin/settings` | PUT | Update settings |
| `/api/crypto/admin/orders` | GET | Get all orders |
| `/api/crypto/admin/orders/:id` | PUT | Complete order |
| `/api/crypto/admin/withdrawals` | GET | Get withdrawal requests |
| `/api/crypto/admin/withdrawals/:id` | PUT | Approve/reject |

### User APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/crypto/purchase` | POST | Buy crypto |
| `/api/crypto/withdrawal` | POST | Request withdrawal |
| `/api/crypto/orders/:userId` | GET | Get user orders |
| `/api/crypto/withdrawals/:userId` | GET | Get user withdrawals |
| `/api/crypto/rates` | GET | Get current rates |

## Example Requests

### User Purchases BTC
```powershell
$order = @{
    userId = "user-uuid-here"
    cryptoType = "BTC"
    usdAmount = 50
    userWalletAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:4000/api/crypto/purchase" `
    -Method POST -Headers @{"Content-Type"="application/json"} -Body $order
```

### Admin Completes Order
```powershell
$complete = @{
    status = "completed"
    txHash = "0xabc123def456..."
    adminNotes = "Sent via Coinbase"
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:4000/api/crypto/admin/orders/ORDER-UUID" `
    -Method PUT -Headers @{"Content-Type"="application/json"} -Body $complete
```

### User Requests Withdrawal
```powershell
$withdrawal = @{
    userId = "user-uuid-here"
    cryptoType = "BTC"
    cryptoAmount = 0.005
    withdrawalAddress = "1B2c3D4e5F6g7H8i9J0k..."
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:4000/api/crypto/withdrawal" `
    -Method POST -Headers @{"Content-Type"="application/json"} -Body $withdrawal
```

### Admin Approves Withdrawal
```powershell
$approve = @{
    status = "approved"
    adminApprovedBy = "admin-uuid-here"
    adminNotes = "Verified and approved"
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:4000/api/crypto/admin/withdrawals/WITHDRAWAL-UUID" `
    -Method PUT -Headers @{"Content-Type"="application/json"} -Body $approve
```

## Order Status Flow

```
pending → processing → completed
         ↘ cancelled
```

## Withdrawal Status Flow

```
pending → approved → completed
        ↘ rejected
```

## Calculations

### Purchase Calculation
```
User pays: $100
Processing fee (2.5%): $2.50
Total charged: $102.50
BTC rate: $45,000/BTC
BTC received: 0.00222222 BTC
```

### Fee Calculation
```
Fee = (USD Amount × Fee Percentage) / 100
Total = USD Amount + Fee
Crypto Amount = USD Amount / Exchange Rate
```

## Supported Cryptocurrencies

| Crypto | Database Field | Example Address |
|--------|----------------|-----------------|
| Bitcoin (BTC) | `exchangeRateBtc` | 1A1zP1eP... |
| Ethereum (ETH) | `exchangeRateEth` | 0x742d35... |
| USDT | `exchangeRateUsdt` | TJRabPr... |

## Admin Panel URLs

- Settings: `http://localhost:3000/admin/crypto` (Settings tab)
- Orders: `http://localhost:3000/admin/crypto` (Orders tab)
- Withdrawals: `http://localhost:3000/admin/crypto` (Withdrawals tab)

## Test Addresses (DO NOT USE IN PRODUCTION)

```
Bitcoin: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa (Satoshi's genesis address)
Ethereum: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (Ethereum Foundation)
```

## Verification Commands

```powershell
# Check Bitcoin transaction
# Go to: blockchain.com/btc/tx/YOUR_TX_HASH

# Check Ethereum transaction  
# Go to: etherscan.io/tx/YOUR_TX_HASH

# Check USDT transaction (ERC-20)
# Go to: etherscan.io/tx/YOUR_TX_HASH

# Check database directly
cd backend
npx prisma studio
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Exchange rate not set | Run setup wizard or update via API |
| Order stuck at pending | Admin needs to send crypto |
| Insufficient balance | User needs to add funds via Stripe |
| Invalid wallet address | Verify format for crypto type |
| Database error | Check migration ran successfully |

## Important Notes

⚠️ **Update exchange rates daily** - Crypto prices change constantly
⚠️ **Verify wallet addresses** - Typo = lost crypto (irreversible!)
⚠️ **Test with small amounts** - Before processing large orders
⚠️ **Keep transaction hashes** - For customer support
⚠️ **Backup your database** - Contains all order history

## Security Checklist

- [ ] Admin authentication enabled
- [ ] Wallet addresses verified
- [ ] Exchange rates updated today
- [ ] Minimum purchase set appropriately
- [ ] Processing fee configured
- [ ] Test order completed successfully
- [ ] Backup strategy in place

## File Locations

```
Backend:
- prisma/schema.prisma (database models)
- src/routes/crypto.ts (API endpoints)
- src/routes/payments.ts (Stripe integration)

Frontend:
- src/components/CryptoAdminPanel.tsx (admin UI)

Documentation:
- CRYPTO_QUICK_START.md (setup guide)
- CRYPTO_SYSTEM_GUIDE.md (full docs)
- CRYPTO_VISUAL_FLOW.md (diagrams)
- CRYPTO_SETUP_SUMMARY.md (summary)
- CRYPTO_REFERENCE_CARD.md (this file)
```

## Need Help?

1. Check documentation files
2. Test API endpoints with commands above
3. Review admin panel for pending orders
4. Check backend terminal for error logs

## Quick Links

- CoinGecko API: https://www.coingecko.com/en/api
- Blockchain Explorer (BTC): https://blockchain.com
- Etherscan (ETH): https://etherscan.io
- Admin Panel: http://localhost:3000/admin/crypto

---

**Last Updated**: October 2025
**Version**: 1.0
**Status**: Production Ready
