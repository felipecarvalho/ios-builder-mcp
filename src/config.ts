import { z } from 'zod';

export const configSchema = z.object({
  projectRoot: z.string().default(process.cwd()),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  simulatorDevice: z.string().default('iPhone 15 Pro'),
  xcodePath: z.string().default('/Applications/Xcode.app'),
});

export type Config = z.infer<typeof configSchema>;

export const config = configSchema.parse({
  projectRoot: process.env.IOS_BUILDER_PROJECT_ROOT || process.cwd(),
  logLevel: process.env.IOS_BUILDER_LOG_LEVEL || 'info',
  simulatorDevice: process.env.IOS_BUILDER_SIMULATOR_DEVICE || 'iPhone 15 Pro',
  xcodePath: process.env.IOS_BUILDER_XCODE_PATH || '/Applications/Xcode.app',
});
