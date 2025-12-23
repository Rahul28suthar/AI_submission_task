export async function POST(req: Request) {
  try {
    if (!process.env.POSTGRES_URL) {
      return Response.json({ error: "Database not configured" }, { status: 503 })
    }

    const { sql } = await import("@vercel/postgres")
    const { session_id, filename, content, file_size, mime_type } = await req.json()

    await sql`
      INSERT INTO documents (session_id, filename, content, file_size, mime_type)
      VALUES (${session_id}, ${filename}, ${content}, ${file_size}, ${mime_type || "text/plain"})
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
      return Response.json({ error: "Database not configured", documents: [] }, { status: 503 })
    }

    const { sql } = await import("@vercel/postgres")
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return Response.json({ error: "session_id required" }, { status: 400 })
    }

    const { rows } = await sql`
      SELECT * FROM documents
      WHERE session_id = ${sessionId}
      ORDER BY uploaded_at DESC
    `

    return Response.json({ documents: rows })
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Database operation failed", documents: [] }, { status: 500 })
  }
}
