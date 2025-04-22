"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type ProviderStatus = {
  name: string
  status: "untested" | "success" | "error"
  message?: string
  responseTime?: number
}

export function AIDiagnostics() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<ProviderStatus[]>([
    { name: "OpenAI", status: "untested" },
    { name: "Gemini", status: "untested" },
    { name: "Claude", status: "untested" },
    { name: "Mistral", status: "untested" },
    { name: "Cohere", status: "untested" },
  ])

  const runDiagnostics = async () => {
    setIsRunning(true)

    // Simulate testing each provider
    const updatedResults = [...results]

    for (let i = 0; i < updatedResults.length; i++) {
      // Update status to show we're testing this provider
      updatedResults[i] = { ...updatedResults[i], status: "untested" }
      setResults([...updatedResults])

      // Simulate API test with random success/failure
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, let's make Gemini always succeed
      if (updatedResults[i].name === "Gemini") {
        updatedResults[i] = {
          ...updatedResults[i],
          status: "success",
          responseTime: 420,
          message: "API connection successful",
        }
      } else {
        // Random success/failure for others
        const success = Math.random() > 0.7
        updatedResults[i] = {
          ...updatedResults[i],
          status: success ? "success" : "error",
          responseTime: success ? Math.floor(Math.random() * 500) + 300 : undefined,
          message: success ? "API connection successful" : "API key invalid or service unavailable",
        }
      }

      setResults([...updatedResults])
    }

    setIsRunning(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider Diagnostics</CardTitle>
        <CardDescription>Test your AI provider connections and troubleshoot issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.some((r) => r.status === "error") && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Issues Detected</AlertTitle>
            <AlertDescription>
              Some AI providers are not responding correctly. Check your API keys and provider status.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {results.map((provider, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-2">
                {provider.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                {provider.status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                {provider.status === "untested" && <div className="h-4 w-4 rounded-full bg-gray-200" />}
                <span>{provider.name}</span>
                {provider.status === "success" && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {provider.responseTime}ms
                  </Badge>
                )}
              </div>
              <Badge
                variant={
                  provider.status === "success" ? "success" : provider.status === "error" ? "destructive" : "outline"
                }
              >
                {provider.status === "success" ? "Connected" : provider.status === "error" ? "Failed" : "Untested"}
              </Badge>
            </div>
          ))}
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="troubleshooting">
            <AccordionTrigger>Troubleshooting Tips</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">If you're having issues with AI providers:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verify your API keys are correct and not expired</li>
                  <li>Check if you have sufficient credits/quota with the provider</li>
                  <li>Ensure your network allows connections to the API endpoints</li>
                  <li>Try enabling the fallback mechanism in settings</li>
                  <li>Check the provider's status page for any outages</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connections...
            </>
          ) : (
            "Run Diagnostics"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AIDiagnostics
