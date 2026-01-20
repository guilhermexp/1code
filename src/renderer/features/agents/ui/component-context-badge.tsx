import { Target, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ComponentContextBadgeProps {
  content: string
  onRemove: () => void
}

export function ComponentContextBadge({ content, onRemove }: ComponentContextBadgeProps) {
  // Extract component name and file path from content
  // Expected format: "in ComponentName at path/to/file.tsx:line:col"
  const match = content.match(/in (\w+) at (.+):(\d+):(\d+)/)
  const componentName = match?.[1] || "Component"
  const filePath = match?.[2] || "Unknown"

  return (
    <Badge variant="secondary" className="flex items-center gap-2 px-2 py-1">
      <Target className="h-3 w-3" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium">{componentName}</span>
        <span className="text-[10px] text-muted-foreground">{filePath}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 hover:bg-destructive/10"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  )
}
