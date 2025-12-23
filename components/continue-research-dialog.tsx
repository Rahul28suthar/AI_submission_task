"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus } from "lucide-react"

interface ContinueResearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  originalQuery: string
}

export function ContinueResearchDialog({ open, onOpenChange, sessionId, originalQuery }: ContinueResearchDialogProps) {
  const [additionalQuery, setAdditionalQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!additionalQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/research/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          additionalQuery,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = `/research/${data.newSessionId}`
      }
    } catch (error) {
      console.error("Continue research failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Continue Research</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Build upon your previous research with additional questions or directions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Original Query</label>
            <p className="text-sm text-foreground bg-secondary p-3 rounded border border-border">{originalQuery}</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="additional-query" className="text-sm font-medium text-foreground">
              What else would you like to explore?
            </label>
            <Textarea
              id="additional-query"
              value={additionalQuery}
              onChange={(e) => setAdditionalQuery(e.target.value)}
              placeholder="E.g., 'Compare this with the European market' or 'What are the ethical implications?'"
              className="min-h-24 bg-background border-input text-foreground"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!additionalQuery.trim() || isLoading}
            className="bg-primary text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Continue Research
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
