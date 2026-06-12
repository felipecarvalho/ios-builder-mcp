import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';
import { config } from '../../config.js';
import { getDesignSystemById } from '../../design-systems/index.js';

const updateDesignSystemOptionsSchema = z.object({
  referenceOptions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    domain: z.string().optional(),
    styleId: z.string().optional(),
    traits: z.array(z.string()),
    rationale: z.string(),
  })).describe('3-4 distinct app-reference design directions'),
  paletteOptions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rationale: z.string(),
    primary: z.string(),
    accent: z.string(),
    background: z.string(),
    surface: z.string().optional(),
    text: z.string().optional(),
  })).describe('3-4 product-specific color palettes'),
  selectedReferenceId: z.string().optional(),
  selectedPaletteId: z.string().optional(),
  legacyMappedStyle: z.string().optional(),
});

const setDesignStyleSchema = z.object({
  style: z.string().describe('Design style ID'),
  reason: z.string().describe('Why this style fits the app'),
});

export function registerDesignSystemTools(): void {
  registerTool(
    {
      name: 'update_design_system_options',
      description: 'Present 3-4 distinct design directions with reference apps and palettes for the user to choose from.',
      inputSchema: {
        type: 'object',
        properties: {
          referenceOptions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                domain: { type: 'string' },
                styleId: { type: 'string' },
                traits: { type: 'array', items: { type: 'string' } },
                rationale: { type: 'string' },
              },
              required: ['id', 'name', 'traits', 'rationale'],
            },
          },
          paletteOptions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                rationale: { type: 'string' },
                primary: { type: 'string' },
                accent: { type: 'string' },
                background: { type: 'string' },
                surface: { type: 'string' },
                text: { type: 'string' },
              },
              required: ['id', 'name', 'rationale', 'primary', 'accent', 'background'],
            },
          },
          selectedReferenceId: { type: 'string' },
          selectedPaletteId: { type: 'string' },
          legacyMappedStyle: { type: 'string' },
        },
        required: ['referenceOptions', 'paletteOptions'],
      },
    },
    handleUpdateDesignSystemOptions,
  );

  registerTool(
    {
      name: 'set_design_style',
      description: 'Apply a design system style to the current project.',
      inputSchema: {
        type: 'object',
        properties: {
          style: { type: 'string', description: 'Design style ID' },
          reason: { type: 'string', description: 'Why this style fits the app' },
        },
        required: ['style', 'reason'],
      },
    },
    handleSetDesignStyle,
  );
}

async function handleUpdateDesignSystemOptions(args: unknown): Promise<ToolResult> {
  const data = updateDesignSystemOptionsSchema.parse(args);
  
  const projectPath = path.join(config.projectRoot, '.ios-builder', 'project.json');
  await fs.mkdir(path.dirname(projectPath), { recursive: true });
  
  let project: any = {};
  try {
    const existing = await fs.readFile(projectPath, 'utf-8');
    project = JSON.parse(existing);
  } catch {
    // New project
  }
  
  project.designSystemOptions = {
    referenceOptions: data.referenceOptions,
    paletteOptions: data.paletteOptions,
    selectedReferenceId: data.selectedReferenceId,
    selectedPaletteId: data.selectedPaletteId,
  };
  
  project.updatedAt = new Date();
  await fs.writeFile(projectPath, JSON.stringify(project, null, 2), 'utf-8');
  
  const summary = [
    `Design system options updated:`,
    `- ${data.referenceOptions.length} reference directions`,
    `- ${data.paletteOptions.length} color palettes`,
    data.selectedReferenceId ? `- Selected reference: ${data.selectedReferenceId}` : '',
    data.selectedPaletteId ? `- Selected palette: ${data.selectedPaletteId}` : '',
  ].filter(Boolean).join('\n');
  
  return createTextResult(summary);
}

async function handleSetDesignStyle(args: unknown): Promise<ToolResult> {
  const { style, reason } = setDesignStyleSchema.parse(args);
  
  const designSystem = getDesignSystemById(style);
  if (!designSystem) {
    return createErrorResult(`Unknown design style: ${style}`);
  }
  
  const projectPath = path.join(config.projectRoot, '.ios-builder', 'project.json');
  await fs.mkdir(path.dirname(projectPath), { recursive: true });
  
  let project: any = {};
  try {
    const existing = await fs.readFile(projectPath, 'utf-8');
    project = JSON.parse(existing);
  } catch {
    // New project
  }
  
  project.designSystem = designSystem;
  project.designStyleReason = reason;
  project.updatedAt = new Date();
  
  await fs.writeFile(projectPath, JSON.stringify(project, null, 2), 'utf-8');
  
  const summary = [
    `Design style set: ${designSystem.name}`,
    `Reason: ${reason}`,
    '',
    'Design System:',
    `- Style: ${designSystem.style.name}`,
    `- Palette: ${designSystem.palette.name}`,
    `- Typography: ${designSystem.typography.fontFamily}`,
    `- Signature Moves: ${designSystem.signatureMoves.length}`,
  ].join('\n');
  
  return createTextResult(summary);
}
