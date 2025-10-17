# 🎨 FRONTEND SERVICE SETUP - STEP BY STEP

## 📍 **YOU ARE HERE → Creating Frontend Service on Render**

---

## **PART 1: CREATE FRONTEND SERVICE**

### **STEP 1: Go to Render Dashboard**
Click here: **https://dashboard.render.com**

### **STEP 2: Click "New +"**
- Look for **"New +"** button in the top right
- Click it and select **"Web Service"**

### **STEP 3: Connect Your Repository**
You should see your connected GitHub repository:
- **pdtribe181-prog/-modular-saas-platform**
- Click **"Connect"** next to it
- (If not visible, search for it or click "Configure account")

---

## **PART 2: CONFIGURE FRONTEND SERVICE**

Fill in the form with these EXACT values:

### **Basic Settings:**

**Name:**
```
advancia-frontend
```

**Region:**
```
Oregon (US West)
```
(Same as your backend for best performance)

**Branch:**
```
main
```

**Root Directory:**
```
frontend
```
⚠️ **IMPORTANT:** Type exactly `frontend` (no leading/trailing slashes)

---

### **Build & Deploy Settings:**

**Runtime:**
```
Node
```
(Select from dropdown)

**Build Command:**
```
npm ci && npm run build
```

**Start Command:**
```
npm start
```

---

### **Plan:**

**Instance Type:**
```
Free
```
(For now - you can upgrade later)

---

## **PART 3: ENVIRONMENT VARIABLES**

Click **"Add Environment Variable"** and add these:

### **Variable 1: NODE_ENV**
- **Key:** `NODE_ENV`
- **Value:** `production`

### **Variable 2: NEXT_PUBLIC_API_URL**
- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://advancia-backend.onrender.com/api`

⚠️ **IMPORTANT:** Use the FULL backend URL including `/api`

### **Variable 3: PORT (Optional)**
- **Key:** `PORT`
- **Value:** `3000`

---

## **PART 4: REVIEW YOUR SETTINGS**

Before clicking "Create Web Service", verify:

```
┌─────────────────────────────────────────────────┐
│  Name:           advancia-frontend              │
│  Region:         Oregon (US West)               │
│  Branch:         main                           │
│  Root Directory: frontend                       │
│  Runtime:        Node                           │
│  Build Command:  npm ci && npm run build        │
│  Start Command:  npm start                      │
│  Plan:           Free                           │
│                                                 │
│  Environment Variables:                         │
│    NODE_ENV = production                        │
│    NEXT_PUBLIC_API_URL = https://advancia-...  │
│    PORT = 3000                                  │
└─────────────────────────────────────────────────┘
```

---

## **STEP 5: CREATE THE SERVICE**

Click **"Create Web Service"** button at the bottom

**What happens next:**
- ✅ Render clones your repository
- ✅ Runs build command in `frontend/` directory
- ✅ Installs dependencies
- ✅ Builds Next.js application
- ✅ Starts the server
- ⏱️ Takes ~3-5 minutes for first deployment

---

## **STEP 6: WAIT FOR DEPLOYMENT**

Watch the logs as it deploys:
- You'll see build progress
- TypeScript compilation
- Next.js build output
- Server starting

**When you see:**
```
✅ Your service is live 🎉
Available at your primary URL https://advancia-frontend.onrender.com
```

**Then it's ready!** 🎉

---

## **PART 5: GET FRONTEND DEPLOY HOOK**

After the service is created and live:

### **STEP 1: Go to Frontend Settings**
- Click on **advancia-frontend** service
- Click **"Settings"** in left sidebar

### **STEP 2: Find Deploy Hook**
- Scroll down to **"Deploy Hook"** section
- Click **"Create Deploy Hook"** if needed
- **COPY** the Deploy Hook URL

### **STEP 3: Add to GitHub Secrets**
1. Go to: https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions
2. Click **"New repository secret"**
3. **Name:** `RENDER_DEPLOY_HOOK_FRONTEND`
4. **Secret:** [paste the frontend Deploy Hook URL]
5. Click **"Add secret"**

---

## **PART 6: TEST AUTO-DEPLOY**

After adding the secret, push any change to test:

```powershell
# Make a small change
echo "# Frontend auto-deploy active" >> README.md

# Commit and push
git add README.md
git commit -m "test: trigger frontend auto-deploy"
git push origin main
```

**Watch:**
- GitHub Actions: https://github.com/pdtribe181-prog/-modular-saas-platform/actions
- Render Frontend: https://dashboard.render.com/web/advancia-frontend

---

## **TROUBLESHOOTING:**

### **Frontend Build Fails**

**Error: "Cannot find module"**
- Check that `Root Directory` is set to `frontend`
- Verify `package.json` exists in frontend folder

**Error: "Build script not found"**
- Make sure frontend has `"build": "next build"` in package.json
- Check `Start Command` is `npm start`

**Error: "Module not found: Can't resolve 'X'"**
- Missing dependencies in frontend/package.json
- Run `npm install` locally first to test

### **Frontend Starts but Shows Errors**

**Error: "Failed to fetch from API"**
- Check `NEXT_PUBLIC_API_URL` environment variable
- Make sure it points to: `https://advancia-backend.onrender.com/api`
- Must include `/api` at the end

**CORS Errors:**
- Backend needs to allow frontend origin
- Check backend CORS configuration includes frontend URL

---

## **VERIFICATION CHECKLIST:**

After frontend is deployed:

- [ ] Frontend service created on Render
- [ ] Root Directory set to `frontend`
- [ ] Environment variables added (NODE_ENV, NEXT_PUBLIC_API_URL)
- [ ] First deployment completed successfully
- [ ] Frontend accessible at https://advancia-frontend.onrender.com
- [ ] Frontend Deploy Hook copied
- [ ] RENDER_DEPLOY_HOOK_FRONTEND added to GitHub Secrets
- [ ] Test commit pushed to verify auto-deploy
- [ ] GitHub Actions triggers both backend and frontend deployments

---

## **EXPECTED URLS:**

After setup:

| Service | URL |
|---------|-----|
| **Backend API** | https://advancia-backend.onrender.com |
| **Frontend App** | https://advancia-frontend.onrender.com |

---

## **NEXT STEPS:**

After frontend is live:

1. **Update Backend CORS** - Allow frontend origin
2. **Test API Calls** - Verify frontend can reach backend
3. **Configure Custom Domain** - Optional (requires paid plan)
4. **Add SSL** - Automatic on Render

---

## 🚦 **STATUS TRACKING:**

**Current Step:**
- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect repository
- [ ] Configure frontend service
- [ ] Add environment variables
- [ ] Create service
- [ ] Wait for deployment
- [ ] Get Deploy Hook
- [ ] Add to GitHub Secrets
- [ ] Test auto-deploy

---

**START NOW:**

1. Open: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Follow the form above ⬆️

**Tell me when:**
- You've created the service
- Deployment is complete
- You have the Deploy Hook URL

Let's get your frontend live! 🚀
