export async function POST(req: Request) {
  try {
    const { sessionId, additionalQuery } = await req.json()

    if (!sessionId || !additionalQuery?.trim()) {
      return Response.json({ error: "Session ID and additional query required" }, { status: 400 })
    }

    // Fetch original session
    const sessionResponse = await fetch(`${new URL(req.url).origin}/api/db/sessions/${sessionId}`)
    if (!sessionResponse.ok) {
      return Response.json({ error: "Original session not found" }, { status: 404 })
    }
    const originalSession = await sessionResponse.json()

    // Fetch previous research steps for context
    const stepsResponse = await fetch(`${new URL(req.url).origin}/api/db/steps?session_id=${sessionId}`)
    const stepsData = await stepsResponse.json()
    const previousSteps = stepsData.steps || []

    // Fetch documents from original session
    const docsResponse = await fetch(`${new URL(req.url).origin}/api/db/documents?session_id=${sessionId}`)
    const docsData = await docsResponse.json()
    const documents = docsData.documents || []

    // Create new research session
    const newSessionId = crypto.randomUUID()
    const combinedQuery = `${originalSession.query}\n\nContinuation: ${additionalQuery}\n\nPrevious research context: ${previousSteps
      .slice(0, 3)
      .map((s: { content: string }) => s.content)
      .join(" ")}`

    await fetch(`${new URL(req.url).origin}/api/db/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newSessionId,
        query: combinedQuery,
        status: "running",
      }),
    })

    // Copy documents to new session
    for (const doc of documents) {
      await fetch(`${new URL(req.url).origin}/api/db/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: newSessionId,
          filename: doc.filename,
          content: doc.content,
          file_size: doc.file_size,
          mime_type: doc.mime_type,
        }),
      })
    }

    // Start research process (reusing the same logic from the main research route)
    const { startResearch } = await import("../route")
    startResearch(newSessionId, combinedQuery, new URL(req.url).origin).catch(console.error)

    return Response.json({ newSessionId })
  } catch (error) {
    console.error("Continue research error:", error)
    return Response.json({ error: "Failed to continue research" }, { status: 500 })
  }
}
