import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';
import { config } from '../../config.js';

// ============================================================
// Schemas
// ============================================================

const socialLaunchKitSchema = z.object({
  appName: z.string().describe('App name'),
  appDescription: z.string().describe('Brief app description'),
  keywords: z.array(z.string()).describe('App keywords/topics'),
  targetAudience: z.string().describe('Target audience description'),
  competitors: z.array(z.string()).optional().describe('Competitor app names'),
  includeHandles: z.boolean().default(true).describe('Generate handle suggestions'),
  includeBio: z.boolean().default(true).describe('Generate bio'),
  includePinnedPosts: z.boolean().default(true).describe('Generate pinned post concepts'),
  includeStrategy: z.boolean().default(true).describe('Generate recommended strategy'),
});

const asoSchema = z.object({
  action: z.enum(['research_keywords', 'optimize_metadata', 'competitor_analysis', 'suggest_categories']).describe('ASO action'),
  appName: z.string().describe('App name'),
  description: z.string().optional().describe('App description for optimization'),
  currentKeywords: z.array(z.string()).optional().describe('Current keywords'),
  competitors: z.array(z.string()).optional().describe('Competitor app names'),
  category: z.string().optional().describe('App Store category'),
});

const contentCalendarSchema = z.object({
  appName: z.string().describe('App name'),
  appDescription: z.string().describe('App description'),
  topics: z.array(z.string()).describe('Content topics'),
  platforms: z.array(z.enum(['instagram', 'tiktok', 'twitter', 'linkedin', 'threads'])).describe('Target platforms'),
  weeks: z.number().default(4).describe('Number of weeks'),
  contentType: z.enum(['educational', 'promotional', 'ugc', 'entertainment', 'mixed']).default('mixed').describe('Content type focus'),
});

const releaseNotesSchema = z.object({
  commits: z.array(z.string()).describe('Git commit messages (newest first)'),
  version: z.string().optional().describe('Version number'),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'minimal']).default('casual').describe('Release notes tone'),
});

const influencerOutreachSchema = z.object({
  action: z.enum(['generate_template', 'create_brief', 'suggest_criteria']).describe('Influencer action'),
  appName: z.string().describe('App name'),
  appDescription: z.string().describe('App description'),
  platform: z.enum(['instagram', 'tiktok', 'youtube', 'twitter']).default('instagram').describe('Platform'),
  niche: z.string().optional().describe('Content niche'),
  campaignGoal: z.string().optional().describe('Campaign goal'),
});

const appStoreAssetsSchema = z.object({
  action: z.enum(['update_description', 'generate_screenshot_copy', 'generate_keywords', 'update_subtitle']).describe('Asset action'),
  appName: z.string().describe('App name'),
  currentHeadline: z.string().optional().describe('Current app name/headline (max 30 chars)'),
  currentSubtitle: z.string().optional().describe('Current subtitle (max 30 chars)'),
  currentDescription: z.string().optional().describe('Current description (max 4000 chars)'),
  features: z.array(z.string()).optional().describe('Key features to highlight'),
  targetAudience: z.string().optional().describe('Target audience'),
});

// ============================================================
// Registration
// ============================================================

export function registerGrowthTools(): void {
  // Social Launch Kit
  registerTool(
    {
      name: 'social_launch_kit',
      description: 'Generate a complete social media launch kit: handles, bio, pinned posts, and recommended strategy.',
      inputSchema: {
        type: 'object',
        properties: {
          appName: { type: 'string', description: 'App name' },
          appDescription: { type: 'string', description: 'Brief app description' },
          keywords: { type: 'array', items: { type: 'string' }, description: 'Keywords/topics' },
          targetAudience: { type: 'string', description: 'Target audience' },
          competitors: { type: 'array', items: { type: 'string' }, description: 'Competitors' },
          includeHandles: { type: 'boolean' },
          includeBio: { type: 'boolean' },
          includePinnedPosts: { type: 'boolean' },
          includeStrategy: { type: 'boolean' },
        },
        required: ['appName', 'appDescription', 'keywords', 'targetAudience'],
      },
    },
    handleSocialLaunchKit,
  );

  // ASO
  registerTool(
    {
      name: 'aso_research',
      description: 'App Store Optimization research: keywords, metadata optimization, competitor analysis, category suggestions.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['research_keywords', 'optimize_metadata', 'competitor_analysis', 'suggest_categories'], description: 'ASO action' },
          appName: { type: 'string', description: 'App name' },
          description: { type: 'string', description: 'App description' },
          currentKeywords: { type: 'array', items: { type: 'string' }, description: 'Current keywords' },
          competitors: { type: 'array', items: { type: 'string' }, description: 'Competitors' },
          category: { type: 'string', description: 'App Store category' },
        },
        required: ['action', 'appName'],
      },
    },
    handleAsoResearch,
  );

  // Content Calendar
  registerTool(
    {
      name: 'content_calendar',
      description: 'Generate a multi-week content calendar for social media platforms.',
      inputSchema: {
        type: 'object',
        properties: {
          appName: { type: 'string', description: 'App name' },
          appDescription: { type: 'string', description: 'App description' },
          topics: { type: 'array', items: { type: 'string' }, description: 'Content topics' },
          platforms: { type: 'array', items: { type: 'string', enum: ['instagram', 'tiktok', 'twitter', 'linkedin', 'threads'] }, description: 'Platforms' },
          weeks: { type: 'number', description: 'Number of weeks' },
          contentType: { type: 'string', enum: ['educational', 'promotional', 'ugc', 'entertainment', 'mixed'], description: 'Content type' },
        },
        required: ['appName', 'appDescription', 'topics', 'platforms'],
      },
    },
    handleContentCalendar,
  );

  // Release Notes
  registerTool(
    {
      name: 'generate_release_notes',
      description: 'Generate user-facing App Store release notes from git commit messages.',
      inputSchema: {
        type: 'object',
        properties: {
          commits: { type: 'array', items: { type: 'string' }, description: 'Commit messages (newest first)' },
          version: { type: 'string', description: 'Version number' },
          tone: { type: 'string', enum: ['professional', 'casual', 'enthusiastic', 'minimal'], description: 'Tone' },
        },
        required: ['commits'],
      },
    },
    handleReleaseNotes,
  );

  // Influencer Outreach
  registerTool(
    {
      name: 'influencer_outreach',
      description: 'Generate influencer outreach templates, campaign briefs, and creator selection criteria.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['generate_template', 'create_brief', 'suggest_criteria'], description: 'Action' },
          appName: { type: 'string', description: 'App name' },
          appDescription: { type: 'string', description: 'App description' },
          platform: { type: 'string', enum: ['instagram', 'tiktok', 'youtube', 'twitter'], description: 'Platform' },
          niche: { type: 'string', description: 'Content niche' },
          campaignGoal: { type: 'string', description: 'Campaign goal' },
        },
        required: ['action', 'appName', 'appDescription'],
      },
    },
    handleInfluencerOutreach,
  );

  // App Store Assets
  registerTool(
    {
      name: 'update_app_store_assets',
      description: 'Update App Store listing assets: description, screenshot copy, keywords, subtitle.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['update_description', 'generate_screenshot_copy', 'generate_keywords', 'update_subtitle'], description: 'Action' },
          appName: { type: 'string', description: 'App name' },
          currentHeadline: { type: 'string', description: 'Current headline (max 30 chars)' },
          currentSubtitle: { type: 'string', description: 'Current subtitle (max 30 chars)' },
          currentDescription: { type: 'string', description: 'Current description' },
          features: { type: 'array', items: { type: 'string' }, description: 'Features' },
          targetAudience: { type: 'string', description: 'Target audience' },
        },
        required: ['action', 'appName'],
      },
    },
    handleAppStoreAssets,
  );
}

// ============================================================
// Handlers
// ============================================================

async function handleSocialLaunchKit(args: unknown): Promise<ToolResult> {
  const data = socialLaunchKitSchema.parse(args);
  
  const sections: string[] = ['# Social Launch Kit', `## ${data.appName}`];
  
  if (data.includeHandles) {
    const handles = generateHandles(data.appName, data.keywords);
    sections.push(`## Suggested Handles\n${handles.map((h, i) => `${i + 1}. \`${h}\``).join('\n')}`);
  }
  
  if (data.includeBio) {
    const bio = generateBio(data.appName, data.appDescription);
    sections.push(`## Bio\n> ${bio}`);
  }
  
  if (data.includePinnedPosts) {
    const posts = generatePinnedPosts(data.appName, data.appDescription, data.keywords);
    sections.push(`## Pinned Posts\n${posts}`);
  }
  
  if (data.includeStrategy) {
    const strategy = generateStrategy(data.appName, data.targetAudience, data.keywords, data.competitors || []);
    sections.push(`## Recommended Strategy\n${strategy}`);
  }
  
  // Save to project
  const growthDir = path.join(config.projectRoot, 'growth', 'social');
  await fs.mkdir(growthDir, { recursive: true });
  const outputPath = path.join(growthDir, 'social-launch-kit.md');
  await fs.writeFile(outputPath, sections.join('\n\n'), 'utf-8');
  
  return createTextResult(sections.join('\n\n') + `\n\n---\nSaved to: ${outputPath}`);
}

async function handleAsoResearch(args: unknown): Promise<ToolResult> {
  const data = asoSchema.parse(args);
  
  switch (data.action) {
    case 'research_keywords': {
      const keywords = generateAsoKeywords(data.appName, data.description || '', data.currentKeywords || [], data.competitors || []);
      return createTextResult(`## ASO Keyword Research — ${data.appName}\n\n### High Competition Keywords\n${keywords.high.map(k => `- ${k}`).join('\n')}\n\n### Medium Competition Keywords\n${keywords.medium.map(k => `- ${k}`).join('\n')}\n\n### Long Tail Keywords\n${keywords.longTail.map(k => `- ${k}`).join('\n')}\n\n### Suggested Keyword String\n\`${keywords.keywordString}\``);
    }
    
    case 'optimize_metadata': {
      const metadata = optimizeMetadata(data.appName, data.description || '', data.currentKeywords || []);
      return createTextResult(`## Optimized Metadata — ${data.appName}\n\n### Title\n${metadata.title}\n\n### Subtitle\n${metadata.subtitle}\n\n### Description\n${metadata.description}\n\n### Keywords\n${metadata.keywords}`);
    }
    
    case 'competitor_analysis': {
      if (!data.competitors || data.competitors.length === 0) {
        return createTextResult('Provide competitor app names for analysis.');
      }
      return createTextResult(`## Competitor Analysis — ${data.appName}\n\n${data.competitors.map((comp, i) => {
        return `### ${i + 1}. ${comp}\n- **Category Gap**: ${generateCategoryGap(data.appName, comp)}\n- **Keyword Opportunities**: ${generateKeywordOpportunities(data.appName, comp)}\n- **Rating Comparison**: Based on App Store data`;
      }).join('\n\n')}\n\n*Note: Use app_research with real App Store IDs for accurate competitor data.*`);
    }
    
    case 'suggest_categories': {
      const categories = suggestCategories(data.appName, data.description || '', data.currentKeywords || []);
      return createTextResult(`## Suggested Categories — ${data.appName}\n\n### Primary\n- **${categories.primary.name}**: ${categories.primary.reason}\n\n### Secondary\n${categories.secondary.map(c => `- **${c.name}**: ${c.reason}`).join('\n')}\n\n### Also Consider\n${categories.alternatives.map(c => `- ${c}`).join('\n')}`);
    }
    
    default:
      return createErrorResult(`Unknown ASO action: ${data.action}`);
  }
}

async function handleContentCalendar(args: unknown): Promise<ToolResult> {
  const data = contentCalendarSchema.parse(args);
  
  const calendar: string[] = [
    `# Content Calendar — ${data.appName}`,
    `**Type**: ${data.contentType} | **Platforms**: ${data.platforms.join(', ')} | **Duration**: ${data.weeks} weeks`,
  ];
  
  const contentFormats: Record<string, string[]> = {
    instagram: ['Carousel', 'Reel', 'Story', 'Single Image'],
    tiktok: ['Short Video (15s)', 'TikTok Trend', 'Educational Clip', 'Behind the Scenes'],
    twitter: ['Thread', 'Tweet + Image', 'Poll', 'Quote Tweet'],
    linkedin: ['Article', 'Infographic', 'Tip Card', 'Case Study'],
    threads: ['Short Thread', 'Question', 'Hot Take', 'Update'],
  };
  
  for (let week = 1; week <= data.weeks; week++) {
    calendar.push(`\n## Week ${week}\n`);
    
    for (const platform of data.platforms) {
      const formats = contentFormats[platform] || ['Post'];
      const topic = data.topics[week % data.topics.length];
      const format = formats[week % formats.length];
      const contentTypeLabel = data.contentType === 'mixed'
        ? ['educational', 'promotional', 'entertainment', 'ugc'][week % 4]
        : data.contentType;
      
      calendar.push(`### ${platform.toUpperCase()}`);
      calendar.push(`- **Topic**: ${topic}`);
      calendar.push(`- **Format**: ${format}`);
      calendar.push(`- **Type**: ${contentTypeLabel}`);
      calendar.push(`- **Hook**: "${generateHook(topic, platform, contentTypeLabel)}"`);
      calendar.push('');
    }
  }
  
  // Save to project
  const growthDir = path.join(config.projectRoot, 'growth', 'content');
  await fs.mkdir(growthDir, { recursive: true });
  const outputPath = path.join(growthDir, `content-calendar-${data.weeks}w.md`);
  await fs.writeFile(outputPath, calendar.join('\n'), 'utf-8');
  
  return createTextResult(calendar.join('\n') + `\n\n---\nSaved to: ${outputPath}`);
}

async function handleReleaseNotes(args: unknown): Promise<ToolResult> {
  const { commits, version, tone } = releaseNotesSchema.parse(args);
  
  // Generate release notes from commits
  const notes = generateReleaseNotesFromCommits(commits, tone);
  
  const result = version
    ? `## What's New in Version ${version}\n\n${notes}`
    : `## What's New\n\n${notes}`;
  
  // Save to project
  const growthDir = path.join(config.projectRoot, 'growth');
  await fs.mkdir(growthDir, { recursive: true });
  const outputPath = path.join(growthDir, `release-notes${version ? `-v${version}` : ''}.md`);
  await fs.writeFile(outputPath, result, 'utf-8');
  
  return createTextResult(result + `\n\n---\nSaved to: ${outputPath}`);
}

async function handleInfluencerOutreach(args: unknown): Promise<ToolResult> {
  const { action, appName, appDescription, platform, niche, campaignGoal } = influencerOutreachSchema.parse(args);
  
  switch (action) {
    case 'generate_template': {
      const template = `## Influencer Outreach Template — ${appName}

### Subject: Collaboration with ${appName} ✨

Hi {influencer_name},

I'm reaching out from the ${appName} team. We've been following your content on ${platform} and loved your work on ${niche || 'your niche'}.

${appName} is ${appDescription}. We think your audience would genuinely find value in what we're building.

We'd love to explore a collaboration. Here's what we're thinking:

**Campaign Goal**: ${campaignGoal || 'Increase brand awareness and drive quality installs'}
**Compensation**: {compensation_details}
**Timeline**: {proposed_timeline}
**Deliverables**: {expected_deliverables}

Would you be open to a quick chat about this?

Best,
{your_name}
${appName} Team

---

### Tips for personalization:
1. Reference a specific piece of their content
2. Be clear about compensation upfront
3. Attach a one-pager or brief if available
4. Follow up after 5-7 days if no response`;
      
      return createTextResult(template);
    }
    
    case 'create_brief': {
      const brief = `## Campaign Brief — ${appName}

### Overview
- **App**: ${appName}
- **Description**: ${appDescription}
- **Platform**: ${platform}
- **Goal**: ${campaignGoal || 'Brand awareness and installs'}
- **Niche**: ${niche || 'General'}

### Key Messages
1. ${appName} solves [key problem] for [target audience]
2. Key differentiator: [what makes it unique]
3. Target audience: [who should download]

### Content Requirements
- Format: ${platform === 'instagram' ? 'Stories + Feed posts + Reels' : platform === 'tiktok' ? '15-60 second videos' : 'Platform-native content'}
- Must include: App demo, key features, CTA to download
- Must avoid: Competitor mentions, false claims
- Timeline: {timeline}
- Revisions: {revision_policy}

### Assets Provided
- App screenshots and screen recordings
- Brand guidelines
- Promo codes (if applicable)
- Talking points document

### Tracking
- Custom link/UTM: {tracking_url}
- Promo code: {promo_code}
- Discount code: {discount_code}`;
      
      return createTextResult(brief);
    }
    
    case 'suggest_criteria': {
      const criteria = `## Creator Selection Criteria — ${appName}

### Must-Have
- **Follower Count**: 10K - 100K (micro-influencer sweet spot)
- **Engagement Rate**: > 3% on ${platform}
- **Content Quality**: Professional-grade visuals/editing
- **Audience Alignment**: {target_demographic_match}
- **Brand Safety**: No controversial content history

### Nice-to-Have
- Previous app promotion experience
- Video content creation capability
- Cross-platform presence
- Niche authority in ${niche || 'relevant category'}

### Red Flags
- Inflated follower counts (sudden spikes)
- Engagement < 1%
- Promotes competing products
- Low comment authenticity

### Discovery Platforms
- ${platform === 'instagram' ? 'Instagram Explore, Creator Marketplace' : platform === 'tiktok' ? 'TikTok Creator Marketplace' : 'Platform-native discovery tools'}
- Upfluence / AspireIQ / Grin
- Manual outreach via ${platform} search`;
      
      return createTextResult(criteria);
    }
    
    default:
      return createErrorResult(`Unknown action: ${action}`);
  }
}

async function handleAppStoreAssets(args: unknown): Promise<ToolResult> {
  const data = appStoreAssetsSchema.parse(args);
  
  switch (data.action) {
    case 'update_description': {
      const maxDescLength = 4000;
      const desc = data.currentDescription || data.features?.map((f, i) => `${i + 1}. ${f}`).join('\n') || `${data.appName} is an iOS app.`;
      const truncated = desc.length > maxDescLength ? desc.substring(0, maxDescLength - 3) + '...' : desc;
      
      return createTextResult(`## Updated Description — ${data.appName}\n\n${truncated}\n\n(${truncated.length}/4000 characters)`);
    }
    
    case 'generate_screenshot_copy': {
      const screenshots = [
        {
          title: `Welcome to ${data.appName}`,
          subtitle: data.currentSubtitle || 'Your new favorite app',
          highlight: 'Smart',
        },
        {
          title: data.features?.[0] || 'Key Feature',
          subtitle: 'Do more in less time',
          highlight: 'Fast',
        },
        {
          title: data.features?.[1] || 'Stay Organized',
          subtitle: 'Everything in one place',
          highlight: 'Simple',
        },
        {
          title: data.targetAudience ? `For ${data.targetAudience}` : 'For Everyone',
          subtitle: 'Designed with care',
          highlight: 'Yours',
        },
      ];
      
      return createTextResult(`## Screenshot Copy — ${data.appName}\n\n${screenshots.map((s, i) => `### Screen ${i + 1}: ${s.title}\n- **Headline**: ${s.title}\n- **Subtitle**: ${s.subtitle}\n- **Emphasis**: ${s.highlight}`).join('\n\n')}`);
    }
    
    case 'generate_keywords': {
      const keywords = generateAsoKeywords(data.appName, data.currentDescription || '', [], []);
      return createTextResult(`## App Store Keywords — ${data.appName}\n\n### Suggested Keyword String (100 chars max)\n\`${keywords.keywordString.substring(0, 100)}\`\n\n### Categorized\n- **Primary**: ${keywords.high.slice(0, 5).join(', ')}\n- **Secondary**: ${keywords.medium.slice(0, 5).join(', ')}\n- **Long Tail**: ${keywords.longTail.slice(0, 3).join(', ')}`);
    }
    
    case 'update_subtitle': {
      const subtitle = data.currentSubtitle || `${data.features?.[0] || 'Powerful'} • ${data.features?.[1] || 'Simple'} • ${data.targetAudience || 'iOS'}`;
      const maxSubtitleLength = 30;
      const truncated = subtitle.length > maxSubtitleLength ? subtitle.substring(0, maxSubtitleLength - 3) + '...' : subtitle;
      
      return createTextResult(`## Subtitle — ${data.appName}\n\n**${truncated}**\n(${truncated.length}/${maxSubtitleLength} characters)`);
    }
    
    default:
      return createErrorResult(`Unknown action: ${data.action}`);
  }
}

// ============================================================
// Helper generators
// ============================================================

function generateHandles(appName: string, keywords: string[]): string[] {
  const cleanName = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const keywordTags = keywords.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(k => k.length > 2);
  
  const handles = [
    `@${cleanName}`,
    `@${cleanName}app`,
    `@${cleanName}io`,
    `@${cleanName}${keywordTags[0] || 'hq'}`,
    keywords.length > 0 ? `@${keywordTags[0]}${cleanName}` : `@get${cleanName}`,
    `@try${cleanName}`,
  ];
  
  return [...new Set(handles)].slice(0, 6);
}

function generateBio(_appName: string, description: string): string {
  const short = description.length > 130 ? description.substring(0, 127) + '...' : description;
  return short;
}

function generatePinnedPosts(appName: string, description: string, keywords: string[]): string {
  const posts = [
    {
      title: `Why We Built ${appName}`,
      caption: `We created ${appName} because ${description.split('.')[0]}. Here's the story behind the app and what drives us every day.`,
      cta: `Download ${appName} and join us`,
      visual: `Behind-the-scenes shot of the development process or a clean mockup showing the main screen`,
    },
    {
      title: `${keywords[0] || 'Tips'} You Need to Know`,
      caption: `${keywords.slice(0, 3).join(', ')} — we break down everything you need to get started with ${appName}.`,
      cta: `Save this for later and download`,
      visual: `Carousel-style post with ${appName} screenshots showing step-by-step usage`,
    },
    {
      title: `What Our Users Say`,
      caption: `Real feedback from ${appName} users who transformed their ${keywords[0] || 'workflow'} using the app.`,
      cta: `Try ${appName} free today`,
      visual: `User testimonial graphic with app screenshot background and quote overlay`,
    },
  ];
  
  return posts.map((p, i) => `${i + 1}. **${p.title}**\n   - Caption: ${p.caption}\n   - CTA: ${p.cta}\n   - Visual: ${p.visual}`).join('\n\n');
}

function generateStrategy(appName: string, audience: string, keywords: string[], competitors: string[]): string {
  return `**Launch Phase (Weeks 1-2)**: Announce ${appName} with a 3-post launch sequence — teaser, launch day, and first-user celebration. Target ${audience} with content around ${keywords.slice(0, 2).join(' and ')}.

**Growth Phase (Weeks 3-6)**: Publish educational content ${keywords.length > 0 ? 'around ' + keywords[0] : 'showcasing core features'}. Encourage UGC with a branded hashtag. Engage in relevant communities${competitors.length > 0 ? ' where ' + competitors[0] + ' users hang out' : ''}.

**Scale Phase (Weeks 7-12)**: Double down on top-performing content formats. Launch an affiliate/influencer program. Cross-promote on complementary platforms. Run retargeting campaigns for engaged users who haven't installed yet.`;
}

function generateAsoKeywords(appName: string, description: string, _currentKeywords: string[], competitors: string[]) {
  const words = [...description.toLowerCase().split(/\s+/), ...appName.toLowerCase().split(/\s+/), ...competitors.map(c => c.toLowerCase())];
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'it', 'as', 'be', 'are', 'was', 'app', 'ios', 'your', 'our', 'we']);
  const uniqueWords = [...new Set(words.filter(w => w.length > 2 && !stopWords.has(w)))];

  // Simulate keyword categories
  const high = uniqueWords.slice(0, Math.min(5, uniqueWords.length)).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  const medium = uniqueWords.slice(3, Math.min(10, uniqueWords.length)).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  const longTail = competitors.length > 0
    ? [`${appName} for ${competitors[0].toLowerCase().replace(/[^a-z]/g, '')} users`, `best ${high[0]?.toLowerCase() || 'app'} alternative`, `${medium[0]?.toLowerCase() || 'top'} rated app`]
    : [`${appName} tips`, `${high[0]?.toLowerCase() || 'app'} guide`, `how to use ${appName.toLowerCase()}`];

  return {
    high,
    medium,
    longTail,
    keywordString: [...high.slice(0, 3), ...medium.slice(0, 5), ...longTail.slice(0, 2)].join(', '),
  };
}

function optimizeMetadata(appName: string, description: string, keywords: string[]) {
  return {
    title: appName.length > 30 ? appName.substring(0, 27) + '...' : appName,
    subtitle: keywords.slice(0, 2).join(' & ').substring(0, 30),
    description: `Welcome to ${appName}.\n\n${description}\n\nKey Features:\n- ${keywords.slice(0, 5).join('\n- ')}\n\nDownload ${appName} today and transform the way you work.`,
    keywords: keywords.slice(0, 10).join(', ').substring(0, 100),
  };
}

function generateCategoryGap(_appName: string, competitor: string): string {
  return `${_appName} can differentiate by focusing on ${competitor}'s weaker areas like user experience, pricing, or specific ${randomFeature()}`;
}

function generateKeywordOpportunities(_appName: string, competitor: string): string {
  return `Target keywords where ${competitor} ranks but is vulnerable, especially "${competitor.toLowerCase()} alternative" and long-tail variations`;
}

function suggestCategories(_appName: string, description: string, keywords: string[]) {
  const allCategories: { name: string; keywords: string[] }[] = [
    { name: 'Utilities', keywords: ['utility', 'tool', 'productivity', 'manage'] },
    { name: 'Productivity', keywords: ['productivity', 'work', 'task', 'organize', 'efficiency'] },
    { name: 'Lifestyle', keywords: ['lifestyle', 'daily', 'habit', 'routine', 'wellness'] },
    { name: 'Education', keywords: ['learn', 'education', 'study', 'course', 'knowledge'] },
    { name: 'Health & Fitness', keywords: ['health', 'fitness', 'workout', 'wellness', 'exercise'] },
    { name: 'Social Networking', keywords: ['social', 'network', 'community', 'connect', 'share'] },
    { name: 'Entertainment', keywords: ['entertainment', 'fun', 'game', 'media', 'enjoy'] },
  ];

  const text = `${description} ${keywords.join(' ')}`.toLowerCase();
  const scored = allCategories.map(c => ({
    name: c.name,
    keywords: c.keywords,
    score: c.keywords.filter(k => text.includes(k)).length,
  })).sort((a, b) => b.score - a.score);

  const top = scored[0];
  return {
    primary: { name: top?.name || 'Utilities', reason: top ? 'Best keyword match based on app content' : 'Default category' },
    secondary: scored.slice(1, 3).map(c => ({ name: c.name, reason: 'Relevant keywords found in description' })),
    alternatives: ['Developer Tools', 'Business', 'Reference'].slice(0, 3),
  };
}

function generateHook(topic: string, platform: string, contentType: string): string {
  const hooks: Record<string, Record<string, string[]>> = {
    educational: {
      instagram: [`3 ways to master ${topic}`, `${topic} tips that actually work`],
      tiktok: [`Stop doing ${topic} wrong`, `${topic} hack you NEED to know`],
      twitter: [`Unpopular opinion about ${topic}:`, `${topic} thread 🧵`],
    },
    promotional: {
      instagram: [`Why everyone is switching to ${topic}`, `${topic} changed my workflow`],
      tiktok: [`POV: You finally tried ${topic}`, `The ${topic} glow up`],
      twitter: [`We built ${topic} differently`, `${topic} just got an upgrade`],
    },
  };

  const typeHooks = hooks[contentType] || hooks.educational;
  const platformHooks = typeHooks[platform] || typeHooks.instagram || [`${topic} insights you need`];
  return platformHooks[0] || `${topic} tips for success`;
}

function generateReleaseNotesFromCommits(commits: string[], tone: string): string {
  // Filter infrastructure commits
  const infraWords = ['bump', 'chore', 'lint', 'ci', 'test', 'deps', 'README', 'formatting', 'config'];
  const relevant = commits.filter(c => !infraWords.some(w => c.toLowerCase().includes(w)));

  if (relevant.length === 0) {
    return 'Performance and stability improvements.';
  }

  // Group related commits
  const grouped = new Map<string, string[]>();
  for (const commit of relevant) {
    const key = commit.split(':')[0]?.trim() || commit;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(commit);
  }

  const tonePrefixes: Record<string, string[]> = {
    professional: ['Enhanced', 'Improved', 'Added', 'Optimized', 'Fixed'],
    casual: ['Made', 'Added', 'Cleaned up', 'Sped up', 'Sorted out'],
    enthusiastic: ['Totally revamped', 'Supercharged', 'Added awesome', 'Made amazing', 'Fixed'],
    minimal: ['Fixed', 'Updated', 'Added', 'Improved', 'Changed'],
  };

  const prefixes = tonePrefixes[tone] || tonePrefixes.casual;
  const bullets = Array.from(grouped.entries()).map(([key], i) => {
    const prefix = prefixes[i % prefixes.length];
    const userFacing = key
      .replace(/refactor/i, 'improved')
      .replace(/wip/i, '')
      .replace(/fix/i, 'resolved an issue with')
      .replace(/add/i, 'added')
      .replace(/cleanup/i, 'tidied up')
      .replace(/upgrade/i, 'updated')
      .replace(/bump/i, '');

    return `• ${prefix} ${userFacing}`;
  });

  return bullets.slice(0, 5).join('\n');
}

function randomFeature(): string {
  const features = ['integration', 'onboarding', 'notification system', 'search functionality', 'customization options'];
  return features[Math.floor(Math.random() * features.length)];
}
