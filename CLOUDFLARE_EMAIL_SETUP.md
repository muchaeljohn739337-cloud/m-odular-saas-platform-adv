# Cloudflare Email Routing Setup Guide

**Platform:** Advancia Pay Ledger  
**Date:** October 18, 2025  
**Domain:** advancia.com (or your custom domain)

---

## 📧 Overview

Cloudflare Email Routing allows you to:
- Create custom email addresses (@yourdomain.com)
- Forward emails to your personal email
- No email hosting costs
- Professional branded emails
- Easy management through Cloudflare dashboard

---

## ✅ Prerequisites

Before starting, ensure:
- ✓ Your domain is added to Cloudflare
- ✓ Cloudflare nameservers are active
- ✓ You have access to Cloudflare dashboard
- ✓ A personal email to forward to (Gmail, Outlook, etc.)

---

## 🚀 Step-by-Step Setup

### Step 1: Access Cloudflare Email Routing

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain (`advancia.com`)
3. Click **Email** in the left sidebar
4. Click **Get started** or **Email Routing**

### Step 2: Enable Email Routing

1. Click **Enable Email Routing**
2. Cloudflare will automatically configure:
   - MX records (mail server records)
   - SPF records (sender authentication)
   - DKIM records (email signing)

   **These records are added automatically - no manual DNS changes needed!**

3. Wait 1-2 minutes for DNS propagation

### Step 3: Add Destination Address

This is where your emails will be forwarded to:

1. Click **Destination addresses**
2. Click **Add destination address**
3. Enter your personal email (e.g., `yourpersonal@gmail.com`)
4. Click **Send verification email**
5. Check your personal email inbox
6. Click the verification link in the email from Cloudflare

### Step 4: Create Custom Email Addresses

Now create professional email addresses that forward to your personal email:

#### Recommended Addresses:

1. **Support Email:**
   - Custom address: `support@advancia.com`
   - Forwards to: Your personal email
   - Click **Create address** → Enter `support` → Select destination → Save

2. **Admin Email:**
   - Custom address: `admin@advancia.com`
   - Forwards to: Your personal email
   - Click **Create address** → Enter `admin` → Select destination → Save

3. **No-Reply Email:**
   - Custom address: `noreply@advancia.com`
   - Forwards to: Your personal email
   - Click **Create address** → Enter `noreply` → Select destination → Save

4. **Info Email (Optional):**
   - Custom address: `info@advancia.com`
   - Forwards to: Your personal email

5. **Contact Email (Optional):**
   - Custom address: `contact@advancia.com`
   - Forwards to: Your personal email

### Step 5: Test Email Forwarding

1. Send a test email to `support@advancia.com` from your personal email
2. Check that it arrives in your personal inbox
3. Verify the email shows as coming from the original sender

---

## 📝 Update Your Backend Configuration

After setting up email routing, update your `.env` file:

```bash
# backend/.env

# Update these email addresses to use your custom domain
VAPID_SUBJECT="mailto:support@advancia.com"
ADMIN_EMAIL="support@advancia.com"

# Email configuration (if using SMTP to SEND emails)
EMAIL_FROM="noreply@advancia.com"
EMAIL_FROM_NAME="Advancia Pay Ledger"

# Keep your SMTP settings for sending
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-personal-gmail@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

**Important Notes:**
- `EMAIL_FROM`: The "From" address users see (your custom domain)
- `EMAIL_USER`: Your actual Gmail account for sending (can be different)
- You can SEND from `noreply@advancia.com` through Gmail SMTP
- Gmail will handle the actual sending, but users see your custom domain

---

## 🔐 DNS Records (Auto-Configured)

Cloudflare automatically adds these records:

### MX Records (Mail Server)
```
advancia.com    MX    10    isaac.mx.cloudflare.net
advancia.com    MX    20    linda.mx.cloudflare.net
advancia.com    MX    99    amir.mx.cloudflare.net
```

### SPF Record (Sender Authentication)
```
advancia.com    TXT    "v=spf1 include:_spf.mx.cloudflare.net ~all"
```

### DKIM Records (Email Signing)
```
Automatically managed by Cloudflare
```

**You don't need to manually add these - Cloudflare does it for you!**

---

## ✅ Verification Checklist

After setup, verify everything works:

### DNS Check
```powershell
# Check MX records
Resolve-DnsName -Name advancia.com -Type MX

# Expected output: isaac.mx.cloudflare.net, linda.mx.cloudflare.net, etc.
```

### Email Test
1. ✓ Send email TO `support@advancia.com`
2. ✓ Receive it in your personal inbox
3. ✓ Reply works correctly
4. ✓ No spam warnings

### Dashboard Check
1. ✓ Email Routing shows "Active"
2. ✓ Destination address is "Verified"
3. ✓ Custom addresses show green checkmarks
4. ✓ Recent activity shows test emails

---

## 🎯 Common Email Addresses Setup

Here's a complete setup for a professional SaaS platform:

| Custom Address | Purpose | Forwards To |
|---------------|---------|-------------|
| `support@advancia.com` | Customer support | Your personal email |
| `admin@advancia.com` | Admin notifications | Your personal email |
| `noreply@advancia.com` | Automated emails | Your personal email (monitor) |
| `billing@advancia.com` | Payment/invoice emails | Your personal email |
| `security@advancia.com` | Security alerts | Your personal email |
| `contact@advancia.com` | General inquiries | Your personal email |

**Pro Tip:** Forward all to the same personal email initially. You can organize using Gmail filters later.

---

## 📧 Sending Emails FROM Custom Domain

### Option 1: Using Gmail SMTP (Recommended for Small Apps)

```env
# backend/.env
EMAIL_FROM="noreply@advancia.com"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-gmail@gmail.com"  # Your actual Gmail
EMAIL_PASSWORD="your-app-password"  # Gmail app password
```

**Steps to allow custom FROM address:**
1. Go to Gmail Settings → Accounts → "Send mail as"
2. Click "Add another email address"
3. Enter `noreply@advancia.com`
4. Verify with code sent to that address (Cloudflare forwards it)
5. Now Gmail can send AS `noreply@advancia.com`

### Option 2: Using SendGrid (Better for High Volume)

```env
# backend/.env
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@advancia.com"
```

1. Sign up at [SendGrid.com](https://sendgrid.com) (100 emails/day free)
2. Verify your domain `advancia.com`
3. Add DNS records from SendGrid to Cloudflare
4. Generate API key
5. Use in your app

### Option 3: Using Cloudflare Workers (Advanced)

Send emails programmatically via Cloudflare Workers + Email Routing (requires paid plan).

---

## 🛠️ Troubleshooting

### Emails Not Forwarding

**Problem:** Not receiving forwarded emails

**Solutions:**
1. Check destination address is verified (green checkmark)
2. Check spam folder in personal email
3. Wait 5-10 minutes for DNS propagation
4. Verify MX records: `Resolve-DnsName -Type MX advancia.com`
5. Check Cloudflare Email Routing status is "Active"

### Cannot Send FROM Custom Domain

**Problem:** Emails sent from `noreply@advancia.com` fail

**Solutions:**
1. Add custom address in Gmail "Send mail as" settings
2. Verify the address (check forwarded verification code)
3. Update SPF record if using external SMTP
4. Check SMTP credentials are correct

### Emails Going to Spam

**Problem:** Forwarded emails marked as spam

**Solutions:**
1. Ensure SPF, DKIM records are configured (automatic with Cloudflare)
2. Add DMARC record:
   ```
   _dmarc.advancia.com    TXT    "v=DMARC1; p=none; rua=mailto:admin@advancia.com"
   ```
3. Warm up your domain (send gradually increasing volumes)
4. Ask recipients to mark as "Not Spam"

### DNS Records Not Updating

**Problem:** MX records don't show Cloudflare servers

**Solutions:**
1. Confirm nameservers point to Cloudflare
2. Clear DNS cache: `ipconfig /flushdns` (Windows)
3. Wait up to 48 hours for full propagation
4. Check DNS at: https://dnschecker.org

---

## 🔍 Testing Your Setup

### Run Diagnostic Script

```powershell
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform
.\Check-Cloudflare-Setup.ps1
```

### Manual DNS Tests

```powershell
# Check MX records
Resolve-DnsName -Name advancia.com -Type MX

# Check TXT records (SPF)
Resolve-DnsName -Name advancia.com -Type TXT

# Check DMARC
Resolve-DnsName -Name _dmarc.advancia.com -Type TXT
```

### Online Email Testing Tools

1. **MXToolbox:** https://mxtoolbox.com/SuperTool.aspx
   - Check MX, SPF, DMARC records
   - Test email deliverability

2. **Mail-Tester:** https://www.mail-tester.com
   - Send test email to provided address
   - Get spam score and recommendations

3. **DNS Checker:** https://dnschecker.org
   - Verify DNS propagation globally
   - Check A, MX, TXT records

---

## 🎓 Best Practices

### Email Organization

1. **Use Filters in Personal Email:**
   - Create Gmail labels: `[Advancia] Support`, `[Advancia] Admin`
   - Auto-label emails by TO address
   - Set up notifications for important addresses

2. **Monitor All Addresses:**
   - Even `noreply@` should forward (for bounce monitoring)
   - Check regularly for missed emails

3. **Professional Signatures:**
   - Set up email signature in Gmail
   - Include company name, website, support links

### Security

1. **Enable 2FA** on Cloudflare account
2. **Use strong passwords** for email accounts
3. **Monitor Email Routing logs** in Cloudflare
4. **Set up DMARC** for anti-phishing

### Scalability

1. Start with Cloudflare Email Routing (free, simple)
2. Graduate to SendGrid when sending >100 emails/day
3. Consider dedicated email service (AWS SES, Mailgun) for high volume
4. Keep email sending separate from receiving

---

## 📋 Quick Reference

### Cloudflare Dashboard URLs

- Email Routing: `https://dash.cloudflare.com/[account-id]/[domain]/email/routing`
- DNS Management: `https://dash.cloudflare.com/[account-id]/[domain]/dns`
- Analytics: `https://dash.cloudflare.com/[account-id]/[domain]/analytics`

### PowerShell Commands

```powershell
# Check domain DNS
Resolve-DnsName advancia.com

# Check MX records
Resolve-DnsName -Type MX advancia.com

# Check TXT/SPF records
Resolve-DnsName -Type TXT advancia.com

# Flush DNS cache
ipconfig /flushdns
```

### Environment Variables

```env
# Email addresses (update in backend/.env)
VAPID_SUBJECT="mailto:support@advancia.com"
ADMIN_EMAIL="support@advancia.com"
EMAIL_FROM="noreply@advancia.com"
EMAIL_FROM_NAME="Advancia Pay Ledger"

# SMTP for sending (Gmail example)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
```

---

## ✅ Complete Setup Summary

After following this guide, you should have:

- ✅ Custom email addresses (`support@advancia.com`, etc.)
- ✅ Email forwarding to your personal inbox
- ✅ Ability to send FROM custom domain
- ✅ Professional email setup (no hosting costs)
- ✅ DNS records automatically configured
- ✅ Email authentication (SPF, DKIM) working
- ✅ Backend configured with custom email addresses

---

## 🆘 Need Help?

**Cloudflare Support:**
- Documentation: https://developers.cloudflare.com/email-routing/
- Community: https://community.cloudflare.com/
- Email: support@cloudflare.com

**Quick Checks:**
1. Run: `.\Check-Cloudflare-Setup.ps1`
2. Check: https://mxtoolbox.com/SuperTool.aspx
3. Test: Send email to `support@advancia.com`

---

**Next Step:** Run the diagnostic script to verify your current setup!

```powershell
.\Check-Cloudflare-Setup.ps1
```
