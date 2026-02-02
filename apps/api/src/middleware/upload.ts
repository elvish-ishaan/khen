import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { AppError, asyncHandler } from './error-handler';
import { uploadToGcs, deleteFromGcs } from '../services/gcs.service';
import { optimizeImage, isValidImage } from '../services/image.service';
import { env } from '../config/env';

// Storage configuration - MEMORY STORAGE for GCS upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        400,
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
      )
    );
  }
};

// File size limits
const MAX_FILE_SIZE = parseInt(env.MAX_FILE_SIZE);

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Middleware for different upload scenarios
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

export const uploadMultiple = (fieldName: string, maxCount: number = 4) =>
  upload.array(fieldName, maxCount);

export const uploadFields = (fields: { name: string; maxCount: number }[]) =>
  upload.fields(fields);

// Upload folder types
export type UploadFolder = 'restaurants' | 'menu-items' | 'documents' | 'profiles';

// Extend Request type to include fileUrl
export interface RequestWithFileUrl extends Request {
  fileUrl?: string;
  fileUrls?: string[];
}

/**
 * Middleware to process and upload file to GCS
 * Use after multer middleware (uploadSingle, uploadMultiple, etc.)
 */
export const processAndUploadToGcs = (
  folder: UploadFolder,
  options?: {
    isPublic?: boolean;
    optimize?: boolean;
  }
) =>
  asyncHandler(async (req: RequestWithFileUrl, res: Response, next: NextFunction) => {
    const { isPublic = true, optimize = true } = options || {};

    // Handle single file upload
    if (req.file) {
      const file = req.file;

      try {
        let buffer = file.buffer;

        // Validate and optimize images
        if (file.mimetype.startsWith('image/')) {
          const valid = await isValidImage(buffer);
          if (!valid) {
            throw new AppError(400, 'Invalid or corrupted image file');
          }

          if (optimize) {
            buffer = await optimizeImage(buffer, {
              maxWidth: folder === 'menu-items' || folder === 'restaurants' ? 1200 : 800,
              quality: 80,
              format: 'webp',
            });
          }
        }

        // Generate unique filename
        const ext = file.mimetype.startsWith('image/') && optimize ? '.webp' : path.extname(file.originalname);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
        const fileName = `${nameWithoutExt}-${uniqueSuffix}${ext}`;

        // Upload to GCS
        const fileUrl = await uploadToGcs(buffer, {
          folder,
          fileName,
          contentType: file.mimetype.startsWith('image/') && optimize ? 'image/webp' : file.mimetype,
          isPublic,
        });

        // Attach URL to request object
        req.fileUrl = fileUrl;
        console.log(`✅ File uploaded: ${fileUrl}`);

        next();
      } catch (error) {
        console.error('❌ File upload failed:', error);
        throw new AppError(500, 'File upload failed');
      }
    }
    // Handle multiple file uploads
    else if (req.files && Array.isArray(req.files)) {
      const files = req.files;

      try {
        const uploadPromises = files.map(async (file) => {
          let buffer = file.buffer;

          // Validate and optimize images
          if (file.mimetype.startsWith('image/')) {
            const valid = await isValidImage(buffer);
            if (!valid) {
              throw new AppError(400, 'Invalid or corrupted image file');
            }

            if (optimize) {
              buffer = await optimizeImage(buffer, {
                maxWidth: folder === 'menu-items' || folder === 'restaurants' ? 1200 : 800,
                quality: 80,
                format: 'webp',
              });
            }
          }

          // Generate unique filename
          const ext = file.mimetype.startsWith('image/') && optimize ? '.webp' : path.extname(file.originalname);
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
          const fileName = `${nameWithoutExt}-${uniqueSuffix}${ext}`;

          // Upload to GCS
          return uploadToGcs(buffer, {
            folder,
            fileName,
            contentType: file.mimetype.startsWith('image/') && optimize ? 'image/webp' : file.mimetype,
            isPublic,
          });
        });

        const fileUrls = await Promise.all(uploadPromises);

        // Attach URLs to request object
        req.fileUrls = fileUrls;
        console.log(`✅ ${fileUrls.length} files uploaded`);

        next();
      } catch (error) {
        console.error('❌ File upload failed:', error);
        throw new AppError(500, 'File upload failed');
      }
    }
    // Handle uploadFields (object with field names as keys)
    else if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
      const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] };

      try {
        const uploadedFiles: { [fieldname: string]: string[] } = {};

        // Process each field
        for (const [fieldName, fileArray] of Object.entries(filesObj)) {
          const fileUrls = await Promise.all(
            fileArray.map(async (file) => {
              let buffer = file.buffer;

              // Validate and optimize images
              if (file.mimetype.startsWith('image/')) {
                const valid = await isValidImage(buffer);
                if (!valid) {
                  throw new AppError(400, 'Invalid or corrupted image file');
                }

                if (optimize) {
                  buffer = await optimizeImage(buffer, {
                    maxWidth: folder === 'menu-items' || folder === 'restaurants' ? 1200 : 800,
                    quality: 80,
                    format: 'webp',
                  });
                }
              }

              // Generate unique filename
              const ext = file.mimetype.startsWith('image/') && optimize ? '.webp' : path.extname(file.originalname);
              const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
              const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
              const fileName = `${nameWithoutExt}-${uniqueSuffix}${ext}`;

              // Upload to GCS
              return uploadToGcs(buffer, {
                folder,
                fileName,
                contentType: file.mimetype.startsWith('image/') && optimize ? 'image/webp' : file.mimetype,
                isPublic,
              });
            })
          );

          uploadedFiles[fieldName] = fileUrls;
        }

        // Attach to request object
        (req as any).uploadedFiles = uploadedFiles;
        console.log(`✅ Multiple fields uploaded:`, Object.keys(uploadedFiles));

        next();
      } catch (error) {
        console.error('❌ File upload failed:', error);
        throw new AppError(500, 'File upload failed');
      }
    } else {
      // No file uploaded, continue
      next();
    }
  });

/**
 * Helper function to delete uploaded file
 * Handles both GCS and local storage
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    await deleteFromGcs(fileUrl);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

/**
 * Helper to get file URL from path
 * Handles GCS URLs only
 */
export const getFileUrl = (filePath: string): string => {
  // If it's already a full URL (GCS), return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  throw new Error('Invalid file path. Only GCS URLs are supported.');
};
