# iOS Builder MCP

A Model Context Protocol (MCP) server for building production-ready iOS apps with AI. Generate high-quality SwiftUI code, research market opportunities, manage integrations, and publish to the App Store — all through a structured 8-step workflow or individual tool calls.

**68 tools** | **56 source files** | **~9,200 LOC**

---

## The 8-Step App Journey

Create a complete iOS app from scratch with a guided, step-by-step workflow. Each step has tailored instructions and available tools. Steps that require user approval gate before advancing are marked with 🔒.

| Step | Name | What Happens | Approval |
|------|------|-------------|----------|
| 🔍 | **Plan & Research** | Market research, competitor analysis, concept definition | 🔒 Yes |
| 🎨 | **Design System** | Visual style, color palette, typography, signature moves | 🔒 Yes |
| 🏗️ | **Architecture** | Screen hierarchy, data models, navigation flow, services | 🔒 Yes |
| 💻 | **Code Generation** | Generate all SwiftUI code (Views, Models, ViewModels) | No |
| ✅ | **Verify** | Compilation check, fix errors, final build | 🔒 Yes |
| 📱 | **Live Preview** | Simulator boot, install, launch, screenshot capture | 🔒 Yes |
| 📦 | **Publishing** | App icons, screenshots, metadata, App Store submission | No |
| 📈 | **Growth** | Social launch kit, ASO, content calendar, influencer outreach | No |

### Quick Start: Build an App From Zero

Just paste this prompt into your AI coding assistant:

> Use the iOS Builder MCP to create an app called "PetDiary" — a pet journal for tracking photos, vaccine reminders, and walks. Start with workflow_init and follow the 8 steps. Ask me before advancing.

The AI will:
1. Call `workflow_init("PetDiary", "...")` — creates the workflow state
2. Step 1 (**Plan**): research competitors, ask your preferences
3. Step 2 (**Design**): present design styles, let you pick
4. Step 3 (**Architecture**): plan screens, models, services
5. Step 4 (**Build**): Xcode project is auto-created, then code is generated
6. Step 5 (**Verify**): compile check, fix errors
7. Step 6 (**Preview**): simulator boot, install, screenshots
8. Step 7 (**Publish**): app icons, metadata, App Store submission
9. Step 8 (**Grow**): social kit, ASO, release notes

At each step requiring approval, the AI will ask before advancing.

---

## All Tools Reference

### 🚀 Workflow Tools (4)

| Tool | Description |
|------|-------------|
| `workflow_init` | Initialize a new 8-step workflow for building an app from scratch |
| `workflow_status` | View current workflow progress, step details, and available tools |
| `workflow_approve` | Approve the current step and mark it as completed |
| `workflow_next` | Advance to the next step in the workflow |
 
### 🏗️ Core Tools (15)

| Tool | Description |
|------|-------------|
| `generate_xcode_project` | Create a new Xcode project structure (.xcodeproj, directories, Info.plist, Assets) |
| `write_file` | Write a new file to the project |
| `edit_file` | Make a surgical text replacement in an existing file |
| `read_files` | Read one or more files from the project |
| `search_files` | Search file contents with regex patterns |
| `list_files` | List project files, optionally filtered by glob pattern |
| `delete_file` | Delete a file from the project |
| `rename_file` | Rename or move a file |
| `run_command` | Execute a shell command with timeout |
| `verify_compile` | Type-check a Swift file for compilation errors |
| `build_project` | Build the full Xcode project |
| `update_project_status` | Update the current project status and phase |
| `update_task_plan` | Create or update a task plan with checklist items |
| `read_plan` | Read the current task plan |

### 🎨 Design System Tools (3)

| Tool | Description |
|------|-------------|
| `update_design_system_options` | List available design systems with descriptions |
| `set_design_style` | Apply a design system (style + palette) to the project |
| `set_project_identity` | Configure project metadata (name, bundle ID, team) |

**8 design styles:** Clean Minimal, Playful Gamified, Professional Corporate, Bold Editorial, Calm Wellness, Dark Premium, Glassy Modern, Retro Nostalgic  
**20 color palettes** covering neutral light/dark, vibrant, and monochrome themes.

### 🔬 Research Tools (4)

| Tool | Description |
|------|-------------|
| `web_search` | Search the web for market research and competitor data |
| `scrape_url` | Extract content from a URL |
| `app_research` | Research apps on the App Store — search, reviews, rankings |
| `inspect_website` | Extract color palette, typography, navigation, and links from a website |

### 📱 Simulator Tools (15)

| Tool | Description |
|------|-------------|
| `simulator_list_devices` | List all available simulator devices |
| `simulator_boot` | Boot a simulator device |
| `simulator_shutdown` | Shutdown a simulator device |
| `simulator_open` | Open the Simulator app |
| `simulator_status` | Check if a device is booted and ready |
| `simulator_install` | Install a .app bundle on a device |
| `simulator_launch` | Launch an installed app by bundle ID |
| `simulator_terminate` | Terminate a running app |
| `simulator_screenshot` | Capture a screenshot (returns base64 image) |
| `simulator_logs` | Fetch system logs from a device |
| `simulator_tap` | Simulate a tap at x,y coordinates |
| `simulator_type` | Type text into the currently focused field |
| `simulator_drag` | Perform a drag gesture between two points |
| `simulator_button` | Press a device button (Home, Volume, Power, etc.) |
| `simulator_rotate` | Rotate the device to a given orientation |

### 🔗 Integration Tools (12)

| Tool | Description |
|------|-------------|
| `openai_chat` | Send a chat completion request to OpenAI |
| `openai_generate_code` | Generate Swift code with iOS-specific context |
| `supabase_read` | Read rows from a Supabase table |
| `supabase_write` | Write rows to a Supabase table |
| `supabase_sql` | Execute raw SQL against Supabase |
| `supabase_settings` | Get or update Supabase auth settings |
| `superwall_account` | Get Superwall account info |
| `superwall_paywall` | CRUD operations on Superwall paywalls |
| `superwall_monetization` | Manage Superwall monetization products |
| `superwall_campaigns` | List and manage Superwall campaigns |
| `backend_functions_list` | List Supabase Edge Functions |
| `backend_functions_invoke` | Invoke a Supabase Edge Function |

### 📦 Publishing Tools (9)

| Tool | Description |
|------|-------------|
| `generate_app_icon` | Generate app icons in all required sizes using `sips` |
| `generate_screenshot` | Capture App Store screenshots from simulator |
| `generate_app_metadata` | Generate App Store metadata (name, subtitle, description, keywords) |
| `update_app_store_assets` | Update App Store assets and metadata |
| `app_store_preflight` | Run preflight checks before submission (6 checks) |
| `asc_validate` | Validate the build in App Store Connect |
| `asc_submit` | Submit the build for App Store review |
| `asc_status` | Check the review status in App Store Connect |
| `app_store_publishing_status` | Get current publishing stage and status |
| `app_store_publishing_update_stage` | Advance the publishing pipeline stage |

### 📈 Growth Tools (6)

| Tool | Description |
|------|-------------|
| `social_launch_kit` | Generate social media handles, bio, pinned posts, launch strategy |
| `aso_research` | ASO keyword research, metadata optimization, competitor analysis |
| `content_calendar` | Generate a multi-platform content calendar (Instagram, TikTok, X, LinkedIn, Threads) |
| `generate_release_notes` | Generate release notes from git commit history |
| `influencer_outreach` | Generate influencer outreach templates, campaign briefs, selection criteria |

---

## Installation

```bash
git clone git@github.com:felipecarvalho/ios-builder-mcp.git
cd ios-builder-mcp
npm install
npm run build
```

### AI Assistant Prompt

Paste this prompt into any AI coding assistant to clone, build, and configure the MCP server:

```markdown
Clone and configure the iOS Builder MCP server:
1. `git clone git@github.com:felipecarvalho/ios-builder-mcp.git`
2. `cd ios-builder-mcp && npm install && npm run build`
3. Register it in my MCP client config (stdio, node dist/index.js)
```

## Configuration

### MCP Client

Paste this into your AI assistant to register the MCP server on any platform:

```markdown
Register the iOS Builder MCP server in my MCP client configuration. 
The server runs on stdio transport at: node /path/to/ios-builder-mcp/dist/index.js
Set IOS_BUILDER_PROJECT_ROOT to my project directory.
Use the correct config format for my platform (OpenCode, Claude Code, Cursor, etc.).
```

Or manually add this JSON to your MCP client config:

```json
{
  "mcpServers": {
    "ios-builder": {
      "command": "node",
      "args": ["/path/to/ios-builder-mcp/dist/index.js"],
      "env": {
        "IOS_BUILDER_PROJECT_ROOT": "/path/to/your/xcode-project"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For OpenAI tools | OpenAI API key |
| `SUPABASE_URL` | For Supabase tools | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | For Supabase tools | Supabase service role key |
| `SUPERWALL_API_KEY` | For Superwall tools | Superwall organization API key |
| `ASC_KEY_ID` | For publishing tools | App Store Connect API key ID |
| `ASC_ISSUER_ID` | For publishing tools | App Store Connect API issuer ID |
| `IOS_BUILDER_PROJECT_ROOT` | No | Path to Xcode project (default: current dir) |
| `IOS_BUILDER_LOG_LEVEL` | No | Log level: error, warn, info, debug (default: info) |
| `IOS_BUILDER_SIMULATOR_DEVICE` | No | Default simulator device (default: iPhone 15 Pro) |
| `IOS_BUILDER_XCODE_PATH` | No | Path to Xcode.app (default: /Applications/Xcode.app) |

---

## Freeform Mode

When no workflow is active, all 68 tools are available for direct use. The unified prompt provides general iOS-building instructions without step-by-step guidance. This is useful for:

- Making targeted edits to an existing project
- Running research without building an app
- Generating specific assets or marketing materials
- Quick prototyping without the full journey

---

## Project Structure

```
ios-builder-mcp/
├── src/
│   ├── index.ts                          # Entry point (stdio transport)
│   ├── server.ts                         # MCP server setup
│   ├── config.ts                         # Environment config with Zod validation
│   ├── workflow/
│   │   ├── types.ts                      # Enums, interfaces, step definitions
│   │   ├── engine.ts                     # State machine + workflow persistence
│   │   └── prompt-generator.ts           # Dynamic step-specific prompt generation
│   ├── tools/
│   │   ├── registry.ts                   # Central tool registry (single dispatcher)
│   │   ├── index.ts                      # Tool registration orchestrator
│   │   ├── core/                         # 14 file/build/project tools
│   │   ├── design/                       # 3 design system tools
│   │   ├── research/                     # 4 research tools
│   │   ├── simulator/                    # 15 simulator interaction tools
│   │   ├── integrations/                 # 12 integration tools (OpenAI, Supabase, Superwall, Backend)
│   │   ├── publishing/                   # 9 publishing & ASC tools
│   │   ├── growth/                       # 6 growth & marketing tools
│   │   └── workflow/                     # 5 workflow journey tools
│   ├── prompts/
│   │   ├── index.ts                      # Prompt registration
│   │   ├── unified.ts                    # Unified prompt (auto-detects workflow vs freeform)
│   │   └── modes/                        # Legacy mode prompts
│   ├── design-systems/
│   │   ├── styles/                       # 8 design style presets
│   │   ├── palettes/                     # 20 color palette presets
│   │   └── index.ts                      # Design system registry
│   ├── skills/
│   │   └── ui-design.ts                 # Bundled UI Design skill
│   └── templates/
│       └── index.ts                      # Code generation templates (App.swift, ContentView, etc.)
├── examples/
│   ├── fitness-tracker/                  # Fitness Tracker example app
│   ├── recipe-app/                       # Recipe App example app
│   └── social-app/                        # Social App example app
├── tests/
│   ├── tools/
│   │   ├── registry.test.ts              # Registry unit tests
│   │   ├── config.test.ts                # Config validation tests
│   │   └── result-helpers.test.ts        # Result helper tests
│   └── integration/
│       ├── server.test.ts                # Server integration tests
│       └── build.test.ts                 # Build compilation tests
├── docs/
│   ├── PHASE-1.md                        # Core Foundation docs
│   ├── PHASE-2.md                        # Design System docs
│   ├── PHASE-3.md                        # Research Mode docs
│   ├── PHASE-4.md                        # Simulator Integration docs
│   ├── PHASE-5.md                        # Integrations docs
│   ├── PHASE-6.md                        # Publishing docs
│   └── PHASE-7.md                        # Growth Mode docs
├── package.json
├── tsconfig.json
├── LICENSE                               # PolyForm Noncommercial License 1.0.0
└── README.md
```

---

## Development

```bash
# Watch mode (auto-recompile on changes)
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

### Test Suite

16 tests across 5 files:

```
tests/tools/registry.test.ts        — Tool registration and dispatch
tests/tools/config.test.ts          — Environment configuration validation
tests/tools/result-helpers.test.ts  — Result helper functions
tests/integration/server.test.ts    — MCP server initialization
tests/integration/build.test.ts     — Build compilation (type-check, project build)
```

---

## Design Principles

### Make It Feel Authored, Not Generated
- 2-3 signature visual moves repeated consistently across the app
- Custom color palette tailored to the app's domain
- Product-specific composition (not generic card layouts)
- Native iOS expression using SwiftUI controls

### What To Avoid
- Generic "large title + search bar + segmented control + cards" template
- Identical full-width cards floating on a light background
- All elements with the same width, height, padding, and corner radius

---

## License

[PolyForm Noncommercial License 1.0.0](LICENSE) — Free for non-commercial use.

This project builds upon concepts from [10x](https://github.com/10x-app-builder/10x) — an AI-powered iOS app builder — and extends the original idea with a universal MCP protocol, enhanced design systems, and a structured 8-step app creation journey.
