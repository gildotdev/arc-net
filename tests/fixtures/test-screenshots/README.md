# Test Fixtures

This directory contains test data for the screenshot item tracking feature.

## Test Screenshots

Add test screenshot images here for integration testing:
- Clear text screenshots (high OCR accuracy expected)
- Blurry/low quality screenshots (low confidence scores expected)
- Screenshots with no text (error handling test)
- Screenshots from wrong game (negative test case)

## Usage

Place test images in this directory and reference them in tests:
```typescript
const testImage = await Bun.file('tests/fixtures/test-screenshots/clear-text.png').arrayBuffer();
```
