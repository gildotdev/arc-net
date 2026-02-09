import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ScreenshotExtractTool } from '../../src/tools/screenshot-extract.js';
import { IncomingMessage, ServerResponse } from 'http';

// Reuse the tool instance across invocations (stateless, safe to share)
const screenshotTool = new ScreenshotExtractTool();

/**
 * Create a fresh MCP Server per request.
 * Serverless functions are stateless — the MCP Server only allows one
 * transport at a time, so we cannot reuse a singleton across invocations.
 */
function createServer(): Server {
  const server = new Server(
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

  // Setup tool handlers
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

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'extract_items_from_screenshot') {
        const result = await screenshotTool.execute(args as any);

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

  return server;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, mcp-session-id',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const server = createServer();

    // Create a fresh transport per request (serverless = stateless)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => Math.random().toString(36).substring(7),
    });

    // Connect transport to fresh server instance
    await server.connect(transport);

    // Create mock IncomingMessage and ServerResponse for the transport
    const mockReq = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers as Record<string, string>,
      body: event.body ? JSON.parse(event.body) : undefined,
    } as unknown as IncomingMessage;

    // Create a response collector
    let responseBody = '';
    let responseStatus = 200;
    let responseHeaders: Record<string, string> = {};

    const mockRes = {
      statusCode: 200,
      setHeader: (name: string, value: string) => {
        responseHeaders[name.toLowerCase()] = value;
      },
      writeHead: (status: number, headers?: Record<string, string>) => {
        responseStatus = status;
        if (headers) {
          Object.entries(headers).forEach(([name, value]) => {
            responseHeaders[name.toLowerCase()] = value;
          });
        }
      },
      write: (chunk: string) => {
        responseBody += chunk;
      },
      end: (data?: string) => {
        if (data) responseBody += data;
      },
    } as unknown as ServerResponse;

    // Handle the request
    await transport.handleRequest(mockReq, mockRes, event.body ? JSON.parse(event.body) : undefined);

    return {
      statusCode: responseStatus,
      headers: { ...headers, ...responseHeaders },
      body: responseBody,
    };
  } catch (error) {
    console.error('MCP handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
