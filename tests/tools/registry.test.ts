import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

describe('Tool Registry', () => {
  let registry: Awaited<ReturnType<typeof import('../../src/tools/registry')>>;

  beforeEach(async () => {
    registry = await import('../../src/tools/registry');
    registry.resetRegistry();
  });

  function createMockServer() {
    const handlers = new Map<any, any>();
    return {
      setRequestHandler: vi.fn((schema, handler) => {
        handlers.set(schema, handler);
      }),
      getHandler: (schema: any) => handlers.get(schema),
    };
  }

  it('should register a tool and list it via ListToolsRequestSchema', async () => {
    const { registerTool, setupToolServer } = registry;

    registerTool(
      { name: 'test_list_tool', description: 'A test tool', inputSchema: { type: 'object', properties: {} } },
      vi.fn().mockResolvedValue({ content: [{ type: 'text' as const, text: 'done' }] }),
    );

    const server = createMockServer();
    setupToolServer(server as any);

    const listHandler = server.getHandler(ListToolsRequestSchema);
    expect(listHandler).toBeDefined();

    const result = await listHandler({});
    const tools = (result as any).tools || [];
    const toolNames = tools.map((t: any) => t.name);
    expect(toolNames).toContain('test_list_tool');
  });

  it('should return error for unknown tool', async () => {
    const { registerTool, setupToolServer } = registry;

    registerTool(
      { name: 'known_tool', description: '', inputSchema: { type: 'object', properties: {} } },
      vi.fn(),
    );

    const server = createMockServer();
    setupToolServer(server as any);

    const callHandler = server.getHandler(CallToolRequestSchema);
    const result = await callHandler({
      params: { name: 'non_existent', arguments: {} },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown tool');
  });

  it('should route to correct handler by tool name', async () => {
    const { registerTool, setupToolServer } = registry;

    const handler1 = vi.fn().mockResolvedValue({ content: [{ type: 'text' as const, text: 'handler1' }] });
    const handler2 = vi.fn().mockResolvedValue({ content: [{ type: 'text' as const, text: 'handler2' }] });

    registerTool(
      { name: 'tool_one', description: '', inputSchema: { type: 'object', properties: {} } },
      handler1,
    );
    registerTool(
      { name: 'tool_two', description: '', inputSchema: { type: 'object', properties: {} } },
      handler2,
    );

    const server = createMockServer();
    setupToolServer(server as any);

    const callHandler = server.getHandler(CallToolRequestSchema);

    const result1 = await callHandler({ params: { name: 'tool_one', arguments: {} } });
    expect(result1.content[0].text).toBe('handler1');
    expect(handler1).toHaveBeenCalledOnce();

    const result2 = await callHandler({ params: { name: 'tool_two', arguments: {} } });
    expect(result2.content[0].text).toBe('handler2');
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('should handle handler errors gracefully', async () => {
    const { registerTool, setupToolServer } = registry;

    registerTool(
      { name: 'broken_tool', description: '', inputSchema: { type: 'object', properties: {} } },
      vi.fn().mockRejectedValue(new Error('Something broke')),
    );

    const server = createMockServer();
    setupToolServer(server as any);

    const callHandler = server.getHandler(CallToolRequestSchema);
    const result = await callHandler({ params: { name: 'broken_tool', arguments: {} } });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Something broke');
  });
});
