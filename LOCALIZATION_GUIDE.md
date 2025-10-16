# Date & Time Localization Guide

## Overview
All date and time displays in the application now automatically detect and use the user's browser locale/region settings.

## What Changed

### ✅ Automatic Region Detection
- **Before**: Hardcoded `en-US` locale
- **After**: Uses `undefined` which tells the browser to use the user's system locale

### ✅ Components Updated
1. **ProfileOverviewCard.tsx**
   - Time display: Now shows in user's 12-hour or 24-hour format based on region
   - Date display: Shows in user's preferred date format

2. **All Other Components** (Already locale-aware):
   - TransactionList.tsx
   - HealthDashboard.tsx
   - BalanceDropdown.tsx
   - ActiveWorkCard.tsx

## How It Works

### User Locale Detection
```typescript
// Automatically uses browser locale
new Date().toLocaleString() // Uses system settings

// Examples by region:
// US: "10/16/2025, 2:00:00 PM"
// UK: "16/10/2025, 14:00:00"
// France: "16/10/2025 14:00:00"
// Japan: "2025/10/16 14:00:00"
```

### Time Formats by Region

| Region | Time Format | Example |
|--------|------------|---------|
| USA | 12-hour with AM/PM | 02:00:00 PM |
| UK | 24-hour | 14:00:00 |
| Europe | 24-hour | 14:00:00 |
| Asia | Varies by country | 14:00:00 or 下午2:00:00 |

### Date Formats by Region

| Region | Date Format | Example |
|--------|------------|---------|
| USA | MM/DD/YYYY | 10/16/2025 |
| UK | DD/MM/YYYY | 16/10/2025 |
| ISO | YYYY-MM-DD | 2025-10-16 |
| Long | Day, Month DD, YYYY | Wednesday, October 16, 2025 |

## New Utility Functions

### Location: `frontend/src/utils/dateUtils.ts`

#### 1. formatDateTime()
Formats date with time in user's locale
```typescript
import { formatDateTime } from '@/utils/dateUtils';

formatDateTime(new Date());
// US: "Oct 16, 2025, 02:00:00 PM"
// UK: "16 Oct 2025, 14:00:00"
```

#### 2. formatTime()
Formats only time
```typescript
import { formatTime } from '@/utils/dateUtils';

formatTime(new Date());
// US: "02:00:00 PM"
// UK: "14:00:00"

formatTime(new Date(), false); // without seconds
// US: "02:00 PM"
// UK: "14:00"
```

#### 3. formatDate()
Formats only date with different styles
```typescript
import { formatDate } from '@/utils/dateUtils';

formatDate(new Date(), 'short');  // "10/16/25"
formatDate(new Date(), 'medium'); // "Oct 16, 2025"
formatDate(new Date(), 'long');   // "Wednesday, October 16, 2025"
formatDate(new Date(), 'full');   // "Wednesday, October 16, 2025"
```

#### 4. formatRelativeTime()
Shows relative time (e.g., "2 hours ago")
```typescript
import { formatRelativeTime } from '@/utils/dateUtils';

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
formatRelativeTime(twoHoursAgo);
// "2 hours ago"
```

#### 5. formatCurrency()
Formats currency in user's locale
```typescript
import { formatCurrency } from '@/utils/dateUtils';

formatCurrency(1234.56);
// US: "$1,234.56"
// UK: "US$1,234.56"
// Europe: "1.234,56 $"
```

#### 6. getUserLocale() & getUserTimezone()
Get user's settings
```typescript
import { getUserLocale, getUserTimezone } from '@/utils/dateUtils';

getUserLocale();    // "en-US", "fr-FR", "ja-JP", etc.
getUserTimezone();  // "America/New_York", "Europe/London", etc.
```

## Testing Different Regions

### In Chrome/Edge:
1. Open DevTools (F12)
2. Press Ctrl+Shift+P
3. Type "sensors"
4. Select "Show Sensors"
5. Change "Location" settings

### Change Browser Language:
1. **Chrome**: Settings → Languages → Add languages
2. **Firefox**: Settings → Language → Choose
3. **Edge**: Settings → Languages

### Test URLs:
- US Format: Set browser to English (United States)
- UK Format: Set browser to English (United Kingdom)
- 24-hour: Set browser to any European language
- Different date order: Set browser to Japanese, Korean, or Chinese

## Implementation Examples

### Example 1: Transaction Timestamp
```typescript
// Before
<p>{new Date(tx.timestamp).toLocaleString('en-US')}</p>

// After (automatic locale)
<p>{new Date(tx.timestamp).toLocaleString()}</p>
```

### Example 2: Profile Time Display
```typescript
// Before
now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

// After (automatic locale)
now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
```

### Example 3: Using Utility Function
```typescript
import { formatDateTime } from '@/utils/dateUtils';

// Simple usage
<p>{formatDateTime(transaction.createdAt)}</p>

// Custom options
<p>{formatDateTime(transaction.createdAt, { 
  dateStyle: 'short', 
  timeStyle: 'short' 
})}</p>
```

## Common Locale Codes

| Code | Region | Time | Date |
|------|--------|------|------|
| en-US | United States | 12-hour | MM/DD/YYYY |
| en-GB | United Kingdom | 24-hour | DD/MM/YYYY |
| fr-FR | France | 24-hour | DD/MM/YYYY |
| de-DE | Germany | 24-hour | DD.MM.YYYY |
| es-ES | Spain | 24-hour | DD/MM/YYYY |
| it-IT | Italy | 24-hour | DD/MM/YYYY |
| ja-JP | Japan | 24-hour | YYYY/MM/DD |
| zh-CN | China | 24-hour | YYYY/MM/DD |
| ko-KR | Korea | 24-hour | YYYY.MM.DD |
| pt-BR | Brazil | 24-hour | DD/MM/YYYY |
| ru-RU | Russia | 24-hour | DD.MM.YYYY |
| ar-SA | Saudi Arabia | 12-hour | DD/MM/YYYY |

## Benefits

### ✅ User Experience
- Users see familiar date/time formats
- No manual timezone configuration needed
- Respects system preferences automatically

### ✅ Internationalization (i18n)
- Ready for global users
- No hardcoded formats
- Supports all IETF BCP 47 language tags

### ✅ Accessibility
- Follows user's system settings
- Respects accessibility preferences
- Works with screen readers

## Best Practices

### Do ✅
```typescript
// Use undefined for automatic detection
new Date().toLocaleString(undefined, options);
new Intl.DateTimeFormat(undefined, options);

// Use utility functions
import { formatTime, formatDate } from '@/utils/dateUtils';
```

### Don't ❌
```typescript
// Don't hardcode locales
new Date().toLocaleString('en-US', options);
new Intl.DateTimeFormat('en-US', options);

// Don't manually format dates
`${month}/${day}/${year}`; // Wrong!
```

## Browser Support
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ All modern browsers support Intl API

## Migration Checklist

- [x] ProfileOverviewCard - Time & Date display
- [x] TransactionList - Transaction timestamps
- [x] HealthDashboard - Reading timestamps
- [x] BalanceDropdown - Last updated
- [x] ActiveWorkCard - Last update time
- [x] Created dateUtils.ts utility file
- [x] Created documentation

## Next Steps

### Optional Enhancements:
1. Add user preference to override auto-detection
2. Store timezone preference in user profile
3. Add timezone selector in settings
4. Display multiple timezones for global teams

### Advanced Features:
```typescript
// Future: Allow users to set preferred timezone
const [userTimezone, setUserTimezone] = useState(getUserTimezone());

<select onChange={(e) => setUserTimezone(e.target.value)}>
  <option value="America/New_York">Eastern Time</option>
  <option value="America/Los_Angeles">Pacific Time</option>
  <option value="Europe/London">London</option>
  <option value="Asia/Tokyo">Tokyo</option>
</select>
```

## Support

For issues or questions about date/time localization:
1. Check browser language settings
2. Verify Intl API support
3. Test in different browsers
4. Review dateUtils.ts for utility functions

---

**Last Updated**: October 16, 2025
**Version**: 1.0
**Status**: ✅ Production Ready
