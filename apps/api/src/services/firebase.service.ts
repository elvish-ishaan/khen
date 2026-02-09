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
 * @returns Message ID on success
 */
export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<string> {
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
    return messageId;
  } catch (error) {
    console.error('❌ [FCM] Failed to send push notification:', error);
    if (error instanceof Error) {
      console.error('❌ [FCM] Error details:', error.message);
      console.error('❌ [FCM] Error stack:', error.stack);
    }
    // Log additional info for common errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('❌ [FCM] Error code:', (error as any).code);
      if ((error as any).code === 'messaging/invalid-registration-token') {
        console.error('❌ [FCM] Token is invalid or expired. User needs to re-register.');
      } else if ((error as any).code === 'messaging/registration-token-not-registered') {
        console.error('❌ [FCM] Token is not registered. User needs to re-register.');
      }
    }
    throw error;
  }
}
