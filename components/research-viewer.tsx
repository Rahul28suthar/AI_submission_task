"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, FileText, ChevronRight, Upload } from "lucide-react"
import { ContinueResearchDialog } from "@/components/continue-research-dialog"

interface ResearchStep {
  id: string
  step_number: number
  step_type: string
  content: string
  tokens_used: number
  created_at: string
}

interface ResearchSession {
  id: string
  query: string
  status: "running" | "completed" | "failed"
  created_at: string
  total_cost: number
  total_tokens: number
  result_summary: string | null
}

interface Document {
  id: string
  filename: string
  file_size: number
  uploaded_at: string
}

interface ResearchViewerProps {
  sessionId: string
}

export function ResearchViewer({ sessionId }: ResearchViewerProps) {
  const [session, setSession] = useState<ResearchSession | null>(null)
  const [steps, setSteps] = useState<ResearchStep[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showContinueDialog, setShowContinueDialog] = useState(false)

  useEffect(() => {
    fetchResearchData()
    fetchDocuments()
    const interval = setInterval(fetchResearchData, 2000)
    return () => clearInterval(interval)
  }, [sessionId])

  const fetchResearchData = async () => {
    try {
      const response = await fetch(`/api/research/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.session) {
          setSession(data.session)
        }
        setSteps(data.steps)
      }
    } catch (error) {
      console.error("Failed to fetch research data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/db/documents?session_id=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    }
  }

  const totalCost = Number(session?.total_cost) || 0
  const totalTokens = Number(session?.total_tokens) || 0

  if (isLoading && !session) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <Card className="p-8 bg-card border-border text-center">
        <p className="text-muted-foreground">Research session not found.</p>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session header */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2 text-balance">{session.query}</h1>
              <p className="text-sm text-muted-foreground">Started {new Date(session.created_at).toLocaleString()}</p>
            </div>
            <Badge
              variant={
                session.status === "completed" ? "default" : session.status === "running" ? "secondary" : "destructive"
              }
            >
              {session.status}
            </Badge>
          </div>

          {/* Cost tracking */}
          <div className="flex items-center gap-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">${totalCost.toFixed(4)}</span>
              <span className="text-muted-foreground">cost</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{totalTokens.toLocaleString()}</span>
              <span className="text-muted-foreground">tokens</span>
            </div>
            {documents.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{documents.length}</span>
                <span className="text-muted-foreground">{documents.length === 1 ? "document" : "documents"}</span>
              </div>
            )}
          </div>

          {session.status === "completed" && (
            <Button
              onClick={() => setShowContinueDialog(true)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue Research
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>

      {documents.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-3">Uploaded Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-secondary rounded border border-border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{doc.filename}</span>
                </div>
                <span className="text-xs text-muted-foreground">{(doc.file_size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Research steps */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Research Process</h2>
        {steps.length === 0 && session.status === "running" && (
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-muted-foreground">Initializing research...</p>
            </div>
          </Card>
        )}
        {steps.map((step) => (
          <Card key={step.id} className="p-6 bg-card border-border hover:border-primary/30 transition-colors">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {step.step_number}
                  </span>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {step.step_type.replace("_", " ")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{step.tokens_used} tokens</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed pl-9">{step.content}</p>
            </div>
          </Card>
        ))}
        {session.status === "running" && steps.length > 0 && (
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-muted-foreground">Research in progress...</p>
            </div>
          </Card>
        )}
      </div>

      {/* Final summary */}
      {session.result_summary && (
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Research Summary</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{session.result_summary}</p>
        </Card>
      )}

      <ContinueResearchDialog
        open={showContinueDialog}
        onOpenChange={setShowContinueDialog}
        sessionId={sessionId}
        originalQuery={session.query}
      />
    </div>
  )
}
