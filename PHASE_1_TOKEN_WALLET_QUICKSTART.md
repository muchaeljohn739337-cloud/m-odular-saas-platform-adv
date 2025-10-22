# 🚀 PHASE 1: TOKEN WALLET - QUICK START

**Goal:** Build complete token wallet system (8 hours)  
**Status:** Ready to start now  
**Live:** Each part deploys automatically

---

## 📋 TASK BREAKDOWN

### Task 1.1: Backend API Routes (2 hours)

**Create file:** `backend/src/routes/tokens.ts`

**What to implement:**

```typescript
// 1. GET /api/tokens/config - Get token configuration
// Returns: { symbol, price, decimals }

// 2. POST /api/tokens/buy - Buy tokens
// Request: { amount, paymentMethod }
// Returns: { success, tokensReceived, balance }

// 3. POST /api/tokens/sell - Sell tokens
// Request: { amount }
// Returns: { success, usdReceived, balance }

// 4. GET /api/tokens/balance - Get user balance
// Returns: { totalTokens, usdValue, transactions_count }

// 5. GET /api/tokens/history - Get transaction history
// Returns: [ { id, type, amount, price, date } ]

// 6. GET /api/tokens/prices - Get price history
// Returns: { current, history: [ { timestamp, price } ] }
```

**Key features:**
- Authenticate all endpoints (JWT)
- Validate input amounts
- Update database transactions
- Emit Socket.IO updates for real-time sync
- Error handling with proper HTTP status codes

---

### Task 1.2: Frontend UI Components (2 hours)

**Create directory:** `frontend/src/app/wallet/`

**Components needed:**

```
1. WalletDashboard.tsx
   - Display current balance
   - Show token price
   - Action buttons (Buy/Sell)

2. BuyTokenForm.tsx
   - Input amount to buy
   - Calculate cost in USD
   - Submit button
   - Success/error feedback

3. SellTokenForm.tsx
   - Input amount to sell
   - Show USD equivalent
   - Submit button
   - Confirmation dialog

4. TransactionHistory.tsx
   - List all transactions
   - Filter by type (buy/sell)
   - Sort by date
   - Pagination

5. PriceChart.tsx (optional)
   - Display price history
   - Chart library (recharts or chart.js)
   - 24h/7d/30d views
```

---

### Task 1.3: Database Integration (1 hour)

**Already have in schema.prisma:**
- TokenWallet model
- TokenTransaction model

**What to do:**
1. Verify models exist
2. Run migrations if needed: `npx prisma migrate dev`
3. Create test data for development

---

### Task 1.4: Socket.IO Real-Time (1 hour)

**Implement:**
```typescript
// Emit on token buy/sell
io.to(`user-${userId}`).emit('token-updated', {
  balance: newBalance,
  lastTransaction: transaction
});

// User subscribes in frontend
useEffect(() => {
  socket.on('token-updated', (data) => {
    setBalance(data.balance);
  });
}, []);
```

---

### Task 1.5: Testing & Deployment (2 hours)

**Test locally:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Test API endpoints with Postman/curl
4. Test UI in browser
5. Check Socket.IO real-time updates

**Deploy:**
1. Commit to GitHub
2. Push to main
3. GitHub Actions automatically:
   - Builds
   - Tests
   - Deploys
4. Verify live at advanciapayledger.com

---

## 🔧 HOW TO BUILD IT

### Step 1: Check existing code (10 min)

```bash
# Check if tokens route exists
ls backend/src/routes/

# Look at schema
cat backend/prisma/schema.prisma | grep -A 20 "model TokenWallet"

# Check what's imported in index.ts
cat backend/src/index.ts | grep -i token
```

### Step 2: Build backend routes (1.5 hours)

I'll provide you with:
1. Complete tokens.ts file with all endpoints
2. Database queries needed
3. Error handling
4. Socket.IO integration

You:
1. Create the file
2. Copy the code
3. Test with curl
4. Fix any issues

### Step 3: Build frontend UI (1.5 hours)

I'll provide you with:
1. React components
2. API integration hooks
3. Styling (Tailwind)
4. Form validation

You:
1. Create components
2. Copy the code
3. Test in browser
4. Fix any layout issues

### Step 4: Connect and test (2 hours)

1. Start both servers
2. Test flows end-to-end
3. Check real-time updates
4. Fix any bugs
5. Commit and deploy

### Step 5: Verify live (1 hour)

1. Visit advanciapayledger.com
2. Navigate to wallet
3. Test buy/sell
4. Verify transaction history
5. Celebrate! 🎉

---

## 📊 ESTIMATED TIMELINE

```
Task 1.1 (Backend routes)      - 2 hours
Task 1.2 (Frontend UI)         - 2 hours
Task 1.3 (Database)            - 1 hour
Task 1.4 (Socket.IO)           - 1 hour
Task 1.5 (Testing)             - 2 hours
────────────────────────────────────────
TOTAL:                           8 hours
```

**When done:**
- ✅ Token wallet fully functional
- ✅ Live on production
- ✅ Real-time updates working
- ✅ Ready for users

---

## ✅ SUCCESS CRITERIA

When complete, users should be able to:
1. ✅ View current token balance
2. ✅ See current token price
3. ✅ Click "Buy" button
4. ✅ Enter amount and submit
5. ✅ See balance updated in real-time
6. ✅ View transaction in history
7. ✅ Repeat for Sell
8. ✅ See all transactions listed
9. ✅ Works on mobile too

---

## 🎯 NEXT DECISION

**Ready to start?**

### Option A: I'll provide the code
- You copy it
- You make it work
- You test it
- You deploy it

### Option B: We build together
- I explain concepts
- You write the code
- I review it
- You test it

### Option C: I'll handle it
- I write all the code
- You review it
- I help debug
- You test it

**Which would you prefer?** 

My recommendation: **Option A** - fastest path to complete feature

---

**Let's go!** 🚀

Which option? A, B, or C?
