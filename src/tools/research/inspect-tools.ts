import { z } from 'zod';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';

const inspectWebsiteSchema = z.object({
  url: z.string().describe('URL to inspect'),
});

export function registerInspectTools(): void {
  registerTool(
    {
      name: 'inspect_website',
      description: 'Inspect a website and extract visual and structural information — colors, typography, navigation, and metadata.',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to inspect' },
        },
        required: ['url'],
      },
    },
    handleInspectWebsite,
  );
}

async function handleInspectWebsite(args: unknown): Promise<ToolResult> {
  const { url } = inspectWebsiteSchema.parse(args);
  
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
    
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'No title';
    
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : 'No description';
    
    const colorMatches = html.match(/#[0-9A-Fa-f]{6}/g) || [];
    const uniqueColors = [...new Set(colorMatches)].slice(0, 10);
    
    const h1Matches = html.match(/<h1[^>]*>([^<]*)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]*)<\/h2>/gi) || [];
    
    const headings = [
      ...h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
      ...h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim()),
    ].slice(0, 10);
    
    const linkMatches = html.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi) || [];
    const links = linkMatches
      .map(link => {
        const hrefMatch = link.match(/href="([^"]*)"/);
        const textMatch = link.match(/>([^<]*)<\/a>/);
        return {
          href: hrefMatch ? hrefMatch[1] : '',
          text: textMatch ? textMatch[1].trim() : '',
        };
      })
      .filter(l => l.text && l.href)
      .slice(0, 10);
    
    const report = `# Website Inspection: ${url}

## Metadata
- **Title**: ${title}
- **Description**: ${description}

## Visual Analysis
### Colors Found
${uniqueColors.length > 0 ? uniqueColors.map(c => `- ${c}`).join('\n') : 'No colors detected'}

### Typography
- **Headings**: ${headings.length} found
${headings.map(h => `  - ${h}`).join('\n')}

### Navigation
- **Links**: ${links.length} found
${links.map(l => `  - ${l.text}: ${l.href}`).join('\n')}

## Recommendations for iOS App
Based on this website analysis:
1. Extract the color palette for consistent branding
2. Mirror the navigation structure in your app
3. Adapt the typography hierarchy to iOS type scale
4. Consider the content hierarchy for screen layout

*Note: For full visual inspection with screenshots, integrate with Puppeteer or a screenshot API.*`;
    
    return createTextResult(report);
  } catch (error) {
    return createErrorResult(`Failed to inspect ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
