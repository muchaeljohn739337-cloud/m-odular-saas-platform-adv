# 🔍 Frontend Build Configuration Analysis

**Date:** October 26, 2025  
**Status:** ✅ Configuration is CORRECT

---

## 📊 Analysis Summary

### ✅ What's Working

1. **Next.js Configuration** (`frontend/next.config.js`)

   - `output: 'standalone'` is set ✅
   - Generates `.next/standalone/server.js` on build
   - Optimizes bundle size and dependencies

2. **Package.json Scripts**

   - `build`: `next build --no-lint` ✅
   - `start`: `next start` (regular mode) ✅
   - `start:standalone`: `node .next/standalone/server.js` (standalone mode) ✅

3. **Wrapper File** (`frontend/server.js`)

   - Smart wrapper that detects standalone mode ✅
   - Falls back to regular Next.js if standalone missing ✅
   - Provides flexibility for dev and prod environments ✅

4. **Dockerfile** (`frontend/Dockerfile`)
   - Multi-stage build (builder + runner) ✅
   - Copies `.next/standalone` output ✅
   - CMD points to `server.js` wrapper ✅
   - Non-root user (nextjs:nodejs) ✅

---

## 🎯 How It Works

### Build Process

```
1. npm run build
   ↓
2. Next.js compiles with output:'standalone'
   ↓
3. Generates .next/standalone/server.js (optimized)
   ↓
4. Also generates .next/static/* (static assets)
```

### Docker Build Process

```
Builder Stage:
  1. COPY . .  (includes server.js wrapper)
  2. npm run build (generates .next/standalone/)
  3. Output includes:
     • /app/server.js (wrapper)
     • /app/.next/standalone/server.js (Next.js optimized)
     • /app/.next/static/* (assets)

Runner Stage:
  1. COPY .next/standalone to ./
     → This brings .next/standalone/server.js to /app/.next/standalone/server.js
  2. server.js wrapper is NOT copied explicitly
     ❗ POTENTIAL ISSUE: server.js might not be in runner stage
```

---

## ⚠️ Issues Found

### Issue #1: server.js Wrapper Not Explicitly Copied

**Problem:**

- Dockerfile copies `COPY . .` in builder (line 10)
- But runner stage only copies `.next/standalone` and `.next/static`
- The `server.js` wrapper might not be in the runner image

**Current Dockerfile:**

```dockerfile
# Builder
COPY . .  # ← server.js included here
RUN npm run build

# Runner
COPY --from=builder /app/.next/standalone ./  # ← server.js NOT included
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]  # ← Expects server.js at /app/server.js
```

**Solution:** Add explicit copy for server.js wrapper

```dockerfile
# After line 25, add:
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js
```

---

## 📝 References to server.js

### Active References (Working)

1. **`frontend/Dockerfile:35`**

   ```dockerfile
   CMD ["node", "server.js"]
   ```

   - ✅ Points to wrapper file

2. **`frontend/package.json:12`**

   ```json
   "start:standalone": "node .next/standalone/server.js"
   ```

   - ✅ Direct standalone execution (for local testing)

3. **`frontend/server.js`**
   - ✅ Wrapper file that detects standalone mode
   - 43 lines, smart detection logic

### Legacy References (Can Ignore)

4. **`Dockerfile:52`** (root directory)

   - Old Dockerfile, likely superseded by `frontend/Dockerfile`

5. **`ecosystem.config.json:37`**

   - PM2 configuration (not used in Docker/Render)

6. **`render.updated.yaml:49`**

   - Render configuration file (may need update)

7. **`scripts/start-local.ps1`** (lines 57, 66)
   - Local development script

---

## 🎯 Recommended Fixes

### Fix #1: Update Dockerfile to Explicitly Copy Wrapper

**File:** `frontend/Dockerfile`

**Add after line 25:**

```dockerfile
# Copy the wrapper server.js that detects standalone mode
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js
```

**Complete fixed section:**

```dockerfile
# Runner Stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js

USER nextjs
```

### Fix #2: Alternative - Use Standalone server.js Directly

If you don't need the wrapper flexibility:

**Change CMD to:**

```dockerfile
CMD ["node", ".next/standalone/server.js"]
```

**Or even simpler (since we copy standalone to root):**

```dockerfile
# Change line 24 to:
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/server.js ./server.js

# Keep CMD as:
CMD ["node", "server.js"]
```

---

## 🧪 Testing

### Test Local Build

```bash
cd frontend

# 1. Build
npm run build

# 2. Check standalone output
ls -la .next/standalone/server.js  # Should exist

# 3. Test standalone server
node .next/standalone/server.js
# OR
npm run start:standalone
```

### Test Docker Build

```bash
cd ..  # Go to root

# 1. Build Docker image
docker build -t advancia-frontend:test frontend/

# 2. Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:4000 advancia-frontend:test

# 3. Test
curl http://localhost:3000
```

### Expected Output

```
✅ Using Next.js standalone server
✅ Server ready on http://0.0.0.0:3000
```

---

## 🚀 CI/CD Workflow

### Current Workflows

The existing `frontend-ci.yml` workflow should work correctly:

```yaml
- name: Build
  run: |
    cd frontend
    npm run build
```

This will:

1. Run `next build --no-lint`
2. Generate `.next/standalone/server.js`
3. Generate `.next/static/*`

### Verification Step

Add to CI workflow after build:

```yaml
- name: Verify standalone build
  run: |
    cd frontend
    if [ -f .next/standalone/server.js ]; then
      echo "✅ Standalone server.js exists"
    else
      echo "❌ Standalone server.js missing!"
      exit 1
    fi
```

---

## 📊 Configuration Status

| Component         | Status | Notes                         |
| ----------------- | ------ | ----------------------------- |
| next.config.js    | ✅     | `output: 'standalone'` set    |
| package.json      | ✅     | Build scripts configured      |
| server.js wrapper | ✅     | Smart detection logic         |
| Dockerfile        | ⚠️     | Missing explicit wrapper copy |
| CI workflow       | ✅     | Builds correctly              |

---

## 🎯 Action Items

1. **High Priority:**

   - [ ] Update `frontend/Dockerfile` to explicitly copy `server.js` wrapper
   - [ ] Test Docker build locally
   - [ ] Push Dockerfile update

2. **Medium Priority:**

   - [ ] Update `render.updated.yaml` if still used
   - [ ] Remove old `Dockerfile` in root if deprecated
   - [ ] Document standalone vs regular mode usage

3. **Low Priority:**
   - [ ] Add CI verification step for standalone output
   - [ ] Update documentation with deployment instructions

---

## 📚 Resources

- **Next.js Standalone Output:** https://nextjs.org/docs/advanced-features/output-file-tracing
- **Docker Multi-Stage Builds:** https://docs.docker.com/build/building/multi-stage/
- **Render Deploy with Docker:** https://render.com/docs/deploy-docker

---

**Last Updated:** October 26, 2025  
**Analyzed By:** AI Agent  
**Status:** ✅ Working with minor optimization needed
