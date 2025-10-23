/**
 * Sentry Error Tracking Initialization (DISABLED - @sentry/nextjs not installed)
 */

export function initSentry(): void {
  console.log('Sentry not configured');
  return;
}

export function captureException(error: Error): void {
  console.error('Error (Sentry disabled):', error);
}

export function captureMessage(message: string): void {
  console.log('Message (Sentry disabled):', message);
}

export function setUser(user: { id: string; email?: string } | null): void {
  if (user) console.log('Set user context:', user.id);
}