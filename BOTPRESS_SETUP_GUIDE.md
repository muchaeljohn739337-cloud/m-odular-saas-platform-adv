# Botpress Chatbot Integration - Complete Setup Guide

## 🤖 Overview

This guide will help you integrate Botpress chatbot into your Advancia platform for automated user support (RPA Use Case #6).

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Botpress Cloud account (free tier available)
- Your Advancia backend running

---

## 🚀 Step 1: Install Botpress CLI

```powershell
# Install Botpress CLI globally
npm install -g @botpress/cli

# Verify installation
bp --version
```

---

## 🔐 Step 2: Create Botpress Cloud Account

```powershell
# Login or create account
bp login
```

This will:
- Open browser to Botpress Cloud
- Create account or login
- Authenticate CLI

---

## 🏗️ Step 3: Create Your Chatbot Project

```powershell
# Create new bot
bp create advancia-bot

# Navigate to project
cd advancia-bot

# Start development server
bp start
```

The bot will be available at: `http://localhost:3000`

---

## ⚙️ Step 4: Configure Your Bot

### A. Edit bot configuration

Create/edit `advancia-bot/bot.config.json`:

```json
{
  "id": "advancia-support-bot",
  "name": "Advancia Support Bot",
  "description": "AI-powered customer support for Advancia platform",
  "version": "1.0.0",
  "author": "Advancia Team",
  "license": "MIT",
  "languages": ["en"],
  "defaultLanguage": "en",
  "imports": {
    "contentTypes": [],
    "actions": []
  },
  "messaging": {
    "channels": {
      "web": {
        "enabled": true
      }
    }
  }
}
```

### B. Create conversation flows

Create `advancia-bot/flows/main.flow.json`:

```json
{
  "version": "0.1",
  "name": "main",
  "nodes": [
    {
      "id": "entry",
      "type": "standard",
      "name": "Welcome",
      "next": [
        {
          "condition": "true",
          "node": "choice-menu"
        }
      ],
      "onEnter": [
        {
          "type": "say",
          "text": "Hello! 👋 Welcome to Advancia Support. How can I help you today?"
        }
      ]
    },
    {
      "id": "choice-menu",
      "type": "choice",
      "name": "Main Menu",
      "choices": [
        {
          "text": "💰 Account Balance",
          "value": "balance"
        },
        {
          "text": "📊 Recent Transactions",
          "value": "transactions"
        },
        {
          "text": "🔐 Security & KYC",
          "value": "kyc"
        },
        {
          "text": "💳 Crypto Orders",
          "value": "crypto"
        },
        {
          "text": "❓ FAQ",
          "value": "faq"
        },
        {
          "text": "👤 Talk to Human",
          "value": "human"
        }
      ],
      "next": [
        {
          "condition": "temp.choice === 'balance'",
          "node": "check-balance"
        },
        {
          "condition": "temp.choice === 'transactions'",
          "node": "show-transactions"
        },
        {
          "condition": "temp.choice === 'kyc'",
          "node": "kyc-help"
        },
        {
          "condition": "temp.choice === 'crypto'",
          "node": "crypto-help"
        },
        {
          "condition": "temp.choice === 'faq'",
          "node": "faq-menu"
        },
        {
          "condition": "temp.choice === 'human'",
          "node": "transfer-human"
        }
      ]
    },
    {
      "id": "check-balance",
      "type": "standard",
      "name": "Check Balance",
      "onEnter": [
        {
          "type": "action",
          "name": "getBalance",
          "url": "http://localhost:5000/api/chatbot/balance"
        },
        {
          "type": "say",
          "text": "Your current balance: ${{temp.balance}}"
        }
      ],
      "next": [
        {
          "condition": "true",
          "node": "choice-menu"
        }
      ]
    }
  ]
}
```

---

## 🔌 Step 5: Backend Integration

### A. Create chatbot API routes

I'll create the backend integration file now:

```typescript
// backend/src/rpa/chatbot.ts
```

### B. Add environment variables

Add to `backend/.env`:

```bash
# Botpress Configuration
BOTPRESS_BOT_ID=your-bot-id
BOTPRESS_WEBHOOK_URL=https://messaging.botpress.cloud
BOTPRESS_API_KEY=your-api-key
CHATBOT_ENABLED=true
```

---

## 🎨 Step 6: Frontend Widget Integration

### A. Add to Next.js layout

Edit `frontend/src/app/layout.tsx`:

```typescript
// Add Botpress webchat script
<script src="https://cdn.botpress.cloud/webchat/v1/inject.js"></script>
```

### B. Create widget component

I'll create the React component now.

---

## 📡 Step 7: Deploy Your Bot

```powershell
# Build your bot
cd advancia-bot
bp build

# Deploy to Botpress Cloud
bp deploy

# Get your bot ID
bp list
```

---

## 🧪 Testing

### Test locally:

```bash
# Start backend
cd backend
npm run dev

# Start Botpress (in another terminal)
cd advancia-bot
bp start

# Open frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` and click the chat widget!

---

## 📊 Analytics & Monitoring

### View bot analytics:
1. Go to Botpress Cloud dashboard
2. Select your bot
3. View:
   - Conversation count
   - User satisfaction
   - Most asked questions
   - Response times

---

## 🔧 Troubleshooting

### Bot not appearing?
- Check browser console for errors
- Verify `BOTPRESS_BOT_ID` in `.env`
- Ensure bot is deployed and published

### API calls failing?
- Check backend is running
- Verify chatbot routes are registered
- Check CORS settings

### Authentication issues?
- Verify `BOTPRESS_API_KEY` is correct
- Check API key hasn't expired
- Regenerate key if needed

---

## 📚 Resources

- **Botpress Docs**: https://botpress.com/docs
- **Webchat SDK**: https://botpress.com/docs/channels/web
- **API Reference**: https://botpress.com/docs/api
- **Community**: https://discord.gg/botpress

---

## 🎯 Next Steps

1. ✅ Install Botpress CLI
2. ✅ Create bot project
3. ⏳ Configure conversation flows
4. ⏳ Integrate with backend
5. ⏳ Add to frontend
6. ⏳ Deploy to production

Continue reading for complete implementation files...
