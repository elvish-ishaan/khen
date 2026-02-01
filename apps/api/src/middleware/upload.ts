import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from './error-handler';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different upload types
const createSubDir = (subDir: string) => {
  const dir = path.join(uploadsDir, subDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

createSubDir('documents');
createSubDir('menu-items');
createSubDir('restaurants');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine destination based on field name
    let subDir = 'documents';

    if (file.fieldname.includes('menu') || file.fieldname === 'itemImage') {
      subDir = 'menu-items';
    } else if (file.fieldname === 'coverImage' || file.fieldname === 'restaurantImage') {
      subDir = 'restaurants';
    }

    cb(null, path.join(uploadsDir, subDir));
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

// Helper function to delete uploaded file
export const deleteFile = (filePath: string): void => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Helper to get file URL from path
export const getFileUrl = (filePath: string): string => {
  // Convert absolute path to relative path from uploads directory
  const relativePath = filePath.replace(/\\/g, '/').split('uploads/')[1];
  return `/uploads/${relativePath}`;
};
