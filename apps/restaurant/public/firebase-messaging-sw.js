// Firebase Messaging Service Worker for background push notifications
// This file must be in the public directory and accessible at /firebase-messaging-sw.js
// Version: 2.0 - Enhanced logging and error handling

console.log('🚀 [SW] Service worker script loading...', new Date().toISOString());

importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

console.log('✅ [SW] Firebase scripts loaded successfully');

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
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ [SW] Firebase initialized successfully');
} catch (error) {
  console.error('❌ [SW] Failed to initialize Firebase:', error);
}

const messaging = firebase.messaging();
console.log('📱 [SW] Firebase Messaging instance created');

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Service worker activated', new Date().toISOString());
  event.waitUntil(self.clients.claim());
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('📦 [SW] Service worker installed', new Date().toISOString());
  self.skipWaiting();
});

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔔 [SW] BACKGROUND MESSAGE RECEIVED', new Date().toISOString());
  console.log('═══════════════════════════════════════════════════');
  console.log('📦 [SW] Full payload:', JSON.stringify(payload, null, 2));
  console.log('📦 [SW] Notification object:', JSON.stringify(payload.notification, null, 2));
  console.log('📦 [SW] Data object:', JSON.stringify(payload.data, null, 2));

  try {
    const notificationTitle = payload.notification?.title || payload.data?.title || 'New Order!';
    const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new order';

    const notificationOptions = {
      body: notificationBody,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: payload.data?.orderId || 'order-notification',
      data: payload.data,
      requireInteraction: true, // Keep notification visible until user interacts
      vibrate: [200, 100, 200], // Vibration pattern
      timestamp: Date.now(),
      actions: [
        {
          action: 'view',
          title: 'View Order',
          icon: '/icons/icon-192x192.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    console.log('✅ [SW] Notification title:', notificationTitle);
    console.log('✅ [SW] Notification options:', JSON.stringify(notificationOptions, null, 2));
    console.log('🔔 [SW] Showing notification now...');

    return self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log('✅ [SW] Notification displayed successfully!');
      })
      .catch((error) => {
        console.error('❌ [SW] Error showing notification:', error);
      });
  } catch (error) {
    console.error('❌ [SW] Error processing background message:', error);
  }
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
