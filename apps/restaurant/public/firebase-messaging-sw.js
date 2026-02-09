// Firebase Messaging Service Worker for background push notifications
// This file must be in the public directory and accessible at /firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

// IMPORTANT: Replace these with your actual Firebase config values
// These must be hardcoded because service workers can't access env variables
const firebaseConfig = {
  apiKey: "AIzaSyDh-6qiZAofoyvbWuxaUBAFua-2xeEoYhY",
  authDomain: "daavat-2144e.firebaseapp.com",
  projectId: "daavat-2144e",
  storageBucket: "daavat-2144e.firebasestorage.app",
  messagingSenderId: "436198867572",
  appId: "1:436198867572:web:9097ec79c32732dd58c721",
  measurementId: "G-LPQ4VFS7TT"
};

// Initialize Firebase app
console.log('🔥 [SW] Initializing Firebase in service worker...');
firebase.initializeApp(firebaseConfig);
console.log('✅ [SW] Firebase initialized successfully');

const messaging = firebase.messaging();
console.log('📱 [SW] Firebase Messaging instance created');

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 [SW] Received background message:', payload);
  console.log('📦 [SW] Notification data:', JSON.stringify(payload.notification));
  console.log('📦 [SW] Custom data:', JSON.stringify(payload.data));

  const notificationTitle = payload.notification?.title || 'New Order!';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new order',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: payload.data?.orderId || 'order-notification',
    data: payload.data,
    requireInteraction: true, // Keep notification visible until user interacts
    actions: [
      {
        action: 'view',
        title: 'View Order',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  console.log('✅ [SW] Showing notification:', notificationTitle);
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ [SW] Notification clicked:', event);
  console.log('📦 [SW] Action:', event.action);
  console.log('📦 [SW] Data:', event.notification.data);

  event.notification.close();

  if (event.action === 'view') {
    // Open the order detail page
    const orderId = event.notification.data?.orderId;
    const url = orderId ? `/dashboard/orders/${orderId}` : '/dashboard/orders';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});
