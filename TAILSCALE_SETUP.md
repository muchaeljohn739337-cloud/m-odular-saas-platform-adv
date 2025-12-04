# Tailscale VPN Setup for Advancia Pay Ledger

## Overview
Secure your Advancia Pay Ledger infrastructure with Tailscale VPN for zero-trust networking, encrypted connections, and private access to admin services.

## Installation

### Ubuntu/WSL
```bash
# Add Tailscale repository
curl -fsSL https://tailscale.com/install.sh | sh

# Start Tailscale
sudo tailscale up

# Verify installation
tailscale status
tailscale ip -4
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

## Next Steps

1. Install Tailscale on your WSL: `curl -fsSL https://tailscale.com/install.sh | sh`
2. Implement middleware: See `backend/src/middleware/tailscale.ts`
3. Update Dad Console routes to require VPN
4. Test access from authorized devices
5. Deploy to production with auth keys

---

**Status**: Ready for implementation
**Priority**: HIGH (for Dad Console security)
**Estimated Setup Time**: 30 minutes
