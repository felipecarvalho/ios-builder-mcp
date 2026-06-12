import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getBuilderPrompt } from './modes/builder.js';
import { getResearchPrompt } from './modes/research.js';
import { getGrowthPrompt } from './modes/growth.js';
import { getSystemPrompt } from './unified.js';

export function registerAllPrompts(server: Server): void {
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'builder',
          description: 'SwiftUI expert prompt for Code mode (iOS 26)',
        },
        {
          name: 'research',
          description: 'Product strategist prompt for Research mode',
        },
        {
          name: 'growth',
          description: 'Launch strategist prompt for Growth mode',
        },
        {
          name: 'unified',
          description: 'Unified prompt that adapts to workflow state (auto-detects Workflow or Freeform mode)',
        },
      ],
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;

    switch (name) {
      case 'builder':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: getBuilderPrompt(),
              },
            },
          ],
        };
      case 'research':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: getResearchPrompt(),
              },
            },
          ],
        };
      case 'growth':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: getGrowthPrompt(),
              },
            },
          ],
        };
      case 'unified':
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: getSystemPrompt(),
              },
            },
          ],
        };
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });
}
