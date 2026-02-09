/**
 * Represents a single item identified from a screenshot via OCR.
 */
export interface ExtractedItem {
  /** Raw item name extracted from OCR text */
  itemName: string;
  
  /** Number of items required (e.g., 10 from "10x Iron Ore") */
  quantity: number;
  
  /** OCR confidence score (0.0-1.0) */
  confidence: number;
  
  /** ID of matched item from arcraiders-data repository */
  matchedItemId: string | null;
  
  /** Canonical item name from database */
  matchedItemName: string | null;
  
  /** Fuzzy match score (0.0-1.0) if matched */
  matchScore: number | null;
}
