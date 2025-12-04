# 🔐 Tailscale VPN Setup for Advancia Pay Ledger

## Overview
Secure your Advancia Pay Ledger infrastructure with Tailscale VPN for zero-trust networking, encrypted peer-to-peer connections, and private access to admin services. **FREE for personal use** (up to 100 devices).

---

## ⚠️ Network Connectivity Issue Detected

If curl/wget commands hang or fail, you may be behind a restrictive firewall or proxy. Try these alternatives:

### Option A: Use Package Manager (If curl fails)
```bash
# For Ubuntu 24.04 (Noble)
sudo apt-get update
sudo apt-cache search tailscale
sudo apt-get install -y tailscale

# If package not found, manually download
wget https://pkgs.tailscale.com/stable/tailscale_1.56.1_amd64.deb
sudo dpkg -i tailscale_1.56.1_amd64.deb
```

### Option B: Windows WSL with Network Bridge
If running in WSL and having network issues:
```bash
# In WSL, use Windows Tailscale client
# Install Tailscale on Windows host, then:
export TAILSCALE_USE_WS_RELAY=1
```

---

## 🚀 Quick Installation (When Network Works)

### Ubuntu/WSL (Recommended for Development)
```bash
# Method 1: One-line install (easiest)
curl -fsSL https://tailscale.com/install.sh | sh

# Method 2: APT repository (more control)
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/noble.noarmor.gpg | \
  sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/noble.tailscale-keyring.list | \
  sudo tee /etc/apt/sources.list.d/tailscale.list
sudo apt-get update
sudo apt-get install -y tailscale

# Start Tailscale and authenticate
sudo tailscale up

# Verify installation
tailscale status
tailscale ip -4
echo "Your Tailscale IP: $(tailscale ip -4)"
```

### Windows (Host Machine)
1. Download: https://tailscale.com/download/windows
2. Install and sign in
3. Your devices will auto-connect

## Use Cases for Advancia Platform

### 1. Secure Dad Console Access
Restrict Dad Admin Console to Tailscale VPN only:
- Only authorized admins can access `/api/dad/*`
- No public exposure of sensitive admin endpoints
- Emergency kill-switch accessible only via VPN

### 2. Private Database Connections
Connect to PostgreSQL without exposing it publicly:
- Database accessible only via Tailscale network
- No need for public IP whitelisting
- Encrypted connections automatically

### 3. Development Team Collaboration
Share local dev environment securely:
- Team members access your local backend
- No need for ngrok/tunneling services
- Persistent URLs: `https://your-machine.tailnet.ts.net`

### 4. Multi-Service Communication
Connect backend, frontend, and database privately:
- Render backend ↔ Vercel frontend via Tailscale
- Socket.IO events over private network
- No CORS issues on private IPs

## Quick Start

### Step 1: Install on All Devices
```bash
# On your development machine (WSL)
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# On production server (Render)
# Add to backend/Dockerfile:
RUN curl -fsSL https://tailscale.com/install.sh | sh
```

### Step 2: Get Your Tailscale IPs
```bash
# Your development machine
tailscale ip -4
# Output: 100.64.0.1

# Your production server
tailscale ip -4
# Output: 100.64.0.2
```

### Step 3: Update Environment Variables
```bash
# backend/.env
TAILSCALE_ENABLED=true
TAILSCALE_ADMIN_IPS=100.64.0.1,100.64.0.5
DATABASE_URL=postgresql://user:pass@100.64.0.3:5432/advancia
```

## Integration with Mom-Shield-Dad

### Security Layer: Tailscale VPN Check
Adds VPN requirement for sensitive endpoints.

See: `backend/src/middleware/tailscale.ts`

### Dad Console Protection
```typescript
// Only allow Dad Console access via Tailscale
app.use('/api/dad', requireTailscaleAccess, dadConsoleRouter);
```

### Database Security
```typescript
// Connect to database via Tailscale private IP
DATABASE_URL=postgresql://user:pass@100.x.x.x:5432/advancia
```

## Advanced Configuration

### Access Control Lists (ACLs)
Create fine-grained access rules:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["tag:admin"],
      "dst": ["tag:dad-console:*"]
    },
    {
      "action": "accept",
      "src": ["tag:backend"],
      "dst": ["tag:database:5432"]
    },
    {
      "action": "accept",
      "src": ["tag:developers"],
      "dst": ["tag:backend:4000"]
    }
  ],
  "tagOwners": {
    "tag:admin": ["admin@advanciapayledger.com"],
    "tag:developers": ["dev@advanciapayledger.com"],
    "tag:backend": ["autogroup:admin"],
    "tag:database": ["autogroup:admin"],
    "tag:dad-console": ["autogroup:admin"]
  }
}
```

Apply ACLs at: https://login.tailscale.com/admin/acls

### Exit Nodes
Route all traffic through secure node:

```bash
# On exit node (secure server)
sudo tailscale up --advertise-exit-node

# On client devices
sudo tailscale up --exit-node=100.x.x.x
```

### Subnet Routing
Share entire network segments:

```bash
# Advertise internal network
sudo tailscale up --advertise-routes=10.0.0.0/24

# Accept routes on client
sudo tailscale up --accept-routes
```

## Production Deployment

### Render Backend
Add to `render.yaml`:
```yaml
services:
  - type: web
    name: advancia-backend
    env: node
    buildCommand: npm install && curl -fsSL https://tailscale.com/install.sh | sh
    startCommand: |
      sudo tailscale up --authkey=$TAILSCALE_AUTH_KEY --advertise-tags=tag:backend
      npm start
    envVars:
      - key: TAILSCALE_AUTH_KEY
        sync: false
      - key: TAILSCALE_ENABLED
        value: true
```

### Generate Auth Keys
1. Go to: https://login.tailscale.com/admin/settings/keys
2. Create reusable auth key with tag `backend`
3. Add to Render environment variables

## Monitoring & Troubleshooting

### Check Connection Status
```bash
# View all devices
tailscale status

# Test connectivity
ping 100.x.x.x

# View logs
sudo journalctl -u tailscaled
```

### Common Issues

**Issue**: `sudo tailscale up` hangs
**Solution**: 
```bash
sudo systemctl restart tailscaled
sudo tailscale up
```

**Issue**: Can't access other devices
**Solution**: Check ACLs and ensure devices are on same tailnet

**Issue**: DNS not working
**Solution**: 
```bash
sudo tailscale up --accept-dns
```

## Security Best Practices

1. **Use Tags**: Organize devices by role (admin, backend, database)
2. **Enable MagicDNS**: Access devices by name instead of IP
3. **Rotate Auth Keys**: Regenerate keys quarterly
4. **Monitor Access**: Review audit logs at https://login.tailscale.com/admin/audit
5. **Multi-Factor Auth**: Enable 2FA for Tailscale account
6. **Key Expiry**: Set auth keys to expire after 90 days

## Useful Commands

```bash
# Status and devices
tailscale status

# Your Tailscale IPs
tailscale ip

# Enable file sharing
tailscale file cp myfile.txt 100.x.x.x:

# Receive files
tailscale file get

# Access by hostname (requires MagicDNS)
ping my-server-name

# Serve local dev server
tailscale serve https / http://localhost:4000

# Temporarily disable
sudo tailscale down

# Logout and remove from network
sudo tailscale logout
```

## Integration Checklist

- [ ] Install Tailscale on development machine
- [ ] Install Tailscale on production servers
- [ ] Configure ACLs for role-based access
- [ ] Update DATABASE_URL to use Tailscale IP
- [ ] Protect Dad Console with VPN middleware
- [ ] Add Tailscale checks to SHIELD security layer
- [ ] Configure exit nodes for secure routing
- [ ] Enable MagicDNS for easy device naming
- [ ] Set up monitoring and alerts
- [ ] Document team access procedures

## Resources

- **Tailscale Admin Console**: https://login.tailscale.com/admin
- **Documentation**: https://tailscale.com/kb
- **Status Page**: https://status.tailscale.com
- **Support**: support@tailscale.com

## 🎯 Step-by-Step Setup for Advancia Pay Ledger

### Step 1: Install Tailscale on Development Machine

```bash
# On Ubuntu/WSL
curl -fsSL https://tailscale.com/install.sh | sh

# Start Tailscale (opens browser for auth)
sudo tailscale up

# Get your Tailscale IP
tailscale ip -4
# Example output: 100.64.0.1

# Check status
tailscale status
```

### Step 2: Install on Production Server (Render)

Add to `backend/Dockerfile` before the final CMD:

```dockerfile
# Install Tailscale
RUN curl -fsSL https://tailscale.com/install.sh | sh

# Start Tailscale in container
RUN tailscale up --authkey=${TAILSCALE_AUTH_KEY}
```

Or use environment variables in Render dashboard:

```bash
TAILSCALE_AUTH_KEY=tskey-auth-xxxxx
TAILSCALE_ENABLED=true
```

### Step 3: Configure Access Control (ACLs)

Go to https://login.tailscale.com/admin/acls and add:

```json
{
  "acls": [
    {
      "action": "accept",
      "users": ["admin@yourdomain.com"],
      "ports": ["*:*"]
    },
    {
      "action": "accept",
      "users": ["team@yourdomain.com"],
      "ports": ["*:4000", "*:5432"]
    }
  ]
}
```

### Step 4: Update Backend Configuration

```bash
# backend/.env
TAILSCALE_ENABLED=true
TAILSCALE_ADMIN_IPS=100.64.0.1,100.64.0.2
DATABASE_URL=postgresql://user:pass@100.64.0.3:5432/advancia
```

### Step 5: Test Connection

```bash
# From your dev machine, ping production server
ping 100.64.0.2

# Access backend API via Tailscale
curl http://100.64.0.2:4000/api/health

# SSH to production server via Tailscale
ssh user@100.64.0.2
```

### Step 6: Enable MagicDNS (Optional but Recommended)

```bash
# Enable in admin console or via CLI
sudo tailscale up --accept-dns

# Now access by hostname instead of IP
curl http://advancia-backend:4000/api/health
```

---

## 🔧 Troubleshooting

### Issue: `tailscale: command not found`

```bash
# Reinstall Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Add to PATH if needed
export PATH=$PATH:/usr/sbin
echo 'export PATH=$PATH:/usr/sbin' >> ~/.bashrc
```

### Issue: `Failed to connect to tailscaled`

```bash
# Start the Tailscale daemon
sudo systemctl start tailscaled
sudo systemctl enable tailscaled

# Or in WSL
sudo service tailscaled start
```

### Issue: `Connection refused to Tailscale IP`

```bash
# Check if device is online
tailscale status

# Restart Tailscale
sudo tailscale down
sudo tailscale up

# Check firewall rules
sudo ufw status
sudo ufw allow from 100.64.0.0/10
```

### Issue: Can't access from other devices

```bash
# Check ACLs in admin console
tailscale status | grep "Logged in as"

# Verify device is approved
# Go to: https://login.tailscale.com/admin/machines
```

### Issue: WSL2 networking problems

```bash
# In Windows PowerShell (admin)
wsl --shutdown
# Restart WSL and Tailscale

# In WSL
sudo tailscale up --reset
```

---

## 📊 Monitoring & Management

### Check Connected Devices

```bash
# List all devices on your tailnet
tailscale status

# Get detailed info
tailscale netcheck

# View logs
sudo journalctl -u tailscaled -f
```

### Generate Auth Keys for Servers

```bash
# Go to: https://login.tailscale.com/admin/settings/keys
# Create a new auth key with these settings:
# - Reusable: Yes (for multiple servers)
# - Ephemeral: No (persistent connection)
# - Pre-authorized: Yes (no manual approval)
# - Expires: 90 days (or as needed)
```

### Revoke Access

```bash
# Via admin console
# Go to: https://login.tailscale.com/admin/machines
# Click device → Disable/Delete

# Or via CLI
tailscale logout
```

---

## 🐛 Troubleshooting Common Issues

### Worker Heartbeat Timeouts (Warning - Safe to Ignore)
```
⚠️  Worker crypto-worker-1 heartbeat timeout
⚠️  Worker ai-worker-1 heartbeat timeout
```
**Cause**: Workers haven't been started yet
**Solution**: These are informational warnings. Start workers if needed:
```bash
cd backend
npm run worker:start  # If you have a worker script
```
Or ignore - they're optional background services.

### Network Connection Hangs (curl/wget timeout)
**Symptoms**: Commands hang indefinitely when downloading Tailscale
**Solutions**:
1. Check firewall: `sudo ufw status`
2. Test basic connectivity: `ping 8.8.8.8`
3. Use alternative download method (see Option A above)
4. If in WSL: Install Tailscale on Windows host instead

### Port 4000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::4000
```
**Solution**:
```bash
# Find and kill the process
lsof -ti:4000 | xargs kill -9

# Or kill all node processes
pkill -f "ts-node-dev"
```

### Tailscale Service Won't Start in WSL
**Issue**: `sudo tailscale up` fails in WSL2
**Solution**: Use Windows Tailscale client + environment variable:
```bash
# In WSL
export TAILSCALE_USE_WS_RELAY=1
```

### Database Connection Issues After Installing Tailscale
**Symptom**: Can't connect to PostgreSQL
**Solution**: Ensure database allows Tailscale subnet:
```bash
# Add to postgresql.conf
listen_addresses = 'localhost,100.64.0.0/10'
```

---

## 🚀 Next Steps

1. **Install on Dev Machine**: `curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up`
2. **Create Auth Key**: https://login.tailscale.com/admin/settings/keys
3. **Deploy to Render**: Add `TAILSCALE_AUTH_KEY` environment variable
4. **Implement Middleware**: See `backend/src/middleware/tailscale.ts`
5. **Update Dad Console Routes**: Require VPN for `/api/dad/*`
6. **Test Access**: Verify from authorized devices only
7. **Configure ACLs**: Fine-tune access permissions
8. **Enable MagicDNS**: Use friendly hostnames
9. **Set Up Monitoring**: Track connections and access
10. **Document for Team**: Share access procedures

---

## 📚 Quick Reference Commands

```bash
# Start Tailscale
sudo tailscale up

# Stop Tailscale
sudo tailscale down

# Get your IP
tailscale ip -4

# Check status
tailscale status

# Test connection
ping $(tailscale ip -4)

# Serve local port
tailscale serve https / http://localhost:4000

# Generate QR code for mobile
tailscale up --qr

# Reset and re-authenticate
sudo tailscale up --reset

# View version
tailscale version

# Get help
tailscale --help
```

---

**Status**: ✅ Ready for implementation  
**Priority**: 🔥 HIGH (for Dad Console security)  
**Estimated Setup Time**: 30-45 minutes  
**Cost**: FREE (personal use, up to 100 devices)
