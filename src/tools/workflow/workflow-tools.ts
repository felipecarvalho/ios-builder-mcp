import * as fs from 'fs/promises';
import * as path from 'path';
import { registerTool } from '../registry.js';
import { createTextResult, createErrorResult } from '../../types/tools.js';
import { workflowEngine } from '../../workflow/engine.js';
import { generateWorkflowPrompt } from '../../workflow/prompt-generator.js';
import { WORKFLOW_STEP_DEFINITIONS, WorkflowStep } from '../../workflow/types.js';
import { config } from '../../config.js';
import { generateProjectPBX, generateInfoPlist, generateAssetsContents, generateAppIconContents, generateAccentColorContents } from '../../templates/xcode-project.js';
import { getAppEntryTemplate, getContentViewTemplate } from '../../templates/index.js';

async function ensureXcodeProject(projectName: string, outputDir?: string): Promise<string> {
  const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '');
  const baseDir = path.join(config.projectRoot, outputDir || sanitizedName);
  const xcodeprojPath = path.join(baseDir, `${sanitizedName}.xcodeproj`, 'project.pbxproj');

  try {
    await fs.access(xcodeprojPath);
    return baseDir;
  } catch {
    // Create directory structure
    const xcodeprojDir = path.join(baseDir, `${sanitizedName}.xcodeproj`);
    const srcDir = path.join(baseDir, sanitizedName);
    const assetsDir = path.join(srcDir, 'Assets.xcassets');
    const appIconDir = path.join(assetsDir, 'AppIcon.appiconset');
    const accentColorDir = path.join(assetsDir, 'AccentColor.colorset');
    const subdirs = ['Views', 'Models', 'ViewModels', 'Components'];
    const bundleId = `com.${sanitizedName.toLowerCase()}`;

    await fs.mkdir(xcodeprojDir, { recursive: true });
    await fs.mkdir(srcDir, { recursive: true });
    await fs.mkdir(assetsDir, { recursive: true });
    await fs.mkdir(appIconDir, { recursive: true });
    await fs.mkdir(accentColorDir, { recursive: true });
    for (const dir of subdirs) {
      await fs.mkdir(path.join(srcDir, dir), { recursive: true });
    }

    await fs.writeFile(path.join(xcodeprojDir, 'project.pbxproj'), generateProjectPBX(sanitizedName, bundleId), 'utf-8');
    await fs.writeFile(path.join(srcDir, 'Info.plist'), generateInfoPlist(sanitizedName), 'utf-8');
    await fs.writeFile(path.join(assetsDir, 'Contents.json'), generateAssetsContents(), 'utf-8');
    await fs.writeFile(path.join(appIconDir, 'Contents.json'), generateAppIconContents(), 'utf-8');
    await fs.writeFile(path.join(accentColorDir, 'Contents.json'), generateAccentColorContents(), 'utf-8');
    await fs.writeFile(path.join(srcDir, 'App.swift'), getAppEntryTemplate(sanitizedName), 'utf-8');
    await fs.writeFile(path.join(srcDir, 'ContentView.swift'), getContentViewTemplate(sanitizedName), 'utf-8');

    return baseDir;
  }
}

export function registerWorkflowTools(): void {
  registerTool(
    {
      name: 'workflow_init',
      description: 'Initialize a new workflow for building an iOS app from scratch. Use this to start the 8-step journey (Plan → Design → Architecture → Build → Verify → Preview → Publish → Grow).',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the iOS app project',
          },
          description: {
            type: 'string',
            description: 'Brief description of the app idea',
          },
        },
        required: ['projectName'],
      },
    },
    async (args: unknown) => {
      const { projectName, description } = args as { projectName: string; description?: string };

      if (!projectName || typeof projectName !== 'string') {
        return createErrorResult('projectName is required and must be a string');
      }

      const state = await workflowEngine.initWorkflow(projectName, description);
      const prompt = generateWorkflowPrompt(state);

      return createTextResult(JSON.stringify({
        message: `Workflow initialized for "${projectName}"`,
        workflowState: {
          projectId: state.projectId,
          currentStep: state.currentStep,
          stepLabel: 'Plan & Research (1/8)',
          totalSteps: 8,
        },
        prompt,
      }, null, 2));
    },
  );

  registerTool(
    {
      name: 'workflow_status',
      description: 'Get the current workflow status, progress bar, and current step details',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    async () => {
      const state = workflowEngine.getState();
      if (!state) {
        return createErrorResult('No active workflow. Call workflow_init first.');
      }

      const prompt = generateWorkflowPrompt(state);
      const display = workflowEngine.getProgressDisplay();

      return createTextResult(JSON.stringify({
        workflowState: {
          projectId: state.projectId,
          projectName: state.projectName,
          currentStep: state.currentStep,
          stepLabel: `${WORKFLOW_STEP_DEFINITIONS.find(d => d.step === state.currentStep)?.icon} ${WORKFLOW_STEP_DEFINITIONS.find(d => d.step === state.currentStep)?.label}`,
          totalSteps: 8,
        },
        progress: display,
        prompt,
      }, null, 2));
    },
  );

  registerTool(
    {
      name: 'workflow_approve',
      description: 'Mark the current step as completed and advance to the next step. Xcode project is auto-created when advancing to BUILD. Use the question tool (built-in) to ask the user for confirmation before calling this.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    async () => {
      const state = workflowEngine.getState();
      if (!state) {
        return createErrorResult('No active workflow. Call workflow_init first.');
      }

      const stepDef = WORKFLOW_STEP_DEFINITIONS.find(d => d.step === state.currentStep);
      const result = await workflowEngine.completeAndAdvance();

      if (!result.success) {
        return createErrorResult(result.error || 'Failed to advance step');
      }

      let xcodeMsg = '';
      if (result.nextStep === WorkflowStep.BUILD) {
        const projectPath = await ensureXcodeProject(state.projectName);
        xcodeMsg = `\\n\\n✅ Xcode project created at: ${projectPath}`;
      }

      const newState = workflowEngine.getState()!;
      const nextStepDef = WORKFLOW_STEP_DEFINITIONS.find(d => d.step === result.nextStep);
      const prompt = generateWorkflowPrompt(newState);

      return createTextResult(JSON.stringify({
        message: `Step "${stepDef?.label}" approved. Advanced to ${nextStepDef?.icon} ${nextStepDef?.label}.${xcodeMsg}`,
        workflowState: {
          currentStep: result.nextStep,
          stepLabel: `${nextStepDef?.icon} ${nextStepDef?.label}`,
          stepDescription: nextStepDef?.description,
          totalSteps: 8,
        },
        prompt,
      }, null, 2));
    },
  );

  registerTool(
    {
      name: 'workflow_next',
      description: 'Advance to the next step. Xcode project is auto-created when advancing to BUILD. Use this only for steps that do NOT require approval.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    async () => {
      const state = workflowEngine.getState();
      if (!state) {
        return createErrorResult('No active workflow. Call workflow_init first.');
      }

      const result = await workflowEngine.advanceStep();
      if (!result.success) {
        return createErrorResult(result.error || 'Failed to advance');
      }

      let xcodeMsg = '';
      if (result.nextStep === WorkflowStep.BUILD) {
        const projectPath = await ensureXcodeProject(state.projectName);
        xcodeMsg = `\\n\\n✅ Xcode project created at: ${projectPath}`;
      }

      const newState = workflowEngine.getState()!;
      const nextStepDef = WORKFLOW_STEP_DEFINITIONS.find(d => d.step === result.nextStep);
      const prompt = generateWorkflowPrompt(newState);

      return createTextResult(JSON.stringify({
        message: `Advanced to ${nextStepDef?.icon} ${nextStepDef?.label} (${nextStepDef?.order}/8).${xcodeMsg}`,
        workflowState: {
          currentStep: result.nextStep,
          stepLabel: `${nextStepDef?.icon} ${nextStepDef?.label}`,
          stepDescription: nextStepDef?.description,
          totalSteps: 8,
        },
        prompt,
      }, null, 2));
    },
  );
}
