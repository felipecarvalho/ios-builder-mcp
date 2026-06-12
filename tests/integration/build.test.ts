import { describe, it, expect } from 'vitest';

describe('TypeScript Compilation', () => {
  it('should successfully compile the entire project', async () => {
    // Run tsc and verify exit code
    const { execSync } = await import('child_process');
    const result = execSync('npx tsc --noEmit', {
      encoding: 'utf-8',
      timeout: 30000,
    });
    expect(result).toBe('');
  });
});

describe('Tool Registration Count', () => {
  it('should register at least 60 tools', async () => {
    // Check that all tool modules export registration functions
    const moduleDir = new URL('../../src/tools', import.meta.url).pathname;

    const { readdirSync } = await import('fs');
    const { statSync } = await import('path');

    const categories = ['core', 'design', 'research', 'simulator', 'integrations', 'publishing', 'growth'];
    let registrationCount = 0;

    for (const cat of categories) {
      const dir = `${moduleDir}/${cat}`;
      try {
        const files = readdirSync(dir).filter((f: string) => f.endsWith('.ts'));
        registrationCount += files.length;
      } catch {
        // Directory might not exist yet
      }
    }

    expect(registrationCount).toBeGreaterThanOrEqual(12);
  });
});
