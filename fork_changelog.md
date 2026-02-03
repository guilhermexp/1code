# Fork Changelog

bun run deploy (para auto deploy local)

**Fork:** `guilhermexp/1code`
**Upstream:** `21st-dev/1code`
**Ultimo sync com upstream:** 2026-02-03 (v0.0.54)

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
| Build Scripts | 1 | ~2 | Dev QoL |

Todas as mudancas sao **aditivas** e nao quebram compatibilidade com o upstream.
