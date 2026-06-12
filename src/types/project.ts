import { DesignSystem } from './design.js';

export interface Project {
  id: string;
  name: string;
  description?: string;
  mode: 'research' | 'build' | 'growth';
  plan?: ProjectPlan;
  tasks?: Task[];
  designSystem?: DesignSystem;
  dependencies?: Dependency[];
  warnings?: Warning[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectPlan {
  concept?: string;
  targetAudience?: string;
  features?: string[];
  screens?: string[];
  designDirection?: string;
  onboardingChoice?: string;
  preBuildConfirmation?: string;
  markdown?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  affectedAreas?: string[];
  checklist?: ChecklistItem[];
  acceptanceCriteria?: string[];
}

export interface ChecklistItem {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Dependency {
  id: string;
  title: string;
  description: string;
  setupInstructions?: string;
  integrationId?: string;
  backendProviderId?: string;
  backendCapabilities?: string[];
  environmentVariables?: string[];
  location: 'client' | 'backend' | 'both';
  allowsMockDataUntilConfigured?: boolean;
}

export interface Warning {
  title: string;
  severity: 'info' | 'warning' | 'error';
  requestedCapability?: string;
  limitation: string;
  fallback?: string;
}
