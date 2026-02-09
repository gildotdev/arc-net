# Data Model: Screenshot Item Tracking

**Feature**: 002-screenshot-item-tracking  
**Date**: 2026-02-09

## Overview

This document defines the core data structures for screenshot-based item tracking, including extracted items, checklists, and persistence formats.

---

## Entity: ExtractedItem

Represents a single item identified from a screenshot via OCR.

**Fields**:
- `itemName`: string - Raw item name extracted from OCR text
- `quantity`: number - Number of items required (e.g., 10 from "10x Iron Ore")
- `confidence`: number - OCR confidence score (0.0-1.0)
- `matchedItemId`: string | null - ID of matched item from arcraiders-data repository
- `matchedItemName`: string | null - Canonical item name from database
- `matchScore`: number | null - Fuzzy match score (0.0-1.0) if matched

**Validation Rules**:
- `quantity` must be positive integer (1-999)
- `confidence` range [0.0, 1.0]
- If `matchedItemId` is set, `matchedItemName` and `matchScore` must also be set
- `itemName` cannot be empty string

**State Transitions**: Immutable once created (extracted items are read-only)

**TypeScript Definition**:
```typescript
interface ExtractedItem {
  itemName: string;
  quantity: number;
  confidence: number;
  matchedItemId: string | null;
  matchedItemName: string | null;
  matchScore: number | null;
}
```

---

## Entity: ChecklistItem

Represents a single item entry within a checklist, tracking collection progress.

**Fields**:
- `itemName`: string - Canonical item name (from arcraiders-data or extracted name)
- `itemId`: string | null - Reference to arcraiders-data item (if matched)
- `requiredQuantity`: number - Total quantity needed
- `collectedQuantity`: number - Amount user has collected so far
- `enrichedData`: EnrichedItemData | null - Additional context (rarity, locations, etc.)

**Validation Rules**:
- `collectedQuantity` must be <= `requiredQuantity`
- `collectedQuantity` >= 0
- `requiredQuantity` > 0
- `itemName` cannot be empty

**State Transitions**:
- `collectedQuantity` can increment from 0 to `requiredQuantity`
- `collectedQuantity` can decrement (user correction)
- Item is "complete" when `collectedQuantity === requiredQuantity`

**TypeScript Definition**:
```typescript
interface ChecklistItem {
  itemName: string;
  itemId: string | null;
  requiredQuantity: number;
  collectedQuantity: number;
  enrichedData: EnrichedItemData | null;
}

interface EnrichedItemData {
  rarity?: string;
  description?: string;
  locations?: string[];
  traders?: Array<{ name: string; cost: number }>;
  imageUrl?: string;
}
```

---

## Entity: Checklist

Represents a complete checklist for tracking upgrade/mission requirements.

**Fields**:
- `id`: string - Unique identifier (UUID)
- `name`: string - User-provided or auto-generated name (e.g., "Hideout Level 3 Upgrade")
- `items`: ChecklistItem[] - List of items to collect
- `createdAt`: string - ISO 8601 timestamp
- `updatedAt`: string - ISO 8601 timestamp (last modification)
- `completionPercentage`: number - Calculated (total collected / total required * 100)
- `isComplete`: boolean - True when all items collected
- `metadata`: ChecklistMetadata - Additional tracking info

**Validation Rules**:
- `id` must be unique across all checklists
- `items` array cannot be empty
- `completionPercentage` range [0, 100]
- `createdAt` <= `updatedAt`
- `name` length 1-100 characters

**State Transitions**:
- Created with `collectedQuantity = 0` for all items
- Updates increment/decrement `collectedQuantity` on items
- `completionPercentage` recalculated on each update
- `isComplete` set to true when all items reach required quantities
- `updatedAt` refreshed on every modification

**TypeScript Definition**:
```typescript
interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  completionPercentage: number;
  isComplete: boolean;
  metadata: ChecklistMetadata;
}

interface ChecklistMetadata {
  sourceScreenshotHash?: string; // Hash of original screenshot
  tier?: string; // For multi-tier upgrades (e.g., "Tier 1", "Tier 2")
  tags?: string[]; // User-defined tags for organization
}
```

---

## Entity: ExtractionResult

Represents the output of screenshot analysis (OCR + matching).

**Fields**:
- `extractedItems`: ExtractedItem[] - All items found in screenshot
- `processingTimeMs`: number - Time taken for OCR + matching
- `ocrConfidenceAverage`: number - Average confidence across all extractions
- `warnings`: string[] - Non-fatal issues (e.g., "Low OCR confidence for item 3")
- `errors`: string[] - Fatal issues (e.g., "No text found in image")

**Validation Rules**:
- `extractedItems` can be empty array (no items found)
- `processingTimeMs` >= 0
- `ocrConfidenceAverage` range [0.0, 1.0]

**TypeScript Definition**:
```typescript
interface ExtractionResult {
  extractedItems: ExtractedItem[];
  processingTimeMs: number;
  ocrConfidenceAverage: number;
  warnings: string[];
  errors: string[];
}
```

---

## Relationships

```
Checklist (1) --- (N) ChecklistItem
ChecklistItem (N) --- (1) ArcRaidersItem [from 001-arcraiders-data]
ExtractionResult (1) --- (N) ExtractedItem
ExtractedItem (N) --- (0..1) ArcRaidersItem [optional match]
```

**Key Relationships**:
- A Checklist contains multiple ChecklistItems
- ChecklistItems reference ArcRaidersItem data for enrichment
- ExtractionResult produces multiple ExtractedItems
- ExtractedItems may match to ArcRaidersItems via fuzzy matching

---

## Persistence Format (JSON Files)

**File Location**: `data/checklists/{checklistId}.json`

**File Structure**:
```json
{
  "id": "uuid-v4-string",
  "name": "Hideout Level 3 Upgrade",
  "items": [
    {
      "itemName": "Iron Ore",
      "itemId": "item_iron_ore_001",
      "requiredQuantity": 10,
      "collectedQuantity": 3,
      "enrichedData": {
        "rarity": "Common",
        "locations": ["Canyon", "Ruins"],
        "traders": [
          { "name": "Marcus", "cost": 50 }
        ]
      }
    }
  ],
  "createdAt": "2026-02-09T01:30:00.000Z",
  "updatedAt": "2026-02-09T02:15:00.000Z",
  "completionPercentage": 30,
  "isComplete": false,
  "metadata": {
    "sourceScreenshotHash": "sha256-abc123...",
    "tier": "Level 3",
    "tags": ["hideout", "upgrade"]
  }
}
```

**Index File**: `data/checklists/index.json` (optional, for fast listing)
```json
{
  "checklists": [
    {
      "id": "uuid-1",
      "name": "Hideout Level 3 Upgrade",
      "completionPercentage": 30,
      "updatedAt": "2026-02-09T02:15:00.000Z"
    }
  ]
}
```

---

## Computed Properties

**Checklist.completionPercentage**:
```typescript
function calculateCompletion(checklist: Checklist): number {
  const totalRequired = checklist.items.reduce((sum, item) => sum + item.requiredQuantity, 0);
  const totalCollected = checklist.items.reduce((sum, item) => sum + item.collectedQuantity, 0);
  return totalRequired > 0 ? Math.round((totalCollected / totalRequired) * 100) : 0;
}
```

**Checklist.isComplete**:
```typescript
function isChecklistComplete(checklist: Checklist): boolean {
  return checklist.items.every(item => item.collectedQuantity >= item.requiredQuantity);
}
```

---

## Data Flow

1. **Screenshot Upload** → Base64 image string
2. **OCR Processing** → Raw text extraction
3. **Parsing** → ExtractedItem[] with itemName, quantity, confidence
4. **Fuzzy Matching** → Match to arcraiders-data, set matchedItemId/matchScore
5. **Checklist Generation** → Create Checklist with ChecklistItems (collectedQuantity = 0)
6. **Persistence** → Write Checklist to `data/checklists/{id}.json`
7. **Updates** → Read JSON, modify collectedQuantity, recalculate completion, write back
8. **Enrichment** → Query arcraiders-data for matched itemId, populate enrichedData

---

## Migration Strategy

**V1 (Current)**: JSON files per checklist
**Future Considerations**: 
- If checklist count exceeds 1000, consider SQLite migration
- If complex queries needed (e.g., "find all checklists containing Iron Ore"), add search index
- Maintain backward compatibility: keep JSON export capability
