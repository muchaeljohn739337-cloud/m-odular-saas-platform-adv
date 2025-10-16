# 📱 Twilio SMS Setup Complete

## ✅ Configuration Added

Your Twilio credentials have been added to `backend/.env`:

### Test Credentials (Active)
- **Account SID**: `ACd5e9cb35264db70970e0342c5d8b8a52`
- **Auth Token**: `768fb741a1e7a6f64f43c4cd9235a114`
- **Phone Number**: *Update with your Twilio number*

### Production Credentials (Commented)
- **Account SID**: `AC437680f4bacdc2d19c0f5c6d3f43d7df`
- **Auth Token**: `ddf48b20cc428e610fa8f7debe5a6c2e`

### API Key (Advancia_login_key)
- **Key SID**: `SK295f3b2039dc66ae9381b3a30e93fda6`
- **Secret**: `7X5ZhHNmNUDwgTBtl7SOcJneDxJbhJ1F`

---

## 🔧 Next Steps

### 1. Get Your Twilio Phone Number

You need to update `TWILIO_PHONE_NUMBER` with an actual Twilio number:

#### Option A: Buy a Number (Recommended)
1. Go to https://console.twilio.com/us1/develop/phone-numbers/manage/search
2. Search for a number in your region
3. Buy it ($1-2/month for SMS-capable)
4. Copy the number (format: `+15551234567`)
5. Update `.env`: `TWILIO_PHONE_NUMBER="+15551234567"`

#### Option B: Use Messaging Service
1. Go to https://console.twilio.com/us1/develop/sms/services
2. Create a Messaging Service
3. Add a sender (phone number or sender ID)
4. Use the Messaging Service SID in your code

### 2. Verify Your Phone Number (Trial Mode)

If you're on a trial account, verify your personal number:

```bash
# In Twilio Console
Phone Numbers → Verified Caller IDs → Add new number
```

Or use Twilio CLI:
```bash
twilio phone-numbers:verify +1YOUR_PHONE
```

### 3. Restart Backend

```powershell
cd backend
npm run dev
```

The backend will read the new Twilio credentials on startup.

### 4. Test SMS OTP

#### Via Frontend
1. Go to http://localhost:3000/auth/login
2. Click "Login with One-Time Code"
3. Choose "Login with SMS OTP"
4. Enter your verified phone number
5. Check your phone for the OTP

#### Via API
```powershell
# Send OTP
curl -X POST http://localhost:4000/api/auth/send-otp-sms `
  -H "Content-Type: application/json" `
  -d '{"phone":"+15551234567"}'

# Verify OTP
curl -X POST http://localhost:4000/api/auth/verify-otp `
  -H "Content-Type: application/json" `
  -d '{"identifier":"+15551234567","code":"123456"}'
```

---

## 🔒 Security Notes

### ⚠️ Important
- **Never commit `.env` to git** (already in `.gitignore`)
- The test credentials are active - protect them
- Switch to production credentials before going live
- Consider using environment encryption for sensitive data

### Production Checklist
- [ ] Switch to production `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- [ ] Update phone number to production number
- [ ] Remove or secure API keys
- [ ] Enable webhook signatures
- [ ] Monitor usage/costs in Twilio console

---

## 📊 Monitoring

Track SMS usage:
- Console: https://console.twilio.com/us1/monitor/logs/sms
- Programmable SMS Dashboard: https://console.twilio.com/us1/develop/sms/overview

---

## 🐛 Troubleshooting

### Error 21210: Number not verified
**Solution**: Add recipient to verified caller IDs in Twilio console

### Error 21608: Number not capable
**Solution**: Buy an SMS-capable number, not just a voice number

### Backend logs "Twilio credentials not configured"
**Solution**: Restart backend after adding credentials to `.env`

### SMS not arriving
1. Check Twilio SMS logs: https://console.twilio.com/us1/monitor/logs/sms
2. Verify phone number format: `+1XXXXXXXXXX` (include country code)
3. Ensure sender number is SMS-capable

---

## 📚 Resources

- [Twilio SMS Quickstart](https://www.twilio.com/docs/sms/quickstart/node)
- [Verify API](https://www.twilio.com/docs/verify/api)
- [Console Dashboard](https://console.twilio.com/)
- [Authy Account (ID: 1088825401)](https://authy.com/download/)

---

**Status**: ✅ Credentials configured | ⏳ Waiting for phone number update
