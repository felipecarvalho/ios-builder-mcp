import { z } from 'zod';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';

const backendManageSchema = z.object({
  action: z.enum(['status', 'list_functions', 'upsert_function', 'deploy', 'set_secret', 'list_logs']).describe('Backend management action'),
  functionName: z.string().optional().describe('Function name'),
  code: z.string().optional().describe('Function source code (TypeScript)'),
  secretName: z.string().optional().describe('Secret name'),
  secretValue: z.string().optional().describe('Secret value'),
  logLines: z.number().default(50).describe('Number of log lines'),
});

const backendInvokeSchema = z.object({
  functionName: z.string().describe('Function name to invoke'),
  body: z.record(z.unknown()).optional().describe('JSON body'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('POST').describe('HTTP method'),
});

export function registerBackendTools(): void {
  registerTool(
    {
      name: 'backend_manage',
      description: 'Manage Supabase Edge Functions — status, list, upsert, deploy, secrets, and logs.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['status', 'list_functions', 'upsert_function', 'deploy', 'set_secret', 'list_logs'], description: 'Action' },
          functionName: { type: 'string', description: 'Function name' },
          code: { type: 'string', description: 'TypeScript source code' },
          secretName: { type: 'string', description: 'Secret name' },
          secretValue: { type: 'string', description: 'Secret value' },
          logLines: { type: 'number', description: 'Number of log lines' },
        },
        required: ['action'],
      },
    },
    handleBackendManage,
  );

  registerTool(
    {
      name: 'backend_invoke',
      description: 'Invoke a Supabase Edge Function and get the response.',
      inputSchema: {
        type: 'object',
        properties: {
          functionName: { type: 'string', description: 'Function name' },
          body: { type: 'object', description: 'JSON request body' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], description: 'HTTP method' },
        },
        required: ['functionName'],
      },
    },
    handleBackendInvoke,
  );
}

function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || 'http://localhost:54321';
}

function getAnonKey(): string {
  return process.env.SUPABASE_ANON_KEY || '';
}

async function handleBackendManage(args: unknown): Promise<ToolResult> {
  const { action, functionName, code, secretName, secretValue, logLines } = backendManageSchema.parse(args);
  
  const url = getSupabaseUrl();
  const key = getAnonKey();
  
  if (!key) {
    return createTextResult(`## Backend Manage (Placeholder)
Action: ${action}
${functionName ? `Function: ${functionName}` : ''}

Set SUPABASE_URL and SUPABASE_ANON_KEY env vars for live backend management.

### Available actions:
- **status** — Check backend status
- **list_functions** — List all Edge Functions
- **upsert_function** — Create or update a function
- **deploy** — Deploy a function
- **set_secret** — Set a backend secret
- **list_logs** — View function logs`);
  }
  
  try {
    switch (action) {
      case 'status': {
        const response = await fetch(`${url}/functions/v1/_status`, {
          headers: { 'Authorization': `Bearer ${key}` },
        });
        const data = await response.text();
        return createTextResult(`Backend Status:\n${data}`);
      }
      
      case 'list_functions': {
        const response = await fetch(`${url}/functions/v1`, {
          headers: { 'Authorization': `Bearer ${key}` },
        });
        const data = await response.json();
        const list = (data as any[]).map((f: any) => `- ${f.name} (${f.status}, ${f.version || 'v1'})`).join('\n');
        return createTextResult(`## Edge Functions\n${list || 'No functions deployed'}`);
      }
      
      case 'upsert_function': {
        if (!functionName || !code) {
          return createErrorResult('functionName and code are required for upsert_function');
        }
        
        const response = await fetch(`${url}/functions/v1/${functionName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: functionName,
            body: code,
            verify_jwt: true,
          }),
        });
        
        if (!response.ok) {
          return createErrorResult(`Upsert failed (${response.status}): ${await response.text()}`);
        }
        
        return createTextResult(`Function "${functionName}" upserted successfully`);
      }
      
      case 'deploy': {
        if (!functionName) {
          return createErrorResult('functionName is required for deploy');
        }
        
        const response = await fetch(`${url}/functions/v1/${functionName}/deploy`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}` },
        });
        
        if (!response.ok) {
          return createErrorResult(`Deploy failed (${response.status}): ${await response.text()}`);
        }
        
        return createTextResult(`Function "${functionName}" deployed successfully`);
      }
      
      case 'set_secret': {
        if (!secretName || !secretValue) {
          return createErrorResult('secretName and secretValue are required for set_secret');
        }
        
        const response = await fetch(`${url}/functions/v1/secrets`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: secretName,
            value: secretValue,
          }),
        });
        
        if (!response.ok) {
          return createErrorResult(`Set secret failed (${response.status}): ${await response.text()}`);
        }
        
        return createTextResult(`Secret "${secretName}" set successfully`);
      }
      
      case 'list_logs': {
        const response = await fetch(`${url}/functions/v1/${functionName}/logs?limit=${logLines}`, {
          headers: { 'Authorization': `Bearer ${key}` },
        });
        
        if (!response.ok) {
          return createErrorResult(`List logs failed (${response.status}): ${await response.text()}`);
        }
        
        const data = await response.json();
        const logs = Array.isArray(data) 
          ? data.map((l: any) => `[${l.timestamp}] ${l.message}`).join('\n')
          : JSON.stringify(data, null, 2);
        
        return createTextResult(logs || 'No logs found');
      }
      
      default:
        return createErrorResult(`Unknown action: ${action}`);
    }
  } catch (error) {
    return createErrorResult(`Backend manage failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleBackendInvoke(args: unknown): Promise<ToolResult> {
  const { functionName, body, method } = backendInvokeSchema.parse(args);
  
  const url = getSupabaseUrl();
  const key = getAnonKey();
  
  if (!key) {
    return createTextResult(`## Backend Invoke (Placeholder)
Function: ${functionName}
Method: ${method}
Body: ${JSON.stringify(body, null, 2)}

Set SUPABASE_URL and SUPABASE_ANON_KEY env vars for live function invocation.`);
  }
  
  try {
    const response = await fetch(`${url}/functions/v1/${functionName}`, {
      method,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? JSON.stringify(await response.json(), null, 2)
      : await response.text();
    
    if (!response.ok) {
      return createErrorResult(`Invoke error (${response.status}): ${data}`);
    }
    
    return createTextResult(`## Invoke Result\n${data}`);
  } catch (error) {
    return createErrorResult(`Backend invoke failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
