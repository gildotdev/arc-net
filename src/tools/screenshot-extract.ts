import { ImageProcessor } from '../lib/image-processor.js';
import { OCRService } from '../services/ocr-service.js';
import { ItemMatcher } from '../services/item-matcher.js';
import { ExtractionResult } from '../models/extraction-result.js';

/**
 * Screenshot extraction tool input parameters
 */
export interface ExtractScreenshotParams {
  image: string; // Base64-encoded image
  enhanceOCR?: boolean; // Apply preprocessing (default: true)
}

/**
 * Screenshot extraction tool for MCP
 */
export class ScreenshotExtractTool {
  private ocrService: OCRService;
  private itemMatcher: ItemMatcher;
  private imageProcessor: ImageProcessor;

  constructor() {
    this.ocrService = new OCRService();
    this.itemMatcher = new ItemMatcher(0.7);
    this.imageProcessor = new ImageProcessor();
  }

  /**
   * Extract items from a screenshot
   * 
   * @param params - Tool parameters
   * @returns Extraction result with items, confidence, and timing
   */
  async execute(params: ExtractScreenshotParams): Promise<ExtractionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Decode base64 image
      const imageBuffer = this.decodeBase64Image(params.image);

      // Preprocess image if requested
      let processedImage = imageBuffer;
      if (params.enhanceOCR !== false) {
        try {
          processedImage = await this.imageProcessor.preprocessForOCR(imageBuffer);
        } catch (error) {
          warnings.push(`Image preprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Continue with original image
          processedImage = imageBuffer;
        }
      }

      // Extract text using OCR
      const textBlocks = await this.ocrService.extractText(processedImage);

      if (textBlocks.length === 0) {
        errors.push('No readable text found in image.');
        return {
          extractedItems: [],
          processingTimeMs: Date.now() - startTime,
          ocrConfidenceAverage: 0,
          warnings,
          errors,
        };
      }

      // Match extracted text to items
      const extractedItems = this.itemMatcher.matchMultiple(textBlocks);

      // Calculate average OCR confidence
      const ocrConfidenceAverage = this.ocrService.calculateAverageConfidence(textBlocks);

      // Add warnings for low confidence extractions
      for (const item of extractedItems) {
        if (item.confidence < 0.7) {
          warnings.push(`Low OCR confidence (${(item.confidence * 100).toFixed(0)}%) for item: ${item.itemName}`);
        }
        if (item.matchedItemName && item.matchScore && item.matchScore < 0.8) {
          warnings.push(`Low match score (${(item.matchScore * 100).toFixed(0)}%) for item: ${item.itemName} → ${item.matchedItemName}`);
        }
      }

      return {
        extractedItems,
        processingTimeMs: Date.now() - startTime,
        ocrConfidenceAverage,
        warnings,
        errors,
      };
    } catch (error) {
      errors.push(`Screenshot extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        extractedItems: [],
        processingTimeMs: Date.now() - startTime,
        ocrConfidenceAverage: 0,
        warnings,
        errors,
      };
    }
  }

  /**
   * Decode base64 image to Buffer
   * 
   * @param base64Image - Base64-encoded image (with or without data URL prefix)
   * @returns Image buffer
   */
  private decodeBase64Image(base64Image: string): Buffer {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await this.ocrService.terminate();
  }
}
