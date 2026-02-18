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

const SETUP_CODE = `// Optional: Install Agentation directly in your project for richer integration
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

export function InspectorSetupDialog({ open, onOpenChange }: InspectorSetupDialogProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(SETUP_CODE)
    toast.success("Code copied to clipboard!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Setup Agentation (Optional)</DialogTitle>
          <DialogDescription>
            Inspector mode already works via auto-injection. For the best experience,
            you can install Agentation directly in your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Install in your project</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Copy and paste this into your app's entry point (e.g., <code className="bg-muted px-1 py-0.5 rounded">App.tsx</code>)
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
            <h4 className="text-sm font-medium mb-2">How to use</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Click the inspector button in the preview toolbar</li>
              <li>Click on any element in the preview to annotate it</li>
              <li>Add a comment describing what you want changed</li>
              <li>Copy the annotation - it will be added to your chat context</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Inspector mode works automatically without any setup.
              Installing Agentation directly enables richer integration with your project's component tree.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Learn more about Agentation:</span>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => window.open("https://agentation.dev", "_blank")}
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
