"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Database } from "lucide-react"
import Link from "next/link"

interface ResearchSession {
  id: string
  query: string
  status: "running" | "completed" | "failed"
  created_at: string
  total_cost: number
  total_tokens: number
}

export function ResearchHistory() {
  const [sessions, setSessions] = useState<ResearchSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/research/history")
      if (response.ok) {
        const data = await response.json()
        const sessions = (data.sessions || []).map((session: ResearchSession) => ({
          ...session,
          total_cost: Number(session.total_cost) || 0,
          total_tokens: Number(session.total_tokens) || 0,
        }))
        setSessions(sessions)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch history")
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
      setError("Database not connected")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 bg-card border-border animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 bg-card border-border text-center">
        <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">Unable to load research history</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </Card>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-8 bg-card border-border text-center">
        <p className="text-muted-foreground">No research history yet. Start your first research above.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Link key={session.id} href={`/research/${session.id}`}>
          <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate mb-2">{session.query}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                  {session.status === "completed" && (
                    <>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />${session.total_cost.toFixed(4)}
                      </span>
                      <span>{session.total_tokens.toLocaleString()} tokens</span>
                    </>
                  )}
                </div>
              </div>
              <Badge
                variant={
                  session.status === "completed"
                    ? "default"
                    : session.status === "running"
                      ? "secondary"
                      : "destructive"
                }
              >
                {session.status}
              </Badge>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
