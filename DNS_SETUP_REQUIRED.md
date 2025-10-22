# DNS Setup Guide for advanciapayledger.com

## 🎯 Current Status

❌ **Nameservers NOT yet updated** (DNS lookup timed out)
⏳ **Action Required**: Update nameservers at your domain registrar

---

## 📋 What You Need to Do

### Step 1: Find Your Domain Registrar

Where did you register `advanciapayledger.com`?

Common registrars:

- **GoDaddy** (godaddy.com)
- **Namecheap** (namecheap.com)
- **Google Domains** (domains.google.com)
- **Cloudflare Registrar** (dash.cloudflare.com/domains)
- **Name.com**
- **Hover**
- Others

### Step 2: Login to Your Registrar

Go to your domain registrar's website and login to your account.

### Step 3: Update Nameservers

Look for:

- "DNS Settings" or
- "Nameservers" or
- "Domain Management" or
- "Manage DNS"

**Replace** current nameservers with Cloudflare's nameservers:

```
dom.ns.cloudflare.com
monroe.ns.cloudflare.com
```

### Step 4: Save Changes

Click "Save" or "Update Nameservers"

### Step 5: Wait for Propagation

- **Typical time**: 2-4 hours
- **Maximum time**: 24-48 hours
- **Check status**: https://www.whatsmydns.net/#NS/advanciapayledger.com

---

## 📊 Example: Common Registrars

### GoDaddy:

1. Login to GoDaddy
2. Go to: **My Products** → **Domains** → **advanciapayledger.com**
3. Click: **Manage DNS**
4. Scroll to **Nameservers**
5. Click: **Change**
6. Select: **Custom**
7. Enter:
   - `dom.ns.cloudflare.com`
   - `monroe.ns.cloudflare.com`
8. Click: **Save**

### Namecheap:

1. Login to Namecheap
2. Go to: **Domain List** → **Manage** (next to advanciapayledger.com)
3. Find: **Nameservers** section
4. Select: **Custom DNS**
5. Enter:
   - `dom.ns.cloudflare.com`
   - `monroe.ns.cloudflare.com`
6. Click: **✓** (checkmark) to save

### Cloudflare Registrar:

1. Go to: https://dash.cloudflare.com/domains
2. Select: **advanciapayledger.com**
3. Nameservers are **automatic** (already set)

### Google Domains:

1. Login to Google Domains
2. Select: **advanciapayledger.com**
3. Click: **DNS** in left sidebar
4. Click: **Custom name servers**
5. Enter:
   - `dom.ns.cloudflare.com`
   - `monroe.ns.cloudflare.com`
6. Click: **Save**

---

## 🧪 How to Check If It's Working

### Method 1: Online Tool

Visit: https://www.whatsmydns.net/#NS/advanciapayledger.com

**Expected Result**: Should show `dom.ns.cloudflare.com` and `monroe.ns.cloudflare.com`

### Method 2: PowerShell Command

```powershell
nslookup -type=NS advanciapayledger.com 8.8.8.8
```

**Expected Output**:

```
advanciapayledger.com nameserver = dom.ns.cloudflare.com
advanciapayledger.com nameserver = monroe.ns.cloudflare.com
```

### Method 3: Cloudflare Dashboard

Go to: https://dash.cloudflare.com/74ecde4d46d4b399c7295cf599d2886b

If nameservers are active, you'll see:

- ✅ **Status**: Active
- ✅ Banner changes from "Complete your nameserver setup" to site metrics

---

## ⚡ What Happens After Nameservers Are Updated?

### Automatic (Cloudflare handles):

1. ✅ SSL/TLS certificate provisioned automatically
2. ✅ Basic DNS records created
3. ✅ CDN and security features activated
4. ✅ Dashboard shows "Active" status

### Manual (You need to do):

1. Add custom domain to Worker:

   ```powershell
   cd frontend
   npx wrangler domains add advanciapayledger.com
   ```

2. Verify domain works:
   ```powershell
   curl https://advanciapayledger.com
   ```

---

## 🚨 Common Issues

### Issue: "I don't remember my registrar"

**Solution**: Use WHOIS lookup:

```powershell
nslookup -type=SOA advanciapayledger.com
```

Or visit: https://who.is/whois/advanciapayledger.com

### Issue: "Registrar won't let me change nameservers"

**Possible causes**:

- Domain is locked (unlock it first)
- Domain recently transferred (wait 60 days)
- Registrar requires 2FA verification

**Solution**: Contact your registrar's support

### Issue: "Changes not propagating after 48 hours"

**Solution**:

- Clear your DNS cache: `ipconfig /flushdns` (Windows)
- Check with different DNS servers (8.8.8.8, 1.1.1.1)
- Contact Cloudflare support if still failing

---

## 📝 Summary

| Step                        | Status      | Action                                              |
| --------------------------- | ----------- | --------------------------------------------------- |
| 1. Add domain to Cloudflare | ✅ Done     | Complete                                            |
| 2. Get nameservers          | ✅ Done     | `dom.ns.cloudflare.com`, `monroe.ns.cloudflare.com` |
| 3. Update at registrar      | ⏳ **TODO** | **You need to do this manually**                    |
| 4. Wait for propagation     | ⏳ Pending  | 2-48 hours after step 3                             |
| 5. Add to Worker            | ⏳ Pending  | After step 4 completes                              |

---

## 🎯 Next Steps

1. **NOW**: Update nameservers at your domain registrar
2. **Wait**: Check propagation status periodically
3. **After DNS active**: Add custom domain to Worker
4. **Test**: Visit https://advanciapayledger.com

---

**Need Help?**

- Check registrar's help docs: "[Registrar name] change nameservers"
- Cloudflare guide: https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/

**Last Updated**: October 21, 2025
