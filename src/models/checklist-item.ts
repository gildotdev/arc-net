/**
 * Additional context for an item (rarity, locations, traders, etc.)
 */
export interface EnrichedItemData {
  rarity?: string;
  description?: string;
  locations?: string[];
  traders?: Array<{ name: string; cost: number }>;
  imageUrl?: string;
}

/**
 * Represents a single item entry within a checklist, tracking collection progress.
 */
export interface ChecklistItem {
  /** Canonical item name (from arcraiders-data or extracted name) */
  itemName: string;
  
  /** Reference to arcraiders-data item (if matched) */
  itemId: string | null;
  
  /** Total quantity needed */
  requiredQuantity: number;
  
  /** Amount user has collected so far */
  collectedQuantity: number;
  
  /** Additional context (rarity, locations, etc.) */
  enrichedData: EnrichedItemData | null;
}
