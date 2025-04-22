"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type AIProvider, getAIConfig, saveAIConfig, DEFAULT_AI_CONFIG, testApiKey } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, CheckCircle, Info, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

interface AISettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AISettingsDialog({ open, onOpenChange }: AISettingsDialogProps) {
  const { toast } = useToast()
  const [provider, setProvider] = useState<AIProvider>(DEFAULT_AI_CONFIG.provider)
  const [deepseekApiKey, setDeepseekApiKey] = useState("")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [huggingfaceApiKey, setHuggingfaceApiKey] = useState("")
  const [isTestingDeepseek, setIsTestingDeepseek] = useState(false)
  const [isTestingGemini, setIsTestingGemini] = useState(false)
  const [isTestingHuggingface, setIsTestingHuggingface] = useState(false)
  const [deepseekStatus, setDeepseekStatus] = useState<"untested" | "success" | "error">("untested")
  const [geminiStatus, setGeminiStatus] = useState<"untested" | "success" | "error">("untested")
  const [huggingfaceStatus, setHuggingfaceStatus] = useState<"untested" | "success" | "error">("untested")
  const [useDefaultKeys, setUseDefaultKeys] = useState(true)

  // Load current config when dialog opens
  useEffect(() => {
    if (open) {
      const config = getAIConfig()
      setProvider(config.provider)

      // Check if using default keys
      const usingDefaults =
        (config.deepseekApiKey === DEFAULT_AI_CONFIG.deepseekApiKey || !config.deepseekApiKey) &&
        (config.geminiApiKey === DEFAULT_AI_CONFIG.geminiApiKey || !config.geminiApiKey) &&
        (config.huggingfaceApiKey === DEFAULT_AI_CONFIG.huggingfaceApiKey || !config.huggingfaceApiKey)

      setUseDefaultKeys(usingDefaults)

      // Only show custom keys if not using defaults
      if (!usingDefaults) {
        setDeepseekApiKey(config.deepseekApiKey || "")
        setGeminiApiKey(config.geminiApiKey || "")
        setHuggingfaceApiKey(config.huggingfaceApiKey || "")
      } else {
        setDeepseekApiKey("")
        setGeminiApiKey("")
        setHuggingfaceApiKey("")
      }

      setDeepseekStatus("untested")
      setGeminiStatus("untested")
      setHuggingfaceStatus("untested")
    }
  }, [open])

  const handleSave = () => {
    // Determine which API keys to save
    const keysToSave = {
      provider,
      deepseekApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.deepseekApiKey : deepseekApiKey.trim(),
      geminiApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.geminiApiKey : geminiApiKey.trim(),
      huggingfaceApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.huggingfaceApiKey : huggingfaceApiKey.trim(),
    }

    saveAIConfig(keysToSave)

    toast({
      title: "AI Settings Saved",
      description: `Using ${
        provider === "auto"
          ? "Auto (preferring Gemini)"
          : provider === "deepseek"
            ? "DeepSeek"
            : provider === "huggingface"
              ? "HuggingFace"
              : "Gemini"
      } as your AI provider.`,
    })

    onOpenChange(false)
  }

  const testDeepseekApiKey = async () => {
    const keyToTest = useDefaultKeys ? DEFAULT_AI_CONFIG.deepseekApiKey : deepseekApiKey.trim()

    if (!keyToTest) {
      toast({
        title: "API Key Required",
        description: "Please enter a DeepSeek API key to test.",
        variant: "destructive",
      })
      return
    }

    setIsTestingDeepseek(true)

    try {
      const isValid = await testApiKey("deepseek", keyToTest)

      if (isValid) {
        setDeepseekStatus("success")
        toast({
          title: "DeepSeek API Key Valid",
          description: "Your DeepSeek API key has been validated successfully.",
        })
      } else {
        setDeepseekStatus("error")
        toast({
          title: "Invalid API Key",
          description: "The DeepSeek API key is invalid. Please check and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing DeepSeek API key:", error)
      setDeepseekStatus("error")
      toast({
        title: "API Test Failed",
        description: "Failed to validate DeepSeek API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTestingDeepseek(false)
    }
  }

  const testGeminiApiKey = async () => {
    const keyToTest = useDefaultKeys ? DEFAULT_AI_CONFIG.geminiApiKey : geminiApiKey.trim()

    if (!keyToTest) {
      toast({
        title: "API Key Required",
        description: "Please enter a Gemini API key to test.",
        variant: "destructive",
      })
      return
    }

    setIsTestingGemini(true)

    try {
      const isValid = await testApiKey("gemini", keyToTest)

      if (isValid) {
        setGeminiStatus("success")
        toast({
          title: "Gemini API Key Valid",
          description: "Your Gemini API key has been validated successfully.",
        })
      } else {
        setGeminiStatus("error")
        toast({
          title: "Invalid API Key",
          description: "The Gemini API key is invalid. Please check and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing Gemini API key:", error)
      setGeminiStatus("error")
      toast({
        title: "API Test Failed",
        description: "Failed to validate Gemini API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTestingGemini(false)
    }
  }

  const testHuggingfaceApiKey = async () => {
    const keyToTest = useDefaultKeys ? DEFAULT_AI_CONFIG.huggingfaceApiKey : huggingfaceApiKey.trim()

    if (!keyToTest) {
      toast({
        title: "API Key Required",
        description: "Please enter a HuggingFace API key to test.",
        variant: "destructive",
      })
      return
    }

    setIsTestingHuggingface(true)

    try {
      const isValid = await testApiKey("huggingface", keyToTest)

      if (isValid) {
        setHuggingfaceStatus("success")
        toast({
          title: "HuggingFace API Key Valid",
          description: "Your HuggingFace API key has been validated successfully.",
        })
      } else {
        setHuggingfaceStatus("error")
        toast({
          title: "Invalid API Key",
          description: "The HuggingFace API key is invalid. Please check and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing HuggingFace API key:", error)
      setHuggingfaceStatus("error")
      toast({
        title: "API Test Failed",
        description: "Failed to validate HuggingFace API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTestingHuggingface(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>Configure AI providers and API settings.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertTitle>Security Note</AlertTitle>
            <AlertDescription>Your API keys are stored securely in your browser's local storage.</AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <Select value={provider} onValueChange={(value: AIProvider) => setProvider(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Prefer Gemini)</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="huggingface">HuggingFace</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                The "Auto" option will use Gemini 1.5 Flash if available, falling back to HuggingFace or DeepSeek if
                needed.
              </p>
            </div>

            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label>API Keys</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="use-default-keys" className="text-sm">
                    Use provided keys
                  </Label>
                  <Switch id="use-default-keys" checked={useDefaultKeys} onCheckedChange={setUseDefaultKeys} />
                </div>
              </div>

              {useDefaultKeys ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Using Provided API Keys</AlertTitle>
                  <AlertDescription>
                    You're using the pre-configured API keys. Toggle the switch to use your own keys.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Gemini API Key</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testGeminiApiKey}
                        disabled={isTestingGemini || !geminiApiKey.trim()}
                      >
                        {isTestingGemini ? "Testing..." : "Test Key"}
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="..."
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        className={
                          geminiStatus !== "untested"
                            ? `border-${geminiStatus === "success" ? "green" : "red"}-500`
                            : ""
                        }
                      />
                      {geminiStatus === "success" && (
                        <CheckCircle className="h-4 w-4 text-green-500 absolute right-3 top-3" />
                      )}
                      {geminiStatus === "error" && (
                        <AlertTriangle className="h-4 w-4 text-red-500 absolute right-3 top-3" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">HuggingFace API Key</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testHuggingfaceApiKey}
                        disabled={isTestingHuggingface || !huggingfaceApiKey.trim()}
                      >
                        {isTestingHuggingface ? "Testing..." : "Test Key"}
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="hf_..."
                        value={huggingfaceApiKey}
                        onChange={(e) => setHuggingfaceApiKey(e.target.value)}
                        className={
                          huggingfaceStatus !== "untested"
                            ? `border-${huggingfaceStatus === "success" ? "green" : "red"}-500`
                            : ""
                        }
                      />
                      {huggingfaceStatus === "success" && (
                        <CheckCircle className="h-4 w-4 text-green-500 absolute right-3 top-3" />
                      )}
                      {huggingfaceStatus === "error" && (
                        <AlertTriangle className="h-4 w-4 text-red-500 absolute right-3 top-3" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">DeepSeek API Key</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testDeepseekApiKey}
                        disabled={isTestingDeepseek || !deepseekApiKey.trim()}
                      >
                        {isTestingDeepseek ? "Testing..." : "Test Key"}
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={deepseekApiKey}
                        onChange={(e) => setDeepseekApiKey(e.target.value)}
                        className={
                          deepseekStatus !== "untested"
                            ? `border-${deepseekStatus === "success" ? "green" : "red"}-500`
                            : ""
                        }
                      />
                      {deepseekStatus === "success" && (
                        <CheckCircle className="h-4 w-4 text-green-500 absolute right-3 top-3" />
                      )}
                      {deepseekStatus === "error" && (
                        <AlertTriangle className="h-4 w-4 text-red-500 absolute right-3 top-3" />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
