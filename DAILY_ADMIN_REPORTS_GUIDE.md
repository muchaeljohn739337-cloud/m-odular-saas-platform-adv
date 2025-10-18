# Daily Admin Report Automation - Setup Guide

## ✅ Already Implemented!

Your RPA module **already includes** a fully functional daily admin report generator that automatically compiles and emails reports!

---

## 📊 Available Reports

### 1. **Balance Report** (Financial Summary)
- Total platform balance
- Active users count
- Average balance per user
- Transaction summary by type
- Top users by balance

### 2. **Crypto Orders Report**
- All crypto orders in period
- Order status breakdown (pending/completed/cancelled)
- Total crypto volume
- Most popular cryptocurrencies

### 3. **Admin Actions Report** (Audit Trail)
- All admin activities
- Action type breakdown
- Most active admins
- Security and compliance tracking

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Configure Email Settings

Add to `backend/.env`:

```bash
# Enable Reports
RPA_REPORTS_ENABLED=true
RPA_REPORTS_SCHEDULE="0 8 * * *"        # Daily at 8:00 AM
RPA_REPORTS_EMAIL_TO=admin@example.com  # Your admin email
RPA_REPORTS_PDF_ENABLED=false           # Set true for PDF attachments

# Gmail SMTP Settings
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password        # NOT your regular Gmail password!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# General RPA Settings
RPA_ADMIN_EMAIL=admin@example.com
RPA_AUTO_START=true                     # Auto-start RPA on server boot
```

### Step 2: Get Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Create a new app password for "Mail"
3. Copy the 16-character password
4. Use it as `EMAIL_PASSWORD` in `.env`

### Step 3: Start RPA Automation

```bash
# Start backend server
cd backend
npm run dev

# In another terminal, start RPA
curl -X POST http://localhost:5000/api/rpa/start

# Verify it's running
curl http://localhost:5000/api/rpa/status
```

---

## 📧 What You'll Receive

### Email Schedule
- **Daily at 8:00 AM** (configurable)
- **Subject**: "Daily Balance Report - [Date]" (or other report type)
- **Format**: Beautiful HTML email with tables and statistics
- **Optional**: PDF attachment

### Sample Email Preview

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DAILY BALANCE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated: 2025-10-17 08:00:00
Period: 2025-10-16 to 2025-10-17

═══════════════════════════════════════════

📊 SECTION: User Balances

Total Users: 150
Total Platform Balance: $125,450.00
Average Balance: $836.33

[Table with detailed user balances]

───────────────────────────────────────────

📊 SECTION: Transaction Summary

Total Transactions: 523
Credits: 301 ($45,230.00)
Debits: 222 ($18,440.00)

[Detailed transaction breakdown]

═══════════════════════════════════════════
```

---

## 🎛️ Configuration Options

### Change Schedule

```bash
# Daily at 8 AM (default)
RPA_REPORTS_SCHEDULE="0 8 * * *"

# Daily at 8 PM
RPA_REPORTS_SCHEDULE="0 20 * * *"

# Every 12 hours (8 AM and 8 PM)
RPA_REPORTS_SCHEDULE="0 8,20 * * *"

# Weekly on Monday at 9 AM
RPA_REPORTS_SCHEDULE="0 9 * * 1"

# Monthly on 1st at 8 AM
RPA_REPORTS_SCHEDULE="0 8 1 * *"

# Every 6 hours
RPA_REPORTS_SCHEDULE="0 */6 * * *"
```

### Enable PDF Attachments

```bash
RPA_REPORTS_PDF_ENABLED=true
```

### Multiple Recipients

The current version sends to one recipient. To send to multiple:

1. Use a distribution list email
2. Or modify the code to accept comma-separated emails

---

## 🔧 Manual Report Generation

### Generate Specific Report Now

```bash
# Balance report for last 7 days
curl -X POST http://localhost:5000/api/rpa/report/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "balances",
    "startDate": "2025-10-10",
    "endDate": "2025-10-17"
  }'

# Crypto orders report
curl -X POST http://localhost:5000/api/rpa/report/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "crypto_orders",
    "startDate": "2025-10-01",
    "endDate": "2025-10-17"
  }'

# Admin actions report
curl -X POST http://localhost:5000/api/rpa/report/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "admin_actions",
    "startDate": "2025-10-01",
    "endDate": "2025-10-17"
  }'
```

### Run Scheduled Task Manually

```bash
# Trigger report generation task
curl -X POST http://localhost:5000/api/rpa/task/reportGeneration/run
```

---

## 📝 Programmatic Usage

Use in your TypeScript/JavaScript code:

```typescript
import { reportGenerator } from './rpa';

// Generate and email a specific report
await reportGenerator.generateAndDistribute(
  'balances',
  new Date('2025-10-01'),
  new Date('2025-10-17')
);

// Generate all configured reports
await reportGenerator.generateAllReports();
```

---

## 🔍 Troubleshooting

### Reports Not Sending

**Check 1: Is RPA running?**
```bash
curl http://localhost:5000/api/rpa/status
```
Should show `"isRunning": true`

**Check 2: Are reports enabled?**
```bash
# Check .env has:
RPA_REPORTS_ENABLED=true
```

**Check 3: Email configuration**
```bash
# Verify in .env:
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

**Check 4: Gmail App Password**
- Must be a Gmail **App Password**, not regular password
- Get from: https://myaccount.google.com/apppasswords
- "Less secure app access" must be OFF (use App Passwords instead)

**Check 5: View logs**
```bash
npm run dev
# Look for:
# ✅ Email transporter initialized
# 📊 Generating all scheduled reports...
# ✅ Report generated and emailed: balances
```

### Test Email Manually

```bash
# Try generating a report now
curl -X POST http://localhost:5000/api/rpa/report/generate \
  -H "Content-Type: application/json" \
  -d '{"reportType": "balances"}'

# Check terminal for success/error messages
```

---

## 📊 Monitoring

### Check Report History

View audit logs to see past reports:

```sql
SELECT * FROM audit_logs 
WHERE action = 'report_generated' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check RPA Status

```bash
curl http://localhost:5000/api/rpa/status | jq
```

Output:
```json
{
  "isRunning": true,
  "tasks": {
    "reportGeneration": {
      "enabled": true,
      "schedule": "0 8 * * *",
      "lastRun": "2025-10-17T08:00:00Z",
      "nextRun": "2025-10-18T08:00:00Z"
    }
  }
}
```

---

## 🎯 Current Implementation Details

### Files Involved

1. **`backend/src/rpa/reportGenerator.ts`**
   - Report generation logic
   - Email formatting (HTML)
   - PDF generation (optional)
   - 3 report types implemented

2. **`backend/src/rpa/scheduler.ts`**
   - Cron-based scheduling
   - Automatic daily execution
   - Task monitoring

3. **`backend/src/rpa/config.ts`**
   - Configuration management
   - Environment variable loading

4. **`backend/src/rpa/routes.ts`**
   - REST API endpoints
   - Manual triggers

### API Endpoints

- `POST /api/rpa/report/generate` - Generate and email report
- `POST /api/rpa/task/reportGeneration/run` - Run scheduled task
- `GET /api/rpa/status` - Check scheduler status
- `GET /api/rpa/health` - Health check

---

## 🔐 Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use App Passwords** - Don't use your actual Gmail password
3. **Add authentication** - Protect `/api/rpa/*` routes in production
4. **Monitor logs** - Check for unauthorized access attempts
5. **Encrypt reports** - Consider encrypting PDF attachments

---

## 🚀 Production Deployment

### On Render.com

Add environment variables in Render dashboard:

```
RPA_REPORTS_ENABLED=true
RPA_REPORTS_SCHEDULE="0 8 * * *"
RPA_REPORTS_EMAIL_TO=admin@yourdomain.com
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
RPA_AUTO_START=true
```

Then redeploy your backend service.

---

## 📚 Additional Resources

- Full RPA Documentation: `backend/src/rpa/README.md`
- Quick Reference: `RPA_QUICK_REFERENCE.md`
- Implementation Summary: `RPA_MODULE_COMPLETE.md`

---

## ✅ Summary

Your RPA module **already includes**:
- ✅ Daily automated report generation
- ✅ HTML email delivery
- ✅ 3 report types (balances, crypto orders, admin actions)
- ✅ Configurable schedule (default: daily at 8 AM)
- ✅ Manual trigger API
- ✅ PDF support (optional)
- ✅ Production-ready code

**To activate**: Just add email settings to `.env` and start the RPA scheduler!

---

**Need help?** Check the troubleshooting section or review the logs in your terminal.

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 17, 2025
