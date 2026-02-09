import { FuzzyMatcher } from '../lib/fuzzy-match.js';
import { ExtractedItem } from '../models/extracted-item.js';
import { OCRTextBlock } from './ocr-service.js';

/**
 * Item database entry (from arcraiders-data)
 */
export interface ItemDatabaseEntry {
  id: string;
  name: string;
}

/**
 * Item Matcher Service for matching OCR text to game items
 */
export class ItemMatcher {
  private fuzzyMatcher: FuzzyMatcher;
  private itemDatabase: ItemDatabaseEntry[] = [];

  constructor(matchThreshold: number = 0.7) {
    this.fuzzyMatcher = new FuzzyMatcher(matchThreshold);
  }

  /**
   * Load item database for matching
   * 
   * @param items - Array of item database entries
   */
  loadItemDatabase(items: ItemDatabaseEntry[]): void {
    this.itemDatabase = items;
  }

  /**
   * Extract quantity from text like "10x Iron Ore" or "5 Steel Bar"
   * 
   * @param text - Text containing item name and possibly quantity
   * @returns Object with quantity and cleaned item name
   */
  extractQuantity(text: string): { quantity: number; itemName: string } {
    // Match patterns like "10x", "10 x", "x10", "5"
    const patterns = [
      /^(\d+)\s*x\s+(.+)$/i,  // "10x Iron Ore"
      /^(\d+)\s+(.+)$/,        // "10 Iron Ore"
      /^(.+?)\s*x\s*(\d+)$/i,  // "Iron Ore x10"
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Check which group has the number
        const num1 = parseInt(match[1]);
        const num2 = parseInt(match[2]);
        
        if (!isNaN(num1) && isNaN(num2)) {
          return { quantity: num1, itemName: match[2].trim() };
        } else if (isNaN(num1) && !isNaN(num2)) {
          return { quantity: num2, itemName: match[1].trim() };
        }
      }
    }

    // No quantity found, default to 1
    return { quantity: 1, itemName: text.trim() };
  }

  /**
   * Match a single OCR text block to an item in the database
   * 
   * @param textBlock - OCR extracted text with confidence
   * @returns ExtractedItem with match information, or null if no match
   */
  matchItem(textBlock: OCRTextBlock): ExtractedItem | null {
    const { quantity, itemName } = this.extractQuantity(textBlock.text);

    if (this.itemDatabase.length === 0) {
      // No database loaded, return unmatched item
      return {
        itemName,
        quantity,
        confidence: textBlock.confidence,
        matchedItemId: null,
        matchedItemName: null,
        matchScore: null,
      };
    }

    const itemNames = this.itemDatabase.map(item => item.name);
    const matchResult = this.fuzzyMatcher.findBestMatch(itemName, itemNames);

    if (!matchResult) {
      // No match found
      return {
        itemName,
        quantity,
        confidence: textBlock.confidence,
        matchedItemId: null,
        matchedItemName: null,
        matchScore: null,
      };
    }

    // Find the item entry
    const matchedItem = this.itemDatabase.find(item => item.name === matchResult.target);

    return {
      itemName,
      quantity,
      confidence: textBlock.confidence,
      matchedItemId: matchedItem?.id || null,
      matchedItemName: matchResult.target,
      matchScore: matchResult.normalizedScore,
    };
  }

  /**
   * Match multiple OCR text blocks to items
   * 
   * @param textBlocks - Array of OCR extracted text blocks
   * @returns Array of ExtractedItems
   */
  matchMultiple(textBlocks: OCRTextBlock[]): ExtractedItem[] {
    const results: ExtractedItem[] = [];

    for (const textBlock of textBlocks) {
      const item = this.matchItem(textBlock);
      if (item) {
        results.push(item);
      }
    }

    return results;
  }
}
