"use client"

import { useState, useEffect, useCallback, useRef, useMemo, memo, forwardRef, useImperativeHandle } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { atom } from "jotai"
import { HiChevronRight } from "react-icons/hi2"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { trpc } from "@/lib/trpc"
import { UnknownFileIcon } from "@/icons/framework-icons"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { RenameDialog } from "@/components/rename-dialog"
import { preferredEditorAtom } from "@/lib/atoms"
import { getAppOption } from "@/components/open-in-button"
import { getFileIconByExtension } from "../../agents/mentions/agents-file-mention"
import { fileSearchDialogOpenAtom } from "../../agents/atoms"
import { fileTreeExpandedAtomFamily } from "../atoms"

// ============================================================================
// Types
// ============================================================================

interface FileTreeNode {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  children?: FileTreeNode[]
}

type ElectronDroppedFile = File & { path?: string }

interface FilesTabProps {
  worktreePath: string | null
  onSelectFile: (filePath: string) => void
  onExpandedStateChange?: (allExpanded: boolean) => void
  /** Absolute path of the file currently open in file viewer (for highlight sync) */
  currentViewerFilePath?: string | null
  className?: string
}

export interface FilesTabHandle {
  toggleExpandCollapse: () => void
  openSearch: () => void
  /** true when all folders are expanded */
  isAllExpanded: boolean
}

const INDENT_PX = 12

// Static noop atom to avoid creating a family entry for "__noop__"
const noopExpandedAtom = atom<string[] | null, [string[]], void>(
  null,
  () => {}, // noop write
)

// ============================================================================
// Helpers
// ============================================================================

function buildFileTree(
  files: Array<{ path: string; type: "file" | "folder" }>,
): FileTreeNode[] {
  type Internal = Omit<FileTreeNode, "children"> & {
    children?: Record<string, Internal>
  }
  const root: Record<string, Internal> = {}
  for (const file of files) {
    if (file.type !== "file") continue
    const parts = file.path.split("/")
    let cur = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      const isLast = i === parts.length - 1
      const pathSoFar = parts.slice(0, i + 1).join("/")
      if (!cur[part]) {
        cur[part] = {
          id: pathSoFar,
          name: part,
          type: isLast ? "file" : "folder",
          path: pathSoFar,
          children: isLast ? undefined : {},
        }
      }
      if (!isLast && cur[part]!.children) {
        cur = cur[part]!.children!
      }
    }
  }
  function toArray(nodes: Record<string, Internal>): FileTreeNode[] {
    return Object.values(nodes)
      .map((n) => ({
        ...n,
        children: n.children ? toArray(n.children) : undefined,
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1
        return a.name.localeCompare(b.name)
      })
  }
  return toArray(root)
}

function collectAllFolderPaths(nodes: FileTreeNode[]): Set<string> {
  const s = new Set<string>()
  ;(function walk(list: FileTreeNode[]) {
    for (const n of list) {
      if (n.type === "folder" && n.children) {
        s.add(n.path)
        walk(n.children)
      }
    }
  })(nodes)
  return s
}

function collectRootFolderPaths(nodes: FileTreeNode[]): Set<string> {
  const s = new Set<string>()
  for (const n of nodes) if (n.type === "folder") s.add(n.path)
  return s
}

/** Flatten tree into visible-order list respecting expanded state */
function flattenVisible(
  nodes: FileTreeNode[],
  expanded: Set<string>,
): FileTreeNode[] {
  const out: FileTreeNode[] = []
  ;(function walk(list: FileTreeNode[]) {
    for (const n of list) {
      out.push(n)
      if (n.type === "folder" && n.children && expanded.has(n.path))
        walk(n.children)
    }
  })(nodes)
  return out
}

function parentPath(p: string): string | null {
  const i = p.lastIndexOf("/")
  return i > 0 ? p.slice(0, i) : null
}

function hasDraggedFiles(event: { dataTransfer: DataTransfer | null }): boolean {
  const dt = event.dataTransfer
  if (!dt) return false
  return Array.from(dt.types || []).includes("Files")
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      const base64 = result.split(",")[1]
      if (base64) resolve(base64)
      else reject(new Error("Failed to encode dropped file"))
    }
    reader.onerror = () => reject(reader.error || new Error("Failed to read dropped file"))
    reader.readAsDataURL(file)
  })
}

// ============================================================================
// TreeNode — receives only primitive/stable props for effective memo
// ============================================================================

const TreeNode = memo(function TreeNode({
  node,
  level,
  focusedPath,
  activePath,
  isExpanded,
  editorLabel,
  isPathExpanded,
  onToggleExpand,
  onActivate,
  onFocus,
  onContextAction,
  treeRef,
}: {
  node: FileTreeNode
  level: number
  focusedPath: string | null
  activePath: string | null
  /** Whether THIS folder node is expanded (ignored for files) */
  isExpanded: boolean
  editorLabel: string
  /** Callback to check if a child path is expanded */
  isPathExpanded: (path: string) => boolean
  onToggleExpand: (path: string) => void
  onActivate: (path: string) => void
  onFocus: (path: string) => void
  onContextAction: (action: string, node: FileTreeNode) => void
  treeRef: React.RefObject<HTMLDivElement | null>
}) {
  const isFolder = node.type === "folder" && !!node.children
  const isFocused = focusedPath === node.path
  const isActive = !isFocused && activePath === node.path
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFocused && rowRef.current) {
      rowRef.current.scrollIntoView({ block: "nearest" })
    }
  }, [isFocused])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent this row from stealing DOM focus from the tree container
    e.preventDefault()
  }, [])

  const handleClick = useCallback(() => {
    onFocus(node.path)
    if (isFolder) {
      onToggleExpand(node.path)
    } else {
      onActivate(node.path)
    }
    // Ensure the tree container has DOM focus so keyboard navigation works
    treeRef.current?.focus()
  }, [isFolder, onToggleExpand, onActivate, onFocus, node.path, treeRef])

  const FileIcon = !isFolder
    ? (getFileIconByExtension(node.name) ?? UnknownFileIcon)
    : null

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          asChild
          onPointerDown={(e) => {
            // Only allow right-click (context menu) through.
            // For left-click, prevent ContextMenuTrigger from stealing focus.
            if (e.button !== 2) e.preventDefault()
          }}
        >
          <div
            ref={rowRef}
            role="treeitem"
            aria-expanded={isFolder ? isExpanded : undefined}
            data-file-tree-node="true"
            data-node-path={node.path}
            data-node-type={node.type}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            className={cn(
              "flex items-center h-[22px] w-full cursor-pointer select-none",
              isFocused
                ? "bg-accent text-accent-foreground"
                : isActive
                  ? "bg-accent/50 text-accent-foreground"
                  : "text-foreground hover:bg-accent/50",
            )}
            style={{ paddingLeft: level * INDENT_PX }}
          >
            <span className="w-4 h-full flex items-center justify-center shrink-0">
              {isFolder ? (
                <HiChevronRight
                  className={cn(
                    "size-2.5 text-muted-foreground transition-transform duration-150",
                    isExpanded && "rotate-90",
                  )}
                />
              ) : (
                FileIcon && <FileIcon className="size-3.5 text-muted-foreground" />
              )}
            </span>
            <span className="ml-1 text-xs truncate min-w-0">{node.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          {!isFolder && (
            <>
              <ContextMenuItem onClick={() => onContextAction("open-preview", node)}>
                Open Preview
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem onClick={() => onContextAction("mention", node)}>
            Add to Chat Context
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onContextAction("open-editor", node)}>
            Open in {editorLabel}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onContextAction("reveal-finder", node)}>
            Reveal in Finder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onContextAction("copy-path", node)}>
            Copy Path
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onContextAction("copy-relative", node)}>
            Copy Relative Path
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onContextAction("rename", node)}>
            Rename...
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => onContextAction("delete", node)}
            className="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400"
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {isFolder &&
        isExpanded &&
        node.children!.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            level={level + 1}
            focusedPath={focusedPath}
            activePath={activePath}
            isExpanded={child.type === "folder" && !!child.children && isPathExpanded(child.path)}
            editorLabel={editorLabel}
            isPathExpanded={isPathExpanded}
            onToggleExpand={onToggleExpand}
            onActivate={onActivate}
            onFocus={onFocus}
            onContextAction={onContextAction}
            treeRef={treeRef}
          />
        ))}
    </>
  )
})

// ============================================================================
// FilesTab
// ============================================================================

export const FilesTab = memo(forwardRef<FilesTabHandle, FilesTabProps>(function FilesTab({
  worktreePath,
  onSelectFile,
  onExpandedStateChange,
  currentViewerFilePath,
  className,
}, ref) {
  // activePath = file currently open in viewer (secondary highlight), derived from prop
  const activePath = useMemo(() => {
    if (!currentViewerFilePath || !worktreePath) return null
    const prefix = worktreePath + "/"
    return currentViewerFilePath.startsWith(prefix)
      ? currentViewerFilePath.slice(prefix.length)
      : null
  }, [currentViewerFilePath, worktreePath])

  // focusedPath = keyboard/click cursor (primary highlight)
  const [focusedPath, setFocusedPath] = useState<string | null>(null)
  const treeRef = useRef<HTMLDivElement>(null)
  const setFileSearchOpen = useSetAtom(fileSearchDialogOpenAtom)

  // Persisted expanded paths (per worktree, survives reloads)
  // Use a static noop atom when worktreePath is null to avoid polluting storage
  const expandedAtom = useMemo(
    () => worktreePath ? fileTreeExpandedAtomFamily(worktreePath) : noopExpandedAtom,
    [worktreePath],
  )
  const [storedExpanded, setStoredExpanded] = useAtom(expandedAtom)

  // Stable expanded paths Set — only recreate when storedExpanded array changes
  const expandedPaths = useMemo(() => new Set(storedExpanded ?? []), [storedExpanded])

  // Ref for reading current value in setExpandedPaths (Jotai doesn't support functional updaters)
  const expandedPathsRef = useRef(expandedPaths)
  expandedPathsRef.current = expandedPaths

  const setExpandedPaths = useCallback((update: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    const prev = expandedPathsRef.current
    const next = typeof update === "function" ? update(prev) : update
    setStoredExpanded([...next])
  }, [setStoredExpanded])

  // Stable callback for TreeNode to check if a path is expanded (avoids passing Set)
  const isPathExpanded = useCallback((path: string): boolean => {
    return expandedPathsRef.current.has(path)
  }, [])

  // Preferred editor for "Open in Editor" action
  const preferredEditor = useAtomValue(preferredEditorAtom)
  const editorLabel = useMemo(() => {
    const opt = getAppOption(preferredEditor)
    return opt.displayLabel ?? opt.label
  }, [preferredEditor])

  // Rename dialog state
  const [renameTarget, setRenameTarget] = useState<FileTreeNode | null>(null)
  const [renameLoading, setRenameLoading] = useState(false)
  const [isDragOverFiles, setIsDragOverFiles] = useState(false)
  const [isDropImporting, setIsDropImporting] = useState(false)
  const dragDepthRef = useRef(0)

  // tRPC mutations
  const openInAppMutation = trpc.external.openInApp.useMutation()
  const openInFinderMutation = trpc.external.openInFinder.useMutation()
  const renameMutation = trpc.files.renameFile.useMutation()
  const deleteMutation = trpc.files.deleteFile.useMutation()
  const clearCacheMutation = trpc.files.clearCache.useMutation()
  const importDroppedFileMutation = trpc.files.importDroppedFile.useMutation()
  const trpcUtils = trpc.useUtils()

  // ---- Data ----
  const { data: allFiles } = trpc.files.search.useQuery(
    { projectPath: worktreePath || "", query: "", limit: 5000, typeFilter: "file" },
    { enabled: !!worktreePath, staleTime: 10000 },
  )

  const tree = useMemo(() => {
    if (!allFiles) return []
    return buildFileTree(allFiles)
  }, [allFiles])

  // Auto-expand root folders on first visit (storedExpanded === null means never set)
  useEffect(() => {
    if (tree.length > 0 && worktreePath && storedExpanded === null) {
      setStoredExpanded([...collectRootFolderPaths(tree)])
    }
  }, [tree, worktreePath, storedExpanded, setStoredExpanded])

  const allFolderPaths = useMemo(() => collectAllFolderPaths(tree), [tree])

  const visibleNodes = useMemo(
    () => flattenVisible(tree, expandedPaths),
    [tree, expandedPaths],
  )

  // ---- Actions ----

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [setExpandedPaths])

  /** Open a file — calls parent callback (activePath syncs via prop) */
  const activateFile = useCallback(
    (relativePath: string) => {
      if (!worktreePath) return
      onSelectFile(worktreePath + "/" + relativePath)
    },
    [worktreePath, onSelectFile],
  )

  const openSearch = useCallback(() => {
    setFileSearchOpen(true)
  }, [setFileSearchOpen])

  // Proper subset check: all folder paths must be in expanded set
  const isAllExpanded = useMemo(() => {
    if (allFolderPaths.size === 0) return false
    for (const p of allFolderPaths) {
      if (!expandedPaths.has(p)) return false
    }
    return true
  }, [allFolderPaths, expandedPaths])

  const toggleExpandCollapse = useCallback(() => {
    setExpandedPaths((prev) => {
      // Check if anything is expanded — if so, collapse all
      if (prev.size > 0) {
        setFocusedPath(null)
        return new Set()
      }
      return new Set(allFolderPaths)
    })
  }, [allFolderPaths, setExpandedPaths])

  // Notify parent of expanded state changes
  useEffect(() => {
    onExpandedStateChange?.(isAllExpanded)
  }, [isAllExpanded, onExpandedStateChange])

  // Expose actions to parent
  useImperativeHandle(ref, () => ({
    toggleExpandCollapse,
    openSearch,
    isAllExpanded,
  }), [toggleExpandCollapse, openSearch, isAllExpanded])

  // ---- Context Menu Actions ----

  const toAbsolute = useCallback((relativePath: string) => {
    return worktreePath ? worktreePath + "/" + relativePath : relativePath
  }, [worktreePath])

  const invalidateFiles = useCallback(() => {
    trpcUtils.files.search.invalidate()
  }, [trpcUtils])

  const resolveDropTargetDirectory = useCallback((target: EventTarget | null) => {
    if (!worktreePath || !(target instanceof HTMLElement)) return worktreePath
    const row = target.closest("[data-file-tree-node='true']") as HTMLElement | null
    if (!row) return worktreePath
    const nodePath = row.dataset.nodePath || ""
    const nodeType = row.dataset.nodeType || "file"
    const relDir = nodeType === "folder" ? nodePath : (parentPath(nodePath) || "")
    return relDir ? `${worktreePath}/${relDir}` : worktreePath
  }, [worktreePath])

  const handleFilesDragEnter = useCallback((e: React.DragEvent) => {
    if (!hasDraggedFiles(e)) return
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current += 1
    setIsDragOverFiles(true)
  }, [])

  const handleFilesDragOver = useCallback((e: React.DragEvent) => {
    if (!hasDraggedFiles(e)) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "copy"
    if (!isDragOverFiles) setIsDragOverFiles(true)
  }, [isDragOverFiles])

  const handleFilesDragLeave = useCallback((e: React.DragEvent) => {
    if (!hasDraggedFiles(e)) return
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setIsDragOverFiles(false)
    }
  }, [])

  const handleFilesDrop = useCallback(async (e: React.DragEvent) => {
    if (!worktreePath || !hasDraggedFiles(e)) return
    e.preventDefault()
    e.stopPropagation()

    dragDepthRef.current = 0
    setIsDragOverFiles(false)

    const droppedFiles = Array.from(e.dataTransfer.files || []) as ElectronDroppedFile[]
    if (droppedFiles.length === 0) return

    const targetDirectory = resolveDropTargetDirectory(e.target)
    if (!targetDirectory) return

    setIsDropImporting(true)
    let importedCount = 0
    const failedNames: string[] = []

    try {
      for (const file of droppedFiles) {
        try {
          // Electron usually exposes file.path for OS drag/drop; fallback to base64 upload.
          const sourcePath = typeof file.path === "string" && file.path ? file.path : undefined
          const base64Data = sourcePath ? undefined : await fileToBase64(file)

          await importDroppedFileMutation.mutateAsync({
            targetDirectory,
            fileName: file.name,
            sourcePath,
            base64Data,
          })
          importedCount += 1
        } catch (err) {
          console.error("[files-tab] Failed to import dropped file", file.name, err)
          failedNames.push(file.name)
        }
      }

      if (importedCount > 0) {
        await clearCacheMutation.mutateAsync({ projectPath: worktreePath })
        invalidateFiles()
      }

      if (importedCount > 0 && failedNames.length === 0) {
        toast.success(
          importedCount === 1 ? `Imported ${droppedFiles[0]?.name ?? "file"}` : `Imported ${importedCount} files`,
        )
      } else if (importedCount > 0 && failedNames.length > 0) {
        toast.warning(`Imported ${importedCount} file(s), ${failedNames.length} failed`, {
          description: failedNames.slice(0, 3).join(", "),
        })
      } else if (failedNames.length > 0) {
        toast.error("Failed to import dropped files", {
          description: failedNames.slice(0, 3).join(", "),
        })
      }
    } finally {
      setIsDropImporting(false)
    }
  }, [
    worktreePath,
    resolveDropTargetDirectory,
    importDroppedFileMutation,
    clearCacheMutation,
    invalidateFiles,
  ])

  const handleContextAction = useCallback((action: string, node: FileTreeNode) => {
    const absolutePath = toAbsolute(node.path)

    switch (action) {
      case "open-preview":
        activateFile(node.path)
        break

      case "mention": {
        const mentionType = node.type === "folder" ? "folder" : "file"
        window.dispatchEvent(new CustomEvent("file-tree-mention", {
          detail: {
            id: `${mentionType}:local:${absolutePath}`,
            label: node.name,
            path: absolutePath,
            repository: "local",
            type: mentionType,
          },
        }))
        break
      }

      case "open-editor":
        openInAppMutation.mutate({ path: absolutePath, app: preferredEditor })
        break

      case "reveal-finder":
        openInFinderMutation.mutate(absolutePath)
        break

      case "copy-path":
        navigator.clipboard.writeText(absolutePath)
        toast.success("Copied to clipboard", { description: absolutePath })
        break

      case "copy-relative":
        navigator.clipboard.writeText(node.path)
        toast.success("Copied to clipboard", { description: node.path })
        break

      case "rename":
        setRenameTarget(node)
        break

      case "delete": {
        const label = node.type === "folder" ? "folder" : "file"
        if (window.confirm(`Move "${node.name}" to trash?`)) {
          deleteMutation.mutate(
            { absolutePath },
            {
              onSuccess: () => {
                toast.success(`${node.name} moved to trash`)
                invalidateFiles()
              },
              onError: (err) => {
                toast.error(`Failed to delete ${label}`, { description: err.message })
              },
            },
          )
        }
        break
      }
    }
  }, [toAbsolute, activateFile, openInAppMutation, openInFinderMutation, preferredEditor, deleteMutation, invalidateFiles])

  const handleRenameSave = useCallback(async (newName: string) => {
    if (!renameTarget || !worktreePath) return
    const absolutePath = toAbsolute(renameTarget.path)
    setRenameLoading(true)
    try {
      await renameMutation.mutateAsync({ absolutePath, newName })
      toast.success(`Renamed to ${newName}`)

      // Update expanded paths: replace old path prefix with new
      const oldPath = renameTarget.path
      const parentDir = parentPath(oldPath)
      const newRelativePath = parentDir ? parentDir + "/" + newName : newName

      setExpandedPaths((prev) => {
        const next = new Set<string>()
        for (const p of prev) {
          if (p === oldPath) {
            next.add(newRelativePath)
          } else if (p.startsWith(oldPath + "/")) {
            next.add(newRelativePath + p.slice(oldPath.length))
          } else {
            next.add(p)
          }
        }
        return next
      })

      // Update focused path if it was on the renamed item
      setFocusedPath((prev) => {
        if (!prev) return prev
        if (prev === oldPath) return newRelativePath
        if (prev.startsWith(oldPath + "/")) return newRelativePath + prev.slice(oldPath.length)
        return prev
      })

      invalidateFiles()
      setRenameTarget(null)
    } catch (err: any) {
      toast.error("Failed to rename", { description: err.message })
      throw err // Keep dialog open
    } finally {
      setRenameLoading(false)
    }
  }, [renameTarget, worktreePath, toAbsolute, renameMutation, invalidateFiles, setExpandedPaths])

  // ---- Keyboard (VS Code behaviour) ----

  const refocusTree = useCallback(() => {
    requestAnimationFrame(() => treeRef.current?.focus())
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (visibleNodes.length === 0) return

      const idx = focusedPath
        ? visibleNodes.findIndex((n) => n.path === focusedPath)
        : -1

      const focusIndex = (i: number) => {
        const clamped = Math.max(0, Math.min(i, visibleNodes.length - 1))
        setFocusedPath(visibleNodes[clamped]!.path)
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          focusIndex(idx < 0 ? 0 : idx + 1)
          break

        case "ArrowUp":
          e.preventDefault()
          focusIndex(idx <= 0 ? 0 : idx - 1)
          break

        case "ArrowRight":
          e.preventDefault()
          if (idx < 0) break
          {
            const node = visibleNodes[idx]!
            if (node.type === "folder" && node.children) {
              if (!expandedPaths.has(node.path)) {
                toggleExpand(node.path)
                refocusTree()
              } else if (node.children.length > 0) {
                setFocusedPath(node.children[0]!.path)
              }
            }
          }
          break

        case "ArrowLeft":
          e.preventDefault()
          if (idx < 0) break
          {
            const node = visibleNodes[idx]!
            if (
              node.type === "folder" &&
              node.children &&
              expandedPaths.has(node.path)
            ) {
              toggleExpand(node.path)
              refocusTree()
            } else {
              const pp = parentPath(node.path)
              if (pp) setFocusedPath(pp)
            }
          }
          break

        case "Enter":
          e.preventDefault()
          if (idx < 0) break
          {
            const node = visibleNodes[idx]!
            if (node.type === "folder") {
              toggleExpand(node.path)
              refocusTree()
            } else {
              activateFile(node.path)
              refocusTree()
            }
          }
          break

        case " ":
          e.preventDefault()
          if (idx < 0) break
          {
            const node = visibleNodes[idx]!
            if (node.type === "file") {
              activateFile(node.path)
              refocusTree()
            } else {
              toggleExpand(node.path)
              refocusTree()
            }
          }
          break

        case "Home":
          e.preventDefault()
          focusIndex(0)
          break

        case "End":
          e.preventDefault()
          focusIndex(visibleNodes.length - 1)
          break

        case "*":
          e.preventDefault()
          if (idx >= 0) {
            const node = visibleNodes[idx]!
            if (node.type === "folder" && node.children) {
              setExpandedPaths((prev) => {
                const next = new Set(prev)
                ;(function addAll(n: FileTreeNode) {
                  if (n.type === "folder" && n.children) {
                    next.add(n.path)
                    n.children.forEach(addAll)
                  }
                })(node)
                return next
              })
              refocusTree()
            }
          }
          break

        default:
          break
      }
    },
    [visibleNodes, focusedPath, expandedPaths, toggleExpand, activateFile, refocusTree, setExpandedPaths],
  )

  // Stable close callback for RenameDialog
  const handleRenameClose = useCallback(() => setRenameTarget(null), [])

  // ---- Render ----

  if (!worktreePath) {
    return (
      <div className={cn("flex-1 flex items-center justify-center p-4", className)}>
        <p className="text-xs text-muted-foreground">No project open</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex flex-col h-full min-w-0 overflow-hidden",
        isDragOverFiles && "ring-1 ring-primary/60 bg-primary/5",
        className,
      )}
      onDragEnter={handleFilesDragEnter}
      onDragOver={handleFilesDragOver}
      onDragLeave={handleFilesDragLeave}
      onDrop={handleFilesDrop}
    >
      <div className="flex-1 overflow-y-auto pb-2">
        {tree.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-muted-foreground">Loading files...</p>
          </div>
        ) : (
          <div
            ref={treeRef}
            role="tree"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="outline-none"
          >
            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                focusedPath={focusedPath}
                activePath={activePath}
                isExpanded={node.type === "folder" && !!node.children && expandedPaths.has(node.path)}
                editorLabel={editorLabel}
                isPathExpanded={isPathExpanded}
                onToggleExpand={toggleExpand}
                onActivate={activateFile}
                onFocus={setFocusedPath}
                onContextAction={handleContextAction}
                treeRef={treeRef}
              />
            ))}
          </div>
        )}
      </div>

      {(isDragOverFiles || isDropImporting) && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-background/35 backdrop-blur-[1px]">
          <div className="rounded-md border border-primary/40 bg-background px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-foreground">
              {isDropImporting ? "Importing files..." : "Drop files to import"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Drop on a folder to import there
            </p>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={!!renameTarget}
        onClose={handleRenameClose}
        onSave={handleRenameSave}
        currentName={renameTarget?.name ?? ""}
        isLoading={renameLoading}
        title="Rename"
        placeholder="New name"
      />
    </div>
  )
}))
