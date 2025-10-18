'use client';

import { useEffect } from 'react';

interface BotpressConfig {
  botId: string;
  hostUrl: string;
  messagingUrl: string;
  [key: string]: unknown;
}

interface BotpressWebChatWindow extends Window {
  botpressWebChat?: {
    init: (config: BotpressConfig) => void;
    sendEvent: (event: Record<string, unknown>) => void;
    mergeConfig: (config: Partial<BotpressConfig>) => void;
  };
}

declare const window: BotpressWebChatWindow;

export default function ChatbotWidget() {
  useEffect(() => {
    // Load Botpress webchat script
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize chatbot after script loads
      if (window.botpressWebChat) {
        window.botpressWebChat.init({
          // Replace with your actual bot ID from Botpress Cloud
          botId: process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID || 'your-bot-id',
          hostUrl: 'https://cdn.botpress.cloud/webchat/v1',
          messagingUrl: 'https://messaging.botpress.cloud',
          
          // UI Configuration
          showCloseButton: true,
          enableConversationDeletion: true,
          showPoweredBy: false,
          
          // Styling
          stylesheet: 'https://cdn.botpress.cloud/webchat/v1/themes/default.css',
          
          // Custom styling
          containerWidth: '100%25',
          layoutWidth: '100%25',
          
          // Bot behavior
          enableReset: true,
          enableTranscriptDownload: false,
          
          // User data (if logged in)
          userData: {
            name: localStorage.getItem('userName') || 'Guest',
            email: localStorage.getItem('userEmail') || '',
            userId: localStorage.getItem('userId') || '',
          },
          
          // Theming
          themeColor: '#2563eb', // Advancia blue
          botName: 'Advancia Support',
          botAvatar: '/bot-avatar.png',
          
          // Welcome message
          extraStylesheet: `
            .bpw-header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            }
            .bpw-from-bot .bpw-chat-bubble {
              background-color: #f3f4f6;
              color: #1f2937;
            }
            .bpw-from-user .bpw-chat-bubble {
              background-color: #2563eb;
              color: white;
            }
          `,
        });
      }
    };

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // Widget is injected by Botpress script
}
