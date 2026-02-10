import admin from 'firebase-admin';
import { env } from '../config/env';
import * as fs from 'fs';
import * as path from 'path';

let initialized = false;

export function initializeFirebaseAdmin() {
  if (initialized) {
    console.log('🔥 Firebase Admin already initialized');
    return;
  }

  try {
    // Resolve the absolute path to the service account file
    const serviceAccountPath = path.resolve(process.cwd(), env.FIREBASE_SERVICE_ACCOUNT_KEY);

    // Read and parse the service account JSON file
    const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    initialized = true;
    console.log('🔥 Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

/**
 * Verify a Firebase ID token and extract user information
 * @param idToken - The Firebase ID token from the client
 * @returns Decoded token containing phone_number and other claims
 */
export async function verifyFirebaseIdToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken.phone_number) {
      throw new Error('Phone number not found in token');
    }

    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new Error('Invalid Firebase ID token');
  }
}

/**
 * Send a push notification via FCM
 * @param fcmToken - The device FCM registration token
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Optional data payload
 * @returns Object with success status, messageId (if successful), and shouldInvalidateToken flag
 */
export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; messageId?: string; shouldInvalidateToken?: boolean }> {
  try {
    console.log('📱 [FCM] Preparing to send push notification...');
    console.log('📱 [FCM] Token (first 20 chars):', fcmToken.substring(0, 20) + '...');
    console.log('📱 [FCM] Title:', title);
    console.log('📱 [FCM] Body:', body);
    console.log('📱 [FCM] Data:', JSON.stringify(data));

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data,
      token: fcmToken,
      // Add Android and APNS (iOS) specific configurations for better delivery
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'orders',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          requireInteraction: true,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
        },
      },
    };

    console.log('🔄 [FCM] Sending message via Firebase Admin SDK...');
    const messageId = await admin.messaging().send(message);
    console.log(`✅ [FCM] Push notification sent successfully! Message ID: ${messageId}`);
    return { success: true, messageId };
  } catch (error) {
    // Handle FCM errors gracefully - these are operational errors, not fatal
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as any).code;

      // Token-related errors - should invalidate the token in database
      if (
        errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered' ||
        errorCode === 'messaging/invalid-argument'
      ) {
        console.warn(
          `⚠️ [FCM] Token is invalid or not registered (${errorCode}). Token should be cleared from database.`
        );
        return { success: false, shouldInvalidateToken: true };
      }

      // Other FCM errors (quota exceeded, internal error, etc.)
      console.error(`❌ [FCM] FCM error (${errorCode}):`, (error as any).message);
    } else {
      console.error('❌ [FCM] Unexpected error sending push notification:', error);
    }

    // Return failure but don't throw - this prevents notification failures from breaking business logic
    return { success: false };
  }
}
