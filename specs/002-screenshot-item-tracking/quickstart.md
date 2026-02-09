# Quickstart Guide: Screenshot Item Tracking

**Feature**: 002-screenshot-item-tracking  
**Date**: 2026-02-09

## Overview

The Screenshot Item Tracking feature allows you to upload ARC Raiders game screenshots and automatically create trackable checklists for upgrade requirements and mission objectives.

---

## User Workflow

### Step 1: Extract Items from Screenshot

Take a screenshot of your upgrade requirements in ARC Raiders, then upload it to ChatGPT:

**User**: "Here's a screenshot of my hideout upgrade. What items do I need?"

**ChatGPT** (using MCP): Uploads screenshot → MCP server extracts items

**Response**:
```
I found these items in your screenshot:
- Iron Ore x10 (95% confidence)
- Copper Wire x5 (87% confidence)
- Steel Plate x2 (92% confidence)

Would you like me to create a checklist to track your progress?
```

---

### Step 2: Generate and Save Checklist

**User**: "Yes, create a checklist called 'Hideout Level 3 Upgrade'"

**ChatGPT** (using MCP): Generates checklist → Saves to storage

**Response**:
```markdown
# Hideout Level 3 Upgrade

- [ ] Iron Ore (0/10)
- [ ] Copper Wire (0/5)
- [ ] Steel Plate (0/2)

**Progress**: 0/17 items (0%)

Checklist saved! Use ID: a1b2c3d4-... to update progress.
```

---

### Step 3: Update Progress

After collecting some items in-game:

**User**: "I collected 3 Iron Ore and 2 Copper Wire for the Hideout Level 3 checklist"

**ChatGPT** (using MCP): Updates checklist

**Response**:
```markdown
# Hideout Level 3 Upgrade (Updated)

- [ ] Iron Ore (3/10)
- [ ] Copper Wire (2/5)
- [ ] Steel Plate (0/2)

**Progress**: 5/17 items (29%)

Great progress! You're 29% done.
```

---

### Step 4: View All Checklists

**User**: "Show me all my checklists"

**ChatGPT** (using MCP): Lists all checklists

**Response**:
```
You have 2 saved checklists:

1. **Hideout Level 3 Upgrade** - 29% complete (Updated 5 minutes ago)
2. **Quest: Raider Supplies** - 100% complete (Updated yesterday)

Which one would you like to view?
```

---

### Step 5: Complete a Checklist

**User**: "Mark all remaining items as collected for Hideout Level 3"

**ChatGPT** (using MCP): Updates all items

**Response**:
```markdown
# Hideout Level 3 Upgrade (COMPLETE! 🎉)

- [x] Iron Ore (10/10)
- [x] Copper Wire (5/5)
- [x] Steel Plate (2/2)

**Progress**: 17/17 items (100%)

Congratulations! You've collected everything!
```

---

## MCP Tool Usage Examples

### Extract Items

```typescript
// Tool: extract_items_from_screenshot
{
  image: "data:image/png;base64,iVBORw0KG..."
}

// Response
{
  success: true,
  data: {
    extractedItems: [
      { itemName: "Iron Ore", quantity: 10, confidence: 0.95 }
    ],
    processingTimeMs: 3421
  }
}
```

### Generate Checklist

```typescript
// Tool: generate_checklist
{
  items: [
    { itemName: "Iron Ore", quantity: 10 },
    { itemName: "Copper Wire", quantity: 5 }
  ],
  checklistName: "Hideout Level 3 Upgrade"
}

// Response
{
  success: true,
  data: {
    checklistMarkdown: "# Hideout Level 3 Upgrade\n\n- [ ] Iron Ore (0/10)\n..."
  }
}
```

### Save Checklist

```typescript
// Tool: save_checklist
{
  name: "Hideout Level 3 Upgrade",
  items: [
    { itemName: "Iron Ore", requiredQuantity: 10, collectedQuantity: 0 }
  ]
}

// Response
{
  success: true,
  data: {
    checklistId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    createdAt: "2026-02-09T01:30:00.000Z"
  }
}
```

### Update Checklist

```typescript
// Tool: update_checklist
{
  checklistId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  updates: [
    { itemName: "Iron Ore", collectedQuantity: 3 }
  ]
}

// Response
{
  success: true,
  data: {
    completionPercentage: 29,
    isComplete: false,
    checklistMarkdown: "# Hideout Level 3 Upgrade\n\n- [ ] Iron Ore (3/10)\n..."
  }
}
```

### List Checklists

```typescript
// Tool: list_checklists
{
  filter: "incomplete"
}

// Response
{
  success: true,
  data: {
    checklists: [
      {
        id: "a1b2c3d4-...",
        name: "Hideout Level 3 Upgrade",
        completionPercentage: 29,
        isComplete: false
      }
    ]
  }
}
```

---

## Common Scenarios

### Scenario 1: Multi-Tier Upgrades

Screenshot shows multiple tiers (e.g., Level 1, Level 2, Level 3):

**Result**: Items grouped by tier automatically
```markdown
# Hideout Upgrades

## Tier 1
- [ ] Wood (10/50)
- [ ] Stone (5/20)

## Tier 2
- [ ] Iron Ore (0/30)
- [ ] Copper Wire (0/15)
```

---

### Scenario 2: Low Confidence Extraction

OCR struggles with blurry text:

**Result**: Warning provided with suggestions
```
I extracted these items but some had low confidence:
- Iron Ore x10 (95% confidence) ✓
- Cop Wire x5 (67% confidence) ⚠️ - Did you mean "Copper Wire"?
- ??? x2 (32% confidence) ❌ - Could not identify

Please verify and correct if needed.
```

---

### Scenario 3: Enriched Data (P5)

After implementing P5, checklists include item context:

```markdown
# Hideout Level 3 Upgrade

- [ ] Iron Ore (0/10)
  📍 Found in: Canyon, Ruins
  💰 Trader: Marcus (50 credits each)
  ⭐ Rarity: Common

- [ ] Copper Wire (0/5)
  📍 Found in: Tech Facility, Warehouse
  💰 Trader: Elena (120 credits each)
  ⭐ Rarity: Uncommon
```

---

## Error Handling

### Invalid Image

**User**: Uploads a corrupted file

**Response**: 
```
Error: Unable to process image. Please ensure it's a valid PNG or JPEG screenshot.
```

### No Items Found

**User**: Uploads a screenshot of map (no items visible)

**Response**:
```
I couldn't find any item requirements in this screenshot. Make sure the screenshot shows:
- Item names
- Quantities (e.g., "10x Iron Ore")
- Clear, readable text
```

### Checklist Not Found

**User**: "Update checklist xyz123"

**Response**:
```
I couldn't find a checklist with ID xyz123. 

Your saved checklists:
1. Hideout Level 3 Upgrade (a1b2c3d4-...)
2. Quest: Raider Supplies (b2c3d4e5-...)

Which one did you mean?
```

---

## Tips for Best Results

### Screenshot Quality

✅ **Good**:
- Clear, high-resolution screenshots (1920x1080 or higher)
- Good lighting/contrast
- Item names and quantities fully visible
- Minimal UI overlap

❌ **Poor**:
- Blurry or low-resolution images
- Dark screenshots with poor visibility
- Item text partially obscured
- Motion blur

### Naming Checklists

✅ **Good Names**:
- "Hideout Level 3 Upgrade"
- "Quest: Secure the Outpost"
- "Weapon Crafting: Plasma Rifle"

❌ **Poor Names**:
- "Checklist 1"
- "Items"
- "asdfgh"

**Tip**: Use descriptive names that help you remember what the checklist is for!

---

## Performance Expectations

- **Screenshot Upload**: Instant
- **OCR Extraction**: 3-5 seconds (typical)
- **Checklist Generation**: <1 second
- **Progress Updates**: <1 second
- **Total Workflow**: <10 seconds from upload to saved checklist

---

## Data Storage

Checklists are stored locally in `data/checklists/`:
- Each checklist is a separate JSON file
- Persists across ChatGPT sessions
- Can be backed up by copying the directory
- No cloud synchronization (local only)

---

## Next Steps

After mastering basic checklist tracking:
1. Try multi-tier upgrades (group items by level)
2. Use tags to organize checklists ("hideout", "quest", "crafting")
3. Enable enriched data (P5) for item locations and trader info
4. Delete completed checklists to keep things tidy

**Need help?** Ask ChatGPT: "How do I use screenshot item tracking?"
