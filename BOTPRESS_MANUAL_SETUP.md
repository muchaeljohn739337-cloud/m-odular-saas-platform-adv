# Botpress Manual Setup Guide

## Step 1: Create Botpress Cloud Account

1. **Go to Botpress Cloud:**
   - Visit: https://app.botpress.cloud/
   - Click "Sign Up" or "Get Started"
   - Create account with email/password or use Google/GitHub OAuth

2. **Verify your email** (if required)

---

## Step 2: Get Your Personal Access Token (PAT)

1. **Login to Botpress Cloud Dashboard:**
   - Go to: https://app.botpress.cloud/

2. **Navigate to Settings:**
   - Click on your profile icon (top right)
   - Select "Account Settings" or "Settings"

3. **Generate Personal Access Token:**
   - Go to "Developer" or "API Tokens" section
   - Click "Generate New Token" or "Create Token"
   - Give it a name: `advancia-cli-token`
   - Copy the token and **save it securely** (you won't see it again!)

---

## Step 3: Login with CLI

Once you have your PAT, run:

```powershell
bp login
```

When prompted, paste your Personal Access Token.

---

## Step 4: Create Your Bot

After successful login:

```powershell
# Create new bot project
bp create advancia-bot

# Navigate to bot directory
cd advancia-bot

# Start bot development server
bp start
```

---

## Step 5: Get Your Bot ID

### Method A: From Botpress Cloud Dashboard

1. Login to https://app.botpress.cloud/
2. Go to your "Bots" or "Workspaces" section
3. Select your bot (advancia-bot)
4. Find the Bot ID in the bot settings (usually under "General" or "Configuration")
5. Copy the Bot ID (format: `bot-xxxxx-xxxxx-xxxxx`)

### Method B: From Bot Files

After creating the bot:

```powershell
cd advancia-bot
cat bot.config.json
```

Look for the `"id"` field - that's your Bot ID.

---

## Step 6: Configure Environment Variables

### Backend Environment Variables

Edit `backend/.env`:

```env
# Botpress Configuration
BOTPRESS_BOT_ID=your-bot-id-here
BOTPRESS_WEBHOOK_SECRET=your-webhook-secret-here
```

### Frontend Environment Variables

Edit `frontend/.env.local`:

```env
# Botpress Configuration
NEXT_PUBLIC_BOTPRESS_BOT_ID=your-bot-id-here
```

---

## Step 7: Deploy Your Bot

Once you've configured your bot flows in Botpress Studio:

```powershell
cd advancia-bot
bp deploy
```

This will deploy your bot to Botpress Cloud and make it live.

---

## Step 8: Configure Webhook (After Deployment)

1. **Get your backend webhook URL:**
   - Local: `http://localhost:4000/api/chatbot/webhook`
   - Production: `https://your-render-app.onrender.com/api/chatbot/webhook`

2. **Set webhook in Botpress Cloud:**
   - Go to your bot settings in Botpress Cloud
   - Find "Webhooks" or "Integrations" section
   - Add new webhook URL
   - Select events to trigger: `message.received`, `conversation.started`

---

## Step 9: Add ChatbotWidget to Frontend

Edit `frontend/src/app/layout.tsx`:

```tsx
import ChatbotWidget from '@/components/ChatbotWidget';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
```

---

## Step 10: Test Your Chatbot

### Test Backend API:

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot/health" -Method Get

# Test FAQ
$body = @{ question = "What is KYC?" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot/faq" -Method Post -Body $body -ContentType "application/json"

# Test balance (replace user-id)
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot/balance/user-id" -Method Get
```

### Test Frontend Widget:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser to `http://localhost:3000`
4. Look for chat bubble in bottom-right corner
5. Click to open chatbot and test conversations

---

## Troubleshooting

### Issue: "Invalid token format provided"

**Solution:** Make sure you're using a Personal Access Token (PAT) from Botpress Cloud, not your password.

### Issue: "Could not list workspaces"

**Solution:** 
1. Verify your token is correct
2. Check if your Botpress Cloud account is active
3. Try regenerating the token

### Issue: Chatbot widget not appearing

**Solution:**
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_BOTPRESS_BOT_ID` is set in `frontend/.env.local`
3. Make sure Bot ID format is correct (starts with bot-)
4. Restart frontend dev server after changing .env

### Issue: Webhook not receiving events

**Solution:**
1. Verify webhook URL is publicly accessible (use ngrok for local testing)
2. Check webhook signature validation if enabled
3. Review Botpress Cloud webhook logs

---

## Alternative: Use Botpress Cloud UI Only

If you prefer not to use the CLI, you can:

1. **Create bot entirely in Botpress Cloud UI:**
   - Go to https://app.botpress.cloud/
   - Click "Create Bot"
   - Use the visual Studio interface

2. **Get Bot ID from dashboard**

3. **Configure your environment variables**

4. **Use the Webchat integration:**
   - In bot settings, enable "Webchat" channel
   - Copy the integration code
   - The Bot ID will be in the script

---

## Quick Reference

### Important URLs
- **Botpress Cloud:** https://app.botpress.cloud/
- **Documentation:** https://botpress.com/docs
- **Webchat Guide:** https://botpress.com/docs/channels/webchat

### Required Environment Variables

**Backend (.env):**
```
BOTPRESS_BOT_ID=bot-xxxxx-xxxxx-xxxxx
BOTPRESS_WEBHOOK_SECRET=your-secret
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_BOTPRESS_BOT_ID=bot-xxxxx-xxxxx-xxxxx
```

### Testing Commands

```powershell
# Install CLI
npm install -g @botpress/cli

# Login
bp login

# Create bot
bp create advancia-bot

# Start development
cd advancia-bot
bp start

# Deploy
bp deploy
```

---

## Next Steps After Setup

Once your bot is configured:

1. ✅ Test all API endpoints
2. ✅ Configure conversation flows in Botpress Studio
3. ✅ Add ChatbotWidget to frontend layout
4. ✅ Test end-to-end integration
5. ✅ Deploy to production
6. ✅ Monitor analytics at `/api/chatbot/analytics`

---

## Need Help?

- Check `CHATBOT_IMPLEMENTATION_COMPLETE.md` for API documentation
- Review `BOTPRESS_SETUP_GUIDE.md` for conversation flow examples
- Visit Botpress documentation: https://botpress.com/docs

