# Fork Changelog

bun run deploy (para auto deploy local)

**Fork:** `guilhermexp/1code`
**Upstream:** `21st-dev/1code`
**Ultimo sync com upstream:** 2026-02-03 (v0.0.54)

---

## ⚠ NAO SOBRESCREVER AO SINCRONIZAR COM UPSTREAM

Estas configuracoes sao criticas do fork e DEVEM ser preservadas manualmente apos qualquer merge com upstream:

### package.json - Build apenas ARM64 (Apple Silicon)
O upstream builda para `arm64` + `x64`. Nosso fork builda **somente arm64** porque usamos Apple Silicon.
Se o upstream sobrescrever, o build vai gerar DMG Intel que roda via Rosetta (muito lento).

```jsonc
// mac.target[].arch → deve ser SOMENTE ["arm64"], nunca ["arm64", "x64"]
// script "release" → deve usar "package:mac:arm64", nunca "package:mac"
```

**Arquivos para checar apos merge:**
- `package.json` → campo `build.mac.target[].arch` (linhas ~185-198)
- `package.json` → script `"release"` (linha ~25)

### src/main/windows/main.ts - Inspector com React Grab v0.1.1+
O upstream pode ter a versao antiga do inspector. Nosso fork suporta ambas APIs (`window.__REACT_GRAB__` + `window.ReactGrab` legacy).
Se sobrescrever, o inspector para de funcionar com React Grab >= v0.1.1.

### src/renderer/features/agents/atoms/index.ts - Preview sidebar sem persistencia
`agentsPreviewSidebarOpenAtom` deve ser `atom<boolean>(false)` (sem persistencia), nao `atomWithWindowStorage`.

---

## 1. Inspector Mode - React Component Detection

**~15 arquivos | ~1200 linhas**

Permite clicar em componentes React no preview para adicionar automaticamente o path do arquivo ao contexto do chat. Integra com React Grab para detectar componentes em dev mode.

**Arquivos:**
- `public/inspector-client.js` - Script client-side do inspector
- `docs/inspector-mode.md` - Documentacao e guia de setup
- `src/main/windows/main.ts` - IPC handler para injetar React Grab no iframe
- `src/renderer/features/agents/ui/agent-preview.tsx` - Botao toggle do inspector e postMessage handling
- `src/renderer/features/agents/ui/inspector-setup-dialog.tsx` - Dialog de setup
- `src/renderer/features/agents/ui/inspector-setup-instructions.tsx` - Instrucoes passo a passo
- `src/renderer/features/agents/ui/component-context-badge.tsx` - Badge visual dos componentes selecionados
- `src/renderer/features/agents/mentions/agents-mentions-editor.tsx` - Tipo `component:` nos mentions
- `src/renderer/features/agents/main/active-chat.tsx` - Handling dos eventos de componente

**Como funciona:**
1. Injeta React Grab no iframe do preview via main process
2. Usuario passa o mouse sobre componentes React e pressiona Cmd+C
3. Info do componente (nome, path, linha, coluna) enviada via postMessage
4. Adiciona automaticamente como mention no chat: `@[component:ButtonName:src/components/Button.tsx:45:10]`

**Limitacao:** Funciona apenas em dev mode com React apps que tenham source maps.

### Fixes aplicados (2026-02-04):

**Compatibilidade com React Grab v0.1.1+:**
- API global mudou de `window.ReactGrab` para `window.__REACT_GRAB__` (auto-inicializada)
- Deteccao agora suporta ambas as APIs (nova + legacy) com fallback por polling e evento `react-grab:init`
- `handleCopySuccess` usa `...args` com extracao defensiva de conteudo string (assinatura do callback mudou entre versoes)
- `postMessage` protegido com `JSON.parse(JSON.stringify(...))` + `try/catch` para evitar `DataCloneError` com DOM nodes

**Inspector overlay acima de modais:**
- CSS override injeta `z-index: 2147483647 !important` em todos elementos do React Grab
- MutationObserver forca z-index em elementos overlay criados dinamicamente
- Toolbar do React Grab mantida visivel (controle de ativacao/desativacao inline)

---

## 2. Internacionalizacao (i18n)

**~30 arquivos | ~800 linhas**

Sistema completo de internacionalizacao com suporte a English e Portugues (pt-BR).

**Arquivos:**
- `src/renderer/i18n/index.ts` - Configuracao i18next
- `src/renderer/contexts/I18nProvider.tsx` - React provider com integracao Jotai
- `src/renderer/i18n/locales/en/*.json` - Traducoes em ingles (12 namespaces)
- `src/renderer/i18n/locales/pt-BR/*.json` - Traducoes em portugues (12 namespaces)
- `src/renderer/components/dialogs/settings-tabs/agents-language-tab.tsx` - Aba de idioma nos settings
- `src/renderer/lib/atoms/index.ts` - Atom de preferencia de idioma com localStorage
- `src/renderer/App.tsx` - Provider wrapper
- `src/renderer/main.tsx` - Inicializacao do i18n

**Namespaces:** common, sidebar, settings, chat, commands, onboarding, terminal, preview, diff, changes, toast, validation

**Dependencias adicionadas:** i18next, i18next-browser-languagedetector, react-i18next

---

## 3. Preview Panel - Melhorias

**~5 arquivos | ~600 linhas**

### 3a. Custom URL
- Permite abrir qualquer URL no preview, nao apenas CodeSandbox
- URL input alterna entre modo path-only e URL completa

### 3b. Hard Refresh com Cache Busting
- IPC handler `cache:clear` para limpar cache da sessao Electron
- Botao de hard refresh adiciona query param de cache bust no iframe

### 3c. Navegacao Browser-Style
- Botoes back/forward com historico de navegacao
- Dropdown de historico de URLs na barra de endereco
- Historico armazenado em Jotai atoms com persistencia

### 3d. Deteccao de Links Localhost no Markdown
- Detecta URLs localhost em mensagens do assistente (localhost, 127.0.0.1, portas)
- Clicar em links localhost abre no preview ao inves do browser externo
- Indicador visual (icone de olho) ao lado de URLs previsualizaveis

**Arquivos:**
- `src/renderer/features/agents/ui/agent-preview.tsx`
- `src/renderer/features/agents/ui/preview-url-input.tsx`
- `src/renderer/components/chat-markdown-renderer.tsx`
- `src/main/windows/main.ts`

---

## 4. External Editor - Fix de Confiabilidade

**1 arquivo | ~20 linhas**

Adicionado `commandExists()` usando `which`/`where` para verificar se o editor esta instalado antes de tentar spawnar o processo. Previne erros ao tentar editores inexistentes.

**Arquivo:** `src/main/lib/trpc/routers/external.ts`

**Ordem de preferencia:** VS Code > Cursor > Sublime > Atom > default do sistema

---

## 5. Documentacao

**3 arquivos | ~3700 linhas** (em portugues)

- `UI-UX-SYSTEM-DOCUMENTATION.md` - Documentacao completa do sistema UI/UX, tech stack, padroes de componentes, sistema de cores e theming
- `docs/AUTH_FLOWS_DOCUMENTATION.md` - Fluxos de autenticacao (OAuth desktop + Claude Code auth), implementacao com safeStorage, refresh de tokens
- `docs/inspector-mode.md` - Guia de setup e troubleshooting do Inspector Mode

---

## 6. Build Scripts

**1 arquivo**

- `package:mac:arm64` - Build exclusivo para ARM64
- `release:dev` sem reinstall de node_modules para iteracao mais rapida
- Targets `dmg` e `zip` configurados **somente para arm64** (removido x64 do `build.mac.target`)
- Script `release` usa `package:mac:arm64` ao inves de `package:mac` para evitar gerar binarios Intel

**Arquivo:** `package.json`

---

## Resumo

| Feature | Arquivos | Linhas | Impacto |
|---------|----------|--------|---------|
| Inspector Mode | ~15 | ~1200 | Major - Feature nova |
| i18n | ~30 | ~800 | Major - UX global |
| Preview Melhorias | ~5 | ~600 | Medium - UX do preview |
| Documentacao | 3 | ~3700 | Dev reference |
| External Editor Fix | 1 | ~20 | Bug fix |
| Build Scripts | 1 | ~10 | Dev QoL + ARM64 only |

Todas as mudancas sao **aditivas** e nao quebram compatibilidade com o upstream.
## 2026-02-06T16:22:41Z

- Branch: main
- HEAD: 799c7c2
- Upstream base: upstream/main
- Private commits: 43
- Commit list:
  - 799c7c2 Sync fork with upstream safely
  - 7c17ef8 Update main.ts
  - 3b474e6 Update fork_changelog.md
  - 761144a Update index.ts
  - 86db81c Update bun.lock
  - c478519 Update fork_changelog.md
  - 806c62c Merge upstream/main (v0.0.51-v0.0.54) preserving local changes
  - 3df8be3 .
  - 834c16c deply
  - 5a9dee1 Merge upstream/main (v0.0.49-v0.0.50) preserving local changes
  - df1bb4d Update bun.lock
  - 9eccf5d Merge upstream/main (v0.0.45-v0.0.48)
  - ac96957 Update new-chat-form.tsx
  - 376a9bf Update external.ts
  - 3ad2c7f Update package.json
  - a93d882 Delete bun.lockb
  - 50bb240 Update active-chat.tsx
  - 24aaf27 Update resizable-sidebar.tsx
  - 6a7bc25 Update claude-login-modal.tsx
  - ebd6424 upstrem fetch 25/01
  - 5068f3a Update bun.lock
  - 59e4ede Merge upstream v0.0.33-v0.0.44: Worktree names, branch selection, MCP OAuth, slash commands fixes
  - 2d0df14 Add cache clearing, project action buttons, and update clone path
  - aca03c0 Close search popover on sub-chat selection
  - 3a5a44e ``` Improve preview iframe CSP and add URL history
  - 2075747 Merge upstream v0.0.30-v0.0.32: Custom commands, Offline Mode, MCP Auth
  - faa4c9c fix: Restaura importação de previewCustomUrlAtomFamily
  - bb9e4d9 Merge upstream updates from 21st-dev/1code
  - 3adcea4 feat: Improve Inspector Mode injection and preview functionality
  - 7efba20 fix: Inject inspector via DOM instead of webContents
  - 74853c0 feat: Auto-inject Inspector Mode using Electron privileges
  - d0ed4f5 refactor: Simplify Inspector Mode to plugin-only approach
  - 88d735f feat: Add Inspector Mode for React component detection in preview
  - 909ff45 fix: Allow localhost URLs in preview iframe by updating CSP
  - dc21190 fix: Prevent preview sidebar from auto-closing
  - 2bf7356 feat: Add always-visible preview button in toolbar
  - e433f94 fix: Resolve React DOM and Motion deprecation warnings
  - a839b55 fix: Prevent ReadableStream enqueue on closed controller
  - e4bc430 fix: Add missing selectedLanguageAtom export after merge
  - 48c3c24 Merge upstream v0.0.24 - Add GitHub clone feature, search, keep-alive tabs
  - 29caca6 Create UI-UX-SYSTEM-DOCUMENTATION.md
  - a9765e6 Add localhost URL click-to-preview in chat messages
  - b0a4840 initfork.

## 2026-02-08T21:15:25Z

- Branch: main
- HEAD: 0564369
- Upstream base: upstream/main
- Previous synced upstream commit (from changelog): not-found
- Target upstream commit for this run: 0d773a1
- Private commits: 49
- Commit list:
  - 0564369 Fix static server binding to localhost
  - 6a20194 feat: Capture console logs from preview iframe
  - 66e6cce Fix preview login in production by serving renderer via HTTP
  - 196da50 Corrige captura Reactgrab nos pré-⁠
  - 3b660b6 Fix reactgrab preview path capture
  - 4a291a1 chore(sync): merge upstream/main preserving local customizations
  - 799c7c2 Sync fork with upstream safely
  - 7c17ef8 Update main.ts
  - 3b474e6 Update fork_changelog.md
  - 761144a Update index.ts
  - 86db81c Update bun.lock
  - c478519 Update fork_changelog.md
  - 806c62c Merge upstream/main (v0.0.51-v0.0.54) preserving local changes
  - 3df8be3 .
  - 834c16c deply
  - 5a9dee1 Merge upstream/main (v0.0.49-v0.0.50) preserving local changes
  - df1bb4d Update bun.lock
  - 9eccf5d Merge upstream/main (v0.0.45-v0.0.48)
  - ac96957 Update new-chat-form.tsx
  - 376a9bf Update external.ts
  - 3ad2c7f Update package.json
  - a93d882 Delete bun.lockb
  - 50bb240 Update active-chat.tsx
  - 24aaf27 Update resizable-sidebar.tsx
  - 6a7bc25 Update claude-login-modal.tsx
  - ebd6424 upstrem fetch 25/01
  - 5068f3a Update bun.lock
  - 59e4ede Merge upstream v0.0.33-v0.0.44: Worktree names, branch selection, MCP OAuth, slash commands fixes
  - 2d0df14 Add cache clearing, project action buttons, and update clone path
  - aca03c0 Close search popover on sub-chat selection
  - 3a5a44e ``` Improve preview iframe CSP and add URL history
  - 2075747 Merge upstream v0.0.30-v0.0.32: Custom commands, Offline Mode, MCP Auth
  - faa4c9c fix: Restaura importação de previewCustomUrlAtomFamily
  - bb9e4d9 Merge upstream updates from 21st-dev/1code
  - 3adcea4 feat: Improve Inspector Mode injection and preview functionality
  - 7efba20 fix: Inject inspector via DOM instead of webContents
  - 74853c0 feat: Auto-inject Inspector Mode using Electron privileges
  - d0ed4f5 refactor: Simplify Inspector Mode to plugin-only approach
  - 88d735f feat: Add Inspector Mode for React component detection in preview
  - 909ff45 fix: Allow localhost URLs in preview iframe by updating CSP
  - dc21190 fix: Prevent preview sidebar from auto-closing
  - 2bf7356 feat: Add always-visible preview button in toolbar
  - e433f94 fix: Resolve React DOM and Motion deprecation warnings
  - a839b55 fix: Prevent ReadableStream enqueue on closed controller
  - e4bc430 fix: Add missing selectedLanguageAtom export after merge
  - 48c3c24 Merge upstream v0.0.24 - Add GitHub clone feature, search, keep-alive tabs
  - 29caca6 Create UI-UX-SYSTEM-DOCUMENTATION.md
  - a9765e6 Add localhost URL click-to-preview in chat messages
  - b0a4840 initfork.

- Sync result: merged
- Last synced upstream commit: 0d773a1

## 2026-02-08T21:16:10Z

- Branch: main
- HEAD: df1aff2
- Upstream base: upstream/main
- Previous synced upstream commit (from changelog): 0d773a1
- Target upstream commit for this run: 0d773a1
- Private commits: 50
- Commit list:
  - df1aff2 chore(sync): merge upstream/main preserving local customizations
  - 0564369 Fix static server binding to localhost
  - 6a20194 feat: Capture console logs from preview iframe
  - 66e6cce Fix preview login in production by serving renderer via HTTP
  - 196da50 Corrige captura Reactgrab nos pré-⁠
  - 3b660b6 Fix reactgrab preview path capture
  - 4a291a1 chore(sync): merge upstream/main preserving local customizations
  - 799c7c2 Sync fork with upstream safely
  - 7c17ef8 Update main.ts
  - 3b474e6 Update fork_changelog.md
  - 761144a Update index.ts
  - 86db81c Update bun.lock
  - c478519 Update fork_changelog.md
  - 806c62c Merge upstream/main (v0.0.51-v0.0.54) preserving local changes
  - 3df8be3 .
  - 834c16c deply
  - 5a9dee1 Merge upstream/main (v0.0.49-v0.0.50) preserving local changes
  - df1bb4d Update bun.lock
  - 9eccf5d Merge upstream/main (v0.0.45-v0.0.48)
  - ac96957 Update new-chat-form.tsx
  - 376a9bf Update external.ts
  - 3ad2c7f Update package.json
  - a93d882 Delete bun.lockb
  - 50bb240 Update active-chat.tsx
  - 24aaf27 Update resizable-sidebar.tsx
  - 6a7bc25 Update claude-login-modal.tsx
  - ebd6424 upstrem fetch 25/01
  - 5068f3a Update bun.lock
  - 59e4ede Merge upstream v0.0.33-v0.0.44: Worktree names, branch selection, MCP OAuth, slash commands fixes
  - 2d0df14 Add cache clearing, project action buttons, and update clone path
  - aca03c0 Close search popover on sub-chat selection
  - 3a5a44e ``` Improve preview iframe CSP and add URL history
  - 2075747 Merge upstream v0.0.30-v0.0.32: Custom commands, Offline Mode, MCP Auth
  - faa4c9c fix: Restaura importação de previewCustomUrlAtomFamily
  - bb9e4d9 Merge upstream updates from 21st-dev/1code
  - 3adcea4 feat: Improve Inspector Mode injection and preview functionality
  - 7efba20 fix: Inject inspector via DOM instead of webContents
  - 74853c0 feat: Auto-inject Inspector Mode using Electron privileges
  - d0ed4f5 refactor: Simplify Inspector Mode to plugin-only approach
  - 88d735f feat: Add Inspector Mode for React component detection in preview
  - 909ff45 fix: Allow localhost URLs in preview iframe by updating CSP
  - dc21190 fix: Prevent preview sidebar from auto-closing
  - 2bf7356 feat: Add always-visible preview button in toolbar
  - e433f94 fix: Resolve React DOM and Motion deprecation warnings
  - a839b55 fix: Prevent ReadableStream enqueue on closed controller
  - e4bc430 fix: Add missing selectedLanguageAtom export after merge
  - 48c3c24 Merge upstream v0.0.24 - Add GitHub clone feature, search, keep-alive tabs
  - 29caca6 Create UI-UX-SYSTEM-DOCUMENTATION.md
  - a9765e6 Add localhost URL click-to-preview in chat messages
  - b0a4840 initfork.

- Sync result: no-upstream-updates
- Last synced upstream commit: 0d773a1

## 2026-02-08T21:16:33Z

- Branch: main
- HEAD: df1aff2
- Upstream base: upstream/main
- Previous synced upstream commit (from changelog): 0d773a1
- Target upstream commit for this run: 0d773a1
- Private commits: 50
- Commit list:
  - df1aff2 chore(sync): merge upstream/main preserving local customizations
  - 0564369 Fix static server binding to localhost
  - 6a20194 feat: Capture console logs from preview iframe
  - 66e6cce Fix preview login in production by serving renderer via HTTP
  - 196da50 Corrige captura Reactgrab nos pré-⁠
  - 3b660b6 Fix reactgrab preview path capture
  - 4a291a1 chore(sync): merge upstream/main preserving local customizations
  - 799c7c2 Sync fork with upstream safely
  - 7c17ef8 Update main.ts
  - 3b474e6 Update fork_changelog.md
  - 761144a Update index.ts
  - 86db81c Update bun.lock
  - c478519 Update fork_changelog.md
  - 806c62c Merge upstream/main (v0.0.51-v0.0.54) preserving local changes
  - 3df8be3 .
  - 834c16c deply
  - 5a9dee1 Merge upstream/main (v0.0.49-v0.0.50) preserving local changes
  - df1bb4d Update bun.lock
  - 9eccf5d Merge upstream/main (v0.0.45-v0.0.48)
  - ac96957 Update new-chat-form.tsx
  - 376a9bf Update external.ts
  - 3ad2c7f Update package.json
  - a93d882 Delete bun.lockb
  - 50bb240 Update active-chat.tsx
  - 24aaf27 Update resizable-sidebar.tsx
  - 6a7bc25 Update claude-login-modal.tsx
  - ebd6424 upstrem fetch 25/01
  - 5068f3a Update bun.lock
  - 59e4ede Merge upstream v0.0.33-v0.0.44: Worktree names, branch selection, MCP OAuth, slash commands fixes
  - 2d0df14 Add cache clearing, project action buttons, and update clone path
  - aca03c0 Close search popover on sub-chat selection
  - 3a5a44e ``` Improve preview iframe CSP and add URL history
  - 2075747 Merge upstream v0.0.30-v0.0.32: Custom commands, Offline Mode, MCP Auth
  - faa4c9c fix: Restaura importação de previewCustomUrlAtomFamily
  - bb9e4d9 Merge upstream updates from 21st-dev/1code
  - 3adcea4 feat: Improve Inspector Mode injection and preview functionality
  - 7efba20 fix: Inject inspector via DOM instead of webContents
  - 74853c0 feat: Auto-inject Inspector Mode using Electron privileges
  - d0ed4f5 refactor: Simplify Inspector Mode to plugin-only approach
  - 88d735f feat: Add Inspector Mode for React component detection in preview
  - 909ff45 fix: Allow localhost URLs in preview iframe by updating CSP
  - dc21190 fix: Prevent preview sidebar from auto-closing
  - 2bf7356 feat: Add always-visible preview button in toolbar
  - e433f94 fix: Resolve React DOM and Motion deprecation warnings
  - a839b55 fix: Prevent ReadableStream enqueue on closed controller
  - e4bc430 fix: Add missing selectedLanguageAtom export after merge
  - 48c3c24 Merge upstream v0.0.24 - Add GitHub clone feature, search, keep-alive tabs
  - 29caca6 Create UI-UX-SYSTEM-DOCUMENTATION.md
  - a9765e6 Add localhost URL click-to-preview in chat messages
  - b0a4840 initfork.

- Sync result: no-upstream-updates
- Last synced upstream commit: 0d773a1

