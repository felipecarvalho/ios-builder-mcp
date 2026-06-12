import { describe, it, expect } from 'vitest';
import { configSchema } from '../../src/config';

describe('Server Integration', () => {
  it('should load config without errors', async () => {
    const { config } = await import('../../src/config');
    expect(config).toBeDefined();
    expect(config.projectRoot).toBeTruthy();
    expect(config.logLevel).toMatch(/^(error|warn|info|debug)$/);
  });

  it('should have valid env var defaults', () => {
    const result = configSchema.parse({});
    expect(result.projectRoot).toBeTruthy();
    expect(result.simulatorDevice).toBe('iPhone 15 Pro');
    expect(result.xcodePath).toBe('/Applications/Xcode.app');
  });
});
