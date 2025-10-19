# Email Security DNS Records Guide

**Domain:** advanciapayledger.com (and advancia.com)  
**Purpose:** Prevent email spoofing and phishing attacks

---

## 🔒 Overview: Email Authentication Records

These DNS records protect your domain from being used in phishing/spam attacks:

### The Three Records You Should Add:

1. **SPF (Sender Policy Framework)** - Which servers can send email from your domain
2. **DKIM (DomainKeys Identified Mail)** - Cryptographic signature for emails
3. **DMARC (Domain-based Message Authentication)** - Policy for handling failed authentication

---

## ⚠️ Important Decision Points

### Your Proposed Records Are VERY STRICT:

```
SPF:   "v=spf1 -all"           ← Blocks ALL email sending
DKIM:  "v=DKIM1; p="            ← No public key (blocks signing)
DMARC: "v=DMARC1; p=reject..."  ← Reject all failed emails
```

**This configuration means:**
- ❌ **No emails** can be sent from @advanciapayledger.com
- ❌ **No services** (Gmail, SendGrid, etc.) can send on your behalf
- ❌ Failed emails will be **rejected** (not delivered)

### When to Use Strict Records:

✅ **Use STRICT if:**
- You DON'T plan to send emails from this domain
- Domain is only for receiving/forwarding
- You want maximum security (no one can spoof your domain)
- Domain is parked/unused

❌ **DON'T use STRICT if:**
- You want to send emails from noreply@, support@, etc.
- Using email services (Gmail SMTP, SendGrid, etc.)
- Need transactional emails (password resets, notifications)
- Active business domain

---

## 🎯 Recommended Configurations

### Option A: STRICT (No Email Sending - Maximum Security)

**Use for:** Domains you don't send email from

```
Type: TXT
Name: @
Content: v=spf1 -all
TTL: Auto

Type: TXT
Name: *._domainkey
Content: v=DKIM1; p=
TTL: Auto

Type: TXT
Name: _dmarc
Content: v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;
TTL: Auto
```

**Effect:**
- ✅ Prevents anyone from spoofing your domain
- ✅ Maximum security
- ❌ Cannot send any emails from this domain

---

### Option B: MODERATE (Allow Cloudflare Email Routing Only)

**Use for:** If using Cloudflare Email Routing to send

```
Type: TXT
Name: @
Content: v=spf1 include:_spf.mx.cloudflare.net -all
TTL: Auto

Type: TXT
Name: *._domainkey
Content: v=DKIM1; p=
TTL: Auto (Cloudflare will manage DKIM automatically)

Type: TXT
Name: _dmarc
Content: v=DMARC1; p=quarantine; sp=quarantine; adkim=r; aspf=r; rua=mailto:admin@advanciapayledger.com
TTL: Auto
```

**Effect:**
- ✅ Allows Cloudflare to send/forward emails
- ✅ Good security
- ✅ DMARC reports sent to your admin email
- ⚠️ Suspicious emails quarantined (spam folder)

---

### Option C: PERMISSIVE (Allow Multiple Email Services)

**Use for:** Active business domain with various email services

```
Type: TXT
Name: @
Content: v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com include:sendgrid.net -all
TTL: Auto

Type: TXT  
Name: *._domainkey
Content: v=DKIM1; p=
TTL: Auto (Each service adds their own DKIM)

Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none; sp=none; adkim=r; aspf=r; rua=mailto:admin@advanciapayledger.com; pct=100
TTL: Auto
```

**Effect:**
- ✅ Allows Cloudflare, Gmail, SendGrid to send
- ✅ Monitoring mode (doesn't reject anything yet)
- ✅ DMARC reports for analysis
- ⚠️ Less strict (build up to stricter policy)

---

## 📋 Record-by-Record Explanation

### 1. SPF Record (Sender Policy Framework)

**Purpose:** Lists which mail servers can send email from your domain

**Your Proposed:**
```
v=spf1 -all
```
- `v=spf1` = SPF version 1
- `-all` = **FAIL** all emails (harshest setting)

**Alternative Options:**

```
v=spf1 -all
    ↓ No one can send (strictest)

v=spf1 include:_spf.mx.cloudflare.net -all
    ↓ Only Cloudflare can send

v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com -all
    ↓ Cloudflare + Gmail can send

v=spf1 include:_spf.mx.cloudflare.net ~all
    ↓ Cloudflare preferred, others soft-fail (warning)

v=spf1 include:_spf.mx.cloudflare.net ?all
    ↓ Cloudflare preferred, others neutral (no policy)
```

**Symbols:**
- `-all` = FAIL (reject)
- `~all` = SOFTFAIL (mark as suspicious)
- `?all` = NEUTRAL (no opinion)
- `+all` = PASS (allow anyone - NOT recommended)

---

### 2. DKIM Record (DomainKeys Identified Mail)

**Purpose:** Cryptographic signature proving email authenticity

**Your Proposed:**
```
*._domainkey → v=DKIM1; p=
```
- `*._domainkey` = Wildcard for all DKIM selectors
- `p=` = Empty public key (no signature possible)

**What This Means:**
- No service can add DKIM signatures
- Good for preventing spoofing
- Bad if you want to send authenticated emails

**Better Approach:**
- Let each email service add their own DKIM records
- Example for Gmail: `google._domainkey`
- Example for SendGrid: `s1._domainkey`, `s2._domainkey`
- Cloudflare Email Routing adds DKIM automatically

**Keep the wildcard only if:**
- You want to block all DKIM (ultra-strict security)
- You're not sending any emails

---

### 3. DMARC Record (Domain-based Message Authentication)

**Purpose:** Policy for handling emails that fail SPF/DKIM checks

**Your Proposed:**
```
v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;
```

**Breakdown:**
- `v=DMARC1` = DMARC version 1
- `p=reject` = **Reject** emails that fail checks (harshest)
- `sp=reject` = **Reject** subdomain emails that fail
- `adkim=s` = **Strict** DKIM alignment
- `aspf=s` = **Strict** SPF alignment

**This is VERY STRICT!** Failed emails are deleted immediately.

**Recommended Start:**
```
v=DMARC1; p=none; sp=none; adkim=r; aspf=r; rua=mailto:admin@advanciapayledger.com; pct=100
```

**Breakdown:**
- `p=none` = Monitor only (don't reject)
- `sp=none` = Monitor subdomains
- `adkim=r` = **Relaxed** DKIM (more forgiving)
- `aspf=r` = **Relaxed** SPF (more forgiving)
- `rua=mailto:...` = Send reports to this email
- `pct=100` = Apply to 100% of emails

**DMARC Policies (Progressive):**
1. Start: `p=none` (monitor, collect data)
2. After 1-2 weeks: `p=quarantine` (send to spam)
3. After verified: `p=reject` (delete failed emails)

---

## 🚀 Step-by-Step Implementation

### Step 1: Choose Your Security Level

**For advanciapayledger.com:**

Ask yourself:
1. Will you send emails FROM this domain? (password resets, notifications, etc.)
2. Do you use email services? (Gmail SMTP, SendGrid, Mailgun, etc.)
3. Is this an active business domain or just for receiving?

**My Recommendation:**
- **advancia.com** (main) → Option B or C (permissive, you need to send emails)
- **advanciapayledger.com** (alternate) → Option A (strict, if not actively used)

---

### Step 2: Add Records in Cloudflare

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Select your domain

2. **Navigate to DNS**
   - Click **DNS** in left sidebar
   - Click **Records**

3. **Add SPF Record**
   ```
   Click "Add record"
   Type: TXT
   Name: @ (or leave blank for root domain)
   Content: [Choose from options above]
   TTL: Auto
   Click Save
   ```

4. **Add DKIM Record (Optional)**
   ```
   Click "Add record"
   Type: TXT
   Name: *._domainkey
   Content: v=DKIM1; p=
   TTL: Auto
   Click Save
   
   Note: Only add if you want to block all DKIM
   Otherwise, let email services add their own
   ```

5. **Add DMARC Record**
   ```
   Click "Add record"
   Type: TXT
   Name: _dmarc
   Content: [Choose from options above]
   TTL: Auto
   Click Save
   ```

---

### Step 3: Verify Records

Wait 5-10 minutes, then test:

```powershell
# Check SPF
Resolve-DnsName -Name advanciapayledger.com -Type TXT | Where-Object {$_.Strings -like "*spf1*"}

# Check DKIM
Resolve-DnsName -Name "*._domainkey.advanciapayledger.com" -Type TXT

# Check DMARC
Resolve-DnsName -Name "_dmarc.advanciapayledger.com" -Type TXT
```

**Online Testing Tools:**
- SPF Check: https://mxtoolbox.com/spf.aspx
- DKIM Check: https://mxtoolbox.com/dkim.aspx
- DMARC Check: https://mxtoolbox.com/dmarc.aspx
- All-in-one: https://dmarcian.com/domain-checker/

---

## 🎯 My Recommendations for Your Setup

### For advancia.com (Main Domain):

**Scenario: You need to send emails (password resets, notifications, etc.)**

```
# SPF - Allow Cloudflare + Gmail (or your email service)
Type: TXT
Name: @
Content: v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com -all

# DKIM - Let services add their own
# Don't add wildcard blocker
# Gmail and Cloudflare will add their DKIM automatically

# DMARC - Start in monitoring mode
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none; adkim=r; aspf=r; rua=mailto:admin@advancia.com; pct=100; fo=1
```

### For advanciapayledger.com (Alternate Domain):

**Scenario: Not actively sending emails, want maximum security**

```
# SPF - Block all sending
Type: TXT
Name: @
Content: v=spf1 -all

# DKIM - Block all signing
Type: TXT
Name: *._domainkey
Content: v=DKIM1; p=

# DMARC - Reject all failed emails
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=mailto:admin@advancia.com
```

---

## ⚠️ Important Warnings

### Before Setting Strict Records:

1. **Test Current Email Flow:**
   - Send test emails from your domain
   - Verify all automated emails work
   - Check password reset emails
   - Test notification emails

2. **Review Email Services:**
   - List all services that send email (Gmail, SendGrid, etc.)
   - Add their SPF includes BEFORE setting `-all`
   - Configure their DKIM records

3. **Start with Monitoring:**
   - Always start DMARC with `p=none`
   - Collect reports for 1-2 weeks
   - Review what passes/fails
   - Gradually increase strictness

4. **Don't Lock Yourself Out:**
   - If you set `p=reject` too early, legitimate emails will be deleted
   - No recovery for rejected emails
   - Can cause password reset issues

---

## 📊 Progression Path (Recommended)

### Week 1-2: Monitoring
```
SPF:   v=spf1 include:_spf.mx.cloudflare.net ~all
DMARC: v=DMARC1; p=none; rua=mailto:admin@advancia.com
```
- Soft fail on SPF violations
- Monitor DMARC, no action
- Collect data

### Week 3-4: Quarantine
```
SPF:   v=spf1 include:_spf.mx.cloudflare.net -all
DMARC: v=DMARC1; p=quarantine; rua=mailto:admin@advancia.com
```
- Hard fail on SPF violations
- Failed emails to spam
- Review reports

### Week 5+: Reject (Maximum Security)
```
SPF:   v=spf1 include:_spf.mx.cloudflare.net -all
DMARC: v=DMARC1; p=reject; rua=mailto:admin@advancia.com
```
- Hard fail on SPF violations
- Failed emails rejected
- Maximum protection

---

## 🔍 Testing Your Configuration

### 1. Send Test Email
```
Send from: noreply@advancia.com
To: your-personal@gmail.com
Subject: DMARC Test
```

### 2. Check Email Headers
In Gmail: Open email → Three dots → "Show original" → Look for:
```
SPF: PASS
DKIM: PASS
DMARC: PASS
```

### 3. Use Email Testing Tools
- **Mail Tester:** https://www.mail-tester.com
  - Send email to provided address
  - Get spam score and authentication results

- **DMARC Analyzer:** https://dmarcian.com
  - Upload DMARC reports
  - Visualize authentication status

---

## 📝 Summary

**Your Proposed Records:**
- ✅ Excellent for **unused/parked** domains
- ✅ Maximum security (prevent all spoofing)
- ❌ Too strict for **active** email domains
- ❌ Will block legitimate email sending

**My Recommendation:**
1. **Start permissive** (monitor mode)
2. **Add services** to SPF as needed
3. **Review DMARC reports** weekly
4. **Gradually tighten** to strict mode
5. **Test thoroughly** before p=reject

**Quick Decision:**
- Sending emails from domain? → Use Option B or C
- Not sending, just security? → Use Option A (your proposed)

---

Would you like me to help you:
1. Add these records to your Cloudflare DNS?
2. Test your current email configuration first?
3. Create a progressive rollout plan?

Let me know which approach fits your needs!
