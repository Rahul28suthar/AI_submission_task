export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!process.env.POSTGRES_URL) {
      return Response.json({ error: "Database not configured" }, { status: 503 })
    }

    const { sql } = await import("@vercel/postgres")
    const { rows } = await sql`
      SELECT * FROM research_sessions
      WHERE id = ${params.id}
    `

    if (rows.length === 0) {
      return Response.json({ error: "Session not found" }, { status: 404 })
    }

    const session = {
      ...rows[0],
      total_cost: Number.parseFloat(rows[0].total_cost || "0"),
      total_tokens: Number.parseInt(rows[0].total_tokens || "0", 10),
    }

    return Response.json(session)
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Database operation failed" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!process.env.POSTGRES_URL) {
      return Response.json({ error: "Database not configured" }, { status: 503 })
    }

    const { sql } = await import("@vercel/postgres")
    const updates = await req.json()

    const updateFields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`)
      values.push(updates.status)
    }
    if (updates.total_tokens !== undefined) {
      updateFields.push(`total_tokens = $${paramIndex++}`)
      values.push(updates.total_tokens)
    }
    if (updates.total_cost !== undefined) {
      updateFields.push(`total_cost = $${paramIndex++}`)
      values.push(updates.total_cost)
    }
    if (updates.result_summary !== undefined) {
      updateFields.push(`result_summary = $${paramIndex++}`)
      values.push(updates.result_summary)
    }
    if (updates.completed_at !== undefined) {
      updateFields.push(`completed_at = $${paramIndex++}`)
      values.push(updates.completed_at)
    }

    updateFields.push(`updated_at = $${paramIndex++}`)
    values.push(new Date().toISOString())

    if (updateFields.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(params.id)

    await sql.query(
      `
      UPDATE research_sessions
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
    `,
      values,
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Database operation failed" }, { status: 500 })
  }
}
