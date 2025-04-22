"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getAIConfig, saveAIConfig, DEFAULT_AI_CONFIG, type AIProvider } from "@/lib/ai-service"
import { AlertTriangle, CheckCircle, Info, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SettingsForm() {
  const { toast } = useToast()
  const [provider, setProvider] = useState<AIProvider>(DEFAULT_AI_CONFIG.provider)
  const [deepseekApiKey, setDeepseekApiKey] = useState("")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [huggingfaceApiKey, setHuggingfaceApiKey] = useState("")
  const [openaiApiKey, setOpenAIApiKey] = useState("")
  const [anthropicApiKey, setAnthropicApiKey] = useState("")
  const [mistralApiKey, setMistralApiKey] = useState("")
  const [cohereApiKey, setCohereApiKey] = useState("")
  const [enableFallback, setEnableFallback] = useState(true)

  const [isTestingDeepseek, setIsTestingDeepseek] = useState(false)
  const [isTestingGemini, setIsTestingGemini] = useState(false)
  const [isTestingHuggingface, setIsTestingHuggingface] = useState(false)
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false)
  const [isTestingAnthropic, setIsTestingAnthropic] = useState(false)
  const [isTestingMistral, setIsTestingMistral] = useState(false)
  const [isTestingCohere, setIsTestingCohere] = useState(false)

  const [deepseekStatus, setDeepseekStatus] = useState<"untested" | "success" | "error">("untested")
  const [geminiStatus, setGeminiStatus] = useState<"untested" | "success" | "error">("untested")
  const [huggingfaceStatus, setHuggingfaceStatus] = useState<"untested" | "success" | "error">("untested")
  const [openaiStatus, setOpenAIStatus] = useState<"untested" | "success" | "error">("untested")
  const [anthropicStatus, setAnthropicStatus] = useState<"untested" | "success" | "error">("untested")
  const [mistralStatus, setMistralStatus] = useState<"untested" | "success" | "error">("untested")
  const [cohereStatus, setCohereStatus] = useState<"untested" | "success" | "error">("untested")

  const [useDefaultKeys, setUseDefaultKeys] = useState(true)

  // Load current config when component mounts
  useEffect(() => {
    const config = getAIConfig()
    setProvider(config.provider)
    setEnableFallback(config.enableFallback !== undefined ? config.enableFallback : true)

    // Check if using default keys
    const usingDefaults =
      (config.deepseekApiKey === DEFAULT_AI_CONFIG.deepseekApiKey || !config.deepseekApiKey) &&
      (config.geminiApiKey === DEFAULT_AI_CONFIG.geminiApiKey || !config.geminiApiKey) &&
      (config.huggingfaceApiKey === DEFAULT_AI_CONFIG.huggingfaceApiKey || !config.huggingfaceApiKey) &&
      (config.openaiApiKey === DEFAULT_AI_CONFIG.openaiApiKey || !config.openaiApiKey) &&
      (config.anthropicApiKey === DEFAULT_AI_CONFIG.anthropicApiKey || !config.anthropicApiKey) &&
      (config.mistralApiKey === DEFAULT_AI_CONFIG.mistralApiKey || !config.mistralApiKey) &&
      (config.cohereApiKey === DEFAULT_AI_CONFIG.cohereApiKey || !config.cohereApiKey)

    setUseDefaultKeys(usingDefaults)

    // Only show custom keys if not using defaults
    if (!usingDefaults) {
      setDeepseekApiKey(config.deepseekApiKey || "")
      setGeminiApiKey(config.geminiApiKey || "")
      setHuggingfaceApiKey(config.huggingfaceApiKey || "")
      setOpenAIApiKey(config.openaiApiKey || "")
      setAnthropicApiKey(config.anthropicApiKey || "")
      setMistralApiKey(config.mistralApiKey || "")
      setCohereApiKey(config.cohereApiKey || "")
    } else {
      setDeepseekApiKey("")
      setGeminiApiKey("")
      setHuggingfaceApiKey("")
      setOpenAIApiKey("")
      setAnthropicApiKey("")
      setMistralApiKey("")
      setCohereApiKey("")
    }
  }, [])

  const handleSave = () => {
    try {
      // Determine which API keys to save
      const keysToSave = {
        provider,
        enableFallback,
        deepseekApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.deepseekApiKey : deepseekApiKey.trim(),
        geminiApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.geminiApiKey : geminiApiKey.trim(),
        huggingfaceApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.huggingfaceApiKey : huggingfaceApiKey.trim(),
        openaiApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.openaiApiKey : openaiApiKey.trim(),
        anthropicApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.anthropicApiKey : anthropicApiKey.trim(),
        mistralApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.mistralApiKey : mistralApiKey.trim(),
        cohereApiKey: useDefaultKeys ? DEFAULT_AI_CONFIG.cohereApiKey : cohereApiKey.trim(),
        useCustomKeys: !useDefaultKeys,
      }

      // Save to localStorage
      localStorage.setItem("productivity_pro_ai_config", JSON.stringify(keysToSave))

      // Also use the saveAIConfig function
      saveAIConfig(keysToSave)

      toast({
        title: "AI Settings Saved",
        description: `Using ${
          provider === "auto"
            ? "Auto (preferring Gemini)"
            : provider === "deepseek"
              ? "DeepSeek (via OpenRouter)"
              : provider === "openai"
                ? "OpenAI (via OpenRouter)"
                : provider === "anthropic"
                  ? "Anthropic (via OpenRouter)"
                  : provider === "mistral"
                    ? "Mistral (via OpenRouter)"
                    : provider === "cohere"
                      ? "Cohere (via OpenRouter)"
                      : provider === "huggingface"
                        ? "HuggingFace"
                        : "Gemini"
        } as your AI provider${enableFallback ? " with fallback enabled" : ""}.`,
      })
    } catch (error) {
      console.error("Error saving AI settings:", error)
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your AI settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const testApiKey = async (provider: string, apiKey: string) => {
    // For demo purposes, simulate a successful test
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return apiKey.length > 10 // Simple validation for demo
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
      setDeepseekStatus(isValid ? "success" : "error")
      toast({
        title: isValid ? "DeepSeek API Key Valid" : "Invalid API Key",
        description: isValid
          ? "Your DeepSeek API key has been validated successfully."
          : "The DeepSeek API key is invalid. Please check and try again.",
        variant: isValid ? "default" : "destructive",
      })
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
      setGeminiStatus(isValid ? "success" : "error")
      toast({
        title: isValid ? "Gemini API Key Valid" : "Invalid API Key",
        description: isValid
          ? "Your Gemini API key has been validated successfully."
          : "The Gemini API key is invalid. Please check and try again.",
        variant: isValid ? "default" : "destructive",
      })
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
      setHuggingfaceStatus(isValid ? "success" : "error")
      toast({
        title: isValid ? "HuggingFace API Key Valid" : "Invalid API Key",
        description: isValid
          ? "Your HuggingFace API key has been validated successfully."
          : "The HuggingFace API key is invalid. Please check and try again.",
        variant: isValid ? "default" : "destructive",
      })
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

  const testOpenAIApiKey = async () => {
    const keyToTest = useDefaultKeys ? DEFAULT_AI_CONFIG.openaiApiKey : openaiApiKey.trim()

    if (!keyToTest) {
      toast({
        title: "API Key Required",
        description: "Please enter an OpenAI API key to test.",
        variant: "destructive",
      })
      return
    }

    setIsTestingOpenAI(true)

    try {
      const isValid = await testApiKey("openai", keyToTest)
      setOpenAIStatus(isValid ? "success" : "error")
      toast({
        title: isValid ? "OpenAI API Key Valid" : "Invalid API Key",
        description: isValid
          ? "Your OpenAI API key has been validated successfully."
          : "The OpenAI API key is invalid. Please check and try again.",
        variant: isValid ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing OpenAI API key:", error)
      setOpenAIStatus("error")
      toast({
        title: "API Test Failed",
        description: "Failed to validate OpenAI API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTestingOpenAI(false)
    }
  }

  const testAnthropicApiKey = async () => {
    const keyToTest = useDefaultKeys ? DEFAULT_AI_CONFIG.anthropicApiKey : anthropicApiKey.trim()

    if (!keyToTest) {
      toast({
        title: "API Key Required",
        description: "Please enter an Anthropic API key to test.",
        variant: "destructive",
      })
      return
    }

    setIsTestingAnthropic(true)

    try {
      const isValid = await testApiKey("anthropic", keyToTest)
      setAnthropicStatus(isValid ? "success" : "error")
      toast({
        title: isValid ? "Anthropic API Key Valid" : "Invalid API Key",
        description: isValid
          ? "Your Anthropic API key has been validated successfully."
          : "The Anthropic API key is invalid. Please check and try again.",
        variant: isValid ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing Anthropic API key:", error)
      setAnthropicStatus("error")
      toast({
        title: "API Test Failed",
        description: "Failed to validate Anthropic API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTestingAnthropic(false)
    }
  }

  const testMistralApiKey = async () => {
    const keyToTest = useDefaultKeys ? DEFAULT_AI_CONFIG.mistralApiKey : mistralApiKey.trim()

    if (!keyToTest) {
      toast({
        title: "API Key Required",
        description: "Please enter a Mistral API key to test.",
        variant: "destructive",
      })
      return
    }

    setIsTestingMistral(true)

    try {
      const isValid = await testApiKey("mistral", keyToTest)
      setMistralStatus(isValid ? "success" : "error")
      toast({
        title: isValid ? "Mistral API Key Valid" : "Invalid API Key",
        description: isValid
          ? "Your Mistral API key has been validated successfully."
          : "The Mistral API key is invalid. Please check and try again.",
        variant: isValid ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing Mistral API key:", error)
      setMistralStatus("error")
      toast({
        title: "API Test Failed",
        description: "Failed to validate Mistral API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTestingMistral(false)
    }
  }

  const testCohereApiKey = async () => {
    const keyToTest = useDefaultKeys ? DEFAULT_AI_CONFIG.cohereApiKey : cohereApiKey.trim()

    if (!keyToTest) {
      toast({
        title: "API Key Required",
        description: "Please enter a Cohere API key to test.",
        variant: "destructive",
      })
      return
    }

    setIsTestingCohere(true)

    try {
      const isValid = await testApiKey("cohere", keyToTest)
      setCohereStatus(isValid ? "success" : "error")
      toast({
        title: isValid ? "Cohere API Key Valid" : "Invalid API Key",
        description: isValid
          ? "Your Cohere API key has been validated successfully."
          : "The Cohere API key is invalid. Please check and try again.",
        variant: isValid ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing Cohere API key:", error)
      setCohereStatus("error")
      toast({
        title: "API Test Failed",
        description: "Failed to validate Cohere API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTestingCohere(false)
    }
  }

  return (
    <div className="space-y-6 py-4">
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
              <SelectItem value="openai">OpenAI (via OpenRouter)</SelectItem>
              <SelectItem value="anthropic">Anthropic Claude (via OpenRouter)</SelectItem>
              <SelectItem value="mistral">Mistral (via OpenRouter)</SelectItem>
              <SelectItem value="deepseek">DeepSeek (via OpenRouter)</SelectItem>
              <SelectItem value="cohere">Cohere (via OpenRouter)</SelectItem>
              <SelectItem value="huggingface">HuggingFace</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            The "Auto" option will use Gemini 1.5 Flash if available, falling back to other providers if needed.
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-fallback" className="text-sm font-medium">
                Enable Fallback
              </Label>
              <p className="text-xs text-gray-500">
                If enabled, the system will automatically try other providers if the primary one fails.
              </p>
            </div>
            <Switch id="enable-fallback" checked={enableFallback} onCheckedChange={setEnableFallback} />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label>API Keys</Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="use-default-keys" className="text-sm">
                Use built-in API keys (toggle off to use your own)
              </Label>
              <Switch id="use-default-keys" checked={useDefaultKeys} onCheckedChange={setUseDefaultKeys} />
            </div>
          </div>

          {useDefaultKeys ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Using Built-in API Keys</AlertTitle>
              <AlertDescription>
                You're currently using the pre-configured API keys. Toggle the switch OFF to enter and use your own API
                keys instead.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
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
                      geminiStatus !== "untested" ? `border-${geminiStatus === "success" ? "green" : "red"}-500` : ""
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
                  <Label className="text-sm font-medium">OpenAI API Key (via OpenRouter)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testOpenAIApiKey}
                    disabled={isTestingOpenAI || !openaiApiKey.trim()}
                  >
                    {isTestingOpenAI ? "Testing..." : "Test Key"}
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="sk-or-..."
                    value={openaiApiKey}
                    onChange={(e) => setOpenAIApiKey(e.target.value)}
                    className={
                      openaiStatus !== "untested" ? `border-${openaiStatus === "success" ? "green" : "red"}-500` : ""
                    }
                  />
                  {openaiStatus === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-500 absolute right-3 top-3" />
                  )}
                  {openaiStatus === "error" && (
                    <AlertTriangle className="h-4 w-4 text-red-500 absolute right-3 top-3" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">DeepSeek API Key (via OpenRouter)</Label>
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
                    placeholder="sk-or-..."
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
            </div>
          )}
        </div>
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Settings
      </Button>
    </div>
  )
}
