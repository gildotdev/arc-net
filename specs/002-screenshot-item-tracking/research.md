# Research: Screenshot Item Tracking

**Feature**: 002-screenshot-item-tracking  
**Date**: 2026-02-09  
**Status**: Complete

## Research Questions

From Technical Context, we need to resolve:
1. OCR library compatible with Bun
2. Image processing library for Bun
3. Fuzzy string matching library
4. Storage approach (JSON files vs SQLite)

---

## 1. OCR Library for Bun

**Decision**: Use Tesseract.js via Bun

**Rationale**:
- **Tesseract.js** is a JavaScript port of Tesseract OCR, runs in Node.js/Bun environments
- Pure JavaScript implementation - no native bindings required (simplifies Bun compatibility)
- Supports multiple languages and can be trained for specific fonts/text styles
- Well-maintained with active community (last update recent)
- Works with base64 images or Buffer objects that Bun provides

**Alternatives Considered**:
- **Native Tesseract with Bun FFI**: Rejected due to complexity of C++ bindings and cross-platform compatibility issues
- **OCR.space API**: Rejected to avoid external service dependencies and network latency (per constitution: self-contained)
- **Google Cloud Vision API**: Rejected for same reasons (external dependency, cost, privacy concerns)

**Implementation Notes**:
- Install: `bun add tesseract.js`
- Configure for English language (ARC Raiders is English-only per assumption)
- Pre-process images for better OCR accuracy (contrast adjustment, noise reduction)
- Extract text with confidence scores to identify low-quality extractions

---

## 2. Image Processing Library

**Decision**: Use Sharp for image manipulation

**Rationale**:
- **Sharp** is high-performance image processing library
- Bun compatibility confirmed (works with Bun's Node.js compatibility layer)
- Supports common operations needed: resize, grayscale conversion, contrast adjustment
- Fast native implementation (libvips under the hood)
- Small bundle size compared to alternatives

**Alternatives Considered**:
- **Jimp**: Pure JavaScript, slower performance, but rejected due to Sharp's superior speed for OCR pre-processing
- **Canvas API (Bun native)**: Basic but lacks advanced image manipulation; rejected for feature completeness
- **ImageMagick bindings**: Rejected due to external system dependency complexity

**Implementation Notes**:
- Install: `bun add sharp`
- Use for pre-processing: convert to grayscale, enhance contrast, resize if needed
- Pipeline: Sharp preprocessing → Tesseract.js OCR → text extraction

---

## 3. Fuzzy String Matching Library

**Decision**: Use fuzzysort for item name matching

**Rationale**:
- **fuzzysort** is lightweight, fast fuzzy search library
- Works well with TypeScript (has type definitions)
- Provides scoring mechanism for match confidence (needed per FR-005)
- Simple API: `fuzzysort.single(query, target)` returns score
- Zero dependencies, works in any JavaScript environment

**Alternatives Considered**:
- **fuse.js**: More full-featured but heavier; rejected as we only need string matching, not full search indexing
- **leven (Levenshtein distance)**: Lower-level; rejected as fuzzysort provides better developer experience with scoring
- **string-similarity**: Considered but fuzzysort has better performance and active maintenance

**Implementation Notes**:
- Install: `bun add fuzzysort`
- Match extracted item names against arcraiders-data item list
- Set confidence threshold (e.g., score > 0.7 for acceptance)
- Return top 3 matches when ambiguous for user disambiguation

---

## 4. Storage Approach

**Decision**: Use JSON files for checklist persistence

**Rationale**:
- **Simple architecture**: One JSON file per checklist in `data/checklists/` directory
- **Human-readable**: Easy to debug and inspect checklist state
- **Bun native support**: Bun.file() and JSON.parse/stringify are first-class
- **No schema migrations**: Simple key-value structure unlikely to change dramatically
- **Backup-friendly**: JSON files can be easily versioned, backed up, or synced
- **Low complexity**: No database server, no schema management, no connection pooling

**Alternatives Considered**:
- **SQLite**: Rejected for Phase 1 as overkill for simple CRUD operations. Checklists are independent, no complex queries needed. Can migrate later if needed.
- **In-memory only**: Rejected as persistence is a core requirement (P3 user story)
- **LevelDB/RocksDB**: Rejected as binary formats harder to debug and overkill for small data

**Implementation Notes**:
- File naming: `{checklistId}.json` where ID is UUID or timestamp-based
- Directory: `data/checklists/` (create if not exists)
- Use Bun.file() for async read/write
- Atomic writes: write to temp file, then rename (prevents corruption)
- Index file optional: `index.json` with metadata for listing all checklists

**Storage Schema**:
```typescript
interface ChecklistFile {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  items: {
    itemName: string;
    requiredQuantity: number;
    collectedQuantity: number;
    itemId?: string; // Reference to arcraiders-data if matched
  }[];
  metadata: {
    sourceScreenshot?: string; // base64 or reference
    completionPercentage: number;
  };
}
```

---

## 5. MCP Image Transfer

**Research**: How does MCP handle image uploads from ChatGPT?

**Findings**:
- MCP protocol supports binary data via base64 encoding in tool parameters
- ChatGPT can attach images to messages, which MCP servers receive as base64 strings
- Tool schema must declare parameter type as `string` with format indicator
- Image size limits: MCP has no hard limit, but practical limit ~10MB (ChatGPT UI constraint)

**Implementation**:
```typescript
// Tool schema
{
  name: "extract_items_from_screenshot",
  description: "Extract item names and quantities from game screenshot",
  inputSchema: {
    type: "object",
    properties: {
      image: {
        type: "string",
        description: "Base64-encoded screenshot image"
      }
    },
    required: ["image"]
  }
}
```

---

## 6. OCR Accuracy Enhancement

**Research**: How to improve OCR accuracy for game screenshots?

**Best Practices**:
- **Preprocessing**:
  - Convert to grayscale (removes color noise)
  - Increase contrast (makes text sharper)
  - Resize if resolution too high/low (optimal ~300 DPI for OCR)
  - Remove non-text regions if possible (crop to item list area)

- **Tesseract Configuration**:
  - Use `eng` language model (English)
  - Set PSM (Page Segmentation Mode) to 6 (uniform block of text)
  - Whitelist characters: alphanumeric + common symbols (0-9, a-z, A-Z, x, -, space)

- **Post-Processing**:
  - Parse "10x Iron Ore" pattern with regex: `(\d+)\s*x?\s*(.+)`
  - Validate extracted quantities (1-999 typical range)
  - Fuzzy match item names to database for typo correction

**Expected Accuracy**: 80%+ for clear screenshots (per SC-001)

---

## 7. Integration with 001-arcraiders-data

**Dependencies**: This feature requires item data from 001-arcraiders-data

**Integration Points**:
- **Item Matching**: Use item names from `items/*.json` for fuzzy matching
- **Enrichment (P5)**: Pull rarity, locations, trader info from repository data
- **Shared Code**: May need to share item loading/parsing logic

**Implementation Strategy**:
- Load arcraiders-data items into memory on server startup (from cloned/embedded repository)
- Create item index: Map<itemName, itemData> for O(1) lookups
- Fuzzy matcher searches against item names list
- Enrichment service queries item data by matched ID

---

## Summary

All NEEDS CLARIFICATION items resolved:

✅ **OCR Library**: Tesseract.js  
✅ **Image Processing**: Sharp  
✅ **Fuzzy Matching**: fuzzysort  
✅ **Storage**: JSON files (simple, debuggable, Bun-native)  
✅ **MCP Image Transfer**: Base64 via tool parameters  
✅ **OCR Accuracy**: Preprocessing + configuration optimizations  
✅ **Integration**: Coordinate with 001-arcraiders-data for item data

**Ready for Phase 1**: Design data models and MCP tool contracts.
