# Cloudflare Post-Migration Setup Guide

**Status:** Domain added to Cloudflare ✅  
**Next Steps:** Configure DNS, Email, SSL, and Security

---

## 🎯 Step-by-Step Post-Migration Tasks

### Step 1: Update Nameservers at GoDaddy (Critical!)

Your domain is added to Cloudflare, but you need to point it there:

1. **Get Cloudflare Nameservers:**
   - Go to https://dash.cloudflare.com
   - Select `advancia.com`
   - Look for a banner saying "Complete your nameserver setup"
   - Copy the two nameservers (usually like):
     ```
     ns1.cloudflare.com
     ns2.cloudflare.com
     ```
     *(Your actual nameservers will be different)*

2. **Update at GoDaddy:**
   - Log into GoDaddy: https://dcc.godaddy.com/domains
   - Find `advancia.com`
   - Click **DNS** or **Manage DNS**
   - Scroll to **Nameservers** section
   - Click **Change**
   - Select **Custom** or **I'll use my own nameservers**
   - Remove GoDaddy nameservers
   - Add both Cloudflare nameservers
   - Click **Save**

3. **Wait for Activation:**
   - Can take 2-48 hours (usually 2-4 hours)
   - Cloudflare will email you when active
   - Check status at https://dash.cloudflare.com

---

### Step 2: Configure DNS Records in Cloudflare

Once nameservers are updated (or while waiting), set up your DNS:

#### A. Check Auto-Imported Records

Cloudflare should have imported your existing records:
- Main domain A records ✅
- www subdomain ✅
- MX (email) records ✅
- TXT records (SPF, DMARC) ✅

**Verify these in:** Cloudflare Dashboard → DNS → Records

#### B. Add Missing Subdomain Records

You need to add these for your backend API:

**Record 1: API Subdomain**
```
Type: CNAME
Name: api
Target: advancia-backend.onrender.com
Proxy status: Proxied (orange cloud) ☁️
TTL: Auto
```

**Record 2: ETH Gateway Subdomain**
```
Type: CNAME
Name: eth-gateway
Target: advancia-backend.onrender.com
Proxy status: Proxied (orange cloud) ☁️
TTL: Auto
```

**How to Add:**
1. Go to **DNS** → **Records**
2. Click **Add record**
3. Fill in the details above
4. Click **Save**

**Note:** The "Proxied" orange cloud enables Cloudflare's CDN, SSL, and protection.

---

### Step 3: Configure SSL/TLS Settings

Ensure secure HTTPS connections:

1. Go to **SSL/TLS** in Cloudflare dashboard
2. Set encryption mode to **Full (strict)**
   - This ensures end-to-end encryption
3. Enable **Always Use HTTPS**
   - SSL/TLS → Edge Certificates → Always Use HTTPS: ON
4. Enable **Automatic HTTPS Rewrites**
   - SSL/TLS → Edge Certificates → Automatic HTTPS Rewrites: ON
5. Enable **HTTP Strict Transport Security (HSTS)** (optional but recommended)
   - Max Age: 6 months
   - Include subdomains: ON
   - Preload: OFF (enable later after testing)

---

### Step 4: Set Up Cloudflare Email Routing

Now configure custom email addresses:

1. **Go to Email Routing:**
   - Dashboard → Email → Email Routing
   - Click **Get started** or **Enable Email Routing**

2. **Review DNS Records:**
   - Cloudflare will show MX records it needs to add
   - Click **Add records automatically** (recommended)
   - Or manually add:
     ```
     MX  @  isaac.mx.cloudflare.net  (priority 10)
     MX  @  linda.mx.cloudflare.net  (priority 20)
     MX  @  amir.mx.cloudflare.net   (priority 99)
     ```

3. **Add Destination Address:**
   - Click **Destination addresses**
   - Click **Add destination address**
   - Enter your personal email (e.g., `yourpersonal@gmail.com`)
   - Click **Send verification email**
   - Check your inbox and click verification link

4. **Create Custom Email Addresses:**

   Create these forwarding addresses:

   **Support Email:**
   ```
   Custom address: support@advancia.com
   Action: Send to your destination email
   Enabled: ON
   ```

   **Admin Email:**
   ```
   Custom address: admin@advancia.com
   Action: Send to your destination email
   Enabled: ON
   ```

   **No-Reply Email:**
   ```
   Custom address: noreply@advancia.com
   Action: Send to your destination email
   Enabled: ON
   ```

   **How to Create:**
   - Click **Email Routing** → **Routing rules**
   - Click **Create address**
   - Enter address (e.g., `support`)
   - Select destination
   - Click **Save**

---

### Step 5: Configure Security Settings

Protect your site from attacks:

#### A. Security Level
- Go to **Security** → **Settings**
- Set Security Level: **Medium** (balanced)
- Challenge Passage: 30 minutes

#### B. Bot Fight Mode (Free Plan)
- Go to **Security** → **Bots**
- Enable **Bot Fight Mode**: ON
- This helps prevent automated attacks

#### C. Enable WAF (Web Application Firewall)
- Automatically enabled on Free plan
- Pre-configured rules protect against common attacks

#### D. Rate Limiting (Optional - Paid)
- Limits requests to prevent abuse
- Free plan has basic DDoS protection

---

### Step 6: Performance Optimization

Speed up your site:

#### A. Enable Caching
- Go to **Caching** → **Configuration**
- Caching Level: **Standard**
- Browser Cache TTL: **4 hours** (recommended)

#### B. Auto Minify
- Go to **Speed** → **Optimization**
- Enable Auto Minify:
  - JavaScript: ON
  - CSS: ON
  - HTML: ON

#### C. Brotli Compression
- Go to **Speed** → **Optimization**
- Brotli: ON (better compression than gzip)

#### D. Rocket Loader (Optional)
- Can speed up JavaScript loading
- Test before enabling (can break some scripts)
- Speed → Optimization → Rocket Loader: OFF (initially)

---

### Step 7: Update Backend Environment Variables

Update your backend to use new custom domain:

```env
# backend/.env

# Update URLs to use custom domain
FRONTEND_URL=https://advancia.com

# Email configuration
VAPID_SUBJECT="mailto:support@advancia.com"
ADMIN_EMAIL="support@advancia.com"
EMAIL_FROM="noreply@advancia.com"
EMAIL_FROM_NAME="Advancia Pay Ledger"

# Keep your SMTP settings for sending
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

**For Gmail to send FROM custom domain:**
1. Gmail Settings → Accounts → "Send mail as"
2. Add `noreply@advancia.com`
3. Verify with code (forwarded by Cloudflare Email Routing)
4. Now Gmail can send as `noreply@advancia.com`

---

### Step 8: Update Frontend Environment Variables

Point frontend to custom domain:

```env
# frontend/.env.local (for production deployment)

# Use custom domain for API
NEXT_PUBLIC_API_URL=https://api.advancia.com

# Or keep Render.com during testing
# NEXT_PUBLIC_API_URL=https://advancia-backend.onrender.com

NEXT_PUBLIC_APP_NAME="Advancia Pay Ledger"
```

**Deploy to Render.com:**
1. Update environment variable in Render dashboard
2. Redeploy frontend service
3. Test API connections

---

### Step 9: Configure Page Rules (Optional)

Create rules for specific URL patterns:

**Example: Always Use HTTPS for All Pages**
- URL: `*advancia.com/*`
- Settings: Always Use HTTPS
- Status: Active

**Example: Cache Everything for API**
- URL: `api.advancia.com/*`
- Settings: Cache Level = Cache Everything
- Status: Active (test carefully)

---

### Step 10: Testing & Verification

After setup, thoroughly test everything:

#### A. Run Diagnostic Script
```powershell
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform
.\Check-Cloudflare-Setup.ps1
```

Expected results after setup:
- ✅ Main domain resolving
- ✅ Nameservers: Cloudflare
- ✅ api.advancia.com resolving
- ✅ eth-gateway.advancia.com resolving
- ✅ MX records: Cloudflare Email Routing
- ✅ SSL certificates active

#### B. Test DNS Resolution
```powershell
# Test main domain
Resolve-DnsName advancia.com

# Test API subdomain
Resolve-DnsName api.advancia.com

# Test ETH gateway
Resolve-DnsName eth-gateway.advancia.com

# Check nameservers
Resolve-DnsName -Type NS advancia.com
# Should show: *.ns.cloudflare.com
```

#### C. Test HTTPS/SSL
```powershell
# Test main site
Invoke-WebRequest -Uri "https://advancia.com"

# Test API health endpoint
Invoke-WebRequest -Uri "https://api.advancia.com/health"

# Test ETH gateway
Invoke-WebRequest -Uri "https://eth-gateway.advancia.com/api/eth/health"
```

#### D. Test Email Forwarding
1. Send test email to: `support@advancia.com`
2. Check personal inbox for forwarded email
3. Verify sender information preserved
4. Reply to test two-way communication

#### E. Check SSL Certificate
```powershell
# Browser test
Start-Process "https://advancia.com"
# Look for padlock icon 🔒

# Certificate details
# Click padlock → Certificate → Should show "Cloudflare"
```

---

## 📋 Post-Setup Checklist

After completing all steps, verify:

### DNS & Domain
- [ ] Nameservers updated to Cloudflare
- [ ] Cloudflare shows "Active" status
- [ ] Main domain `advancia.com` resolves
- [ ] `www.advancia.com` resolves
- [ ] `api.advancia.com` resolves
- [ ] `eth-gateway.advancia.com` resolves

### SSL/TLS
- [ ] SSL mode set to "Full (strict)"
- [ ] Always Use HTTPS enabled
- [ ] Valid SSL certificate issued
- [ ] HTTPS working on all subdomains
- [ ] No mixed content warnings

### Email
- [ ] Email Routing enabled
- [ ] Destination address verified
- [ ] `support@advancia.com` created
- [ ] `admin@advancia.com` created
- [ ] `noreply@advancia.com` created
- [ ] Test email received successfully
- [ ] Reply functionality working

### Security
- [ ] Security level set (Medium)
- [ ] Bot Fight Mode enabled
- [ ] WAF active
- [ ] DDoS protection active

### Performance
- [ ] Caching enabled
- [ ] Auto Minify enabled
- [ ] Brotli compression on
- [ ] Page load time improved

### Backend/Frontend
- [ ] Backend `.env` updated with custom domain
- [ ] Frontend `.env` updated with API domain
- [ ] Services redeployed with new config
- [ ] API calls working through custom domain

---

## 🚨 Common Issues & Solutions

### Issue 1: "ERR_NAME_NOT_RESOLVED"

**Problem:** Subdomain not resolving

**Solutions:**
1. Check DNS record added correctly in Cloudflare
2. Wait 5-10 minutes for DNS propagation
3. Flush DNS cache: `ipconfig /flushdns`
4. Check proxy status (orange cloud)

### Issue 2: "SSL Handshake Failed"

**Problem:** HTTPS not working

**Solutions:**
1. Verify SSL mode is "Full (strict)"
2. Check backend has valid SSL (Render.com provides this)
3. Wait for SSL certificate provisioning (can take 15 mins)
4. Temporarily use "Flexible" SSL mode (less secure)

### Issue 3: Email Not Forwarding

**Problem:** Not receiving emails sent to custom address

**Solutions:**
1. Verify destination email is verified (green checkmark)
2. Check spam folder
3. Wait 5-10 minutes for DNS propagation
4. Test MX records: `Resolve-DnsName -Type MX advancia.com`
5. Check Email Routing status is "Active"

### Issue 4: 502 Bad Gateway

**Problem:** API subdomain shows 502 error

**Solutions:**
1. Verify backend is running on Render.com
2. Check CNAME target is correct: `advancia-backend.onrender.com`
3. Test direct URL: `https://advancia-backend.onrender.com/health`
4. Check Cloudflare proxy settings
5. Review Cloudflare error logs

### Issue 5: Nameserver Not Updated

**Problem:** Still showing GoDaddy nameservers

**Solutions:**
1. Verify you saved changes at GoDaddy
2. Wait 2-4 hours (can take up to 48 hours)
3. Check at: https://www.whatsmydns.net
4. Contact GoDaddy support if stuck after 48 hours

---

## 📊 Monitoring & Maintenance

### Daily Checks
- Monitor email forwarding works
- Check website accessibility
- Review Cloudflare analytics

### Weekly Checks
- Review security events in Cloudflare
- Check SSL certificate expiry (auto-renews)
- Monitor API response times
- Review email routing logs

### Monthly Checks
- Update DNS records if backend changes
- Review and optimize caching rules
- Check for Cloudflare feature updates
- Review bandwidth usage

### Use Cloudflare Dashboard:
- **Analytics:** See traffic, bandwidth, threats blocked
- **Security Events:** View blocked attacks
- **Email Routing Activity:** Monitor email forwards
- **Speed Tests:** Measure performance improvements

---

## 🎯 Quick Command Reference

```powershell
# Run full diagnostic
.\Check-Cloudflare-Setup.ps1

# Check specific DNS records
Resolve-DnsName advancia.com -Type A
Resolve-DnsName advancia.com -Type MX
Resolve-DnsName advancia.com -Type NS
Resolve-DnsName advancia.com -Type TXT

# Test web endpoints
Invoke-WebRequest "https://advancia.com"
Invoke-WebRequest "https://api.advancia.com/health"
Invoke-WebRequest "https://eth-gateway.advancia.com"

# Flush DNS cache
ipconfig /flushdns

# Check global DNS propagation
Start-Process "https://www.whatsmydns.net/#A/advancia.com"
```

---

## 📚 Important URLs

**Cloudflare Dashboard:**
- Main: https://dash.cloudflare.com
- DNS: https://dash.cloudflare.com/[account]/advancia.com/dns
- Email: https://dash.cloudflare.com/[account]/advancia.com/email/routing
- SSL: https://dash.cloudflare.com/[account]/advancia.com/ssl-tls
- Security: https://dash.cloudflare.com/[account]/advancia.com/security

**Testing Tools:**
- DNS Checker: https://dnschecker.org
- MXToolbox: https://mxtoolbox.com/SuperTool.aspx
- SSL Test: https://www.ssllabs.com/ssltest/
- Speed Test: https://www.webpagetest.org

**Documentation:**
- Cloudflare Docs: https://developers.cloudflare.com
- Email Routing: https://developers.cloudflare.com/email-routing/
- DNS: https://developers.cloudflare.com/dns/

---

## ✅ Success Criteria

Your setup is complete when:

1. ✅ `https://advancia.com` loads with valid SSL
2. ✅ `https://api.advancia.com/health` returns `{"status":"healthy"}`
3. ✅ Email to `support@advancia.com` forwards to personal inbox
4. ✅ Cloudflare dashboard shows "Active" status
5. ✅ Nameservers are `*.ns.cloudflare.com`
6. ✅ Security features are enabled
7. ✅ Backend API calls work through custom domain
8. ✅ Diagnostic script shows all green checkmarks

---

## 🚀 Next Actions

**Immediate (Do Now):**
1. [ ] Update nameservers at GoDaddy
2. [ ] Add DNS records (api, eth-gateway)
3. [ ] Configure SSL to "Full (strict)"
4. [ ] Enable Email Routing

**Within 24 Hours:**
5. [ ] Verify nameserver propagation
6. [ ] Test all endpoints
7. [ ] Set up email addresses
8. [ ] Update backend/frontend environment variables

**Within Week:**
9. [ ] Monitor analytics
10. [ ] Optimize performance settings
11. [ ] Set up monitoring/alerts
12. [ ] Document any custom configurations

---

**Ready to proceed?** Start with Step 1 (Update Nameservers) and work through each step! 🎉

Run `.\Check-Cloudflare-Setup.ps1` after each major step to verify progress.
