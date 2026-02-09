import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getApps } from 'firebase/app';

/**
 * Request notification permission and get FCM token
 * @returns FCM token if successful, null otherwise
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    console.log('🔔 [FCM] Starting notification permission request...');

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('⚠️ [FCM] This browser does not support notifications');
      return null;
    }

    console.log('📱 [FCM] Current notification permission:', Notification.permission);

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('📱 [FCM] Notification permission result:', permission);

    if (permission !== 'granted') {
      console.log('❌ [FCM] Notification permission denied');
      return null;
    }

    // Get Firebase app instance
    const app = getApps()[0];
    if (!app) {
      console.error('❌ [FCM] Firebase app not initialized');
      return null;
    }
    console.log('✅ [FCM] Firebase app found');

    const messaging = getMessaging(app);
    console.log('✅ [FCM] Firebase Messaging instance created');

    // Register service worker
    let registration: ServiceWorkerRegistration;
    if ('serviceWorker' in navigator) {
      console.log('🔄 [FCM] Registering service worker...');
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ [FCM] Service worker registered:', registration.active?.state);

      await navigator.serviceWorker.ready;
      console.log('✅ [FCM] Service worker ready');
    } else {
      console.error('❌ [FCM] Service workers not supported');
      return null;
    }

    // Get VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    console.log('🔑 [FCM] VAPID key present:', !!vapidKey);
    if (!vapidKey) {
      console.error('❌ [FCM] VAPID key not configured! Check NEXT_PUBLIC_FIREBASE_VAPID_KEY');
      return null;
    }

    // Get FCM token
    console.log('🔄 [FCM] Getting FCM token...');
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('✅ [FCM] FCM token obtained:', token.substring(0, 20) + '...');
      console.log('📋 [FCM] Full token (for testing):', token);
      return token;
    } else {
      console.warn('⚠️ [FCM] No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('❌ [FCM] Error getting FCM token:', error);
    if (error instanceof Error) {
      console.error('❌ [FCM] Error details:', error.message, error.stack);
    }
    return null;
  }
}

/**
 * Listen for foreground messages (when app is in focus)
 * @param callback Function to call when message is received
 * @returns Unsubscribe function
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  try {
    console.log('🔔 [FCM] Setting up foreground message listener...');
    const app = getApps()[0];
    if (!app) {
      console.error('❌ [FCM] Firebase app not initialized');
      return () => {};
    }

    const messaging = getMessaging(app);
    console.log('✅ [FCM] Foreground listener setup complete');

    return onMessage(messaging, (payload) => {
      console.log('🔔 [FCM] Foreground message received:', payload);
      console.log('📦 [FCM] Notification:', JSON.stringify(payload.notification));
      console.log('📦 [FCM] Data:', JSON.stringify(payload.data));
      callback(payload);
    });
  } catch (error) {
    console.error('❌ [FCM] Error setting up foreground message listener:', error);
    return () => {};
  }
}

/**
 * Check if notification permission is granted
 */
export function isNotificationPermissionGranted(): boolean {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Show a browser notification (for foreground messages)
 */
export function showNotification(title: string, options?: NotificationOptions) {
  console.log('🔔 [FCM] Attempting to show notification:', title);

  if (!isNotificationPermissionGranted()) {
    console.warn('⚠️ [FCM] Cannot show notification: permission not granted');
    return;
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    console.log('✅ [FCM] Showing notification via service worker');
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        requireInteraction: true,
        ...options,
      });
      console.log('✅ [FCM] Notification displayed');
    });
  } else {
    console.log('✅ [FCM] Showing notification via Notification API');
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      ...options,
    });
  }
}
