import { createServer, type Server } from "http"
import { readFile } from "fs/promises"
import { join, extname } from "path"
import { existsSync } from "fs"

let server: Server | null = null
let serverPort: number | null = null

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
  ".wasm": "application/wasm",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
}

/**
 * Start a local HTTP server to serve renderer files in production.
 * This avoids file:// protocol which causes third-party cookie issues
 * when the renderer embeds localhost iframes (preview feature).
 *
 * Binds to localhost so the renderer shares the same origin hostname
 * as preview iframes (e.g. localhost:3001). Using 127.0.0.1 would be
 * a different origin and cause third-party cookie blocking.
 * Uses port 0 so the OS assigns a free port.
 */
export function startStaticServer(rootDir: string): Promise<number> {
  if (server && serverPort !== null) {
    return Promise.resolve(serverPort)
  }

  return new Promise((resolve, reject) => {
    server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url || "/", "http://localhost")
        let pathname = decodeURIComponent(url.pathname)

        // Default to index.html
        if (pathname === "/") {
          pathname = "/index.html"
        }

        const filePath = join(rootDir, pathname)

        // Security: prevent directory traversal
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403)
          res.end("Forbidden")
          return
        }

        const ext = extname(filePath)

        // If file exists, serve it
        if (ext && existsSync(filePath)) {
          const data = await readFile(filePath)
          const contentType = MIME_TYPES[ext] || "application/octet-stream"
          res.writeHead(200, { "Content-Type": contentType })
          res.end(data)
          return
        }

        // SPA fallback: serve index.html for routes without extensions
        if (!ext) {
          const indexPath = join(rootDir, "index.html")
          if (existsSync(indexPath)) {
            const data = await readFile(indexPath)
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
            res.end(data)
            return
          }
        }

        res.writeHead(404)
        res.end("Not found")
      } catch (error) {
        console.error("[StaticServer] Error serving request:", error)
        res.writeHead(500)
        res.end("Internal server error")
      }
    })

    server.listen(0, "localhost", () => {
      const addr = server!.address()
      if (addr && typeof addr === "object") {
        serverPort = addr.port
        console.log(`[StaticServer] Serving ${rootDir} on http://localhost:${serverPort}`)
        resolve(serverPort)
      } else {
        reject(new Error("Failed to get server address"))
      }
    })

    server.on("error", (err) => {
      console.error("[StaticServer] Server error:", err)
      reject(err)
    })
  })
}

/**
 * Get the port of the running static server.
 * Returns null if the server hasn't been started.
 */
export function getStaticServerPort(): number | null {
  return serverPort
}

/**
 * Stop the static server.
 */
export function stopStaticServer(): void {
  if (server) {
    server.close()
    server = null
    serverPort = null
    console.log("[StaticServer] Stopped")
  }
}
