import sharp from 'sharp';

export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: ImageOptions = {
  maxWidth: 1200,
  quality: 80,
  format: 'webp',
};

/**
 * Optimize image: resize, convert to WebP, and compress
 * @param buffer - Original image buffer
 * @param options - Optimization options
 * @returns Optimized image buffer
 */
export const optimizeImage = async (
  buffer: Buffer,
  options: ImageOptions = {}
): Promise<Buffer> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    let pipeline = sharp(buffer);

    // Get image metadata
    const metadata = await pipeline.metadata();

    // Resize if needed
    if (metadata.width && metadata.width > (opts.maxWidth || 1200)) {
      pipeline = pipeline.resize({
        width: opts.maxWidth,
        height: opts.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to target format
    switch (opts.format) {
      case 'webp':
        pipeline = pipeline.webp({ quality: opts.quality });
        break;
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: opts.quality, progressive: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality: opts.quality, compressionLevel: 9 });
        break;
    }

    const optimized = await pipeline.toBuffer();
    console.log(
      `✅ Image optimized: ${(buffer.length / 1024).toFixed(1)}KB → ${(optimized.length / 1024).toFixed(1)}KB`
    );

    return optimized;
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    throw new Error('Failed to optimize image');
  }
};

/**
 * Generate thumbnail from image
 * @param buffer - Original image buffer
 * @param width - Thumbnail width (default: 400px)
 * @returns Thumbnail buffer
 */
export const generateThumbnail = async (
  buffer: Buffer,
  width: number = 400
): Promise<Buffer> => {
  try {
    const thumbnail = await sharp(buffer)
      .resize({
        width,
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 75 })
      .toBuffer();

    console.log(`✅ Thumbnail generated: ${width}px width`);
    return thumbnail;
  } catch (error) {
    console.error('❌ Thumbnail generation failed:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

/**
 * Validate if buffer contains a valid image
 * Checks format and dimensions
 */
export const isValidImage = async (buffer: Buffer): Promise<boolean> => {
  try {
    const metadata = await sharp(buffer).metadata();

    // Check if format is supported
    const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'svg'];
    if (!metadata.format || !supportedFormats.includes(metadata.format)) {
      console.warn('⚠️  Unsupported image format:', metadata.format);
      return false;
    }

    // Check minimum dimensions
    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width < 100 ||
      metadata.height < 100
    ) {
      console.warn('⚠️  Image too small:', metadata.width, 'x', metadata.height);
      return false;
    }

    // Check maximum dimensions
    if (metadata.width > 10000 || metadata.height > 10000) {
      console.warn('⚠️  Image too large:', metadata.width, 'x', metadata.height);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Image validation failed:', error);
    return false;
  }
};

/**
 * Get image metadata
 */
export const getImageMetadata = async (buffer: Buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation,
    };
  } catch (error) {
    console.error('❌ Failed to get image metadata:', error);
    throw new Error('Failed to get image metadata');
  }
};
