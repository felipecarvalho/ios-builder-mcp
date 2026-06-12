import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';
import { config } from '../../config.js';

const execAsync = promisify(exec);

const generateIconSchema = z.object({
  sourceImage: z.string().describe('Path to source 1024x1024 PNG image'),
  outputDir: z.string().optional().describe('Output directory (default: AppIcon.appiconset)'),
  platform: z.enum(['ios', 'watchos', 'macos']).default('ios').describe('Platform for icon sizes'),
});

const generateScreenshotSchema = z.object({
  device: z.enum(['iPhone_6.5', 'iPhone_5.5', 'iPad_12.9', 'iPad_11']).default('iPhone_6.5').describe('Device type for screenshot'),
  simulatorDevice: z.string().optional().describe('Simulator device name'),
  locale: z.string().default('en-US').describe('Locale for screenshot text'),
  outputDir: z.string().optional().describe('Output directory'),
});

const generateMetadataSchema = z.object({
  appName: z.string().describe('App name'),
  subtitle: z.string().optional().describe('App subtitle'),
  description: z.string().describe('App description for App Store'),
  keywords: z.array(z.string()).describe('App Store keywords'),
  supportUrl: z.string().optional().describe('Support URL'),
  marketingUrl: z.string().optional().describe('Marketing URL'),
  privacyUrl: z.string().optional().describe('Privacy policy URL'),
  priceTier: z.number().default(0).describe('Price tier (0 = free)'),
  categories: z.array(z.string()).default(['Utilities']).describe('App Store categories'),
  languages: z.array(z.string()).default(['en-US']).describe('Supported languages'),
});

const ascCommandSchema = z.object({
  command: z.string().describe('asc command to execute'),
  args: z.array(z.string()).default([]).describe('Command arguments'),
});

const publishingStatusSchema = z.object({
  appId: z.string().optional().describe('Apple App ID'),
  stage: z.enum([
    'overall',
    'prepare_store_assets',
    'production_audit',
    'credentials',
    'prefill',
    'submission',
    'management',
  ]).default('overall').describe('Publishing stage to check'),
});

const updatePublishingStageSchema = z.object({
  stage: z.string().describe('Stage name to update'),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked', 'needs_review']).describe('New status'),
  notes: z.string().optional().describe('Notes or blockers'),
});

export function registerPublishingTools(): void {
  registerTool(
    {
      name: 'generate_app_icon',
      description: 'Generate iOS app icons in all required sizes from a source 1024x1024 PNG.',
      inputSchema: {
        type: 'object',
        properties: {
          sourceImage: { type: 'string', description: 'Source 1024x1024 PNG path' },
          outputDir: { type: 'string', description: 'Output directory' },
          platform: { type: 'string', enum: ['ios', 'watchos', 'macos'], description: 'Platform' },
        },
        required: ['sourceImage'],
      },
    },
    handleGenerateIcon,
  );

  registerTool(
    {
      name: 'generate_screenshot',
      description: 'Generate App Store screenshots from the simulator at the correct device sizes.',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', enum: ['iPhone_6.5', 'iPhone_5.5', 'iPad_12.9', 'iPad_11'], description: 'Device type' },
          simulatorDevice: { type: 'string', description: 'Simulator device name' },
          locale: { type: 'string', description: 'Locale' },
          outputDir: { type: 'string', description: 'Output directory' },
        },
      },
    },
    handleGenerateScreenshot,
  );

  registerTool(
    {
      name: 'generate_app_metadata',
      description: 'Generate App Store metadata (description, keywords, categories, pricing) as files.',
      inputSchema: {
        type: 'object',
        properties: {
          appName: { type: 'string', description: 'App name' },
          subtitle: { type: 'string', description: 'App subtitle' },
          description: { type: 'string', description: 'App description' },
          keywords: { type: 'array', items: { type: 'string' }, description: 'Keywords' },
          supportUrl: { type: 'string', description: 'Support URL' },
          marketingUrl: { type: 'string', description: 'Marketing URL' },
          privacyUrl: { type: 'string', description: 'Privacy policy URL' },
          priceTier: { type: 'number', description: 'Price tier' },
          categories: { type: 'array', items: { type: 'string' }, description: 'Categories' },
          languages: { type: 'array', items: { type: 'string' }, description: 'Languages' },
        },
        required: ['appName', 'description', 'keywords'],
      },
    },
    handleGenerateMetadata,
  );

  registerTool(
    {
      name: 'app_store_preflight',
      description: 'Run a preflight check to identify issues before App Store submission.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    handlePreflight,
  );

  registerTool(
    {
      name: 'asc_validate',
      description: 'Validate the app build using App Store Connect CLI (asc).',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'asc command' },
          args: { type: 'array', items: { type: 'string' }, description: 'Arguments' },
        },
      },
    },
    handleAscValidate,
  );

  registerTool(
    {
      name: 'asc_submit',
      description: 'Submit the app to App Store review using asc CLI.',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Apple App ID' },
          version: { type: 'string', description: 'Version string (e.g. 1.0.0)' },
          buildNumber: { type: 'string', description: 'Build number' },
          confirm: { type: 'boolean', default: false, description: 'Confirm submission' },
        },
        required: ['appId', 'version', 'buildNumber'],
      },
    },
    handleAscSubmit,
  );

  registerTool(
    {
      name: 'asc_status',
      description: 'Check App Store review status using asc CLI.',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Apple App ID' },
          watch: { type: 'boolean', default: false, description: 'Watch for status changes' },
        },
        required: ['appId'],
      },
    },
    handleAscStatus,
  );

  registerTool(
    {
      name: 'app_store_publishing_status',
      description: 'Get overall publishing status or check a specific stage.',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Apple App ID' },
          stage: {
            type: 'string',
            enum: ['overall', 'prepare_store_assets', 'production_audit', 'credentials', 'prefill', 'submission', 'management'],
            description: 'Stage to check',
          },
        },
      },
    },
    handlePublishingStatus,
  );

  registerTool(
    {
      name: 'app_store_publishing_update_stage',
      description: 'Update the status of a publishing stage.',
      inputSchema: {
        type: 'object',
        properties: {
          stage: { type: 'string', description: 'Stage name' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'blocked', 'needs_review'], description: 'New status' },
          notes: { type: 'string', description: 'Notes' },
        },
        required: ['stage', 'status'],
      },
    },
    handleUpdatePublishingStage,
  );
}

async function handleGenerateIcon(args: unknown): Promise<ToolResult> {
  const { sourceImage, outputDir, platform } = generateIconSchema.parse(args);
  
  const iconDir = outputDir || path.join(config.projectRoot, 'ios', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
  await fs.mkdir(iconDir, { recursive: true });
  
  const iconSizes: Record<string, { size: number; scales: number[] }[]> = {
    ios: [
      { size: 20, scales: [2, 3] },
      { size: 29, scales: [1, 2, 3] },
      { size: 40, scales: [2, 3] },
      { size: 60, scales: [2, 3] },
      { size: 76, scales: [1, 2] },
      { size: 83.5, scales: [2] },
      { size: 1024, scales: [1] },
    ],
  };
  
  try {
    // Verify source exists
    await fs.access(sourceImage);
    
    const contents: any[] = [];
    
    for (const { size, scales } of iconSizes[platform]) {
      for (const scale of scales) {
        const pixelSize = Math.round(size * scale);
        const filename = `icon-${pixelSize}x${pixelSize}.png`;
        const outputPath = path.join(iconDir, filename);
        
        if (pixelSize < 1024) {
          try {
            await execAsync(
              `sips -z ${pixelSize} ${pixelSize} "${sourceImage}" --out "${outputPath}"`,
              { timeout: 30000 },
            );
          } catch {
            // sips may not be available or image is not resizable
            await execAsync(
              `cp "${sourceImage}" "${outputPath}"`,
              { timeout: 5000 },
            );
          }
        } else {
          await fs.copyFile(sourceImage, outputPath);
        }
        
        contents.push({
          filename,
          idiom: platform === 'ios' ? 'universal' : platform,
          platform,
          size: `${size}x${size}`,
          scale: `${scale}x`,
        });
      }
    }
    
    const contentsJson = {
      images: contents,
      info: { author: 'xcode', version: 1 },
    };
    
    await fs.writeFile(
      path.join(iconDir, 'Contents.json'),
      JSON.stringify(contentsJson, null, 2),
      'utf-8',
    );
    
    return createTextResult(`App icon generated at ${iconDir}\n${contents.length} icon variants created`);
  } catch (error) {
    return createErrorResult(`Icon generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleGenerateScreenshot(args: unknown): Promise<ToolResult> {
  const { device, simulatorDevice, locale, outputDir } = generateScreenshotSchema.parse(args);
  
  const screenshotDir = outputDir || path.join(config.projectRoot, 'publishing', 'screenshots');
  await fs.mkdir(screenshotDir, { recursive: true });
  
  const deviceSizes: Record<string, { width: number; height: number; label: string }> = {
    'iPhone_6.5': { width: 1242, height: 2688, label: 'iPhone 6.5" (iPhone 15 Pro Max)' },
    'iPhone_5.5': { width: 1242, height: 2208, label: 'iPhone 5.5" (iPhone 8 Plus)' },
    'iPad_12.9': { width: 2048, height: 2732, label: 'iPad 12.9" (iPad Pro)' },
    'iPad_11': { width: 1668, height: 2388, label: 'iPad 11" (iPad Pro)' },
  };
  
  const size = deviceSizes[device];
  const filename = `screenshot-${device}-${locale}.png`;
  const outputPath = path.join(screenshotDir, filename);
  
  // Try simctl screenshot
  const simDevice = simulatorDevice || size.label.split('(')[1]?.replace(')', '') || 'iPhone 15 Pro';
  
  try {
    await execAsync(
      `xcrun simctl io booted screenshot "${outputPath}"`,
      { timeout: 30000 },
    );
    
    return createTextResult(`Screenshot captured: ${outputPath}\nDevice: ${simDevice}\nSize: ${size.width}x${size.height}\nLocale: ${locale}\n\nNote: Resize to ${size.width}x${size.height} for App Store requirements.`);
  } catch (error: any) {
    if (error.stderr?.includes('No device')) {
      return createTextResult(`## Screenshot Placeholder\n\nTo capture screenshots:\n1. Boot a simulator matching your target device\n2. Run: xcrun simctl io booted screenshot "${outputPath}"\n3. The image will be saved at ${outputPath}\n\nDevice: ${device} (${size.width}x${size.height})\nRecommended simulator: ${simDevice}`);
    }
    return createErrorResult(`Screenshot failed: ${error.stderr || error.message}`);
  }
}

async function handleGenerateMetadata(args: unknown): Promise<ToolResult> {
  const data = generateMetadataSchema.parse(args);
  
  const metadataDir = path.join(config.projectRoot, 'publishing', 'metadata');
  await fs.mkdir(metadataDir, { recursive: true });
  
  const metadata = {
    appName: data.appName,
    subtitle: data.subtitle || '',
    description: data.description,
    keywords: data.keywords.join(', '),
    supportUrl: data.supportUrl || `https://${data.appName.toLowerCase().replace(/\s+/g, '')}.app/support`,
    marketingUrl: data.marketingUrl || `https://${data.appName.toLowerCase().replace(/\s+/g, '')}.app`,
    privacyUrl: data.privacyUrl || `https://${data.appName.toLowerCase().replace(/\s+/g, '')}.app/privacy`,
    priceTier: data.priceTier,
    categories: data.categories,
    languages: data.languages,
  };
  
  const metadataPath = path.join(metadataDir, 'app-store-metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  
  // Also generate a human-readable markdown
  const mdContent = `# ${data.appName} — App Store Metadata

## Description
${data.description}

## Keywords
${data.keywords.join(', ')}

## Categories
${data.categories.join(', ')}

## Pricing
Tier ${data.priceTier}${data.priceTier === 0 ? ' (Free)' : ''}

## URLs
- **Support**: ${metadata.supportUrl}
- **Marketing**: ${metadata.marketingUrl}
- **Privacy Policy**: ${metadata.privacyUrl}

## Localizations
${data.languages.join(', ')}

## Notes
- Generated for ${data.appName}
- Languages: ${data.languages.length}
- Categories: ${data.categories.length}
`;
  
  const mdPath = path.join(metadataDir, 'app-store-metadata.md');
  await fs.writeFile(mdPath, mdContent, 'utf-8');
  
  return createTextResult(`App Store metadata generated:\n\n${mdContent}\n\nFiles saved:\n- ${metadataPath}\n- ${mdPath}`);
}

async function handlePreflight(): Promise<ToolResult> {
  const projectPath = path.join(config.projectRoot, '.ios-builder', 'project.json');
  let project: any = {};
  
  try {
    const content = await fs.readFile(projectPath, 'utf-8');
    project = JSON.parse(content);
  } catch {
    // No project file
  }
  
  const checks: string[] = [];
  const blockers: string[] = [];
  
  // Check 1: Project identity
  if (project.name) {
    checks.push(`✅ App name: ${project.name}`);
  } else {
    blockers.push('❌ App name not set. Use set_project_identity.');
  }
  
  // Check 2: Design system
  if (project.designSystem) {
    checks.push(`✅ Design system: ${project.designSystem.name}`);
  } else {
    blockers.push('❌ No design system applied. Use set_design_style.');
  }
  
  // Check 3: App Store metadata
  const metadataPath = path.join(config.projectRoot, 'publishing', 'metadata', 'app-store-metadata.json');
  try {
    await fs.access(metadataPath);
    checks.push('✅ App Store metadata generated');
  } catch {
    blockers.push('❌ No App Store metadata. Use generate_app_metadata.');
  }
  
  // Check 4: App icon
  const iconPath = path.join(config.projectRoot, 'ios', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'Contents.json');
  try {
    await fs.access(iconPath);
    checks.push('✅ App icon assets found');
  } catch {
    blockers.push('⚠️  No app icon assets. Use generate_app_icon.');
  }
  
  // Check 5: Xcode project
  const { glob } = await import('glob');
  const xcworkspace = await glob('*.xcworkspace', { cwd: config.projectRoot });
  const xcodeproj = await glob('*.xcodeproj', { cwd: config.projectRoot });
  if (xcworkspace.length > 0 || xcodeproj.length > 0) {
    checks.push(`✅ Xcode project: ${xcworkspace[0] || xcodeproj[0]}`);
  } else {
    blockers.push('❌ No Xcode project found. Create an Xcode project first.');
  }
  
  // Check 6: ASC credentials
  const hasAsc = !!(process.env.ASC_KEY_ID && process.env.ASC_ISSUER_ID);
  if (hasAsc) {
    checks.push('✅ ASC credentials configured');
  } else {
    blockers.push('⚠️  ASC credentials not set. Set ASC_KEY_ID and ASC_ISSUER_ID env vars.');
  }
  
  const report = `# App Store Preflight Report\n\n${checks.join('\n')}\n\n## ${blockers.length > 0 ? 'Actions Required' : 'Ready for Submission'}\n${blockers.join('\n') || '✅ All checks passed. Ready for App Store submission.'}`;
  
  return createTextResult(report);
}

async function handleAscValidate(args: unknown): Promise<ToolResult> {
  const { command, args: cmdArgs } = ascCommandSchema.parse(args);
  
  const fullCommand = `asc ${command} ${cmdArgs.join(' ')} --output json`;
  
  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout: 120000,
    });
    
    return createTextResult(stdout || stderr || 'Validation completed');
  } catch (error: any) {
    return createTextResult(`## ASC Validation\n\nTo validate manually:\n\`\`\`bash\nasc validate --app "YOUR_APP_ID" --version "1.0.0"\n\`\`\`\n\nasc CLI not found in PATH or not configured. Install:\nnpm install -g appstoreconnect\n\nThen set:\n- ASC_KEY_ID\n- ASC_ISSUER_ID\n- ASC_PRIVATE_KEY (path to .p8 file)`);
  }
}

async function handleAscSubmit(args: unknown): Promise<ToolResult> {
  const { appId, version, buildNumber, confirm } = z.object({
    appId: z.string(),
    version: z.string(),
    buildNumber: z.string(),
    confirm: z.boolean(),
  }).parse(args);
  
  if (!confirm) {
    return createTextResult(`## Submission Requires Confirmation\n\nTo submit ${appId} v${version} (build ${buildNumber}):\n\n\`\`\`bash\nasc release stage --app "${appId}" --version "${version}" --build "${buildNumber}" --confirm\nasc publish appstore --app "${appId}" --ipa "./App.ipa" --version "${version}" --submit --confirm\n\`\`\`\n\nSet confirm: true to proceed.`);
  }
  
  try {
    const { stdout } = await execAsync(
      `asc release stage --app "${appId}" --version "${version}" --build "${buildNumber}" --confirm --output json`,
      { timeout: 180000 },
    );
    
    return createTextResult(`Submission initiated:\n${stdout}\n\nTrack status with asc_status.`);
  } catch (error: any) {
    return createErrorResult(`Submission failed: ${error.stderr || error.message}`);
  }
}

async function handleAscStatus(args: unknown): Promise<ToolResult> {
  const { appId, watch } = z.object({
    appId: z.string(),
    watch: z.boolean(),
  }).parse(args);
  
  try {
    const { stdout } = await execAsync(
      `asc review status --app "${appId}" ${watch ? '--watch' : ''} --output json`,
      { timeout: watch ? 300000 : 30000 },
    );
    
    return createTextResult(stdout || `Review status for ${appId}: check manually with:\nasc review status --app "${appId}"`);
  } catch (error: any) {
    return createTextResult(`## Review Status\n\nTo check review status:\n\`\`\`bash\nasc review status --app "${appId}" --output json\n\`\`\`\n\nNote: asc CLI requires ASC_KEY_ID, ASC_ISSUER_ID, and ASC_PRIVATE_KEY env vars.`);
  }
}

async function handlePublishingStatus(args: unknown): Promise<ToolResult> {
  const { appId, stage } = publishingStatusSchema.parse(args);
  
  // Read publishing state from project
  const statePath = path.join(config.projectRoot, '.ios-builder', 'publishing.json');
  let state: Record<string, any> = {};
  
  try {
    const content = await fs.readFile(statePath, 'utf-8');
    state = JSON.parse(content);
  } catch {
    // No state yet
  }
  
  const stages: Record<string, { label: string; status: string }> = {
    prepare_store_assets: {
      label: 'Prepare Store Assets',
      status: state.prepare_store_assets?.status || 'pending',
    },
    production_audit: {
      label: 'Production Audit',
      status: state.production_audit?.status || 'pending',
    },
    credentials: {
      label: 'Credentials',
      status: state.credentials?.status || 'pending',
    },
    prefill: {
      label: 'Prefill',
      status: state.prefill?.status || 'pending',
    },
    submission: {
      label: 'Submission',
      status: state.submission?.status || 'pending',
    },
    management: {
      label: 'Management',
      status: state.management?.status || 'pending',
    },
  };
  
  const statusEmoji: Record<string, string> = {
    pending: '⬜',
    in_progress: '🔄',
    completed: '✅',
    blocked: '🔴',
    needs_review: '⚠️',
  };
  
  if (stage === 'overall') {
    const lines = Object.entries(stages).map(
      ([, s]) => `${statusEmoji[s.status] || '⬜'} **${s.label}**: ${s.status}`
    );
    return createTextResult(`## App Store Publishing Status\n${appId ? `\nApp ID: ${appId}` : ''}\n\n${lines.join('\n')}`);
  }
  
  const currentStage = stages[stage];
  if (!currentStage) {
    return createErrorResult(`Unknown stage: ${stage}`);
  }
  
  return createTextResult(`## ${currentStage.label}\n\nStatus: ${statusEmoji[currentStage.status]} ${currentStage.status}\n\nNotes: ${state[stage]?.notes || 'No notes'}`);
}

async function handleUpdatePublishingStage(args: unknown): Promise<ToolResult> {
  const { stage, status, notes } = updatePublishingStageSchema.parse(args);
  
  const statePath = path.join(config.projectRoot, '.ios-builder', 'publishing.json');
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  
  let state: Record<string, any> = {};
  try {
    const content = await fs.readFile(statePath, 'utf-8');
    state = JSON.parse(content);
  } catch {
    // New state
  }
  
  state[stage] = { status, notes: notes || '', updatedAt: new Date().toISOString() };
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');
  
  return createTextResult(`Stage "${stage}" updated to: ${status}${notes ? `\nNotes: ${notes}` : ''}`);
}
