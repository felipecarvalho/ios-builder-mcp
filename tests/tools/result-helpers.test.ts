import { describe, it, expect } from 'vitest';
import { createTextResult, createErrorResult } from '../../src/types/tools';

describe('Tool Result Helpers', () => {
  it('createTextResult should return valid ToolResult', () => {
    const result = createTextResult('Hello, world!');

    expect(result).toEqual({
      content: [{ type: 'text', text: 'Hello, world!' }],
    });
    expect(result.isError).toBeUndefined();
  });

  it('createErrorResult should return error ToolResult', () => {
    const result = createErrorResult('Something went wrong');

    expect(result).toEqual({
      content: [{ type: 'text', text: 'Something went wrong' }],
      isError: true,
    });
  });

  it('createTextResult should handle multiline text', () => {
    const multiline = 'Line 1\nLine 2\nLine 3';
    const result = createTextResult(multiline);

    expect(result.content[0].text).toContain('Line 2');
    expect(result.content[0].text).toBe(multiline);
  });

  it('createErrorResult should handle empty string', () => {
    const result = createErrorResult('');

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('');
  });
});
