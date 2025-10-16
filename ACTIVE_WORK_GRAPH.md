# 📊 Active Work Graph System

## Overview

The Active Work Graph visualizes commit activity over the last 14 days as a beautiful SVG bar chart. It automatically updates via GitHub Actions and displays on your README and frontend dashboard.

---

## 🎨 Visual Design

- **Gradient Background**: Blue (#1E3A8A) → Teal (#0EA5E9)
- **Bars**: Teal (#14B8A6) with rounded corners
- **Dimensions**: 400px × 80px
- **Updates**: Daily at 02:00 UTC or on every push to main

---

## 📁 File Structure

```
-modular-saas-platform/
├── tools/
│   └── active-work-graph.mjs      # Graph generator script
├── .github/
│   └── workflows/
│       └── active-work-graph.yml  # GitHub Action workflow
├── public/
│   └── active-work.svg            # Generated graph (auto-updated)
└── frontend/
    └── src/
        └── components/
            └── ActiveWorkCard.tsx # Dashboard component
```

---

## 🚀 Usage

### 1. Generate Graph Locally

```bash
# Run the generator
node tools/active-work-graph.mjs

# Output: public/active-work.svg
```

**Example Output:**
```
🔍 Analyzing commit activity for the last 14 days...

📊 today: 2 commits

✅ Total commits in last 14 days: 2

✅ Wrote public/active-work.svg
📈 Graph shows 2 commits across 14 days
```

### 2. View in README

The graph is automatically embedded in `README.md`:

```markdown
## 📊 Active Work

![Active Work](public/active-work.svg)

*Real-time commit activity over the last 14 days*
```

### 3. Use in Frontend Dashboard

Import the `ActiveWorkCard` component:

```typescript
import ActiveWorkCard from '@/components/ActiveWorkCard'

export default function Dashboard() {
  return (
    <div className="grid gap-4">
      <ActiveWorkCard />
      {/* Other components */}
    </div>
  )
}
```

---

## ⚙️ How It Works

### Graph Generator (`active-work-graph.mjs`)

1. **Analyzes Git History**
   - Queries `git rev-list` for each of the last 14 days
   - Counts commits per day
   - Stores in an array (oldest → newest, left → right)

2. **Generates SVG**
   - Creates 400×80px SVG canvas
   - Draws gradient background
   - Renders bar for each day (height based on commit count)
   - Adds label text

3. **Saves File**
   - Writes to `public/active-work.svg`
   - Logs commit statistics

### GitHub Action Workflow

**Triggers:**
- **Schedule**: Daily at 02:00 UTC (`cron: "0 2 * * *"`)
- **Manual**: Via workflow_dispatch
- **Push**: On every push to `main` branch

**Steps:**
1. Checkout repository with full history (`fetch-depth: 0`)
2. Setup Node.js 20
3. Install dependencies (if needed)
4. Run `node tools/active-work-graph.mjs`
5. Commit and push updated SVG
6. Uses `[skip ci]` to avoid infinite loops

---

## 🎨 Customization

### Change Time Range

Edit `tools/active-work-graph.mjs`:

```javascript
const days = 30; // Change from 14 to 30 days
```

### Customize Colors

```javascript
// Background gradient
<linearGradient id="g" x1="0" x2="1">
  <stop offset="0%" stop-color="#your-color-1"/>
  <stop offset="100%" stop-color="#your-color-2"/>
</linearGradient>

// Bar color
fill="#your-bar-color"
```

### Adjust Dimensions

```javascript
const width = 600;  // Change from 400
const height = 100; // Change from 80
```

### Change Update Schedule

Edit `.github/workflows/active-work-graph.yml`:

```yaml
schedule:
  - cron: "0 12 * * *"  # Daily at noon UTC
  # Or weekly:
  - cron: "0 0 * * 0"   # Every Sunday at midnight
```

---

## 📊 Git Commands

### View Commit Graph

```bash
# Full graph of all branches
git log --graph --decorate --oneline --all --date-order

# Last 14 days only
git log --since="14 days ago" --graph --decorate --oneline --all --date-order

# Count commits per day
git rev-list --count --all --since="1 day ago" --until="0 day ago"
```

### Manual Testing

```bash
# Test for specific date range
git rev-list --count --all --since="5 days ago" --until="4 days ago"

# View detailed commit log
git log --since="14 days ago" --pretty=format:"%h - %an, %ar : %s"
```

---

## 🧩 Frontend Component Features

### ActiveWorkCard.tsx

**Features:**
- Glass-morphism design
- Error handling (shows placeholder if SVG missing)
- Pulsing status indicator
- Last update timestamp
- Responsive sizing
- Hover shadow effect

**Props:** None (self-contained)

**Styling:**
- `bg-white/10` - Semi-transparent background
- `backdrop-blur-md` - Blurred backdrop
- `border-white/20` - Subtle border
- `shadow-lg` → `shadow-xl` on hover

---

## 🔧 Troubleshooting

### Graph Not Updating in GitHub

**Issue**: Workflow not running automatically

**Solution**:
1. Check workflow file is in `.github/workflows/`
2. Verify cron syntax is correct
3. Enable Actions in repository settings
4. Check Actions tab for error logs

### SVG Not Displaying

**Issue**: Image shows broken icon

**Solution**:
1. Verify `public/active-work.svg` exists
2. Run `node tools/active-work-graph.mjs` locally
3. Check file permissions
4. Clear browser cache

### No Commits Showing

**Issue**: Graph is empty despite having commits

**Solution**:
1. Ensure Git history is available (`git log` works)
2. Check date range (commits might be older than 14 days)
3. Verify `git rev-list` command works:
   ```bash
   git rev-list --count --all --since="1 day ago"
   ```

### Permission Denied (GitHub Actions)

**Issue**: Workflow can't push to repository

**Solution**:
1. Go to Settings → Actions → General
2. Under "Workflow permissions", select:
   - ✅ Read and write permissions
3. Click Save

---

## 📈 API Integration (Future Enhancement)

### Expose as API Endpoint

```typescript
// backend/src/routes/stats.ts
import { execSync } from 'child_process'

router.get('/activity/graph', (req, res) => {
  const days = 14
  const counts = []
  
  for (let i = 0; i < days; i++) {
    const since = `${i + 1} day ago`
    const until = `${i} day ago`
    const cmd = `git rev-list --count --all --since="${since}" --until="${until}"`
    const count = parseInt(execSync(cmd).toString().trim() || "0", 10)
    counts[days - 1 - i] = count
  }
  
  res.json({
    days,
    commits: counts,
    total: counts.reduce((a, b) => a + b, 0)
  })
})
```

### Real-time Updates

Use Socket.IO to push updates when new commits are detected:

```typescript
// When new commit detected
io.emit('activity-update', {
  timestamp: new Date(),
  commitCount: newCommitCount
})
```

---

## 🎯 Best Practices

1. **Commit Regularly**: Graph looks better with consistent activity
2. **Meaningful Commits**: Each bar represents real work
3. **Update Timing**: Schedule during off-peak hours (2 AM UTC)
4. **File Size**: SVG is tiny (~1KB), no performance impact
5. **Caching**: Browser caches SVG, use query param to force refresh:
   ```html
   <img src="/active-work.svg?t={timestamp}" />
   ```

---

## 📚 Related Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Git Log Documentation](https://git-scm.com/docs/git-log)
- [SVG Specifications](https://www.w3.org/TR/SVG2/)
- [Cron Schedule Syntax](https://crontab.guru/)

---

## ✨ Features Summary

✅ **Automated Updates** - GitHub Actions runs daily
✅ **Visual Appeal** - Gradient background with smooth bars
✅ **Responsive** - Works on all screen sizes
✅ **Error Handling** - Graceful fallbacks
✅ **Performance** - Tiny SVG file size
✅ **Flexible** - Easy to customize colors and range
✅ **Self-Contained** - No external dependencies
✅ **Git Native** - Uses built-in Git commands

---

**🎉 Your repository now has beautiful commit activity visualization!**
