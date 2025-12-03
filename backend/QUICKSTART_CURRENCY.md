# 🚀 Quick Start: Multi-Currency Crypto Purchase System

## ⚡ 3-Minute Setup

### Step 1: Generate Prisma Client

```powershell
npx prisma generate
```

### Step 2: Run Database Migration

```powershell
sqlite3 prisma/dev.db < prisma/migrations/20251203_add_multi_currency_support.sql
```

### Step 3: Start Server

```powershell
npm run dev
```

### Step 4: Test It

```powershell
# Test currency detection
curl http://localhost:3000/api/currency/detect

# Test supported currencies
curl http://localhost:3000/api/currency/supported
```

## 🎯 Test a Crypto Purchase

```bash
# Login first and get your token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "password"}'

# Initiate crypto purchase
curl -X POST http://localhost:3000/api/currency/crypto/purchase \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cryptoType": "BTC",
    "amount": 0.1,
    "currency": "USD"
  }'
```

## 📋 Key Features

✅ **4 Currencies**: USD, CAD, EUR, GBP  
✅ **Auto-Detection**: IP-based currency detection  
✅ **Compliance**: FinCEN (USA) + FINTRAC (Canada)  
✅ **Anti-Structuring**: Detects illegal transaction splitting  
✅ **Wire Transfer**: Bank-compliant payment method  
✅ **Admin Approval**: High-value purchase oversight  
✅ **Audit Trail**: Complete regulatory logging

## 🔒 Compliance Thresholds

| Currency | Threshold | Regulatory Body  |
| -------- | --------- | ---------------- |
| USD      | $10,000   | FinCEN (USA)     |
| CAD      | C$10,000  | FINTRAC (Canada) |
| EUR      | €10,000   | EU AML           |
| GBP      | £8,000    | FCA (UK)         |

## 🚨 Transaction Flow

**Low Value (<$10k)**

```
Request → Auto-Approved → Wire Instructions → Crypto Delivered
```

**High Value (≥$10k)**

```
Request → KYC Required → Admin Review → Wire Transfer → Approval → Crypto Delivered
```

**Suspicious Pattern**

```
Request → BLOCKED → Admin Investigation Required
```

## 📚 Documentation

- **MULTI_CURRENCY_SETUP.md** - Complete setup guide
- **IMPLEMENTATION_SUMMARY.md** - Technical overview
- **scripts/test-currency-system.ts** - Test suite

## 🛠️ Admin Tasks

### Verify Wire Transfer

```bash
curl -X POST http://localhost:3000/api/currency/admin/verify-wire/PURCHASE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"verified": true, "notes": "Wire received"}'
```

### Approve High-Value Purchase

```bash
curl -X POST http://localhost:3000/api/currency/admin/approve-purchase/PURCHASE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"approved": true, "notes": "KYC verified"}'
```

## 🎉 You're Ready!

The system is fully implemented and ready for testing. All compliance checks, admin workflows, and audit trails are
operational.

**Questions?** Check MULTI_CURRENCY_SETUP.md for detailed API documentation.

---

🛡️ **Bank-compliant crypto purchases made simple.**
