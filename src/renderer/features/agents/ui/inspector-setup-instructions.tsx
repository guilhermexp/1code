import { Copy, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface InspectorSetupInstructionsProps {
  className?: string
}

const INTEGRATION_CODE = `// Optional: Install Agentation directly in your project
// npm install agentation -D

import { Agentation } from 'agentation'

// Add <Agentation /> to your app's root component
function App() {
  return (
    <>
      <YourApp />
      <Agentation />
    </>
  )
}`

export function InspectorSetupInstructions({ className }: InspectorSetupInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(INTEGRATION_CODE)
    toast.success("Code copied!")
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>Install Agentation in your project (optional)</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </Button>

      {isExpanded && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
          <div>
            <h4 className="text-sm font-medium mb-2">Inspector works automatically</h4>
            <p className="text-sm text-muted-foreground mb-3">
              For richer integration, install Agentation directly in your project:
            </p>
          </div>

          <div className="relative">
            <pre className="bg-background p-3 rounded-md text-xs overflow-x-auto border">
              <code>{INTEGRATION_CODE}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>How to use:</strong> Click on elements in the preview, add comments, and copy to chat context.</p>
            <p><strong>Learn more:</strong> <a href="https://agentation.dev" target="_blank" rel="noopener noreferrer" className="underline">agentation.dev</a></p>
          </div>
        </div>
      )}
    </div>
  )
}
