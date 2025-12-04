# Tailscale VPN Integration - Quick Reference

## Installation

```bash
# Ubuntu/WSL
bash scripts/install-tailscale.sh

# Or manual
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

## Configuration

Add to `backend/.env`:
```bash
TAILSCALE_ENABLED=true
TAILSCALE_ADMIN_IPS=100.64.0.1,100.64.0.5
```

## Protected Endpoints

- `/api/dad/*` - Dad Admin Console (VPN required)
- `/api/tailscale/*` - Tailscale admin routes (VPN required)
- Emergency shutdown endpoints (VPN required)

## Usage

```bash
# Get your Tailscale IP
tailscale ip -4

# Check status
tailscale status

# Test access
curl http://localhost:4000/api/tailscale/health
```

## Benefits

- ✅ Zero-trust security for admin endpoints
- ✅ No public exposure of Dad Console
- ✅ Encrypted connections automatically
- ✅ Works across networks (home, office, mobile)
- ✅ Simple device authorization

## Admin Console

https://login.tailscale.com/admin

## Full Documentation

See `TAILSCALE_SETUP.md` for complete guide.
