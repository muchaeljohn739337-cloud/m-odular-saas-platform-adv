# ✅ Chatbot Test Instructions

## 🎉 Both Servers Are Running!

### ✅ Backend Status:
- **Running on:** http://localhost:4000
- **All routes registered:** Including chatbot routes
- **Status:** Ready to accept connections

### ✅ Frontend Status:
- **Running on:** http://localhost:3000
- **Environment:** Development mode
- **Status:** Ready

---

## 🧪 How to Test the Chatbot Widget

### Step 1: Open Your Browser

Open your browser and go to:
```
http://localhost:3000
```

### Step 2: Look for the Chat Bubble

Look in the **bottom-right corner** of the page. You should see:

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                ┌────┤
│                                │ 💬 │ ← Blue chat bubble
│                                └────┤
└─────────────────────────────────────┘
```

**Note:** The chat widget **won't fully work yet** because you need to:
1. Deploy your bot to Botpress Cloud
2. Get the Bot ID
3. Replace `your-bot-id-here` in the .env files

---

## 🔧 Current Configuration Status

### Backend (.env):
```env
BOTPRESS_BOT_ID="your-bot-id-here"  ← NEEDS REAL BOT ID
```

### Frontend (.env.local):
```env
NEXT_PUBLIC_BOTPRESS_BOT_ID="your-bot-id-here"  ← NEEDS REAL BOT ID
```

---

## 📋 What You'll See

### Without Bot ID (Current State):
- ✅ Chat bubble **will appear** in bottom-right corner
- ⚠️ Clicking it may show an error or not open
- ⚠️ Bot won't respond to messages

### After Adding Bot ID:
- ✅ Chat bubble appears
- ✅ Clicking opens chat window
- ✅ Welcome message displays
- ✅ Bot responds to your messages
- ✅ Full chatbot functionality

---

## 🚀 To Complete Setup

### 1. Deploy Your Bot to Botpress Cloud

```powershell
cd advancia-bot
npm install     # If not already done
bp deploy
```

This will give you a **Bot ID** like: `bot-xxxxx-xxxxx-xxxxx`

### 2. Update Environment Variables

**Backend** - Edit `backend/.env`:
```env
BOTPRESS_BOT_ID="bot-xxxxx-xxxxx-xxxxx"  ← Replace with real ID
```

**Frontend** - Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_BOTPRESS_BOT_ID="bot-xxxxx-xxxxx-xxxxx"  ← Replace with real ID
```

### 3. Restart Both Servers

```powershell
# Stop current servers (Ctrl+C in each terminal)

# Restart backend
cd backend && npm run dev

# Restart frontend (in another terminal)
cd frontend && npm run dev
```

### 4. Test Again!

Go to http://localhost:3000 and:
- Click the blue chat bubble
- Type "Hi" or "Help me with OTP"
- Bot should respond!

---

## 🧪 Test Messages to Try (After Setup)

Once your Bot ID is configured, test these:

1. **"Hi"** → Welcome message
2. **"Help me login with OTP"** → OTP instructions
3. **"How do I cash out Trump Coin?"** → Trump Coin guide
4. **"What are Med-Beds?"** → Med-Bed info
5. **"Check my balance"** → Balance info
6. **"I forgot my password"** → Recovery help
7. **"support"** → Create support ticket

---

## 🔍 How to Check If Widget Is Loading

### Open Browser Console:

1. Press **F12** (Developer Tools)
2. Go to **Console** tab
3. Look for:
   - ✅ "Botpress script loaded" (or similar)
   - ⚠️ Any errors about Bot ID or Botpress

---

## 🎨 What the Chat Widget Looks Like

When working correctly, you'll see:

```
┌─────────────────────────────────────┐
│ 🤖 Ask Advancia AI           [×] │  ← Blue gradient
├─────────────────────────────────────┤
│                                     │
│  👋 Welcome to Advancia AI!         │  ← Bot (gray)
│  I can help you with:               │
│  • Transactions                     │
│  • Trump Coin                       │
│  • Med-Bed Analytics                │
│  • OTP Help                         │
│  • Account Recovery                 │
│                                     │
│              How can I help? 💬     │  ← You (blue)
│                                     │
├─────────────────────────────────────┤
│ Type your message here...      [→] │
└─────────────────────────────────────┘
```

---

## 🆘 Troubleshooting

### Widget Not Appearing?

1. **Clear browser cache:** Ctrl+Shift+Delete
2. **Hard refresh:** Ctrl+Shift+R
3. **Check console for errors:** F12 → Console
4. **Verify environment variables:** Check .env.local has Bot ID

### Widget Appears But Won't Open?

- **You need a real Bot ID** from Botpress Cloud
- Current placeholder `your-bot-id-here` won't work

### Still Not Working?

1. Check `CHATBOT_DEPLOYMENT_GUIDE.md` for troubleshooting
2. Verify both servers are running
3. Make sure Bot ID is correct (starts with `bot-`)

---

## 📊 Test Backend API Directly

You can also test the backend chatbot API:

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot/health" -Method Get

# Test FAQ
$body = @{ question = "What is OTP?" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot/faq" -Method Post -Body $body -ContentType "application/json"
```

---

## 📚 Next Steps

1. ✅ **Servers are running** (you're here!)
2. ⏳ **Deploy bot** to Botpress Cloud
3. ⏳ **Get Bot ID** from deployment
4. ⏳ **Update .env files** with real Bot ID
5. ⏳ **Restart servers** with new config
6. ⏳ **Test chatbot** fully functional!

---

## 🎊 Summary

**Current Status:**
- ✅ Backend running on http://localhost:4000
- ✅ Frontend running on http://localhost:3000
- ✅ All code is ready
- ✅ Widget is integrated
- ⏳ **Need Bot ID to activate**

**To Activate:**
```powershell
cd advancia-bot
bp deploy
# Copy Bot ID and update .env files
```

---

**Your chatbot infrastructure is ready! Just need the Bot ID to bring it to life! 🚀**

Open http://localhost:3000 now to see your dashboard! 🎉
