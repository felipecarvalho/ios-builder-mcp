#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createIOSBuilderServer } from './server.js';

async function main() {
  const server = createIOSBuilderServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  console.error('iOS Builder MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
