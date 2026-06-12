import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { setupToolServer } from './registry.js';
import { registerFileTools } from './core/file-tools.js';
import { registerBuildTools } from './core/build-tools.js';
import { registerProjectTools } from './core/project-tools.js';
import { registerDesignSystemTools } from './design/design-system-tools.js';
import { registerIdentityTools } from './design/identity-tools.js';
import { registerWebTools } from './research/web-tools.js';
import { registerAppResearchTool } from './research/app-research.js';
import { registerInspectTools } from './research/inspect-tools.js';
import { registerSimulatorTools } from './simulator/simulator-tools.js';
import { registerOpenAITools } from './integrations/openai-tools.js';
import { registerSupabaseTools } from './integrations/supabase-tools.js';
import { registerSuperwallTools } from './integrations/superwall-tools.js';
import { registerBackendTools } from './integrations/backend-tools.js';
import { registerPublishingTools } from './publishing/publishing-tools.js';
import { registerGrowthTools } from './growth/growth-tools.js';
import { registerWorkflowTools } from './workflow/workflow-tools.js';
import { registerXcodeProjectTools } from './core/xcode-project-tools.js';

export function registerAllTools(server: Server): void {
  registerFileTools();
  registerBuildTools();
  registerProjectTools();
  registerXcodeProjectTools();
  registerDesignSystemTools();
  registerIdentityTools();
  registerWebTools();
  registerAppResearchTool();
  registerInspectTools();
  registerSimulatorTools();
  registerOpenAITools();
  registerSupabaseTools();
  registerSuperwallTools();
  registerBackendTools();
  registerPublishingTools();
  registerGrowthTools();
  registerWorkflowTools();

  setupToolServer(server);
}
