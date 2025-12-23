export async function POST(req: Request) {
  try {
    if (!process.env.POSTGRES_URL) {
      return Response.json(
        { error: "Database not configured. Please add POSTGRES_URL environment variable." },
        { status: 503 },
      )
    }

    const { sql } = await import("@vercel/postgres")
    const { id, query, status } = await req.json()

    await sql`
      INSERT INTO research_sessions (id, query, status)
      VALUES (${id}, ${query}, ${status})
    `

    return Response.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Database operation failed" }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!process.env.POSTGRES_URL) {
      return Response.json({ error: "Database not configured", sessions: [] }, { status: 503 })
    }

    const { sql } = await import("@vercel/postgres")
    const { rows } = await sql`
      SELECT * FROM research_sessions
      ORDER BY created_at DESC
      LIMIT 10
    `

    const sessions = rows.map((row) => ({
      ...row,
      total_cost: Number.parseFloat(row.total_cost || "0"),
      total_tokens: Number.parseInt(row.total_tokens || "0", 10),
    }))

    return Response.json({ sessions })
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Database operation failed", sessions: [] }, { status: 500 })
  }
}
