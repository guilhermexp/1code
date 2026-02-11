"use client"

import { useState, useRef, useCallback, useEffect, useMemo, createElement } from "react"
import { useAtom } from "jotai"
import { Button } from "../../../components/ui/button"
import { RotateCw, RefreshCcwDot, MousePointer2, ChevronLeft, ChevronRight, Copy, Trash2, ListChecks, Code } from "lucide-react"
import {
  ExternalLinkIcon,
  IconDoubleChevronRight,
  IconChatBubble,
} from "../../../components/ui/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { toast } from "sonner"
import { PreviewUrlInput } from "./preview-url-input"
import {
  previewPathAtomFamily,
  viewportModeAtomFamily,
  previewScaleAtomFamily,
  mobileDeviceAtomFamily,
} from "../atoms"
import { cn } from "../../../lib/utils"
import { ViewportToggle } from "./viewport-toggle"
import { ScaleControl } from "./scale-control"
import { DevicePresetsBar } from "./device-presets-bar"
import { ResizeHandle } from "./resize-handle"
import { MobileCopyLinkButton } from "./mobile-copy-link-button"
import { DEVICE_PRESETS, AGENTS_PREVIEW_CONSTANTS } from "../constants"
// import { getSandboxPreviewUrl } from "@/app/(alpha)/canvas/{components}/settings-tabs/repositories/preview-url"
const getSandboxPreviewUrl = (sandboxId: string, port: number, _type: string) => `https://${sandboxId}-${port}.csb.app` // Desktop mock
interface AgentPreviewProps {
  chatId: string
  sandboxId?: string
  port?: number
  customUrl?: string
  repository?: string
  hideHeader?: boolean
  onClose?: () => void
  isMobile?: boolean
}

type PreviewLogLevel = "error" | "warn" | "info"

interface PreviewLogEntry {
  id: string
  timestamp: number
  level: PreviewLogLevel
  source: string
  message: string
}


const MAX_PREVIEW_LOGS = 250

function normalizePreviewBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim()
  if (!trimmed) return "about:blank"
  if (trimmed === "about:blank") return trimmed

  let candidate = trimmed
  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(candidate)
  if (!hasScheme) {
    const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(candidate)
    candidate = `${isLocal ? "http" : "https"}://${candidate}`
  }

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return candidate.replace(/\/$/, "")
    }
    return "about:blank"
  } catch {
    return "about:blank"
  }
}

function normalizePreviewPath(rawPath: string): string {
  const trimmed = rawPath.trim()
  if (!trimmed) return "/"
  if (trimmed === "/blank" || trimmed === "blank") return "/"

  try {
    const parsed = new URL(trimmed)
    const path = `${parsed.pathname || "/"}${parsed.search}${parsed.hash}`
    if (!path || path === "/blank") return "/"
    return path
  } catch {
    if (trimmed.startsWith("/")) return trimmed
    if (trimmed.startsWith("?") || trimmed.startsWith("#")) return `/${trimmed}`
    return `/${trimmed}`
  }
}

function serializeLogValue(value: unknown): string {
  if (value instanceof Error) {
    return value.stack || value.message
  }
  if (typeof value === "string") {
    return value
  }
  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value)
    } catch {
      return "[unserializable object]"
    }
  }
  return String(value)
}

function shouldIgnorePreviewLog(message: string): boolean {
  if (!message) return true
  const normalized = message.toLowerCase()

  if (
    normalized.includes("electron security warning (insecure content-security-policy)") ||
    normalized.includes("[vue warn]: extraneous non-emits event listeners (videoclick)")
  ) {
    return true
  }

  return false
}

function dispatchInspectorSelection(chatId: string, content: string) {
  if (!content || typeof content !== "string") return
  window.dispatchEvent(
    new CustomEvent("agent-add-component-context", {
      detail: {
        chatId,
        componentInfo: content,
      },
    }),
  )
}

export function AgentPreview({
  chatId,
  sandboxId,
  port,
  customUrl,
  repository,
  hideHeader = false,
  onClose,
  isMobile = false,
}: AgentPreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [cacheBuster, setCacheBuster] = useState<number | null>(null)
  const [editableCustomUrl, setEditableCustomUrl] = useState(customUrl || "")
  const [webviewEl, setWebviewEl] = useState<Electron.WebviewTag | null>(null)
  const webviewNodeRef = useRef<Electron.WebviewTag | null>(null)
  const [webviewDomReady, setWebviewDomReady] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const resizeCleanupRef = useRef<(() => void) | null>(null)
  const [webviewCanGoBack, setWebviewCanGoBack] = useState(false)
  const [webviewCanGoForward, setWebviewCanGoForward] = useState(false)

  // Persisted state from Jotai atoms (per chatId)
  const [persistedPath, setPersistedPath] = useAtom(
    previewPathAtomFamily(chatId),
  )
  const [viewportMode, setViewportMode] = useAtom(
    viewportModeAtomFamily(chatId),
  )
  const [scale, setScale] = useAtom(previewScaleAtomFamily(chatId))
  const [device, setDevice] = useAtom(mobileDeviceAtomFamily(chatId))

  // Local state for resizing
  const [isResizing, setIsResizing] = useState(false)
  const [maxWidth, setMaxWidth] = useState<number>(
    AGENTS_PREVIEW_CONSTANTS.MAX_WIDTH,
  )

  // Inspector Mode state for React Grab integration
  const [inspectorEnabled, setInspectorEnabled] = useState(false)
  const lastInspectorClipboardRef = useRef<string>("")
  const [previewLogs, setPreviewLogs] = useState<PreviewLogEntry[]>([])

  const handleWebviewRef = useCallback((node: unknown) => {
    const next = (node as Electron.WebviewTag | null) ?? null
    if (next === webviewNodeRef.current) return
    webviewNodeRef.current = next
    setWebviewEl(next)
  }, [])

  // Inspector should start disabled per chat/session context.
  useEffect(() => {
    setInspectorEnabled(false)
    lastInspectorClipboardRef.current = ""
  }, [chatId])

  const pushPreviewLog = useCallback(
    (level: PreviewLogLevel, source: string, ...args: unknown[]) => {
      const message = args.map(serializeLogValue).join(" ").trim()
      if (!message) return
      if (shouldIgnorePreviewLog(message)) return
      const entry: PreviewLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        level,
        source,
        message,
      }
      setPreviewLogs((prev) => [...prev.slice(-(MAX_PREVIEW_LOGS - 1)), entry])
    },
    [],
  )

  const clearPreviewLogs = useCallback(() => {
    setPreviewLogs([])
  }, [])

  const executeInWebview = useCallback(
    (script: string, userGesture = true) => {
      if (!webviewEl || !webviewDomReady) return Promise.resolve<unknown>(null)
      if (!webviewEl.isConnected) return Promise.resolve<unknown>(null)
      try {
        return webviewEl.executeJavaScript(script, userGesture)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        const expectedNotReady =
          message.includes("must be attached to the DOM") ||
          message.includes("dom-ready event emitted before this method can be called")
        if (!expectedNotReady) {
          pushPreviewLog("error", "webview", "execute-js-sync-failed", message)
        }
        return Promise.resolve<unknown>(null)
      }
    },
    [pushPreviewLog, webviewDomReady, webviewEl],
  )

  const latestPreviewLogs = useMemo(
    () => previewLogs.slice(-80).reverse(),
    [previewLogs],
  )

  // - loadedPath: Controls webview src (stable, only changes on manual navigation)
  // - currentPath: Display path (updates immediately on internal navigation)
  const [loadedPath, setLoadedPath] = useState(persistedPath)
  const [currentPath, setCurrentPath] = useState(persistedPath)

  const updateWebviewNavState = useCallback(() => {
    const webview = webviewEl
    if (!webview) return
    try {
      setWebviewCanGoBack(webview.canGoBack())
      setWebviewCanGoForward(webview.canGoForward())
    } catch {
      setWebviewCanGoBack(false)
      setWebviewCanGoForward(false)
    }
  }, [webviewEl])

  useEffect(() => {
    if (!webviewEl) return

    setWebviewDomReady(false)

    const handleDomReady = () => {
      setWebviewDomReady(true)
      pushPreviewLog("info", "webview", "dom-ready")
      updateWebviewNavState()
    }

    const handleDestroyed = () => {
      setWebviewDomReady(false)
      setWebviewCanGoBack(false)
      setWebviewCanGoForward(false)
    }

    webviewEl.addEventListener("dom-ready", handleDomReady as EventListener)
    webviewEl.addEventListener("destroyed", handleDestroyed as EventListener)

    return () => {
      webviewEl.removeEventListener("dom-ready", handleDomReady as EventListener)
      webviewEl.removeEventListener("destroyed", handleDestroyed as EventListener)
    }
  }, [pushPreviewLog, webviewEl, updateWebviewNavState])

  // Listen for reload events from external header
  useEffect(() => {
    const handleReload = (e: CustomEvent) => {
      if (e.detail?.chatId === chatId) {
        setReloadKey((prev) => prev + 1)
        setIsRefreshing(true)
        setTimeout(() => setIsRefreshing(false), 400)
      }
    }

    window.addEventListener(
      "agent-preview-reload",
      handleReload as EventListener,
    )
    return () =>
      window.removeEventListener(
        "agent-preview-reload",
        handleReload as EventListener,
      )
  }, [chatId])

  // Listen for navigation events from external header
  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      if (e.detail?.chatId === chatId && e.detail?.path) {
        const nextPath = normalizePreviewPath(String(e.detail.path))
        setLoadedPath(nextPath)
        setCurrentPath(nextPath)
        setPersistedPath(nextPath)
        setIsLoaded(false)
      }
    }

    window.addEventListener(
      "agent-preview-navigate",
      handleNavigate as EventListener,
    )
    return () =>
      window.removeEventListener(
        "agent-preview-navigate",
        handleNavigate as EventListener,
      )
  }, [chatId, setPersistedPath])

  // Dispatch path updates to header
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("agent-preview-path-update", {
        detail: { chatId, path: currentPath },
      }),
    )
  }, [chatId, currentPath])

  // Sync loadedPath when persistedPath changes (e.g., on mount with stored value)
  useEffect(() => {
    const normalizedPath = normalizePreviewPath(persistedPath)
    setLoadedPath(normalizedPath)
    setCurrentPath(normalizedPath)
    if (normalizedPath !== persistedPath) {
      setPersistedPath(normalizedPath)
    }
  }, [persistedPath, setPersistedPath])

  // Sync editableCustomUrl when customUrl prop changes
  useEffect(() => {
    if (customUrl) {
      setEditableCustomUrl(customUrl)
    }
  }, [customUrl])

  // Handler for custom URL changes
  const handleCustomUrlChange = useCallback((newUrl: string) => {
    setEditableCustomUrl(newUrl)
    setIsLoaded(false) // Show loading state
    setReloadKey((prev) => prev + 1) // Force webview remount
  }, [])

  // Compute base host and preview URL
  const previewBaseUrl = useMemo(() => {
    // Priority: editableCustomUrl > sandboxId > fallback
    if (editableCustomUrl) {
      return normalizePreviewBaseUrl(editableCustomUrl)
    }
    if (sandboxId && port) {
      return getSandboxPreviewUrl(sandboxId, port, "agents")
    }
    return "about:blank"
  }, [editableCustomUrl, sandboxId, port])

  const baseHost = useMemo(() => {
    try {
      return new URL(previewBaseUrl).host
    } catch {
      return null
    }
  }, [previewBaseUrl])

  const previewUrl = useMemo(() => {
    if (previewBaseUrl === "about:blank") return previewBaseUrl
    const safePath = normalizePreviewPath(loadedPath)

    let url = `${previewBaseUrl}${safePath}`
    if (editableCustomUrl) {
      const normalizedCustom = normalizePreviewBaseUrl(editableCustomUrl)
      if (normalizedCustom !== "about:blank") {
        if (safePath === "/") {
          url = normalizedCustom
        } else {
          try {
            const parsed = new URL(normalizedCustom)
            url = `${parsed.origin}${safePath}`
          } catch {
            url = normalizedCustom
          }
        }
      } else {
        return "about:blank"
      }
    }

    try {
      const parsed = new URL(url)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return "about:blank"
      }
    } catch {
      return "about:blank"
    }

    // Add cache-buster for hard refresh
    if (cacheBuster) {
      const separator = url.includes("?") ? "&" : "?"
      url = `${url}${separator}_cb=${cacheBuster}`
    }
    return url
  }, [previewBaseUrl, loadedPath, editableCustomUrl, cacheBuster])

  const copyPreviewLogs = useCallback(async () => {
    if (previewLogs.length === 0) {
      toast.message("No preview logs to copy")
      return
    }

    const header = [
      `# Preview Logs`,
      `chatId: ${chatId}`,
      `url: ${previewUrl}`,
      `capturedAt: ${new Date().toISOString()}`,
      "",
    ].join("\n")

    const body = previewLogs
      .map((entry) => {
        const ts = new Date(entry.timestamp).toISOString()
        return `[${ts}] [${entry.level.toUpperCase()}] [${entry.source}] ${entry.message}`
      })
      .join("\n")

    const output = `${header}${body}`

    try {
      if (window.desktopApi?.clipboardWrite) {
        await window.desktopApi.clipboardWrite(output)
      } else {
        await navigator.clipboard.writeText(output)
      }
      toast.success("Preview logs copied")
    } catch (error) {
      toast.error("Failed to copy preview logs")
      pushPreviewLog("error", "preview-logs", "copy-failed", error)
    }
  }, [chatId, previewLogs, previewUrl, pushPreviewLog])

  // Handle path selection from URL bar
  const handlePathSelect = useCallback(
    (path: string) => {
      const normalizedPath = normalizePreviewPath(path)
      setLoadedPath(normalizedPath)
      setCurrentPath(normalizedPath)
      setPersistedPath(normalizedPath)
      setIsLoaded(false) // Show loading state
    },
    [setPersistedPath],
  )

  // Navigation: Go back
  const handleNavBack = useCallback(() => {
    const webview = webviewEl
    if (webviewDomReady && webview) {
      try {
        if (webview.canGoBack()) {
          webview.goBack()
        }
      } catch {
        setWebviewCanGoBack(false)
        setWebviewCanGoForward(false)
      }
    }
  }, [webviewEl, webviewDomReady])

  // Navigation: Go forward
  const handleNavForward = useCallback(() => {
    const webview = webviewEl
    if (webviewDomReady && webview) {
      try {
        if (webview.canGoForward()) {
          webview.goForward()
        }
      } catch {
        setWebviewCanGoBack(false)
        setWebviewCanGoForward(false)
      }
    }
  }, [webviewEl, webviewDomReady])

  // Check if can navigate
  const canGoBack = webviewCanGoBack
  const canGoForward = webviewCanGoForward

  // Listen for navigation events from Chromium webview (full browser context)
  useEffect(() => {
    const webview = webviewEl
    if (!webview) return

    const updatePathFromUrl = (urlString: string) => {
      try {
        const url = new URL(urlString)
        const nextPath = `${url.pathname || "/"}${url.search}${url.hash}` || "/"
        setCurrentPath(nextPath)
      } catch {
        // Ignore invalid URLs emitted during provisional navigation
      }
    }

    const handleStartLoading = () => {
      setIsLoaded(false)
      if (webviewDomReady) {
        updateWebviewNavState()
      }
    }
    const handleStopLoading = () => {
      setIsLoaded(true)
      if (cacheBuster) {
        setCacheBuster(null)
      }
      if (webviewDomReady) {
        updateWebviewNavState()
      }
    }
    const handleFailLoad = (event: Event) => {
      const payload = event as {
        errorCode?: number
        errorDescription?: string
        validatedURL?: string
        isMainFrame?: boolean
      }
      if (payload.isMainFrame !== false) {
        pushPreviewLog(
          "error",
          "webview-load",
          `code=${payload.errorCode ?? "unknown"}`,
          payload.errorDescription ?? "load-failed",
          payload.validatedURL ?? "",
        )
      }
      handleStopLoading()
    }
    const handleNavigate = (event: Event) => {
      const url = (event as { url?: string }).url
      if (url) {
        updatePathFromUrl(url)
      }
      if (webviewDomReady) {
        updateWebviewNavState()
      }
      if (!inspectorEnabled && webviewDomReady) {
        executeInWebview(
          `(() => {
            try {
              window.__1codeInspectorEnabled = false;
              const api = window.reactGrabApi || window.__REACT_GRAB__;
              if (api && typeof api.deactivate === "function") api.deactivate();
            } catch {}
          })();`,
          true,
        ).catch(() => {})
      }
    }
    const handleConsoleMessage = (event: Event) => {
      const payload = event as {
        level?: number
        message?: string
        line?: number
        sourceId?: string
      }
      const rawMessage = payload.message ?? ""
      const inspectorPrefix = "__1CODE_INSPECTOR_SELECTED__::"
      if (rawMessage.startsWith(inspectorPrefix)) {
        try {
          const encoded = rawMessage.slice(inspectorPrefix.length)
          const content = decodeURIComponent(encoded)
          lastInspectorClipboardRef.current = content
          dispatchInspectorSelection(chatId, content)
          toast.success("Component added to context")
        } catch (error) {
          pushPreviewLog("error", "inspector", "decode-failed", error)
        }
        return
      }

      if ((payload.level ?? 0) < 2) return
      const levelMap: Record<number, PreviewLogLevel> = {
        2: "warn",
        3: "error",
      }
      const level = levelMap[payload.level ?? 2] || "warn"
      const location = payload.sourceId
        ? ` (${payload.sourceId}:${payload.line ?? 0})`
        : ""
      pushPreviewLog(level, "webview-console", `${rawMessage}${location}`)
    }

    webview.addEventListener("did-start-loading", handleStartLoading as EventListener)
    webview.addEventListener("did-stop-loading", handleStopLoading as EventListener)
    webview.addEventListener("did-fail-load", handleFailLoad as EventListener)
    webview.addEventListener("did-navigate", handleNavigate as EventListener)
    webview.addEventListener("did-navigate-in-page", handleNavigate as EventListener)
    webview.addEventListener("console-message", handleConsoleMessage as EventListener)

    if (webviewDomReady) {
      updateWebviewNavState()
    }

    return () => {
      webview.removeEventListener("did-start-loading", handleStartLoading as EventListener)
      webview.removeEventListener("did-stop-loading", handleStopLoading as EventListener)
      webview.removeEventListener("did-fail-load", handleFailLoad as EventListener)
      webview.removeEventListener("did-navigate", handleNavigate as EventListener)
      webview.removeEventListener("did-navigate-in-page", handleNavigate as EventListener)
      webview.removeEventListener("console-message", handleConsoleMessage as EventListener)
    }
  }, [
    chatId,
    webviewEl,
    webviewDomReady,
    cacheBuster,
    inspectorEnabled,
    executeInWebview,
    pushPreviewLog,
    updateWebviewNavState,
  ])

  // Calculate max width on mount and window resize
  useEffect(() => {
    const updateMaxWidth = () => {
      const availableWidth = window.innerWidth - 64 // Account for padding/margins
      setMaxWidth(Math.max(AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH, availableWidth))
    }

    updateMaxWidth()
    window.addEventListener("resize", updateMaxWidth)
    return () => window.removeEventListener("resize", updateMaxWidth)
  }, [])

  // Cleanup resize handlers on unmount
  useEffect(() => {
    return () => {
      resizeCleanupRef.current?.()
    }
  }, [])

  const handleReload = useCallback(() => {
    if (isRefreshing) return
    setIsRefreshing(true)
    setIsLoaded(false)
    if (webviewDomReady) {
      webviewEl?.reload()
    } else {
      setReloadKey((prev) => prev + 1)
    }
    setTimeout(() => setIsRefreshing(false), 400)
  }, [webviewEl, webviewDomReady, isRefreshing])

  const handleHardReload = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    setIsLoaded(false)
    // Clear browser cache before reloading
    try {
      await window.desktopApi?.clearCache()
    } catch (error) {
      console.error("[Preview] Failed to clear cache:", error)
      pushPreviewLog("error", "preview", "failed-to-clear-cache", error)
    }
    if (webviewDomReady) {
      webviewEl?.reloadIgnoringCache()
    } else {
      setReloadKey((prev) => prev + 1)
    }
    setTimeout(() => setIsRefreshing(false), 400)
  }, [webviewEl, webviewDomReady, isRefreshing, pushPreviewLog])

  const syncInspectorQuickState = useCallback(
    (enabled: boolean) => {
      if (!webviewEl || !webviewDomReady) return
      executeInWebview(
          `(() => {
            try {
              const FORCE_OFF_STYLE_ID = "__1CODE_INSPECTOR_FORCE_OFF__";
              const removeReactGrabDomArtifacts = () => {
                try {
                  const toRemove = [];
                  const all = document.querySelectorAll("*");
                  for (const node of all) {
                    if (!(node instanceof HTMLElement)) continue;
                    const attrs = node.getAttributeNames();
                    const hasReactGrabAttr = attrs.some((attr) => attr.startsWith("data-react-grab-"));
                    const className = typeof node.className === "string" ? node.className : "";
                    const hasReactGrabClass = className.toLowerCase().includes("react-grab");
                    if (hasReactGrabAttr || hasReactGrabClass) {
                      toRemove.push(node);
                    }
                  }
                  for (const node of toRemove) {
                    try { node.remove(); } catch {}
                  }
                } catch {}
              };
              const applyForceOffStyle = (on) => {
                const existing = document.getElementById(FORCE_OFF_STYLE_ID);
                if (!on) {
                  if (existing) existing.remove();
                  return;
                }
                const css = [
                  ".react-grab-toolbar, [class*='react-grab-toolbar'], [data-react-grab-toolbar='true'] { display: none !important; pointer-events: none !important; }",
                  "[data-react-grab-overlay='true'] { display: none !important; pointer-events: none !important; }",
                ].join("\\n");
                if (existing) {
                  existing.textContent = css;
                  return;
                }
                const style = document.createElement("style");
                style.id = FORCE_OFF_STYLE_ID;
                style.textContent = css;
                (document.head || document.documentElement).appendChild(style);
              };

              window.__1codeInspectorEnabled = ${enabled ? "true" : "false"};
              const api = window.reactGrabApi || window.__REACT_GRAB__;
              if (api) {
                if (typeof api.setEnabled === "function") {
                  try { api.setEnabled(${enabled ? "true" : "false"}); } catch {}
                }
                if (typeof api.setToolbarState === "function") {
                  try {
                    api.setToolbarState({
                      enabled: ${enabled ? "true" : "false"},
                      collapsed: ${enabled ? "false" : "true"},
                    });
                  } catch {}
                }
                if (typeof api.setOptions === "function") {
                  try {
                    api.setOptions({
                      theme: {
                        toolbar: {
                          enabled: ${enabled ? "true" : "false"},
                        },
                      },
                    });
                  } catch {}
                }
                const methods = ${enabled
                  ? '["activate","enable","start","open"]'
                  : '["deactivate","disable","stop","close"]'};
                for (const method of methods) {
                  if (typeof api[method] === "function") {
                    try { api[method](); } catch {}
                  }
                }
              }
              if (!${enabled ? "true" : "false"}) {
                removeReactGrabDomArtifacts();
              }
              applyForceOffStyle(${enabled ? "false" : "true"});
              return true;
            } catch {
              return false;
            }
          })();`,
          true,
        )
        .catch(() => {})
    },
    [executeInWebview, webviewDomReady, webviewEl],
  )

  const handleInspectorToggle = useCallback(() => {
    setInspectorEnabled((prev) => {
      const next = !prev
      if (!webviewEl || !webviewDomReady) {
        pushPreviewLog("warn", "inspector", "toggle-queued-until-ready")
      }
      pushPreviewLog("info", "inspector", next ? "toggle-on-requested" : "toggle-off-requested")
      syncInspectorQuickState(next)
      if (!next) {
        toast.message("Inspector disabled")
      }
      return next
    })
  }, [pushPreviewLog, syncInspectorQuickState, webviewDomReady, webviewEl])

  const handleOpenPreviewDevTools = useCallback(() => {
    if (!webviewEl || !webviewDomReady) {
      toast.message("Preview DevTools available when Chromium preview is ready")
      return
    }

    try {
      webviewEl.openDevTools()
    } catch (error) {
      pushPreviewLog("error", "webview-devtools", "open-failed", error)
      toast.error("Failed to open Preview DevTools")
    }
  }, [webviewEl, webviewDomReady, pushPreviewLog])

  const handlePresetChange = useCallback(
    (presetName: string) => {
      const preset = DEVICE_PRESETS.find((p) => p.name === presetName)
      if (preset) {
        setDevice({
          width: preset.width,
          height: preset.height,
          preset: preset.name,
        })
      }
    },
    [setDevice],
  )

  const handleWidthChange = useCallback(
    (width: number) => {
      setDevice({
        ...device,
        width,
        preset: "Custom",
      })
    },
    [device, setDevice],
  )

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const handle = e.currentTarget as HTMLElement
      const pointerId = e.pointerId
      const isLeftHandle = handle.getAttribute("data-side") === "left"
      const startX = e.clientX
      const startWidth = device.width
      const frame = frameRef.current

      if (!frame) return

      handle.setPointerCapture(pointerId)
      setIsResizing(true)

      const handlePointerMove = (e: PointerEvent) => {
        let delta = e.clientX - startX
        if (isLeftHandle) {
          delta = -delta
        }
        const newWidth = Math.round(
          Math.max(
            AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH,
            Math.min(maxWidth, startWidth + delta * 2),
          ),
        )
        frame.style.width = `${newWidth}px`
        setDevice({
          ...device,
          width: newWidth,
          preset: "Custom",
        })
      }

      const handlePointerUp = () => {
        if (handle.hasPointerCapture(pointerId)) {
          handle.releasePointerCapture(pointerId)
        }
        setIsResizing(false)
        cleanup()
      }

      const handlePointerCancel = () => {
        if (handle.hasPointerCapture(pointerId)) {
          handle.releasePointerCapture(pointerId)
        }
        cleanup()
      }

      const cleanup = () => {
        handle.removeEventListener("pointermove", handlePointerMove as any)
        handle.removeEventListener("pointerup", handlePointerUp as any)
        handle.removeEventListener("pointercancel", handlePointerCancel as any)
        document.body.style.userSelect = ""
        document.body.style.cursor = ""
        resizeCleanupRef.current = null
      }

      document.body.style.userSelect = "none"
      document.body.style.cursor = "ew-resize"
      handle.addEventListener("pointermove", handlePointerMove as any)
      handle.addEventListener("pointerup", handlePointerUp as any)
      handle.addEventListener("pointercancel", handlePointerCancel as any)
      resizeCleanupRef.current = cleanup
    },
    [device, maxWidth, setDevice],
  )

  // Inspector Mode: React Grab injection in Chromium webview
  useEffect(() => {
    if (!webviewEl || !webviewDomReady) return

    const script = `
      (async () => {
        try {
          const enabled = ${inspectorEnabled ? "true" : "false"};
          window.__1codeInspectorEnabled = enabled;
          const PREFIX = "__1CODE_INSPECTOR_SELECTED__::";
          const FORCE_OFF_STYLE_ID = "__1CODE_INSPECTOR_FORCE_OFF__";
          const LAYOUT_LOCK_STYLE_ID = "__1CODE_INSPECTOR_LAYOUT_LOCK__";
          const removeReactGrabDomArtifacts = () => {
            try {
              const toRemove = [];
              const all = document.querySelectorAll("*");
              for (const node of all) {
                if (!(node instanceof HTMLElement)) continue;
                const attrs = node.getAttributeNames();
                const hasReactGrabAttr = attrs.some((attr) => attr.startsWith("data-react-grab-"));
                const className = typeof node.className === "string" ? node.className : "";
                const hasReactGrabClass = className.toLowerCase().includes("react-grab");
                if (hasReactGrabAttr || hasReactGrabClass) {
                  toRemove.push(node);
                }
              }
              for (const node of toRemove) {
                try { node.remove(); } catch {}
              }
            } catch {}
          };

          const applyForceOffStyle = (on) => {
            const existing = document.getElementById(FORCE_OFF_STYLE_ID);
            if (!on) {
              if (existing) existing.remove();
              return;
            }
            const css = [
              ".react-grab-toolbar, [class*='react-grab-toolbar'], [data-react-grab-toolbar='true'] { display: none !important; pointer-events: none !important; }",
              "[data-react-grab-overlay='true'] { display: none !important; pointer-events: none !important; }",
            ].join("\\n");
            if (existing) {
              existing.textContent = css;
              return;
            }
            const style = document.createElement("style");
            style.id = FORCE_OFF_STYLE_ID;
            style.textContent = css;
            (document.head || document.documentElement).appendChild(style);
          };

          const applyLayoutLock = (on) => {
            const existing = document.getElementById(LAYOUT_LOCK_STYLE_ID);
            if (!on) {
              if (existing) existing.remove();
              return;
            }

            const viewportWidth = Math.max(
              window.innerWidth || 0,
              document.documentElement?.clientWidth || 0
            );
            if (!viewportWidth) return;

            const css = [
              "html, body { min-width: " + viewportWidth + "px !important; }",
              "body { overflow-x: hidden !important; }",
            ].join("\\n");

            if (existing) {
              existing.textContent = css;
              return;
            }

            const style = document.createElement("style");
            style.id = LAYOUT_LOCK_STYLE_ID;
            style.textContent = css;
            (document.head || document.documentElement).appendChild(style);
          };

          const emitSelection = (content) => {
            try {
              console.warn(PREFIX + encodeURIComponent(String(content || "")));
            } catch (err) {
              console.error("[1code Inspector] emit selection failed", err);
            }
          };

          const hasAnyMethod = (obj, methods) => {
            if (!obj) return false;
            return methods.some((method) => typeof obj[method] === "function");
          };

            const setup = (api) => {
            if (!api) return { ready: false, active: false };
            window.reactGrabApi = api;

            const setApiEnabled = (targetApi, on) => {
              if (!targetApi || typeof targetApi.setEnabled !== "function") return;
              try { targetApi.setEnabled(Boolean(on)); } catch {}
            };

            const setToolbarEnabled = (targetApi, on) => {
              if (!targetApi || typeof targetApi.setOptions !== "function") return;
              try {
                targetApi.setOptions({
                  theme: {
                    toolbar: {
                      enabled: Boolean(on),
                    },
                  },
                });
              } catch {}
            };

            const setToolbarState = (targetApi, on) => {
              if (!targetApi || typeof targetApi.setToolbarState !== "function") return;
              try {
                targetApi.setToolbarState({
                  enabled: Boolean(on),
                  collapsed: !on,
                });
              } catch {}
            };

            const applyApiEnabledState = (targetApi, on) => {
              if (!targetApi) return;
              const enableMethods = ["activate", "enable", "start", "open"];
              const disableMethods = ["deactivate", "disable", "stop", "close"];
              const methods = on ? enableMethods : disableMethods;
              let invoked = false;
              setApiEnabled(targetApi, on);
              setToolbarEnabled(targetApi, on);
              setToolbarState(targetApi, on);
              for (const method of methods) {
                if (typeof targetApi[method] === "function") {
                  try {
                    targetApi[method]();
                    invoked = true;
                  } catch {}
                }
              }
              return invoked;
            };

            if (!window.__1codeInspectorPluginRegistered && typeof api.registerPlugin === "function") {
              api.registerPlugin({
                name: "1code-webview",
                hooks: {
                  onCopySuccess: (...args) => {
                    let content = "";
                    for (const arg of args) {
                      if (typeof arg === "string") { content = arg; break; }
                    }
                    if (!content) {
                      for (const arg of args) {
                        if (arg && typeof arg === "object") {
                          if (typeof arg.content === "string") { content = arg.content; break; }
                          if (typeof arg.text === "string") { content = arg.text; break; }
                        }
                      }
                    }
                    if (content) emitSelection(content);
                  }
                }
              });
              window.__1codeInspectorPluginRegistered = true;
            }

            const isEnabled = Boolean(window.__1codeInspectorEnabled);
            const invoked = applyApiEnabledState(api, isEnabled);
            return {
              ready: true,
              active: isEnabled ? invoked : true,
            };
          };

          const getCurrentApi = () => {
            const candidates = [window.reactGrabApi, window.__REACT_GRAB__];
            for (const candidate of candidates) {
              if (
                hasAnyMethod(candidate, ["activate", "enable", "start", "open", "deactivate", "disable", "stop", "close"]) ||
                typeof candidate?.registerPlugin === "function"
              ) {
                return candidate;
              }
            }
            return null;
          };

          const forceDeactivate = () => {
            const api = getCurrentApi();
            if (api) {
              if (typeof api.setEnabled === "function") {
                try { api.setEnabled(false); } catch {}
              }
              if (typeof api.setOptions === "function") {
                try {
                  api.setOptions({
                    theme: {
                      toolbar: {
                        enabled: false,
                      },
                    },
                  });
                } catch {}
              }
              if (typeof api.setToolbarState === "function") {
                try {
                  api.setToolbarState({
                    enabled: false,
                    collapsed: true,
                  });
                } catch {}
              }
              const methods = ["deactivate", "disable", "stop", "close"];
              for (const method of methods) {
                if (typeof api[method] === "function") {
                  try { api[method](); } catch {}
                }
              }
            }
            removeReactGrabDomArtifacts();
            applyForceOffStyle(true);
            applyLayoutLock(false);
          };

          // Disabled mode is strict opt-out: do not load/init React Grab automatically.
          if (!enabled) {
            forceDeactivate();
            return { ok: true, active: false, reason: "disabled" };
          }

          // Enabled: remove hard-off style and continue with init/load path.
          applyForceOffStyle(false);
          applyLayoutLock(true);

          const initIfAvailable = () => {
            const existingApi = getCurrentApi();
            if (existingApi) return setup(existingApi);
            if (window.ReactGrab && typeof window.ReactGrab.init === "function") {
              const api = window.ReactGrab.init({
                onElementSelect: (element) => {
                  try {
                    if (window.reactGrabApi && typeof window.reactGrabApi.copyElement === "function") {
                      window.reactGrabApi.copyElement(element);
                    }
                  } catch {}
                }
              });
              return setup(api);
            }
            return { ready: false, active: false };
          };

          const immediate = initIfAvailable();
          if (immediate.ready) {
            return { ok: immediate.active, active: immediate.active, reason: immediate.active ? "ready" : "methods-missing" };
          }

          const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
          if (!head) return { ok: false, active: false, reason: "no-head" };

          if (!document.querySelector('link[href*="react-grab"]')) {
            const css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = "https://cdn.jsdelivr.net/npm/react-grab@latest/dist/styles.css";
            head.appendChild(css);
          }

          const SCRIPT_URLS = [
            "https://cdn.jsdelivr.net/npm/react-grab@latest/dist/index.global.js",
            "https://unpkg.com/react-grab@latest/dist/index.global.js",
          ];

          const removeExistingReactGrabScripts = () => {
            const existing = Array.from(document.querySelectorAll("script[src*='react-grab']"));
            for (const node of existing) {
              try { node.remove(); } catch {}
            }
          };

          const loadScript = async () => {
            // If API already exists, don't inject again.
            if (window.ReactGrab || window.__REACT_GRAB__ || window.reactGrabApi) {
              return true;
            }

            removeExistingReactGrabScripts();

            for (const src of SCRIPT_URLS) {
              const loaded = await new Promise((resolve) => {
                const scriptTag = document.createElement("script");
                scriptTag.src = src;
                scriptTag.async = true;
                scriptTag.onload = () => resolve(true);
                scriptTag.onerror = () => resolve(false);
                head.appendChild(scriptTag);
              });

              if (loaded && (window.ReactGrab || window.__REACT_GRAB__)) {
                return true;
              }
            }

            return false;
          };

          const loaded = await loadScript();
          if (!loaded) return { ok: false, active: false, reason: "script-load-failed" };

          for (let i = 0; i < 8; i++) {
            const result = initIfAvailable();
            if (result.ready) {
              return { ok: result.active, active: result.active, reason: result.active ? "activated" : "methods-missing" };
            }
            await new Promise((resolve) => setTimeout(resolve, 80));
          }

          return { ok: false, active: false, reason: "api-not-ready" };
        } catch (err) {
          console.error("[1code Inspector] webview injection failed", err);
          return { ok: false, active: false, reason: "exception" };
        }
      })();
    `

    executeInWebview(script, true)
        .then((result) => {
        const active = Boolean(result && typeof result === "object" ? (result as any).active : result)
        const reason =
          result && typeof result === "object" && "reason" in (result as any)
            ? String((result as any).reason)
            : ""
        if (inspectorEnabled || reason !== "disabled") {
          pushPreviewLog(
            active ? "info" : "warn",
            "inspector",
            "activation-result",
            reason || (active ? "active" : "inactive"),
          )
        }
        if (active && inspectorEnabled) {
          const isMac = window.desktopApi.platform === "darwin"
          const shortcut = isMac ? "⌘C" : "Ctrl+C"
          toast.success("Inspector Mode Active", {
            description: `Hover over any element and press ${shortcut} to select it`,
          })
        } else if (!active && inspectorEnabled) {
          pushPreviewLog("warn", "inspector", "activation-incomplete", reason || "unknown")
          toast.error("Inspector Mode Failed", {
            description: `Inspector did not activate (${reason || "unknown"}).`,
          })
        }
      })
      .catch((error) => {
        pushPreviewLog("error", "inspector", "webview-inject-failed", error)
      })
  }, [executeInWebview, webviewEl, webviewDomReady, inspectorEnabled, pushPreviewLog])

  // Inspector Mode: Clipboard fallback (React Grab copies to clipboard on select)
  useEffect(() => {
    if (!inspectorEnabled || !window.desktopApi?.clipboardRead) return

    let isActive = true
    const pollInterval = 500

    const pollClipboard = async () => {
      try {
        const text = await window.desktopApi.clipboardRead()
        if (!isActive || !text || text === lastInspectorClipboardRef.current) return

        const hasSignature = /in .+ at .+:\d+:\d+/.test(text) || text.includes("<HTML>")
        if (!hasSignature) return

        lastInspectorClipboardRef.current = text

        dispatchInspectorSelection(chatId, text)
      } catch {
        // Ignore clipboard polling errors
      }
    }

    const intervalId = window.setInterval(pollClipboard, pollInterval)
    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [inspectorEnabled, chatId])

  return (
    <div
      className={cn(
        "flex flex-col bg-tl-background",
        isMobile ? "h-full w-full" : "h-full",
      )}
    >
      {/* Mobile Header */}
      {isMobile && !hideHeader && (
        <div
          className="flex-shrink-0 bg-background/95 backdrop-blur border-b h-11 min-h-[44px] max-h-[44px]"
          data-mobile-preview-header
          style={{
            // @ts-expect-error - WebKit-specific property for Electron window dragging
            WebkitAppRegion: "drag",
          }}
        >
          <div
            className="flex h-full items-center px-2 gap-2"
            style={{
              // @ts-expect-error - WebKit-specific property
              WebkitAppRegion: "no-drag",
            }}
          >
            {/* Chat button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md"
            >
              <IconChatBubble className="h-4 w-4" />
              <span className="sr-only">Back to chat</span>
            </Button>

            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavBack}
              disabled={!canGoBack}
              className="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md disabled:opacity-30"
              title="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavForward}
              disabled={!canGoForward}
              className="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md disabled:opacity-30"
              title="Go forward"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Reload button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReload}
              disabled={isRefreshing}
              className="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md"
              title="Refresh"
            >
              <RotateCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </Button>

            {/* Hard Reload button */}
            <Button
              variant="ghost"
              onClick={handleHardReload}
              disabled={isRefreshing}
              className="h-7 px-1.5 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md gap-0.5"
              title="Hard Refresh (Cmd+Shift+R) - Clear cache"
            >
              <RefreshCcwDot
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
              <span className="text-[10px] font-medium text-muted-foreground">HR</span>
            </Button>

            {/* URL Input - centered, flexible */}
            <div className="flex-1 min-w-0 mx-1">
              <PreviewUrlInput
                baseHost={baseHost}
                currentPath={currentPath}
                onPathChange={handlePathSelect}
                isLoading={!isLoaded}
                className="w-full"
                variant="mobile"
                fullUrl={editableCustomUrl || undefined}
                onFullUrlChange={handleCustomUrlChange}
              />
            </div>

            {/* Inspector Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleInspectorToggle}
              aria-pressed={inspectorEnabled}
              className={cn(
                "h-7 w-7 flex-shrink-0 rounded-md transition-[background-color,color] duration-150",
                inspectorEnabled
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={inspectorEnabled ? "Disable Inspector" : "Enable Inspector"}
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenPreviewDevTools}
              className="h-7 w-7 flex-shrink-0 rounded-md"
              title="Open Preview DevTools"
              disabled={!webviewDomReady}
            >
              <Code className="h-4 w-4" />
            </Button>

            {/* Scale control */}
            <ScaleControl value={scale} onChange={setScale} />

            {/* Copy link button */}
            <MobileCopyLinkButton url={previewUrl} />
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && !hideHeader && (
        <div className="flex items-center justify-between px-3 h-10 bg-tl-background flex-shrink-0">
          {/* Left: Back/Forward + Refresh + Hard Refresh + Viewport Toggle + Scale */}
          <div className="flex items-center gap-1 flex-1">
            {/* Navigation buttons */}
            <Button
              variant="ghost"
              onClick={handleNavBack}
              disabled={!canGoBack}
              className="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md disabled:opacity-30"
              title="Go back"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              onClick={handleNavForward}
              disabled={!canGoForward}
              className="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md disabled:opacity-30"
              title="Go forward"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              onClick={handleReload}
              disabled={isRefreshing}
              className="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md"
              title="Refresh"
            >
              <RotateCw
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground",
                  isRefreshing && "animate-spin",
                )}
              />
            </Button>

            <Button
              variant="ghost"
              onClick={handleHardReload}
              disabled={isRefreshing}
              className="h-7 px-1.5 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md gap-0.5"
              title="Hard Refresh (Cmd+Shift+R) - Clear cache"
            >
              <RefreshCcwDot
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground",
                  isRefreshing && "animate-spin",
                )}
              />
              <span className="text-[10px] font-medium text-muted-foreground">HR</span>
            </Button>

            <ViewportToggle value={viewportMode} onChange={setViewportMode} />

            <ScaleControl value={scale} onChange={setScale} />
          </div>

          {/* Center: URL bar */}
          <div className="flex-1 mx-2 min-w-0 flex items-center justify-center">
            <PreviewUrlInput
              baseHost={baseHost}
              currentPath={currentPath}
              onPathChange={handlePathSelect}
              isLoading={!isLoaded}
              className="max-w-[350px] w-full"
              fullUrl={editableCustomUrl || undefined}
              onFullUrlChange={handleCustomUrlChange}
            />
          </div>

          {/* Right: Inspector + External link + Mode toggle + Close */}
          <div className="flex items-center justify-end gap-1 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-7 px-2 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md gap-1.5"
                  title="Preview logs"
                >
                  <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">
                    Logs{previewLogs.length > 0 ? ` (${previewLogs.length})` : ""}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[440px] p-0">
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-xs font-medium">Preview Logs</p>
                  <p className="text-[11px] text-muted-foreground truncate">{previewUrl}</p>
                </div>
                <div className="px-2 py-2 border-b border-border/50 flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1.5"
                    onClick={copyPreviewLogs}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy for Agent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1.5"
                    onClick={() => {
                      clearPreviewLogs()
                      setReloadKey((prev) => prev + 1)
                    }}
                    title="Clear logs and reload preview to capture fresh logs"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1.5"
                    onClick={clearPreviewLogs}
                    disabled={previewLogs.length === 0}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                </div>
                <div className="max-h-[320px] overflow-y-auto p-2 space-y-1.5">
                  {latestPreviewLogs.length === 0 ? (
                    <div className="text-xs text-muted-foreground px-1 py-2">
                      No logs captured yet.
                    </div>
                  ) : (
                    latestPreviewLogs.map((entry) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "rounded border px-2 py-1.5 text-[11px] leading-relaxed",
                          entry.level === "error"
                            ? "border-red-500/40 bg-red-500/5"
                            : "border-border/50 bg-background"
                        )}
                      >
                        <div className="text-[10px] text-muted-foreground mb-0.5">
                          {new Date(entry.timestamp).toLocaleTimeString()} • {entry.level.toUpperCase()} • {entry.source}
                        </div>
                        <div className="whitespace-pre-wrap break-words font-mono">
                          {entry.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleInspectorToggle}
              aria-pressed={inspectorEnabled}
              className={cn(
                "h-7 w-7 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] rounded-md",
                inspectorEnabled
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={
                inspectorEnabled
                  ? "Disable Inspector"
                  : "Enable Inspector"
              }
            >
              <MousePointer2 className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenPreviewDevTools}
              className="h-7 w-7 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md"
              title="Open Preview DevTools"
              disabled={!webviewDomReady}
            >
              <Code className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md"
              onClick={() => window.open(previewUrl, "_blank")}
            >
              <ExternalLinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>

            {onClose && (
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md"
                onClick={onClose}
              >
                <IconDoubleChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Device presets bar - only visible in mobile viewport mode (not on actual mobile devices) */}
      {!isMobile && !hideHeader && viewportMode === "mobile" && (
        <DevicePresetsBar
          selectedPreset={device.preset}
          width={device.width}
          height={device.height}
          onPresetChange={handlePresetChange}
          onWidthChange={handleWidthChange}
          maxWidth={maxWidth}
        />
      )}

      {/* Content area */}
      <div
        className={cn(
          "flex-1 relative flex items-center justify-center overflow-hidden",
          isMobile ? "w-full h-full" : "px-1 pb-1",
        )}
      >
        {isMobile ? (
          // Mobile: Fullscreen webview with scale support
          <div className="relative overflow-hidden w-full h-full flex-shrink-0 bg-background">
            <div
              className="w-full h-full"
              style={
                scale !== 100
                  ? {
                      width: `${(100 / scale) * 100}%`,
                      height: `${(100 / scale) * 100}%`,
                      transform: `scale(${scale / 100})`,
                      transformOrigin: "top left",
                    }
                  : undefined
              }
            >
              {createElement("webview" as any, {
                key: reloadKey,
                ref: handleWebviewRef,
                src: previewUrl,
                partition: "persist:main",
                allowpopups: "true",
                className: "w-full h-full",
                style: { border: "none" },
              })}
            </div>
            {/* Loading overlay */}
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10 pointer-events-none">
                <div className="w-6 h-6 animate-pulse">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="21st logo"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M358.333 0C381.345 0 400 18.6548 400 41.6667V295.833C400 298.135 398.134 300 395.833 300H270.833C268.532 300 266.667 301.865 266.667 304.167V395.833C266.667 398.134 264.801 400 262.5 400H41.6667C18.6548 400 0 381.345 0 358.333V304.72C0 301.793 1.54269 299.081 4.05273 297.575L153.76 207.747C157.159 205.708 156.02 200.679 152.376 200.065L151.628 200H4.16667C1.86548 200 6.71103e-08 198.135 0 195.833V104.167C1.07376e-06 101.865 1.86548 100 4.16667 100H162.5C164.801 100 166.667 98.1345 166.667 95.8333V4.16667C166.667 1.86548 168.532 1.00666e-07 170.833 0H358.333ZM170.833 100C168.532 100 166.667 101.865 166.667 104.167V295.833C166.667 298.135 168.532 300 170.833 300H262.5C264.801 300 266.667 298.135 266.667 295.833V104.167C266.667 101.865 264.801 100 262.5 100H170.833Z"
                      fill="currentColor"
                      className="text-muted-foreground"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Left resize handle - only in mobile viewport mode (not on actual mobile devices) */}
            {viewportMode === "mobile" && (
              <ResizeHandle
                side="left"
                onPointerDown={handleResizeStart}
                isResizing={isResizing}
              />
            )}

            {/* Frame with dynamic size */}
            <div
              ref={frameRef}
              className={cn(
                "relative overflow-hidden flex-shrink-0 bg-background",
                !isResizing &&
                  "transition-[width,height,margin] duration-300 ease-in-out",
                viewportMode === "desktop"
                  ? "border-[0.5px] rounded-sm"
                  : "shadow-lg border",
              )}
              style={{
                width:
                  viewportMode === "desktop" ? "100%" : `${device.width}px`,
                height: "100%",
                maxHeight:
                  viewportMode === "mobile" ? `${device.height}px` : "100%",
                marginLeft: viewportMode === "mobile" ? "16px" : "0",
                marginRight: viewportMode === "mobile" ? "16px" : "0",
                borderRadius: viewportMode === "desktop" ? "8px" : "24px",
              }}
            >
              {/* Scale transform wrapper */}
              <div
                className="w-full h-full"
                style={
                  scale !== 100
                    ? {
                        width: `${(100 / scale) * 100}%`,
                        height: `${(100 / scale) * 100}%`,
                        transform: `scale(${scale / 100})`,
                        transformOrigin: "top left",
                      }
                    : undefined
                }
              >
                {createElement("webview" as any, {
                  key: reloadKey,
                  ref: handleWebviewRef,
                  src: previewUrl,
                  partition: "persist:main",
                  allowpopups: "true",
                  className: "w-full h-full",
                  style: {
                    border: "none",
                    borderRadius: viewportMode === "desktop" ? "8px" : "24px",
                  },
                })}

                {/* Loading overlay */}
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background z-10 pointer-events-none rounded-[inherit]">
                    <div className="w-6 h-6 animate-pulse">
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 400 400"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-label="21st logo"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M358.333 0C381.345 0 400 18.6548 400 41.6667V295.833C400 298.135 398.134 300 395.833 300H270.833C268.532 300 266.667 301.865 266.667 304.167V395.833C266.667 398.134 264.801 400 262.5 400H41.6667C18.6548 400 0 381.345 0 358.333V304.72C0 301.793 1.54269 299.081 4.05273 297.575L153.76 207.747C157.159 205.708 156.02 200.679 152.376 200.065L151.628 200H4.16667C1.86548 200 6.71103e-08 198.135 0 195.833V104.167C1.07376e-06 101.865 1.86548 100 4.16667 100H162.5C164.801 100 166.667 98.1345 166.667 95.8333V4.16667C166.667 1.86548 168.532 1.00666e-07 170.833 0H358.333ZM170.833 100C168.532 100 166.667 101.865 166.667 104.167V295.833C166.667 298.135 168.532 300 170.833 300H262.5C264.801 300 266.667 298.135 266.667 295.833V104.167C266.667 101.865 264.801 100 262.5 100H170.833Z"
                          fill="currentColor"
                          className="text-muted-foreground"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right resize handle - only in mobile viewport mode (not on actual mobile devices) */}
            {viewportMode === "mobile" && (
              <ResizeHandle
                side="right"
                onPointerDown={handleResizeStart}
                isResizing={isResizing}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
