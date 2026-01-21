import {
  BrowserWindow,
  shell,
  nativeTheme,
  ipcMain,
  app,
  clipboard,
  session,
} from "electron"
import { join } from "path"
import { createIPCHandler } from "trpc-electron/main"
import { createAppRouter } from "../lib/trpc/routers"
import { getAuthManager, handleAuthCode, getBaseUrl } from "../index"
import { registerGitWatcherIPC } from "../lib/git/watcher"

// Register IPC handlers for window operations (only once)
let ipcHandlersRegistered = false

function registerIpcHandlers(getWindow: () => BrowserWindow | null): void {
  if (ipcHandlersRegistered) return
  ipcHandlersRegistered = true

  // App info
  ipcMain.handle("app:version", () => app.getVersion())
  ipcMain.handle("app:isPackaged", () => app.isPackaged)
  // Note: Update checking is now handled by auto-updater module (lib/auto-updater.ts)
  ipcMain.handle("app:set-badge", (_event, count: number | null) => {
    if (process.platform === "darwin") {
      app.dock.setBadge(count ? String(count) : "")
    }
  })
  ipcMain.handle(
    "app:show-notification",
    (_event, options: { title: string; body: string }) => {
      const { Notification } = require("electron")
      new Notification(options).show()
    },
  )

  // API base URL for fetch requests
  ipcMain.handle("app:get-api-base-url", () => getBaseUrl())

  // Window controls
  ipcMain.handle("window:minimize", () => getWindow()?.minimize())
  ipcMain.handle("window:maximize", () => {
    const win = getWindow()
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })
  ipcMain.handle("window:close", () => getWindow()?.close())
  ipcMain.handle(
    "window:is-maximized",
    () => getWindow()?.isMaximized() ?? false,
  )
  ipcMain.handle("window:toggle-fullscreen", () => {
    const win = getWindow()
    if (win) {
      win.setFullScreen(!win.isFullScreen())
    }
  })
  ipcMain.handle(
    "window:is-fullscreen",
    () => getWindow()?.isFullScreen() ?? false,
  )

  // Traffic light visibility control (for hybrid native/custom approach)
  ipcMain.handle(
    "window:set-traffic-light-visibility",
    (_event, visible: boolean) => {
      const win = getWindow()
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
  ipcMain.handle("window:zoom-in", () => {
    const win = getWindow()
    if (win) {
      const zoom = win.webContents.getZoomFactor()
      win.webContents.setZoomFactor(Math.min(zoom + 0.1, 3))
    }
  })
  ipcMain.handle("window:zoom-out", () => {
    const win = getWindow()
    if (win) {
      const zoom = win.webContents.getZoomFactor()
      win.webContents.setZoomFactor(Math.max(zoom - 0.1, 0.5))
    }
  })
  ipcMain.handle("window:zoom-reset", () => {
    getWindow()?.webContents.setZoomFactor(1)
  })
  ipcMain.handle(
    "window:get-zoom",
    () => getWindow()?.webContents.getZoomFactor() ?? 1,
  )

  // DevTools
  ipcMain.handle("window:toggle-devtools", () => {
    const win = getWindow()
    if (win) {
      win.webContents.toggleDevTools()
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

  // Inspector Mode - inject script into iframe
  ipcMain.handle("inspector:inject", async (_event, iframeUrl: string, enabled: boolean) => {
    const { webContents } = require("electron")
    const allContents = webContents.getAllWebContents()

    // Find iframe by URL
    const iframeContent = allContents.find((wc: any) => {
      const url = wc.getURL()
      return url.includes(iframeUrl) || url.startsWith(iframeUrl)
    })

    if (!iframeContent) {
      console.warn("[Inspector] Could not find iframe with URL:", iframeUrl)
      return false
    }

    const inspectorScript = `
      (function() {
        if (window.__1codeInspectorInjected) {
          // Already injected, just toggle
          window.__1codeInspectorActive = ${enabled};
          if (window.__1codeInspectorToggle) window.__1codeInspectorToggle(${enabled});
          return;
        }

        window.__1codeInspectorInjected = true;
        window.__1codeInspectorActive = ${enabled};

        let overlay = null;
        let highlightBox = null;

        function createOverlay() {
          overlay = document.createElement('div');
          overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;cursor:crosshair;pointer-events:auto;';

          highlightBox = document.createElement('div');
          highlightBox.style.cssText = 'position:fixed;border:2px solid #3b82f6;background:rgba(59,130,246,0.1);pointer-events:none;z-index:1000000;display:none;';

          document.body.appendChild(overlay);
          document.body.appendChild(highlightBox);
        }

        function getComponentInfo(element) {
          let fiber = null;
          for (let key in element) {
            if (key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')) {
              fiber = element[key];
              break;
            }
          }

          let componentName = 'Unknown';
          let filePath = 'unknown';

          if (fiber) {
            let current = fiber;
            while (current) {
              if (current.type && typeof current.type === 'function') {
                componentName = current.type.name || current.type.displayName || 'Component';
                if (current._debugSource) {
                  filePath = current._debugSource.fileName + ':' + current._debugSource.lineNumber + ':' + current._debugSource.columnNumber;
                } else if (current.type.__source) {
                  filePath = current.type.__source.fileName + ':' + current.type.__source.lineNumber;
                }
                break;
              }
              current = current.return;
            }
          }

          if (componentName === 'Unknown') {
            componentName = element.tagName.toLowerCase();
          }

          return { component: componentName, path: filePath };
        }

        function handleMouseMove(e) {
          if (!window.__1codeInspectorActive) return;
          const element = document.elementFromPoint(e.clientX, e.clientY);
          if (!element || element === overlay || element === highlightBox) return;

          const rect = element.getBoundingClientRect();
          highlightBox.style.display = 'block';
          highlightBox.style.top = rect.top + 'px';
          highlightBox.style.left = rect.left + 'px';
          highlightBox.style.width = rect.width + 'px';
          highlightBox.style.height = rect.height + 'px';
        }

        function handleClick(e) {
          if (!window.__1codeInspectorActive) return;
          e.preventDefault();
          e.stopPropagation();

          const element = document.elementFromPoint(e.clientX, e.clientY);
          if (!element || element === overlay || element === highlightBox) return;

          const info = getComponentInfo(element);
          window.parent.postMessage({
            type: 'INSPECTOR_ELEMENT_SELECTED',
            data: info
          }, '*');

          console.log('[1code Inspector] Selected:', info);
        }

        window.__1codeInspectorToggle = function(enabled) {
          window.__1codeInspectorActive = enabled;
          if (enabled) {
            if (!overlay) createOverlay();
            overlay.style.display = 'block';
            overlay.addEventListener('mousemove', handleMouseMove);
            overlay.addEventListener('click', handleClick);
          } else {
            if (overlay) overlay.style.display = 'none';
            if (highlightBox) highlightBox.style.display = 'none';
          }
        };

        window.__1codeInspectorToggle(${enabled});
        console.log('[1code Inspector] Injected and active:', ${enabled});
      })();
    `

    try {
      await iframeContent.executeJavaScript(inspectorScript)
      console.log("[Inspector] Script injected successfully")
      return true
    } catch (error) {
      console.error("[Inspector] Failed to inject script:", error)
      return false
    }
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
    showLoginPage()
  })

  ipcMain.handle("auth:start-flow", (event) => {
    if (!validateSender(event)) return
    getAuthManager().startAuthFlow(getWindow())
  })

  ipcMain.handle("auth:submit-code", async (event, code: string) => {
    if (!validateSender(event)) return
    if (!code || typeof code !== "string") {
      getWindow()?.webContents.send("auth:error", "Invalid authorization code")
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

  // Register git watcher IPC handlers
  registerGitWatcherIPC(getWindow)
}

// Current window reference
let currentWindow: BrowserWindow | null = null

/**
 * Show login page
 */
export function showLoginPage(): void {
  if (!currentWindow) return
  console.log("[Main] Showing login page")

  // In dev mode, login.html is in src/renderer, not out/renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    // Dev mode: load from source directory
    const loginPath = join(app.getAppPath(), "src/renderer/login.html")
    console.log("[Main] Loading login from:", loginPath)
    currentWindow.loadFile(loginPath)
  } else {
    // Production: load from built output
    currentWindow.loadFile(join(__dirname, "../renderer/login.html"))
  }
}

// Singleton IPC handler (prevents duplicate handlers on macOS window recreation)
let ipcHandler: ReturnType<typeof createIPCHandler> | null = null

/**
 * Get the current window reference
 * Used by tRPC procedures that need window access
 */
export function getWindow(): BrowserWindow | null {
  return currentWindow
}

/**
 * Create the main application window
 */
export function createMainWindow(): BrowserWindow {
  // Register IPC handlers before creating window
  registerIpcHandlers(getWindow)

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
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for electron-trpc
      webSecurity: true,
      partition: "persist:main", // Use persistent session for cookies
    },
  })

  // Update current window reference
  currentWindow = window

  // Configure CSP to allow localhost iframes (for preview feature)
  const ses = session.fromPartition("persist:main")
  ses.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders }

    // Allow loading localhost in iframes and jsdelivr CDN by modifying CSP
    if (responseHeaders["content-security-policy"]) {
      responseHeaders["content-security-policy"] = responseHeaders[
        "content-security-policy"
      ].map((csp: string) => {
        // Add localhost to frame-src and child-src directives, plus jsdelivr for react-grab
        if (csp.includes("default-src")) {
          return csp.replace(
            /default-src ([^;]*)/,
            "default-src $1; frame-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*; child-src 'self' http://localhost:* http://127.0.0.1:*; script-src-elem 'self' https://cdn.jsdelivr.net; connect-src 'self' https://cdn.jsdelivr.net"
          )
        }
        return csp
      })
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
    console.log("[Main] Window ready to show")
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

  // Handle external links
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  // Handle window close
  window.on("closed", () => {
    currentWindow = null
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
    if (devServerUrl) {
      window.loadURL(devServerUrl)
      window.webContents.openDevTools()
    } else {
      window.loadFile(join(__dirname, "../renderer/index.html"))
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
    console.log("[Main] Page finished loading")
    if (process.platform === "darwin") {
      window.setWindowButtonVisibility(true)
    }
  })
  window.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription) => {
      console.error("[Main] Page failed to load:", errorCode, errorDescription)
    },
  )

  return window
}
