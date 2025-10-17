# 🔐 ADD DEPLOY HOOK TO GITHUB SECRETS

## 📍 **YOU ARE HERE → Adding Deploy Hook to GitHub**

---

## **STEP-BY-STEP INSTRUCTIONS:**

### **1. Open GitHub Secrets Page**
Click this link: **https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions**

### **2. Click "New repository secret"**
- Look for the **green button** in the top right
- Says **"New repository secret"**
- Click it

### **3. Fill in the Form**

You'll see two fields:

**Field 1: Name**
```
RENDER_DEPLOY_HOOK_BACKEND
```
Type exactly this (copy-paste to avoid typos)

**Field 2: Secret**
```
[Paste your Deploy Hook URL here]
```
Paste the URL you copied from Render (the one starting with `https://api.render.com/deploy/...`)

### **4. Click "Add secret"**
- Green button at the bottom
- Click it to save

---

## **VISUAL GUIDE:**

```
┌─────────────────────────────────────────────────────┐
│  New secret                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Name *                                             │
│  ┌───────────────────────────────────────────────┐ │
│  │ RENDER_DEPLOY_HOOK_BACKEND                    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Secret *                                           │
│  ┌───────────────────────────────────────────────┐ │
│  │ https://api.render.com/deploy/srv-xxxxx...    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Add secret] ← Click this!                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## **IMPORTANT NOTES:**

✅ **Name must be EXACT:** `RENDER_DEPLOY_HOOK_BACKEND`
   - No spaces
   - All caps
   - Underscores not dashes

✅ **Secret is the full URL** from Render
   - Starts with: `https://api.render.com/deploy/`
   - Includes the `?key=...` part
   - Paste the ENTIRE URL

⚠️ **After adding, you won't be able to see it again**
   - GitHub hides secrets for security
   - That's normal and expected
   - You can always update it if needed

---

## **AFTER YOU ADD IT:**

### **You'll see:**
- ✅ Secret appears in the list as `RENDER_DEPLOY_HOOK_BACKEND`
- ✅ Value is hidden (shows as `***`)
- ✅ Shows "Updated X seconds ago"

### **Then come back here and tell me:**
- "Added it" or "Done"
- And we'll test the CI/CD pipeline! 🚀

---

## **QUICK LINKS:**

**GitHub Secrets Page:**
https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions

**After adding, you can view all secrets here:**
https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions

---

## 🚦 **STATUS CHECK:**

- [x] Got Deploy Hook URL from Render
- [ ] Opened GitHub Secrets page
- [ ] Clicked "New repository secret"
- [ ] Entered Name: `RENDER_DEPLOY_HOOK_BACKEND`
- [ ] Pasted Secret: Deploy Hook URL
- [ ] Clicked "Add secret"
- [ ] Ready to test CI/CD!

---

## **TROUBLESHOOTING:**

**Don't see Settings tab?**
- Make sure you're logged into GitHub
- You must be the repository owner or have admin access

**Can't find Secrets page?**
- Repository → Settings → (left sidebar) Secrets and variables → Actions

**Made a typo?**
- You can click on the secret name
- Click "Update" to change it
- Re-paste the correct URL

---

**GO NOW:** https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions

**Click:** "New repository secret" → Fill in → "Add secret"

**Then tell me:** "Done!" 🎯
