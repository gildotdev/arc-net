# arc-net Copilot Instructions

## Project Overview

arc-net is a Model Context Protocol (MCP) server for ChatGPT and AI assistants, built on Bun. It provides OCR-based screenshot analysis tools for extracting item data from ARC Raiders game screenshots.

**Runtime**: Bun (latest stable)  
**Language**: TypeScript (strict mode)  
**Protocol**: MCP JSON-RPC 2.0  
**MCP SDK**: @modelcontextprotocol/sdk

## Build & Test Commands

```bash
# Install dependencies (use bun, NOT npm/yarn/pnpm)
bun install

# Run development server
bun run dev

# Type checking
bun run typecheck

# Run all tests
bun test

# Run single test file
bun test tests/unit/fuzzy-match.test.ts

# Run tests with coverage
bun test --coverage

# Watch mode for tests
bun test --watch

# Linting (not yet configured)
bun run lint
```

## Constitution Compliance

**CRITICAL**: This project is governed by `.specify/memory/constitution.md`. All code changes MUST comply with:

1. **MCP Protocol Compliance** - All tools and resources must adhere to MCP specification
2. **Monolithic Architecture** - Single codebase, no microservices
3. **Documentation-First** - Document before/during implementation
4. **Bun Runtime Standard** - Use Bun exclusively (no Node.js, npm, yarn, pnpm)
5. **Test-Driven Development** - Write tests BEFORE implementation (TDD mandatory)

### Quality Gates (Must Pass)
- All tests pass: `bun test`
- No type errors: `bun run typecheck`
- Linter passes: `bun run lint`
- Documentation updated
- Constitution compliance verified

## Architecture

### MCP Server Structure

```
src/index.ts          # Main MCP server (ArcNetServer class)
├── tools/            # MCP tool implementations
│   └── screenshot-extract.ts
├── services/         # Business logic layer
│   ├── ocr-service.ts      # Tesseract.js OCR
│   └── item-matcher.ts     # Fuzzy matching
├── lib/              # Utility libraries
│   ├── fuzzy-match.ts      # Fuzzysort wrapper
│   └── image-processor.ts  # Sharp-based preprocessing
└── models/           # TypeScript interfaces
    ├── extracted-item.ts
    ├── extraction-result.ts
    ├── checklist.ts
    └── checklist-item.ts
```

### Request Flow

1. **MCP Client** → JSON-RPC 2.0 request over stdio
2. **ArcNetServer** → Routes to tool handler
3. **ScreenshotExtractTool** → Orchestrates extraction
   - Decodes base64 image
   - **ImageProcessor** → Preprocesses with Sharp (contrast, grayscale)
   - **OCRService** → Extracts text with Tesseract.js
   - **ItemMatcher** → Fuzzy matches against item database
4. **Response** → JSON with extracted items, confidence scores, timing

### Key Design Patterns

- **Tool Pattern**: Each MCP tool is a separate class with `execute()` method
- **Service Layer**: Business logic isolated from MCP protocol details
- **Models as Contracts**: TypeScript interfaces define data shapes across layers
- **No Item Database**: Database loading not implemented yet (ItemMatcher ready for it)

## Code Conventions

### File Organization

- One class/interface per file
- File name matches export name (kebab-case)
- `.js` extensions in imports (required for ESM)
- Models use interfaces, not classes
- Test files mirror src structure: `tests/unit/`, `tests/integration/`

### TypeScript Patterns

```typescript
// Use interfaces for data structures
export interface ExtractedItem {
  itemName: string;
  quantity: number;
  confidence: number;
}

// Use classes for services/tools
export class OCRService {
  async extractText(image: Buffer): Promise<OCRTextBlock[]> { }
}

// Import with .js extension
import { OCRService } from '../services/ocr-service.js';
```

### Testing Patterns

- Use `bun:test` imports: `import { describe, test, expect } from 'bun:test';`
- Unit tests for lib/ and services/
- Integration tests for tools/ (full request/response flow)
- Test file naming: `*.test.ts`
- No mocking unless necessary (prefer real implementations)

### MCP Tool Implementation

```typescript
// In src/index.ts - Tool registration
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: 'tool_name',
      description: 'Clear description for AI assistant',
      inputSchema: {
        type: 'object',
        properties: { /* JSON Schema */ },
        required: ['field1']
      }
    }]
  };
});

// Tool handler
this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // Execute tool, return { content: [{ type: 'text', text: JSON.stringify(result) }] }
});
```

## Speckit Workflow

This project uses `.specify/` templates for feature planning:

- **spec-template.md** - Feature specifications
- **plan-template.md** - Implementation plans
- **tasks-template.md** - Actionable task breakdowns
- **checklist-template.md** - Feature-specific checklists

When working on new features, check `specs/` directory for existing specifications.

## Common Pitfalls

- **DO NOT use npm/yarn/pnpm** - Only `bun` commands
- **DO NOT skip TDD** - Tests must be written first
- **DO NOT commit without documentation** - Document as you code
- **DO NOT use Node.js APIs** - Prefer Bun-native APIs (e.g., `Bun.file()`)
- **DO NOT forget .js extensions** - ESM requires explicit `.js` in imports
- **DO NOT violate MCP protocol** - All responses must match MCP schema

## OCR & Image Processing Notes

- **Tesseract.js**: PSM mode 6 (uniform text blocks), OEM 1 (LSTM)
- **Sharp preprocessing**: Grayscale → contrast enhancement → resize (2x)
- **Fuzzy matching**: Fuzzysort with 0.7 threshold (70% similarity)
- **Quantity parsing**: Supports "10x", "10 x", "x10", "10" patterns

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `tesseract.js` - OCR engine (WASM-based)
- `sharp` - Fast image processing
- `fuzzysort` - Fast fuzzy string matching

**Dependency Policy**: Minimize external dependencies, prefer Bun-native APIs, audit security regularly.
