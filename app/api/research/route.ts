import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const query = formData.get("query") as string
    const files = formData.getAll("files") as File[]

    if (!query?.trim()) {
      return Response.json({ error: "Query is required" }, { status: 400 })
    }

    // Create new research session
    const sessionId = crypto.randomUUID()

    // Store session in database
    const sessionResponse = await fetch(`${req.nextUrl.origin}/api/db/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sessionId,
        query,
        status: "running",
      }),
    })

    if (!sessionResponse.ok) {
      throw new Error("Failed to create session")
    }

    // Handle document uploads
    if (files.length > 0) {
      for (const file of files) {
        const content = await file.text()
        await fetch(`${req.nextUrl.origin}/api/db/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            filename: file.name,
            content,
            file_size: file.size,
            mime_type: file.type,
          }),
        })
      }
    }

    // Start research process asynchronously
    startResearch(sessionId, query, req.nextUrl.origin).catch(console.error)

    return Response.json({ sessionId })
  } catch (error) {
    console.error("Research API error:", error)
    return Response.json({ error: "Failed to start research" }, { status: 500 })
  }
}

export async function startResearch(sessionId: string, query: string, origin: string) {
  try {
    // Import AI SDK dynamically to avoid bundling issues
    const { streamText, tool } = await import("ai")
    const { z } = await import("zod")

    let totalTokens = 0
    let stepNumber = 0

    // Define research tools
    const researchTools = {
      searchWeb: tool({
        description: "Search the web for information on a specific topic",
        inputSchema: z.object({
          searchQuery: z.string().describe("The search query"),
        }),
        execute: async function* ({ searchQuery }) {
          yield { state: "searching" as const }
          await new Promise((resolve) => setTimeout(resolve, 1500))

          const mockResults = `Found information about: ${searchQuery}. [Simulated search results would appear here in production]`

          yield {
            state: "complete" as const,
            results: mockResults,
          }

          return mockResults
        },
      }),

      analyzeData: tool({
        description: "Analyze and synthesize information from multiple sources",
        inputSchema: z.object({
          data: z.string().describe("The data to analyze"),
          focus: z.string().describe("What aspect to focus on"),
        }),
        execute: async function* ({ data, focus }) {
          yield { state: "analyzing" as const }
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const analysis = `Analysis focused on ${focus}: ${data.substring(0, 100)}...`

          yield {
            state: "complete" as const,
            analysis,
          }

          return analysis
        },
      }),
    }

    // Get any uploaded documents for context
    const docsResponse = await fetch(`${origin}/api/db/documents?session_id=${sessionId}`)
    let documentContext = ""
    if (docsResponse.ok) {
      const { documents } = await docsResponse.json()
      if (documents.length > 0) {
        documentContext = `\n\nAdditional context from uploaded documents:\n${documents.map((d: { filename: string; content: string }) => `${d.filename}:\n${d.content}`).join("\n\n")}`
      }
    }

    // Start research with AI
    const result = streamText({
      model: "openai/gpt-5",
      prompt: `You are a research assistant. Conduct comprehensive research on the following query: "${query}"${documentContext}
      
Break down the research into clear steps, search for relevant information, analyze findings, and provide a detailed summary.`,
      tools: researchTools,
      maxOutputTokens: 4000,
    })

    // Track steps and tokens
    const stream = result.textStream

    let currentStepContent = ""
    for await (const chunk of stream) {
      currentStepContent += chunk

      // Save step when we have substantial content (simulated step detection)
      if (currentStepContent.length > 100 && currentStepContent.includes("\n")) {
        stepNumber++
        const tokensInStep = Math.ceil(currentStepContent.length / 4) // Rough token estimate

        await fetch(`${origin}/api/db/steps`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            step_number: stepNumber,
            step_type: "analysis",
            content: currentStepContent.trim(),
            tokens_used: tokensInStep,
          }),
        })

        totalTokens += tokensInStep
        currentStepContent = ""
      }
    }

    // Save final step if any remaining content
    if (currentStepContent.trim()) {
      stepNumber++
      const tokensInStep = Math.ceil(currentStepContent.length / 4)

      await fetch(`${origin}/api/db/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          step_number: stepNumber,
          step_type: "summary",
          content: currentStepContent.trim(),
          tokens_used: tokensInStep,
        }),
      })

      totalTokens += tokensInStep
    }

    // Get full result for summary
    const fullResult = await result.text

    // Calculate cost (GPT-5 pricing: ~$0.01 per 1K tokens average)
    const totalCost = (totalTokens / 1000) * 0.01

    // Update session with completion
    await fetch(`${origin}/api/db/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        total_tokens: totalTokens,
        total_cost: totalCost,
        result_summary: fullResult,
        completed_at: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error("Research execution error:", error)

    // Mark session as failed
    await fetch(`${origin}/api/db/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "failed",
      }),
    })
  }
}
