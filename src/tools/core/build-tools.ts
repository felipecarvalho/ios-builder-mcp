import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';
import { config } from '../../config.js';

const execAsync = promisify(exec);

const verifyCompileSchema = z.object({
  files: z.array(z.string()).optional().describe('Optional specific files to check'),
});

const runCommandSchema = z.object({
  command: z.string().describe('Shell command to execute'),
  timeout: z.number().default(30000).describe('Timeout in milliseconds'),
});

const buildProjectSchema = z.object({
  scheme: z.string().optional().describe('Xcode scheme name'),
  configuration: z.string().default('Debug').describe('Build configuration'),
  destination: z.string().default('platform=iOS Simulator,name=iPhone 15 Pro').describe('Build destination'),
});

export function registerBuildTools(): void {
  registerTool(
    {
      name: 'verify_compile',
      description: 'Check Swift files for compilation errors using swiftc.',
      inputSchema: {
        type: 'object',
        properties: {
          files: { type: 'array', items: { type: 'string' }, description: 'Optional specific files to check' },
        },
      },
    },
    handleVerifyCompile,
  );

  registerTool(
    {
      name: 'run_command',
      description: 'Execute a shell command in the project root.',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Shell command to execute' },
          timeout: { type: 'number', description: 'Timeout in milliseconds' },
        },
        required: ['command'],
      },
    },
    handleRunCommand,
  );

  registerTool(
    {
      name: 'build_project',
      description: 'Build the Xcode project using xcodebuild.',
      inputSchema: {
        type: 'object',
        properties: {
          scheme: { type: 'string', description: 'Xcode scheme name' },
          configuration: { type: 'string', description: 'Build configuration' },
          destination: { type: 'string', description: 'Build destination' },
        },
      },
    },
    handleBuildProject,
  );
}

async function handleVerifyCompile(args: unknown): Promise<ToolResult> {
  const { files } = verifyCompileSchema.parse(args);
  
  const swiftFiles = files || await findSwiftFiles();
  
  if (swiftFiles.length === 0) {
    return createTextResult('No Swift files found to verify.');
  }
  
  const fileArgs = swiftFiles.map(f => path.join(config.projectRoot, f)).join(' ');
  const command = `swiftc -typecheck ${fileArgs}`;
  
  try {
    const { stderr } = await execAsync(command, {
      cwd: config.projectRoot,
      timeout: 60000,
    });
    
    if (stderr) {
      return createTextResult(`Type check completed with warnings:\n${stderr}`);
    }
    
    return createTextResult('✓ All files passed type checking');
  } catch (error: any) {
    return createTextResult(`Type check failed:\n${error.stderr || error.message}`);
  }
}

async function handleRunCommand(args: unknown): Promise<ToolResult> {
  const { command, timeout } = runCommandSchema.parse(args);
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: config.projectRoot,
      timeout,
    });
    
    const output = [
      stdout ? `STDOUT:\n${stdout}` : '',
      stderr ? `STDERR:\n${stderr}` : '',
    ].filter(Boolean).join('\n\n');
    
    return createTextResult(output || 'Command completed successfully (no output)');
  } catch (error: any) {
    return createErrorResult(
      `Command failed:\n${error.stderr || error.message}\nExit code: ${error.code}`
    );
  }
}

async function handleBuildProject(args: unknown): Promise<ToolResult> {
  const { scheme, configuration, destination } = buildProjectSchema.parse(args);
  
  const xcodeProject = await findXcodeProject();
  if (!xcodeProject) {
    return createErrorResult('No Xcode project found (.xcodeproj or .xcworkspace)');
  }
  
  const schemeArg = scheme ? `-scheme "${scheme}"` : '';
  const command = `xcodebuild -project "${xcodeProject}" ${schemeArg} -configuration "${configuration}" -destination "${destination}" build`;
  
  try {
    const { stderr } = await execAsync(command, {
      cwd: config.projectRoot,
      timeout: 300000,
    });
    
    if (stderr && !stderr.includes('** BUILD SUCCEEDED **')) {
      return createTextResult(`Build completed with warnings:\n${stderr}`);
    }
    
    return createTextResult('✓ Build succeeded');
  } catch (error: any) {
    return createErrorResult(`Build failed:\n${error.stderr || error.message}`);
  }
}

async function findSwiftFiles(): Promise<string[]> {
  const { glob } = await import('glob');
  return glob('**/*.swift', {
    cwd: config.projectRoot,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'DerivedData/**'],
  });
}

async function findXcodeProject(): Promise<string | null> {
  const { glob } = await import('glob');
  
  const workspaces = await glob('*.xcworkspace', { cwd: config.projectRoot });
  if (workspaces.length > 0) {
    return workspaces[0];
  }
  
  const projects = await glob('*.xcodeproj', { cwd: config.projectRoot });
  if (projects.length > 0) {
    return projects[0];
  }
  
  return null;
}
