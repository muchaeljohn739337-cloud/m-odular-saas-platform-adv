# Admin Balance Editing Feature

## Overview
Administrators can now directly edit user balances from the Admin Panel. This feature provides immediate control over user account balances with a streamlined interface.

## Access Requirements
- **Role**: Administrator only
- **URL**: `/admin` → User Management tab
- **Authentication**: Must be logged in with admin role or admin email

## How to Edit Balances

### Step-by-Step Guide

1. **Navigate to Admin Panel**
   - Click "Admin" in the sidebar (only visible to admins)
   - Or go to `http://localhost:3000/admin`

2. **Go to User Management Tab**
   - Click the "User Management" tab at the top
   - You'll see a table of all users with their current balances

3. **Edit a Balance**
   - Locate the user whose balance you want to edit
   - Click the **⚙️ gear icon** next to their balance amount
   - An input field will appear with the current balance

4. **Enter New Balance**
   - Type the new balance amount (e.g., `5000.00`)
   - Press **Enter** or click **Save** to confirm
   - Press **Escape** or click **Cancel** to abort

5. **Confirmation**
   - A success message will show: `✅ Balance updated for [User Name]`
   - The new balance displays immediately
   - System stats update automatically

## Features

### Input Validation
- ✅ Only positive numbers allowed
- ✅ Decimal values supported (e.g., `1234.56`)
- ✅ Invalid inputs show warning message
- ✅ Keyboard shortcuts: Enter (save), Escape (cancel)

### Real-Time Updates
- Balance changes reflect immediately in the table
- Total volume statistics recalculate automatically
- No page refresh required

### User Experience
- Inline editing - no modal dialogs
- Visual feedback with color-coded buttons
- Auto-focus on input field for quick editing
- Hover tooltips for clarity

## Security

### Protected Endpoints
- Balance editing is **frontend-only** (mock data)
- Backend integration ready via `/api/users/:id/balance` route
- Only admins can access the editing interface
- Non-admin users cannot see the gear icon

### Access Control
Admins are identified by:
- Email containing "admin" (e.g., `admin@advancia.com`)
- Explicit role: `role: "admin"`
- Session-based authentication

## UI Components

### Info Banner
A blue information banner appears above the user table:
```
💵 Admin Access Required
You can edit user balances directly. Click the ⚙️ icon next to any 
balance to modify it. Changes will be reflected immediately in the system.
```

### Balance Display States

**View Mode**
```
$5,250.00 ⚙️
```

**Edit Mode**
```
$ [____5000____] [Save] [Cancel]
```

## Technical Implementation

### State Management
```typescript
const [editingBalance, setEditingBalance] = useState<string | null>(null);
const [newBalance, setNewBalance] = useState<string>("");
```

### Key Functions
- `handleEditBalance(userId, currentBalance)` - Enter edit mode
- `handleSaveBalance(userId)` - Save and validate new balance
- `handleCancelEdit()` - Exit edit mode without saving

### Data Flow
1. Admin clicks edit icon
2. Input field populates with current balance
3. Admin enters new amount
4. Validation checks (positive number)
5. User state updates
6. Stats recalculate
7. Success confirmation

## Backend Integration (Future)

### Planned Endpoint
```typescript
PUT /api/users/:userId/balance
Body: { balance: number }
Response: { success: true, newBalance: number }
```

### Implementation Checklist
- [ ] Create backend route in `backend/src/routes/users.ts`
- [ ] Add admin middleware protection
- [ ] Update Prisma User model if needed
- [ ] Add database transaction for balance change
- [ ] Create audit log entry
- [ ] Replace frontend state update with API call
- [ ] Add error handling and retry logic

## Testing

### Manual Test Scenarios

1. **Valid Edit**
   - Edit user balance to `1000.50`
   - Verify success message
   - Check balance displays correctly
   - Confirm stats updated

2. **Invalid Input**
   - Try negative number: `-100`
   - Try text: `abc`
   - Try empty: ` `
   - Verify warning appears

3. **Cancel Action**
   - Click edit icon
   - Change value but don't save
   - Click Cancel
   - Verify original value remains

4. **Keyboard Shortcuts**
   - Edit balance
   - Press Enter → saves
   - Edit again
   - Press Escape → cancels

5. **Multiple Users**
   - Edit User A's balance
   - Edit User B's balance
   - Verify both update correctly
   - Check total volume stat

## Screenshots

### Before Editing
```
User          Role    Status    Balance        Last Active    Actions
John Doe      USER    ACTIVE    $5,250.00 ⚙️   10:30 AM      👁️ 🔒 ✓ ❌
```

### During Editing
```
User          Role    Status    Balance                               Last Active    Actions
John Doe      USER    ACTIVE    $ [____5000____] [Save] [Cancel]     10:30 AM      👁️ 🔒 ✓ ❌
```

### After Saving
```
User          Role    Status    Balance        Last Active    Actions
John Doe      USER    ACTIVE    $5,000.00 ⚙️   10:30 AM      👁️ 🔒 ✓ ❌
```

## Troubleshooting

### Can't See Edit Icon
- **Problem**: Gear icon not visible
- **Solution**: Verify admin role/email in session
- **Check**: Look for "Admin" link in sidebar

### Changes Not Saving
- **Problem**: Save button does nothing
- **Solution**: Check browser console for errors
- **Workaround**: Refresh page and try again

### Balance Validation Error
- **Problem**: "Please enter a valid positive number"
- **Solution**: Use only numbers and decimal point
- **Format**: `1234.56` (not `$1,234.56` or `1234.56 USD`)

## Best Practices

### For Admins
1. ✅ Double-check amounts before saving
2. ✅ Use decimal points for cents (e.g., `50.25`)
3. ✅ Verify user identity before editing
4. ✅ Document balance changes externally
5. ✅ Keep audit trail of manual adjustments

### For Developers
1. ✅ Always validate input
2. ✅ Show clear success/error messages
3. ✅ Prevent negative balances
4. ✅ Log all balance modifications
5. ✅ Consider adding confirmation dialog for large amounts

## Future Enhancements

### Planned Features
- [ ] Bulk balance editing (multiple users)
- [ ] Balance adjustment history log
- [ ] Reason field for balance changes
- [ ] Email notification to user on balance change
- [ ] Undo last change feature
- [ ] CSV export of balance history
- [ ] Graph showing balance changes over time

### Advanced Features
- [ ] Transaction creation when balance changes
- [ ] Approval workflow for large changes
- [ ] Two-factor authentication for balance edits
- [ ] Role-based limits (max edit amount)
- [ ] Scheduled balance adjustments

## Related Features

- [Admin Panel Overview](./README.md#admin-panel)
- [User Management](./README.md#user-management)
- [Security Settings](./GITHUB_SECRETS_SETUP.md)
- [Backend API](./backend/README.md)

## Support

For issues or questions about balance editing:
1. Check console logs for errors
2. Verify admin permissions
3. Review this documentation
4. Test in development environment first

---

**Last Updated**: October 16, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (Frontend Mock)
