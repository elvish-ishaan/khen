import { Storage, Bucket } from '@google-cloud/storage';
import { env } from '../config/env';

let storageInstance: Storage | null = null;
let bucketInstance: Bucket | null = null;

/**
 * Get singleton GCS Storage instance
 * Throws error if GCS is not properly configured
 */
export const getGcsInstance = (): Storage => {
  if (!env.GCS_ENABLED) {
    throw new Error('Google Cloud Storage is disabled. Set GCS_ENABLED=true in environment variables.');
  }

  if (storageInstance) {
    return storageInstance;
  }

  if (!env.GCS_PROJECT_ID || !env.GCS_KEY_FILE) {
    throw new Error('GCS_PROJECT_ID and GCS_KEY_FILE must be configured when GCS is enabled.');
  }

  try {
    storageInstance = new Storage({
      projectId: env.GCS_PROJECT_ID,
      keyFilename: env.GCS_KEY_FILE,
    });
    console.log('✅ GCS Storage initialized');
    return storageInstance;
  } catch (error) {
    console.error('❌ Failed to initialize GCS Storage:', error);
    throw new Error('Failed to initialize Google Cloud Storage. Check your credentials.');
  }
};

/**
 * Get singleton GCS Bucket instance
 * Throws error if GCS is not properly configured
 */
export const getBucket = (): Bucket => {
  if (!env.GCS_ENABLED || !env.GCS_BUCKET_NAME) {
    throw new Error('Google Cloud Storage is not configured. Set GCS_ENABLED=true and GCS_BUCKET_NAME in environment variables.');
  }

  if (bucketInstance) {
    return bucketInstance;
  }

  const storage = getGcsInstance();
  bucketInstance = storage.bucket(env.GCS_BUCKET_NAME);
  return bucketInstance;
};

export interface UploadOptions {
  folder: 'restaurants' | 'menu-items' | 'documents' | 'profiles';
  fileName: string;
  contentType: string;
  isPublic?: boolean;
}

/**
 * Upload buffer to GCS
 * @returns Public URL
 */
export const uploadToGcs = async (
  buffer: Buffer,
  options: UploadOptions
): Promise<string> => {
  const bucket = getBucket();

  const { folder, fileName, contentType, isPublic = true } = options;
  const filePath = `${folder}/${fileName}`;

  const file = bucket.file(filePath);

  await file.save(buffer, {
    contentType,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
    resumable: false,
  });

  if (isPublic) {
    await file.makePublic();
  }

  // Return CDN URL if configured, otherwise GCS public URL
  if (env.GCS_CDN_URL) {
    return `${env.GCS_CDN_URL}/${filePath}`;
  }

  return `https://storage.googleapis.com/${env.GCS_BUCKET_NAME}/${filePath}`;
};

/**
 * Delete file from GCS
 * Handles GCS URLs only
 */
export const deleteFromGcs = async (fileUrl: string): Promise<void> => {
  if (!fileUrl) return;

  const bucket = getBucket();

  if (!isGcsUrl(fileUrl)) {
    console.warn('⚠️  URL is not a valid GCS URL:', fileUrl);
    return;
  }

  const filePath = extractGcsPath(fileUrl);
  if (!filePath) {
    console.warn('⚠️  Could not extract GCS path from URL:', fileUrl);
    return;
  }

  const file = bucket.file(filePath);
  await file.delete({ ignoreNotFound: true });
  console.log('✅ Deleted from GCS:', filePath);
};

/**
 * Generate signed URL for private files (documents)
 * @param fileUrl - GCS file URL
 * @param expiresIn - Expiration time in seconds (default: 15 minutes)
 */
export const getSignedUrl = async (
  fileUrl: string,
  expiresIn: number = 900
): Promise<string> => {
  const bucket = getBucket();

  if (!isGcsUrl(fileUrl)) {
    throw new Error('URL is not a valid GCS URL');
  }

  const filePath = extractGcsPath(fileUrl);
  if (!filePath) {
    throw new Error('Could not extract GCS path from URL');
  }

  const file = bucket.file(filePath);
  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresIn * 1000,
  });

  return signedUrl;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if URL is a GCS URL
 */
const isGcsUrl = (url: string): boolean => {
  return (
    url.includes('storage.googleapis.com') ||
    (!!env.GCS_CDN_URL && url.startsWith(env.GCS_CDN_URL))
  );
};

/**
 * Extract GCS file path from URL
 */
const extractGcsPath = (url: string): string | null => {
  if (env.GCS_CDN_URL && url.startsWith(env.GCS_CDN_URL)) {
    return url.replace(`${env.GCS_CDN_URL}/`, '');
  }

  if (url.includes('storage.googleapis.com')) {
    const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)/);
    return match ? match[1] : null;
  }

  return null;
};
