# Cloudflare Workers Build Fix

## 🐛 Problem

Deployment failed with error:

```
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

**Root Cause**: Wrangler was looking for `out/_worker.js` or assets in `out/` directory, but:

- Next.js built to `.next` directory (standalone mode)
- `CF_PAGES` environment variable wasn't set during build
- `wrangler.toml` had incorrect configuration (using `[site]` instead of `[assets]`)

## ✅ Solution Applied

### 1. Updated `wrangler.toml`

Changed from:

```toml
main = "out/_worker.js"
[site]
bucket = "./out"
[build]
command = "npm run build"
```

To:

```toml
[assets]
directory = "./out"
binding = "ASSETS"
```

**Why**: Modern Cloudflare Workers uses `[assets]` for static sites, not `[site]` or `main`.

### 2. Updated GitHub Actions Workflow

Added verification step and ensured `CF_PAGES` is a string:

```yaml
env:
  CF_PAGES: "true" # Must be string, not boolean
```

Added verification:

```yaml
- name: Verify build output
  run: ls -la out/ || exit 1
```

### 3. Verified `next.config.js`

Already correctly configured:

```javascript
output: process.env.CF_PAGES ? "export" : "standalone",
```

This creates static HTML/CSS/JS in `out/` when `CF_PAGES=true`.

## 🧪 Test Locally

```powershell
cd frontend

# Set environment variable (must be string)
$env:CF_PAGES = "true"

# Build
npm run build

# Verify output
ls out
# Should see: index.html, _next/, etc.

# Deploy
npx wrangler deploy
```

## 📊 Expected Build Output

When `CF_PAGES=true`:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (45/45)
✓ Finalizing page optimization

Output: out/
├── index.html
├── _next/
│   ├── static/
│   └── ...
├── about.html
├── dashboard.html
└── [all other pages].html
```

## 🚀 Next Deployment

The next build should succeed with:

```
✅ Build command completed
⛅️ wrangler 4.43.0
📦 Uploading assets...
✨ Deployment complete!
🌐 https://advanciafrontend.pdtribe181.workers.dev
```

## 🔧 If Build Still Fails

### Issue: `CF_PAGES` not being read

**Solution**: Ensure it's a string, not boolean:

```yaml
CF_PAGES: "true"  # ✅ Correct
CF_PAGES: true    # ❌ Might not work
```

### Issue: `out` directory empty

**Solution**: Check Next.js build logs for errors. May need to fix TypeScript errors first.

### Issue: Wrangler says "No assets found"

**Solution**: Verify `out/` exists:

```bash
ls frontend/out
```

## 📝 Changes Summary

| File                     | Change                             | Purpose                          |
| ------------------------ | ---------------------------------- | -------------------------------- |
| `frontend/wrangler.toml` | Use `[assets]` instead of `[site]` | Modern Cloudflare Workers syntax |
| `.github/workflows/...`  | Add `CF_PAGES: "true"` as string   | Trigger static export mode       |
| `.github/workflows/...`  | Add verification step              | Catch build issues early         |

---

**Status**: ✅ Ready for next deployment
**Date**: October 21, 2025
**Next Action**: Push to trigger GitHub Actions deployment
