# Implementation Plan: Screenshot Item Tracking

**Branch**: `002-screenshot-item-tracking` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-screenshot-item-tracking/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable ChatGPT users to upload ARC Raiders game screenshots showing upgrade/mission requirements and automatically extract item names and quantities using OCR. The MCP server will match extracted items to the arcraiders-data repository, generate trackable checklists with progress indicators, and persist checklist state across sessions. Users can incrementally update collection progress and receive enriched item context (rarity, locations, trader availability).

**Technical Approach** (from research): OCR-based text extraction from screenshots, fuzzy string matching to item database, JSON file-based checklist persistence, and markdown-formatted output for ChatGPT display.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Bun (latest stable)
**Primary Dependencies**: @modelcontextprotocol/sdk, NEEDS CLARIFICATION: OCR library, NEEDS CLARIFICATION: Image processing library, NEEDS CLARIFICATION: Fuzzy string matching library
**Storage**: NEEDS CLARIFICATION: JSON files vs SQLite for checklist persistence
**Testing**: Bun's built-in test runner
**Target Platform**: MCP Server (ChatGPT and compatible clients)
**Project Type**: Monolithic server (single src/ structure)
**Performance Goals**: <10s screenshot processing end-to-end, <5s OCR extraction, <2s checklist generation
**Constraints**: MCP protocol compliance, image size limits (typical 1920x1080 screenshots), 80% OCR accuracy target
**Scale/Scope**: 5 MCP tools (extract, generate, save, update, list), 5-20 items per screenshot typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **MCP Protocol Compliance**: Feature uses MCP tools for image upload, processing, and checklist CRUD operations. All responses are MCP-compliant JSON-RPC.
- [x] **Monolithic Architecture**: All OCR, matching, checklist logic resides in single arc-net server. No separate services.
- [x] **Documentation-First**: Spec complete with user stories, functional requirements, acceptance criteria. Design docs (research, data-model, contracts, quickstart) will be created in Phase 0-1.
- [x] **Bun Runtime**: Will use Bun for image processing, file I/O, JSON parsing. OCR library must be Bun-compatible (research in Phase 0).
- [x] **Test-Driven**: Spec defines 5 user stories with acceptance scenarios. Tests will be written before implementation per TDD mandate.

**Initial Assessment**: ✅ All gates pass. Feature aligns with constitution.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── tools/                    # MCP tool handlers
│   ├── screenshot-extract.ts
│   ├── checklist-generate.ts
│   ├── checklist-save.ts
│   ├── checklist-update.ts
│   └── checklist-list.ts
├── services/                 # Business logic
│   ├── ocr-service.ts       # OCR extraction
│   ├── item-matcher.ts      # Fuzzy matching to arcraiders-data
│   ├── checklist-manager.ts # CRUD operations
│   └── storage-service.ts   # Persistence layer
├── models/                   # Data structures
│   ├── checklist.ts
│   ├── extracted-item.ts
│   └── checklist-item.ts
└── lib/                      # Utilities
    ├── image-processor.ts
    └── fuzzy-match.ts

tests/
├── unit/                     # Unit tests (services, utilities)
│   ├── ocr-service.test.ts
│   ├── item-matcher.test.ts
│   └── fuzzy-match.test.ts
├── integration/              # Integration tests (MCP tools, storage)
│   ├── screenshot-extract.test.ts
│   ├── checklist-crud.test.ts
│   └── storage-persistence.test.ts
└── fixtures/                 # Test screenshots and data
    ├── test-screenshots/
    └── test-checklists.json

data/                         # Runtime data
└── checklists/              # Persisted checklist JSON files
```

**Structure Decision**: Single project structure (Option 1) as this is a monolithic MCP server. All screenshot processing, OCR, matching, and storage logic resides in one codebase. Organization by feature (tools, services, models) rather than by layer simplifies navigation.

## Complexity Tracking

> **No violations** - Feature aligns with all constitution principles. No additional complexity justification needed.

---

## Phase 0: Research (COMPLETE ✅)

**Completed**: 2026-02-09

### Research Outcomes

All NEEDS CLARIFICATION items from Technical Context resolved:

1. **OCR Library**: Tesseract.js (JavaScript OCR, Bun-compatible, no native bindings)
2. **Image Processing**: Sharp (high-performance, supports preprocessing for OCR)
3. **Fuzzy Matching**: fuzzysort (lightweight, provides scoring, TypeScript support)
4. **Storage**: JSON files (simple, human-readable, Bun-native file I/O)

### Key Decisions

- **MCP Image Transfer**: Base64 encoding in tool parameters
- **OCR Accuracy**: Preprocessing (grayscale, contrast) + Tesseract config (PSM mode 6, English)
- **Integration**: Load arcraiders-data items into memory for matching
- **Expected Performance**: 80%+ extraction accuracy for clear screenshots

**Documentation**: [research.md](./research.md)

---

## Phase 1: Design (COMPLETE ✅)

**Completed**: 2026-02-09

### Design Artifacts Generated

1. **Data Model** ([data-model.md](./data-model.md)):
   - ExtractedItem (OCR results with confidence scores)
   - ChecklistItem (progress tracking with collection state)
   - Checklist (full checklist with metadata, completion %)
   - ExtractionResult (OCR processing output)
   - JSON persistence format defined

2. **MCP Tool Contracts** ([contracts/mcp-tools.md](./contracts/mcp-tools.md)):
   - extract_items_from_screenshot (P1)
   - generate_checklist (P2)
   - save_checklist (P3)
   - update_checklist (P4)
   - list_checklists (P3)
   - get_checklist (bonus)
   - delete_checklist (P3)

3. **Quickstart Guide** ([quickstart.md](./quickstart.md)):
   - User workflow examples
   - Tool usage demonstrations
   - Common scenarios (multi-tier, low confidence, errors)
   - Performance expectations

### Constitution Re-Check (Post-Design)

- [x] **MCP Protocol Compliance**: 7 MCP tools defined with proper JSON-RPC schemas. All responses follow MCP format.
- [x] **Monolithic Architecture**: All logic in single src/ tree. No microservices.
- [x] **Documentation-First**: research.md, data-model.md, contracts, quickstart all created before implementation.
- [x] **Bun Runtime**: All dependencies (Tesseract.js, Sharp, fuzzysort) confirmed Bun-compatible.
- [x] **Test-Driven**: Acceptance scenarios from spec map to test cases. Unit/integration test structure defined.

**Final Assessment**: ✅ All gates pass. Ready for implementation.

---

## Phase 2: Implementation Planning

**Status**: Ready for `/speckit.tasks` command

### Implementation Priorities

**P1 (MVP)**: Screenshot extraction
- Tool: extract_items_from_screenshot
- Services: OCR, image processing, fuzzy matching
- Tests: OCR accuracy, item matching, confidence scoring

**P2**: Checklist generation
- Tool: generate_checklist
- Services: Checklist formatting (markdown)
- Tests: Checklist format validation

**P3**: Persistence
- Tools: save_checklist, list_checklists, get_checklist, delete_checklist
- Services: Storage layer (JSON file I/O)
- Tests: CRUD operations, persistence across restarts

**P4**: Progress updates
- Tool: update_checklist
- Services: Checklist manager (update logic, completion calculation)
- Tests: Incremental updates, completion detection

**P5**: Enrichment (future)
- Integration with 001-arcraiders-data
- Services: Data enrichment from item database
- Tests: Enriched data accuracy

### Dependency Installation

```bash
# Install OCR and image processing
bun add tesseract.js sharp

# Install fuzzy matching
bun add fuzzysort

# Install MCP SDK (if not already)
bun add @modelcontextprotocol/sdk
```

### Next Steps

1. Run `/speckit.tasks` to generate TDD task breakdown
2. Implement P1 (screenshot extraction) first - standalone MVP
3. Add P2-P4 incrementally
4. Defer P5 (enrichment) until 001-arcraiders-data is complete

---

## Success Metrics Review

From spec success criteria, implementation must achieve:

- ✅ **SC-001**: 80%+ extraction success (clear screenshots) → Test with fixture images
- ✅ **SC-002**: 90%+ item matching accuracy → Test against arcraiders-data items
- ✅ **SC-003**: <10s screenshot → checklist → Test end-to-end timing
- ✅ **SC-004**: 100% persistence (no data loss) → Test session restart scenarios
- ✅ **SC-006**: 85%+ fuzzy matching (1-2 char diff) → Test with typo variations
- ✅ **SC-010**: <5s OCR processing → Benchmark with typical screenshots

**Testing Strategy**: Create test fixtures (screenshots, expected outputs) before implementation per TDD.

---

## Branch Status

**Branch**: 002-screenshot-item-tracking  
**Planning**: Complete  
**Ready for**: Task breakdown and implementation

**Artifacts**:
- ✅ spec.md (5 user stories, 19 FRs, 10 SCs)
- ✅ plan.md (this file)
- ✅ research.md (technology decisions)
- ✅ data-model.md (entities and schemas)
- ✅ contracts/mcp-tools.md (7 MCP tools)
- ✅ quickstart.md (user guide)

**Next Command**: `/speckit.tasks` to generate implementation task list
