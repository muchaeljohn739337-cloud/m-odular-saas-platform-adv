# GitHub Actions Workflow Debugging Guide

## Advancia Pay Ledger Platform

---

## 🚀 Quick Reference Commands

### 1. List Recent Runs for a Workflow

```powershell
gh run list --repo pdtribe181-prog/-modular-saas-platform --workflow "CI"
gh run list --limit 10  # Lists last 10 runs of any workflow
```

### 2. View Full Logs of a Run

```powershell
gh run view <RUN_ID> --repo pdtribe181-prog/-modular-saas-platform --log
# Example:
gh run view 18819186069 --log
```

### 3. Get Only Error Lines (Quick Debug)

```powershell
gh run view <RUN_ID> --log | Select-String "##\[error\]|failed|ERROR"
# Shows only lines with errors
```

### 4. View Specific Job Logs

```powershell
gh run view <RUN_ID> --job=<JOB_ID> --log
# Get JOB_ID from: gh run view <RUN_ID>
```

### 5. Rerun a Failed Workflow

```powershell
gh run rerun <RUN_ID> --repo pdtribe181-prog/-modular-saas-platform
# Use ONLY for infrastructure/secret issues, NOT code errors
```

### 6. Export Logs to File

```powershell
gh run view <RUN_ID> --log > workflow_logs.txt
# Then analyze: Select-String "error|warning" workflow_logs.txt
```

---

## 📋 Troubleshooting Scenarios

### Scenario A: Workflow is In Progress

**Problem:** Waiting for a running workflow
**Action Plan:**

1. Wait 2-5 minutes
2. Check status: `gh run list --limit 3`
3. If failed: Get logs with `gh run view <RUN_ID> --log`
4. Search for: `##[error]`, `TS errors`, `npm issues`

### Scenario B: Workflow Failed

**Problem:** Workflow shows ❌ conclusion
**Action Plan:**

1. Get run ID: `gh run list --limit 20` (find the X)
2. View errors: `gh run view <RUN_ID> --log | Select-String "##\[error\]"`
3. Analyze full logs: `gh run view <RUN_ID> --log`
4. **If code error:** Fix locally → git push → auto-runs
5. **If infrastructure:** `gh run rerun <RUN_ID>` (secrets/URL issues)

### Scenario C: Specific Workflow Always Fails

**Problem:** Same workflow fails repeatedly
**Action Plan:**

1. List runs: `gh run list --repo pdtribe181-prog/-modular-saas-platform --workflow "Frontend CI/CD"`
2. Compare successful vs failed:
   - View working run: `gh run view <SUCCESS_ID> --log`
   - View failing run: `gh run view <FAIL_ID> --log`
   - Look for differences in steps/errors
3. Common causes:
   - Missing environment secrets
   - Path case sensitivity (Frontend vs frontend)
   - Missing dependencies in cache
   - Render URL issues (check env vars)

### Scenario D: Need to Debug a Specific Step

**Problem:** One step in a multi-step workflow fails
**Action Plan:**

1. Get workflow ID: `gh run view <RUN_ID>`
2. Find failing job: Check output for job name
3. View job logs: `gh run view <RUN_ID> --job=<JOB_ID> --log`
4. Look for exact error message
5. Check recent code changes: `git log -5 --oneline`

---

## 🔍 Common Issues & Solutions

| Issue                       | Symptom                                      | Solution                                                      |
| --------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| **Path case mismatch**      | `No such file or directory`                  | Check working-directory capitalization (frontend vs Frontend) |
| **Missing secrets**         | `curl: (3) URL rejected` or `Missing secret` | Add env var to GitHub repo Settings → Secrets                 |
| **Cache not found**         | `unable to cache dependencies`               | Remove `cache-dependency-path` if lock file doesn't exist     |
| **TypeScript errors**       | `TS1127: Invalid character`                  | Run `npx tsc --noEmit` locally to verify first                |
| **Render deployment fails** | `malformed URL`                              | Check RENDER_DEPLOY_HOOK env var is set                       |
| **E2E tests timeout**       | `Timeout of 30000ms`                         | Increase timeout or check if backend is running               |

---

## ✅ Known Good Baselines

Use these as reference points when troubleshooting:

```
✅ CI (18819186069) - SUCCESS
✅ Active Work Graph - 2/2 SUCCESS
✅ Deploy to Render (Compat Secrets) - SUCCESS
✅ TypeScript validation - PASS (0 errors)
✅ Code builds - PASS
```

---

## 🎯 Current Project Status

**Main CI Pipeline:** ✅ PASSING
**Features:** ✅ 100% Integrated (TokenWallet, RewardsDashboard, MedBeds)
**Endpoints:** ✅ 11/11 Working (4 new + 7 existing)
**Type Safety:** ✅ 100% (0 TypeScript errors)
**Deployment:** ✅ Ready (Render Compat deployed)

---

## 📝 Latest Commits

1. **de59f96** - fix: remove escaped quotes from medbeds booking form
2. **a8feb32** - fix: use lowercase frontend/backend in ci-linux.yml
3. **0f48a5c** - fix: remove cache-dependency-path from all remaining files
4. **e7f3206** - fix: remove problematic cache-dependency-path from CI
5. **c405984** - wire: add missing backend API endpoints for frontend

---

## 🛠️ Maintenance Commands

```powershell
# Check all workflows in last 24h
gh run list --limit 50 --json createdAt,displayTitle,conclusion,workflowName

# Filter by status
gh run list --limit 20 | Select-String "failure|in_progress"

# Group by workflow type
gh run list --limit 30 --json workflowName,conclusion | ConvertFrom-Json | Group-Object workflowName

# Archive logs before deletion
gh run view <RUN_ID> --log > backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt
```

---

## 📞 Support

For workflow debugging:

1. Check this guide first
2. Review recent commits: `git log --oneline -10`
3. Check local builds: `npm run build` (backend/frontend)
4. Verify environment: check `.env` files
5. Contact team if issue persists

---

**Last Updated:** October 26, 2025
**Status:** All systems operational ✅
