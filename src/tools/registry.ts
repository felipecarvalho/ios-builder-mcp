import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ToolResult, createErrorResult } from '../types/tools.js';

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

type ToolHandler = (args: unknown) => Promise<ToolResult>;

const toolDefinitions: Map<string, ToolDefinition> = new Map();
const toolHandlers: Map<string, ToolHandler> = new Map();

export function registerTool(
  definition: ToolDefinition,
  handler: ToolHandler,
): void {
  toolDefinitions.set(definition.name, definition);
  toolHandlers.set(definition.name, handler);
}

/** @internal Reset registry state (for testing only) */
export function resetRegistry(): void {
  toolDefinitions.clear();
  toolHandlers.clear();
}

export function setupToolServer(server: Server): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Array.from(toolDefinitions.values()),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handler = toolHandlers.get(name);
    if (!handler) {
      return createErrorResult(`Unknown tool: ${name}`);
    }

    try {
      return await handler(args);
    } catch (error) {
      return createErrorResult(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
}
