# Inspector Mode - Element Annotation with Agentation

Inspector Mode lets you annotate elements in the preview and add them as context to your chat with Claude.

## How to Use

1. Open the preview in 1code
2. Click the **Inspector** button (cursor icon) in the preview toolbar
3. Click on any element in the preview to annotate it
4. Add a comment describing what you want changed
5. Copy the annotation - it will be added to your chat context
6. Ask Claude to make changes based on the annotation

## How It Works

1. **Agentation** is bundled as an IIFE and injected into the webview when inspector is toggled on
2. The bundle includes its own React instance, so it works on any website (React or not)
3. When you copy an annotation, it emits the markdown via `console.warn` with the `__1CODE_INSPECTOR_SELECTED__::` prefix
4. The `console-message` listener in `agent-preview.tsx` captures it
5. A `CustomEvent` dispatches the annotation to the chat input
6. Clipboard polling serves as a backup detection method

## Architecture

```
User clicks Inspector button
  → Agentation IIFE bundle injected via executeJavaScript()
  → __1CodeAgentation.mount() renders <Agentation /> in webview
  → User annotates elements
  → onCopy callback → console.warn("__1CODE_INSPECTOR_SELECTED__::" + markdown)
  → console-message listener captures and dispatches to chat
  → User disables → __1CodeAgentation.unmount() cleans up
```

## Build

The Agentation bundle is built as a pre-step:

```bash
bun run build:inspector
```

This runs esbuild to create `src/renderer/assets/agentation-bundle.min.js` (IIFE, ~350KB minified, includes React 19 + Agentation).

The bundle is loaded lazily via `?raw` import and injected into the webview only when inspector is enabled.

## Optional: Direct Installation

For richer integration, users can install Agentation directly in their project:

```bash
npm install agentation -D
```

```tsx
import { Agentation } from 'agentation'

function App() {
  return (
    <>
      <YourApp />
      <Agentation />
    </>
  )
}
```

Learn more at [agentation.dev](https://agentation.dev).

## Key Files

| File | Purpose |
|------|---------|
| `src/inspector/agentation-entry.tsx` | IIFE entry point (mount/unmount) |
| `src/renderer/assets/agentation-bundle.min.js` | Built IIFE bundle (generated) |
| `src/renderer/features/agents/ui/agent-preview.tsx` | Injection logic, console listener |
| `src/renderer/features/agents/ui/component-context-badge.tsx` | Annotation badge in chat |
| `src/renderer/features/agents/ui/inspector-setup-dialog.tsx` | Optional setup dialog |
