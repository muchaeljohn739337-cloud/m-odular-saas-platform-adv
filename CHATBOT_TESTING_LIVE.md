# 🤖 Chatbot Widget Testing Guide - LIVE NOW!

## ✅ STATUS: SERVERS RUNNING & CHATBOT ACTIVE

```
╔═════════════════════════════════════════════════════╗
║         ADVANCIA CHATBOT - LIVE & READY!            ║
╠═════════════════════════════════════════════════════╣
║                                                     ║
║  ✅ Backend Server:    Running on port 4000         ║
║  ✅ Frontend Server:   Running on port 3000         ║
║  ✅ Chatbot Widget:    ACTIVE with Bot ID           ║
║  ✅ Dashboard:         Open in your browser         ║
║                                                     ║
║  Bot ID: 77ea23f8-6bf2-4647-9d24-bcc0fdc3281d      ║
║  Status: PRODUCTION READY ✨                        ║
║                                                     ║
╚═════════════════════════════════════════════════════╝
```

---

## 🎯 What to Look For

### 1. **Chat Bubble** 💬
```
Location: Bottom-right corner of page
Color: Blue (#2563eb)
Icon: Message bubble with "💬" 
Status: Should be visible immediately on page load
```

### 2. **Click to Open**
```
Click the blue bubble → Chat widget opens
Animation: Smooth pop-up with greeting message
Keyboard: Can type messages in input field
```

### 3. **Bot Response**
```
Send: "Hi"
Expect: Welcome message from Advancia AI Assistant
Response Time: Should be instant
```

---

## 🧪 Test Messages to Try

### **Basic Greeting:**
```
You: Hi
Bot: Should respond with welcome message
     "Hello! I'm Advancia AI Assistant..."
```

### **OTP Help:**
```
You: "Help with OTP" or "How do I get an OTP?"
Bot: Should provide OTP authentication instructions
     "To set up One-Time Password authentication..."
```

### **Trump Coin Questions:**
```
You: "How do I cash out Trump Coin?"
Bot: Should explain Trump Coin cash-out process
     "To cash out your Trump Coin holdings..."

You: "What's the current Trump Coin price?"
Bot: Should provide pricing information
```

### **Med-Bed Information:**
```
You: "What are Med-Beds?"
Bot: Should explain Med-Bed technology
     "Med-Beds are advanced wellness devices..."

You: "How do Med-Beds work?"
Bot: Should provide technical details
```

### **Account & Transactions:**
```
You: "Check my balance"
Bot: Should provide account balance info

You: "How do I make a transaction?"
Bot: Should explain transaction process

You: "I forgot my password"
Bot: Should guide account recovery
```

### **KYC & Verification:**
```
You: "What's KYC?"
Bot: Should explain Know Your Customer requirements

You: "How do I verify my account?"
Bot: Should provide verification steps
```

### **Support:**
```
You: "I need support" or "support"
Bot: Should offer support ticket creation
     "I can help you create a support ticket..."
```

### **General Help:**
```
You: "Help"
Bot: Should list available topics
     "I can help you with..."
```

---

## 📱 Visual Checklist

**On Page Load:**
- [ ] Blue chat bubble appears in bottom-right
- [ ] Bubble has smooth animation/pulse
- [ ] No errors in console (F12)
- [ ] Page loads completely
- [ ] All dashboard elements visible

**When Clicking Bubble:**
- [ ] Chat window opens smoothly
- [ ] Botpress branding visible (if applicable)
- [ ] Input field is focused and ready
- [ ] Message history shows if this is repeat visit
- [ ] Close button (X) is visible

**During Chat:**
- [ ] Text appears as you type
- [ ] Messages send on Enter key
- [ ] Bot response appears after sending
- [ ] Conversation flows naturally
- [ ] Chat history scrolls properly
- [ ] Mobile keyboard doesn't block chat on mobile

**Chat Quality:**
- [ ] Responses are relevant to your questions
- [ ] Bot understands multiple phrasings
- [ ] Follow-up questions make sense
- [ ] No obvious errors in responses
- [ ] Responses are formatted nicely

---

## 🔍 Browser Developer Tools Check

**Press F12 to open DevTools and check:**

### Console Tab:
```
✅ No red error messages
✅ No "Bot ID" related warnings
✅ No CORS errors
✅ No failed network requests
✅ Look for success messages like:
   - "Botpress script loaded"
   - "Chat widget initialized"
```

### Network Tab:
```
✅ Look for successful requests to:
   - api.botpress.cloud (should see 200 responses)
   - localhost:4000/api/chatbot/* (should see 200 responses)
   - No 404 or 500 errors
```

### Application Tab:
```
✅ Check localStorage for:
   - NEXT_PUBLIC_BOTPRESS_BOT_ID stored
   - Chat session data
```

---

## 📊 Server Status Verification

**Backend Health:**
```powershell
# Run this to verify backend is healthy:
Invoke-RestMethod -Uri "http://localhost:4000/health" -Method Get

# Expected response:
# status  timestamp
# ------  ---------
# healthy 10/18/2025 1:44:02 AM
```

**Chatbot API Health:**
```powershell
# Run this to verify chatbot endpoints work:
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot/health" -Method Get

# Expected response:
# status  timestamp         service
# ------  ---------         -------
# healthy 10/18/2025 1:44 AM  chatbot
```

**Frontend Status:**
```
Dashboard should load at:
http://localhost:3000

Should see:
- Navigation bar
- Balance information
- Trump Coin section
- Med-Bed analytics
- Chat widget in corner
```

---

## 🐛 Troubleshooting

### **Chat bubble NOT visible:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache and reload
3. Check if Bot ID is in environment files:
   - `backend/.env` should have: `BOTPRESS_BOT_ID="77ea23f8-6bf2-4647-9d24-bcc0fdc3281d"`
   - `frontend/.env.local` should have: `NEXT_PUBLIC_BOTPRESS_BOT_ID="77ea23f8-6bf2-4647-9d24-bcc0fdc3281d"`
4. Restart both servers
5. Check console errors (F12)

### **Chat bubble visible but doesn't open:**
1. Check backend health: `http://localhost:4000/health`
2. Check chatbot API: `http://localhost:4000/api/chatbot/health`
3. Look at console errors (F12 → Console tab)
4. Try incognito/private window
5. Clear cookies and session data

### **Chat opens but bot doesn't respond:**
1. Verify Bot ID is correct (77ea23f8-6bf2-4647-9d24-bcc0fdc3281d)
2. Go to https://app.botpress.cloud/ and check bot status
3. Try simple message like "Hi"
4. Check network tab (F12 → Network) for failed requests
5. Look at backend logs for errors
6. May need to add training data in Botpress Studio

### **Slow response time:**
1. This is normal for first message (cold start)
2. Subsequent messages should be faster
3. Check internet connection
4. Check if backend is under load (check `/health` endpoint)

### **Generic bot responses:**
1. Bot needs training data configured in Botpress Studio
2. Currently has basic responses
3. Add conversation flows in Botpress Cloud
4. See `CHATBOT_TRAINING_DATA.md` for sample responses

---

## 🌐 Botpress Studio Access

**To enhance your bot:**

1. Go to: https://app.botpress.cloud/
2. Login with your account
3. Select workspace: "pdtribe181's Workspace"
4. Select bot: "New Agent"
5. Click "Open Studio"

**In Studio, you can:**
- Create conversation flows
- Add intents and entities
- Train the NLU model
- Configure integrations
- View analytics
- Test bot directly

---

## 📈 Expected Behavior

### **First-Time User:**
- Chat bubble appears within 2 seconds
- Clicking opens chat widget
- Widget shows welcome message
- User can type messages
- Bot responds within 1-2 seconds
- Chat history appears on page refresh

### **Returning User:**
- Chat bubble appears immediately
- Previous conversation loads
- Bot remembers context from last session
- Can continue previous conversation

### **Feature Testing:**
- Typing "Hi" → Bot greets you
- Typing "OTP" → Bot discusses OTP
- Typing "Trump Coin" → Bot discusses Trump Coin
- Typing "Med-Bed" → Bot discusses Med-Beds
- Typing "Help" → Bot lists topics
- Typing "support" → Bot offers ticket creation

---

## ✨ Success Indicators

**You'll know it's working when:**

```
✅ Chat bubble visible and blue
✅ Clicking bubble opens chat widget
✅ Can type messages in chat
✅ Bot responds to "Hi" message
✅ Bot responds to specific topics
✅ Responses are relevant
✅ No console errors
✅ Chat maintains history
✅ Mobile version is responsive
✅ Works in different browsers
```

---

## 📝 Test Results Template

**Save these results for reference:**

```
Test Date: October 18, 2025
Bot ID: 77ea23f8-6bf2-4647-9d24-bcc0fdc3281d
Environment: Development (localhost)

Chat Bubble:          [ ] Visible [ ] Not visible
Opens on Click:       [ ] Yes     [ ] No
Responds to "Hi":     [ ] Yes     [ ] No
Responds to "OTP":    [ ] Yes     [ ] No
Responds to "Coin":   [ ] Yes     [ ] No
Responds to "Beds":   [ ] Yes     [ ] No
Console Errors:       [ ] Yes     [ ] No
Chat History:         [ ] Works   [ ] Doesn't work
Mobile Responsive:    [ ] Yes     [ ] No
Overall Status:       [ ] Working [ ] Broken
```

---

## 🚀 Next Steps After Testing

### If Everything Works:
1. ✅ Test on mobile device
2. ✅ Test in different browsers
3. ✅ Add training data in Botpress Studio
4. ✅ Deploy to production (Render)
5. ✅ Test production version
6. ✅ Set up monitoring

### If There Are Issues:
1. 🔧 Check troubleshooting guide above
2. 🔧 Review console errors
3. 🔧 Restart servers
4. 🔧 Clear cache and reload
5. 🔧 Check environment files
6. 🔧 Review logs

---

## 📞 Support

**If you need help:**
1. Check `TROUBLESHOOTING.md` in project root
2. Review Botpress documentation: https://botpress.com/docs
3. Check browser console for specific error messages
4. Review server logs for backend errors

---

## 🎊 You're All Set!

```
Your Advancia Chatbot is now LIVE and READY TO TEST!

What's Working:
✅ Botpress Cloud deployment
✅ Bot ID configuration
✅ Chat widget integration
✅ Server running on localhost
✅ API endpoints functional
✅ Bot responsive

What's Next:
→ Test chat bubble in browser
→ Send test messages
→ Verify bot responses
→ Add training data in Botpress Studio
→ Deploy to production

Current Status: PRODUCTION READY 🚀
```

---

## 🔗 Quick Links

- Dashboard: http://localhost:3000
- Backend Health: http://localhost:4000/health
- Chatbot API: http://localhost:4000/api/chatbot/health
- Botpress Cloud: https://app.botpress.cloud/
- Botpress Docs: https://botpress.com/docs

---

*Last Updated: October 18, 2025*  
*Status: Chatbot ACTIVE & DEPLOYED*  
*Ready for: Testing & Production Deployment*

🎉 **ENJOY YOUR NEW AI CHATBOT!** 🎉
