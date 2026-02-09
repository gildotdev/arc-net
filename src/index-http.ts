import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ScreenshotExtractTool } from './tools/screenshot-extract.js';
import express from 'express';

/**
 * ARC Net MCP Server (HTTP/SSE Transport)
 * 
 * Provides tools for ARC Raiders game data and screenshot analysis over HTTP/SSE.
 * Suitable for cloud deployment (Netlify, Cloudflare, etc.) and ChatGPT integration.
 */
class ArcNetHttpServer {
  private server: Server;
  private screenshotExtractTool: ScreenshotExtractTool;
  private app: express.Express;
  private transports: Map<string, StreamableHTTPServerTransport> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'arc-net',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.screenshotExtractTool = new ScreenshotExtractTool();
    
    // Create Express app with MCP middleware
    this.app = createMcpExpressApp({
      host: '0.0.0.0', // Listen on all interfaces for cloud deployment
    });

    this.setupToolHandlers();
    this.setupHttpEndpoints();
    
    // Error handling
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    // Cleanup on process exit
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  /**
   * Setup MCP tool handlers on a given server instance
   */
  private setupToolHandlers(): void {
    this.registerToolHandlers(this.server);
  }

  /**
   * Create a new MCP Server instance for an individual session.
   * Each session needs its own Server because MCP only allows one transport per Server.
   */
  private createSessionServer(): Server {
    const sessionServer = new Server(
      { name: 'arc-net', version: '0.1.0' },
      { capabilities: { tools: {} } }
    );
    this.registerToolHandlers(sessionServer);
    sessionServer.onerror = (error) => console.error('[MCP Session Error]', error);
    return sessionServer;
  }

  /**
   * Register tool handlers on a server instance
   */
  private registerToolHandlers(server: Server): void {
    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'extract_items_from_screenshot',
          description: 'Extract item names and quantities from an ARC Raiders game screenshot showing upgrade requirements or mission objectives. Returns structured list of identified items with confidence scores.',
          inputSchema: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
                description: 'Base64-encoded screenshot image (PNG, JPEG supported)',
              },
              enhanceOCR: {
                type: 'boolean',
                description: 'Apply image preprocessing to improve OCR accuracy (default: true)',
                default: true,
              },
            },
            required: ['image'],
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'extract_items_from_screenshot') {
          const result = await this.screenshotExtractTool.execute(args as any);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: result.errors.length === 0,
                  data: {
                    extractedItems: result.extractedItems,
                    processingTimeMs: result.processingTimeMs,
                    ocrConfidenceAverage: result.ocrConfidenceAverage,
                  },
                  warnings: result.warnings,
                  error: result.errors.length > 0 ? result.errors[0] : undefined,
                }, null, 2),
              },
            ],
          };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Setup HTTP endpoints for MCP protocol
   */
  private setupHttpEndpoints(): void {
    // Enable CORS for web clients
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', server: 'arc-net', version: '0.1.0' });
    });

    // MCP endpoint using StreamableHTTP transport
    this.app.all('/mcp', async (req, res) => {
      console.log(`Received ${req.method} request to /mcp`);
      
      try {
        // Get existing transport for returning sessions, or create new one
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;

        if (sessionId && this.transports.has(sessionId)) {
          transport = this.transports.get(sessionId)!;
        } else if (sessionId && !this.transports.has(sessionId)) {
          // Session ID provided but not found — client is stale
          res.status(400).json({ error: 'Invalid or expired session' });
          return;
        } else {
          // New session: create a fresh Server + Transport pair
          const sessionServer = this.createSessionServer();

          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => Math.random().toString(36).substring(7),
            onsessioninitialized: (newSessionId) => {
              console.log(`New session initialized: ${newSessionId}`);
              this.transports.set(newSessionId, transport);
            },
          });

          await sessionServer.connect(transport);

          // Cleanup when transport closes
          transport.onclose = () => {
            const sid = transport.sessionId;
            if (sid) {
              this.transports.delete(sid);
              console.log(`Session closed: ${sid}`);
            }
          };
        }

        // Handle the request through the transport
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    });
  }

  /**
   * Start the HTTP server
   */
  async run(port: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, '0.0.0.0', () => {
        console.log(`ARC Net MCP server running on http://0.0.0.0:${port}`);
        console.log(`MCP endpoint: http://0.0.0.0:${port}/mcp`);
        console.log(`Health check: http://0.0.0.0:${port}/health`);
        resolve();
      });
    });
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    console.log('Shutting down server...');
    await this.screenshotExtractTool.cleanup();
    
    // Close all active transports
    for (const transport of this.transports.values()) {
      await transport.close();
    }
    this.transports.clear();
    
    process.exit(0);
  }
}

// Start the server
const port = parseInt(process.env.PORT || '3000', 10);
const server = new ArcNetHttpServer();
server.run(port).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
