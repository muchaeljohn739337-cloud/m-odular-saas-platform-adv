import { BotDefinition } from '@botpress/sdk'

export default new BotDefinition({
  name: 'Advancia AI Assistant',
  description: 'AI-powered assistant for Advancia platform - helps with transactions, Trump Coin, Med-Bed analytics, OTP, and account recovery',
  version: '1.0.0',
  configuration: {
    schema: {
      type: 'object',
      properties: {
        apiUrl: {
          type: 'string',
          title: 'API URL',
          description: 'Backend API URL',
          default: 'http://localhost:4000'
        },
        enableAnalytics: {
          type: 'boolean',
          title: 'Enable Analytics',
          description: 'Track user interactions',
          default: true
        }
      }
    }
  },
  states: {
    type: 'conversation',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        userName: { type: 'string' },
        conversationTopic: { type: 'string' },
        lastQuery: { type: 'string' }
      }
    }
  },
  events: {},
  recurringEvents: {},
  user: {
    tags: {
      authenticated: { title: 'Authenticated User' },
      verified: { title: 'KYC Verified' },
      premium: { title: 'Premium Member' }
    }
  },
  conversation: {
    tags: {
      support: { title: 'Support Conversation' },
      transaction: { title: 'Transaction Query' },
      medbed: { title: 'Med-Bed Analytics' },
      trumpCoin: { title: 'Trump Coin Query' }
    }
  }
})
