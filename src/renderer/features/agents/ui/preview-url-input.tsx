"use client"

import { cn } from "../../../lib/utils"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAtom, useSetAtom } from "jotai"
import { previewUrlHistoryAtom, addPreviewUrlToHistoryAtom } from "../atoms"
import { History, X } from "lucide-react"

interface PreviewUrlInputProps {
  /** The base host (e.g., "sandbox-3000.21st.sh") */
  baseHost: string | null
  /** Current path (e.g., "/dashboard") */
  currentPath: string
  /** Called when path changes */
  onPathChange: (path: string) => void
  /** Is the iframe currently loading? */
  isLoading?: boolean
  /** Optional class name for the container */
  className?: string
  /** Variant for different contexts */
  variant?: "default" | "mobile"
  /** Full URL to display (for custom URLs) - overrides baseHost + currentPath display */
  fullUrl?: string
  /** Called when full URL changes (for custom URLs) */
  onFullUrlChange?: (url: string) => void
}

export function PreviewUrlInput({
  baseHost,
  currentPath,
  onPathChange,
  isLoading = false,
  className,
  variant = "default",
  fullUrl,
  onFullUrlChange,
}: PreviewUrlInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // URL history atoms
  const [urlHistory, setUrlHistory] = useAtom(previewUrlHistoryAtom)
  const addToHistory = useSetAtom(addPreviewUrlToHistoryAtom)

  // Filter history based on input
  const filteredHistory = inputValue
    ? urlHistory.filter((url) =>
        url.toLowerCase().includes(inputValue.toLowerCase())
      )
    : urlHistory

  // Progress bar animation
  const progress = useMotionValue(0)
  const width = useTransform(progress, [0, 100], ["0%", "100%"])
  const glowOpacity = useTransform(progress, [0, 95, 100], [1, 1, 0])
  const animationRef = useRef<ReturnType<typeof animate> | null>(null)

  // Handle loading state changes for progress animation
  useEffect(() => {
    if (isLoading) {
      // Reset and start loading animation
      progress.jump(0)

      // Animate to ~90% with decreasing speed (simulating uncertain progress)
      animationRef.current = animate(progress, 90, {
        duration: 12, // Takes 12s to reach 90%
        ease: [0.1, 0.4, 0.2, 1], // Fast start, very slow end
      })

      // Safety timeout: if still loading after 15s, force completion
      const timeoutId = setTimeout(() => {
        animationRef.current?.stop()
        animationRef.current = animate(progress, 100, {
          duration: 0.15,
          ease: "easeOut",
        })
      }, 15_000)

      return () => {
        clearTimeout(timeoutId)
        animationRef.current?.stop()
      }
    } else {
      // Stop the slow animation
      animationRef.current?.stop()

      // Quickly complete to 100%
      animationRef.current = animate(progress, 100, {
        duration: 0.15,
        ease: "easeOut",
      })

      return () => {
        animationRef.current?.stop()
      }
    }
  }, [isLoading, progress])

  // Focus and select when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      const input = inputRef.current
      input.focus()

      const value = input.value
      // Display format is "~{currentPath}", e.g. "~/community/components"
      // Select only the path after "~/" so user can type new path directly
      const pathStartAfterSlash = 2 // Skip "~/"

      // If path is just "/" (main page), place cursor at end
      // Otherwise select the path portion AFTER "~/"
      if (currentPath === "/") {
        input.setSelectionRange(value.length, value.length)
      } else {
        input.setSelectionRange(pathStartAfterSlash, value.length)
      }

      // Show history dropdown
      setShowHistory(true)
      setSelectedHistoryIndex(-1)
    }
  }, [isEditing, currentPath])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }

    if (showHistory) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showHistory])

  const handleSubmit = useCallback((urlOverride?: string) => {
    let input = (urlOverride ?? inputValue).trim()

    // Check if input is a full URL (has protocol or looks like a URL)
    const isFullUrl = input.startsWith("http://") || input.startsWith("https://") ||
      (input.includes(".") && !input.startsWith("~") && !input.startsWith("/"))

    // If we're in full URL mode or user entered a full URL and we have a change handler, use it
    if (onFullUrlChange && (fullUrl || isFullUrl)) {
      // Ensure URL has protocol
      if (isFullUrl && !input.startsWith("http://") && !input.startsWith("https://")) {
        input = "https://" + input
      }
      // User is editing/entering a full URL
      if (input !== fullUrl && input) {
        onFullUrlChange(input)
        // Add to history
        addToHistory(input)
      }
      setIsEditing(false)
      setShowHistory(false)
      return
    }

    // Handle ~ prefix format (our display format)
    if (input.startsWith("~")) {
      input = input.slice(1) // Remove ~ prefix
    }

    // Extract path from full URL or just use as path
    let newPath = "/"
    let urlToSave = ""
    try {
      // Check if it's a full URL
      if (input.startsWith("http://") || input.startsWith("https://")) {
        const url = new URL(input)
        newPath = url.pathname + url.search + url.hash
        urlToSave = input
      } else if (input.includes(".") && input.includes("/")) {
        // It's host + path like "sandbox-3000.21st.sh/some/path"
        const slashIndex = input.indexOf("/")
        newPath = input.slice(slashIndex)
        urlToSave = "https://" + input
      } else if (input.startsWith("/")) {
        // Just a path starting with /
        newPath = input
        if (baseHost) {
          urlToSave = `https://${baseHost}${newPath}`
        }
      } else {
        // Just a path without leading /
        newPath = "/" + input
        if (baseHost) {
          urlToSave = `https://${baseHost}${newPath}`
        }
      }
    } catch {
      // If parsing fails, treat as path
      newPath = input.startsWith("/") ? input : "/" + input
      if (baseHost) {
        urlToSave = `https://${baseHost}${newPath}`
      }
    }

    if (!newPath) newPath = "/"

    // Only navigate if path actually changed
    if (newPath !== currentPath) {
      onPathChange(newPath)
      // Add to history
      if (urlToSave) {
        addToHistory(urlToSave)
      }
    }
    setIsEditing(false)
    setShowHistory(false)
  }, [inputValue, currentPath, onPathChange, fullUrl, onFullUrlChange, baseHost, addToHistory])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (selectedHistoryIndex >= 0 && filteredHistory[selectedHistoryIndex]) {
          handleSelectHistoryItem(filteredHistory[selectedHistoryIndex])
        } else {
          handleSubmit()
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        // Reset to original value
        setInputValue(fullUrl || `~${currentPath}`)
        setIsEditing(false)
        setShowHistory(false)
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedHistoryIndex((prev) =>
          prev < filteredHistory.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedHistoryIndex((prev) => (prev > 0 ? prev - 1 : -1))
      }
    },
    [handleSubmit, currentPath, fullUrl, selectedHistoryIndex, filteredHistory],
  )

  const handleSelectHistoryItem = useCallback((url: string) => {
    setInputValue(url)
    handleSubmit(url)
  }, [handleSubmit])

  const handleRemoveHistoryItem = useCallback((e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    setUrlHistory((prev) => prev.filter((u) => u !== url))
  }, [setUrlHistory])

  const startEditing = useCallback(() => {
    // If we have a full URL, show it; if we have baseHost show path; otherwise empty for new URL entry
    if (fullUrl) {
      setInputValue(fullUrl)
    } else if (baseHost) {
      setInputValue(`~${currentPath}`)
    } else {
      setInputValue("")
    }
    setIsEditing(true)
  }, [currentPath, fullUrl, baseHost])

  // Show placeholder when no baseHost but allow editing if onFullUrlChange is provided
  const displayText = fullUrl || (baseHost ? `~${currentPath}` : "Enter URL...")

  // Shared styling for consistent height/positioning between button and input
  const sharedStyles =
    "font-mono text-xs rounded-md px-3 h-7 leading-7 w-full max-w-[350px] text-center"

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-w-0 flex-1 text-center flex items-center justify-center relative",
        className,
      )}
    >
      {/* URL input/button container */}
      <div className="relative max-w-[350px] w-full">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setSelectedHistoryIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Delay to allow click on dropdown items
              setTimeout(() => {
                if (!containerRef.current?.contains(document.activeElement)) {
                  handleSubmit()
                }
              }, 150)
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className={cn(
              sharedStyles,
              variant === "mobile"
                ? "bg-muted shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-foreground"
                : "bg-background shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-foreground",
            )}
            placeholder="~/ or https://..."
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className={cn(
              sharedStyles,
              variant === "mobile"
                ? "truncate text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-muted hover:bg-muted/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
                : "truncate text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:bg-background hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70",
            )}
          >
            {displayText}
          </button>
        )}

        {/* URL History Dropdown */}
        <AnimatePresence>
          {showHistory && filteredHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
            >
              <div className="py-1 max-h-[300px] overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-3 w-3" />
                  Recent URLs
                </div>
                {filteredHistory.map((url, index) => (
                  <div
                    key={url}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors group",
                      index === selectedHistoryIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => handleSelectHistoryItem(url)}
                    onMouseEnter={() => setSelectedHistoryIndex(index)}
                  >
                    <span className="font-mono text-xs truncate flex-1">
                      {url}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveHistoryItem(e, url)}
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/20 transition-opacity"
                      title="Remove from history"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar at bottom with upward glow */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 rounded-md overflow-hidden"
            >
              {/* Glow effect - uniform along progress, fades at edges via blur */}
              <motion.div
                className="absolute -bottom-2 left-0 h-4"
                style={{
                  width,
                  opacity: glowOpacity,
                  background: "hsl(var(--primary) / 0.15)",
                  filter: "blur(4px)",
                }}
              />
              {/* Progress bar line */}
              <motion.div
                className="absolute bottom-0 left-0 h-[0.5px] bg-primary/60"
                style={{ width }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
