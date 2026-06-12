# Fase 4: Simulator Integration — Concluída ✅

## Resumo

A Fase 4 implementou integração completa com o iOS Simulator via `xcrun simctl`, permitindo controle programático de dispositivos simulados diretamente do MCP server.

## O que foi feito

### 1. Central Tool Registry (`src/tools/registry.ts`)

**Problema resolvido:** Cada módulo chamava `server.setRequestHandler(CallToolRequestSchema, ...)` sobrescrevendo o handler anterior. Apenas o último módulo registrado funcionava.

**Solução:** Criamos um `ToolRegistry` central que:
- Mantém um `Map<string, ToolDefinition>` e `Map<string, ToolHandler>`
- Cada módulo chama `registerTool(name, definition, handler)` — sem efeitos colaterais
- Um único `setupToolServer(server)` configura `ListToolsRequestSchema` e `CallToolRequestSchema`
- O dispatcher central roteia cada chamada para o handler correto

**Arquivos refatorados:**
- `src/tools/core/file-tools.ts` — antes: 297 linhas com handlers duplicados; depois: mais limpo, ~150 linhas
- `src/tools/core/build-tools.ts`
- `src/tools/core/project-tools.ts`
- `src/tools/design/design-system-tools.ts`
- `src/tools/design/identity-tools.ts`
- `src/tools/research/web-tools.ts`
- `src/tools/research/app-research.ts`
- `src/tools/research/inspect-tools.ts`
- `src/tools/index.ts` — agora chama `registerXxxTools()` sem argumentos e `setupToolServer(server)` uma vez

### 2. Simulator Tools (`src/tools/simulator/simulator-tools.ts`)

**16 tools implementadas**, divididas em categorias:

#### Lifecycle (controle do simulador)
| Tool | Descrição | Comando `simctl` |
|------|-----------|------------------|
| `simulator_open` | Abre o app Simulator | `open -a Simulator` |
| `simulator_status` | Lista dispositivos com estado (Booted/Shutdown) | `simctl list devices` |
| `simulator_boot` | Inicializa um dispositivo (auto-detecta "default") | `simctl boot` |
| `simulator_shutdown` | Desliga um dispositivo | `simctl shutdown` |
| `simulator_list_devices` | Lista todos os devices disponíveis em JSON formatado | `simctl list devices --json` |

#### App Management
| Tool | Descrição | Comando `simctl` |
|------|-----------|------------------|
| `simulator_install` | Instala um .app bundle | `simctl install` |
| `simulator_launch` | Lança um app por bundle ID (com args opcionais) | `simctl launch` |
| `simulator_terminate` | Termina um app em execução | `simctl terminate` |

#### Screenshot
| Tool | Descrição | Comando |
|------|-----------|---------|
| `simulator_screenshot` | Captura screenshot e retorna base64 + salva em disco | `simctl io screenshot` |

Retorna `content` com dois itens: texto + imagem base64 (`mimeType: 'image/png'`).

#### Interaction (interação com a UI)
| Tool | Descrição | Comando `simctl` |
|------|-----------|------------------|
| `simulator_tap` | Tapa nas coordenadas (x, y) | `simctl ui` / fallback `simctl point` |
| `simulator_drag` | Arrasta de (x1,y1) para (x2,y2) com duração configurável | `simctl drag` |
| `simulator_type` | Digita texto no teclado virtual | `simctl keyboard` / fallback pasteboard |

#### Hardware
| Tool | Descrição | Comando |
|------|-----------|---------|
| `simulator_button` | Pressiona botão físico (home, lock, volume, power, siri, reload) | `simctl button` |
| `simulator_rotate` | Rotaciona para portrait/landscape | `simctl rotate` |

#### Debugging
| Tool | Descrição | Comando |
|------|-----------|---------|
| `simulator_logs` | Lê logs do sistema (filtra por bundle ID, lines, predicate) | `simctl spawn log show` |

### 3. Estrutura Final do Projeto

```
src/
├── index.ts                              # Entry point
├── server.ts                             # Server init + error handling
├── config.ts                             # Env var config (Zod)
├── types/
│   ├── tools.ts                          # ToolResult + helpers
│   ├── project.ts                        # Project/Task/Warning types
│   ├── design.ts                         # Design system types
│   ├── skills.ts                         # Skill type
├── tools/
│   ├── registry.ts                       # ToolRegistry central (NOVO)
│   ├── index.ts                          # registerAllTools
│   ├── core/
│   │   ├── file-tools.ts                 # 7 file tools
│   │   ├── build-tools.ts                # 3 build tools
│   │   ├── project-tools.ts              # 4 project tools
│   ├── design/
│   │   ├── design-system-tools.ts        # 2 design tools
│   │   ├── identity-tools.ts             # 1 identity tool
│   ├── research/
│   │   ├── web-tools.ts                  # 2 web tools
│   │   ├── app-research.ts              # 1 app research tool
│   │   ├── inspect-tools.ts             # 1 inspect tool
│   ├── simulator/
│   │   ├── simulator-tools.ts            # 16 simulator tools (NOVO)
├── prompts/
│   ├── index.ts
│   ├── modes/
│   │   ├── builder.ts
│   │   ├── research.ts
│   │   ├── growth.ts
├── design-systems/
│   ├── index.ts
│   ├── styles/                           # 8 styles
│   ├── palettes/                         # 20 palettes
├── skills/
│   ├── ui-design.ts
├── templates/
│   ├── index.ts
```

### 4. Como usar os simulator tools

```typescript
// Listar devices disponíveis
simulator_list_devices({})

// Inicializar simulador
simulator_boot({ device: "iPhone 15 Pro" })

// Instalar e lançar app
simulator_install({ appPath: "/path/to/build/Release-iphonesimulator/MyApp.app" })
simulator_launch({ bundleId: "com.example.myapp", args: ["--debug"] })

// Screenshot
simulator_screenshot({ filename: "home-screen", includeTimestamps: true })
// → retorna texto + imagem base64

// Interagir com a UI
simulator_tap({ x: 200, y: 400 })
simulator_type({ text: "Hello, World!" })
simulator_drag({ fromX: 100, fromY: 200, toX: 300, toY: 400, duration: 1.0 })

// Botões de hardware
simulator_button({ button: "home" })
simulator_rotate({ orientation: "landscape_left" })

// Logs
simulator_logs({ bundleId: "com.example.myapp", lines: 50 })
```

### 5. Estatísticas

- **Total de arquivos TypeScript**: 38
- **Linhas de código**: ~4,200
- **Tools implementadas**: 36
  - Core: 14 (7 file + 3 build + 4 project)
  - Design: 3 (2 design + 1 identity)
  - Research: 4 (2 web + 1 app + 1 inspect)
  - Simulator: 15 (16 tools)
- **Skills**: 1 (UI Design)
- **Prompts**: 3 (Builder, Research, Growth)
- **Design systems**: 8 estilos, 20 paletas

### 6. Próximos passos (Fases 5-8)

| Fase | Status | Descrição |
|------|--------|-----------|
| **5 — Integrations** | 📋 Pendente | Supabase, Superwall, OpenAI, backend tools |
| **6 — Publishing** | 📋 Pendente | App Store assets generator, publishing workflow |
| **7 — Growth Mode** | 📋 Pendente | Social launch kit, content playbook, ASO tools |
| **8 — Polish** | 📋 Pendente | 3 example apps, complete documentation |

### 7. Testando

```bash
cd /Volumes/SSD/Dev/ios-builder-mcp && npm run build && node dist/index.js
```

O servidor responde via stdio MCP com 36 ferramentas registradas. Para testar com um cliente MCP (ex: OpenCode, Claude Code), configure o MCP server apontando para `node dist/index.js` no diretório do projeto.
