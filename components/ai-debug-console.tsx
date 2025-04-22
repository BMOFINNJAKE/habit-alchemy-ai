"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bug, CheckCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { getAIConfig, testApiKey } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"

export function AIDebugConsole() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    gemini: { status: "untested" | "success" | "error"; message?: string }
    deepseek: { status: "untested" | "success" | "error"; message?: string }
    huggingface: { status: "untested" | "success" | "error"; message?: string }
    openai: { status: "untested" | "success" | "error"; message?: string }
  }>({
    gemini: { status: "untested" },
    deepseek: { status: "untested" },
    huggingface: { status: "untested" },
    openai: { status: "untested" },
  })

  const runDiagnostics = async () => {
    setIsLoading(true)
    const config = getAIConfig()

    const newResults = { ...results }

    // Test Gemini
    if (config.geminiApiKey) {
      try {
        const isValid = await testApiKey("gemini", config.geminiApiKey)
        newResults.gemini = {
          status: isValid ? "success" : "error",
          message: isValid ? "API key is valid" : "API key is invalid",
        }
      } catch (error) {
        newResults.gemini = {
          status: "error",
          message: `Error: ${error.message}`,
        }
      }
    } else {
      newResults.gemini = {
        status: "error",
        message: "No API key configured",
      }
    }

    // Test DeepSeek
    if (config.deepseekApiKey) {
      try {
        const isValid = await testApiKey("deepseek", config.deepseekApiKey)
        newResults.deepseek = {
          status: isValid ? "success" : "error",
          message: isValid ? "API key is valid" : "API key is invalid",
        }
      } catch (error) {
        newResults.deepseek = {
          status: "error",
          message: `Error: ${error.message}`,
        }
      }
    } else {
      newResults.deepseek = {
        status: "error",
        message: "No API key configured",
      }
    }

    // Test HuggingFace
    if (config.huggingfaceApiKey) {
      try {
        const isValid = await testApiKey("huggingface", config.huggingfaceApiKey)
        newResults.huggingface = {
          status: isValid ? "success" : "error",
          message: isValid ? "API key is valid" : "API key is invalid",
        }
      } catch (error) {
        newResults.huggingface = {
          status: "error",
          message: `Error: ${error.message}`,
        }
      }
    } else {
      newResults.huggingface = {
        status: "error",
        message: "No API key configured",
      }
    }

    // Test OpenAI
    if (config.openaiApiKey) {
      try {
        const isValid = await testApiKey("openai", config.openaiApiKey)
        newResults.openai = {
          status: isValid ? "success" : "error",
          message: isValid ? "API key is valid" : "API key is invalid",
        }
      } catch (error) {
        newResults.openai = {
          status: "error",
          message: `Error: ${error.message}`,
        }
      }
    } else {
      newResults.openai = {
        status: "error",
        message: "No API key configured",
      }
    }

    setResults(newResults)
    setIsLoading(false)

    toast({
      title: "Diagnostics Complete",
      description: "AI provider diagnostics have been completed.",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Bug className="mr-2 h-5 w-5" />
            AI Diagnostics
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </CardTitle>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Run diagnostics to check the status of your AI providers
                </p>
                <Button size="sm" onClick={runDiagnostics} disabled={isLoading} className="flex items-center">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Run Diagnostics
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Provider</span>
                  <span className="font-medium">Status</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span>Gemini</span>
                  <div>
                    {results.gemini.status === "untested" ? (
                      <Badge variant="outline">Not Tested</Badge>
                    ) : results.gemini.status === "success" ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Working
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span>OpenAI (via OpenRouter)</span>
                  <div>
                    {results.openai.status === "untested" ? (
                      <Badge variant="outline">Not Tested</Badge>
                    ) : results.openai.status === "success" ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Working
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span>DeepSeek (via OpenRouter)</span>
                  <div>
                    {results.deepseek.status === "untested" ? (
                      <Badge variant="outline">Not Tested</Badge>
                    ) : results.deepseek.status === "success" ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Working
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span>HuggingFace</span>
                  <div>
                    {results.huggingface.status === "untested" ? (
                      <Badge variant="outline">Not Tested</Badge>
                    ) : results.huggingface.status === "success" ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Working
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {Object.values(results).some((r) => r.status === "error" && r.message) && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm">
                  <h4 className="font-medium mb-2">Error Details:</h4>
                  <ul className="space-y-1 list-disc pl-5">
                    {results.gemini.status === "error" && results.gemini.message && (
                      <li>Gemini: {results.gemini.message}</li>
                    )}
                    {results.openai.status === "error" && results.openai.message && (
                      <li>OpenAI: {results.openai.message}</li>
                    )}
                    {results.deepseek.status === "error" && results.deepseek.message && (
                      <li>DeepSeek: {results.deepseek.message}</li>
                    )}
                    {results.huggingface.status === "error" && results.huggingface.message && (
                      <li>HuggingFace: {results.huggingface.message}</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="text-xs text-muted-foreground mt-4">
                <p>Note: If you're experiencing issues with AI providers, try the following:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Check that your API keys are valid and have sufficient credits</li>
                  <li>For OpenRouter-based providers (OpenAI, DeepSeek), ensure your OpenRouter account is active</li>
                  <li>Try switching to Gemini as it tends to be the most reliable option</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default AIDebugConsole
