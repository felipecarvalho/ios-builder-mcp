import { z } from 'zod';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';

const supabaseReadSchema = z.object({
  schema: z.string().default('public').describe('Database schema'),
  table: z.string().describe('Table name'),
  select: z.string().default('*').describe('Columns to select'),
  filter: z.record(z.unknown()).optional().describe('Filter conditions (column: value)'),
  limit: z.number().default(100).describe('Max rows to return'),
  order: z.string().optional().describe('Order by column'),
  ascending: z.boolean().default(true).describe('Sort ascending'),
});

const supabaseWriteSchema = z.object({
  schema: z.string().default('public').describe('Database schema'),
  table: z.string().describe('Table name'),
  data: z.record(z.unknown()).describe('Data to insert/update'),
  upsert: z.boolean().default(false).describe('Upsert (insert or update)'),
  onConflict: z.string().optional().describe('On conflict column for upsert'),
});

const supabaseSqlSchema = z.object({
  sql: z.string().describe('SQL to execute (DDL, migrations, RLS, indexes)'),
});

const supabaseSettingsSchema = z.object({
  action: z.enum(['describe', 'update']).describe('Describe or update auth settings'),
  settings: z.record(z.unknown()).optional().describe('Settings to update'),
});

export function registerSupabaseTools(): void {
  registerTool(
    {
      name: 'supabase_read_tables',
      description: 'Read data from Supabase tables with filtering and sorting.',
      inputSchema: {
        type: 'object',
        properties: {
          schema: { type: 'string', description: 'Database schema (default: public)' },
          table: { type: 'string', description: 'Table name' },
          select: { type: 'string', description: 'Columns to select (default: *)' },
          filter: { type: 'object', description: 'Filter conditions' },
          limit: { type: 'number', description: 'Max rows (default: 100)' },
          order: { type: 'string', description: 'Order by column' },
          ascending: { type: 'boolean', description: 'Sort ascending' },
        },
        required: ['table'],
      },
    },
    handleSupabaseRead,
  );

  registerTool(
    {
      name: 'supabase_write_tables',
      description: 'Insert or upsert data into Supabase tables.',
      inputSchema: {
        type: 'object',
        properties: {
          schema: { type: 'string', description: 'Database schema' },
          table: { type: 'string', description: 'Table name' },
          data: { type: 'object', description: 'Data to insert/update' },
          upsert: { type: 'boolean', description: 'Upsert mode' },
          onConflict: { type: 'string', description: 'Conflict column for upsert' },
        },
        required: ['table', 'data'],
      },
    },
    handleSupabaseWrite,
  );

  registerTool(
    {
      name: 'supabase_execute_sql',
      description: 'Execute SQL on Supabase (DDL, migrations, RLS policies, indexes, storage buckets).',
      inputSchema: {
        type: 'object',
        properties: {
          sql: { type: 'string', description: 'SQL to execute' },
        },
        required: ['sql'],
      },
    },
    handleSupabaseSql,
  );

  registerTool(
    {
      name: 'supabase_manage_settings',
      description: 'Describe or update Supabase auth settings (signups, providers, sessions, rate limits).',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['describe', 'update'], description: 'Describe or update' },
          settings: { type: 'object', description: 'Settings to update' },
        },
        required: ['action'],
      },
    },
    handleSupabaseSettings,
  );
}

function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || 'http://localhost:54321';
}

function getSupabaseKey(): string {
  return process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
}

async function handleSupabaseRead(args: unknown): Promise<ToolResult> {
  const { schema, table, select, filter, limit, order, ascending } = supabaseReadSchema.parse(args);
  
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  
  if (!key) {
    return createTextResult(`[Placeholder] supabase_read_tables(\n  schema: "${schema}",\n  table: "${table}",\n  select: "${select}",\n  filter: ${JSON.stringify(filter)},\n  limit: ${limit}\n)\n\nSet SUPABASE_URL and SUPABASE_SERVICE_KEY env vars for live queries.`);
  }
  
  try {
    let queryUrl = `${url}/rest/v1/${table}?select=${encodeURIComponent(select)}`;
    
    if (filter) {
      for (const [col, val] of Object.entries(filter)) {
        queryUrl += `&${col}=eq.${encodeURIComponent(String(val))}`;
      }
    }
    
    if (order) {
      queryUrl += `&order=${encodeURIComponent(order)}.${ascending ? 'asc' : 'desc'}`;
    }
    
    queryUrl += `&limit=${limit}`;
    
    const response = await fetch(queryUrl, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return createErrorResult(`Supabase error (${response.status}): ${await response.text()}`);
    }
    
    const data = await response.json();
    return createTextResult(JSON.stringify(data, null, 2));
  } catch (error) {
    return createErrorResult(`Supabase query failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleSupabaseWrite(args: unknown): Promise<ToolResult> {
  const { schema, table, data, upsert, onConflict } = supabaseWriteSchema.parse(args);
  
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  
  if (!key) {
    return createTextResult(`[Placeholder] supabase_write_tables(\n  schema: "${schema}",\n  table: "${table}",\n  data: ${JSON.stringify(data)},\n  upsert: ${upsert}\n)\n\nSet SUPABASE_URL and SUPABASE_SERVICE_KEY env vars for live writes.`);
  }
  
  try {
    let queryUrl = `${url}/rest/v1/${table}`;
    const method = upsert ? 'POST' : 'POST';
    const headers: Record<string, string> = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': upsert ? 'return=representation,resolution=merge-duplicates' : 'return=representation',
    };
    
    if (upsert && onConflict) {
      headers['Prefer'] += `,on_conflict=${onConflict}`;
    }
    
    const response = await fetch(queryUrl, {
      method,
      headers,
      body: JSON.stringify(Array.isArray(data) ? data : [data]),
    });
    
    if (!response.ok) {
      return createErrorResult(`Supabase write error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    return createTextResult(JSON.stringify(result, null, 2));
  } catch (error) {
    return createErrorResult(`Supabase write failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleSupabaseSql(args: unknown): Promise<ToolResult> {
  const { sql } = supabaseSqlSchema.parse(args);
  
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  
  if (!key) {
    return createTextResult(`[Placeholder] supabase_execute_sql(\n  sql: "${sql.replace(/"/g, '\\"')}"\n)\n\nSet SUPABASE_URL and SUPABASE_SERVICE_KEY env vars for live SQL execution.`);
  }
  
  try {
    const response = await fetch(`${url}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (!response.ok) {
      return createErrorResult(`SQL execution error (${response.status}): ${await response.text()}`);
    }
    
    const result = await response.json();
    return createTextResult(JSON.stringify(result, null, 2));
  } catch (error) {
    return createErrorResult(`SQL execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleSupabaseSettings(args: unknown): Promise<ToolResult> {
  const { action, settings } = supabaseSettingsSchema.parse(args);
  
  if (action === 'describe') {
    return createTextResult(`## Supabase Auth Settings

These settings can be managed via Supabase Dashboard > Authentication > Settings.

### Key Settings
- **Sign ups**: Enabled/Disabled
- **Email confirmations**: On/Off
- **Security**: Password policy, rate limits
- **Sessions**: Access token expiry, refresh token expiry
- **Providers**: Apple, Google, Email, Phone, etc.

To update these, use supabase_manage_settings with action: "update" and the desired settings.

*Note: Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars for live settings management.*`);
  }
  
  if (action === 'update' && settings) {
    const url = getSupabaseUrl();
    const key = getSupabaseKey();
    
    if (!key) {
      return createTextResult(`[Placeholder] Would update settings:\n${JSON.stringify(settings, null, 2)}\n\nSet SUPABASE_URL and SUPABASE_SERVICE_KEY env vars for live updates.`);
    }
    
    try {
      const response = await fetch(`${url}/rest/v1/rpc/update_auth_settings`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        return createErrorResult(`Settings update error (${response.status}): ${await response.text()}`);
      }
      
      return createTextResult('Auth settings updated successfully');
    } catch (error) {
      return createErrorResult(`Settings update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return createTextResult('No changes made');
}
