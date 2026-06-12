import { z } from 'zod';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';

const webSearchSchema = z.object({
  query: z.string().describe('Search query'),
  maxResults: z.number().default(10).describe('Maximum number of results'),
});

const scrapeUrlSchema = z.object({
  url: z.string().describe('URL to scrape'),
  format: z.enum(['markdown', 'text', 'html']).default('markdown').describe('Output format'),
});

export function registerWebTools(): void {
  registerTool(
    {
      name: 'web_search',
      description: 'Search the web for information. Returns titles, URLs, and snippets.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          maxResults: { type: 'number', description: 'Maximum number of results' },
        },
        required: ['query'],
      },
    },
    handleWebSearch,
  );

  registerTool(
    {
      name: 'scrape_url',
      description: 'Fetch and extract content from a URL. Returns content in markdown, text, or HTML format.',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to scrape' },
          format: { type: 'string', enum: ['markdown', 'text', 'html'], description: 'Output format' },
        },
        required: ['url'],
      },
    },
    handleScrapeUrl,
  );
}

async function handleWebSearch(args: unknown): Promise<ToolResult> {
  const { query } = webSearchSchema.parse(args);
  
  // Note: In production, integrate with a real search API (Google, Bing, DuckDuckGo)
  // For now, return a placeholder response
  const results = [
    {
      title: `Search result for: ${query}`,
      url: 'https://example.com',
      snippet: 'This is a placeholder. Integrate with a real search API for production use.',
    },
  ];
  
  const formattedResults = results
    .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.snippet}`)
    .join('\n\n');
  
  return createTextResult(`Found ${results.length} results:\n\n${formattedResults}`);
}

async function handleScrapeUrl(args: unknown): Promise<ToolResult> {
  const { url, format } = scrapeUrlSchema.parse(args);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      return createErrorResult(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Simple HTML to markdown/text conversion
    let content = html;
    
    if (format === 'markdown' || format === 'text') {
      // Remove scripts and styles
      content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      
      // Extract title
      const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract body content
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      content = bodyMatch ? bodyMatch[1] : content;
      
      // Convert common HTML to markdown
      if (format === 'markdown') {
        content = content
          .replace(/<h1[^>]*>([^<]*)<\/h1>/gi, '# $1\n\n')
          .replace(/<h2[^>]*>([^<]*)<\/h2>/gi, '## $1\n\n')
          .replace(/<h3[^>]*>([^<]*)<\/h3>/gi, '### $1\n\n')
          .replace(/<p[^>]*>([^<]*)<\/p>/gi, '$1\n\n')
          .replace(/<li[^>]*>([^<]*)<\/li>/gi, '- $1\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\n{3,}/g, '\n\n');
      } else {
        content = content
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      content = `# ${title}\n\n${content}`;
    }
    
    const maxLength = 50000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '\n\n[Content truncated]';
    }
    
    return createTextResult(content);
  } catch (error) {
    return createErrorResult(`Failed to scrape ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
