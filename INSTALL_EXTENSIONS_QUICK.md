# ⚡ VS Code Extensions - Quick Install Guide

**Run one of these to install everything!**

---

## 🚀 Fastest Way (Automatic Installation)

### For Windows (PowerShell)
```powershell
# Copy and paste this entire line:
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform; .\install-extensions.ps1
```

### For WSL/Linux/Mac (Bash)
```bash
# Copy and paste this entire line:
cd ~/path/to/-modular-saas-platform && bash install-extensions.sh
```

---

## 📋 Manual Installation (Copy & Paste)

### Install All Essential Extensions at Once
```powershell
code --install-extension prisma.prisma && `
code --install-extension Vue.volar && `
code --install-extension dbaeumer.vscode-eslint && `
code --install-extension esbenp.prettier-vscode && `
code --install-extension humao.rest-client && `
code --install-extension rangav.vscode-thunder-client && `
code --install-extension ckolkman.vscode-postgres && `
code --install-extension GitHub.copilot && `
code --install-extension mhutchie.git-graph && `
code --install-extension bradlc.vscode-tailwindcss
```

### Install One by One (Safer)
```powershell
# Copy one line at a time:

code --install-extension prisma.prisma
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension humao.rest-client
code --install-extension GitHub.copilot
code --install-extension bradlc.vscode-tailwindcss
code --install-extension mhutchie.git-graph
code --install-extension eamodio.gitlens
code --install-extension ckolkman.vscode-postgres
code --install-extension formulahendry.auto-rename-tag
```

---

## ✅ Verify Installation

### Check if Extensions Installed
```powershell
# Run this to see all installed extensions:
code --list-extensions

# Or in VS Code:
# Press Ctrl+Shift+X → See installed extensions
```

---

## 🎯 Essential Extensions (10 Must-Haves)

| # | Extension | What It Does |
|---|-----------|-------------|
| 1 | **Prisma** | Database ORM syntax & intellisense |
| 2 | **ESLint** | Code quality checking |
| 3 | **Prettier** | Auto-format code on save |
| 4 | **REST Client** | Test API endpoints in VS Code |
| 5 | **GitHub Copilot** | AI code assistant |
| 6 | **Tailwind CSS** | CSS class autocomplete |
| 7 | **PostgreSQL** | Connect to database |
| 8 | **Git Graph** | Visualize commit history |
| 9 | **Thunder Client** | REST API testing UI |
| 10 | **Vue Volar** | Vue/TypeScript support |

---

## 🔧 After Installation

### Restart VS Code
1. Close VS Code completely
2. Reopen it
3. Extensions will activate

### Verify They're Working
1. Open a `.ts` file → TypeScript intellisense
2. Open `backend/prisma/schema.prisma` → Prisma highlighting
3. Save a file → Prettier formats it
4. Create `test.http` file → REST Client works

---

## 📞 Need Help?

### If Extensions Won't Install
```powershell
# Make sure VS Code is in PATH:
code --version

# If not found, add VS Code to PATH manually:
# 1. Open VS Code
# 2. Press Ctrl+Shift+P
# 3. Type: "code" → Install code command in PATH
# 4. Then try installing extensions again
```

### If You Get Errors
```powershell
# Try installing one at a time instead of all at once:
code --install-extension prisma.prisma
# Wait for it to finish, then:
code --install-extension esbenp.prettier-vscode
# Continue for each extension
```

### If Extensions Don't Appear in VS Code
```
1. Press Ctrl+Shift+X (Extensions tab)
2. Scroll to Installed section
3. Should see installed extensions
4. If not, restart VS Code
5. If still not, check: code --list-extensions
```

---

## 🎨 Optional Theme Installation

```powershell
# Popular themes (optional):
code --install-extension dracula-theme.theme-dracula
code --install-extension zhuangtongfa.Material-theme
code --install-extension GitHub.github-vscode-theme
```

---

## 📖 What Each Extension Does

### **Prisma** 📊
- Syntax highlighting for schema.prisma
- Auto-complete for models
- Format with Shift+Alt+F

### **ESLint** ✅
- Shows code errors in real-time
- Highlights problems
- Auto-fixes with Ctrl+Shift+P → Fix

### **Prettier** 🎨
- Auto-formats code on save
- Consistent styling
- Works with all languages

### **REST Client** 🔌
- Create `.http` files
- Send requests without Postman
- See responses instantly

### **GitHub Copilot** 🤖
- AI suggestions as you type
- Press Tab to accept
- Press Escape to reject

### **Tailwind CSS** 💨
- Auto-complete Tailwind classes
- See color previews
- IntelliSense for utilities

### **PostgreSQL** 🗄️
- Browse database tables
- Write SQL queries
- View results

### **Git Graph** 🌳
- Visualize commit history
- See branches
- Track changes

---

## 🚀 Quick Start After Installation

1. **Install Extensions**
   ```powershell
   # Run the install script
   .\install-extensions.ps1
   ```

2. **Restart VS Code**
   - Close & reopen

3. **Open Project**
   - File → Open Folder
   - Select: `-modular-saas-platform`

4. **Test It Works**
   - Open `backend/prisma/schema.prisma`
   - See syntax highlighting ✅
   - Create `test.http` file → REST Client works ✅

---

## 🎯 You're Ready!

After installing, you have:
✅ Database support (Prisma)
✅ Code quality (ESLint)
✅ Auto-formatting (Prettier)
✅ API testing (REST Client)
✅ AI assistance (GitHub Copilot)
✅ Database access (PostgreSQL)
✅ Git visualization (Git Graph)
✅ CSS support (Tailwind)
✅ And more!

**Start coding!** 🚀

---

*Last Updated: October 19, 2025*
