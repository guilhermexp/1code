import { Target, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ComponentContextBadgeProps {
  content: string
  onRemove: () => void
}

export function ComponentContextBadge({ content, onRemove }: ComponentContextBadgeProps) {
  let componentName = "Annotation"
  let detail = ""

  // Agentation markdown format
  const componentMatch = content.match(/\*\*Component\*\*:\s*(?:`([^`]+)`|(.+))/)
  const elementMatch = content.match(/\*\*Element\*\*:\s*(?:`([^`]+)`|(.+))/)
  const selectorMatch = content.match(/\*\*Selector\*\*:\s*(?:`([^`]+)`|(.+))/)
  const titleMatch = content.match(/## Annotation \d+:\s*(.+)/)

  if (componentMatch || elementMatch) {
    const compStr = componentMatch?.[1] || componentMatch?.[2] || ""
    const parts = compStr.match(/<(\w+)>/g) || []
    componentName = parts[parts.length - 1]?.replace(/[<>]/g, "") || titleMatch?.[1] || "Annotation"
    detail = selectorMatch?.[1] || selectorMatch?.[2] || elementMatch?.[1] || elementMatch?.[2] || ""
  } else {
    // Fallback: legacy ReactGrab format
    const match = content.match(/in (\w+) at (.+):(\d+):(\d+)/)
    componentName = match?.[1] || "Component"
    detail = match?.[2] || content.slice(0, 50)
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-2 px-2 py-1">
      <Target className="h-3 w-3" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium">{componentName}</span>
        <span className="text-[10px] text-muted-foreground">{detail}</span>
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
