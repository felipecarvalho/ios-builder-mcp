import { z } from 'zod';

// Base tool input/output schemas
export const toolResultSchema = z.object({
  content: z.array(
    z.object({
      type: z.enum(['text', 'image', 'resource']),
      text: z.string().optional(),
      data: z.string().optional(),
      mimeType: z.string().optional(),
      uri: z.string().optional(),
    })
  ),
  isError: z.boolean().optional(),
});

export type ToolResult = z.infer<typeof toolResultSchema>;

// Helper to create success result
export function createTextResult(text: string): ToolResult {
  return {
    content: [{ type: 'text', text }],
  };
}

// Helper to create error result
export function createErrorResult(error: string): ToolResult {
  return {
    content: [{ type: 'text', text: error }],
    isError: true,
  };
}
