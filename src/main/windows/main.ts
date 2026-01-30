import {
  BrowserWindow,
  shell,
  nativeTheme,
  ipcMain,
  app,
  clipboard,
  session,
  nativeImage,
} from "electron"
import { join } from "path"
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs"
import { createIPCHandler } from "trpc-electron/main"
import { createAppRouter } from "../lib/trpc/routers"
import { getAuthManager, handleAuthCode, getBaseUrl } from "../index"
import { registerGitWatcherIPC } from "../lib/git/watcher"
import { registerThemeScannerIPC } from "../lib/vscode-theme-scanner"
import { windowManager } from "./window-manager"

// Helper to get window from IPC event
function getWindowFromEvent(
  event: Electron.IpcMainInvokeEvent,
): BrowserWindow | null {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  return win && !win.isDestroyed() ? win : null
}

// Register IPC handlers for window operations (only once)
let ipcHandlersRegistered = false

function registerIpcHandlers(): void {
  if (ipcHandlersRegistered) return
  ipcHandlersRegistered = true

  // App info
  ipcMain.handle("app:version", () => app.getVersion())
  ipcMain.handle("app:isPackaged", () => app.isPackaged)

  // Windows: Frame preference persistence
  ipcMain.handle("window:set-frame-preference", (_event, useNativeFrame: boolean) => {
    try {
      const settingsPath = join(app.getPath("userData"), "window-settings.json")
      const settingsDir = app.getPath("userData")
      mkdirSync(settingsDir, { recursive: true })
      writeFileSync(settingsPath, JSON.stringify({ useNativeFrame }, null, 2))
      return true
    } catch (error) {
      console.error("[Main] Failed to save frame preference:", error)
      return false
    }
  })

  // Windows: Get current window frame state
  ipcMain.handle("window:get-frame-state", () => {
    if (process.platform !== "win32") return false
    try {
      const settingsPath = join(app.getPath("userData"), "window-settings.json")
      if (existsSync(settingsPath)) {
        const settings = JSON.parse(readFileSync(settingsPath, "utf-8"))
        return settings.useNativeFrame === true
      }
      return false // Default: frameless
    } catch {
      return false
    }
  })

  // Note: Update checking is now handled by auto-updater module (lib/auto-updater.ts)
  ipcMain.handle("app:set-badge", (event, count: number | null) => {
    const win = getWindowFromEvent(event)
    if (process.platform === "darwin") {
      app.dock.setBadge(count ? String(count) : "")
    } else if (process.platform === "win32" && win) {
      // Windows: Update title with count as fallback
      if (count !== null && count > 0) {
        win.setTitle(`1Code (${count})`)
      } else {
        win.setTitle("1Code")
        win.setOverlayIcon(null, "")
      }
    }
  })

  // Windows: Badge overlay icon
  ipcMain.handle("app:set-badge-icon", (event, imageData: string | null) => {
    const win = getWindowFromEvent(event)
    if (process.platform === "win32" && win) {
      if (imageData) {
        const image = nativeImage.createFromDataURL(imageData)
        win.setOverlayIcon(image, "New messages")
      } else {
        win.setOverlayIcon(null, "")
      }
    }
  })

  ipcMain.handle(
    "app:show-notification",
    (event, options: { title: string; body: string }) => {
      try {
        const { Notification } = require("electron")
        const iconPath = join(__dirname, "../../../build/icon.ico")
        const icon = existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined

        const notification = new Notification({
          title: options.title,
          body: options.body,
          icon,
          ...(process.platform === "win32" && { silent: false }),
        })

        notification.show()

        notification.on("click", () => {
          const win = getWindowFromEvent(event)
          if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
          }
        })
      } catch (error) {
        console.error("[Main] Failed to show notification:", error)
      }
    },
  )

  // API base URL for fetch requests
  ipcMain.handle("app:get-api-base-url", () => getBaseUrl())

  // Window controls - use event.sender to identify window
  ipcMain.handle("window:minimize", (event) => {
    getWindowFromEvent(event)?.minimize()
  })
  ipcMain.handle("window:maximize", (event) => {
    const win = getWindowFromEvent(event)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })
  ipcMain.handle("window:close", (event) => {
    getWindowFromEvent(event)?.close()
  })
  ipcMain.handle("window:is-maximized", (event) => {
    return getWindowFromEvent(event)?.isMaximized() ?? false
  })
  ipcMain.handle("window:toggle-fullscreen", (event) => {
    const win = getWindowFromEvent(event)
    if (win) {
      win.setFullScreen(!win.isFullScreen())
    }
  })
  ipcMain.handle("window:is-fullscreen", (event) => {
    return getWindowFromEvent(event)?.isFullScreen() ?? false
  })

  // Traffic light visibility control (for hybrid native/custom approach)
  ipcMain.handle(
    "window:set-traffic-light-visibility",
    (event, visible: boolean) => {
      const win = getWindowFromEvent(event)
      if (win && process.platform === "darwin") {
        // In fullscreen, always show native traffic lights (don't let React hide them)
        if (win.isFullScreen()) {
          win.setWindowButtonVisibility(true)
        } else {
          win.setWindowButtonVisibility(visible)
        }
      }
    },
  )

  // Zoom controls
  ipcMain.handle("window:zoom-in", (event) => {
    const win = getWindowFromEvent(event)
    if (win) {
      const zoom = win.webContents.getZoomFactor()
      win.webContents.setZoomFactor(Math.min(zoom + 0.1, 3))
    }
  })
  ipcMain.handle("window:zoom-out", (event) => {
    const win = getWindowFromEvent(event)
    if (win) {
      const zoom = win.webContents.getZoomFactor()
      win.webContents.setZoomFactor(Math.max(zoom - 0.1, 0.5))
    }
  })
  ipcMain.handle("window:zoom-reset", (event) => {
    getWindowFromEvent(event)?.webContents.setZoomFactor(1)
  })
  ipcMain.handle("window:get-zoom", (event) => {
    return getWindowFromEvent(event)?.webContents.getZoomFactor() ?? 1
  })

  // New window - optionally open with specific chat/subchat
  ipcMain.handle("window:new", (_event, options?: { chatId?: string; subChatId?: string }) => {
    createWindow(options)
  })

  // Set window title
  ipcMain.handle("window:set-title", (event, title: string) => {
    const win = getWindowFromEvent(event)
    if (win) {
      // Show just the title, or default app name if empty
      win.setTitle(title || "1Code")
    }
  })

  // DevTools - only allowed in dev mode or when unlocked
  ipcMain.handle("window:toggle-devtools", (event) => {
    const win = getWindowFromEvent(event)
    // Check if devtools are unlocked (or in dev mode)
    const isUnlocked = !app.isPackaged || (global as any).__devToolsUnlocked
    if (win && isUnlocked) {
      win.webContents.toggleDevTools()
    }
  })

  // Unlock DevTools (hidden feature - 5 clicks on Beta tab)
  ipcMain.handle("window:unlock-devtools", () => {
    // Mark as unlocked locally for IPC check
    ;(global as any).__devToolsUnlocked = true
    // Call the global function to rebuild menu
    if ((global as any).__unlockDevTools) {
      ;(global as any).__unlockDevTools()
    }
  })

  // Analytics
  ipcMain.handle("analytics:set-opt-out", async (_event, optedOut: boolean) => {
    const { setOptOut } = await import("../lib/analytics")
    setOptOut(optedOut)
  })

  // Shell
  ipcMain.handle("shell:open-external", (_event, url: string) =>
    shell.openExternal(url),
  )

  // Clipboard
  ipcMain.handle("clipboard:write", (_event, text: string) =>
    clipboard.writeText(text),
  )
  ipcMain.handle("clipboard:read", () => clipboard.readText())

  // Clear cache for hard refresh
  ipcMain.handle("cache:clear", async () => {
    try {
      await session.defaultSession.clearCache()
      console.log("[Cache] Cache cleared successfully")
      return true
    } catch (error) {
      console.error("[Cache] Failed to clear cache:", error)
      return false
    }
  })

  // Inspector Mode - inject script into iframe (via iframe frame execution)
  ipcMain.handle("inspector:inject", async (_event, iframeUrl: string, enabled: boolean) => {
    const win = getWindow()
    if (!win) {
      console.error("[Inspector] No window available")
      return false
    }

    console.log("[Inspector] Injecting React Grab into iframe with URL:", iframeUrl, "enabled:", enabled)

    const targetHost = (() => {
      try {
        return new URL(iframeUrl).host
      } catch {
        return ""
      }
    })()

    const matchesFrame = (frameUrl: string) => {
      if (!frameUrl) return false
      if (frameUrl.startsWith("chrome-error://")) return false
      if (frameUrl === iframeUrl || frameUrl.startsWith(iframeUrl)) return true
      try {
        const parsed = new URL(frameUrl)
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false
        return parsed.host === targetHost
      } catch {
        return false
      }
    }

    const findTargetFrame = () => {
      const frames = win.webContents.mainFrame.frames
      return frames.find((frame) => matchesFrame(frame.url))
    }

    const inspectorScript = `
      (function() {
        try {
          console.log('[1code Inspector] Running in frame:', window.location.href);

          // Skip injection on error pages or incomplete documents
          if (window.location.href.startsWith('chrome-error://') || !document.documentElement) {
            console.log('[1code Inspector] Skipping - invalid or incomplete document');
            return false;
          }

          const enabled = ${enabled};

          const postError = (type, error) => {
            try {
              window.parent.postMessage({ type, error }, '*');
            } catch (err) {
              console.error('[1code Inspector] Failed to post message to parent', err);
            }
          };

          if (window.__1codeReactGrabInjected && window.reactGrabApi) {
            console.log('[1code Inspector] Already injected, toggling to:', enabled);
            if (enabled) {
              window.reactGrabApi.activate();
            } else {
              window.reactGrabApi.deactivate();
            }
            return true;
          }

          if (window.__1codeReactGrabInjected && !window.reactGrabApi) {
            console.warn('[1code Inspector] Marker set but API missing; reinitializing.');
            window.__1codeReactGrabInjected = false;
          }

          const ensureHead = () =>
            document.head || document.getElementsByTagName('head')[0] || document.documentElement;

          const insertStyles = () => {
            const href = 'https://cdn.jsdelivr.net/npm/react-grab@latest/dist/styles.css';
            if (!document.querySelector('link[rel="stylesheet"][href*="react-grab"]')) {
              const head = ensureHead();
              if (!head) {
                console.warn('[1code Inspector] No head element available, skipping styles');
                return;
              }
              const styleLink = document.createElement('link');
              styleLink.rel = 'stylesheet';
              styleLink.href = href;
              styleLink.onload = () => console.log('[1code Inspector] CSS loaded');
              styleLink.onerror = (e) => console.error('[1code Inspector] CSS failed to load', e);
              head.appendChild(styleLink);
            }
          };

          const initReactGrab = () => {
            let attempts = 0;
            const checkReactGrab = () => {
              attempts += 1;
              if (window.ReactGrab) {
                console.log('[1code Inspector] ReactGrab found, initializing');
                try {
                  const handleCopySuccess = (elements, content) => {
                    console.log('[1code Inspector] Component selected:', content);
                    window.parent.postMessage({
                      type: 'INSPECTOR_ELEMENT_SELECTED',
                      data: { content, elements }
                    }, '*');
                  };

                  window.reactGrabApi = window.ReactGrab.init({
                    onElementSelect: (element) => {
                      try {
                        if (window.reactGrabApi && typeof window.reactGrabApi.copyElement === 'function') {
                          window.reactGrabApi.copyElement(element);
                        }
                      } catch (error) {
                        console.error('[1code Inspector] Failed to copy selected element', error);
                      }
                    },
                    onCopySuccess: handleCopySuccess
                  });

                  const registerPluginTarget =
                    window.reactGrabApi && typeof window.reactGrabApi.registerPlugin === 'function'
                      ? window.reactGrabApi
                      : window.ReactGrab && typeof window.ReactGrab.registerPlugin === 'function'
                        ? window.ReactGrab
                        : null

                  if (registerPluginTarget) {
                    registerPluginTarget.registerPlugin({
                      name: '1code-integration',
                      hooks: {
                        onCopySuccess: handleCopySuccess
                      }
                    });
                  }

                  if (enabled && window.reactGrabApi && typeof window.reactGrabApi.activate === 'function') {
                    window.reactGrabApi.activate();
                  }

                  window.__1codeReactGrabInjected = true;
                  return;
                } catch (error) {
                  console.error('[1code Inspector] Failed to initialize', error);
                  postError('INSPECTOR_INIT_ERROR', error && error.message ? error.message : String(error));
                  return;
                }
              }

              if (attempts < 50) {
                setTimeout(checkReactGrab, 100);
              } else {
                console.error('[1code Inspector] ReactGrab not found after 5s');
                postError('INSPECTOR_INIT_ERROR', 'ReactGrab not found on window');
              }
            };

            checkReactGrab();
          };

          const loadScript = () => {
            const src = 'https://cdn.jsdelivr.net/npm/react-grab@latest/dist/index.global.js';
            if (document.querySelector('script[src*="react-grab"]')) {
              console.log('[1code Inspector] Script already present');
              initReactGrab();
              return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.async = true;
            script.onload = () => {
              console.log('[1code Inspector] Script loaded');
              initReactGrab();
            };
            script.onerror = (error) => {
              console.error('[1code Inspector] Failed to load React Grab', error);
              postError('INSPECTOR_LOAD_ERROR', 'Failed to load React Grab script');
            };
            const head = ensureHead();
            if (!head) {
              console.warn('[1code Inspector] No head element available, skipping script load');
              return;
            }
            head.appendChild(script);
          };

          insertStyles();
          loadScript();
          return true;
        } catch (err) {
          console.error('[1code Inspector] Error injecting React Grab', err);
          return false;
        }
      })();
    `

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const maxAttempts = 50

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const targetFrame = findTargetFrame()

      if (!targetFrame) {
        await delay(100)
        continue
      }

      try {
        const result = await targetFrame.executeJavaScript(inspectorScript, true)
        console.log("[Inspector] Script execution result:", result)
        return result !== false
      } catch (error) {
        console.error("[Inspector] Failed to execute script in frame:", error)
        return false
      }
    }

    const frameUrls = win.webContents.mainFrame.frames
      .map((frame) => frame.url)
      .filter(Boolean)
    console.error("[Inspector] Could not find target iframe frame. Available frames:", frameUrls)
    return false
  })

  // Auth IPC handlers
  const validateSender = (event: Electron.IpcMainInvokeEvent): boolean => {
    const senderUrl = event.sender.getURL()
    try {
      const parsed = new URL(senderUrl)
      if (parsed.protocol === "file:") return true
      const hostname = parsed.hostname.toLowerCase()
      const trusted = ["21st.dev", "localhost", "127.0.0.1"]
      return trusted.some((h) => hostname === h || hostname.endsWith(`.${h}`))
    } catch {
      return false
    }
  }

  ipcMain.handle("auth:get-user", (event) => {
    if (!validateSender(event)) return null
    return getAuthManager().getUser()
  })

  ipcMain.handle("auth:is-authenticated", (event) => {
    if (!validateSender(event)) return false
    return getAuthManager().isAuthenticated()
  })

  ipcMain.handle("auth:logout", async (event) => {
    if (!validateSender(event)) return
    getAuthManager().logout()
    // Clear cookie from persist:main partition
    const ses = session.fromPartition("persist:main")
    try {
      await ses.cookies.remove(getBaseUrl(), "x-desktop-token")
      console.log("[Auth] Cookie cleared on logout")
    } catch (err) {
      console.error("[Auth] Failed to clear cookie:", err)
    }
    // Show login page in all windows
    for (const win of windowManager.getAll()) {
      showLoginPageInWindow(win)
    }
  })

  ipcMain.handle("auth:start-flow", (event) => {
    if (!validateSender(event)) return
    const win = getWindowFromEvent(event)
    getAuthManager().startAuthFlow(win)
  })

  ipcMain.handle("auth:submit-code", async (event, code: string) => {
    if (!validateSender(event)) return
    if (!code || typeof code !== "string") {
      getWindowFromEvent(event)?.webContents.send(
        "auth:error",
        "Invalid authorization code",
      )
      return
    }
    await handleAuthCode(code)
  })

  ipcMain.handle("auth:update-user", async (event, updates: { name?: string }) => {
    if (!validateSender(event)) return null
    try {
      return await getAuthManager().updateUser(updates)
    } catch (error) {
      console.error("[Auth] Failed to update user:", error)
      throw error
    }
  })

  ipcMain.handle("auth:get-token", async (event) => {
    if (!validateSender(event)) return null
    return getAuthManager().getValidToken()
  })

  // Signed fetch - proxies requests through main process (no CORS)
  ipcMain.handle(
    "api:signed-fetch",
    async (
      event,
      url: string,
      options?: { method?: string; body?: string; headers?: Record<string, string> },
    ) => {
      console.log("[SignedFetch] IPC handler called with URL:", url)
      if (!validateSender(event)) {
        console.log("[SignedFetch] Unauthorized sender")
        return { ok: false, status: 403, data: null, error: "Unauthorized sender" }
      }
      console.log("[SignedFetch] Sender validated OK")

      const token = await getAuthManager().getValidToken()
      console.log("[SignedFetch] Token:", token ? "present" : "missing", "URL:", url)
      if (!token) {
        return { ok: false, status: 401, data: null, error: "Not authenticated" }
      }

      try {
        const response = await fetch(url, {
          method: options?.method || "GET",
          body: options?.body,
          headers: {
            ...options?.headers,
            "X-Desktop-Token": token,
            "Content-Type": "application/json",
          },
        })

        const data = await response.json().catch(() => null)
        console.log("[SignedFetch] Response:", response.status, response.ok ? "OK" : "FAILED")

        return {
          ok: response.ok,
          status: response.status,
          data,
          error: response.ok ? null : `Request failed: ${response.status}`,
        }
      } catch (error) {
        console.log("[SignedFetch] Error:", error)
        return {
          ok: false,
          status: 0,
          data: null,
          error: error instanceof Error ? error.message : "Network error",
        }
      }
    },
  )

  // Streaming fetch - for SSE responses (chat streaming)
  // Uses a unique stream ID to match chunks with the right request
  ipcMain.handle(
    "api:stream-fetch",
    async (
      event,
      streamId: string,
      url: string,
      options?: { method?: string; body?: string; headers?: Record<string, string> },
    ) => {
      console.log("[StreamFetch] Starting stream:", streamId, url)
      if (!validateSender(event)) {
        console.log("[StreamFetch] Unauthorized sender")
        return { ok: false, status: 403, error: "Unauthorized sender" }
      }

      const token = await getAuthManager().getValidToken()
      if (!token) {
        return { ok: false, status: 401, error: "Not authenticated" }
      }

      try {
        const response = await fetch(url, {
          method: options?.method || "POST",
          body: options?.body,
          headers: {
            ...options?.headers,
            "X-Desktop-Token": token,
            "Content-Type": "application/json",
          },
        })

        console.log("[StreamFetch] Response:", response.status, response.ok)

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error")
          return { ok: false, status: response.status, error: errorText }
        }

        // Stream the response body back to renderer
        const reader = response.body?.getReader()
        if (!reader) {
          return { ok: false, status: 500, error: "No response body" }
        }

        // Send chunks asynchronously
        ;(async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                event.sender.send(`stream:${streamId}:done`)
                break
              }
              // Send chunk to renderer
              event.sender.send(`stream:${streamId}:chunk`, value)
            }
          } catch (err) {
            console.error("[StreamFetch] Stream error:", err)
            event.sender.send(`stream:${streamId}:error`, err instanceof Error ? err.message : "Stream error")
          }
        })()

        return { ok: true, status: response.status }
      } catch (error) {
        console.error("[StreamFetch] Fetch error:", error)
        return {
          ok: false,
          status: 0,
          error: error instanceof Error ? error.message : "Network error",
        }
      }
    },
  )

  // Register git watcher IPC handlers
  registerGitWatcherIPC()

  // Register VS Code theme scanner IPC handlers
  registerThemeScannerIPC()
}

/**
 * Show login page in a specific window
 */
function showLoginPageInWindow(window: BrowserWindow): void {
  console.log("[Main] Showing login page in window", window.id)

  // In dev mode, login.html is in src/renderer, not out/renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    // Dev mode: load from source directory
    const loginPath = join(app.getAppPath(), "src/renderer/login.html")
    console.log("[Main] Loading login from:", loginPath)
    window.loadFile(loginPath)
  } else {
    // Production: load from built output
    window.loadFile(join(__dirname, "../renderer/login.html"))
  }
}

/**
 * Show login page in the focused window (or first window)
 */
export function showLoginPage(): void {
  const win = windowManager.getFocused() || windowManager.getAll()[0]
  if (!win) return
  showLoginPageInWindow(win)
}

// Singleton IPC handler (prevents duplicate handlers on macOS window recreation)
let ipcHandler: ReturnType<typeof createIPCHandler> | null = null

/**
 * Get the focused window reference
 * Used by tRPC procedures that need window access
 */
export function getWindow(): BrowserWindow | null {
  return windowManager.getFocused()
}

/**
 * Get all windows
 */
export function getAllWindows(): BrowserWindow[] {
  return windowManager.getAll()
}

/**
 * Read window frame preference from settings file (Windows only)
 * Returns true if native frame should be used, false for frameless
 */
function getUseNativeFramePreference(): boolean {
  if (process.platform !== "win32") return false

  try {
    const settingsPath = join(app.getPath("userData"), "window-settings.json")
    if (existsSync(settingsPath)) {
      const settings = JSON.parse(readFileSync(settingsPath, "utf-8"))
      return settings.useNativeFrame === true
    }
    return false // Default: frameless (dark title bar)
  } catch {
    return false
  }
}

/**
 * Create a new application window
 * @param options Optional settings for the new window
 * @param options.chatId Open this chat in the new window
 * @param options.subChatId Open this sub-chat in the new window
 */
export function createWindow(options?: { chatId?: string; subChatId?: string }): BrowserWindow {
  // Register IPC handlers before creating first window
  registerIpcHandlers()

  // Read Windows frame preference
  const useNativeFrame = getUseNativeFramePreference()

  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 500, // Allow narrow mobile-like mode
    minHeight: 600,
    show: false,
    title: "1Code",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#09090b" : "#ffffff",
    // hiddenInset shows native traffic lights inset in the window
    // Start with traffic lights off-screen (custom ones shown in normal mode)
    // Native lights will be moved on-screen in fullscreen mode
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition:
      process.platform === "darwin" ? { x: 15, y: 12 } : undefined,
    // Windows: Use native frame or frameless based on user preference
    ...(process.platform === "win32" && {
      frame: useNativeFrame,
      autoHideMenuBar: true,
    }),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for electron-trpc
      webSecurity: true,
      partition: "persist:main", // Use persistent session for cookies
    },
  })

  // Register window with manager and get stable ID for localStorage namespacing
  const stableWindowId = windowManager.register(window)
  console.log(
    `[Main] Created window ${window.id} with stable ID "${stableWindowId}" (total: ${windowManager.count()})`,
  )

  // Configure CSP to allow localhost iframes (for preview feature)
  const ses = session.fromPartition("persist:main")

  // Enable webSecurity to allow iframe access
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(false)
    } else {
      callback(true)
    }
  })

  ses.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders }

    // Log CSP modifications for debugging
    const isLocalhost = details.url.includes('localhost') || details.url.includes('127.0.0.1')

    // Debug logging for localhost URLs to help diagnose iframe blocking issues
    if (isLocalhost) {
      console.log(`[CSP Debug] Headers for ${details.url}:`, Object.keys(responseHeaders))
    }

    // For localhost URLs, remove headers that block iframe embedding (case-insensitive)
    if (isLocalhost) {
      for (const key of Object.keys(responseHeaders)) {
        const lowerKey = key.toLowerCase()
        // Remove X-Frame-Options regardless of capitalization
        if (lowerKey === 'x-frame-options') {
          delete responseHeaders[key]
          console.log(`[CSP] Removed ${key} header for localhost`)
        }
        // Also remove Content-Security-Policy-Report-Only which can contain frame-ancestors
        if (lowerKey === 'content-security-policy-report-only') {
          delete responseHeaders[key]
          console.log(`[CSP] Removed ${key} header for localhost`)
        }
      }
    }

    // Find CSP header key case-insensitively
    const cspHeaderKey = Object.keys(responseHeaders).find(
      key => key.toLowerCase() === 'content-security-policy'
    )

    // Allow loading localhost in iframes and jsdelivr CDN by modifying CSP
    if (cspHeaderKey && responseHeaders[cspHeaderKey]) {
      const originalCSP = responseHeaders[cspHeaderKey]
      if (isLocalhost) {
        console.log(`[CSP] Found ${cspHeaderKey} header for ${details.url}`)
        console.log(`[CSP] Original value:`, originalCSP)
      }
      responseHeaders[cspHeaderKey] = (responseHeaders[cspHeaderKey] as string[]).map((csp: string) => {
        const addSources = (
          currentCsp: string,
          directive: string,
          sources: string[]
        ) => {
          const pattern = new RegExp(`${directive} ([^;]*)`)
          if (pattern.test(currentCsp)) {
            return currentCsp.replace(pattern, (_match, existing) => {
              const missing = sources.filter((source) => !existing.includes(source))
              if (missing.length === 0) return `${directive} ${existing}`
              return `${directive} ${existing} ${missing.join(" ")}`
            })
          }
          return `${currentCsp}; ${directive} ${sources.join(" ")}`
        }

        // Remove frame-ancestors directive for localhost (it blocks iframe embedding)
        const removeFrameAncestors = (currentCsp: string): string => {
          // Remove frame-ancestors directive entirely for localhost URLs
          return currentCsp.replace(/frame-ancestors\s+[^;]*(;|$)/gi, '')
        }

        let modifiedCSP = csp

        // For localhost URLs, remove frame-ancestors to allow embedding in our preview
        if (isLocalhost) {
          modifiedCSP = removeFrameAncestors(modifiedCSP)
          console.log(`[CSP] Removed frame-ancestors for localhost ${details.url}`)
        }

        modifiedCSP = addSources(modifiedCSP, "frame-src", [
          "'self'",
          "http://localhost:*",
          "http://127.0.0.1:*",
          "ws://localhost:*",
          "ws://127.0.0.1:*"
        ])
        modifiedCSP = addSources(modifiedCSP, "child-src", [
          "'self'",
          "http://localhost:*",
          "http://127.0.0.1:*"
        ])
        // For localhost, also allow unsafe-inline for inline scripts (needed by Next.js, React, etc.)
        const scriptSources = isLocalhost
          ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com"]
          : ["'self'", "https://cdn.jsdelivr.net", "https://unpkg.com"]

        modifiedCSP = addSources(modifiedCSP, "script-src-elem", scriptSources)
        modifiedCSP = addSources(modifiedCSP, "script-src", scriptSources)
        // For localhost, also allow WebSocket connections for hot reload
        const connectSources = isLocalhost
          ? ["'self'", "ws://localhost:*", "ws://127.0.0.1:*", "http://localhost:*", "http://127.0.0.1:*", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://www.react-grab.com"]
          : ["'self'", "https://cdn.jsdelivr.net", "https://unpkg.com"]

        modifiedCSP = addSources(modifiedCSP, "connect-src", connectSources)
        modifiedCSP = addSources(modifiedCSP, "style-src", [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com"
        ])

        if (modifiedCSP !== csp) {
          console.log(`[CSP] Modified CSP for ${details.url}`)
          console.log(`[CSP] Original:`, originalCSP)
          console.log(`[CSP] Modified:`, modifiedCSP)
        }

        return modifiedCSP
      })
    } else if (isLocalhost) {
      // If localhost has no CSP, inject a permissive one for Inspector Mode
      console.log(`[CSP] No CSP found for localhost ${details.url}, injecting permissive CSP`)
      // Use standard PascalCase for the header
      responseHeaders["Content-Security-Policy"] = [
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; connect-src * ws: wss:; worker-src * blob:"
      ]
    }

    callback({ responseHeaders })
  })

  // Setup tRPC IPC handler (singleton pattern)
  if (ipcHandler) {
    // Reuse existing handler, just attach new window
    ipcHandler.attachWindow(window)
  } else {
    // Create new handler with context
    ipcHandler = createIPCHandler({
      router: createAppRouter(getWindow),
      windows: [window],
      createContext: async () => ({
        getWindow,
      }),
    })
  }

  // Show window when ready
  window.on("ready-to-show", () => {
    console.log("[Main] Window", window.id, "ready to show")
    // Ensure native traffic lights are visible by default (login page, loading states)
    if (process.platform === "darwin") {
      window.setWindowButtonVisibility(true)
    }
    window.show()
  })

  // Emit fullscreen change events and manage traffic lights
  window.on("enter-full-screen", () => {
    // Always show native traffic lights in fullscreen
    if (process.platform === "darwin") {
      window.setWindowButtonVisibility(true)
    }
    window.webContents.send("window:fullscreen-change", true)
  })
  window.on("leave-full-screen", () => {
    // Show native traffic lights when exiting fullscreen (TrafficLights component will manage after mount)
    if (process.platform === "darwin") {
      window.setWindowButtonVisibility(true)
    }
    window.webContents.send("window:fullscreen-change", false)
  })

  // Emit focus change events
  window.on("focus", () => {
    window.webContents.send("window:focus-change", true)
  })
  window.on("blur", () => {
    window.webContents.send("window:focus-change", false)
  })

  // Disable Cmd+R / Ctrl+R to prevent accidental page refresh
  // Users can still use Cmd+Shift+R / Ctrl+Shift+R for intentional reloads
  window.webContents.on("before-input-event", (event, input) => {
    const isMac = process.platform === "darwin"
    const modifierKey = isMac ? input.meta : input.control
    if (modifierKey && input.key.toLowerCase() === "r" && !input.shift) {
      event.preventDefault()
    }
  })

  // Handle external links
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  // Handle window close
  window.on("closed", () => {
    console.log(`[Main] Window ${window.id} closed`)
    // windowManager handles cleanup via 'closed' event listener
  })

  // Load the renderer - check auth first
  const devServerUrl = process.env.ELECTRON_RENDERER_URL
  const authManager = getAuthManager()

  console.log("[Main] ========== AUTH CHECK ==========")
  console.log("[Main] AuthManager exists:", !!authManager)
  const isAuth = authManager.isAuthenticated()
  console.log("[Main] isAuthenticated():", isAuth)
  const user = authManager.getUser()
  console.log("[Main] getUser():", user ? user.email : "null")
  console.log("[Main] ================================")

  if (isAuth) {
    console.log("[Main] ✓ User authenticated, loading app")
    // Get stable window ID from manager (assigned during register)
    // "main" for first window, "window-2", "window-3", etc. for additional windows
    const windowId = windowManager.getStableId(window)

    // Build URL params including optional chatId/subChatId
    const buildParams = (params: URLSearchParams) => {
      params.set("windowId", windowId)
      if (options?.chatId) params.set("chatId", options.chatId)
      if (options?.subChatId) params.set("subChatId", options.subChatId)
    }

    if (devServerUrl) {
      // Pass params via query for dev mode
      const url = new URL(devServerUrl)
      buildParams(url.searchParams)
      window.loadURL(url.toString())
      // Only open devtools for first window in development
      if (!app.isPackaged && windowId === "main") {
        window.webContents.openDevTools()
      }
    } else {
      // Pass params via hash for production (file:// URLs)
      const hashParams = new URLSearchParams()
      buildParams(hashParams)
      window.loadFile(join(__dirname, "../renderer/index.html"), {
        hash: hashParams.toString(),
      })
    }
  } else {
    console.log("[Main] ✗ Not authenticated, showing login page")
    // In dev mode, login.html is in src/renderer
    if (devServerUrl) {
      const loginPath = join(app.getAppPath(), "src/renderer/login.html")
      window.loadFile(loginPath)
    } else {
      window.loadFile(join(__dirname, "../renderer/login.html"))
    }
  }

  // Ensure traffic lights are visible after page load (covers reload/Cmd+R case)
  window.webContents.on("did-finish-load", () => {
    console.log("[Main] Page finished loading in window", window.id)
    if (process.platform === "darwin") {
      window.setWindowButtonVisibility(true)
    }
  })
  window.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription) => {
      console.error(
        "[Main] Page failed to load in window",
        window.id,
        ":",
        errorCode,
        errorDescription,
      )
    },
  )

  return window
}

/**
 * Create the main application window (alias for createWindow for backwards compatibility)
 */
export function createMainWindow(): BrowserWindow {
  return createWindow()
}
