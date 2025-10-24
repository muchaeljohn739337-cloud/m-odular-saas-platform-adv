// Service Worker for Push Notifications
// This file handles push notifications and background sync

const CACHE_NAME = 'advancia-notifications-v1';

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);

  let data = {};

  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1,
      url: data.url || '/',
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192x192.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    requireInteraction: data.priority === 'urgent',
    silent: false,
    tag: data.tag || 'advancia-notification',
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Advancia Pay Ledger',
      options
    )
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  }).then((windowClients) => {
    // Check if there is already a window/tab open with the target URL
    for (let client of windowClients) {
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }

    // If not, open a new window/tab with the target URL
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

// Background sync for failed notifications (if supported)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'notification-retry') {
    event.waitUntil(retryFailedNotifications());
  }
});

// Function to retry failed notifications
async function retryFailedNotifications() {
  try {
    // Get failed notifications from IndexedDB or similar
    // This is a placeholder - implement based on your storage strategy
    console.log('Retrying failed notifications...');

    // Implementation would depend on how you store failed notifications
    // For now, just log that sync occurred
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
