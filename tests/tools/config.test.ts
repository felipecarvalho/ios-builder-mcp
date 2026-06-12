import { describe, it, expect } from 'vitest';
import { configSchema } from '../../src/config';

describe('Config Schema', () => {
  it('should parse with default values', () => {
    const config = configSchema.parse({});
    expect(config.projectRoot).toBeDefined();
    expect(config.logLevel).toBe('info');
    expect(config.simulatorDevice).toBe('iPhone 15 Pro');
    expect(config.xcodePath).toBe('/Applications/Xcode.app');
  });

  it('should override with provided values', () => {
    const config = configSchema.parse({
      projectRoot: '/custom/path',
      logLevel: 'debug',
      simulatorDevice: 'iPhone 16 Pro',
      xcodePath: '/Applications/Xcode-beta.app',
    });

    expect(config.projectRoot).toBe('/custom/path');
    expect(config.logLevel).toBe('debug');
    expect(config.simulatorDevice).toBe('iPhone 16 Pro');
    expect(config.xcodePath).toBe('/Applications/Xcode-beta.app');
  });

  it('should reject invalid log levels', () => {
    expect(() => configSchema.parse({ logLevel: 'invalid' })).toThrow();
  });

  it('should accept all valid log levels', () => {
    const validLevels = ['error', 'warn', 'info', 'debug'] as const;
    for (const level of validLevels) {
      const config = configSchema.parse({ logLevel: level });
      expect(config.logLevel).toBe(level);
    }
  });
});
