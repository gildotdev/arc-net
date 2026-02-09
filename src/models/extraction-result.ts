import { ExtractedItem } from './extracted-item.js';

/**
 * Represents the output of screenshot analysis (OCR + matching).
 */
export interface ExtractionResult {
  /** All items found in screenshot */
  extractedItems: ExtractedItem[];
  
  /** Time taken for OCR + matching */
  processingTimeMs: number;
  
  /** Average confidence across all extractions */
  ocrConfidenceAverage: number;
  
  /** Non-fatal issues (e.g., "Low OCR confidence for item 3") */
  warnings: string[];
  
  /** Fatal issues (e.g., "No text found in image") */
  errors: string[];
}
