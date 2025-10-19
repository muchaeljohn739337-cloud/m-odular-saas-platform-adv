# 🧪 END-TO-END TEST PLAN
**Platform**: Advancia Pay Ledger - Modular SaaS Platform  
**Test Date**: October 18, 2025  
**Tester**: _________________  
**Status**: Ready for Testing ✅

---

## 🚀 **SERVER STATUS**

### Backend Server
- **URL**: http://localhost:4000
- **Status**: ✅ Running
- **API Health Check**: http://localhost:4000/api/health

### Frontend Server
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Login Page**: http://localhost:3000/auth/signin

---

## 📝 **TEST CREDENTIALS**

### Test User Account
```
Email: testuser@example.com
Password: password123
OTP Code: (Will be generated during login)
```

### Admin Account (for approvals)
```
Email: admin@example.com
Password: admin123
OTP Code: (Will be generated during login)
```

---

## 🎯 **TEST SCENARIOS**

### ✅ **TEST #1: User Dashboard Display**
**Objective**: Verify the new dashboard loads and displays all sections correctly

**Steps**:
1. Navigate to http://localhost:3000
2. Login with test credentials
3. Navigate to `/dashboard`
4. Verify the following sections are visible:
   - [ ] **Welcome Banner** with time-based greeting (Good morning/afternoon/evening)
   - [ ] **Pending Alerts** section (may be empty if no pending items)
   - [ ] **Balance Overview** with 5 cards:
     - [ ] USD Balance
     - [ ] BTC Balance
     - [ ] ETH Balance
     - [ ] USDT Balance
     - [ ] LTC Balance
   - [ ] **Total Portfolio Value** card (large card with gradient)
   - [ ] **Quick Actions** grid with 6 buttons:
     - [ ] Buy Crypto
     - [ ] Withdraw Crypto
     - [ ] Transfer Funds
     - [ ] Deposit Money
     - [ ] View Orders
     - [ ] View Transactions
   - [ ] **Recent Transactions** list (last 10)
   - [ ] **Help Section** with Contact Support and FAQ links

**Expected Results**:
- All sections render without errors
- Balances display correctly (may be $0.00 for new account)
- Live crypto prices display and update
- All buttons are clickable and navigate correctly
- Transaction list shows "No transactions yet" if empty

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #2: Live Crypto Price Updates**
**Objective**: Verify live cryptocurrency prices display and update in real-time

**Steps**:
1. On the dashboard, locate the **Balance Overview** section
2. Observe the crypto price display under each crypto balance
3. Wait 30-60 seconds
4. Verify prices update automatically

**Expected Results**:
- [ ] Each crypto shows current USD value (e.g., "BTC: $67,234.56")
- [ ] Prices update every 30 seconds
- [ ] Green up arrow (▲) for price increases
- [ ] Red down arrow (▼) for price decreases
- [ ] No loading spinners stuck permanently

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #3: Crypto Purchase Flow (Full End-to-End)**
**Objective**: Test the complete crypto purchase process from order to balance update

**Steps**:
1. Click **"Buy Crypto"** from Quick Actions or navigate to `/crypto/buy`
2. Select **BTC** from the dropdown
3. Enter amount: **$100**
4. Verify the following displays:
   - [ ] Live BTC price
   - [ ] Amount of BTC you'll receive (e.g., 0.001489 BTC)
   - [ ] Purchase fee (0.5%): $0.50
   - [ ] Total cost: $100.50
5. Review the admin wallet address displayed
6. Click **"Submit Purchase Order"**
7. Verify success message with Order ID
8. Navigate to `/crypto/orders`
9. Verify your order appears with:
   - [ ] Status: PENDING (yellow badge)
   - [ ] Correct amount
   - [ ] Timestamp
   - [ ] Order ID
10. **Admin Approval**: Login as admin
11. Navigate to admin orders page
12. Find the order and click **"Approve"**
13. Enter a fake transaction hash (e.g., `0x1234abcd...`)
14. Submit approval
15. Logout admin, login back as test user
16. Navigate to dashboard
17. Verify **BTC balance increased** by the purchased amount
18. Go to `/crypto/orders`
19. Verify order status changed to **COMPLETED** (green badge)

**Expected Results**:
- Order submits successfully
- Order appears in list immediately
- Admin can approve order
- User balance updates after approval
- Order status changes to COMPLETED
- Transaction appears in Recent Transactions on dashboard

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #4: Crypto Withdrawal Flow with Validation**
**Objective**: Test crypto withdrawal with wallet address validation

**Steps**:
1. First, ensure you have crypto balance (complete TEST #3 first)
2. Navigate to `/crypto/withdraw`
3. Select **BTC** from dropdown
4. Verify your current BTC balance displays
5. Enter withdrawal amount: **0.0005 BTC**
6. **Test Invalid Address**:
   - Enter invalid address: `invalidaddress123`
   - Verify **red error** appears: "Invalid Bitcoin address format"
   - Verify submit button is **disabled**
7. **Test Valid Address**:
   - Enter valid BTC address: `bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k`
   - Verify **no error** appears
   - Verify submit button is **enabled**
8. Verify fee calculation:
   - [ ] Withdrawal fee (1.5%): calculated correctly
   - [ ] Total amount to receive: amount minus fee
9. Click **"Submit Withdrawal Request"**
10. Verify success message with Withdrawal ID
11. Navigate to `/crypto/withdrawals`
12. Verify withdrawal appears with:
    - [ ] Status: PENDING
    - [ ] Correct amount
    - [ ] Your wallet address
    - [ ] Timestamp
13. **Check Balance Lock**: Go to dashboard
14. Verify BTC balance **decreased** by withdrawal amount (crypto is locked)
15. **Admin Approval**: Login as admin
16. Navigate to admin withdrawals page
17. Find the withdrawal and approve it
18. Enter fake TX hash
19. Submit approval
20. Logout admin, login as test user
21. Go to `/crypto/withdrawals`
22. Verify status changed to **COMPLETED**

**Expected Results**:
- Invalid addresses show red error
- Valid addresses pass validation
- Submit button disabled for invalid addresses
- Fee calculation is correct
- Withdrawal submits successfully
- Balance locks immediately
- Admin can approve withdrawal
- Status updates to COMPLETED

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #5: Wallet Address Validation (All Crypto Types)**
**Objective**: Verify wallet validation works for all supported cryptocurrencies

**Test Matrix**:

| Crypto | Valid Address Example | Invalid Address | Error Shows? | Submit Blocked? |
|--------|----------------------|-----------------|--------------|-----------------|
| **BTC** | `bc1q00nxy6hha3az922a6hjckxue7geax4jw3n283k` | `invalid123` | [ ] Yes | [ ] Yes |
| **BTC** | `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` | `0x742d35Cc...` | [ ] Yes | [ ] Yes |
| **ETH** | `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb` | `bc1q00nxy...` | [ ] Yes | [ ] Yes |
| **USDT** | `0x2b80613e3569d0ba85BFc9375B20096D72Bad1A8` | `noethaddress` | [ ] Yes | [ ] Yes |
| **LTC** | `LTC1q00nxy6hha3az922a6hjckxue7geax4j...` | `123456` | [ ] Yes | [ ] Yes |

**Steps for Each Row**:
1. Go to `/crypto/withdraw`
2. Select the crypto type
3. Enter the valid address → Verify **no error**
4. Clear and enter invalid address → Verify **red error shows**
5. Verify submit button is **disabled** with invalid address

**Expected Results**:
- Each crypto type validates its specific format
- Error messages are crypto-specific
- Submit button always disabled for invalid addresses
- Valid addresses of one crypto show error for another crypto

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #6: Recent Transactions Display**
**Objective**: Verify recent transactions show correctly on dashboard

**Steps**:
1. Complete TEST #3 (crypto purchase) and TEST #4 (crypto withdrawal)
2. Navigate to `/dashboard`
3. Scroll to **Recent Transactions** section
4. Verify the following:
   - [ ] Shows last 10 transactions
   - [ ] Each transaction has:
     - [ ] Icon (💳 deposit, 📤 withdrawal, 💸 transfer, 🛒 purchase, 🎁 reward)
     - [ ] Description (e.g., "Crypto Purchase - BTC")
     - [ ] Amount with + or - sign
     - [ ] Status badge (COMPLETED green, PENDING yellow, FAILED red)
     - [ ] Time (e.g., "Just now", "5m ago", "3h ago", "2d ago")
   - [ ] Click **"View All"** → Navigates to `/transactions`
5. If no transactions exist:
   - [ ] Shows "No transactions yet" message
   - [ ] Shows **"Buy Crypto Now"** button
   - [ ] Button navigates to `/crypto/buy`

**Expected Results**:
- Transactions display in reverse chronological order (newest first)
- Time formatting is accurate and updates
- Icons match transaction types
- Status badges use correct colors
- Empty state shows helpful message

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #7: Quick Actions Navigation**
**Objective**: Verify all quick action buttons navigate correctly

**Steps**:
1. On dashboard, locate **Quick Actions** section
2. Click each button and verify navigation:

| Button | Expected URL | Loads? |
|--------|-------------|--------|
| **Buy Crypto** | `/crypto/buy` | [ ] Yes |
| **Withdraw Crypto** | `/crypto/withdraw` | [ ] Yes |
| **Transfer Funds** | `/transfer` | [ ] Yes |
| **Deposit Money** | `/deposit` | [ ] Yes |
| **View Orders** | `/crypto/orders` | [ ] Yes |
| **View Transactions** | `/transactions` | [ ] Yes |

**Expected Results**:
- All buttons navigate to correct pages
- No 404 errors
- Pages load without crashes

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #8: Pending Alerts**
**Objective**: Verify pending alerts show on dashboard when items are pending

**Steps**:
1. Submit a crypto purchase (don't approve as admin)
2. Navigate to `/dashboard`
3. Verify **yellow alert** appears:
   - [ ] "You have X pending crypto order(s)."
   - [ ] Click alert → navigates to `/crypto/orders`
4. Submit a crypto withdrawal (don't approve)
5. Refresh dashboard
6. Verify **blue alert** appears:
   - [ ] "You have X pending withdrawal request(s)."
   - [ ] Click alert → navigates to `/crypto/withdrawals`
7. Approve all pending items as admin
8. Refresh dashboard as user
9. Verify **no alerts** appear

**Expected Results**:
- Alerts appear only when items are pending
- Alerts are clickable and navigate correctly
- Alerts disappear after items are approved
- Count is accurate

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #9: Portfolio Value Calculation**
**Objective**: Verify total portfolio value calculates correctly

**Steps**:
1. Navigate to `/dashboard`
2. Note the individual balances:
   - USD: $______
   - BTC: ______ BTC = $______
   - ETH: ______ ETH = $______
   - USDT: ______ USDT = $______
   - LTC: ______ LTC = $______
3. Calculate manually:
   - **Expected Total** = USD + (BTC value) + (ETH value) + (USDT value) + (LTC value)
   - Expected: $____________
4. Compare with **Total Portfolio Value** card
   - Displayed: $____________
5. Verify they match (allow ±$0.01 for rounding)

**Expected Results**:
- Total portfolio value is sum of all balances in USD
- Calculation updates when prices change
- Large card displays with gradient background

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #10: Responsive Design Check**
**Objective**: Verify dashboard works on different screen sizes

**Steps**:
1. Open dashboard on desktop (1920x1080)
   - [ ] Layout looks good
   - [ ] No horizontal scroll
   - [ ] Cards display in proper grid
2. Resize browser to tablet width (768px)
   - [ ] Cards stack appropriately
   - [ ] Text remains readable
   - [ ] Buttons are clickable
3. Resize to mobile width (375px)
   - [ ] All content visible
   - [ ] No overlapping elements
   - [ ] Touch targets are large enough

**Expected Results**:
- Dashboard is fully responsive
- No layout breaks at any size
- All functionality works on mobile

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

### ✅ **TEST #11: Error Handling**
**Objective**: Verify graceful error handling

**Test Cases**:

**A) Network Error Simulation**
1. Stop backend server
2. Try to load dashboard
3. Verify error messages display
4. Restart backend
5. Refresh page
6. Verify dashboard loads

**B) Invalid Data**
1. Try to withdraw more crypto than you have
2. Verify error: "Insufficient balance"
3. Try to purchase with $0 amount
4. Verify validation error

**C) Session Expiry**
1. Delete JWT token from localStorage
2. Try to access dashboard
3. Verify redirect to login page

**Expected Results**:
- Error messages are user-friendly
- No crashes or blank screens
- System recovers gracefully

**Pass/Fail**: ______

**Notes**:
_________________________________________________________________

---

## 📊 **TEST SUMMARY**

| Test # | Test Name | Status | Pass/Fail |
|--------|-----------|--------|-----------|
| 1 | User Dashboard Display | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 2 | Live Crypto Prices | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 3 | Crypto Purchase Flow | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 4 | Crypto Withdrawal + Validation | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 5 | Wallet Validation (All Types) | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 6 | Recent Transactions | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 7 | Quick Actions Navigation | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 8 | Pending Alerts | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 9 | Portfolio Value Calculation | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 10 | Responsive Design | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |
| 11 | Error Handling | ⬜ Not Started<br>🔄 In Progress<br>✅ Complete | _____ |

---

## 🐛 **BUGS FOUND**

| Bug # | Description | Severity | Steps to Reproduce | Status |
|-------|-------------|----------|-------------------|--------|
| 1 | | 🔴 Critical<br>🟡 Medium<br>🟢 Low | | ⬜ Open<br>🔄 In Progress<br>✅ Fixed |
| 2 | | 🔴 Critical<br>🟡 Medium<br>🟢 Low | | ⬜ Open<br>🔄 In Progress<br>✅ Fixed |
| 3 | | 🔴 Critical<br>🟡 Medium<br>🟢 Low | | ⬜ Open<br>🔄 In Progress<br>✅ Fixed |

---

## ✅ **FINAL CHECKLIST**

Before marking testing complete, verify:

- [ ] All 11 tests completed
- [ ] All tests passed OR bugs documented
- [ ] Dashboard loads without errors
- [ ] Crypto purchase flow works end-to-end
- [ ] Crypto withdrawal flow works end-to-end
- [ ] Wallet validation works for all crypto types
- [ ] Recent transactions display correctly
- [ ] Quick actions all navigate properly
- [ ] Pending alerts function correctly
- [ ] Portfolio value calculates accurately
- [ ] Responsive design works on mobile
- [ ] Error handling is graceful
- [ ] No console errors in browser
- [ ] No server errors in backend logs
- [ ] All features meet acceptance criteria

---

## 📝 **TESTER NOTES**

**Overall Impression**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Recommendations**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Sign-off**:
- Tester Name: _________________
- Date: _________________
- Signature: _________________

---

## 🚀 **NEXT STEPS AFTER TESTING**

1. **If All Tests Pass**:
   - Mark todos as complete
   - Create production build
   - Deploy to staging environment
   - Run smoke tests on staging

2. **If Bugs Found**:
   - Document all bugs above
   - Prioritize by severity
   - Fix critical bugs first
   - Re-test after fixes

3. **Performance Testing** (Optional):
   - Load test crypto purchase with 100 concurrent users
   - Check dashboard load time with large transaction history
   - Test with slow network (3G simulation)

4. **Security Testing** (Recommended):
   - Verify JWT expiration works
   - Test SQL injection on inputs
   - Check XSS vulnerabilities
   - Verify CORS is properly configured

---

**Good luck with testing! 🎉**
