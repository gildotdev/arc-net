# Tasks: Screenshot Item Tracking

**Input**: Design documents from `/specs/002-screenshot-item-tracking/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Per arc-net constitution (Principle V: TDD), tests are MANDATORY. Test tasks MUST be written BEFORE implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Dependencies

User stories can be implemented incrementally:

```
Phase 1: Setup
  ↓
Phase 2: Foundational (shared services)
  ↓
Phase 3: US1 (Screenshot Extraction) ← MVP
  ↓
Phase 4: US2 (Checklist Generation) ← Builds on US1
  ↓
Phase 5: US3 (Persistence) ← Builds on US2
  ↓
Phase 6: US4 (Progress Updates) ← Builds on US3
  ↓
Phase 7: US5 (Enrichment) ← Requires 001-arcraiders-data
```

**Independent User Stories**: US1 can be deployed standalone (MVP). US2-US4 build incrementally. US5 requires external dependency.

## Implementation Strategy

**MVP First**: Implement US1 (screenshot extraction) first - delivers immediate value. Deploy before continuing to US2.

**Incremental Delivery**: Each user story is a deployable increment. After US1, each story adds new MCP tools without breaking existing functionality.

**TDD Workflow**: For each story - Write tests → Verify tests fail (Red) → Implement → Tests pass (Green) → Refactor

---

## Phase 1: Setup

**Goal**: Initialize project structure and install dependencies

- [X] T001 Create project directory structure: `src/{tools,services,models,lib}`, `tests/{unit,integration,fixtures}`, `data/checklists/`
- [X] T002 [P] Initialize TypeScript configuration in `tsconfig.json` with strict mode enabled
- [X] T003 [P] Create `package.json` with Bun scripts: test, typecheck, lint, dev
- [X] T004 [P] Install dependencies: `bun add @modelcontextprotocol/sdk tesseract.js sharp fuzzysort`
- [X] T005 [P] Install dev dependencies: `bun add -d @types/node`
- [X] T006 [P] Create `.gitignore` including `node_modules/`, `data/checklists/*.json`, `*.log`
- [X] T007 [P] Create test fixtures directory and add sample screenshot images to `tests/fixtures/test-screenshots/`

---

## Phase 2: Foundational

**Goal**: Shared services and models used across multiple user stories

### Models

- [X] T008 [P] Create ExtractedItem interface in `src/models/extracted-item.ts` per data-model.md
- [X] T009 [P] Create ChecklistItem interface in `src/models/checklist-item.ts` per data-model.md
- [X] T010 [P] Create Checklist interface in `src/models/checklist.ts` per data-model.md
- [X] T011 [P] Create ExtractionResult interface in `src/models/extraction-result.ts` per data-model.md

### Utility Libraries

- [X] T012 [P] Create image preprocessing utility in `src/lib/image-processor.ts` (Sharp integration)
- [X] T013 [P] Create fuzzy matching utility in `src/lib/fuzzy-match.ts` (fuzzysort integration)

---

## Phase 3: User Story 1 - Screenshot Extraction (P1 - MVP)

**Story Goal**: Extract item names and quantities from game screenshots using OCR

**Independent Test**: Upload screenshot → receive structured JSON with items, quantities, confidence scores

### Tests (Write First - TDD)

- [X] T014 [P] [US1] Create OCR service unit test in `tests/unit/ocr-service.test.ts` covering text extraction and confidence scoring
- [X] T015 [P] [US1] Create item matcher unit test in `tests/unit/item-matcher.test.ts` covering fuzzy matching and scoring
- [X] T016 [P] [US1] Create image processor unit test in `tests/unit/image-processor.test.ts` covering preprocessing (grayscale, contrast)
- [X] T017 [US1] Create screenshot extraction integration test in `tests/integration/screenshot-extract.test.ts` covering end-to-end flow with fixture images

### Implementation

- [X] T018 [US1] Implement OCR service in `src/services/ocr-service.ts` using Tesseract.js (English model, PSM mode 6)
- [X] T019 [US1] Implement item matcher service in `src/services/item-matcher.ts` using fuzzysort with confidence threshold
- [X] T020 [US1] Implement extract_items_from_screenshot MCP tool in `src/tools/screenshot-extract.ts` following contracts/mcp-tools.md
- [X] T021 [US1] Add MCP tool registration for extract_items_from_screenshot in server initialization
- [X] T022 [US1] Run tests and verify US1 acceptance scenarios pass (all tests green)

**US1 Complete**: User can upload screenshot and receive extracted items with confidence scores. ✅ MVP deployable.

---

## Phase 4: User Story 2 - Checklist Generation (P2)

**Story Goal**: Convert extracted items into trackable markdown checklists

**Independent Test**: Call generate_checklist with items → receive formatted markdown checklist

### Tests (Write First - TDD)

- [ ] T023 [P] [US2] Create checklist generation unit test in `tests/unit/checklist-generator.test.ts` covering markdown formatting and progress calculation
- [ ] T024 [US2] Create checklist generation integration test in `tests/integration/checklist-generate.test.ts` covering MCP tool invocation

### Implementation

- [ ] T025 [US2] Implement checklist generator service in `src/services/checklist-generator.ts` with markdown formatting logic
- [ ] T026 [US2] Implement generate_checklist MCP tool in `src/tools/checklist-generate.ts` following contracts/mcp-tools.md
- [ ] T027 [US2] Add MCP tool registration for generate_checklist in server initialization
- [ ] T028 [US2] Run tests and verify US2 acceptance scenarios pass

**US2 Complete**: User can generate markdown checklists from extracted items. ✅ Deployable increment.

---

## Phase 5: User Story 3 - Persistent Storage (P3)

**Story Goal**: Save and retrieve checklists across ChatGPT sessions

**Independent Test**: Save checklist → restart server → list checklists → retrieve by ID

### Tests (Write First - TDD)

- [ ] T029 [P] [US3] Create storage service unit test in `tests/unit/storage-service.test.ts` covering CRUD operations on JSON files
- [ ] T030 [P] [US3] Create checklist manager unit test in `tests/unit/checklist-manager.test.ts` covering checklist creation, ID generation, validation
- [ ] T031 [US3] Create persistence integration test in `tests/integration/storage-persistence.test.ts` covering save/load across restarts

### Implementation

- [ ] T032 [US3] Implement storage service in `src/services/storage-service.ts` using Bun.file() for atomic JSON writes
- [ ] T033 [US3] Implement checklist manager service in `src/services/checklist-manager.ts` with CRUD operations
- [ ] T034 [P] [US3] Implement save_checklist MCP tool in `src/tools/checklist-save.ts` following contracts/mcp-tools.md
- [ ] T035 [P] [US3] Implement list_checklists MCP tool in `src/tools/checklist-list.ts` following contracts/mcp-tools.md
- [ ] T036 [P] [US3] Implement get_checklist MCP tool in `src/tools/checklist-get.ts` (bonus tool) following contracts/mcp-tools.md
- [ ] T037 [P] [US3] Implement delete_checklist MCP tool in `src/tools/checklist-delete.ts` following contracts/mcp-tools.md
- [ ] T038 [US3] Add MCP tool registrations for save, list, get, delete in server initialization
- [ ] T039 [US3] Run tests and verify US3 acceptance scenarios pass

**US3 Complete**: Checklists persist across sessions, full CRUD operations available. ✅ Deployable increment.

---

## Phase 6: User Story 4 - Progress Updates (P4)

**Story Goal**: Update item collection quantities incrementally

**Independent Test**: Update checklist → verify progress recalculated → verify completion detection

### Tests (Write First - TDD)

- [ ] T040 [P] [US4] Create checklist update unit test in `tests/unit/checklist-manager.test.ts` (extend existing) covering quantity updates and completion calculation
- [ ] T041 [US4] Create update integration test in `tests/integration/checklist-update.test.ts` covering MCP tool and progress reflection

### Implementation

- [ ] T042 [US4] Extend checklist manager service in `src/services/checklist-manager.ts` with update methods (incremental quantities, completion detection)
- [ ] T043 [US4] Implement update_checklist MCP tool in `src/tools/checklist-update.ts` following contracts/mcp-tools.md
- [ ] T044 [US4] Add MCP tool registration for update_checklist in server initialization
- [ ] T045 [US4] Run tests and verify US4 acceptance scenarios pass

**US4 Complete**: Users can track progress incrementally with real-time updates. ✅ Deployable increment.

---

## Phase 7: User Story 5 - Data Enrichment (P5)

**Story Goal**: Add item context (rarity, locations, traders) from arcraiders-data

**Independent Test**: Generate checklist with enrichment → verify additional metadata present

**Dependency**: Requires 001-arcraiders-data feature to be implemented

### Tests (Write First - TDD)

- [ ] T046 [P] [US5] Create enrichment service unit test in `tests/unit/enrichment-service.test.ts` covering data lookup and graceful degradation
- [ ] T047 [US5] Create enrichment integration test in `tests/integration/checklist-enrichment.test.ts` covering enriched checklist generation

### Implementation

- [ ] T048 [US5] Implement enrichment service in `src/services/enrichment-service.ts` integrating with 001-arcraiders-data item loader
- [ ] T049 [US5] Extend checklist generator in `src/services/checklist-generator.ts` to include enriched data in markdown output
- [ ] T050 [US5] Update generate_checklist and save_checklist tools to support enrichment flag
- [ ] T051 [US5] Run tests and verify US5 acceptance scenarios pass

**US5 Complete**: Checklists include rich item context for better planning. ✅ Feature complete!

---

## Phase 8: Polish & Cross-Cutting

**Goal**: Final validation, documentation, and performance optimization

- [ ] T052 [P] Create comprehensive integration test in `tests/integration/end-to-end.test.ts` covering full workflow: screenshot → extract → generate → save → update → complete
- [ ] T053 [P] Add JSDoc comments to all public functions in `src/services/` and `src/tools/`
- [ ] T054 [P] Create MCP server entry point in `src/index.ts` with tool registration and error handling
- [ ] T055 [P] Add logging to services using console.log (Bun-native) with timestamp prefixes
- [ ] T056 Validate performance metrics: <5s OCR, <10s end-to-end (run benchmarks with `tests/fixtures/`)
- [ ] T057 Create user documentation in `docs/screenshot-tracking-usage.md` based on quickstart.md
- [ ] T058 Update main README.md with screenshot tracking feature description and example
- [ ] T059 Run full test suite with `bun test` and verify >80% coverage
- [ ] T060 Run type checker with `bun run typecheck` and resolve any errors
- [ ] T061 Final constitution compliance check: MCP protocol, documentation, TDD coverage, Bun-only dependencies

---

## Parallel Execution Examples

### Phase 1 (Setup)
Can run T002, T003, T005, T006, T007 in parallel after T001 completes.

### Phase 2 (Foundational)
All tasks (T008-T013) can run in parallel - no dependencies.

### Phase 3 (US1)
- Tests T014, T015, T016 can run in parallel (different files)
- T017 depends on T014, T015, T016 (integration test needs unit test fixtures)
- T018, T019 can run in parallel (different services)
- T020-T022 must run sequentially (depends on T018, T019)

### Phase 5 (US3)
- Tests T029, T030 can run in parallel
- Tools T034, T035, T036, T037 can run in parallel after T032, T033 complete

### Phase 8 (Polish)
- T052, T053, T054, T055, T057, T058 can all run in parallel

---

## Task Summary

**Total Tasks**: 61

**By Phase**:
- Phase 1 (Setup): 7 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (US1 - MVP): 9 tasks
- Phase 4 (US2): 6 tasks
- Phase 5 (US3): 11 tasks
- Phase 6 (US4): 6 tasks
- Phase 7 (US5): 6 tasks
- Phase 8 (Polish): 10 tasks

**By User Story**:
- US1: 9 tasks (OCR extraction - MVP)
- US2: 6 tasks (Checklist generation)
- US3: 11 tasks (Persistence - most tasks due to CRUD operations)
- US4: 6 tasks (Progress updates)
- US5: 6 tasks (Enrichment)

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phase 1-3 (22 tasks) delivers working screenshot extraction

**Success Metrics Validation Tasks**: T056 (performance), T059 (test coverage), T061 (constitution compliance)

---

## Implementation Notes

**TDD Mandate**: Per constitution, all test tasks (T014-T017, T023-T024, T029-T031, T040-T041, T046-T047) MUST be completed before their corresponding implementation tasks. Red → Green → Refactor.

**Dependency Installation**: Run T004 early to unblock development. Tesseract.js initial download may take 2-3 minutes.

**Test Fixtures**: Create realistic test screenshots in T007 - include clear text ("10x Iron Ore"), blurry text (low confidence test), and no-text images (error handling test).

**Atomic Writes**: T032 storage service must implement atomic file writes (write to temp, rename) to prevent corruption during crashes.

**Performance Testing**: T056 should use `console.time()` / `console.timeEnd()` for benchmarking. OCR is the slowest operation.

**Constitution Compliance**: T061 final check ensures all 5 principles verified before merge: MCP protocol schemas, monolithic structure, comprehensive docs, Bun-only deps, >80% test coverage.
