# ☁️ Cloudflare Configuration Guide

## Current Setup
Your backend is configured to run on `localhost:4000`, but you mentioned using a Cloudflare gateway/tunnel.

## What You Need

### 1. Cloudflare Tunnel URL
If you're using Cloudflare Tunnel (formerly Argo Tunnel), you should have a URL like:
- `https://your-tunnel-name.trycloudflare.com`
- `https://your-custom-domain.com`

### 2. Update Environment Variables

#### Backend (.env)
```bash
PORT=4000
FRONTEND_URL=https://your-frontend-domain.com  # or http://localhost:3000 for local dev
NODE_ENV=development

# Add your Cloudflare tunnel URL
CLOUDFLARE_TUNNEL_URL=https://your-backend-tunnel.trycloudflare.com
```

#### Frontend (.env.local)
```bash
# Point to your Cloudflare tunnel instead of localhost
NEXT_PUBLIC_API_URL=https://your-backend-tunnel.trycloudflare.com

# Or keep localhost for local development
# NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Option 1: Using Cloudflare Tunnel for Backend

### Install Cloudflare Tunnel
```powershell
# Download cloudflared
winget install --id Cloudflare.cloudflared

# Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Start Tunnel
```powershell
# Quick tunnel (temporary, changes each time)
cloudflared tunnel --url http://localhost:4000

# Output will show: https://random-name.trycloudflare.com
# Use this URL in your frontend's NEXT_PUBLIC_API_URL
```

### Permanent Tunnel (Recommended)
```powershell
# Login to Cloudflare
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create advancia-backend

# Configure the tunnel
# Create config file: C:\Users\YourUser\.cloudflared\config.yml
```

Example `config.yml`:
```yaml
tunnel: advancia-backend
credentials-file: C:\Users\YourUser\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:4000
  - service: http_status:404
```

### Route DNS
```powershell
cloudflared tunnel route dns advancia-backend api.yourdomain.com
```

### Run Tunnel
```powershell
cloudflared tunnel run advancia-backend
```

## Option 2: Direct Local Access (No Tunnel)

### Backend on localhost:4000
```bash
# Backend listens on all interfaces
# In backend/src/index.ts, ensure:
app.listen(4000, '0.0.0.0', () => { ... })
```

### Check Firewall
```powershell
# Allow Node.js through Windows Firewall
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow

# Or disable firewall temporarily for testing
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

## Option 3: Using ngrok (Alternative to Cloudflare)

```powershell
# Install ngrok
winget install --id=ngrok.ngrok

# Start tunnel
ngrok http 4000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Update frontend .env.local with this URL
```

## Current Issue Analysis

Based on your backend logs:
```
✅ Server successfully bound to port 4000
🔍 Debug: Server address info: { address: '::', family: 'IPv6', port: 4000 }
```

The backend is listening on **IPv6 only** (`::` instead of `0.0.0.0`).

### Fix: Listen on IPv4
```typescript
// In backend/src/index.ts
// Change from:
app.listen(4000)

// To:
app.listen(4000, '0.0.0.0', () => {
  console.log('✅ Server listening on all interfaces (IPv4 + IPv6)');
})
```

## Testing Steps

### 1. Test Backend Directly
```powershell
# If using Cloudflare tunnel
Invoke-WebRequest -Uri "https://your-tunnel.trycloudflare.com/api/health"

# If using localhost
Invoke-WebRequest -Uri "http://127.0.0.1:4000/api/health"
```

### 2. Update Test Scripts
Use the scripts I created but update the URLs:
```powershell
# Edit test-health.ps1 and quick-test.ps1
# Replace: http://localhost:4000
# With: https://your-cloudflare-tunnel.trycloudflare.com
```

### 3. Run Tests
```powershell
.\test-health.ps1
.\quick-test.ps1
```

## What's Your Setup?

Please provide:
1. **Do you have a Cloudflare tunnel URL?** (e.g., https://xyz.trycloudflare.com)
2. **Or do you want to set one up now?**
3. **Or should we fix the IPv4 binding issue for direct localhost access?**

Let me know and I'll update the configuration accordingly!
