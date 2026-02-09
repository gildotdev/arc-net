# Connecting ARC Net to ChatGPT

## Quick Start Guide

### Step 1: Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site"
   - Select "Import an existing project"
   - Choose your GitHub repository
   - Netlify will auto-detect settings from `netlify.toml`

3. **Deploy**
   - Click "Deploy site"
   - Wait for deployment (~2-3 minutes)
   - Note your site URL: `https://your-site-name.netlify.app`

### Step 2: Connect to ChatGPT

1. **Open ChatGPT Settings**
   - Go to ChatGPT
   - Click Settings → Beta Features
   - Enable "Custom GPT Actions" or "MCP Servers"

2. **Add MCP Server**
   - Server Name: `ARC Net`
   - Server URL: `https://your-site-name.netlify.app/mcp`
   - Protocol: `HTTP/SSE` or `Streamable HTTP`

3. **Test the Connection**
   - ChatGPT will verify the server is reachable
   - You should see "ARC Net" with 1 available tool

For detailed troubleshooting, see [DEPLOYMENT.md](../DEPLOYMENT.md)
