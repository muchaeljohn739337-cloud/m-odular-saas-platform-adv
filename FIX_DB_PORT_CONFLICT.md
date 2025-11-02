# Fix PostgreSQL Port 5432 Conflict

## Problem

```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```

Port 5432 is already in use by another process. This guide will help you resolve it.

## Quick Fix Options

### Option 1: Stop Existing PostgreSQL Service (Recommended)

**Check what's using port 5432:**

```powershell
# Find process using port 5432
netstat -ano | findstr :5432

# Output example:
# TCP    0.0.0.0:5432    0.0.0.0:0    LISTENING    1234
```

**Stop the PostgreSQL Windows service:**

```powershell
# Stop PostgreSQL service
Stop-Service postgresql*

# Or use Services GUI:
# 1. Press Win+R
# 2. Type: services.msc
# 3. Find "postgresql" service
# 4. Right-click → Stop
```

**Then restart your Docker container:**

```powershell
docker start advancia-postgres
```

---

### Option 2: Kill Process Using Port 5432

```powershell
# Find the PID (Process ID)
netstat -ano | findstr :5432

# Kill the process (replace 1234 with actual PID)
taskkill /PID 1234 /F

# Restart Docker container
docker start advancia-postgres
```

---

### Option 3: Use Different Port for Docker

If you can't stop the existing PostgreSQL, use a different port:

**1. Stop and remove existing container:**

```powershell
docker stop advancia-postgres
docker rm advancia-postgres
```

**2. Create new container on port 5433:**

```powershell
docker run --name advancia-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_DB=advancia_payledger `
  -p 5433:5432 `
  -d postgres:14
```

**3. Update DATABASE_URL in `backend/.env`:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/advancia_payledger"
```

**4. Regenerate Prisma Client:**

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
```

---

### Option 4: Check for Hidden PostgreSQL Instances

```powershell
# List all PostgreSQL processes
Get-Process postgres* -ErrorAction SilentlyContinue

# Stop all PostgreSQL processes
Get-Process postgres* | Stop-Process -Force

# Check Docker containers
docker ps -a | findstr postgres
```

---

## After Fixing

**Test database connection:**

```powershell
# Run verification again
.\run-all-verifications.ps1

# Or manually test connection
cd backend
npx prisma studio
```

**Expected result:**

- ✅ Container running on port 5432
- ✅ Database connection successful
- ✅ Prisma Client working

---

## Common Scenarios

### WSL + Windows PostgreSQL Conflict

If you have PostgreSQL installed in both WSL and Windows:

```powershell
# In Windows PowerShell:
Stop-Service postgresql*

# In WSL (if needed):
wsl
sudo service postgresql stop
exit
```

### Docker Desktop Not Starting Container

```powershell
# Remove problematic container
docker rm -f advancia-postgres

# Recreate from scratch
docker run --name advancia-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_DB=advancia_payledger `
  -p 5432:5432 `
  -v advancia-db-data:/var/lib/postgresql/data `
  -d postgres:14

# Verify
docker ps
```

---

## Verification Commands

```powershell
# 1. Check if port is free
netstat -ano | findstr :5432

# 2. Check Docker container status
docker ps | findstr advancia

# 3. Test database connection
cd backend
npx prisma db push

# 4. Run full verification
cd ..
.\run-all-verifications.ps1
```

---

## Notes

- **Option 1** is recommended if you're not using the existing PostgreSQL
- **Option 3** is safest if you need both PostgreSQL instances
- Always backup data before removing containers with volumes
- The Docker container uses a volume `advancia-db-data` for persistence
