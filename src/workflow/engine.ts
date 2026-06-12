import * as fs from 'fs/promises';
import * as path from 'path';
import {
  WorkflowStep,
  WorkflowStepState,
  WorkflowState,
  StepStatus,
  WORKFLOW_STEPS_ORDERED,
  WORKFLOW_STEP_DEFINITIONS,
  WorkflowStepDefinition,
} from './types.js';
import { config } from '../config.js';

const WORKFLOW_FILE = '.ios-builder/workflow.json';

export class WorkflowEngine {
  private state: WorkflowState | null = null;

  async initWorkflow(projectName: string, description?: string): Promise<WorkflowState> {
    const now = new Date().toISOString();
    const steps = {} as Record<WorkflowStep, WorkflowStepState>;

    for (const step of WORKFLOW_STEPS_ORDERED) {
      steps[step] = { status: StepStatus.LOCKED };
    }

    steps[WorkflowStep.PLAN] = { status: StepStatus.AVAILABLE };

    this.state = {
      projectId: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      projectName,
      description,
      currentStep: WorkflowStep.PLAN,
      steps,
      createdAt: now,
      updatedAt: now,
    };

    await this.saveState();
    return this.state;
  }

  async loadState(projectId?: string): Promise<WorkflowState | null> {
    const filePath = projectId
      ? path.join(config.projectRoot, '.ios-builder', projectId, WORKFLOW_FILE)
      : path.join(config.projectRoot, WORKFLOW_FILE);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.state = JSON.parse(content);
      return this.state;
    } catch {
      this.state = null;
      return null;
    }
  }

  async loadOrCreate(projectName: string, description?: string): Promise<WorkflowState> {
    const loaded = await this.loadState();
    if (loaded) {
      return loaded;
    }
    return this.initWorkflow(projectName, description);
  }

  private async saveState(): Promise<void> {
    if (!this.state) return;

    this.state.updatedAt = new Date().toISOString();
    const filePath = path.join(config.projectRoot, WORKFLOW_FILE);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  getState(): WorkflowState | null {
    return this.state;
  }

  getCurrentStep(): WorkflowStep | null {
    return this.state?.currentStep ?? null;
  }

  getCurrentStepDefinition(): WorkflowStepDefinition | null {
    if (!this.state) return null;
    return WORKFLOW_STEP_DEFINITIONS.find(d => d.step === this.state!.currentStep) ?? null;
  }

  getStepDefinition(step: WorkflowStep): WorkflowStepDefinition {
    return WORKFLOW_STEP_DEFINITIONS.find(d => d.step === step)!;
  }

  getAvailableTools(): string[] {
    const def = this.getCurrentStepDefinition();
    if (!def) return [];
    return def.tools;
  }

  async markStepActive(): Promise<void> {
    if (!this.state) return;
    const step = this.state.currentStep;
    if (this.state.steps[step].status === StepStatus.AVAILABLE) {
      this.state.steps[step].status = StepStatus.ACTIVE;
      await this.saveState();
    }
  }

  async submitForApproval(summary: string, artifacts?: string[]): Promise<void> {
    if (!this.state) return;
    const step = this.state.currentStep;
    this.state.steps[step].status = StepStatus.AWAITING_APPROVAL;
    this.state.steps[step].summary = summary;
    if (artifacts) {
      this.state.steps[step].artifacts = [...(this.state.steps[step].artifacts || []), ...artifacts];
    }
    await this.saveState();
  }

  async approveStep(): Promise<boolean> {
    if (!this.state) return false;
    const step = this.state.currentStep;
    if (this.state.steps[step].status !== StepStatus.AWAITING_APPROVAL) {
      return false;
    }
    this.state.steps[step].status = StepStatus.COMPLETED;
    this.state.steps[step].approvedAt = new Date().toISOString();
    this.state.steps[step].completedAt = new Date().toISOString();
    await this.saveState();
    return true;
  }

  async completeAndAdvance(): Promise<{ success: boolean; nextStep?: WorkflowStep; error?: string }> {
    if (!this.state) {
      return { success: false, error: 'No workflow active. Call workflow_init first.' };
    }

    const currentStep = this.state.currentStep;
    const now = new Date().toISOString();
    this.state.steps[currentStep].status = StepStatus.COMPLETED;
    this.state.steps[currentStep].approvedAt = now;
    this.state.steps[currentStep].completedAt = now;
    await this.saveState();

    return this.advanceStep();
  }

  async advanceStep(): Promise<{ success: boolean; nextStep?: WorkflowStep; error?: string }> {
    if (!this.state) {
      return { success: false, error: 'No active workflow. Call workflow_init first.' };
    }

    const currentStep = this.state.currentStep;
    const currentState = this.state.steps[currentStep];

    if (currentState.status !== StepStatus.COMPLETED && currentState.status !== StepStatus.SKIPPED) {
      const def = this.getStepDefinition(currentStep);
      if (def.requiresApproval) {
        return { success: false, error: `Step "${def.label}" requires approval. Use workflow_approve to complete and advance.` };
      }
      return { success: false, error: `Step "${def.label}" is not completed yet.` };
    }

    const currentIndex = WORKFLOW_STEPS_ORDERED.indexOf(currentStep);
    if (currentIndex < 0 || currentIndex >= WORKFLOW_STEPS_ORDERED.length - 1) {
      return { success: false, error: 'All steps completed.' };
    }

    const nextStep = WORKFLOW_STEPS_ORDERED[currentIndex + 1];
    this.state.currentStep = nextStep;
    this.state.steps[nextStep].status = StepStatus.AVAILABLE;
    await this.saveState();

    return { success: true, nextStep };
  }

  async skipStep(reason: string): Promise<boolean> {
    if (!this.state) return false;
    const step = this.state.currentStep;
    this.state.steps[step].status = StepStatus.SKIPPED;
    this.state.steps[step].skippedReason = reason;
    await this.saveState();
    return true;
  }

  async updateSummary(summary: string): Promise<void> {
    if (!this.state) return;
    const step = this.state.currentStep;
    this.state.steps[step].summary = summary;
    await this.saveState();
  }

  async addArtifact(artifact: string): Promise<void> {
    if (!this.state) return;
    const step = this.state.currentStep;
    if (!this.state.steps[step].artifacts) {
      this.state.steps[step].artifacts = [];
    }
    this.state.steps[step].artifacts!.push(artifact);
    await this.saveState();
  }

  getProgressDisplay(): string {
    if (!this.state) return 'No active workflow.';

    const lines: string[] = [
      `📊 ${this.state.projectName} — Progress`,
      '',
    ];

    for (const step of WORKFLOW_STEPS_ORDERED) {
      const st = this.state.steps[step];
      const def = this.getStepDefinition(step);
      const icon = def.icon;
      const isCurrent = step === this.state.currentStep;
      let statusDisplay: string;

      switch (st.status) {
        case StepStatus.LOCKED:
          statusDisplay = '🔒 Locked';
          break;
        case StepStatus.AVAILABLE:
          statusDisplay = isCurrent ? '📋 Available ◀──' : '📋 Available';
          break;
        case StepStatus.ACTIVE:
          statusDisplay = '🔄 In Progress';
          break;
        case StepStatus.AWAITING_APPROVAL:
          statusDisplay = '❓ Awaiting Approval';
          break;
        case StepStatus.COMPLETED:
          statusDisplay = '✅ Completed';
          break;
        case StepStatus.SKIPPED:
          statusDisplay = '⏭️ Skipped';
          break;
        default:
          statusDisplay = '⬜';
      }

      const bullet = isCurrent ? '▶' : ' ';
      lines.push(`${bullet} ${icon} ${def.label.padEnd(20)} ${statusDisplay}`);
    }

    const current = this.state.steps[this.state.currentStep];
    if (current.summary) {
      lines.push('', `📝 Current step summary: ${current.summary}`);
    }

    return lines.join('\n');
  }
}

export const workflowEngine = new WorkflowEngine();
