export enum WorkflowStep {
  PLAN = 'plan',
  DESIGN = 'design',
  ARCHITECTURE = 'architecture',
  BUILD = 'build',
  VERIFY = 'verify',
  PREVIEW = 'preview',
  PUBLISH = 'publish',
  GROW = 'grow',
}

export enum StepStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  ACTIVE = 'active',
  AWAITING_APPROVAL = 'awaiting_approval',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export interface WorkflowStepState {
  status: StepStatus;
  summary?: string;
  artifacts?: string[];
  approvedAt?: string;
  completedAt?: string;
  skippedReason?: string;
}

export interface WorkflowState {
  projectId: string;
  projectName: string;
  description?: string;
  currentStep: WorkflowStep;
  steps: Record<WorkflowStep, WorkflowStepState>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepDefinition {
  step: WorkflowStep;
  order: number;
  label: string;
  description: string;
  tools: string[];
  requiresApproval: boolean;
  icon: string;
}

export const WORKFLOW_STEP_DEFINITIONS: WorkflowStepDefinition[] = [
  {
    step: WorkflowStep.PLAN,
    order: 1,
    label: 'Plan & Research',
    description: 'Research the market, define the app concept, identify target audience, analyze competitors',
    tools: ['web_search', 'scrape_url', 'app_research', 'inspect_website'],
    requiresApproval: true,
    icon: '🔍',
  },
  {
    step: WorkflowStep.DESIGN,
    order: 2,
    label: 'Design System',
    description: 'Select design style, color palette, typography, and signature visual moves',
    tools: ['update_design_system_options', 'set_design_style', 'set_project_identity', 'inspect_website'],
    requiresApproval: true,
    icon: '🎨',
  },
  {
    step: WorkflowStep.ARCHITECTURE,
    order: 3,
    label: 'Architecture',
    description: 'Define screens, data models, navigation flow, services, and dependencies',
    tools: ['update_project_status', 'update_task_plan', 'read_plan', 'read_files', 'list_files', 'search_files'],
    requiresApproval: true,
    icon: '🏗️',
  },
  {
    step: WorkflowStep.BUILD,
    order: 4,
    label: 'Code Generation',
    description: 'Generate all SwiftUI code — App.swift, Views, Models, ViewModels, Components',
    tools: ['write_file', 'edit_file', 'read_files', 'search_files', 'list_files', 'delete_file', 'rename_file', 'openai_generate_code', 'openai_chat', 'run_command', 'verify_compile'],
    requiresApproval: false,
    icon: '💻',
  },
  {
    step: WorkflowStep.VERIFY,
    order: 5,
    label: 'Verify',
    description: 'Verify compilation, run type checks, fix any build errors',
    tools: ['verify_compile', 'build_project', 'run_command', 'read_files', 'edit_file', 'search_files'],
    requiresApproval: true,
    icon: '✅',
  },
  {
    step: WorkflowStep.PREVIEW,
    order: 6,
    label: 'Live Preview',
    description: 'Boot simulator, install app, launch, capture screenshots, verify functionality',
    tools: ['simulator_list_devices', 'simulator_boot', 'simulator_open', 'simulator_status', 'simulator_install', 'simulator_launch', 'simulator_terminate', 'simulator_screenshot', 'simulator_logs', 'simulator_tap', 'simulator_type', 'simulator_drag', 'simulator_button', 'simulator_rotate'],
    requiresApproval: true,
    icon: '📱',
  },
  {
    step: WorkflowStep.PUBLISH,
    order: 7,
    label: 'Publishing',
    description: 'Generate app icons, screenshots, metadata, preflight, and submit to App Store',
    tools: ['generate_app_icon', 'generate_screenshot', 'generate_app_metadata', 'update_app_store_assets', 'app_store_preflight', 'asc_validate', 'asc_submit', 'asc_status', 'app_store_publishing_status', 'app_store_publishing_update_stage'],
    requiresApproval: false,
    icon: '📦',
  },
  {
    step: WorkflowStep.GROW,
    order: 8,
    label: 'Growth',
    description: 'Generate social launch kit, ASO keywords, content calendar, release notes, influencer outreach',
    tools: ['social_launch_kit', 'aso_research', 'content_calendar', 'generate_release_notes', 'influencer_outreach', 'app_research'],
    requiresApproval: false,
    icon: '📈',
  },
];

export const WORKFLOW_STEPS_ORDERED: WorkflowStep[] = [
  WorkflowStep.PLAN,
  WorkflowStep.DESIGN,
  WorkflowStep.ARCHITECTURE,
  WorkflowStep.BUILD,
  WorkflowStep.VERIFY,
  WorkflowStep.PREVIEW,
  WorkflowStep.PUBLISH,
  WorkflowStep.GROW,
];

export const STEP_LABELS: Record<WorkflowStep, string> = {
  [WorkflowStep.PLAN]: 'Plan & Research',
  [WorkflowStep.DESIGN]: 'Design System',
  [WorkflowStep.ARCHITECTURE]: 'Architecture',
  [WorkflowStep.BUILD]: 'Code Generation',
  [WorkflowStep.VERIFY]: 'Verify',
  [WorkflowStep.PREVIEW]: 'Live Preview',
  [WorkflowStep.PUBLISH]: 'Publishing',
  [WorkflowStep.GROW]: 'Growth',
};

export const STEP_ICONS: Record<WorkflowStep, string> = {
  [WorkflowStep.PLAN]: '🔍',
  [WorkflowStep.DESIGN]: '🎨',
  [WorkflowStep.ARCHITECTURE]: '🏗️',
  [WorkflowStep.BUILD]: '💻',
  [WorkflowStep.VERIFY]: '✅',
  [WorkflowStep.PREVIEW]: '📱',
  [WorkflowStep.PUBLISH]: '📦',
  [WorkflowStep.GROW]: '📈',
};
