export async function POST(req: Request) {
  try {
    if (!process.env.POSTGRES_URL) {
      return Response.json({ error: "Database not configured" }, { status: 503 })
    }

    const { sql } = await import("@vercel/postgres")
    const { session_id, step_number, step_type, content, tokens_used } = await req.json()

    await sql`
      INSERT INTO research_steps (session_id, step_number, step_type, content, tokens_used)
      VALUES (${session_id}, ${step_number}, ${step_type}, ${content}, ${tokens_used || 0})
    `

    return Response.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Database operation failed" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    if (!process.env.POSTGRES_URL) {
      return Response.json({ error: "Database not configured", steps: [] }, { status: 503 })
    }

    const { sql } = await import("@vercel/postgres")
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return Response.json({ error: "session_id required" }, { status: 400 })
    }

    const { rows } = await sql`
      SELECT * FROM research_steps
      WHERE session_id = ${sessionId}
      ORDER BY step_number ASC
    `

    return Response.json({ steps: rows })
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Database operation failed", steps: [] }, { status: 500 })
  }
}
