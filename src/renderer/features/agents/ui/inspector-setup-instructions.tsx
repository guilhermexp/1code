import { Copy, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface InspectorSetupInstructionsProps {
  className?: string
}

const INTEGRATION_CODE = `// Add this plugin to your React Grab setup
// This sends component info to 1code when you copy a component

if (window.ReactGrab) {
  const api = window.ReactGrab.init();

  // Plugin that sends data to 1code
  api.registerPlugin({
    name: '1code-integration',
    hooks: {
      onCopySuccess: (elements, content) => {
        // Send to parent window (1code)
        window.parent.postMessage({
          type: 'REACT_GRAB_COMPONENT',
          data: { content, elements }
        }, '*');
      }
    }
  });

  api.activate();
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
          <span>How to connect React Grab to 1code</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </Button>

      {isExpanded && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
          <div>
            <h4 className="text-sm font-medium mb-2">You already have React Grab installed ✓</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Just add this plugin to send component info to 1code:
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
            <p><strong>Where to add:</strong> In the same file where you initialize React Grab</p>
            <p><strong>How to use:</strong> Hover over a component and press ⌘C - it will be added to your chat context!</p>
          </div>
        </div>
      )}
    </div>
  )
}
