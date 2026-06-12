import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createTextResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';
import { config } from '../../config.js';

const setProjectIdentitySchema = z.object({
  name: z.string().describe('Short, polished app name'),
  imageFilename: z.string().optional().describe('Filename of uploaded icon image'),
});

export function registerIdentityTools(): void {
  registerTool(
    {
      name: 'set_project_identity',
      description: 'Set the app name and optional icon for the current project.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Short, polished app name' },
          imageFilename: { type: 'string', description: 'Filename of uploaded icon image' },
        },
        required: ['name'],
      },
    },
    handleSetProjectIdentity,
  );
}

async function handleSetProjectIdentity(args: unknown): Promise<ToolResult> {
  const { name, imageFilename } = setProjectIdentitySchema.parse(args);
  
  const projectPath = path.join(config.projectRoot, '.ios-builder', 'project.json');
  await fs.mkdir(path.dirname(projectPath), { recursive: true });
  
  let project: any = {};
  try {
    const existing = await fs.readFile(projectPath, 'utf-8');
    project = JSON.parse(existing);
  } catch {
    // New project
  }
  
  project.name = name;
  project.iconFilename = imageFilename;
  project.updatedAt = new Date();
  
  await fs.writeFile(projectPath, JSON.stringify(project, null, 2), 'utf-8');
  
  const summary = [
    `Project identity set:`,
    `- Name: ${name}`,
    imageFilename ? `- Icon: ${imageFilename}` : '',
  ].filter(Boolean).join('\n');
  
  return createTextResult(summary);
}
