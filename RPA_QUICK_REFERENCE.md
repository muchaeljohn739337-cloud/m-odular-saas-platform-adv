# RPA Module - Quick Reference Card 🚀

## 🎯 Quick Start (3 Steps)

### 1. Install Dependencies (if not already installed)
```bash
cd backend
npm install
```

### 2. Configure Environment
Add to `backend/.env`:
```bash
RPA_AUTO_START=false
RPA_TRANSACTION_ENABLED=true
RPA_KYC_ENABLED=true
RPA_REPORTS_ENABLED=true
RPA_NOTIFICATIONS_ENABLED=true
RPA_BACKUP_ENABLED=true
```

### 3. Start RPA
```bash
# Start server
npm run dev

# In another terminal:
curl -X POST http://localhost:5000/api/rpa/start
```

---

## 📡 Essential API Calls

### Control
```bash
# Start RPA
curl -X POST http://localhost:5000/api/rpa/start

# Check Status
curl http://localhost:5000/api/rpa/status

# Health Check
curl http://localhost:5000/api/rpa/health

# Stop RPA
curl -X POST http://localhost:5000/api/rpa/stop
```

### Manual Triggers
```bash
# Process a transaction
curl -X POST http://localhost:5000/api/rpa/transaction/process \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "your-uuid-here"}'

# Verify KYC document
curl -X POST http://localhost:5000/api/rpa/kyc/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "documentPath": "/path/to/document.jpg",
    "documentType": "passport"
  }'

# Generate report
curl -X POST http://localhost:5000/api/rpa/report/generate \
  -H "Content-Type: application/json" \
  -d '{"reportType": "balances"}'

# Send notification
curl -X POST http://localhost:5000/api/rpa/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "type": "email",
    "template": "transaction_alert",
    "data": {"amount": 100}
  }'

# Create backup
curl -X POST http://localhost:5000/api/rpa/backup/create
```

---

## 📅 Default Schedules

| Task | Schedule | Frequency |
|------|----------|-----------|
| Transaction Processing | `*/5 * * * *` | Every 5 minutes |
| KYC Verification | `*/10 * * * *` | Every 10 minutes |
| Report Generation | `0 8 * * *` | Daily at 8:00 AM |
| Notification Queue | `* * * * *` | Every minute |
| Database Backup | `0 2 * * *` | Daily at 2:00 AM |

---

## 🔧 Common Tasks

### Change Schedule
Edit `.env`:
```bash
RPA_TRANSACTION_INTERVAL="*/10 * * * *"  # Every 10 min
RPA_REPORTS_SCHEDULE="0 20 * * *"        # Daily at 8 PM
RPA_BACKUP_SCHEDULE="0 3 * * 0"          # Weekly Sunday 3 AM
```

### Disable a Module
```bash
RPA_TRANSACTION_ENABLED=false
```

### Run Task Manually
```bash
curl -X POST http://localhost:5000/api/rpa/task/transactionProcessing/run
curl -X POST http://localhost:5000/api/rpa/task/kycVerification/run
curl -X POST http://localhost:5000/api/rpa/task/reportGeneration/run
curl -X POST http://localhost:5000/api/rpa/task/notificationQueue/run
curl -X POST http://localhost:5000/api/rpa/task/dataBackup/run
```

---

## 🐛 Troubleshooting

### RPA Not Starting
```bash
# Check logs
npm run dev

# Look for:
# ✅ [RPA] Automation Scheduler started
# ❌ [RPA] Failed to start...

# Verify status
curl http://localhost:5000/api/rpa/status
```

### Email Not Sending
```bash
# Check .env has:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Not regular password!

# Test send
curl -X POST http://localhost:5000/api/rpa/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "type": "email",
    "template": "test",
    "data": {}
  }'
```

### Backup Failing
```bash
# Ensure pg_dump is installed
pg_dump --version

# Check DATABASE_URL is set
echo $env:DATABASE_URL  # Windows PowerShell
echo $DATABASE_URL      # Linux/Mac
```

---

## 📊 Monitor Health

### Check All Tasks
```bash
curl http://localhost:5000/api/rpa/status | jq
```

### View Logs
```bash
# Filter RPA logs
npm run dev | Select-String "[RPA]"
```

### Check Database Audit
```sql
SELECT * FROM audit_logs 
WHERE action LIKE 'transaction_%' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🔐 Production Checklist

- [ ] Add authentication to `/api/rpa/*` routes
- [ ] Set strong passwords in `.env`
- [ ] Enable HTTPS
- [ ] Configure Twilio for SMS
- [ ] Set up AWS S3 for backups
- [ ] Test all modules manually first
- [ ] Monitor health endpoint
- [ ] Set up alerting
- [ ] Review rate limits
- [ ] Enable auto-start if desired

---

## 📚 Full Documentation

See: `backend/src/rpa/README.md`

---

## 🆘 Quick Help

```bash
# List all RPA files
ls backend/src/rpa/

# View RPA routes
cat backend/src/rpa/routes.ts

# Check configuration
cat backend/src/rpa/config.ts

# View logs in real-time
npm run dev
```

---

**Version**: 1.0.0  
**Status**: Production Ready ✅
