import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createTextResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';
import { config } from '../../config.js';
import { Project, Task, Warning } from '../../types/project.js';

const updateProjectStatusSchema = z.object({
  plan: z.string().optional().describe('Full project plan in markdown'),
  tasks: z.string().optional().describe('Milestone checklist in markdown'),
  warningSeverity: z.enum(['info', 'warning', 'error']).optional(),
  warningTitle: z.string().optional(),
  warningCapability: z.string().optional(),
  warningLimitation: z.string().optional(),
  warningFallback: z.string().optional(),
});

const updateTaskPlanSchema = z.object({
  name: z.string().describe('Task name'),
  goal: z.string().describe('What this task is trying to accomplish'),
  affectedAreas: z.array(z.string()).optional(),
  checklist: z.array(z.object({
    description: z.string(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  })).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
});

const saveCheckpointSchema = z.object({
  name: z.string().describe('Checkpoint name'),
  description: z.string().describe('What was accomplished'),
  plan: z.string().optional(),
  tasks: z.string().optional(),
});

export function registerProjectTools(): void {
  registerTool(
    {
      name: 'update_project_status',
      description: 'Update the project plan, task checklist, or add a warning.',
      inputSchema: {
        type: 'object',
        properties: {
          plan: { type: 'string', description: 'Full project plan in markdown' },
          tasks: { type: 'string', description: 'Milestone checklist in markdown' },
          warningSeverity: { type: 'string', enum: ['info', 'warning', 'error'] },
          warningTitle: { type: 'string' },
          warningCapability: { type: 'string' },
          warningLimitation: { type: 'string' },
          warningFallback: { type: 'string' },
        },
      },
    },
    handleUpdateProjectStatus,
  );

  registerTool(
    {
      name: 'update_task_plan',
      description: 'Add a new task to the project plan with optional checklist and acceptance criteria.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Task name' },
          goal: { type: 'string', description: 'What this task is trying to accomplish' },
          affectedAreas: { type: 'array', items: { type: 'string' } },
          checklist: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
              },
              required: ['description', 'status'],
            },
          },
          acceptanceCriteria: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'goal'],
      },
    },
    handleUpdateTaskPlan,
  );

  registerTool(
    {
      name: 'read_plan',
      description: 'Read the current project plan, tasks, and warnings.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    handleReadPlan,
  );

  registerTool(
    {
      name: 'save_checkpoint',
      description: 'Save a named checkpoint for the current project state.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Checkpoint name' },
          description: { type: 'string', description: 'What was accomplished' },
          plan: { type: 'string' },
          tasks: { type: 'string' },
        },
        required: ['name', 'description'],
      },
    },
    handleSaveCheckpoint,
  );
}

async function handleUpdateProjectStatus(args: unknown): Promise<ToolResult> {
  const data = updateProjectStatusSchema.parse(args);
  
  const projectPath = path.join(config.projectRoot, '.ios-builder', 'project.json');
  await fs.mkdir(path.dirname(projectPath), { recursive: true });
  
  let project: Partial<Project> = {};
  try {
    const existing = await fs.readFile(projectPath, 'utf-8');
    project = JSON.parse(existing);
  } catch {
    // New project
  }
  
  if (data.plan) {
    project.plan = { markdown: data.plan };
  }
  
  if (data.tasks) {
    // Parse markdown checklist into tasks
    project.tasks = parseMarkdownChecklist(data.tasks);
  }
  
  if (data.warningTitle) {
    const warning: Warning = {
      title: data.warningTitle,
      severity: data.warningSeverity || 'warning',
      requestedCapability: data.warningCapability,
      limitation: data.warningLimitation || '',
      fallback: data.warningFallback,
    };
    project.warnings = project.warnings || [];
    project.warnings.push(warning);
  }
  
  project.updatedAt = new Date();
  
  await fs.writeFile(projectPath, JSON.stringify(project, null, 2), 'utf-8');
  
  return createTextResult('Project status updated');
}

async function handleUpdateTaskPlan(args: unknown): Promise<ToolResult> {
  const data = updateTaskPlanSchema.parse(args);
  
  const projectPath = path.join(config.projectRoot, '.ios-builder', 'project.json');
  await fs.mkdir(path.dirname(projectPath), { recursive: true });
  
  let project: Partial<Project> = {};
  try {
    const existing = await fs.readFile(projectPath, 'utf-8');
    project = JSON.parse(existing);
  } catch {
    // New project
  }
  
  const task: Task = {
    id: Date.now().toString(),
    name: data.name,
    description: data.goal,
    status: 'in_progress',
    priority: 'medium',
    affectedAreas: data.affectedAreas,
    checklist: data.checklist?.map((item, index) => ({
      id: index.toString(),
      description: item.description,
      status: item.status,
    })),
    acceptanceCriteria: data.acceptanceCriteria,
  };
  
  project.tasks = project.tasks || [];
  project.tasks.push(task);
  project.updatedAt = new Date();
  
  await fs.writeFile(projectPath, JSON.stringify(project, null, 2), 'utf-8');
  
  return createTextResult(`Task plan updated: ${data.name}`);
}

async function handleReadPlan(): Promise<ToolResult> {
  const projectPath = path.join(config.projectRoot, '.ios-builder', 'project.json');
  
  try {
    const content = await fs.readFile(projectPath, 'utf-8');
    const project: Partial<Project> = JSON.parse(content);
    
    const sections: string[] = [];
    
    if (project.plan?.markdown) {
      sections.push('## Project Plan\n' + project.plan.markdown);
    }
    
    if (project.tasks && project.tasks.length > 0) {
      const checklist = project.tasks
        .map(task => {
          const status = task.status === 'completed' ? '[x]' : '[ ]';
          return `- ${status} ${task.name}`;
        })
        .join('\n');
      sections.push('## Tasks\n' + checklist);
    }
    
    if (project.warnings && project.warnings.length > 0) {
      const warnings = project.warnings
        .map(w => `- **${w.title}**: ${w.limitation}`)
        .join('\n');
      sections.push('## Warnings\n' + warnings);
    }
    
    return createTextResult(sections.join('\n\n') || 'No plan found.');
  } catch {
    return createTextResult('No plan found.');
  }
}

async function handleSaveCheckpoint(args: unknown): Promise<ToolResult> {
  const data = saveCheckpointSchema.parse(args);
  
  const checkpointDir = path.join(config.projectRoot, '.ios-builder', 'checkpoints');
  await fs.mkdir(checkpointDir, { recursive: true });
  
  const checkpoint = {
    name: data.name,
    description: data.description,
    plan: data.plan,
    tasks: data.tasks,
    createdAt: new Date(),
  };
  
  const filename = `${data.name.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`;
  const checkpointPath = path.join(checkpointDir, filename);
  
  await fs.writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2), 'utf-8');
  
  return createTextResult(`Checkpoint saved: ${data.name}`);
}

function parseMarkdownChecklist(markdown: string): Task[] {
  const lines = markdown.split('\n');
  const tasks: Task[] = [];
  
  for (const line of lines) {
    const match = line.match(/^- \[([ x])\] (.+)$/);
    if (match) {
      const [, checked, description] = match;
      tasks.push({
        id: Date.now().toString() + Math.random(),
        name: description,
        status: checked === 'x' ? 'completed' : 'pending',
        priority: 'medium',
      });
    }
  }
  
  return tasks;
}
