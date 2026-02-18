import { createElement } from "react"
import { createRoot } from "react-dom/client"
import { Agentation } from "agentation"

const PREFIX = "__1CODE_INSPECTOR_SELECTED__::"
let root: ReturnType<typeof createRoot> | null = null
let container: HTMLElement | null = null

export function mount() {
  if (container) return

  container = document.createElement("div")
  container.id = "__1code-agentation-root"
  document.body.appendChild(container)

  root = createRoot(container)
  root.render(
    createElement(Agentation, {
      copyToClipboard: true,
      onCopy: (markdown: string) => {
        try {
          console.warn(PREFIX + encodeURIComponent(markdown))
        } catch {}
      },
    }),
  )
}

export function unmount() {
  root?.unmount()
  root = null
  container?.remove()
  container = null
}
