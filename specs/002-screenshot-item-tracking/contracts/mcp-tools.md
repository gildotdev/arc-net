# MCP Tool Contracts: Screenshot Item Tracking

**Feature**: 002-screenshot-item-tracking  
**Date**: 2026-02-09

This document defines the MCP tool interfaces for the screenshot item tracking feature.

---

## Tool 1: extract_items_from_screenshot

**Purpose**: Analyze a game screenshot and extract item names and quantities using OCR.

**MCP Tool Definition**:
```json
{
  "name": "extract_items_from_screenshot",
  "description": "Extract item names and quantities from an ARC Raiders game screenshot showing upgrade requirements or mission objectives. Returns structured list of identified items with confidence scores.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "image": {
        "type": "string",
        "description": "Base64-encoded screenshot image (PNG, JPEG supported)"
      },
      "enhanceOCR": {
        "type": "boolean",
        "description": "Apply image preprocessing to improve OCR accuracy (default: true)",
        "default": true
      }
    },
    "required": ["image"]
  }
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data?: {
    extractedItems: Array<{
      itemName: string;
      quantity: number;
      confidence: number; // 0.0-1.0
      matchedItemName?: string; // Canonical name from database
      matchScore?: number; // 0.0-1.0
    }>;
    processingTimeMs: number;
    ocrConfidenceAverage: number;
  };
  warnings?: string[]; // Non-fatal issues
  error?: string; // Fatal error message
}
```

**Example Request**:
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "enhanceOCR": true
}
```

**Example Response** (Success):
```json
{
  "success": true,
  "data": {
    "extractedItems": [
      {
        "itemName": "Iron Ore",
        "quantity": 10,
        "confidence": 0.95,
        "matchedItemName": "Iron Ore",
        "matchScore": 1.0
      },
      {
        "itemName": "Copper Wire",
        "quantity": 5,
        "confidence": 0.87,
        "matchedItemName": "Copper Wire",
        "matchScore": 1.0
      }
    ],
    "processingTimeMs": 3421,
    "ocrConfidenceAverage": 0.91
  },
  "warnings": []
}
```

**Error Scenarios**:
- Invalid image format: `error: "Unsupported image format. Use PNG or JPEG."`
- No text found: `error: "No readable text found in image."`
- OCR processing failed: `error: "OCR processing failed: {technical details}"`

---

## Tool 2: generate_checklist

**Purpose**: Convert extracted items into a trackable markdown checklist.

**MCP Tool Definition**:
```json
{
  "name": "generate_checklist",
  "description": "Generate a markdown-formatted checklist from extracted items. Returns checklist with progress tracking (0/N format).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "description": "List of items to include in checklist",
        "items": {
          "type": "object",
          "properties": {
            "itemName": { "type": "string" },
            "quantity": { "type": "number" }
          },
          "required": ["itemName", "quantity"]
        }
      },
      "checklistName": {
        "type": "string",
        "description": "Name for the checklist (e.g., 'Hideout Level 3 Upgrade')"
      }
    },
    "required": ["items", "checklistName"]
  }
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data?: {
    checklistMarkdown: string; // Formatted checklist
    totalItems: number;
    totalQuantity: number;
  };
  error?: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "checklistMarkdown": "# Hideout Level 3 Upgrade\n\n- [ ] Iron Ore (0/10)\n- [ ] Copper Wire (0/5)\n- [ ] Steel Plate (0/2)\n\n**Progress**: 0/17 items (0%)",
    "totalItems": 3,
    "totalQuantity": 17
  }
}
```

---

## Tool 3: save_checklist

**Purpose**: Persist a checklist to storage for retrieval across sessions.

**MCP Tool Definition**:
```json
{
  "name": "save_checklist",
  "description": "Save a checklist to persistent storage. Returns unique ID for future retrieval.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Checklist name (1-100 characters)"
      },
      "items": {
        "type": "array",
        "description": "List of checklist items",
        "items": {
          "type": "object",
          "properties": {
            "itemName": { "type": "string" },
            "itemId": { "type": "string", "nullable": true },
            "requiredQuantity": { "type": "number" },
            "collectedQuantity": { "type": "number", "default": 0 }
          },
          "required": ["itemName", "requiredQuantity"]
        }
      },
      "metadata": {
        "type": "object",
        "description": "Optional metadata (tier, tags, etc.)",
        "properties": {
          "tier": { "type": "string" },
          "tags": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "required": ["name", "items"]
  }
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data?: {
    checklistId: string; // UUID
    name: string;
    itemCount: number;
    createdAt: string; // ISO 8601
  };
  error?: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "checklistId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Hideout Level 3 Upgrade",
    "itemCount": 3,
    "createdAt": "2026-02-09T01:30:00.000Z"
  }
}
```

---

## Tool 4: update_checklist

**Purpose**: Update item collection progress in a saved checklist.

**MCP Tool Definition**:
```json
{
  "name": "update_checklist",
  "description": "Mark items as collected in a checklist. Updates progress and completion status.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "checklistId": {
        "type": "string",
        "description": "Unique checklist identifier (UUID)"
      },
      "updates": {
        "type": "array",
        "description": "List of item updates",
        "items": {
          "type": "object",
          "properties": {
            "itemName": { "type": "string" },
            "collectedQuantity": { 
              "type": "number",
              "description": "New collected quantity (absolute value, not increment)"
            }
          },
          "required": ["itemName", "collectedQuantity"]
        }
      }
    },
    "required": ["checklistId", "updates"]
  }
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data?: {
    checklistId: string;
    updatedItems: string[]; // Names of updated items
    completionPercentage: number;
    isComplete: boolean;
    checklistMarkdown: string; // Updated checklist display
  };
  error?: string;
}
```

**Example Request**:
```json
{
  "checklistId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "updates": [
    { "itemName": "Iron Ore", "collectedQuantity": 3 },
    { "itemName": "Copper Wire", "collectedQuantity": 2 }
  ]
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "checklistId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "updatedItems": ["Iron Ore", "Copper Wire"],
    "completionPercentage": 29,
    "isComplete": false,
    "checklistMarkdown": "# Hideout Level 3 Upgrade\n\n- [ ] Iron Ore (3/10)\n- [ ] Copper Wire (2/5)\n- [ ] Steel Plate (0/2)\n\n**Progress**: 5/17 items (29%)"
  }
}
```

---

## Tool 5: list_checklists

**Purpose**: Retrieve all saved checklists with summary information.

**MCP Tool Definition**:
```json
{
  "name": "list_checklists",
  "description": "List all saved checklists with summary information (name, progress, last updated).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "filter": {
        "type": "string",
        "description": "Optional filter: 'complete', 'incomplete', or 'all' (default: 'all')",
        "enum": ["complete", "incomplete", "all"],
        "default": "all"
      }
    }
  }
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data?: {
    checklists: Array<{
      id: string;
      name: string;
      itemCount: number;
      completionPercentage: number;
      isComplete: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    totalCount: number;
  };
  error?: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "checklists": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Hideout Level 3 Upgrade",
        "itemCount": 3,
        "completionPercentage": 29,
        "isComplete": false,
        "createdAt": "2026-02-09T01:30:00.000Z",
        "updatedAt": "2026-02-09T02:15:00.000Z"
      }
    ],
    "totalCount": 1
  }
}
```

---

## Tool 6: get_checklist (Bonus)

**Purpose**: Retrieve a specific checklist by ID with full details.

**MCP Tool Definition**:
```json
{
  "name": "get_checklist",
  "description": "Retrieve a specific checklist by ID with full item details and progress.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "checklistId": {
        "type": "string",
        "description": "Unique checklist identifier (UUID)"
      },
      "includeEnrichedData": {
        "type": "boolean",
        "description": "Include enriched item data from arcraiders-data (default: false)",
        "default": false
      }
    },
    "required": ["checklistId"]
  }
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data?: {
    checklist: Checklist; // Full checklist object
    checklistMarkdown: string; // Formatted display
  };
  error?: string;
}
```

---

## Tool 7: delete_checklist

**Purpose**: Remove a checklist from persistent storage.

**MCP Tool Definition**:
```json
{
  "name": "delete_checklist",
  "description": "Delete a saved checklist permanently. This action cannot be undone.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "checklistId": {
        "type": "string",
        "description": "Unique checklist identifier (UUID)"
      }
    },
    "required": ["checklistId"]
  }
}
```

**Response Schema**:
```typescript
{
  success: boolean;
  data?: {
    deletedChecklistId: string;
    deletedChecklistName: string;
  };
  error?: string;
}
```

---

## Error Codes

Standardized error responses:

- `INVALID_IMAGE`: Image format not supported or corrupted
- `OCR_FAILED`: OCR processing encountered an error
- `NO_ITEMS_FOUND`: No items could be extracted from screenshot
- `CHECKLIST_NOT_FOUND`: Specified checklist ID does not exist
- `ITEM_NOT_FOUND`: Item name not found in checklist
- `VALIDATION_ERROR`: Input validation failed (e.g., invalid quantity)
- `STORAGE_ERROR`: File system or storage operation failed
- `INTERNAL_ERROR`: Unexpected server error

**Error Response Format**:
```json
{
  "success": false,
  "error": "CHECKLIST_NOT_FOUND: No checklist found with ID a1b2c3d4-...",
  "details": {
    "code": "CHECKLIST_NOT_FOUND",
    "checklistId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

---

## MCP Server Registration

All tools must be registered during MCP server initialization:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    extractItemsTool,
    generateChecklistTool,
    saveChecklistTool,
    updateChecklistTool,
    listChecklistsTool,
    getChecklistTool,
    deleteChecklistTool
  ]
}));
```
