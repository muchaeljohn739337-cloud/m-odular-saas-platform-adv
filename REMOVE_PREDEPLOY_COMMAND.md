╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║              🔧 FIX: REMOVE PRE-DEPLOY COMMAND FROM RENDER                 ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ❌ PROBLEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error: Pre-deploy has failed
The Render dashboard has a "Pre-deploy Command" set that's triggering Prisma migrations.

Solution: Remove the Pre-deploy Command from the backend service settings.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ FIX: CLEAR PRE-DEPLOY COMMAND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step-by-step:

1. Go to: https://dashboard.render.com/services/advancia-backend
2. Click: "Settings" tab
3. Look for: "Pre-deploy Command" field
4. Clear it: Delete any text in that field
5. Save: Click "Save Changes"

If you can't find it:
   → Look in the "Build" section
   → Or scroll down in Settings
   → Any field labeled "Pre-deploy" or similar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🚀 AFTER CLEARING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Once cleared:

1. Click: "Redeploy to latest commit"
2. Wait: 5-10 minutes
3. Check: Logs should show successful build
4. Result: "Active" status ✅

The build will:
✅ Clone repo
✅ Run: npm ci (install packages)
✅ Run: npm run build (compile TypeScript)
✅ Skip migrations (postbuild is just echo)
✅ Start server on port 4000
✅ Run health checks
✅ Show "Active" ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tell me once you've cleared the Pre-deploy Command!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
