# 🗄️ Database Setup Guide - PostgreSQL

## Current Status
❌ PostgreSQL is not running on `localhost:5432`

## Quick Setup Options

### Option 1: Install PostgreSQL Locally (Recommended for Development)

#### Step 1: Download PostgreSQL
1. Go to: https://www.postgresql.org/download/windows/
2. Download the installer (latest version, e.g., PostgreSQL 16)
3. Run the installer

#### Step 2: Installation Settings
- Port: `5432` (default)
- Password: Set to `password` (or update .env if different)
- Install all components (including pgAdmin)

#### Step 3: Create Database
After installation, open PowerShell:

```powershell
# Option A: Using psql command line
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
# Enter password when prompted
# Then run:
CREATE DATABASE saasdb;
\q

# Option B: Using pgAdmin (GUI)
# 1. Open pgAdmin (Start Menu)
# 2. Connect to localhost server
# 3. Right-click "Databases" → Create → Database
# 4. Name: saasdb
```

---

### Option 2: Use Docker PostgreSQL (Fast Setup)

```powershell
# Install Docker Desktop first: https://www.docker.com/products/docker-desktop/

# Then run:
docker run --name postgres-saas `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=saasdb `
  -p 5432:5432 `
  -d postgres:16

# Check if running:
docker ps

# Stop when done:
docker stop postgres-saas

# Start again later:
docker start postgres-saas
```

---

### Option 3: Use SQLite (No Installation Required)

If you want to skip PostgreSQL for now and test the crypto system immediately:

```powershell
# 1. Update backend/prisma/schema.prisma
# Change line 7 from:
#   provider = "postgresql"
# To:
#   provider = "sqlite"

# 2. Update backend/.env
# Change DATABASE_URL from:
#   DATABASE_URL="postgresql://postgres:password@localhost:5432/saasdb"
# To:
#   DATABASE_URL="file:./dev.db"

# 3. Run migration:
cd backend
npx prisma migrate dev --name add_crypto_system
```

---

## After Database is Running

### Step 1: Test Connection
```powershell
cd backend
npx prisma db pull
```

If successful, you'll see: "Introspected 0 models..."

### Step 2: Run Migration
```powershell
npx prisma migrate dev --name add_crypto_system
```

This creates:
- ✅ AdminSettings table
- ✅ CryptoOrder table
- ✅ CryptoWithdrawal table
- ✅ Updates User table (adds usdBalance, role)

### Step 3: Generate Prisma Client
```powershell
npx prisma generate
```

### Step 4: Configure Crypto System
```powershell
cd ..
.\Setup-CryptoSystem.ps1
```

---

## Troubleshooting

### "Can't reach database server"
- PostgreSQL service not running
- Check: Services → PostgreSQL (should be "Running")
- Or in PowerShell: `Get-Service postgresql*`

### "Authentication failed"
- Password in .env doesn't match PostgreSQL password
- Update backend/.env with correct password

### "Database saasdb does not exist"
- Create database first (see Step 3 above)

### Port 5432 already in use
- Another PostgreSQL instance is running
- Check: `netstat -ano | Select-String ":5432"`

---

## Quick Check Commands

```powershell
# Check if PostgreSQL is installed
Get-Service postgresql*

# Check if port 5432 is listening
netstat -ano | Select-String ":5432" | Select-String "LISTEN"

# Test database connection (if psql installed)
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d saasdb -c "SELECT version();"
```

---

## My Recommendation

**For Quick Testing:** Use SQLite (Option 3)
- No installation required
- Works immediately
- Good for development

**For Production:** Use PostgreSQL (Option 1)
- More robust
- Better performance
- Industry standard

**Fastest Setup:** Docker (Option 2)
- One command to start
- Isolated environment
- Easy to reset

---

## What's Next?

Once database is running:
1. ✅ Run migration: `npx prisma migrate dev`
2. ✅ Configure crypto settings: `.\Setup-CryptoSystem.ps1`
3. ✅ Start backend: `cd backend && npm run dev`
4. ✅ Access admin panel: `http://localhost:3000/admin/crypto`

---

## Need Help?

If you're stuck:
1. Choose SQLite for immediate testing (easiest)
2. Or follow PostgreSQL installation (15 minutes)
3. Or use Docker if you have it (5 minutes)

Let me know which option you prefer!
