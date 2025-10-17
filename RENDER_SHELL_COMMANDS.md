# Copy-Paste This Command in Your Render Shell

You're currently in Render shell at: `render@srv-d3p5jg1r0fns73e2vqc0-7f885d6598-cpmrj:~/project$`

## Right Now: Run This Command

```bash
cd ~/project/backend && echo "=== Directory Listing ===" && ls -la prisma/ 2>&1 && echo -e "\n=== Checking for schema.prisma ===" && [ -f prisma/schema.prisma ] && echo "✅ SCHEMA FILE EXISTS!" || echo "❌ SCHEMA FILE NOT FOUND - Render needs to redeploy"
```

**This will tell you:**
- If schema file exists in current Render deployment
- If not, you need to trigger redeploy in Render Dashboard

---

## If Schema File DOES Exist:

```bash
cd ~/project/backend && npx prisma migrate deploy
```

This will create all database tables. You should see output like:
```
✔ Successfully applied 3 migrations
```

---

## If Schema File DOES NOT Exist:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **advancia-backend** service
3. Click the **"..." menu** → **"Redeploy latest commit"**
4. Wait 2-3 minutes
5. Come back to this shell and run the command above again

---

## After Migrations Run Successfully:

Test that everything works:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }' && echo -e "\n✅ Registration endpoint works!"
```

---

**That's it! These three simple steps should fix everything.**

