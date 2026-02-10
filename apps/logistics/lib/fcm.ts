import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getApps } from 'firebase/app';

/**
 * Request notification permission and get FCM token
 * @returns FCM token if successful, null otherwise
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    console.log('🔔 [FCM] Starting notification permission request...');
    console.log('🌐 [FCM] Current URL protocol:', window.location.protocol);
    console.log('🌐 [FCM] Current URL host:', window.location.host);

    // Check if HTTPS or localhost (required for service workers)
    if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
      console.error('❌ [FCM] Service workers require HTTPS or localhost!');
      console.error('❌ [FCM] Current protocol:', window.location.protocol);
      alert('⚠️ Push notifications require HTTPS. Please access the app via HTTPS.');
      return null;
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('⚠️ [FCM] This browser does not support notifications');
      alert('⚠️ Your browser does not support push notifications.');
      return null;
    }

    console.log('📱 [FCM] Current notification permission:', Notification.permission);

    // Check if permission is already denied
    if (Notification.permission === 'denied') {
      console.error('❌ [FCM] Notification permission is DENIED by browser');
      console.error('❌ [FCM] User must manually enable notifications in browser settings');
      alert('⚠️ Notifications are blocked. Please enable them in your browser settings:\n\n1. Click the lock/info icon in the address bar\n2. Find "Notifications"\n3. Change to "Allow"');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('📱 [FCM] Notification permission result:', permission);

    if (permission !== 'granted') {
      console.log('❌ [FCM] Notification permission denied');
      alert('❌ Notification permission denied. You won\'t receive order notifications.');
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

    // Unregister any existing service workers first (cleanup)
    if ('serviceWorker' in navigator) {
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      console.log(`🔄 [FCM] Found ${existingRegistrations.length} existing service worker(s)`);

      for (const reg of existingRegistrations) {
        if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
          console.log('🔄 [FCM] Unregistering old service worker:', reg.active?.scriptURL);
          await reg.unregister();
        }
      }
    }

    // Register service worker
    let registration: ServiceWorkerRegistration;
    if ('serviceWorker' in navigator) {
      console.log('🔄 [FCM] Registering new service worker...');
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always fetch fresh service worker
      });
      console.log('✅ [FCM] Service worker registered');
      console.log('📋 [FCM] Registration scope:', registration.scope);
      console.log('📋 [FCM] Active state:', registration.active?.state);
      console.log('📋 [FCM] Installing state:', registration.installing?.state);
      console.log('📋 [FCM] Waiting state:', registration.waiting?.state);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ [FCM] Service worker is ready and active');

      // Double-check the service worker is controlling the page
      if (!navigator.serviceWorker.controller) {
        console.warn('⚠️ [FCM] Service worker is not controlling the page. Reloading...');
        window.location.reload();
        return null;
      }
      console.log('✅ [FCM] Service worker is controlling the page');
    } else {
      console.error('❌ [FCM] Service workers not supported');
      alert('❌ Your browser does not support service workers.');
      return null;
    }

    // Get VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    console.log('🔑 [FCM] VAPID key present:', !!vapidKey);
    if (!vapidKey) {
      console.error('❌ [FCM] VAPID key not configured! Check NEXT_PUBLIC_FIREBASE_VAPID_KEY');
      console.error('❌ [FCM] Get VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates');
      alert('❌ VAPID key not configured. Contact administrator.');
      return null;
    }
    console.log('🔑 [FCM] VAPID key (first 10 chars):', vapidKey.substring(0, 10) + '...');

    // Get FCM token
    console.log('🔄 [FCM] Getting FCM token...');
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('✅ [FCM] FCM token obtained successfully!');
      console.log('📱 [FCM] Token (first 20 chars):', token.substring(0, 20) + '...');
      console.log('📋 [FCM] Full token (for testing):', token);
      return token;
    } else {
      console.warn('⚠️ [FCM] No FCM token available');
      console.warn('⚠️ [FCM] This may happen if notifications are blocked or service worker failed');
      return null;
    }
  } catch (error) {
    console.error('❌ [FCM] Error getting FCM token:', error);
    if (error instanceof Error) {
      console.error('❌ [FCM] Error message:', error.message);
      console.error('❌ [FCM] Error stack:', error.stack);

      // Provide helpful error messages
      if (error.message.includes('messaging/permission-blocked')) {
        alert('❌ Notifications are blocked in your browser. Please enable them in browser settings.');
      } else if (error.message.includes('messaging/unsupported-browser')) {
        alert('❌ Your browser does not support push notifications.');
      } else if (error.message.includes('messaging/failed-service-worker-registration')) {
        alert('❌ Failed to register service worker. Please check if you\'re using HTTPS.');
      } else {
        alert(`❌ Failed to setup notifications: ${error.message}`);
      }
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

/**
 * Diagnostic function to check FCM setup
 * @returns Object with diagnostic information
 */
export async function checkFcmStatus(): Promise<{
  isSupported: boolean;
  permission: NotificationPermission;
  isHttps: boolean;
  serviceWorkerSupported: boolean;
  serviceWorkerActive: boolean;
  vapidKeyConfigured: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  // Check HTTPS
  const isHttps = window.location.protocol === 'https:' || window.location.hostname.includes('localhost');
  if (!isHttps) {
    issues.push('Not using HTTPS - service workers require HTTPS or localhost');
  }

  // Check notification support
  const isSupported = 'Notification' in window;
  if (!isSupported) {
    issues.push('Browser does not support notifications');
  }

  // Check permission
  const permission = isSupported ? Notification.permission : 'denied';
  if (permission === 'denied') {
    issues.push('Notification permission is denied - must be enabled in browser settings');
  } else if (permission === 'default') {
    issues.push('Notification permission not yet requested');
  }

  // Check service worker support
  const serviceWorkerSupported = 'serviceWorker' in navigator;
  if (!serviceWorkerSupported) {
    issues.push('Service workers not supported in this browser');
  }

  // Check service worker registration
  let serviceWorkerActive = false;
  if (serviceWorkerSupported) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const fcmSW = registrations.find((reg) =>
      reg.active?.scriptURL.includes('firebase-messaging-sw.js')
    );
    serviceWorkerActive = !!fcmSW?.active;

    if (!serviceWorkerActive) {
      issues.push('Firebase messaging service worker is not active');
    }

    if (!navigator.serviceWorker.controller) {
      issues.push('No service worker is controlling this page');
    }
  }

  // Check VAPID key
  const vapidKeyConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKeyConfigured) {
    issues.push('VAPID key (NEXT_PUBLIC_FIREBASE_VAPID_KEY) not configured');
  }

  const status = {
    isSupported,
    permission,
    isHttps,
    serviceWorkerSupported,
    serviceWorkerActive,
    vapidKeyConfigured,
    issues,
  };

  console.log('🔍 [FCM] Diagnostic status:', status);
  return status;
}
