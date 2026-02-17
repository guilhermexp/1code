# Documentação Completa do Front-end do Agente (1Code)

## Objetivo
Este documento mapeia todo o front-end do agente para você replicar a mesma UI/UX em outros aplicativos com o mínimo de retrabalho.

## 1. Stack Front-end Atual

### Base
- React `19.2.1`
- React DOM `19.2.1`
- TypeScript `^5.4.5`
- Vite `^6.3.4`

### UI e Styling
- Tailwind CSS `^3.4.17`
- Radix UI (`accordion`, `dialog`, `dropdown-menu`, `tooltip`, `tabs`, etc.)
- `class-variance-authority` + `clsx` + `tailwind-merge`
- `tailwindcss-animate`
- `motion` (animações)
- `sonner` (toasts)

### Estado e dados
- Jotai (estado global + persistência)
- Zustand (stores focadas em fluxo intenso, ex.: subchats/streaming)
- TanStack React Query
- tRPC (`trpc-electron`) com `superjson`

### Recursos de UI específicos
- `@monaco-editor/react`
- `@git-diff-view/react`
- `xterm` + addons
- `streamdown` (markdown streaming)
- `i18next` + `react-i18next`

Fonte principal: `package.json`.

## 2. Estrutura Front-end (Renderer)

Raiz do front-end:
- `src/renderer`

Estrutura funcional:
- `src/renderer/components/ui`: design system base reutilizável (36 componentes)
- `src/renderer/components/dialogs`: modais e abas de settings
- `src/renderer/features`: domínios de produto (13 blocos)
- `src/renderer/contexts`: providers globais (tRPC, i18n, window)
- `src/renderer/lib`: atoms, hooks, tema, utilitários, integração API
- `src/renderer/styles`: CSS global + ajustes específicos do agente
- `src/renderer/i18n`: internacionalização (`en`, `pt-BR`)

Features mapeadas:
- `agents`
- `automations`
- `changes`
- `details-sidebar`
- `file-viewer`
- `kanban`
- `layout`
- `mentions`
- `onboarding`
- `settings`
- `sidebar`
- `terminal`

## 3. Fluxo de Inicialização da UI

Entrada:
1. `src/renderer/main.tsx`
2. `src/renderer/App.tsx`

Ordem de providers em `App.tsx`:
1. `WindowProvider`
2. `JotaiProvider`
3. `I18nProvider`
4. `ThemeProvider` (`next-themes`)
5. `VSCodeThemeProvider`
6. `TooltipProvider`
7. `TRPCProvider`

Roteamento principal via estado (sem React Router):
- Se onboarding incompleto: páginas de onboarding
- Se projeto não selecionado: `SelectRepoPage`
- Caso contrário: `AgentsLayout`

## 4. Arquitetura de Layout (UI Shell)

### Shell principal
`src/renderer/features/layout/agents-layout.tsx`:
- Janela em coluna (`titlebar` + conteúdo)
- Sidebar esquerda redimensionável (`ResizableSidebar`)
- Conteúdo principal (`AgentsContent`)
- Banner de atualização
- Modais de login globais

### Layout interno do conteúdo
`src/renderer/features/agents/ui/agents-content.tsx` controla:
- Troca de “desktop views” (`settings`, `automations`, `inbox`, chat)
- Comportamento desktop vs mobile
- Sidebars secundárias (subchats, preview, terminal, details)
- Seleção de chat/subchat e sincronização de estado

### Área de chat
`src/renderer/features/agents/main/active-chat.tsx` concentra:
- Mensagens
- Input multimodal (`PromptInput`, anexos, menções, comandos)
- Diff/changes/file viewer/plan sidebar/terminal/details
- Conflitos e coordenação entre painéis abertos

## 5. Design System (Base Reutilizável)

Pasta: `src/renderer/components/ui`

Componentes-base mapeados:
- Inputs: `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`
- Ações: `button.tsx`, `split-button.tsx`, `button-group.tsx`
- Overlays: `dialog.tsx`, `alert-dialog.tsx`, `popover.tsx`, `hover-card.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`
- Navegação/conteúdo: `tabs.tsx`, `accordion.tsx`, `collapsible.tsx`, `command.tsx`
- Feedback: `badge.tsx`, `progress.tsx`, `skeleton.tsx`
- Utilitários: `kbd.tsx`, `network-status.tsx`, `prompt-input.tsx`, `resizable-sidebar.tsx`, `resizable-bottom-panel.tsx`

Padrão de implementação:
- Radix primitives + Tailwind classes
- Variantes com CVA (ex.: `button.tsx`)
- Composição por subcomponentes (ex.: `PromptInput`, `Dialog`)

## 6. Sistema de Tokens e Tema

### Tokens base
Arquivo: `src/renderer/styles/globals.css`
- Tokens em HSL: `--background`, `--foreground`, `--primary`, `--muted`, `--border`, etc.
- Modo claro/escuro com classe `.dark`
- Tokens adicionais do produto: `--tl-background`, `--input-background`, `--plan-mode`

### Mapeamento Tailwind
Arquivo: `tailwind.config.js`
- Cores do Tailwind mapeadas para CSS vars (`hsl(var(--...))`)
- `darkMode: "class"`

### Tema avançado estilo VS Code
Arquivos:
- `src/renderer/lib/themes/theme-provider.tsx`
- `src/renderer/lib/themes/vscode-to-css-mapping.ts`
- `src/renderer/lib/themes/builtin-themes.ts`

Como funciona:
1. Tema selecionado (builtin/importado)
2. Mapeamento de cores VS Code para CSS variables
3. Aplicação dinâmica de vars no `documentElement`
4. Sincronização com `next-themes`
5. Extração de tema de terminal e fallback de Shiki

Tema padrão:
- Light: `21st-light`
- Dark: `21st-dark`

## 7. Estado: Padrão Exato do Projeto

### Jotai (camada principal)
Arquivos:
- `src/renderer/features/agents/atoms/index.ts`
- `src/renderer/lib/atoms/index.ts`
- `src/renderer/lib/window-storage.ts`

Padrões usados:
- `atomWithStorage`: preferências globais persistidas
- `atomWithWindowStorage`: estado por janela Electron (chat/projeto/sidebar)
- `atomFamily`: estado por contexto (`chatId`, `subChatId`)

### Zustand (hot paths)
Exemplos:
- `src/renderer/features/agents/stores/sub-chat-store.ts`
- `src/renderer/features/agents/stores/message-store.ts`
- `src/renderer/features/agents/stores/streaming-status-store.ts`

Uso ideal:
- Estados com alta frequência de atualização e necessidade de performance

### Server state
- React Query no provider global
- tRPC tipado para queries/mutations
- Config padrão em `TRPCProvider`: sem retry, sem refetch agressivo em foco

## 8. i18n

Arquivos:
- `src/renderer/i18n/index.ts`
- `src/renderer/contexts/I18nProvider.tsx`

Padrão:
- Namespaces por domínio (`chat`, `sidebar`, `settings`, etc.)
- Idiomas: `en` e `pt-BR`
- Persistência em `localStorage` (`preferences:language`)

## 9. Padrões de UX da Aplicação

Padrões fortes que valem replicar:
- Interface de três zonas: navegação esquerda + conteúdo central + painéis contextuais à direita
- Sidebars redimensionáveis persistidas
- Atalhos de teclado extensivos e customizáveis
- Navegação e modo mobile dedicados (não só CSS responsivo)
- Feedback contínuo com toasts neutros e indicadores visuais de estado
- Composição de widgets no details sidebar (info/todo/plan/terminal/diff/mcp)

## 10. Como Replicar em Outro App (Blueprint)

### Etapa A: Base de design system
1. Copiar `tailwind.config.js` (com mapeamento de tokens)
2. Copiar `src/renderer/styles/globals.css`
3. Copiar `src/renderer/components/ui/*`
4. Copiar `src/renderer/lib/utils.ts` (`cn`)

### Etapa B: Providers globais
1. Montar árvore de providers igual à de `App.tsx`
2. Reaproveitar `TRPCProvider`, `I18nProvider`, `ThemeProvider` e `VSCodeThemeProvider`

### Etapa C: Layout base
1. Implementar shell igual ao `AgentsLayout`
2. Sidebar esquerda redimensionável
3. Main area com troca de view por estado
4. Painel direito contextual (details/terminal/file viewer)

### Etapa D: Estado
1. Separar átomos globais e por janela
2. Usar `atomFamily` para estados por chat/subchat
3. Deixar fluxos intensivos em Zustand

### Etapa E: Tema avançado
1. Reusar mapeamento VS Code -> CSS vars
2. Incluir temas builtin
3. Garantir fallback claro/escuro

## 11. Arquivos Críticos para “Clone Fiel”

### Mínimo obrigatório
- `tailwind.config.js`
- `src/renderer/styles/globals.css`
- `src/renderer/styles/agents-styles.css`
- `src/renderer/components/ui/*`
- `src/renderer/App.tsx`
- `src/renderer/features/layout/agents-layout.tsx`
- `src/renderer/features/agents/ui/agents-content.tsx`
- `src/renderer/features/agents/main/active-chat.tsx`
- `src/renderer/lib/atoms/index.ts`
- `src/renderer/features/agents/atoms/index.ts`
- `src/renderer/lib/window-storage.ts`
- `src/renderer/lib/themes/*`
- `src/renderer/contexts/TRPCProvider.tsx`
- `src/renderer/contexts/I18nProvider.tsx`
- `src/renderer/i18n/*`

## 12. Checklist de Replicação

- [ ] Tokens CSS copiados e funcionando
- [ ] `darkMode: class` ativo
- [ ] Componentes Radix + CVA funcionando
- [ ] Provider stack montado na mesma ordem
- [ ] Layout com sidebars redimensionáveis
- [ ] Estado com Jotai persistente + window-scoped
- [ ] Fluxos de chat e painéis desacoplados por feature
- [ ] Tema VS Code aplicando variáveis dinamicamente
- [ ] i18n com namespaces por domínio
- [ ] Atalhos e feedback visual (toasts/tooltips) implementados

## 13. Inventário Atual (para referência)

- Componentes em `src/renderer/components/ui`: **36**
- Diretórios de features em `src/renderer/features`: **13**
- Arquivos `.tsx` em `src/renderer/features`: **157**
- Arquivos `.tsx` no renderer inteiro: **233**

## 14. Inventário Completo de Componentes UI

Pasta: `src/renderer/components/ui`

- `accordion.tsx`
- `alert-dialog.tsx`
- `badge.tsx`
- `button-group.tsx`
- `button.tsx`
- `canvas-icons.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `command.tsx`
- `context-menu.tsx`
- `dialog.tsx`
- `dropdown-menu.tsx`
- `error-boundary.tsx`
- `hover-card.tsx`
- `icons.tsx`
- `input.tsx`
- `kbd.tsx`
- `label.tsx`
- `logo.tsx`
- `network-status.tsx`
- `popover.tsx`
- `progress.tsx`
- `project-icon.tsx`
- `prompt-input.tsx`
- `resizable-bottom-panel.tsx`
- `resizable-sidebar.tsx`
- `search-combobox.tsx`
- `select.tsx`
- `skeleton.tsx`
- `split-button.tsx`
- `switch.tsx`
- `tabs.tsx`
- `text-shimmer.tsx`
- `textarea.tsx`
- `tooltip.tsx`
- `typewriter-text.tsx`

## 15. Inventário Completo de Módulos-Chave

### Features raiz
- `src/renderer/features/agents`
- `src/renderer/features/automations`
- `src/renderer/features/changes`
- `src/renderer/features/details-sidebar`
- `src/renderer/features/file-viewer`
- `src/renderer/features/hooks`
- `src/renderer/features/kanban`
- `src/renderer/features/layout`
- `src/renderer/features/mentions`
- `src/renderer/features/onboarding`
- `src/renderer/features/settings`
- `src/renderer/features/sidebar`
- `src/renderer/features/terminal`

### Settings tabs
Pasta: `src/renderer/components/dialogs/settings-tabs`

- `agent-dialog.tsx`
- `agents-appearance-tab.tsx`
- `agents-beta-tab.tsx`
- `agents-custom-agents-tab.tsx`
- `agents-debug-tab.tsx`
- `agents-keyboard-tab.tsx`
- `agents-language-tab.tsx`
- `agents-mcp-tab.tsx`
- `agents-models-tab.tsx`
- `agents-plugins-tab.tsx`
- `agents-preferences-tab.tsx`
- `agents-profile-tab.tsx`
- `agents-project-worktree-tab.tsx`
- `agents-skills-tab.tsx`
- `agents-worktrees-tab.tsx`
- `tool-selector.tsx`

### Módulos de tema
Pasta: `src/renderer/lib/themes`

- `builtin-themes.ts`
- `cursor-themes.ts`
- `diff-view-highlighter.ts`
- `index.ts`
- `shiki-theme-loader.ts`
- `terminal-theme-mapper.ts`
- `theme-provider.tsx`
- `vscode-to-css-mapping.ts`

---

## Observação importante
O projeto já possui duas documentações extensas e complementares:
- `UI-UX-SYSTEM-DOCUMENTATION.md`
- `1CODE-THEMES-COMPLETE.md`

Este documento novo é o **mapa arquitetural prático de replicação**, alinhado ao estado atual do código.
