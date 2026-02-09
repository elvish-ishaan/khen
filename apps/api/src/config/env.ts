import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3001,http://localhost:3002')
    .transform((val) => val.split(',').map((origin) => origin.trim())),
  COOKIE_DOMAIN: z.string().optional(), // e.g., .dryink.space for subdomain sharing
  // Firebase Admin SDK
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().min(1, 'Firebase service account key file path required'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  // Google Cloud Storage - REQUIRED for image uploads
  GCS_ENABLED: z.string().default('true').transform((v) => v === 'true'),
  GCS_PROJECT_ID: z.string().min(1, 'GCS_PROJECT_ID is required for image uploads'),
  GCS_BUCKET_NAME: z.string().min(1, 'GCS_BUCKET_NAME is required for image uploads'),
  GCS_KEY_FILE: z.string().min(1, 'GCS_KEY_FILE path is required for image uploads'),
  GCS_CDN_URL: z.string().optional(),
  MAX_FILE_SIZE: z.string().default('5242880'), // 5MB
  // Google Maps API
  GOOGLE_MAPS_API_KEY: z.string().min(20, 'Google Maps API key required'),
  // Delivery Pricing
  COST_PER_KM: z.string().default('20').transform(Number),
  MIN_DELIVERY_FEE: z.string().default('20').transform(Number),
  MAX_DELIVERY_DISTANCE: z.string().default('15').transform(Number),
  // Frontend URLs
  RESTAURANT_APP_URL: z.string().url().default('http://localhost:3001'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
