import { ResearchForm } from "@/components/research-form"
import { ResearchHistory } from "@/components/research-history"
import { CostTracker } from "@/components/cost-tracker"

export default async function Home() {
  let costStats = {
    totalCost: 0,
    totalTokens: 0,
    sessionCount: 0,
  }

  let dbConnected = false

  try {
    // Check if database URL is available
    if (process.env.POSTGRES_URL) {
      const { sql } = await import("@vercel/postgres")
      const { rows } = await sql`
        SELECT 
          COALESCE(SUM(total_cost), 0) as total_cost,
          COALESCE(SUM(total_tokens), 0) as total_tokens,
          COUNT(*) as session_count
        FROM research_sessions
        WHERE status = 'completed'
      `
      if (rows.length > 0) {
        costStats = {
          totalCost: Number(rows[0].total_cost),
          totalTokens: Number(rows[0].total_tokens),
          sessionCount: Number(rows[0].session_count),
        }
      }
      dbConnected = true
    }
  } catch (error) {
    console.error("Database connection error:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Research System</h1>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero section */}
          <div className="text-center space-y-4 py-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">Deep Research Powered by AI</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Conduct comprehensive research with observable reasoning steps, document context, and detailed cost
              tracking.
            </p>
          </div>

          {/* Database setup warning */}
          {!dbConnected && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Database Setup Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To use this research system, you need to connect a PostgreSQL database. Here's how:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground mb-4">
                <li>Open the in-chat sidebar (left side of screen)</li>
                <li>Go to the "Vars" section</li>
                <li>Add environment variable: POSTGRES_URL</li>
                <li>Or connect via the "Connect" section and add Supabase or Neon integration</li>
                <li>Run the SQL scripts from the /scripts folder to create tables</li>
              </ol>
              <p className="text-xs text-muted-foreground">
                Once connected, refresh this page to see the cost tracking dashboard and start researching.
              </p>
            </div>
          )}

          {/* Cost tracking dashboard - only show if DB connected */}
          {dbConnected && (
            <CostTracker
              totalCost={costStats.totalCost}
              totalTokens={costStats.totalTokens}
              sessionCount={costStats.sessionCount}
            />
          )}

          {/* Research form */}
          <ResearchForm />

          {/* Recent history */}
          <div className="pt-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Recent Research</h3>
            <ResearchHistory />
          </div>
        </div>
      </main>
    </div>
  )
}
