import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { registerAllTools } from './tools/index.js';
import { registerAllPrompts } from './prompts/index.js';

export function createIOSBuilderServer(): Server {
  const server = new Server(
    {
      name: 'ios-builder-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
      },
    }
  );

  // Register all tools
  registerAllTools(server);

  // Register all prompts
  registerAllPrompts(server);

  // Error handling
  server.onerror = (error) => {
    console.error('[MCP Error]', error);
  };

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  return server;
}
