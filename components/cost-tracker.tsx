"use client"

import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, FileText, Activity } from "lucide-react"

interface CostTrackerProps {
  totalCost: number
  totalTokens: number
  sessionCount: number
  avgCostPerSession?: number
}

export function CostTracker({ totalCost, totalTokens, sessionCount, avgCostPerSession }: CostTrackerProps) {
  const avgCost = avgCostPerSession || (sessionCount > 0 ? totalCost / sessionCount : 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
            <p className="text-xl font-bold text-foreground">${totalCost.toFixed(4)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Total Tokens</p>
            <p className="text-xl font-bold text-foreground">{totalTokens.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Sessions</p>
            <p className="text-xl font-bold text-foreground">{sessionCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Avg per Session</p>
            <p className="text-xl font-bold text-foreground">${avgCost.toFixed(4)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
