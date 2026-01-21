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

// Register IPC handlers for window operations (only once)
let ipcHandlersRegistered = false

function registerIpcHandlers(getWindow: () => BrowserWindow | null): void {
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
  ipcMain.handle("app:set-badge", (_event, count: number | null) => {
    const win = getWindow()
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
  ipcMain.handle("app:set-badge-icon", (_event, imageData: string | null) => {
    const win = getWindow()
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
    (_event, options: { title: string; body: string }) => {
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
          const win = getWindow()
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
              const styleLink = document.createElement('link');
              styleLink.rel = 'stylesheet';
              styleLink.href = href;
              styleLink.onload = () => console.log('[1code Inspector] CSS loaded');
              styleLink.onerror = (e) => console.error('[1code Inspector] CSS failed to load', e);
              ensureHead().appendChild(styleLink);
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
            ensureHead().appendChild(script);
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
 * Create the main application window
 */
export function createMainWindow(): BrowserWindow {
  // Register IPC handlers before creating window
  registerIpcHandlers(getWindow)

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

  // Update current window reference
  currentWindow = window

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

    // Allow loading localhost in iframes and jsdelivr CDN by modifying CSP
    if (responseHeaders["content-security-policy"]) {
      const originalCSP = responseHeaders["content-security-policy"]
      responseHeaders["content-security-policy"] = responseHeaders[
        "content-security-policy"
      ].map((csp: string) => {
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

        let modifiedCSP = csp
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
        modifiedCSP = addSources(modifiedCSP, "script-src-elem", [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com"
        ])
        modifiedCSP = addSources(modifiedCSP, "script-src", [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com"
        ])
        modifiedCSP = addSources(modifiedCSP, "connect-src", [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com"
        ])
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
      responseHeaders["content-security-policy"] = [
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; connect-src *"
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
