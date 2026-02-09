# Feature Specification: Screenshot Item Tracking

**Feature Branch**: `002-screenshot-item-tracking`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: User description: "I want to be able to provide screenshots from in the game showing resources needed to complete upgrades and other missions and have the MCP server identify the items and provide a checklist where I can track getting the items."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extract Items from Screenshot (Priority: P1)

A ChatGPT user uploads a screenshot showing upgrade requirements or mission objectives with item icons and quantities. The MCP server analyzes the image, identifies the items using OCR/image recognition, matches them against the arcraiders-data repository, and returns a structured list of required items with quantities.

**Why this priority**: This is the core functionality - without item extraction, no other features work. Image analysis and item identification deliver immediate value by eliminating manual data entry.

**Independent Test**: User uploads a screenshot showing "10x Iron Ore, 5x Copper Wire" and receives structured output: `[{item: "Iron Ore", quantity: 10}, {item: "Copper Wire", quantity: 5}]`. Demonstrates MVP value.

**Acceptance Scenarios**:

1. **Given** user uploads a screenshot with item icons and quantities, **When** MCP tool processes the image, **Then** extracted items with quantities are returned
2. **Given** user uploads a screenshot with unclear/low quality images, **When** MCP tool processes it, **Then** best-effort extraction is provided with confidence scores
3. **Given** user uploads a screenshot without item data, **When** MCP tool processes it, **Then** clear message explaining no items found is returned
4. **Given** extracted item names don't exactly match database, **When** matching occurs, **Then** fuzzy matching finds closest item names with similarity scores
5. **Given** user uploads a screenshot with multiple upgrade tiers visible, **When** processing occurs, **Then** items are grouped by tier/section with clear labels

---

### User Story 2 - Generate Progress Checklist (Priority: P2)

After items are extracted from a screenshot, the user requests a checklist to track their progress gathering the required items. The MCP server generates a formatted checklist with checkboxes for each item and quantity, showing current status (0/10 collected).

**Why this priority**: Checklist generation builds directly on P1's item extraction. Provides practical value for tracking but requires extraction to work first.

**Independent Test**: User requests checklist from extracted items and receives markdown formatted checklist: `- [ ] Iron Ore (0/10)`, `- [ ] Copper Wire (0/5)`. Can be used immediately to track progress.

**Acceptance Scenarios**:

1. **Given** extracted items list, **When** checklist is generated, **Then** each item has checkbox format with quantity tracking (0/N)
2. **Given** user has partially collected items, **When** checklist is updated, **Then** progress is reflected (3/10 collected)
3. **Given** checklist is complete, **When** all items collected, **Then** all checkboxes are marked and completion status shown
4. **Given** multiple checklists exist for different missions, **When** user requests specific checklist, **Then** correct checklist is retrieved by mission/upgrade name

---

### User Story 3 - Persistent Checklist Storage (Priority: P3)

The user wants their checklists to persist across ChatGPT sessions. The MCP server stores checklist state (item completion status) and retrieves it when requested, allowing the user to update progress over time without losing data.

**Why this priority**: Persistence is valuable for long-term tracking but secondary to creating and viewing checklists. Users can manually track initially; persistence enhances UX.

**Independent Test**: User creates checklist, closes ChatGPT, reopens and requests "my upgrade checklists" - receives saved checklists with previous progress intact. Demonstrates persistence value.

**Acceptance Scenarios**:

1. **Given** user creates a checklist, **When** checklist is saved, **Then** unique identifier is assigned for future retrieval
2. **Given** user updates checklist progress, **When** changes are saved, **Then** updated state persists across sessions
3. **Given** user has multiple saved checklists, **When** user requests list of checklists, **Then** all checklists with names/IDs and summary progress are shown
4. **Given** user deletes a checklist, **When** deletion is confirmed, **Then** checklist is removed from storage permanently
5. **Given** saved checklist references item IDs, **When** arcraiders-data updates, **Then** item names are refreshed while preserving progress

---

### User Story 4 - Mark Items as Collected (Priority: P4)

The user updates their checklist by marking items as collected incrementally. They can specify "I collected 3 Iron Ore" and the MCP server updates the checklist, showing new progress (3/10) and recalculating remaining items needed.

**Why this priority**: Incremental updates improve UX but require both checklist generation (P2) and persistence (P3) to be valuable. Lower priority as manual checkbox updates work initially.

**Independent Test**: User says "Mark 3 Iron Ore as collected" for checklist ID, receives updated checklist showing (3/10) for Iron Ore. Other items unchanged. Demonstrates incremental tracking.

**Acceptance Scenarios**:

1. **Given** existing checklist, **When** user marks quantity of item collected, **Then** progress updates (e.g., 0/10 → 3/10)
2. **Given** user marks more items than required, **When** update occurs, **Then** system caps at maximum (10/10) and notifies user
3. **Given** user marks items as uncollected (decrement), **When** update occurs, **Then** progress decreases (5/10 → 3/10)
4. **Given** user completes all items, **When** final item marked, **Then** checklist marked complete with celebration message
5. **Given** checklist has multiple tiers, **When** user marks items, **Then** only specified tier is updated

---

### User Story 5 - Enhanced Item Context from Database (Priority: P5)

When generating checklists, the MCP server enriches item information by cross-referencing the arcraiders-data repository. Users see additional context like item rarity, where to find items, trader availability, and estimated costs alongside the checklist.

**Why this priority**: Enhanced context is nice-to-have that improves user experience but isn't essential for core checklist functionality. Requires integration with 001-arcraiders-data feature.

**Independent Test**: User views checklist and sees "Iron Ore (Common) - Found in Canyon map, sold by Trader Marcus for 50 credits" alongside quantity. Demonstrates value-add information.

**Acceptance Scenarios**:

1. **Given** checklist item, **When** enriched data is requested, **Then** item rarity, description, and image URL (if available) are shown
2. **Given** item available from traders, **When** enrichment occurs, **Then** trader names and costs are displayed
3. **Given** item found in specific maps, **When** enrichment occurs, **Then** map locations are listed
4. **Given** item is craftable, **When** enrichment occurs, **Then** crafting requirements and recipes are shown
5. **Given** item data unavailable, **When** enrichment fails, **Then** basic checklist still works without enhanced data

---

### Edge Cases

- What happens when screenshot contains overlapping UI elements obscuring item icons?
- How does system handle non-English text or different game language settings in screenshots?
- What happens when user uploads a screenshot from a different game entirely?
- How are duplicate items (same item appearing multiple times) handled in extraction?
- What happens when image quality is too poor for OCR to read quantities accurately?
- How does system handle screenshots with dynamic lighting/filters affecting color recognition?
- What happens when user tries to update a checklist that no longer exists (deleted)?
- How are checklist naming conflicts resolved when multiple screenshots have similar content?
- What happens when arcraiders-data item names change and saved checklists reference old names?
- How is storage cleaned up for abandoned/old checklists (retention policy)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept image uploads through MCP protocol (via ChatGPT image attachments)
- **FR-002**: System MUST extract visible text from screenshots using OCR technology
- **FR-003**: System MUST identify item names and quantities from extracted text
- **FR-004**: System MUST match extracted item names to arcraiders-data repository using fuzzy matching
- **FR-005**: System MUST provide confidence scores for each identified item (0-100%)
- **FR-006**: System MUST generate structured checklist format (markdown with checkboxes)
- **FR-007**: System MUST persist checklist state to storage accessible across sessions
- **FR-008**: System MUST assign unique identifiers to each saved checklist
- **FR-009**: System MUST support retrieving saved checklists by ID or by listing all checklists
- **FR-010**: System MUST allow updating item collection quantities incrementally
- **FR-011**: System MUST calculate and display progress percentages (e.g., 3/10 = 30%)
- **FR-012**: System MUST support deleting saved checklists
- **FR-013**: System MUST enrich checklist items with data from arcraiders-data (rarity, location, trader info)
- **FR-014**: System MUST handle poor quality images gracefully with error messages
- **FR-015**: System MUST validate that uploaded images contain game-related content
- **FR-016**: System MUST group items by tier/section when multiple upgrade levels are detected
- **FR-017**: System MUST support naming checklists for easy identification (e.g., "Hideout Level 3 Upgrade")
- **FR-018**: System MUST mark checklists as complete when all items are collected
- **FR-019**: System MUST handle storage cleanup for old/abandoned checklists after retention period

### Key Entities

- **Screenshot**: Image file uploaded by user containing item requirements for upgrades or missions. Contains item icons, quantities, and UI elements.
- **Extracted Item**: Identified item from screenshot with name, quantity, and confidence score. Result of OCR and image analysis.
- **Checklist**: Persistent tracking object containing list of required items, quantities, collection progress, and metadata (name, creation date, completion status).
- **Checklist Item**: Individual item entry within a checklist with name, required quantity, collected quantity, and enriched data (rarity, locations, trader info).
- **Item Progress**: Tracking state for a single item showing collected/required ratio and completion percentage.
- **Storage Record**: Persisted checklist data structure with unique ID, user identifier (if applicable), timestamps, and serialized state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: System successfully extracts item names and quantities from 80% of clear, high-quality screenshots
- **SC-002**: Item matching accuracy exceeds 90% for items present in arcraiders-data repository
- **SC-003**: Users can generate and save a checklist from screenshot in under 10 seconds
- **SC-004**: Checklist state persists correctly across 100% of ChatGPT sessions (no data loss)
- **SC-005**: Users can update item collection status and see immediate progress reflection
- **SC-006**: Fuzzy matching resolves 85% of near-match item names (1-2 character differences)
- **SC-007**: System provides clear error messages for 100% of failed extractions (not technical errors)
- **SC-008**: Enriched item data (from arcraiders-data) appears in 95% of checklist items where data exists
- **SC-009**: Users can manage multiple checklists (create, list, update, delete) without confusion
- **SC-010**: OCR processing completes within 5 seconds for standard game screenshots (1920x1080 or similar)

## Assumptions

- **A-001**: ChatGPT MCP protocol supports image attachments and provides base64 or file path access to images
- **A-002**: Screenshots are from ARC Raiders game with standard UI elements and readable text
- **A-003**: Item icons in screenshots are recognizable and text is legible at typical screenshot resolutions
- **A-004**: Users take screenshots that include both item icons and quantity numbers
- **A-005**: OCR library (e.g., Tesseract via Bun) is available for text extraction
- **A-006**: Image analysis can be performed server-side without external API dependencies for P1 MVP
- **A-007**: Storage mechanism (file system or simple database) is sufficient for checklist persistence
- **A-008**: User sessions can be identified for associating checklists (via MCP session context or manual naming)
- **A-009**: Screenshots are static images (not video or animated content)
- **A-010**: Typical use case involves 5-20 items per screenshot (not hundreds)
- **A-011**: Integration with 001-arcraiders-data feature is available for item enrichment (P5 dependency)

## Dependencies

- **D-001**: Feature 001-arcraiders-data must be implemented for item matching and enrichment
- **D-002**: OCR library compatible with Bun (e.g., Tesseract.js or native Tesseract bindings)
- **D-003**: Image processing library for Bun (e.g., sharp, jimp, or native canvas API)
- **D-004**: Storage mechanism (file system JSON files or SQLite) for checklist persistence
- **D-005**: MCP SDK must support image data transfer in tool parameters

## Out of Scope

- Real-time game integration or live inventory tracking from game client
- Video analysis or animated screenshot support
- Automatic screenshot capture from game (user must manually take/upload)
- Advanced computer vision for icon recognition (text-based OCR only for MVP)
- Multi-user collaboration on shared checklists
- Cloud storage or synchronization across devices (local storage only)
- Mobile app or standalone UI (MCP/ChatGPT interface only)
- Image editing or enhancement tools
- Support for screenshots from other games
- Automatic item acquisition recommendations or optimal farming routes
- Integration with trading systems or marketplace APIs
- Export to external formats (Excel, CSV) - markdown only
