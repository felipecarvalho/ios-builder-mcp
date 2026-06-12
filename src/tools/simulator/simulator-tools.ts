import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';
import { config } from '../../config.js';

const execAsync = promisify(exec);

// ============================================================
// Schemas
// ============================================================

const takeScreenshotSchema = z.object({
  device: z.string().optional().describe('Simulator device UDID or name'),
  filename: z.string().optional().describe('Custom output filename'),
  includeTimestamps: z.boolean().default(true).describe('Include timestamp in filename'),
});

const bootSimulatorSchema = z.object({
  device: z.string().optional().describe('Device UDID, name, or "default"'),
});

const installAppSchema = z.object({
  appPath: z.string().describe('Path to .app bundle'),
  device: z.string().optional().describe('Target device UDID or name'),
});

const launchAppSchema = z.object({
  bundleId: z.string().describe('Bundle identifier of the app'),
  device: z.string().optional().describe('Target device UDID or name'),
  args: z.array(z.string()).optional().describe('Launch arguments'),
});

const simulatorInteractionSchema = z.object({
  device: z.string().optional().describe('Target device UDID or name'),
  x: z.number().describe('X coordinate'),
  y: z.number().describe('Y coordinate'),
});

const dragSchema = z.object({
  device: z.string().optional().describe('Target device UDID or name'),
  fromX: z.number().describe('Start X coordinate'),
  fromY: z.number().describe('Start Y coordinate'),
  toX: z.number().describe('End X coordinate'),
  toY: z.number().describe('End Y coordinate'),
  duration: z.number().default(0.5).describe('Drag duration in seconds'),
});

const typeTextSchema = z.object({
  device: z.string().optional().describe('Target device UDID or name'),
  text: z.string().describe('Text to type'),
});

const simulatorPressButtonSchema = z.object({
  device: z.string().optional().describe('Target device UDID or name'),
  button: z.enum(['home', 'lock', 'volumeup', 'volumedown', 'power', 'siri', 'reload']).describe('Hardware button to press'),
});

const rotateSchema = z.object({
  device: z.string().optional().describe('Target device UDID or name'),
  orientation: z.enum(['portrait', 'portrait_upside_down', 'landscape_left', 'landscape_right']).describe('Target orientation'),
});

// ============================================================
// Registration
// ============================================================

export function registerSimulatorTools(): void {
  registerTool(
    {
      name: 'simulator_screenshot',
      description: 'Take a screenshot of the iOS simulator and return it as a base64-encoded image.',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', description: 'Simulator device UDID or name' },
          filename: { type: 'string', description: 'Custom output filename' },
          includeTimestamps: { type: 'boolean', description: 'Include timestamp in filename' },
        },
      },
    },
    handleTakeScreenshot,
  );

  registerTool(
    {
      name: 'simulator_open',
      description: 'Open the iOS Simulator app.',
      inputSchema: { type: 'object', properties: {} },
    },
    handleOpenSimulator,
  );

  registerTool(
    {
      name: 'simulator_status',
      description: 'Check which simulators are currently running and their boot state.',
      inputSchema: { type: 'object', properties: {
        device: { type: 'string', description: 'Optional specific device to check' },
      }},
    },
    handleSimulatorStatus,
  );

  registerTool(
    {
      name: 'simulator_boot',
      description: 'Boot a simulator device.',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', description: 'Device UDID, name, or "default"' },
        },
      },
    },
    handleBootSimulator,
  );

  registerTool(
    {
      name: 'simulator_shutdown',
      description: 'Shut down a simulator device.',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', description: 'Device UDID or name' },
        },
      },
    },
    handleShutdownSimulator,
  );

  registerTool(
    {
      name: 'simulator_install',
      description: 'Install a .app bundle onto a simulator.',
      inputSchema: {
        type: 'object',
        properties: {
          appPath: { type: 'string', description: 'Path to .app bundle' },
          device: { type: 'string', description: 'Target device UDID or name' },
        },
        required: ['appPath'],
      },
    },
    handleInstallApp,
  );

  registerTool(
    {
      name: 'simulator_launch',
      description: 'Launch an app on a simulator by bundle ID.',
      inputSchema: {
        type: 'object',
        properties: {
          bundleId: { type: 'string', description: 'Bundle identifier of the app' },
          device: { type: 'string', description: 'Target device UDID or name' },
          args: { type: 'array', items: { type: 'string' }, description: 'Launch arguments' },
        },
        required: ['bundleId'],
      },
    },
    handleLaunchApp,
  );

  registerTool(
    {
      name: 'simulator_terminate',
      description: 'Terminate a running app on a simulator.',
      inputSchema: {
        type: 'object',
        properties: {
          bundleId: { type: 'string', description: 'Bundle identifier' },
          device: { type: 'string', description: 'Target device UDID or name' },
        },
        required: ['bundleId'],
      },
    },
    handleTerminateApp,
  );

  registerTool(
    {
      name: 'simulator_tap',
      description: 'Simulate a tap at the specified coordinates on a simulator screen.',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', description: 'Target device UDID or name' },
          x: { type: 'number', description: 'X coordinate' },
          y: { type: 'number', description: 'Y coordinate' },
        },
        required: ['x', 'y'],
      },
    },
    handleSimulatorTap,
  );

  registerTool(
    {
      name: 'simulator_drag',
      description: 'Simulate a drag gesture from one coordinate to another.',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', description: 'Target device UDID or name' },
          fromX: { type: 'number', description: 'Start X coordinate' },
          fromY: { type: 'number', description: 'Start Y coordinate' },
          toX: { type: 'number', description: 'End X coordinate' },
          toY: { type: 'number', description: 'End Y coordinate' },
          duration: { type: 'number', description: 'Drag duration in seconds' },
        },
        required: ['fromX', 'fromY', 'toX', 'toY'],
      },
    },
    handleSimulatorDrag,
  );

  registerTool(
    {
      name: 'simulator_type',
      description: 'Type text into the simulator keyboard.',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', description: 'Target device UDID or name' },
          text: { type: 'string', description: 'Text to type' },
        },
        required: ['text'],
      },
    },
    handleSimulatorType,
  );

  registerTool(
    {
      name: 'simulator_button',
      description: 'Press a hardware button on the simulator (home, lock, volume, power, siri).',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', description: 'Target device UDID or name' },
          button: {
            type: 'string',
            enum: ['home', 'lock', 'volumeup', 'volumedown', 'power', 'siri', 'reload'],
            description: 'Hardware button to press',
          },
        },
        required: ['button'],
      },
    },
    handleSimulatorButton,
  );

  registerTool(
    {
      name: 'simulator_rotate',
      description: 'Rotate the simulator to a specified orientation.',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', description: 'Target device UDID or name' },
          orientation: {
            type: 'string',
            enum: ['portrait', 'portrait_upside_down', 'landscape_left', 'landscape_right'],
            description: 'Target orientation',
          },
        },
        required: ['orientation'],
      },
    },
    handleSimulatorRotate,
  );

  registerTool(
    {
      name: 'simulator_logs',
      description: 'Read recent system logs from the simulator.',
      inputSchema: {
        type: 'object',
        properties: {
          device: { type: 'string', description: 'Target device UDID or name' },
          bundleId: { type: 'string', description: 'Filter logs by bundle ID' },
          lines: { type: 'number', description: 'Number of recent lines to return' },
          predicate: { type: 'string', description: 'Custom NSPredicate for filtering' },
        },
      },
    },
    handleSimulatorLogs,
  );

  registerTool(
    {
      name: 'simulator_list_devices',
      description: 'List all available simulator devices and their current state.',
      inputSchema: { type: 'object', properties: {} },
    },
    handleListDevices,
  );
}

// ============================================================
// Handlers
// ============================================================

async function handleTakeScreenshot(args: unknown): Promise<ToolResult> {
  const { device, filename, includeTimestamps } = takeScreenshotSchema.parse(args);
  
  const deviceArg = device ? `--udid ${device}` : '';
  const ts = includeTimestamps ? `-${Date.now()}` : '';
  const outputFile = filename || `simulator-screenshot${ts}.png`;
  const outputPath = path.join(config.projectRoot, outputFile);
  
  try {
    await execAsync(`xcrun simctl io ${deviceArg} screenshot "${outputPath}"`, {
      timeout: 30000,
    });
    
    // Read the screenshot and return as base64
    const imageBuffer = await fs.readFile(outputPath);
    const base64 = imageBuffer.toString('base64');
    
    return {
      content: [
        { type: 'text', text: `Screenshot saved: ${outputFile}` },
        { type: 'image', data: base64, mimeType: 'image/png' },
      ],
    };
  } catch (error: any) {
    return createErrorResult(`Screenshot failed: ${error.stderr || error.message}`);
  }
}

async function handleOpenSimulator(): Promise<ToolResult> {
  try {
    await execAsync('open -a Simulator', { timeout: 10000 });
    return createTextResult('Simulator app opened');
  } catch (error: any) {
    return createErrorResult(`Failed to open simulator: ${error.stderr || error.message}`);
  }
}

async function handleSimulatorStatus(args: unknown): Promise<ToolResult> {
  const { device } = z.object({ device: z.string().optional() }).parse(args);
  
  try {
    if (device) {
      const { stdout } = await execAsync(
        `xcrun simctl list devices | grep -i "${device}"`,
        { timeout: 10000 },
      );
      return createTextResult(`Device status:\n${stdout}`);
    }
    
    const { stdout } = await execAsync(
      'xcrun simctl list devices | grep -E "(Booted|Shutdown)"',
      { timeout: 10000 },
    );
    return createTextResult(`Simulator devices:\n${stdout}`);
  } catch (error: any) {
    return createErrorResult(`Failed to get status: ${error.stderr || error.message}`);
  }
}

async function handleBootSimulator(args: unknown): Promise<ToolResult> {
  const { device } = bootSimulatorSchema.parse(args);
  let deviceArg = device;
  
  if (!deviceArg || deviceArg === 'default') {
    const { stdout } = await execAsync(
      'xcrun simctl list devices available | grep -v "^--" | tail -1 | sed "s/.*(\\([^)]*\\))/\\1/"',
      { timeout: 10000 },
    );
    deviceArg = stdout.trim();
  }
  
  try {
    const { stdout } = await execAsync(`xcrun simctl boot "${deviceArg}"`, { timeout: 60000 });
    
    // Open the simulator app to show it
    await execAsync('open -a Simulator', { timeout: 10000 }).catch(() => {});
    
    return createTextResult(`Booted simulator: ${deviceArg}${stdout ? '\n' + stdout : ''}`);
  } catch (error: any) {
    if (error.stderr?.includes('already booted')) {
      await execAsync('open -a Simulator', { timeout: 10000 }).catch(() => {});
      return createTextResult(`Simulator already booted: ${deviceArg}`);
    }
    return createErrorResult(`Failed to boot simulator: ${error.stderr || error.message}`);
  }
}

async function handleShutdownSimulator(args: unknown): Promise<ToolResult> {
  const { device } = z.object({ device: z.string().describe('Device UDID or name') }).parse(args);
  
  try {
    const { stdout } = await execAsync(`xcrun simctl shutdown "${device}"`, { timeout: 30000 });
    return createTextResult(`Shut down simulator: ${device}${stdout ? '\n' + stdout : ''}`);
  } catch (error: any) {
    return createErrorResult(`Failed to shutdown: ${error.stderr || error.message}`);
  }
}

async function handleInstallApp(args: unknown): Promise<ToolResult> {
  const { appPath, device } = installAppSchema.parse(args);
  const deviceArg = device || '';
  
  try {
    const { stdout } = await execAsync(
      `xcrun simctl install ${deviceArg} "${appPath}"`,
      { timeout: 120000 },
    );
    return createTextResult(`App installed: ${appPath}${stdout ? '\n' + stdout : ''}`);
  } catch (error: any) {
    return createErrorResult(`Install failed: ${error.stderr || error.message}`);
  }
}

async function handleLaunchApp(args: unknown): Promise<ToolResult> {
  const { bundleId, device, args: launchArgs } = launchAppSchema.parse(args);
  const deviceArg = device || '';
  const argsStr = launchArgs?.join(' ') || '';
  
  try {
    const { stdout } = await execAsync(
      `xcrun simctl launch ${deviceArg} "${bundleId}" ${argsStr}`,
      { timeout: 30000 },
    );
    return createTextResult(`Launched: ${bundleId}${stdout ? '\n' + stdout : ''}`);
  } catch (error: any) {
    return createErrorResult(`Launch failed: ${error.stderr || error.message}`);
  }
}

async function handleTerminateApp(args: unknown): Promise<ToolResult> {
  const { bundleId, device } = z.object({
    bundleId: z.string(),
    device: z.string().optional(),
  }).parse(args);
  const deviceArg = device || '';
  
  try {
    const { stdout } = await execAsync(
      `xcrun simctl terminate ${deviceArg} "${bundleId}"`,
      { timeout: 15000 },
    );
    return createTextResult(`Terminated: ${bundleId}${stdout ? '\n' + stdout : ''}`);
  } catch (error: any) {
    return createErrorResult(`Terminate failed: ${error.stderr || error.message}`);
  }
}

async function handleSimulatorTap(args: unknown): Promise<ToolResult> {
  const { device, x, y } = simulatorInteractionSchema.parse(args);
  const deviceArg = device || '';
  
  try {
    const { stdout } = await execAsync(
      `xcrun simctl ${deviceArg} ui ${x} ${y}`,
      { timeout: 10000 },
    );
    return createTextResult(`Tapped at (${x}, ${y})${stdout ? '\n' + stdout : ''}`);
  } catch (error: any) {
    // Fallback: try the older `point` command
    try {
      await execAsync(
        `xcrun simctl ${deviceArg} point ${x} ${y}`,
        { timeout: 10000 },
      );
      return createTextResult(`Tapped at (${x}, ${y})`);
    } catch {
      return createErrorResult(`Tap failed: ${error.stderr || error.message}`);
    }
  }
}

async function handleSimulatorDrag(args: unknown): Promise<ToolResult> {
  const { device, fromX, fromY, toX, toY, duration } = dragSchema.parse(args);
  const deviceArg = device || '';
  
  try {
    const { stdout } = await execAsync(
      `xcrun simctl ${deviceArg} drag ${fromX} ${fromY} ${toX} ${toY} ${duration}`,
      { timeout: 15000 },
    );
    return createTextResult(
      `Dragged from (${fromX}, ${fromY}) to (${toX}, ${toY}) over ${duration}s${stdout ? '\n' + stdout : ''}`
    );
  } catch (error: any) {
    return createErrorResult(`Drag failed: ${error.stderr || error.message}`);
  }
}

async function handleSimulatorType(args: unknown): Promise<ToolResult> {
  const { device, text } = typeTextSchema.parse(args);
  const deviceArg = device || '';
  
  // Escape special characters for shell
  const escapedText = text.replace(/"/g, '\\"');
  
  try {
    const { stdout } = await execAsync(
      `xcrun simctl ${deviceArg} keyboard "${escapedText}"`,
      { timeout: 30000 },
    );
    return createTextResult(`Typed: "${text}"${stdout ? '\n' + stdout : ''}`);
  } catch (error: any) {
    // Fallback: try pbpaste + pasteboard approach
    try {
      const { execSync } = await import('child_process');
      execSync(`echo "${escapedText}" | pbcopy`, { timeout: 5000 });
      const { stdout: pasteStdout } = await execAsync(
        `xcrun simctl ${deviceArg} pbpaste`,
        { timeout: 10000 },
      );
      return createTextResult(`Typed via pasteboard: "${text}"${pasteStdout ? '\n' + pasteStdout : ''}`);
    } catch {
      return createErrorResult(`Type failed: ${error.stderr || error.message}`);
    }
  }
}

async function handleSimulatorButton(args: unknown): Promise<ToolResult> {
  const { device, button } = simulatorPressButtonSchema.parse(args);
  const deviceArg = device || '';
  const simctlButtonMap: Record<string, string> = {
    home: 'Home',
    lock: 'Lock',
    volumeup: 'VolumeUp',
    volumedown: 'VolumeDown',
    power: 'Power',
    siri: 'Siri',
    reload: 'Reload',
  };
  
  const simctlButton = simctlButtonMap[button] || button;
  
  try {
    const { stdout } = await execAsync(
      `xcrun simctl ${deviceArg} button ${simctlButton}`,
      { timeout: 10000 },
    );
    return createTextResult(`Pressed ${button} button${stdout ? '\n' + stdout : ''}`);
  } catch (error: any) {
    return createErrorResult(`Button press failed: ${error.stderr || error.message}`);
  }
}

async function handleSimulatorRotate(args: unknown): Promise<ToolResult> {
  const { device, orientation } = rotateSchema.parse(args);
  const deviceArg = device || '';
  
  try {
    const { stdout } = await execAsync(
      `xcrun simctl ${deviceArg} rotate ${orientation}`,
      { timeout: 10000 },
    );
    return createTextResult(`Rotated to ${orientation}${stdout ? '\n' + stdout : ''}`);
  } catch (error: any) {
    return createErrorResult(`Rotate failed: ${error.stderr || error.message}`);
  }
}

async function handleSimulatorLogs(args: unknown): Promise<ToolResult> {
  const { device, bundleId, lines, predicate } = z.object({
    device: z.string().optional(),
    bundleId: z.string().optional(),
    lines: z.number().optional(),
    predicate: z.string().optional(),
  }).parse(args);
  
  const deviceArg = device ? `--udid ${device}` : '--current';
  const predicateArg = predicate 
    ? `--predicate "${predicate}"` 
    : bundleId 
      ? `--predicate "process == '${bundleId}'"` 
      : '';
  
  try {
    // Use `log stream` via xcrun simctl for live logs
    const { stdout } = await execAsync(
      `xcrun simctl spawn ${deviceArg} log show --style compact --last 5m ${predicateArg} ${lines ? `--last ${lines} ` : '| tail -100'}`,
      { timeout: 30000 },
    );
    return createTextResult(stdout || 'No logs found');
  } catch (error: any) {
    // Fallback: try reading from device's log archive
    try {
      const { stdout: altStdout } = await execAsync(
        `xcrun simctl spawn ${deviceArg} log show --style compact --last 2m ${predicateArg} 2>/dev/null | tail -${lines || 50}`,
        { timeout: 15000 },
      );
      return createTextResult(altStdout || 'No logs found');
    } catch {
      return createErrorResult(`Failed to read logs: ${error.stderr || error.message}`);
    }
  }
}

async function handleListDevices(): Promise<ToolResult> {
  try {
    const { stdout } = await execAsync(
      'xcrun simctl list devices --json',
      { timeout: 10000 },
    );
    
    const parsed = JSON.parse(stdout);
    const devices = parsed.devices || {};
    
    const lines: string[] = [];
    for (const [runtime, deviceList] of Object.entries(devices)) {
      const runtimeName = runtime.split('.com.apple.CoreSimulator.SimRuntime.').pop() || runtime;
      const booted = (deviceList as any[]).filter((d: any) => d.isAvailable);
      if (booted.length > 0) {
        lines.push(`\n## ${runtimeName}`);
        for (const device of booted) {
          const state = device.state === 'Booted' ? '🟢' : '⚪';
          lines.push(`${state} ${device.name} (${device.udid}) - ${device.state}`);
        }
      }
    }
    
    return createTextResult(lines.join('\n') || 'No simulator devices found');
  } catch (error: any) {
    return createErrorResult(`Failed to list devices: ${error.stderr || error.message}`);
  }
}
