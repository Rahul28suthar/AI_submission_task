"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Upload, Loader2, ArrowRight, AlertCircle } from "lucide-react"

export function ResearchForm() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("query", query)
      uploadedFiles.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/research", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = `/research/${data.sessionId}`
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to start research")
      }
    } catch (error) {
      console.error("Research submission failed:", error)
      setError("Failed to connect to the server. Please check your database connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files))
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive mb-1">Error</p>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="query" className="text-sm font-medium text-foreground">
            Research Query
          </label>
          <Textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What would you like to research? E.g., 'Compare the latest advances in quantum computing with classical computing limitations'"
            className="min-h-32 bg-background border-input text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Upload Documents (Optional)</label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border text-foreground bg-transparent"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.md,.pdf,.doc,.docx"
            />
            {uploadedFiles.length > 0 && (
              <span className="text-sm text-muted-foreground">{uploadedFiles.length} file(s) selected</span>
            )}
          </div>
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {uploadedFiles.map((file, index) => (
                <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting Research...
            </>
          ) : (
            <>
              Start Research
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
