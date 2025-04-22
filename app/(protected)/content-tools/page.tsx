"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Check, FileText, List, FileCode, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAIStore, sendMessageToAI } from "@/lib/ai-service"

export default function ContentToolsPage() {
  const [activeTab, setActiveTab] = useState("summarize-content")
  const [inputContent, setInputContent] = useState("")
  const [outputContent, setOutputContent] = useState("")
  const [maxLength, setMaxLength] = useState("500")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { apiKeys, provider } = useAIStore()

  const handleSummarize = async () => {
    if (!inputContent.trim()) return
    setIsProcessing(true)

    try {
      const prompt = `Please summarize the following content in about ${maxLength} characters:

${inputContent}

Keep the summary concise but include all key points. Format it nicely with paragraphs and bullet points if needed.`

      const summary = await sendMessageToAI(prompt, [], apiKeys.gemini, provider)
      setOutputContent(summary)

      toast({
        title: "Content summarized",
        description: "Your content has been successfully summarized.",
      })
    } catch (error) {
      console.error("Error summarizing content:", error)
      toast({
        title: "Error",
        description: "Failed to summarize content. Please try again.",
        variant: "destructive",
      })
      setOutputContent("An error occurred while summarizing your content. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExtractKeyPoints = async () => {
    if (!inputContent.trim()) return
    setIsProcessing(true)

    try {
      const prompt = `Extract the key points from the following content:

${inputContent}

Format your response with:
1. Main Ideas (3-5 bullet points)
2. Supporting Details (3-5 bullet points)
3. Action Items (if applicable)

Use markdown formatting for better readability.`

      const keyPoints = await sendMessageToAI(prompt, [], apiKeys.gemini, provider)
      setOutputContent(keyPoints)

      toast({
        title: "Key points extracted",
        description: "The key points from your content have been extracted.",
      })
    } catch (error) {
      console.error("Error extracting key points:", error)
      toast({
        title: "Error",
        description: "Failed to extract key points. Please try again.",
        variant: "destructive",
      })
      setOutputContent("An error occurred while extracting key points. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFormat = async () => {
    if (!inputContent.trim()) return
    setIsProcessing(true)

    try {
      const prompt = `Format the following content to improve readability:

${inputContent}

Apply proper markdown formatting with:
- Consistent heading structure
- Proper paragraph spacing
- Bullet points for lists
- Emphasis on key terms
- Proper quotation formatting

Make it look professional and easy to read.`

      const formatted = await sendMessageToAI(prompt, [], apiKeys.gemini, provider)
      setOutputContent(formatted)

      toast({
        title: "Content formatted",
        description: "Your content has been formatted for improved readability.",
      })
    } catch (error) {
      console.error("Error formatting content:", error)
      toast({
        title: "Error",
        description: "Failed to format content. Please try again.",
        variant: "destructive",
      })
      setOutputContent("An error occurred while formatting your content. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerate = async () => {
    if (!inputContent.trim()) return
    setIsProcessing(true)

    try {
      const prompt = `Generate content based on the following instructions:

${inputContent}

Create high-quality, well-structured content that is:
- Engaging and readable
- Well-organized with proper headings
- Factually accurate
- Free of grammatical errors
- Formatted with markdown for readability

The content should be comprehensive and thorough.`

      const generated = await sendMessageToAI(prompt, [], apiKeys.gemini, provider)
      setOutputContent(generated)

      toast({
        title: "Content generated",
        description: "Your content has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating content:", error)
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      })
      setOutputContent("An error occurred while generating content. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputContent)
    setCopied(true)

    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const getActionButton = () => {
    const isDisabled = isProcessing || !inputContent.trim()

    if (isProcessing) {
      return (
        <Button disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {activeTab === "summarize-content"
            ? "Summarizing..."
            : activeTab === "extract-key-points"
              ? "Extracting..."
              : activeTab === "format"
                ? "Formatting..."
                : "Generating..."}
        </Button>
      )
    }

    switch (activeTab) {
      case "summarize-content":
        return (
          <Button onClick={handleSummarize} disabled={isDisabled}>
            Summarize
          </Button>
        )
      case "extract-key-points":
        return (
          <Button onClick={handleExtractKeyPoints} disabled={isDisabled}>
            Extract Key Points
          </Button>
        )
      case "format":
        return (
          <Button onClick={handleFormat} disabled={isDisabled}>
            Format Content
          </Button>
        )
      case "generate":
        return (
          <Button onClick={handleGenerate} disabled={isDisabled}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </Button>
        )
    }
  }

  const getIcon = () => {
    switch (activeTab) {
      case "summarize-content":
        return <FileText className="h-5 w-5" />
      case "extract-key-points":
        return <List className="h-5 w-5" />
      case "format":
        return <FileCode className="h-5 w-5" />
      case "generate":
        return <Sparkles className="h-5 w-5" />
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Content Tools</h1>
      <p className="text-muted-foreground mb-6">Process and transform your productivity protocols and content</p>

      <Tabs defaultValue="summarize-content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="summarize-content">Summarize Content</TabsTrigger>
          <TabsTrigger value="extract-key-points">Extract Key Points</TabsTrigger>
          <TabsTrigger value="format">Format</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getIcon()}
                <span>Input Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === "summarize-content" &&
                  "Paste your productivity protocols or research content to summarize"}
                {activeTab === "extract-key-points" && "Paste your content to extract the key points and main ideas"}
                {activeTab === "format" && "Paste your content to format and improve readability"}
                {activeTab === "generate" && "Describe what content you want to generate"}
              </p>

              <Textarea
                placeholder={`Enter ${activeTab === "generate" ? "instructions for content to generate" : `content to ${activeTab === "summarize-content" ? "summarize" : activeTab === "extract-key-points" ? "extract key points from" : "format"}`}...`}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                className="min-h-[300px]"
              />

              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setInputContent("")} disabled={isProcessing}>
                  Clear
                </Button>
                {getActionButton()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>
                  {activeTab === "summarize-content" && "Summary"}
                  {activeTab === "extract-key-points" && "Key Points"}
                  {activeTab === "format" && "Formatted Content"}
                  {activeTab === "generate" && "Generated Content"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === "summarize-content" && "AI-generated summary of your content"}
                {activeTab === "extract-key-points" && "Key points and main ideas extracted from your content"}
                {activeTab === "format" && "Your content formatted for improved readability"}
                {activeTab === "generate" && "AI-generated content based on your instructions"}
              </p>

              <Textarea
                placeholder={`Your ${activeTab === "summarize-content" ? "summary" : activeTab === "extract-key-points" ? "key points" : activeTab === "format" ? "formatted content" : "generated content"} will appear here`}
                value={outputContent}
                readOnly
                className="min-h-[300px]"
              />

              <div className="flex justify-between items-center mt-4">
                {activeTab === "summarize-content" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Max length:</span>
                    <Select value={maxLength} onValueChange={setMaxLength}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Max length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250">250 chars</SelectItem>
                        <SelectItem value="500">500 chars</SelectItem>
                        <SelectItem value="1000">1000 chars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {activeTab !== "summarize-content" && <div />}

                <Button variant="outline" size="sm" disabled={!outputContent} onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usage Tips</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-2 list-disc pl-5">
              {activeTab === "summarize-content" && (
                <>
                  <li>Paste productivity protocols or any research content to get a concise summary</li>
                  <li>Adjust the maximum length to control the detail level of your summary</li>
                  <li>Use the summarized content for quick reference or to share with your team</li>
                  <li>For best results, provide structured content with clear sections</li>
                </>
              )}

              {activeTab === "extract-key-points" && (
                <>
                  <li>Paste any content to extract the most important points and ideas</li>
                  <li>Use for quickly understanding the essence of long documents</li>
                  <li>Great for creating action items from meeting notes or research papers</li>
                  <li>The AI will identify main ideas, supporting details, and potential action items</li>
                </>
              )}

              {activeTab === "format" && (
                <>
                  <li>Paste unformatted or poorly formatted content to improve readability</li>
                  <li>Great for cleaning up notes, drafts, or content from various sources</li>
                  <li>The AI will add proper headings, spacing, and formatting</li>
                  <li>Use for preparing content for sharing or publishing</li>
                </>
              )}

              {activeTab === "generate" && (
                <>
                  <li>Describe what content you need, such as "Write a project brief for a website redesign"</li>
                  <li>Be specific about the tone, length, and style you want</li>
                  <li>Include key points or information that must be included</li>
                  <li>The AI will generate well-structured, coherent content based on your instructions</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
