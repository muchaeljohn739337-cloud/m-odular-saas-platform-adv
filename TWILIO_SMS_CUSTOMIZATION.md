# Twilio SMS Message Customization

## 📱 Custom SMS Message Format

Your users will receive SMS messages like this:

```
───────────────────────────────
From: ADVANCIA PAYLEDGER

Your ADVANCIA PAYLEDGER login code is: 924149

Never share this code. Valid for 10 minutes.
───────────────────────────────
```

## How to Set This Up in Twilio Console

### Option 1: Update Message Template (Recommended)

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Verify** → **Services**
3. Click on your service: `VAe6a39002df29f79be8bd961927028a47`
4. Go to **Messaging** tab
5. Update the **Message Template**:

```
Your ADVANCIA PAYLEDGER login code is: {{code}}

Never share this code. Valid for 10 minutes.
```

**Character Count**: 79 characters (well under 160 limit ✅)

### Option 2: Custom Sender Name

To show "ADVANCIA PAYLEDGER" as the sender:

1. In Twilio Console → **Phone Numbers**
2. Click your number: `+17174695102`
3. Under **Messaging** → **Alpha Sender ID**
4. Set to: `ADVANCIA` (11 char max for US)

**Note**: Alpha Sender IDs work differently by country. In the US, the number +17174695102 will show as the sender.

### Option 3: Use Messaging Service (For Branding)

1. Create a **Messaging Service** in Twilio Console
2. Add your phone number to the service
3. Set service name to "ADVANCIA PAYLEDGER"
4. Link it to your Verify Service

## Current Configuration

Your Verify Service SID: `VAe6a39002df29f79be8bd961927028a47`

Current message template (Twilio default):
```
Your verification code is: {{code}}
```

## Message Specifications

- **Character Limit**: 160 characters for single SMS
- **Current Length**: 79 characters ✅
- **Code Format**: 6-digit numeric
- **Validity**: 10 minutes (Twilio Verify default)
- **Delivery Time**: Usually 1-5 seconds

## Security Best Practices ✅

Your message includes:
- ✅ Brand name (ADVANCIA PAYLEDGER)
- ✅ Warning not to share code
- ✅ Expiration time (10 minutes)
- ✅ No personal data (email, name, account number)

## Testing the New Message

After updating in Twilio Console, test with:

```powershell
.\test-sms-simple.ps1
```

Or start your backend and use the frontend login page at:
```
http://localhost:3000/auth/login
```

## Compliance Note

Make sure to add opt-out instructions if required by your region:
```
Your ADVANCIA PAYLEDGER login code is: {{code}}

Never share this code. Valid for 10 minutes.
Reply STOP to unsubscribe.
```

This brings the count to 107 characters (still under 160 ✅)
