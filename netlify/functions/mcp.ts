import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { ScreenshotExtractTool } from '../../src/tools/screenshot-extract.js';

// Reuse the tool instance across warm invocations (stateless, safe to share)
const screenshotTool = new ScreenshotExtractTool();

const SERVER_INFO = { name: 'arc-net', version: '0.1.0' };

const SERVER_INSTRUCTIONS = `You are an assistant for the video game ARC Raiders, a third-person co-op PvEvP extraction shooter.

Your primary capabilities:
- **Screenshot Analysis**: Extract item names, quantities, and requirements from ARC Raiders game screenshots (upgrade screens, mission objectives, inventory, crafting menus). Users can paste or upload a screenshot and you will OCR it to identify game items.
- **Item Tracking**: Help players track what materials and items they need to collect for upgrades, missions, and crafting.

When a user asks about items, materials, upgrades, training, or requirements in the context of this chat, assume they are referring to ARC Raiders game content.

Key game concepts:
- Players collect materials and items during raids to upgrade gear, weapons, and equipment.
- "Training" in ARC Raiders refers to upgrading/leveling companions or equipment, which requires specific items.
- Common item categories: salvage, components, electronics, chemicals, rare materials.
- Screenshots often show lists of required items with quantities (e.g. "10x Iron Ore", "5x Circuit Board").

If a user uploads or pastes a screenshot, use the extract_items_from_screenshot tool to analyze it. Always present extracted results in a clear, organized format.`;

const TOOLS = [
  {
    name: 'extract_items_from_screenshot',
    description:
      'Extract item names and quantities from an ARC Raiders game screenshot showing upgrade requirements or mission objectives. Returns structured list of identified items with confidence scores.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        image: {
          type: 'string',
          description: 'Base64-encoded screenshot image (PNG, JPEG supported)',
        },
        enhanceOCR: {
          type: 'boolean',
          description:
            'Apply image preprocessing to improve OCR accuracy (default: true)',
          default: true,
        },
      },
      required: ['image'],
    },
  },
];

/* ---------- JSON-RPC helpers ---------- */

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

function jsonRpcResponse(id: string | number | null, result: unknown) {
  return { jsonrpc: '2.0', id, result };
}

function jsonRpcError(
  id: string | number | null,
  code: number,
  message: string,
) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

/* ---------- Method handlers ---------- */

async function handleMethod(req: JsonRpcRequest) {
  const { method, params, id = null } = req;

  switch (method) {
    case 'initialize':
      return jsonRpcResponse(id, {
        protocolVersion: '2025-03-26',
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
        instructions: SERVER_INSTRUCTIONS,
      });

    case 'notifications/initialized':
      // Notification — no response required
      return null;

    case 'tools/list':
      return jsonRpcResponse(id, { tools: TOOLS });

    case 'tools/call': {
      const toolName = (params as any)?.name;
      const toolArgs = (params as any)?.arguments ?? {};

      if (toolName !== 'extract_items_from_screenshot') {
        return jsonRpcError(id, -32601, `Unknown tool: ${toolName}`);
      }

      try {
        const result = await screenshotTool.execute(toolArgs as any);
        return jsonRpcResponse(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.errors.length === 0,
                  data: {
                    extractedItems: result.extractedItems,
                    processingTimeMs: result.processingTimeMs,
                    ocrConfidenceAverage: result.ocrConfidenceAverage,
                  },
                  warnings: result.warnings,
                  error:
                    result.errors.length > 0 ? result.errors[0] : undefined,
                },
                null,
                2,
              ),
            },
          ],
        });
      } catch (error) {
        return jsonRpcResponse(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error:
                  error instanceof Error ? error.message : 'Unknown error',
              }),
            },
          ],
          isError: true,
        });
      }
    }

    default:
      return jsonRpcError(id, -32601, `Method not found: ${method}`);
  }
}

/* ---------- Netlify handler ---------- */

export const handler: Handler = async (
  event: HandlerEvent,
  _context: HandlerContext,
) => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, mcp-session-id',
    'Content-Type': 'application/json',
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // MCP StreamableHTTP only accepts POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : null;

    if (!body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Empty request body' }),
      };
    }

    // Handle batch requests (array of JSON-RPC messages)
    if (Array.isArray(body)) {
      const results = await Promise.all(body.map(handleMethod));
      // Filter out nulls (notifications don't produce responses)
      const responses = results.filter(Boolean);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(responses.length === 1 ? responses[0] : responses),
      };
    }

    // Single JSON-RPC message
    const result = await handleMethod(body);
    if (result === null) {
      // Notification — 204 No Content
      return { statusCode: 204, headers, body: '' };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('MCP handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(
        jsonRpcError(null, -32603, error instanceof Error ? error.message : 'Internal error'),
      ),
    };
  }
};
