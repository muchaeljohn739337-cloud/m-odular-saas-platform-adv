# Frontend Component UAT Testing Checklist

## TokenWallet Component Testing

### Component: `frontend/src/app/tokens/wallet.tsx`

#### 1. Display & Rendering

- [ ] Component renders without errors
- [ ] Current token balance displays correctly
- [ ] USD balance displays correctly
- [ ] Transaction history loads
- [ ] Loading states appear during API calls
- [ ] Error messages display when appropriate
- [ ] Responsive design works on mobile
- [ ] Dark mode (if applicable) renders correctly

#### 2. Transfer Functionality

- [ ] Transfer button visible and clickable
- [ ] Transfer form opens modal/drawer
- [ ] Recipient address input accepts valid address
- [ ] Amount input validates numeric-only input
- [ ] Submit button disabled when form invalid
- [ ] Submit button enabled when form valid
- [ ] Loading state shows during submission
- [ ] Success message appears after transfer
- [ ] Transfer appears in history immediately
- [ ] Error message shows for invalid recipient
- [ ] Error message shows for insufficient balance
- [ ] Can cancel transfer without changes

#### 3. Withdraw Functionality

- [ ] Withdraw button visible and clickable
- [ ] Withdraw form opens with ETH address field
- [ ] ETH address validation works (0x prefix)
- [ ] Amount input validates correctly
- [ ] Cannot withdraw more than balance
- [ ] Submit triggers API call
- [ ] Loading spinner shows during withdrawal
- [ ] Success message displays with tx hash
- [ ] Transaction hash is clickable/copyable
- [ ] Withdrawal appears in history
- [ ] Balance updates immediately
- [ ] Error for invalid ETH address
- [ ] Error for network issues

#### 4. Cashout Functionality

- [ ] Cashout button visible and clickable
- [ ] Cashout form opens with amount field
- [ ] USD amount calculation shows correctly ($0.10/token)
- [ ] Cannot cashout more than balance
- [ ] Submit triggers API call
- [ ] Loading spinner shows during cashout
- [ ] Success message displays
- [ ] Token balance decreases by correct amount
- [ ] USD balance increases by correct amount
- [ ] Transaction recorded in history
- [ ] Error handling for insufficient balance

#### 5. Real-Time Updates

- [ ] Balance updates in real-time (< 1 second)
- [ ] WebSocket connection established
- [ ] Socket.IO events received for updates
- [ ] Multiple windows/tabs sync balance
- [ ] Transaction history updates automatically
- [ ] No manual refresh needed

#### 6. Transaction History

- [ ] History displays all transactions
- [ ] Transactions sorted by date (newest first)
- [ ] Transaction details show type, amount, date
- [ ] Pagination works if applicable
- [ ] Can expand transaction for full details
- [ ] Status shows correctly (pending, completed, failed)
- [ ] Filter by transaction type works
- [ ] Search by date range works

#### 7. Security & Edge Cases

- [ ] Cannot submit form with invalid data
- [ ] Session timeout handled gracefully
- [ ] Cannot access with invalid token
- [ ] XSS prevention (no script injection)
- [ ] CSRF token included in requests
- [ ] Sensitive data not logged to console
- [ ] Copy to clipboard works for addresses
- [ ] Confirm dialog for large transactions

---

## RewardsDashboard Component Testing

### Component: `frontend/src/app/rewards/dashboard.tsx`

#### 1. Display & Rendering

- [ ] Component renders without errors
- [ ] Page title displays correctly
- [ ] Pending rewards section visible
- [ ] Tier progress section visible
- [ ] Leaderboard section visible
- [ ] Responsive design on mobile
- [ ] Dark mode renders correctly
- [ ] Loading skeletons show during data fetch

#### 2. Pending Rewards Display

- [ ] Pending rewards list displays
- [ ] Each reward shows: amount, expiration date
- [ ] Total pending amount calculated correctly
- [ ] Non-expired rewards only shown
- [ ] Countdown timer shows time to expiration
- [ ] Expired rewards hidden
- [ ] Empty state shows if no rewards
- [ ] Reward details expandable (if applicable)

#### 3. Claim Rewards

- [ ] Claim button visible for each reward
- [ ] Claim button enabled only when not expired
- [ ] Click triggers API call
- [ ] Loading state shows during claim
- [ ] Success notification appears
- [ ] Claimed amount added to balance
- [ ] Reward removed from pending list
- [ ] Error message for expired reward
- [ ] Error handling for insufficient funds (if applicable)

#### 4. Tier Progression

- [ ] Current tier badge displays
- [ ] Tier name shows (Bronze, Silver, Gold, Platinum)
- [ ] Tier icon displays correctly
- [ ] Progress bar shows advancement to next tier
- [ ] Percentage complete visible
- [ ] Amount needed to next tier shown
- [ ] Tier benefits displayed
- [ ] Tier history available (if applicable)

#### 5. Leaderboard Section

- [ ] Leaderboard loads with top users
- [ ] Top 10 users displayed by default
- [ ] User rankings in correct order
- [ ] User names display correctly
- [ ] Reward amounts shown
- [ ] Tier badges visible next to names
- [ ] Current user highlighted/marked
- [ ] Can expand for more users (pagination)
- [ ] Can filter by timeframe (week/month/all-time)

#### 6. Real-Time Updates

- [ ] Rank updates when user earns rewards
- [ ] Other users' rankings update in real-time
- [ ] Pending rewards update as countdown progresses
- [ ] Tier progression updates live
- [ ] Leaderboard refreshes every few seconds
- [ ] No manual refresh needed

#### 7. Notifications

- [ ] Toast notification when reward earned
- [ ] Toast notification when tier advanced
- [ ] Notification includes action (e.g., "Claim Now")
- [ ] Can dismiss notification
- [ ] Notification disappears after timeout
- [ ] Browser notification (if enabled)

#### 8. Streak Counter (if applicable)

- [ ] Streak count displays
- [ ] Counter increments on daily login
- [ ] Counter resets after missed day
- [ ] Streak bonus applied correctly
- [ ] Streak milestone rewards shown

---

## MedBeds Component Testing

### Component: `frontend/src/app/medbeds/book/page.tsx`

#### 1. Display & Rendering

- [ ] Component renders without errors
- [ ] Page title displays correctly
- [ ] Booking form visible
- [ ] Location map visible
- [ ] Chamber details visible
- [ ] Responsive design on mobile
- [ ] Images load correctly
- [ ] Loading states work

#### 2. Booking Form

- [ ] Date picker works
- [ ] Can select valid future date
- [ ] Cannot select past dates
- [ ] Time picker works
- [ ] Can select available time slots
- [ ] Duration selector works (30 min, 60 min, etc.)
- [ ] Chamber selection works
- [ ] Multiple chamber options visible
- [ ] Form validation works
- [ ] Required fields marked

#### 3. Availability

- [ ] Available time slots show
- [ ] Booked slots show as unavailable
- [ ] Availability updates in real-time
- [ ] Cannot book already-booked slots
- [ ] Shows when fully booked for a time
- [ ] Can view next available slot

#### 4. Booking Details

- [ ] Price displays clearly
- [ ] Duration-based pricing calculated
- [ ] Discount applied if applicable
- [ ] Total cost shown before confirmation
- [ ] Package options visible
- [ ] Add-ons available (if applicable)

#### 5. Booking Submission

- [ ] Submit button visible and enabled (when form valid)
- [ ] Submit button disabled when form invalid
- [ ] Shows confirmation dialog with details
- [ ] Displays final price before confirm
- [ ] Loading state during submission
- [ ] Success confirmation after booking
- [ ] Booking reference number provided
- [ ] Confirmation email sent (if configured)

#### 6. Error Handling

- [ ] Error message for required fields
- [ ] Error for past date selection
- [ ] Error for time slot in past
- [ ] Error for network issues
- [ ] Retry option available
- [ ] Error doesn't clear form

#### 7. Booking History

- [ ] Previous bookings display
- [ ] Can view past booking details
- [ ] Upcoming bookings highlighted
- [ ] Can modify future bookings
- [ ] Can cancel bookings (if allowed)
- [ ] Cancellation reason required (if applicable)

#### 8. Real-Time Sync

- [ ] Booking confirmed in real-time
- [ ] Appears in user's booking list immediately
- [ ] Availability updates for other users
- [ ] Real-time reservation prevents double-booking

---

## Real-Time Functionality Testing

### Socket.IO Events

#### 1. Balance Updates

- [ ] Open 2 browser windows for same user
- [ ] Execute withdraw/cashout in first window
- [ ] Balance updates in second window within 1 second
- [ ] Update doesn't require page refresh
- [ ] Socket event logged correctly

#### 2. Reward Notifications

- [ ] User earns reward in backend
- [ ] Socket event emitted to user room
- [ ] Browser shows toast notification
- [ ] Notification includes reward amount
- [ ] Notification appears on all open tabs

#### 3. Leaderboard Updates

- [ ] User's rank changes when earning rewards
- [ ] Leaderboard updates in real-time
- [ ] Position reflects correctly
- [ ] Other users' positions update

#### 4. Connection Stability

- [ ] Socket reconnects if connection drops
- [ ] Queue events while offline
- [ ] Sync on reconnection
- [ ] No data loss on disconnect
- [ ] Connection status indicator shows

---

## Cross-Browser Testing

### Desktop Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile Firefox

### Test Points

- [ ] Layout responsive on all screen sizes
- [ ] Touch events work on mobile
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Images optimize for mobile
- [ ] Forms easy to fill on mobile

---

## Performance Testing

### Load Testing

- [ ] Leaderboard loads quickly (< 500ms)
- [ ] Pending rewards load quickly (< 500ms)
- [ ] Wallet transactions load quickly
- [ ] Page interactive within 3 seconds

### Real-Time Performance

- [ ] Balance update appears < 1 second
- [ ] Leaderboard refreshes < 5 seconds
- [ ] Rewards notification appears < 2 seconds

### Resource Usage

- [ ] WebSocket not consuming excessive CPU
- [ ] Memory usage stable over time
- [ ] No memory leaks on component unmount
- [ ] Reasonable data usage on mobile

---

## Accessibility Testing

### Keyboard Navigation

- [ ] All buttons accessible via Tab key
- [ ] Can submit forms with Enter key
- [ ] Focus indicators visible
- [ ] Modal keyboard trap works

### Screen Reader

- [ ] Form labels associated with inputs
- [ ] Buttons have descriptive text
- [ ] Images have alt text
- [ ] Status messages announced
- [ ] Errors announced

### Color Contrast

- [ ] Text meets WCAG AA standards
- [ ] Links distinguishable from text
- [ ] Form validation visible (not color only)

---

## Security Testing

### Authentication

- [ ] Cannot access without login
- [ ] Session persists correctly
- [ ] Token expires after timeout
- [ ] Cannot use expired token

### Data Protection

- [ ] Sensitive data not logged
- [ ] No XSS vulnerabilities
- [ ] CSRF token included
- [ ] API calls use HTTPS
- [ ] WebSocket uses WSS

### Input Validation

- [ ] XSS attempt blocked
- [ ] SQL injection attempt blocked
- [ ] Large input rejected
- [ ] Invalid format rejected

---

## Test Report Template

### Test Case: [Name]

**Date**: [Date]  
**Tester**: [Name]  
**Status**: [ ] PASS [ ] FAIL  
**Severity**: (if fail) [ ] Critical [ ] High [ ] Medium [ ] Low

**Steps Taken**:

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [Description]

**Actual Result**: [Description]

**Notes**: [Any additional notes]

**Screenshot**: [Attach if failed]

---

## Sign-Off

- [ ] All test cases executed
- [ ] All critical issues resolved
- [ ] Product Owner approval obtained
- [ ] Ready for production

**QA Tester**: ********\_******** **Date**: **\_\_\_**

**Product Owner**: ********\_******** **Date**: **\_\_\_**
