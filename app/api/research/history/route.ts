import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${req.nextUrl.origin}/api/db/sessions`)
    if (!response.ok) {
      throw new Error("Failed to fetch sessions")
    }

    const data = await response.json()
    return Response.json({ sessions: data.sessions || [] })
  } catch (error) {
    console.error("History fetch error:", error)
    return Response.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
