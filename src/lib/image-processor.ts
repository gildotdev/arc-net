import sharp from 'sharp';

/**
 * Image preprocessing utilities for improving OCR accuracy.
 */
export class ImageProcessor {
  /**
   * Preprocess an image for OCR by converting to grayscale and enhancing contrast.
   * 
   * @param imageBuffer - Input image buffer
   * @returns Processed image buffer ready for OCR
   */
  async preprocessForOCR(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
      .greyscale()
      .normalize() // Enhance contrast
      .toBuffer();
  }

  /**
   * Resize image if it exceeds maximum dimensions while maintaining aspect ratio.
   * 
   * @param imageBuffer - Input image buffer
   * @param maxWidth - Maximum width in pixels
   * @param maxHeight - Maximum height in pixels
   * @returns Resized image buffer
   */
  async resizeIfNeeded(
    imageBuffer: Buffer,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    
    if ((metadata.width || 0) <= maxWidth && (metadata.height || 0) <= maxHeight) {
      return imageBuffer;
    }

    return sharp(imageBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();
  }

  /**
   * Get image dimensions.
   * 
   * @param imageBuffer - Input image buffer
   * @returns Width and height in pixels
   */
  async getDimensions(imageBuffer: Buffer): Promise<{ width: number; height: number }> {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0
    };
  }
}
