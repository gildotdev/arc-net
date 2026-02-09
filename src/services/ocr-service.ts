import { createWorker, Worker, RecognizeResult } from 'tesseract.js';

/**
 * OCR extraction result for a single text block
 */
export interface OCRTextBlock {
  text: string;
  confidence: number;
}

/**
 * OCR Service for extracting text from images using Tesseract.js
 */
export class OCRService {
  private worker: Worker | null = null;
  private initialized = false;

  /**
   * Initialize the OCR worker with English language model
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.worker = await createWorker('eng');
    this.initialized = true;
  }

  /**
   * Extract text from an image buffer
   * 
   * @param imageBuffer - Image data as Buffer
   * @returns Array of text blocks with confidence scores
   */
  async extractText(imageBuffer: Buffer): Promise<OCRTextBlock[]> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker failed to initialize');
    }

    try {
      const result = await this.worker.recognize(imageBuffer);
      
      // Extract text blocks with confidence scores
      const textBlocks: OCRTextBlock[] = [];

      // Tesseract.js provides text and confidence
      if (result.data.text) {
        // Split by lines and use overall confidence
        const lines = result.data.text.split('\n').filter(l => l.trim().length > 0);
        const avgConfidence = result.data.confidence / 100;
        
        for (const line of lines) {
          textBlocks.push({
            text: line.trim(),
            confidence: avgConfidence,
          });
        }
      }

      return textBlocks;
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate average confidence across all text blocks
   * 
   * @param textBlocks - Array of OCR text blocks
   * @returns Average confidence score (0.0-1.0)
   */
  calculateAverageConfidence(textBlocks: OCRTextBlock[]): number {
    if (textBlocks.length === 0) {
      return 0;
    }

    const sum = textBlocks.reduce((acc, block) => acc + block.confidence, 0);
    return sum / textBlocks.length;
  }

  /**
   * Clean up resources
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }
}
