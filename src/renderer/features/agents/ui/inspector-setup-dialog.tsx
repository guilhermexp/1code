import { Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface InspectorSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SETUP_CODE = `// Add this to your app's entry point (e.g., main.tsx or App.tsx)
// This enables component inspection with 1code

if (typeof window !== 'undefined') {
  // Load React Grab dynamically
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/react-grab@latest/dist/index.global.js';
  script.async = true;

  script.onload = () => {
    if (window.ReactGrab) {
      const api = window.ReactGrab.init();

      // Send component info to parent window (1code)
      api.registerPlugin({
        name: '1code-integration',
        hooks: {
          onCopySuccess: (elements, content) => {
            window.parent.postMessage({
              type: 'REACT_GRAB_COMPONENT',
              data: { content, elements }
            }, '*');
          }
        }
      });

      api.activate();
    }
  };

  document.head.appendChild(script);
}`

export function InspectorSetupDialog({ open, onOpenChange }: InspectorSetupDialogProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(SETUP_CODE)
    toast.success("Code copied to clipboard!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Setup Inspector Mode</DialogTitle>
          <DialogDescription>
            Due to browser security (CORS), we cannot automatically inject the inspector into your app.
            Add this code to your project to enable component inspection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Step 1: Add the code below</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Copy and paste this into your app's entry point (e.g., <code className="bg-muted px-1 py-0.5 rounded">main.tsx</code> or <code className="bg-muted px-1 py-0.5 rounded">App.tsx</code>)
            </p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                <code>{SETUP_CODE}</code>
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
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Step 2: Use the Inspector</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Reload your app after adding the code</li>
              <li>Hover over any React component in the preview</li>
              <li>Press <kbd className="bg-muted px-2 py-0.5 rounded text-xs">⌘C</kbd> while hovering</li>
              <li>The component info will be added to your chat context</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> This code only runs in development mode and doesn't affect your production build.
              You can remove it anytime without issues.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Learn more about React Grab:</span>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => window.open("https://github.com/aidenybai/react-grab", "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Documentation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
