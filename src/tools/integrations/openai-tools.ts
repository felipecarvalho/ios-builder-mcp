import { z } from 'zod';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';

const openaiChatSchema = z.object({
  model: z.enum(['gpt-5.4', 'gpt-5.4-mini', 'gpt-4o', 'gpt-4o-mini']).default('gpt-5.4-mini').describe('OpenAI model to use'),
  messages: z.array(z.object({
    role: z.enum(['developer', 'user', 'assistant']),
    content: z.string(),
  })).describe('Chat messages'),
  maxTokens: z.number().default(2048).describe('Maximum completion tokens'),
  temperature: z.number().default(0.7).describe('Sampling temperature'),
  apiKey: z.string().optional().describe('OpenAI API key (defaults to OPENAI_API_KEY env)'),
});

const openaiGenerateSchema = z.object({
  prompt: z.string().describe('What Swift code to generate'),
  context: z.string().optional().describe('Additional context (existing code, types, etc.)'),
  model: z.enum(['gpt-5.4', 'gpt-5.4-mini', 'gpt-4o', 'gpt-4o-mini']).default('gpt-5.4').describe('Model for code generation'),
  apiKey: z.string().optional().describe('OpenAI API key'),
});

export function registerOpenAITools(): void {
  registerTool(
    {
      name: 'openai_chat',
      description: 'Send a chat completion request to OpenAI.',
      inputSchema: {
        type: 'object',
        properties: {
          model: { type: 'string', enum: ['gpt-5.4', 'gpt-5.4-mini', 'gpt-4o', 'gpt-4o-mini'], description: 'OpenAI model' },
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['developer', 'user', 'assistant'] },
                content: { type: 'string' },
              },
              required: ['role', 'content'],
            },
            description: 'Chat messages',
          },
          maxTokens: { type: 'number', description: 'Maximum completion tokens' },
          temperature: { type: 'number', description: 'Sampling temperature' },
          apiKey: { type: 'string', description: 'API key override' },
        },
        required: ['messages'],
      },
    },
    handleOpenAIChat,
  );

  registerTool(
    {
      name: 'openai_generate_code',
      description: 'Generate Swift code using OpenAI with iOS-specific context.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'What Swift code to generate' },
          context: { type: 'string', description: 'Additional context' },
          model: { type: 'string', enum: ['gpt-5.4', 'gpt-5.4-mini', 'gpt-4o', 'gpt-4o-mini'], description: 'Model' },
          apiKey: { type: 'string', description: 'API key override' },
        },
        required: ['prompt'],
      },
    },
    handleOpenAIGenerate,
  );
}

async function getApiKey(override?: string): Promise<string> {
  if (override) return override;
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) return envKey;
  throw new Error('OPENAI_API_KEY not set. Set the environment variable or pass apiKey.');
}

async function handleOpenAIChat(args: unknown): Promise<ToolResult> {
  const { model, messages, maxTokens, temperature, apiKey } = openaiChatSchema.parse(args);
  
  try {
    const key = await getApiKey(apiKey);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_completion_tokens: maxTokens,
        temperature,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return createErrorResult(`OpenAI API error (${response.status}): ${error}`);
    }
    
    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage ? `\n\n---\nPrompt: ${data.usage.prompt_tokens} tokens | Completion: ${data.usage.completion_tokens} tokens | Total: ${data.usage.total_tokens} tokens` : '';
    
    return createTextResult(content + usage);
  } catch (error) {
    return createErrorResult(`OpenAI chat failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleOpenAIGenerate(args: unknown): Promise<ToolResult> {
  const { prompt, context, model, apiKey } = openaiGenerateSchema.parse(args);
  
  const systemPrompt = `You are an expert iOS SwiftUI developer. Generate production-ready Swift code following these rules:
- Target iOS 16+ (Swift 5.9, SwiftUI, Observation framework)
- Use modern SwiftUI patterns (Observable macro, MVVM)
- Follow Apple's Human Interface Guidelines
- Use SF Symbols for icons
- Support Dynamic Type and accessibility
- Use proper error handling (no force unwraps)
- Generate complete, compilable files
- Include necessary imports
- Use iOS 16+ APIs only (no deprecated APIs)

${context ? `\n## Context\n${context}\n` : ''}

Output ONLY the Swift code, no explanations. Use \`\`\`swift code blocks.`;
  
  try {
    const key = await getApiKey(apiKey);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'developer', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_completion_tokens: 4096,
        temperature: 0.3,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return createErrorResult(`OpenAI API error (${response.status}): ${error}`);
    }
    
    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage ? `\n\n---\nTokens: ${data.usage.total_tokens}` : '';
    
    return createTextResult(content + usage);
  } catch (error) {
    return createErrorResult(`OpenAI generate failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
