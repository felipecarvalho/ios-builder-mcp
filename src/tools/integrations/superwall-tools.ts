import { z } from 'zod';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';

const superwallAccountSchema = z.object({
  action: z.enum(['status', 'projects', 'app_info']).default('status').describe('Account action'),
});

const superwallPaywallSchema = z.object({
  action: z.enum(['list', 'inspect', 'create_draft', 'edit_draft', 'save_version', 'publish']).describe('Paywall action'),
  paywallId: z.string().optional().describe('Paywall ID'),
  name: z.string().optional().describe('Paywall name (for create)'),
  html: z.string().optional().describe('Hosted HTML content (for create/edit)'),
  campaignId: z.string().optional().describe('Campaign ID'),
});

const superwallMonetizationSchema = z.object({
  action: z.enum(['list_products', 'create_product', 'list_entitlements', 'create_entitlement', 'link']).describe('Monetization action'),
  productId: z.string().optional().describe('Product ID'),
  entitlementId: z.string().optional().describe('Entitlement ID'),
  name: z.string().optional().describe('Name for create'),
  type: z.enum(['consumable', 'non_consumable', 'auto_renewable']).optional().describe('Product type'),
  price: z.number().optional().describe('Price in USD'),
});

const superwallCampaignSchema = z.object({
  action: z.enum(['list', 'inspect', 'create', 'add_paywall']).describe('Campaign action'),
  campaignId: z.string().optional().describe('Campaign ID'),
  name: z.string().optional().describe('Campaign name'),
  paywallId: z.string().optional().describe('Paywall ID to add'),
});

export function registerSuperwallTools(): void {
  registerTool(
    {
      name: 'superwall_account',
      description: 'Get Superwall account status, projects, or app info.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['status', 'projects', 'app_info'], description: 'Account action' },
        },
      },
    },
    handleSuperwallAccount,
  );

  registerTool(
    {
      name: 'superwall_paywall',
      description: 'Manage Superwall hosted paywalls — list, inspect, create/edit HTML drafts, save versions, and publish.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['list', 'inspect', 'create_draft', 'edit_draft', 'save_version', 'publish'], description: 'Paywall action' },
          paywallId: { type: 'string', description: 'Paywall ID' },
          name: { type: 'string', description: 'Paywall name (for create)' },
          html: { type: 'string', description: 'Hosted HTML content (for create/edit)' },
          campaignId: { type: 'string', description: 'Campaign ID' },
        },
        required: ['action'],
      },
    },
    handleSuperwallPaywall,
  );

  registerTool(
    {
      name: 'superwall_monetization',
      description: 'Manage Superwall products and entitlements.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['list_products', 'create_product', 'list_entitlements', 'create_entitlement', 'link'], description: 'Monetization action' },
          productId: { type: 'string', description: 'Product ID' },
          entitlementId: { type: 'string', description: 'Entitlement ID' },
          name: { type: 'string', description: 'Name for create' },
          type: { type: 'string', enum: ['consumable', 'non_consumable', 'auto_renewable'], description: 'Product type' },
          price: { type: 'number', description: 'Price in USD' },
        },
      },
    },
    handleSuperwallMonetization,
  );

  registerTool(
    {
      name: 'superwall_campaign',
      description: 'Manage Superwall campaigns — list, inspect, create, and link paywalls.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['list', 'inspect', 'create', 'add_paywall'], description: 'Campaign action' },
          campaignId: { type: 'string', description: 'Campaign ID' },
          name: { type: 'string', description: 'Campaign name' },
          paywallId: { type: 'string', description: 'Paywall ID to add' },
        },
      },
    },
    handleSuperwallCampaign,
  );
}

function getSuperwallApiKey(): string {
  return process.env.SUPERWALL_API_KEY || '';
}

const SUPERWALL_API_BASE = 'https://api.superwall.com/v1';

async function handleSuperwallAccount(args: unknown): Promise<ToolResult> {
  const { action } = superwallAccountSchema.parse(args);
  const apiKey = getSuperwallApiKey();
  
  if (!apiKey) {
    return createTextResult(`## Superwall Account (Placeholder)
Action: ${action}

Set SUPERWALL_API_KEY env var for live API access.

### To connect Superwall:
1. Get your API key from Superwall Dashboard > Settings > API Keys
2. Set SUPERWALL_API_KEY as environment variable
3. Set SUPERWALL_PUBLIC_API_KEY in your iOS app`);
  }
  
  try {
    const response = await fetch(`${SUPERWALL_API_BASE}/${action === 'status' ? 'me' : action === 'projects' ? 'projects' : 'apps'}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    if (!response.ok) {
      return createErrorResult(`Superwall API error (${response.status}): ${await response.text()}`);
    }
    
    const data = await response.json();
    return createTextResult(JSON.stringify(data, null, 2));
  } catch (error) {
    return createErrorResult(`Superwall API failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleSuperwallPaywall(args: unknown): Promise<ToolResult> {
  const { action, paywallId, name, html, campaignId } = superwallPaywallSchema.parse(args);
  const apiKey = getSuperwallApiKey();
  
  if (!apiKey) {
    const placeholderHtml = html || '<html><body><h1>Placeholder Paywall</h1></body></html>';
    return createTextResult(`## Superwall Paywall (Placeholder)

Action: ${action}
${name ? `Name: ${name}` : ''}
${paywallId ? `Paywall ID: ${paywallId}` : ''}

Set SUPERWALL_API_KEY env var for live API access.

### Example hosted paywall HTML:
\`\`\`html
${placeholderHtml.substring(0, 500)}
\`\`\``);
  }
  
  try {
    let url = `${SUPERWALL_API_BASE}/paywalls`;
    let method = 'GET';
    let body: string | undefined;
    
    switch (action) {
      case 'list':
        break;
      case 'inspect':
        url = `${SUPERWALL_API_BASE}/paywalls/${paywallId}`;
        break;
      case 'create_draft':
        method = 'POST';
        body = JSON.stringify({ name, html, campaign_id: campaignId });
        break;
      case 'edit_draft':
        method = 'PATCH';
        url = `${SUPERWALL_API_BASE}/paywalls/${paywallId}`;
        body = JSON.stringify({ html });
        break;
      case 'save_version':
        method = 'POST';
        url = `${SUPERWALL_API_BASE}/paywalls/${paywallId}/versions`;
        body = JSON.stringify({ html });
        break;
      case 'publish':
        method = 'POST';
        url = `${SUPERWALL_API_BASE}/paywalls/${paywallId}/publish`;
        break;
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    });
    
    if (!response.ok) {
      return createErrorResult(`Superwall API error (${response.status}): ${await response.text()}`);
    }
    
    const data = await response.json();
    return createTextResult(JSON.stringify(data, null, 2));
  } catch (error) {
    return createErrorResult(`Superwall API failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleSuperwallMonetization(args: unknown): Promise<ToolResult> {
  const { action, productId, entitlementId, name, type, price } = superwallMonetizationSchema.parse(args);
  const apiKey = getSuperwallApiKey();
  
  if (!apiKey) {
    return createTextResult(`## Superwall Monetization (Placeholder)

Action: ${action}
${name ? `Name: ${name}` : ''}
${type ? `Type: ${type}` : ''}
${price ? `Price: $${price}` : ''}

Set SUPERWALL_API_KEY env var for live API access.`);
  }
  
  try {
    const isProducts = action.startsWith('product');
    const basePath = isProducts ? 'products' : 'entitlements';
    let url = `${SUPERWALL_API_BASE}/${basePath}`;
    let method = 'GET';
    let body: string | undefined;
    
    switch (action) {
      case 'list_products':
      case 'list_entitlements':
        break;
      case 'create_product':
        method = 'POST';
        body = JSON.stringify({ name, type, price });
        break;
      case 'create_entitlement':
        method = 'POST';
        body = JSON.stringify({ name });
        break;
      case 'link':
        url = `${SUPERWALL_API_BASE}/entitlements/${entitlementId}/products`;
        method = 'POST';
        body = JSON.stringify({ product_id: productId });
        break;
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    });
    
    if (!response.ok) {
      return createErrorResult(`Superwall API error (${response.status}): ${await response.text()}`);
    }
    
    const data = await response.json();
    return createTextResult(JSON.stringify(data, null, 2));
  } catch (error) {
    return createErrorResult(`Superwall API failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function handleSuperwallCampaign(args: unknown): Promise<ToolResult> {
  const { action, campaignId, name, paywallId } = superwallCampaignSchema.parse(args);
  const apiKey = getSuperwallApiKey();
  
  if (!apiKey) {
    return createTextResult(`## Superwall Campaign (Placeholder)

Action: ${action}
${name ? `Name: ${name}` : ''}
${campaignId ? `Campaign ID: ${campaignId}` : ''}

Set SUPERWALL_API_KEY env var for live API access.`);
  }
  
  try {
    let url = `${SUPERWALL_API_BASE}/campaigns`;
    let method = 'GET';
    let body: string | undefined;
    
    switch (action) {
      case 'list':
        break;
      case 'inspect':
        url = `${SUPERWALL_API_BASE}/campaigns/${campaignId}`;
        break;
      case 'create':
        method = 'POST';
        body = JSON.stringify({ name });
        break;
      case 'add_paywall':
        url = `${SUPERWALL_API_BASE}/campaigns/${campaignId}/paywalls`;
        method = 'POST';
        body = JSON.stringify({ paywall_id: paywallId });
        break;
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    });
    
    if (!response.ok) {
      return createErrorResult(`Superwall API error (${response.status}): ${await response.text()}`);
    }
    
    const data = await response.json();
    return createTextResult(JSON.stringify(data, null, 2));
  } catch (error) {
    return createErrorResult(`Superwall API failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
