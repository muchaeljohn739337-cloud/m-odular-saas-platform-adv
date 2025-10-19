# ☁️ Cloudflare Setup Guide for Ethereum Features

**Date**: October 18, 2025  
**Purpose**: Configure Cloudflare for Ethereum gateway integration  
**Platform**: Advancia Pay Ledger

---

## 🎯 WHAT NEEDS TO BE DONE IN CLOUDFLARE

### Option 1: Use Cloudflare's Ethereum Gateway (Recommended)
### Option 2: Use Cloudflare Tunnel for Your Backend
### Option 3: Use Cloudflare DNS + Web3 Gateway

---

## 📋 OPTION 1: CLOUDFLARE ETHEREUM GATEWAY (EASIEST)

Cloudflare provides a free Ethereum RPC gateway that you can use directly!

### Step 1: Use Cloudflare's Public Ethereum Gateway
```bash
# Already configured in your .env:
ETH_PROVIDER_URL=https://cloudflare-eth.com
```

**Available Endpoints**:
- **Mainnet**: `https://cloudflare-eth.com`
- **Sepolia Testnet**: `https://cloudflare-eth.com/v1/sepolia`
- **Goerli Testnet**: `https://cloudflare-eth.com/v1/goerli`

### Step 2: Test the Connection
```powershell
# Test if Cloudflare gateway is accessible
curl -X POST https://cloudflare-eth.com `
  -H "Content-Type: application/json" `
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Expected Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x11a8b2f"  // Current block number in hex
}
```

### ✅ Advantages:
- ✅ Free to use
- ✅ No account required
- ✅ Fast and reliable
- ✅ Global CDN
- ✅ Already working in your code!

### ⚠️ Limitations:
- Rate limited (but generous for development)
- No guaranteed SLA
- Shared infrastructure

---

## 📋 OPTION 2: CLOUDFLARE TUNNEL (FOR YOUR BACKEND)

If you want to expose your backend API (localhost:4000) to the internet via Cloudflare Tunnel:

### Step 1: Install Cloudflare Tunnel (cloudflared)
```powershell
# Using winget (Windows Package Manager)
winget install --id Cloudflare.cloudflared

# Or download from:
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Step 2: Login to Cloudflare
```powershell
cloudflared tunnel login
```
This will:
- Open a browser
- Ask you to select your Cloudflare account
- Download a certificate to `C:\Users\YourUser\.cloudflared\cert.pem`

### Step 3: Create a Tunnel
```powershell
# Create a named tunnel
cloudflared tunnel create advancia-backend

# Output will show:
# Created tunnel advancia-backend with id: xxxx-xxxx-xxxx-xxxx
# Copy the tunnel ID!
```

### Step 4: Configure the Tunnel
Create config file: `C:\Users\mucha.DESKTOP-H7T9NPM\.cloudflared\config.yml`

```yaml
tunnel: advancia-backend
credentials-file: C:\Users\mucha.DESKTOP-H7T9NPM\.cloudflared\<tunnel-id>.json

ingress:
  # Route api.advancia.com to your backend
  - hostname: api.advancia.com
    service: http://localhost:4000
  
  # Route eth-gateway.advancia.com to backend /api/eth
  - hostname: eth-gateway.advancia.com
    service: http://localhost:4000
    originRequest:
      noTLSVerify: true
  
  # Catch-all rule (required)
  - service: http_status:404
```

### Step 5: Route DNS
```powershell
# Route your domain to the tunnel
cloudflared tunnel route dns advancia-backend api.advancia.com
cloudflared tunnel route dns advancia-backend eth-gateway.advancia.com
```

### Step 6: Run the Tunnel
```powershell
# Run tunnel (foreground - for testing)
cloudflared tunnel run advancia-backend

# Or run as background service (Windows)
cloudflared service install
cloudflared service start
```

### Step 7: Test Your Tunnel
```powershell
# Test backend via Cloudflare tunnel
Invoke-RestMethod -Uri "https://api.advancia.com/api/health"

# Test Ethereum gateway via tunnel
Invoke-RestMethod -Uri "https://eth-gateway.advancia.com/api/eth/health"
```

### ✅ Advantages:
- ✅ Your backend is accessible from anywhere
- ✅ Free SSL/TLS certificates
- ✅ DDoS protection
- ✅ No need to open firewall ports
- ✅ Works behind NAT/firewalls

---

## 📋 OPTION 3: CLOUDFLARE DNS + WEB3 GATEWAY

Use Cloudflare DNS to point to your custom Ethereum node or third-party provider.

### Step 1: Login to Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Select your domain (advancia.com)
3. Click "DNS"

### Step 2: Add DNS Records
```
Type: CNAME
Name: eth-gateway
Target: cloudflare-eth.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

Or if using your own Ethereum node:
```
Type: A
Name: eth-gateway
IPv4 address: <your-node-ip>
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### Step 3: Configure Page Rules (Optional)
1. Go to "Rules" > "Page Rules"
2. Create rule for `eth-gateway.advancia.com/*`
3. Settings:
   - **Cache Level**: Bypass
   - **SSL**: Full (strict)
   - **Always Use HTTPS**: On

### Step 4: Update Your .env
```bash
ETH_PROVIDER_URL=https://eth-gateway.advancia.com
```

---

## 🚀 RECOMMENDED SETUP FOR PRODUCTION

### For Development (Current Setup):
```bash
# .env
ETH_PROVIDER_URL=https://cloudflare-eth.com
NEXT_PUBLIC_API_URL=http://localhost:4000
```
- ✅ No Cloudflare account needed
- ✅ Works immediately
- ✅ Perfect for testing

### For Production (Recommended):
```bash
# backend/.env
ETH_PROVIDER_URL=https://cloudflare-eth.com  # Or your own node
PORT=4000
NODE_ENV=production

# frontend/.env.production
NEXT_PUBLIC_API_URL=https://api.advancia.com  # Via Cloudflare Tunnel
```

**Why this setup?**
- ✅ Backend exposed via Cloudflare Tunnel (secure)
- ✅ Ethereum gateway via Cloudflare (fast)
- ✅ SSL/TLS automatically handled
- ✅ DDoS protection included
- ✅ Global CDN for performance

---

## 🔧 STEP-BY-STEP: QUICKSTART GUIDE

### For Immediate Testing (No Cloudflare Setup Needed):

**1. Your current setup is already working!**
```bash
ETH_PROVIDER_URL=https://cloudflare-eth.com
```

**2. Start your backend:**
```powershell
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend
npx ts-node-dev --respawn --transpile-only src/index.ts
```

**3. Test Ethereum features:**
```powershell
# Get ETH balance
Invoke-RestMethod http://localhost:4000/api/eth/balance/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

# Get gas price
Invoke-RestMethod http://localhost:4000/api/eth/gas-price

# Check gateway health
Invoke-RestMethod http://localhost:4000/api/eth/health
```

**4. Build your ETH features!**
- ✅ You can now use all `/api/eth/*` endpoints
- ✅ Ethereum data is coming from Cloudflare
- ✅ No additional setup needed for development

---

## 📊 WHAT CLOUDFLARE PROVIDES

### 1. **Ethereum RPC Gateway**
- Access to Ethereum mainnet
- JSON-RPC interface
- eth_getBalance, eth_blockNumber, etc.
- Free tier available

### 2. **Cloudflare Tunnel**
- Expose localhost to internet
- Free SSL certificates
- DDoS protection
- No open ports needed

### 3. **DNS Management**
- Custom domains (eth-gateway.advancia.com)
- Fast DNS resolution
- DNSSEC support

### 4. **CDN & Caching**
- Global content delivery
- Automatic caching
- Better performance

### 5. **Security**
- DDoS protection
- Web Application Firewall (WAF)
- Rate limiting
- SSL/TLS encryption

---

## 🎯 WHAT YOU NEED TO DO NOW

### Immediate (For Development):
- ✅ **NOTHING!** Your setup already works with Cloudflare's gateway
- ✅ Just start building ETH features using the API endpoints

### For Production Deployment:
1. **Get a domain** (e.g., advancia.com)
2. **Add domain to Cloudflare** (free account)
3. **Set up Cloudflare Tunnel** (see Option 2 above)
4. **Configure DNS records** (eth-gateway.advancia.com → Cloudflare ETH)
5. **Update environment variables** to use tunneled URLs

---

## 🔐 SECURITY CHECKLIST

### For Ethereum Features:
- [x] Use HTTPS for all Ethereum RPC calls (Cloudflare provides this)
- [ ] Never expose private keys in frontend
- [ ] Implement rate limiting on withdrawal endpoints
- [ ] Add 2FA for ETH withdrawals
- [ ] Validate all addresses before transactions
- [ ] Set withdrawal limits
- [ ] Log all ETH transactions
- [ ] Monitor for suspicious activity

### For Cloudflare Tunnel:
- [ ] Keep tunnel credentials secure
- [ ] Don't commit `config.yml` to Git
- [ ] Use environment-specific tunnels (dev/prod)
- [ ] Monitor tunnel logs
- [ ] Set up alerts for downtime

---

## 📚 USEFUL CLOUDFLARE RESOURCES

### Documentation:
- **Ethereum Gateway**: https://developers.cloudflare.com/web3/ethereum-gateway/
- **Cloudflare Tunnel**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **DNS Management**: https://developers.cloudflare.com/dns/

### Quick Links:
- **Dashboard**: https://dash.cloudflare.com
- **Tunnel Download**: https://github.com/cloudflare/cloudflared/releases
- **Support**: https://community.cloudflare.com/

---

## 🎉 SUMMARY

**What you need to do in Cloudflare: NOTHING for now!**

Your current setup:
```bash
ETH_PROVIDER_URL=https://cloudflare-eth.com  ✅ Already configured
```

**This gives you:**
- ✅ Access to Ethereum mainnet
- ✅ Real-time blockchain data
- ✅ All the ETH features you just built
- ✅ Fast, reliable connection via Cloudflare

**For production later:**
1. Create Cloudflare account (free)
2. Add your domain
3. Set up Cloudflare Tunnel (optional)
4. Configure DNS for custom domains

**You can start building ETH features RIGHT NOW!** 🚀

---

## 💡 NEXT STEPS

1. **Test the Ethereum gateway** (already works!)
   ```powershell
   .\test-eth-gateway.ps1
   ```

2. **Build your first ETH feature**
   - Add ETH balance to dashboard
   - Show real-time gas prices
   - Display transaction history

3. **When ready for production**
   - Follow "Option 2: Cloudflare Tunnel" guide above
   - Configure custom domains
   - Set up monitoring

**For now, focus on building features! Cloudflare setup is done! ✅**
