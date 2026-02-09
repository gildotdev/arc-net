#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ScreenshotExtractTool } from './tools/screenshot-extract.js';

/**
 * ARC Net MCP Server
 * 
 * Provides tools for ARC Raiders game data and screenshot analysis.
 */
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

class ArcNetServer {
  private server: Server;
  private screenshotExtractTool: ScreenshotExtractTool;

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
        instructions: SERVER_INSTRUCTIONS,
      }
    );

    this.screenshotExtractTool = new ScreenshotExtractTool();

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    // Cleanup on process exit
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  /**
   * Setup MCP tool handlers
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
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
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
   * Start the MCP server
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ARC Net MCP server running on stdio');
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    await this.screenshotExtractTool.cleanup();
    process.exit(0);
  }
}

// Start the server
const server = new ArcNetServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
