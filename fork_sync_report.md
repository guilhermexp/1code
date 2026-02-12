# Fork Sync Report

## Execution
- Timestamp (UTC): 2026-02-12T03:06:47Z
- Repository: /Users/guilhermevarela/Documents/Projetos/1code
- Branch: main
- Head before: 6ab0ee9
- Head after: 14cc7e3
- Upstream base: upstream/main
- Upstream head synced: aad4b92
- Previous synced upstream commit (from changelog): 0d773a1
- Merge status: merged
- Working tree: dirty

## Current Situation
- Private commits vs upstream: 60
- Upstream commits detected: 4
- Upstream files changed: 51
- Conflicts auto-resolved with local priority: 0
- Protected path files reapplied from local HEAD: 0

## New From Upstream
- aad4b92 Release v0.0.60-beta.4
- 09a6880 Release v0.0.60-beta.3
- 8c86d39 Release v0.0.60-beta.2
- a2b0184 Release v0.0.60-beta.1
- Files touched by upstream commits (sample):
  - bun.lock
  - bun.lockb
  - package.json
  - src/main/lib/claude/transform.ts
  - src/main/lib/claude/types.ts
  - src/main/lib/fs/dirent.ts
  - src/main/lib/plugins/index.ts
  - src/main/lib/trpc/routers/agent-utils.ts
  - src/main/lib/trpc/routers/commands.ts
  - src/main/lib/trpc/routers/plugins.ts
  - src/main/lib/trpc/routers/skills.ts
  - src/main/windows/main.ts
  - src/preload/index.ts
  - src/renderer/App.tsx
  - src/renderer/components/dialogs/settings-tabs/agents-beta-tab.tsx
  - src/renderer/components/dialogs/settings-tabs/agents-preferences-tab.tsx
  - src/renderer/contexts/WindowContext.tsx
  - src/renderer/features/agents/atoms/index.ts
  - src/renderer/features/agents/components/agents-help-popover.tsx
  - src/renderer/features/agents/hooks/use-desktop-notifications.ts
  - src/renderer/features/agents/lib/agents-hotkeys-manager.ts
  - src/renderer/features/agents/lib/queue-utils.ts
  - src/renderer/features/agents/main/active-chat.tsx
  - src/renderer/features/agents/main/assistant-message-item.tsx
  - src/renderer/features/agents/main/chat-input-area.tsx
  - src/renderer/features/agents/main/chat-render-flags.ts
  - src/renderer/features/agents/main/isolated-message-group.tsx
  - src/renderer/features/agents/main/isolated-messages-section.tsx
  - src/renderer/features/agents/main/messages-list.tsx
  - src/renderer/features/agents/main/new-chat-form.tsx
  - src/renderer/features/agents/mentions/render-file-mentions.tsx
  - src/renderer/features/agents/stores/message-store.ts
  - src/renderer/features/agents/stores/sub-chat-store.ts
  - src/renderer/features/agents/ui/agent-context-indicator.tsx
  - src/renderer/features/agents/ui/agent-diff-text-context-item.tsx
  - src/renderer/features/agents/ui/agent-file-item.tsx
  - src/renderer/features/agents/ui/agent-image-item.tsx
  - src/renderer/features/agents/ui/agent-pasted-text-item.tsx
  - src/renderer/features/agents/ui/agent-plan-sidebar.tsx
  - src/renderer/features/agents/ui/agent-queue-indicator.tsx
  - src/renderer/features/agents/ui/agent-text-context-item.tsx
  - src/renderer/features/agents/ui/agent-user-message-bubble.tsx
  - src/renderer/features/agents/ui/git-activity-badges.tsx
  - src/renderer/features/agents/ui/split-view-container.tsx
  - src/renderer/features/agents/ui/sub-chat-context-menu.tsx
  - src/renderer/features/agents/ui/sub-chat-selector.tsx
  - src/renderer/features/agents/utils/git-activity.ts
  - src/renderer/features/sidebar/agents-subchats-sidebar.tsx
  - src/renderer/lib/atoms/index.ts
  - src/renderer/lib/hotkeys/shortcut-registry.ts
  - src/renderer/lib/hotkeys/types.ts

## Upstream Impact Analysis
- Dependencies/build changed: refresh dependencies and validate install/build pipeline.

## Expected Result
- Atualizacoes do upstream integradas com prioridade local; customizacoes privadas e caminhos protegidos preservados.

## App Test Validation
- Validation plan:
  - bun run ts:check
  - bun run build
- Executed commands:
  - bun run ts:check
- Test status: failed
- Test exit code: 127
- Failed command: bun run ts:check
- Test log file: fork_sync_report.tests.log

### Test Log Tail
    === Validation step 1 ===
    Command: bun run ts:check
    
    $ tsgo --noEmit
    /bin/bash: tsgo: command not found
    error: script "ts:check" exited with code 127

## Origin Publish
- Origin remote: origin
- Push enabled: true
- Push status: skipped-tests-failed
- Push exit code: 0
- Sync before push: unknown
- Sync after push: unknown

