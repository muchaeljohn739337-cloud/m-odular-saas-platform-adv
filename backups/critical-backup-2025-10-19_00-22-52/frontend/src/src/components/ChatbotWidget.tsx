'use client';

import { useEffect, useState } from 'react';

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Botpress webchat script
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      setIsLoaded(true);
      
      // Initialize chatbot after script loads
      if (window.botpressWebChat) {
        // Get user data from localStorage
        const userName = localStorage.getItem('userName') || 'Guest';
        const userEmail = localStorage.getItem('userEmail') || '';
        const userId = localStorage.getItem('userId') || '';

        window.botpressWebChat.init({
          // Bot ID from environment variable
          botId: process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID || 'your-bot-id-here',
          hostUrl: 'https://cdn.botpress.cloud/webchat/v1',
          messagingUrl: 'https://messaging.botpress.cloud',
          
          // UI Configuration
          showCloseButton: true,
          enableConversationDeletion: true,
          showPoweredBy: false,
          
          // Bot behavior
          enableReset: true,
          enableTranscriptDownload: true,
          
          // User data (automatically attach user info)
          userData: {
            name: userName,
            email: userEmail,
            userId: userId,
          },
          
          // Theming
          themeColor: '#2563eb', // Advancia brand blue
          botName: 'Ask Advancia AI',
          botAvatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
          composerPlaceholder: 'Ask about Trump Coin, OTP, Med-Bed, or anything...',
          
          // Custom CSS styling
          extraStylesheet: `
            /* Header styling */
            .bpw-header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
              box-shadow: 0 2px 10px rgba(37, 99, 235, 0.2);
            }
            
            .bpw-header-title {
              font-weight: 600;
              font-size: 16px;
            }
            
            /* Bot message bubbles */
            .bpw-from-bot .bpw-chat-bubble {
              background-color: #f3f4f6 !important;
              color: #1f2937 !important;
              border-radius: 12px;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            
            /* User message bubbles */
            .bpw-from-user .bpw-chat-bubble {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
              color: white !important;
              border-radius: 12px;
              box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
            }
            
            /* Chat bubble icon (floating button) */
            .bpw-widget-btn {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4) !important;
              transition: all 0.3s ease;
            }
            
            .bpw-widget-btn:hover {
              transform: scale(1.05);
              box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5) !important;
            }
            
            /* Input composer */
            .bpw-composer {
              border-top: 1px solid #e5e7eb;
              background: #ffffff;
            }
            
            .bpw-composer-inner {
              padding: 12px;
            }
            
            .bpw-composer-textarea {
              border-radius: 20px;
              border: 2px solid #e5e7eb;
              padding: 10px 15px;
              transition: border-color 0.2s;
            }
            
            .bpw-composer-textarea:focus {
              border-color: #2563eb;
              outline: none;
            }
            
            /* Send button */
            .bpw-send-button {
              background-color: #2563eb !important;
              border-radius: 50%;
              transition: all 0.2s;
            }
            
            .bpw-send-button:hover {
              background-color: #1d4ed8 !important;
              transform: scale(1.1);
            }
            
            /* Chat container */
            .bpw-layout {
              border-radius: 16px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
              overflow: hidden;
            }
            
            /* Scrollbar */
            .bpw-msg-list::-webkit-scrollbar {
              width: 6px;
            }
            
            .bpw-msg-list::-webkit-scrollbar-track {
              background: #f1f1f1;
            }
            
            .bpw-msg-list::-webkit-scrollbar-thumb {
              background: #2563eb;
              border-radius: 3px;
            }
            
            .bpw-msg-list::-webkit-scrollbar-thumb:hover {
              background: #1d4ed8;
            }
            
            /* Typing indicator */
            .bpw-typing-bubble {
              background-color: #f3f4f6 !important;
            }
            
            /* Quick replies */
            .bpw-quick-reply {
              background-color: #ffffff !important;
              border: 2px solid #2563eb !important;
              color: #2563eb !important;
              border-radius: 20px;
              transition: all 0.2s;
            }
            
            .bpw-quick-reply:hover {
              background-color: #2563eb !important;
              color: white !important;
            }
            
            /* Welcome message enhancement */
            .bpw-bot-avatar {
              border: 2px solid #2563eb;
            }
          `,
        });

        // Send a custom event when widget loads to track analytics
        setTimeout(() => {
          if (window.botpressWebChat && userId) {
            window.botpressWebChat.sendEvent({
              type: 'widget_opened',
              userId: userId,
              timestamp: new Date().toISOString(),
            });
          }
        }, 1000);
      }
    };

    script.onerror = () => {
      console.error('Failed to load Botpress webchat script');
    };

    // Cleanup
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Show loading indicator (optional)
  if (!isLoaded) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9998,
          display: 'none', // Hidden by default, Botpress will show its own button
        }}
      >
        {/* Optional: Loading spinner */}
      </div>
    );
  }

  return null; // Widget is injected by Botpress script
}
