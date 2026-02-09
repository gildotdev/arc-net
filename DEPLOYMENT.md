# ARC Net MCP Server - Deployment Guide

## Overview

ARC Net is an MCP (Model Context Protocol) server that provides screenshot analysis tools for ARC Raiders game. It can be deployed to cloud platforms for integration with ChatGPT and other AI assistants.

## Local Development

### HTTP Server (Recommended for testing)

```bash
# Install dependencies
npm install

# Run HTTP server
npm run dev

# Server will start on http://localhost:3000
# MCP endpoint: http://localhost:3000/mcp
# Health check: http://localhost:3000/health
```

### stdio Server (Legacy, local only)

```bash
npm run dev:stdio
```

## Deployment Options

### Option 1: Netlify (Recommended)

1. **Connect your repository to Netlify**
   - Push your code to GitHub
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Deploy**
   - Netlify will automatically deploy on push
   - Your MCP endpoint will be: `https://your-site.netlify.app/mcp`

### Option 2: Cloudflare Workers

Coming soon - Cloudflare Workers deployment configuration.

### Option 3: Self-hosted HTTP Server

Deploy the HTTP server to any Node.js hosting platform:

```bash
# Build the project
npm run build

# Start the server
PORT=3000 npm start
```

The server will listen on the specified PORT (default: 3000).

## Connecting to ChatGPT

Once deployed, you can connect to ChatGPT:

1. Get your HTTPS endpoint URL (e.g., `https://your-site.netlify.app/mcp`)
2. In ChatGPT settings, add a custom MCP server:
   - Name: ARC Net
   - URL: `https://your-site.netlify.app/mcp`
   - Protocol: HTTP/SSE

3. ChatGPT will now be able to use the screenshot analysis tools

## Available Tools

### extract_items_from_screenshot

Extract item names and quantities from ARC Raiders game screenshots.

**Input:**
- `image`: Base64-encoded screenshot (PNG or JPEG)
- `enhanceOCR`: Optional, apply preprocessing (default: true)

**Output:**
- List of extracted items with quantities
- Confidence scores for OCR and matching
- Processing time and warnings

## Environment Variables

- `PORT`: HTTP server port (default: 3000)

## Testing the Deployment

```bash
# Health check
curl https://your-site.netlify.app/health

# Test MCP endpoint (requires MCP client or proper request format)
curl -X POST https://your-site.netlify.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Architecture

- **Transport**: HTTP/SSE (MCP Streamable HTTP protocol)
- **Runtime**: Node.js 20+
- **Dependencies**: Express, MCP SDK, Tesseract.js, Sharp
- **Deployment**: Serverless functions or HTTP server

## Troubleshooting

### Cold Starts
Serverless deployments may experience cold starts (2-5 seconds). First requests after idle periods may be slower.

### OCR Processing
Screenshot OCR typically takes 3-5 seconds. Larger images or complex text may take longer.

### CORS Errors
The server is configured with CORS headers to allow web clients. If you encounter CORS issues, check your deployment platform's settings.

## Support

For issues or questions, please open an issue on GitHub.
