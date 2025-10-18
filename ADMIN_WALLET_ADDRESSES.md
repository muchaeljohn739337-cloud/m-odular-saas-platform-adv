# 💼 Admin Wallet Addresses Configuration

**Last Updated:** October 18, 2025  
**Status:** Ready to Configure

---

## 🪙 Your Wallet Addresses

### ✅ Bitcoin (BTC) - **SUPPORTED**
```
bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k
```
- Network: Bitcoin Mainnet
- Type: Native SegWit (Bech32)
- Status: ✅ Configured in system

### ✅ Ethereum (ETH) - **SUPPORTED**
```
0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8
```
- Network: Ethereum Mainnet
- Type: ERC-20 Compatible
- Status: ✅ Configured in system

### ✅ Tether (USDT) - **SUPPORTED**
```
0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8
```
- Network: Ethereum (ERC-20)
- Same as ETH address (USDT uses ERC-20 standard)
- Status: ✅ Configured in system

### ⏳ Ripple (XRP) - **NOT YET SUPPORTED**
```
rs2birCXZiaBzQFaq4rx34yhSz7qaHAH8u
```
- Network: XRP Ledger
- Status: ❌ Requires schema update

### ⏳ Stellar (XLM) - **NOT YET SUPPORTED**
```
GADCJCRK3ACDGSDPJAOSAUEJPA56O2LTTDBZQKQRKERQUTA7RS5XGVSL
```
- Network: Stellar Network
- Status: ❌ Requires schema update

---

## 🚀 Quick Setup (3 Methods)

### **Method 1: PowerShell Script (Recommended)**
```powershell
# Run the automated setup script
.\Setup-Admin-Wallets.ps1
```
This script will:
- Prompt for admin credentials
- Login to your backend
- Configure all wallet addresses
- Verify the configuration
- Create a reference document

### **Method 2: Direct API Call**
```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'

# 2. Use the token to update settings
curl -X PUT http://localhost:5000/api/crypto/admin/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "btcAddress": "bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k",
    "ethAddress": "0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8",
    "usdtAddress": "0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8",
    "processingFeePercent": 2.5,
    "minPurchaseAmount": 10
  }'
```

### **Method 3: Admin Dashboard UI**
```
1. Navigate to: http://localhost:3000/admin/crypto
2. Click "Settings" tab
3. Enter wallet addresses:
   - BTC: bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k
   - ETH: 0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8
   - USDT: 0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8
4. Set fees and minimums
5. Click "Save Settings"
```

---

## 📊 How It Works

### **User Purchase Flow:**
```
1. User goes to /crypto/buy
2. Selects BTC, enters $100
3. System shows: "Send to: bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k"
4. User's USD balance is deducted ($102.50 with fee)
5. Order status: PENDING
6. Admin verifies BTC received in wallet
7. Admin approves order in dashboard
8. User's BTC balance credited
9. Order status: COMPLETED
```

### **User Withdrawal Flow:**
```
1. User goes to /crypto/withdraw
2. Selects ETH, enters 0.5 ETH
3. Enters destination: 0xABC123...
4. User's ETH locked (0.5075 with 1.5% fee)
5. Withdrawal status: PENDING
6. Admin sends 0.5 ETH from 0x2b80613e35... to 0xABC123...
7. Admin enters TX hash in dashboard
8. Admin approves withdrawal
9. User's locked ETH removed
10. Withdrawal status: COMPLETED
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Store private keys in hardware wallet (Ledger, Trezor)
- Use multi-signature wallets for high-value operations
- Verify addresses on multiple devices before sharing
- Keep backup of seed phrases in secure location
- Monitor wallet activity regularly
- Use separate wallets for different purposes

### ❌ DON'T:
- Never commit private keys to Git
- Never share private keys with anyone
- Never store private keys in plain text
- Never use exchange wallet addresses for receiving
- Never mix personal and business funds
- Never skip address verification

---

## 🧪 Testing Checklist

### Before Going Live:
- [ ] **Verify BTC Address**: Send small test amount (0.001 BTC)
- [ ] **Verify ETH Address**: Send small test amount (0.01 ETH)
- [ ] **Verify USDT Address**: Send small test amount (10 USDT)
- [ ] **Test Purchase Flow**: Create test order, verify address shown
- [ ] **Test Admin Approval**: Approve test order, verify balance updated
- [ ] **Test Withdrawal**: Request withdrawal, verify crypto sent
- [ ] **Check Notifications**: Verify emails/SMS sent at each step
- [ ] **Security Audit**: Review all address configurations

### Test Transactions:
```bash
# BTC Test (Testnet recommended first)
# Send 0.001 BTC to: bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k

# ETH Test (Goerli/Sepolia testnet recommended first)
# Send 0.01 ETH to: 0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8

# USDT Test (Ethereum Mainnet or Testnet)
# Send 10 USDT to: 0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8
```

---

## 📈 Adding XRP/XLM Support (Future)

If you want to add XRP and XLM to your platform:

### 1. Update Prisma Schema:
```prisma
model AdminSettings {
  // ... existing fields
  xrpAddress  String?  // Ripple receiving address
  xlmAddress  String?  // Stellar receiving address
}
```

### 2. Run Migration:
```bash
cd backend
npx prisma migrate dev --name add_xrp_xlm_support
npx prisma generate
```

### 3. Update Components:
```typescript
// Add to crypto selection dropdowns
const cryptoTypes = ["BTC", "ETH", "USDT", "LTC", "XRP", "XLM"];

// Add to LiveCryptoPrice component
// Add to CryptoPurchaseForm component
// Add to CryptoWithdrawForm component
```

### 4. Update Backend:
```typescript
// backend/src/routes/crypto.ts
// Add XRP/XLM price fetching
// Add XRP/XLM validation
// Add XRP/XLM to order processing
```

### 5. Update TokenWallet:
```prisma
model TokenWallet {
  // ... existing fields
  xrpBalance  Decimal @default(0)
  xlmBalance  Decimal @default(0)
}
```

---

## 📞 Support & Resources

### Wallet Explorers:
- **BTC**: https://blockchair.com/bitcoin/address/bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k
- **ETH**: https://etherscan.io/address/0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8
- **XRP**: https://xrpscan.com/account/rs2birCXZiaBzQFaq4rx34yhSz7qaHAH8u
- **XLM**: https://stellar.expert/explorer/public/account/GADCJCRK3ACDGSDPJAOSAUEJPA56O2LTTDBZQKQRKERQUTA7RS5XGVSL

### Validation Tools:
- **BTC**: https://www.blockchain.com/explorer/addresses/btc/
- **ETH**: https://etherscan.io/
- **Address Validator**: https://www.bitcoinaddressvalidator.com/

### Exchange Integration:
If you need to convert received crypto to fiat:
- Binance API for automated conversions
- Coinbase Commerce for payment processing
- Kraken API for bulk conversions

---

## ✅ Status Summary

| Crypto | Address | Status | Network | Ready |
|--------|---------|--------|---------|-------|
| BTC | `bc1q00n...283k` | ✅ Configured | Bitcoin Mainnet | YES |
| ETH | `0x2b80...d1A8` | ✅ Configured | Ethereum Mainnet | YES |
| USDT | `0x2b80...d1A8` | ✅ Configured | ERC-20 | YES |
| LTC | - | ⚠️ Not provided | Litecoin | NO |
| XRP | `rs2bi...aH8u` | ❌ Not supported | XRP Ledger | NO |
| XLM | `GADCJ...GVSL` | ❌ Not supported | Stellar | NO |

---

**Next Steps:**
1. Run `.\Setup-Admin-Wallets.ps1` to configure addresses
2. Test with small amounts first
3. Monitor wallets regularly
4. Consider adding LTC address for full support
5. Plan XRP/XLM integration if needed

**Questions?**
- Check the [ADMIN_CRYPTO_COMPLETE.md](./ADMIN_CRYPTO_COMPLETE.md) documentation
- Review the [CRYPTO_QUICK_START.md](./CRYPTO_QUICK_START.md) guide
- Test in a sandbox environment first
