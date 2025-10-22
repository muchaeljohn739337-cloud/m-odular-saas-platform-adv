# 🚀 Render Environment Variables Setup Guide

**Date**: October 20, 2025  
**Project**: Advancia PayLedger  
**Deployment**: Render (Backend + Frontend)

---

## 📋 Generated VAPID Keys

### **VAPID Keys (Web Push Notifications)**
```
Public Key:  BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI
Private Key: jKuvTOT7AS7CGMHH_d6-YbT26wE7mnWasyWkvj8JGeQ
```

---

## 🔧 Backend Environment Variables (Render Dashboard)

Go to: **Render Dashboard → advancia-backend → Environment**

### Required Variables to Add/Update:

| Key | Value | Notes |
|-----|-------|-------|
| `VAPID_PUBLIC_KEY` | `BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI` | For web push |
| `VAPID_PRIVATE_KEY` | `jKuvTOT7AS7CGMHH_d6-YbT26wE7mnWasyWkvj8JGeQ` | Keep secret! |
| `VAPID_SUBJECT` | `mailto:support@advanciapayledger.com` | Auto-set in render.yaml |
| `API_KEY` | `d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d` | Your existing key |
| `BACKEND_URL` | `https://advancia-backend.onrender.com` | ✅ Already set |
| `CORS_ORIGIN` | `https://advanciapayledger.com` | ✅ Already set |
| `DATABASE_URL` | *auto-linked from database* | ✅ Already set |
| `FRONTEND_URL` | `https://advanciapayledger.com` | ✅ Already set |
| `JWT_SECRET` | `793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc6761381569lcc2ab55` | ✅ Already set |
| `NODE_ENV` | `production` | ✅ Already set |
| `STRIPE_SECRET_KEY` | `sk_test_51SCrKDBRIxWx70Zd...` | ✅ Already set |
| `STRIPE_WEBHOOK_SECRET` | *(to be set for production)* | Update when ready |

---

## 🎨 Frontend Environment Variables (Render Dashboard)

Go to: **Render Dashboard → advancia-frontend → Environment**

### Required Variables to Add/Update:

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_VAPID_KEY` | `BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI` | **⚠️ ADD THIS!** |
| `NEXT_PUBLIC_API_KEY` | `d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d` | ✅ Already set |
| `NEXT_PUBLIC_API_URL` | `https://advancia-backend.onrender.com` | ✅ Already set |
| `NEXT_PUBLIC_APP_NAME` | `Advancia Pay Ledger` | ✅ Already set |
| `NEXT_PUBLIC_BOTPRESS_BOT_ID` | `77ea23f8-6bf2-4647-9d24-bcc0fdc3281d` | ✅ Already set |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51SCrKDBRIxWx70ZdsfIT1MSMDyFYa0ke914P8qFm3knW16wmc7a4SLLx21I8dObEaGnx4IQcbTR5ZQoTnqNoZsIZ002l4i6QpB` | ✅ Already set |
| `NEXTAUTH_SECRET` | `793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc6761381569lcc2ab55` | ✅ Already set |
| `NEXTAUTH_URL` | `https://advanciapayledger.com` | ✅ Already set |
| `NODE_ENV` | `production` | ✅ Already set |
| `NEXT_PUBLIC_CURRENCY_LIST` | Auto-set in render.yaml | ✅ Already set |
| `NEXT_PUBLIC_FEATURE_FLAGS` | Auto-set in render.yaml | ✅ Already set |

---

## 📝 Step-by-Step Setup

### **Step 1: Update Backend Environment**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on **advancia-backend** service
3. Go to **Environment** tab
4. Add these 3 new variables:
   ```
   VAPID_PUBLIC_KEY = BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI
   VAPID_PRIVATE_KEY = jKuvTOT7AS7CGMHH_d6-YbT26wE7mnWasyWkvj8JGeQ
   VAPID_SUBJECT = mailto:support@advanciapayledger.com
   ```
5. Click **Save Changes**

### **Step 2: Update Frontend Environment**
1. Go to **advancia-frontend** service
2. Go to **Environment** tab
3. Add this 1 new variable:
   ```
   NEXT_PUBLIC_VAPID_KEY = BK_IxYLeLV9i28EmlpogDJAy5PK_L9QoRY8ktu7EcH1EedWdfy72dp8MIpuIVBGZgVMMUNeFpVUvLeC3858PAoI
   ```
4. Verify all other variables from the table above are present
5. Click **Save Changes**

### **Step 3: Commit and Push Updated render.yaml**
```powershell
# Commit the updated render.yaml
git add render.yaml
git commit -m "Add VAPID keys and complete environment variables to render.yaml"
git push origin main
```

### **Step 4: Trigger Redeploy**
Both services will auto-redeploy when you click "Save Changes" on environment variables.

---

## ✅ Verification Checklist

After deployment completes:

### Backend Checks:
- [ ] Service deployed successfully
- [ ] Database migrations applied (check logs for `prisma migrate deploy`)
- [ ] No VAPID warning in logs
- [ ] Health check passes: `https://advancia-backend.onrender.com/api/payments/health`

### Frontend Checks:
- [ ] Service deployed successfully
- [ ] No build errors in logs
- [ ] Site loads: `https://advanciapayledger.com`
- [ ] Can register/login
- [ ] Push notification subscription works

---

## 🔍 Common Issues & Solutions

### Issue: "VAPID keys not configured" warning
**Solution**: Make sure you added all 3 VAPID variables to backend environment

### Issue: Push notifications not working
**Solution**: 
1. Check `NEXT_PUBLIC_VAPID_KEY` is set in frontend
2. Verify it matches `VAPID_PUBLIC_KEY` in backend
3. Ensure browser has notification permissions

### Issue: CORS errors
**Solution**: Verify `FRONTEND_URL` in backend matches your actual domain

---

## 📱 Testing Web Push Notifications

1. **Register a user** on your frontend
2. **Allow notifications** when prompted by browser
3. **Trigger a notification** (e.g., create a transaction)
4. **Check backend logs** for push notification success/failure

---

## 🔐 Security Notes

- ✅ VAPID_PRIVATE_KEY is marked as `sync: false` (not shared publicly)
- ✅ All secrets are set via Render dashboard, not committed to Git
- ✅ render.yaml only references secret keys, doesn't contain values
- ⚠️ Never commit VAPID_PRIVATE_KEY to Git
- ⚠️ The public key (NEXT_PUBLIC_VAPID_KEY) is safe to expose in frontend

---

## 📚 Related Documentation

- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🎯 Next Steps

1. ✅ Add VAPID keys to Render dashboard (both services)
2. ✅ Commit updated render.yaml
3. ✅ Wait for deployment
4. ✅ Test push notifications
5. 🔄 Update `STRIPE_WEBHOOK_SECRET` when ready for production Stripe

---

**Generated**: October 20, 2025  
**Status**: Ready to deploy 🚀
