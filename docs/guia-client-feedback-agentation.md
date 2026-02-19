# Guia: Client Feedback Mode com Agentation

> Adicione um modo de feedback visual em qualquer app React. O cliente clica nos elementos, deixa comentarios, e exporta tudo como `.md`.

## Visao Geral

O **Client Feedback Mode** permite que um cliente acesse o site em desenvolvimento com `?feedback=true` na URL e anote visualmente elementos da pagina com comentarios. No final, exporta todas as anotacoes como um arquivo Markdown estruturado.

**Como funciona:**

1. Dev faz deploy do site (staging, preview, localhost)
2. Cliente acessa `https://site.com?feedback=true`
3. Um botao flutuante aparece no canto inferior direito
4. Cliente clica no botao → ativa o modo de anotacao (powered by Agentation)
5. Cliente clica em qualquer elemento → popup para deixar comentario
6. Painel lateral mostra todas as anotacoes
7. Botao "Exportar .md" gera e baixa o arquivo Markdown

**Dependencias:** apenas `agentation` (>=2.2.1) e `react` (>=18).

---

## Instalacao

```bash
npm install agentation
# ou
yarn add agentation
# ou
pnpm add agentation
# ou
bun add agentation
```

---

## Estrutura de Arquivos

Crie os seguintes arquivos dentro do seu projeto:

```
src/
└── feedback/
    ├── use-feedback-enabled.ts    # Hook de ativacao condicional
    ├── generate-markdown.ts       # Geracao do .md + download
    ├── feedback-panel.tsx         # Painel lateral com lista de anotacoes
    ├── client-feedback.tsx        # Componente principal
    └── index.ts                   # Barrel export
```

---

## Codigo Completo

### 1. `use-feedback-enabled.ts`

Hook que determina se o modo feedback esta ativo. Suporta tres formas de ativacao:

- **URL param:** `?feedback=true`
- **Env var:** `NEXT_PUBLIC_FEEDBACK_ENABLED=true` ou `VITE_FEEDBACK_ENABLED=true`
- **Manual:** prop `forceEnable` no componente

```typescript
import { useState, useEffect } from "react"

type FeedbackSource = "url" | "env" | "manual" | null

interface UseFeedbackEnabledOptions {
  /** Forca ativacao independente de URL/env */
  forceEnable?: boolean
  /** Nome do query param (default: "feedback") */
  paramName?: string
}

interface UseFeedbackEnabledReturn {
  /** Se o modo feedback esta habilitado */
  isEnabled: boolean
  /** Origem da ativacao */
  source: FeedbackSource
}

export function useFeedbackEnabled(
  options: UseFeedbackEnabledOptions = {}
): UseFeedbackEnabledReturn {
  const { forceEnable = false, paramName = "feedback" } = options
  const [state, setState] = useState<UseFeedbackEnabledReturn>({
    isEnabled: forceEnable,
    source: forceEnable ? "manual" : null,
  })

  useEffect(() => {
    if (forceEnable) {
      setState({ isEnabled: true, source: "manual" })
      return
    }

    // Check URL param
    const params = new URLSearchParams(window.location.search)
    if (params.get(paramName) === "true") {
      setState({ isEnabled: true, source: "url" })
      return
    }

    // Check env vars (Next.js e Vite)
    const envNext =
      typeof process !== "undefined"
        ? (process.env as Record<string, string | undefined>)
            .NEXT_PUBLIC_FEEDBACK_ENABLED
        : undefined
    const envVite = (import.meta as any).env?.VITE_FEEDBACK_ENABLED as
      | string
      | undefined

    if (envNext === "true" || envVite === "true") {
      setState({ isEnabled: true, source: "env" })
      return
    }

    setState({ isEnabled: false, source: null })
  }, [forceEnable, paramName])

  return state
}
```

---

### 2. `generate-markdown.ts`

Gera o Markdown estruturado a partir das anotacoes e dispara o download.

```typescript
interface AnnotationData {
  id: string
  comment: string
  element: string
  elementPath: string
  x: number
  y: number
  timestamp: number
  selectedText?: string
  intent?: "fix" | "change" | "question" | "approve"
  severity?: "blocking" | "important" | "suggestion"
}

interface GenerateMarkdownOptions {
  /** Titulo do documento */
  title?: string
  /** URL da pagina anotada */
  pageUrl?: string
  /** Incluir metadata (timestamps, coordenadas) */
  includeMetadata?: boolean
}

export function generateMarkdown(
  annotations: AnnotationData[],
  options: GenerateMarkdownOptions = {}
): string {
  const {
    title = "Client Feedback",
    pageUrl = window.location.href,
    includeMetadata = true,
  } = options

  const now = new Date()
  const dateStr = now.toISOString().split("T")[0]
  const timeStr = now.toTimeString().split(" ")[0]

  let md = `# ${title}\n\n`
  md += `- **Pagina:** ${pageUrl}\n`
  md += `- **Data:** ${dateStr} ${timeStr}\n`
  md += `- **Total de anotacoes:** ${annotations.length}\n`

  // Summary por severidade
  const blocking = annotations.filter((a) => a.severity === "blocking").length
  const important = annotations.filter(
    (a) => a.severity === "important"
  ).length
  const suggestion = annotations.filter(
    (a) => a.severity === "suggestion"
  ).length

  if (blocking || important || suggestion) {
    md += `- **Blocking:** ${blocking} | **Important:** ${important} | **Suggestion:** ${suggestion}\n`
  }

  md += `\n---\n\n`

  annotations.forEach((annotation, index) => {
    const num = index + 1
    const intentLabel = annotation.intent
      ? ` [${annotation.intent.toUpperCase()}]`
      : ""
    const severityLabel = annotation.severity
      ? ` (${annotation.severity})`
      : ""

    md += `## ${num}. ${annotation.comment}${intentLabel}${severityLabel}\n\n`
    md += `- **Elemento:** \`${annotation.element}\`\n`
    md += `- **Caminho:** \`${annotation.elementPath}\`\n`

    if (annotation.selectedText) {
      md += `- **Texto selecionado:** "${annotation.selectedText}"\n`
    }

    if (includeMetadata) {
      const ts = new Date(annotation.timestamp).toLocaleTimeString()
      md += `- **Hora:** ${ts}\n`
      md += `- **Posicao:** (${Math.round(annotation.x)}, ${Math.round(annotation.y)})\n`
    }

    md += `\n`
  })

  return md
}

export function downloadMarkdown(
  annotations: AnnotationData[],
  options: GenerateMarkdownOptions = {}
): void {
  const md = generateMarkdown(annotations, options)
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `feedback-${dateStr}.md`

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function copyMarkdownToClipboard(
  annotations: AnnotationData[],
  options: GenerateMarkdownOptions = {}
): Promise<void> {
  const md = generateMarkdown(annotations, options)
  return navigator.clipboard.writeText(md)
}
```

---

### 3. `feedback-panel.tsx`

Painel lateral que lista todas as anotacoes com opcoes de exportar e limpar.

```tsx
import React from "react"

interface Annotation {
  id: string
  comment: string
  element: string
  elementPath: string
  x: number
  y: number
  timestamp: number
  selectedText?: string
  intent?: string
  severity?: string
}

interface FeedbackPanelProps {
  annotations: Annotation[]
  onExport: () => void
  onCopy: () => void
  onClear: () => void
  onClose: () => void
  onDeleteAnnotation: (id: string) => void
}

export function FeedbackPanel({
  annotations,
  onExport,
  onCopy,
  onClear,
  onClose,
  onDeleteAnnotation,
}: FeedbackPanelProps) {
  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.title}>
            Feedback ({annotations.length})
          </span>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* List */}
        <div style={styles.list}>
          {annotations.length === 0 ? (
            <p style={styles.empty}>
              Nenhuma anotacao ainda. Clique em elementos da pagina para
              adicionar feedback.
            </p>
          ) : (
            annotations.map((ann, i) => (
              <div key={ann.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardNum}>#{i + 1}</span>
                  <code style={styles.cardElement}>{ann.element}</code>
                  <button
                    onClick={() => onDeleteAnnotation(ann.id)}
                    style={styles.deleteBtn}
                    title="Remover anotacao"
                  >
                    ✕
                  </button>
                </div>
                <p style={styles.cardComment}>{ann.comment}</p>
                {ann.selectedText && (
                  <p style={styles.cardSelected}>
                    &ldquo;{ann.selectedText}&rdquo;
                  </p>
                )}
                <div style={styles.cardMeta}>
                  <code style={styles.cardPath}>{ann.elementPath}</code>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        {annotations.length > 0 && (
          <div style={styles.actions}>
            <button onClick={onExport} style={styles.exportBtn}>
              Exportar .md
            </button>
            <button onClick={onCopy} style={styles.copyBtn}>
              Copiar
            </button>
            <button onClick={onClear} style={styles.clearBtn}>
              Limpar tudo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "380px",
    zIndex: 99998,
    pointerEvents: "auto",
  },
  panel: {
    height: "100%",
    background: "#1a1a2e",
    color: "#e0e0e0",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.3)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #2a2a4a",
    flexShrink: 0,
  },
  title: {
    fontWeight: 700,
    fontSize: "16px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#888",
    fontSize: "18px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px",
  },
  empty: {
    color: "#666",
    textAlign: "center",
    padding: "40px 20px",
    lineHeight: 1.6,
  },
  card: {
    background: "#16213e",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "10px",
    border: "1px solid #2a2a4a",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  cardNum: {
    color: "#7c83ff",
    fontWeight: 700,
    fontSize: "13px",
    flexShrink: 0,
  },
  cardElement: {
    background: "#0f3460",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#a0c4ff",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: "14px",
    padding: "2px 6px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  cardComment: {
    margin: "0 0 6px",
    lineHeight: 1.5,
  },
  cardSelected: {
    margin: "0 0 6px",
    color: "#888",
    fontStyle: "italic",
    fontSize: "13px",
  },
  cardMeta: {
    marginTop: "4px",
  },
  cardPath: {
    fontSize: "11px",
    color: "#555",
    wordBreak: "break-all",
  },
  actions: {
    display: "flex",
    gap: "8px",
    padding: "16px 20px",
    borderTop: "1px solid #2a2a4a",
    flexShrink: 0,
  },
  exportBtn: {
    flex: 1,
    padding: "10px",
    background: "#7c83ff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
  },
  copyBtn: {
    padding: "10px 16px",
    background: "#2a2a4a",
    color: "#e0e0e0",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
  },
  clearBtn: {
    padding: "10px 16px",
    background: "transparent",
    color: "#ff6b6b",
    border: "1px solid #ff6b6b33",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
  },
}
```

---

### 4. `client-feedback.tsx`

Componente principal que orquestra tudo: toggle, contador, painel lateral e Agentation.

```tsx
"use client"

import React, { useState, useCallback, useRef } from "react"
import { Agentation, loadAnnotations, saveAnnotations } from "agentation"
import { useFeedbackEnabled } from "./use-feedback-enabled"
import { downloadMarkdown, copyMarkdownToClipboard } from "./generate-markdown"
import { FeedbackPanel } from "./feedback-panel"

interface Annotation {
  id: string
  comment: string
  element: string
  elementPath: string
  x: number
  y: number
  timestamp: number
  selectedText?: string
  intent?: "fix" | "change" | "question" | "approve"
  severity?: "blocking" | "important" | "suggestion"
}

interface ClientFeedbackProps {
  /** Forca ativacao (ignora URL param / env var) */
  forceEnable?: boolean
  /** Nome do query param (default: "feedback") */
  paramName?: string
  /** Titulo no markdown exportado */
  title?: string
  /** Incluir metadata (timestamps, coordenadas) no export */
  includeMetadata?: boolean
}

export function ClientFeedback({
  forceEnable,
  paramName,
  title = "Client Feedback",
  includeMetadata = true,
}: ClientFeedbackProps) {
  const { isEnabled } = useFeedbackEnabled({ forceEnable, paramName })
  const [isActive, setIsActive] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    if (typeof window === "undefined") return []
    return loadAnnotations<Annotation>(window.location.pathname)
  })
  const [copyFeedback, setCopyFeedback] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Sync annotations to localStorage
  const persist = useCallback((anns: Annotation[]) => {
    saveAnnotations(window.location.pathname, anns)
  }, [])

  const handleAnnotationAdd = useCallback(
    (annotation: Annotation) => {
      setAnnotations((prev) => {
        const next = [...prev, annotation]
        persist(next)
        return next
      })
    },
    [persist]
  )

  const handleAnnotationUpdate = useCallback(
    (annotation: Annotation) => {
      setAnnotations((prev) => {
        const next = prev.map((a) => (a.id === annotation.id ? annotation : a))
        persist(next)
        return next
      })
    },
    [persist]
  )

  const handleAnnotationDelete = useCallback(
    (annotation: Annotation) => {
      setAnnotations((prev) => {
        const next = prev.filter((a) => a.id !== annotation.id)
        persist(next)
        return next
      })
    },
    [persist]
  )

  const handleAnnotationsClear = useCallback(() => {
    setAnnotations([])
    persist([])
  }, [persist])

  const handleDeleteFromPanel = useCallback(
    (id: string) => {
      setAnnotations((prev) => {
        const next = prev.filter((a) => a.id !== id)
        persist(next)
        return next
      })
    },
    [persist]
  )

  const handleExport = useCallback(() => {
    downloadMarkdown(annotations, { title, includeMetadata })
  }, [annotations, title, includeMetadata])

  const handleCopy = useCallback(async () => {
    await copyMarkdownToClipboard(annotations, { title, includeMetadata })
    setCopyFeedback(true)
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    copyTimeoutRef.current = setTimeout(() => setCopyFeedback(false), 2000)
  }, [annotations, title, includeMetadata])

  const handleToggle = useCallback(() => {
    setIsActive((prev) => !prev)
  }, [])

  // Nao renderiza nada se feedback nao esta habilitado
  if (!isEnabled) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        style={{
          ...styles.toggleBtn,
          background: isActive ? "#7c83ff" : "#1a1a2e",
        }}
        title={isActive ? "Desativar feedback" : "Ativar feedback"}
      >
        <span style={styles.toggleIcon}>{isActive ? "●" : "○"}</span>
        <span>Feedback</span>
        {annotations.length > 0 && (
          <span style={styles.badge}>{annotations.length}</span>
        )}
      </button>

      {/* Panel Toggle (so aparece com anotacoes) */}
      {annotations.length > 0 && (
        <button
          onClick={() => setIsPanelOpen((prev) => !prev)}
          style={styles.panelToggleBtn}
          title="Ver anotacoes"
        >
          {isPanelOpen ? "✕" : `📋 ${annotations.length}`}
        </button>
      )}

      {/* Feedback Panel */}
      {isPanelOpen && (
        <FeedbackPanel
          annotations={annotations}
          onExport={handleExport}
          onCopy={handleCopy}
          onClear={handleAnnotationsClear}
          onClose={() => setIsPanelOpen(false)}
          onDeleteAnnotation={handleDeleteFromPanel}
        />
      )}

      {/* Copy Feedback Toast */}
      {copyFeedback && (
        <div style={styles.toast}>Copiado para a area de transferencia!</div>
      )}

      {/* Agentation - so renderiza quando ativo */}
      {isActive && (
        <Agentation
          copyToClipboard={false}
          onAnnotationAdd={handleAnnotationAdd}
          onAnnotationUpdate={handleAnnotationUpdate}
          onAnnotationDelete={handleAnnotationDelete}
          onAnnotationsClear={handleAnnotationsClear}
        />
      )}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toggleBtn: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 99998,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    border: "1px solid #333",
    borderRadius: "50px",
    color: "#fff",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    transition: "all 0.2s ease",
  },
  toggleIcon: {
    fontSize: "10px",
  },
  badge: {
    background: "#ff6b6b",
    color: "#fff",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 700,
  },
  panelToggleBtn: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    zIndex: 99998,
    padding: "8px 14px",
    background: "#1a1a2e",
    border: "1px solid #333",
    borderRadius: "50px",
    color: "#fff",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  toast: {
    position: "fixed",
    bottom: "80px",
    right: "100px",
    zIndex: 99999,
    background: "#2ecc71",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
}
```

---

### 5. `index.ts`

Barrel export para importacao simplificada.

```typescript
export { ClientFeedback } from "./client-feedback"
export { useFeedbackEnabled } from "./use-feedback-enabled"
export { generateMarkdown, downloadMarkdown, copyMarkdownToClipboard } from "./generate-markdown"
export { FeedbackPanel } from "./feedback-panel"
```

---

## Integracao por Framework

### Next.js App Router

```tsx
// app/layout.tsx
import { ClientFeedback } from "@/feedback"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ClientFeedback />
      </body>
    </html>
  )
}
```

> **Nota:** O componente ja tem `"use client"` no topo. Funciona dentro de Server Components sem problemas.

### Next.js Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app"
import { ClientFeedback } from "@/feedback"

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ClientFeedback />
    </>
  )
}
```

### Vite (React)

```tsx
// src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ClientFeedback } from "./feedback"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <ClientFeedback />
  </React.StrictMode>
)
```

Ativacao via env var no `.env`:

```env
VITE_FEEDBACK_ENABLED=true
```

### Create React App (CRA)

```tsx
// src/index.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ClientFeedback } from "./feedback"

const root = ReactDOM.createRoot(document.getElementById("root")!)
root.render(
  <React.StrictMode>
    <App />
    <ClientFeedback />
  </React.StrictMode>
)
```

### Remix

```tsx
// app/root.tsx
import { ClientFeedback } from "~/feedback"

export default function App() {
  return (
    <html lang="pt-BR">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ClientFeedback />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

---

## Fluxo End-to-End

```
1. Dev adiciona <ClientFeedback /> no layout raiz
2. Dev faz deploy (Vercel, Netlify, staging server, etc)
3. Dev envia URL ao cliente: https://meu-site.com?feedback=true
                                                   ^^^^^^^^^^^^^^
4. Cliente abre a URL
   → Hook detecta ?feedback=true
   → Botao "Feedback" aparece no canto inferior direito

5. Cliente clica "Feedback"
   → Modo de anotacao ativa (Agentation renderiza overlay)
   → Cursor muda, elementos ficam destacados ao hover

6. Cliente clica em um elemento (ex: um titulo)
   → Popup aparece pedindo comentario
   → Cliente digita: "Quero essa fonte maior"
   → Clica "Add"
   → Anotacao salva (localStorage + state)

7. Cliente repete para mais elementos
   → Badge no botao mostra contador: "Feedback (3)"
   → Botao do painel aparece

8. Cliente abre o painel lateral
   → Lista todas as anotacoes com elemento, comentario, caminho

9. Cliente clica "Exportar .md"
   → Arquivo feedback-2026-02-18.md baixa automaticamente

10. Cliente envia o .md ao dev (email, Slack, etc)
    → Dev le o feedback estruturado com elementos identificados
```

---

## Exemplo de Markdown Exportado

```markdown
# Client Feedback

- **Pagina:** https://meu-site.com/home?feedback=true
- **Data:** 2026-02-18 14:30:00
- **Total de anotacoes:** 3
- **Blocking:** 1 | **Important:** 1 | **Suggestion:** 1

---

## 1. Logo esta cortada no mobile [FIX] (blocking)

- **Elemento:** `img`
- **Caminho:** `header > div > a > img`
- **Hora:** 14:25:10
- **Posicao:** (120, 45)

## 2. Quero essa fonte maior [CHANGE] (important)

- **Elemento:** `h1`
- **Caminho:** `main > section > h1`
- **Texto selecionado:** "Bem-vindo ao nosso site"
- **Hora:** 14:26:33
- **Posicao:** (400, 200)

## 3. Essa cor combinou bem [APPROVE] (suggestion)

- **Elemento:** `button`
- **Caminho:** `main > section > div > button`
- **Hora:** 14:27:01
- **Posicao:** (500, 350)
```

---

## Caveats

| Caveat | Detalhes |
|--------|----------|
| **Desktop only** | Agentation usa hover e click em elementos DOM. Em mobile o overlay nao funciona bem. Recomende ao cliente usar desktop. |
| **React 18+** | Agentation usa `createRoot` internamente. Nao funciona com React 17 ou anterior. |
| **localStorage** | Anotacoes persistem por pagina via `localStorage`. Se o cliente limpar dados do navegador, perde as anotacoes. Exporte antes. |
| **z-index** | Controles do feedback usam `z-index: 99998`. Agentation usa `100000+`. Se seu app tem elementos com z-index alto, pode haver conflito. |
| **CSP (Content Security Policy)** | Se o site tem CSP restrito, o inline style do Agentation pode ser bloqueado. Adicione `style-src 'unsafe-inline'` se necessario. |
| **iframes** | Agentation nao anota elementos dentro de iframes (cross-origin). Elementos no documento principal funcionam normalmente. |
| **SSR** | O hook `useFeedbackEnabled` roda no `useEffect` (client-side only). Sem problemas com SSR/SSG, mas a UI de feedback so aparece apos hydration. |
| **Multiplas paginas** | Cada pagina salva anotacoes separadamente (key baseada no `pathname`). O export gera markdown apenas da pagina atual. |

---

## Melhorias Opcionais

### Export multi-pagina

Agregue anotacoes de todas as paginas visitadas:

```typescript
function getAllAnnotations(): Record<string, Annotation[]> {
  const all: Record<string, Annotation[]> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith("agentation-annotations-")) {
      const pathname = key.replace("agentation-annotations-", "")
      try {
        all[pathname] = JSON.parse(localStorage.getItem(key) || "[]")
      } catch {
        // skip
      }
    }
  }
  return all
}
```

### Webhook (envio automatico)

Envie anotacoes para um endpoint quando o cliente clicar "Enviar":

```tsx
<Agentation
  onSubmit={(output, annotations) => {
    fetch("https://api.meu-site.com/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: window.location.href,
        annotations,
        markdown: output,
        timestamp: Date.now(),
      }),
    })
  }}
/>
```

### Feature flags (LaunchDarkly, Statsig, etc)

```tsx
import { useFeatureFlag } from "your-feature-flag-sdk"

function App() {
  const feedbackEnabled = useFeatureFlag("client-feedback")
  return (
    <>
      <MainContent />
      <ClientFeedback forceEnable={feedbackEnabled} />
    </>
  )
}
```

### Integracao com Agentation Server (sync em tempo real)

Agentation suporta sincronizacao via servidor opcional:

```tsx
<Agentation
  endpoint="http://localhost:4747"
  onSessionCreated={(sessionId) => {
    // Salve o sessionId para compartilhar com o dev
    console.log("Session:", sessionId)
  }}
/>
```

Isso permite que dev e cliente vejam anotacoes em tempo real na mesma sessao.

---

## Referencia Rapida da API Agentation

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `onAnnotationAdd` | `(ann) => void` | - | Chamado quando anotacao e adicionada |
| `onAnnotationUpdate` | `(ann) => void` | - | Chamado quando comentario e editado |
| `onAnnotationDelete` | `(ann) => void` | - | Chamado quando anotacao e removida |
| `onAnnotationsClear` | `(anns) => void` | - | Chamado quando todas sao limpas |
| `onCopy` | `(md) => void` | - | Chamado no clique de copiar |
| `onSubmit` | `(output, anns) => void` | - | Chamado no "Send to Agent" |
| `copyToClipboard` | `boolean` | `true` | Auto-copiar ao clicar copy |
| `endpoint` | `string` | - | URL do servidor de sync |
| `sessionId` | `string` | - | ID de sessao existente |
| `webhookUrl` | `string` | - | URL para receber eventos |

| Funcao Utilitaria | Descricao |
|--------------------|-----------|
| `loadAnnotations(pathname)` | Carrega anotacoes do localStorage |
| `saveAnnotations(pathname, anns)` | Salva anotacoes no localStorage |

---

*Guia gerado para uso com `agentation` v2.2.1+. Para mais detalhes sobre a biblioteca, consulte [agentation.dev](https://agentation.dev).*
