/**
 * Sentry Error Tracking Initialization
 * 
 * Initializes Sentry for error tracking and performance monitoring when SENTRY_DSN is configured.
 * Import and call initSentry() in your application entry point.
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry with environment-based configuration
 */
export function initSentry(): void {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  
  if (!sentryDsn) {
    console.log('Sentry DSN not configured, skipping initialization');
    return;
  }

  const environment = process.env.NODE_ENV || 'development';

  Sentry.init({
    dsn: sentryDsn,
    environment,
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
    
    // Additional recommended options
    integrations: [
      // Enable Session Replay for debugging
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Session Replay sample rates
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter out sensitive data
    beforeSend(event) {
      // Remove sensitive data from event
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
  });

  console.log(`Sentry initialized for environment: ${environment}`);
}

export default initSentry;
