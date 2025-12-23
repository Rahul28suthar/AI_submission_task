import type { NextRequest } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id

    // Fetch session data
    const sessionResponse = await fetch(`${req.nextUrl.origin}/api/db/sessions/${sessionId}`)
    if (!sessionResponse.ok) {
      return Response.json({ error: "Session not found" }, { status: 404 })
    }
    const session = await sessionResponse.json()

    // Fetch research steps
    const stepsResponse = await fetch(`${req.nextUrl.origin}/api/db/steps?session_id=${sessionId}`)
    const stepsData = await stepsResponse.json()
    const steps = stepsData.steps || []

    return Response.json({ session, steps })
  } catch (error) {
    console.error("Research fetch error:", error)
    return Response.json({ error: "Failed to fetch research" }, { status: 500 })
  }
}
