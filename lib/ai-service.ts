import storage from "./storage-simple"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AIProvider = "auto" | "deepseek" | "gemini" | "huggingface" | "openai" | "anthropic" | "mistral" | "cohere"

export interface AIConfig {
  provider: AIProvider
  deepseekApiKey?: string
  geminiApiKey?: string
  huggingfaceApiKey?: string
  openaiApiKey?: string
  anthropicApiKey?: string
  mistralApiKey?: string
  cohereApiKey?: string
  enableFallback?: boolean
  useCustomKeys?: boolean
}

export interface AIMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  provider?: string
}

export interface AIConversation {
  id: string
  name: string
  projectId: number | null
  messages: AIMessage[]
  lastUpdated: string
}

// Simple function to generate unique IDs (replacement for uuid)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Default API keys (using the provided keys)
export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "auto", // Default to auto, which will prefer Gemini
  deepseekApiKey: "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",
  geminiApiKey: "AIzaSyA8pVCXhk7uVDgUNcrUqOmUwCK1dECWyPg",
  huggingfaceApiKey: "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",
  openaiApiKey: "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",
  anthropicApiKey: "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",
  mistralApiKey: "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",
  cohereApiKey: "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",
  enableFallback: true,
}

// Storage keys
const AI_CONFIG_KEY = "productivity_pro_ai_config"
const AI_CONVERSATIONS_KEY = "productivity_pro_conversations"

// Get the current AI configuration
export const getAIConfig = (): AIConfig => {
  return storage.get<AIConfig>(AI_CONFIG_KEY, DEFAULT_AI_CONFIG, true)
}

// Save AI configuration
export const saveAIConfig = (config: AIConfig): void => {
  storage.set<AIConfig>(AI_CONFIG_KEY, config, true)
}

// Check if AI is configured
export const isAIConfigured = (): boolean => {
  const config = getAIConfig()
  if (config.provider === "auto") {
    return !!(
      config.geminiApiKey ||
      config.huggingfaceApiKey ||
      config.deepseekApiKey ||
      config.openaiApiKey ||
      config.anthropicApiKey ||
      config.mistralApiKey ||
      config.cohereApiKey
    )
  } else if (config.provider === "deepseek") {
    return !!config.deepseekApiKey
  } else if (config.provider === "gemini") {
    return !!config.geminiApiKey
  } else if (config.provider === "huggingface") {
    return !!config.huggingfaceApiKey
  } else if (config.provider === "openai") {
    return !!config.openaiApiKey
  } else if (config.provider === "anthropic") {
    return !!config.anthropicApiKey
  } else if (config.provider === "mistral") {
    return !!config.mistralApiKey
  } else if (config.provider === "cohere") {
    return !!config.cohereApiKey
  }
  return false
}

// Get the active provider based on configuration
export const getActiveProvider = (): string => {
  const config = getAIConfig()
  if (config.provider === "auto") {
    // Prefer Gemini as requested, then try others in order
    if (config.geminiApiKey) return "gemini"
    if (config.openaiApiKey) return "openai"
    if (config.anthropicApiKey) return "anthropic"
    if (config.mistralApiKey) return "mistral"
    if (config.deepseekApiKey) return "deepseek"
    if (config.cohereApiKey) return "cohere"
    if (config.huggingfaceApiKey) return "huggingface"
    return "demo"
  }
  return config.provider
}

// Get all conversations
export const getConversations = (): AIConversation[] => {
  return storage.get<AIConversation[]>(AI_CONVERSATIONS_KEY, [])
}

// Get a specific conversation
export const getConversation = (id: string): AIConversation | null => {
  const conversations = getConversations()
  return conversations.find((conv) => conv.id === id) || null
}

// Get conversations for a project
export const getProjectConversations = (projectId: number | null): AIConversation[] => {
  const conversations = getConversations()
  return conversations.filter((conv) => conv.projectId === projectId)
}

// Create a new conversation
export const createConversation = (name: string, projectId: number | null): AIConversation => {
  const conversations = getConversations()
  const newConversation: AIConversation = {
    id: generateId(),
    name,
    projectId,
    messages: [],
    lastUpdated: new Date().toISOString(),
  }

  conversations.push(newConversation)
  storage.set<AIConversation[]>(AI_CONVERSATIONS_KEY, conversations)
  return newConversation
}

// Add a message to a conversation
export const addMessageToConversation = (
  conversationId: string,
  message: Omit<AIMessage, "id" | "timestamp">,
): AIConversation | null => {
  const conversations = getConversations()
  const conversationIndex = conversations.findIndex((conv) => conv.id === conversationId)

  if (conversationIndex === -1) return null

  const newMessage: AIMessage = {
    ...message,
    id: generateId(),
    timestamp: new Date().toISOString(),
  }

  conversations[conversationIndex].messages.push(newMessage)
  conversations[conversationIndex].lastUpdated = new Date().toISOString()

  storage.set<AIConversation[]>(AI_CONVERSATIONS_KEY, conversations)
  return conversations[conversationIndex]
}

// Delete a conversation
export const deleteConversation = (id: string): boolean => {
  const conversations = getConversations()
  const filteredConversations = conversations.filter((conv) => conv.id !== id)

  if (filteredConversations.length === conversations.length) {
    return false // Conversation not found
  }

  storage.set<AIConversation[]>(AI_CONVERSATIONS_KEY, filteredConversations)
  return true
}

// Clear all conversations
export const clearConversations = (): void => {
  storage.set<AIConversation[]>(AI_CONVERSATIONS_KEY, [])
}

// Test API key validity
export const testApiKey = async (
  provider: "gemini" | "deepseek" | "huggingface" | "openai" | "anthropic" | "mistral" | "cohere",
  apiKey: string,
): Promise<boolean> => {
  try {
    if (provider === "gemini") {
      // Test Gemini API key with a simple request
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello, this is a test message." }] }],
          }),
        },
      )

      const data = await response.json()
      return !data.error
    } else if (
      provider === "deepseek" ||
      provider === "openai" ||
      provider === "anthropic" ||
      provider === "mistral" ||
      provider === "cohere"
    ) {
      // Test OpenRouter-based API keys with a simple request
      const modelMap = {
        deepseek: "deepseek/deepseek-coder",
        openai: "openai/gpt-3.5-turbo",
        anthropic: "anthropic/claude-3-haiku",
        mistral: "mistralai/mistral-7b-instruct",
        cohere: "cohere/command-r",
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://pocketwindryft.app",
          "X-Title": "PocketWinDryft Pro",
        },
        body: JSON.stringify({
          model: modelMap[provider],
          messages: [{ role: "user", content: "Hello, this is a test message." }],
          max_tokens: 100,
        }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return !data.error
    } else if (provider === "huggingface") {
      // Test HuggingFace API key with a simple request
      const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: "Hello, this is a test message.",
          parameters: {
            max_new_tokens: 100,
            return_full_text: false,
          },
        }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return Array.isArray(data) && data.length > 0
    }
    return false
  } catch (error) {
    console.error(`Error testing ${provider} API key:`, error)
    return false
  }
}

// Try each provider in sequence until one works
const tryProviders = async (
  message: string,
  history: AIMessage[],
  config: AIConfig,
): Promise<{ response: string; provider: string }> => {
  // Define the order of providers to try
  const providerOrder: AIProvider[] = ["gemini", "openai", "anthropic", "mistral", "deepseek", "cohere", "huggingface"]

  // Start with the configured provider
  const startWithProvider = config.provider === "auto" ? "gemini" : config.provider

  // Reorder the providers to start with the configured one
  const orderedProviders = [startWithProvider, ...providerOrder.filter((p) => p !== startWithProvider)]

  // If fallback is disabled, only try the primary provider
  const providersToTry = config.enableFallback ? orderedProviders : [orderedProviders[0]]

  // Try each provider in sequence
  for (const provider of providersToTry) {
    try {
      const apiKey = config[`${provider}ApiKey`]
      if (!apiKey) continue

      console.log(`Trying provider: ${provider}`)
      const response = await sendMessageToProvider(message, history, apiKey, provider)
      return { response, provider }
    } catch (error) {
      console.error(`Error with provider ${provider}:`, error)
      // Continue to the next provider
    }
  }

  // If all providers failed
  return {
    response: "All AI providers failed to respond. Please check your API keys and try again later.",
    provider: "error",
  }
}

// Send a message to a specific provider
const sendMessageToProvider = async (
  message: string,
  history: AIMessage[],
  apiKey: string,
  provider: string,
): Promise<string> => {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("No valid API key provided")
  }

  if (provider === "gemini") {
    // Make actual API call to Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || "Error calling Gemini API")
    }

    // Extract the response text from the correct path in the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text || "No response generated."
    } else {
      throw new Error("Unexpected response format from Gemini API")
    }
  } else if (
    provider === "deepseek" ||
    provider === "openai" ||
    provider === "anthropic" ||
    provider === "mistral" ||
    provider === "cohere"
  ) {
    // Map of provider to model
    const modelMap = {
      deepseek: "deepseek/deepseek-v3-base:free",
      openai: "openai/gpt-3.5-turbo",
      anthropic: "anthropic/claude-3-haiku",
      mistral: "mistralai/mistral-7b-instruct",
      cohere: "cohere/command-r",
    }

    // Ensure we have a valid origin for the HTTP-Referer header
    const origin = typeof window !== "undefined" ? window.location.origin : "https://pocketwindryft.app"

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": origin,
        "X-Title": "PocketWinDryft Pro",
      },
      body: JSON.stringify({
        model: modelMap[provider],
        messages: [
          {
            role: "system",
            content: "You are a helpful productivity assistant. Provide concise, helpful responses.",
          },
          ...history.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`${provider} API error response:`, errorText)
      try {
        const errorData = JSON.parse(errorText)
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
      } catch (e) {
        throw new Error(`HTTP error ${response.status}: ${errorText.substring(0, 100)}`)
      }
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || `Error calling ${provider} API`)
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error(`Unexpected ${provider} response format:`, data)
      throw new Error(`Received an invalid response format from ${provider}`)
    }

    return data.choices[0].message.content || "No response generated."
  } else if (provider === "huggingface") {
    // Make API call to HuggingFace
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${message} [/INST]`,
        parameters: {
          max_new_tokens: 500,
          return_full_text: false,
          temperature: 0.7,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    const data = await response.json()

    if (Array.isArray(data) && data.length > 0) {
      return data[0].generated_text || "No response generated."
    } else {
      throw new Error("Unexpected response format from HuggingFace API")
    }
  } else {
    throw new Error(`Unsupported provider: ${provider}`)
  }
}

// Send a message to the AI with fallback support
export const sendMessageToAI = async (
  message: string,
  history: AIMessage[],
): Promise<{ response: string; provider: string }> => {
  try {
    const config = getAIConfig()
    return await tryProviders(message, history, config)
  } catch (error) {
    console.error("Error calling AI API:", error)
    return {
      response: `There was an error processing your request: ${error.message}. Please try again later.`,
      provider: "error",
    }
  }
}

interface AIState {
  apiKeys: {
    gemini: string
    deepseek?: string
    huggingface?: string
    openai?: string
    anthropic?: string
    mistral?: string
    cohere?: string
  }
  provider: string
  conversations: any[]
  currentConversationId: string | null
  setApiKeys: (keys: {
    gemini?: string
    deepseek?: string
    huggingface?: string
    openai?: string
    anthropic?: string
    mistral?: string
    cohere?: string
  }) => void
  setProvider: (provider: string) => void
  addMessage: (content: string, role: string) => void
  createConversation: () => void
  deleteConversation: (id: string) => void
  setCurrentConversation: (id: string) => void
  getCurrentConversation: () => any
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      apiKeys: {
        gemini: "AIzaSyA8pVCXhk7uVDgUNcrUqOmUwCK1dECWyPg",
        deepseek: "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",
        huggingface: "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",
        openai: "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",
        anthropic: "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",
        mistral: "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",
        cohere: "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",
      },
      provider: "gemini",
      conversations: [],
      currentConversationId: null,
      setApiKeys: (keys) =>
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            ...keys,
          },
        })),
      setProvider: (provider) => set({ provider }),
      addMessage: (content, role) =>
        set((state) => {
          if (!state.currentConversationId) return state

          const updatedConversations = state.conversations.map((conversation) => {
            if (conversation.id === state.currentConversationId) {
              return {
                ...conversation,
                messages: [...conversation.messages, { content, role, timestamp: Date.now() }],
              }
            }
            return conversation
          })

          return { conversations: updatedConversations }
        }),
      createConversation: () => {
        const newConversation = {
          id: generateId(),
          name: "New Conversation",
          messages: [],
        }

        set((state) => ({
          conversations: [...state.conversations, newConversation],
          currentConversationId: newConversation.id,
        }))
      },
      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((conversation) => conversation.id !== id),
          currentConversationId:
            state.currentConversationId === id ? state.conversations[0]?.id || null : state.currentConversationId,
        })),
      setCurrentConversation: (id) => set({ currentConversationId: id }),
      getCurrentConversation: () => {
        const currentConversationId = get().currentConversationId
        const conversations = get().conversations
        if (!currentConversationId) return null
        return conversations.find((c) => c.id === currentConversationId) || null
      },
    }),
    {
      name: "ai-assistant-storage",
    },
  ),
)

export const useAiStore = useAIStore

// AI Service for the Dropshipping Tool

import type { AIMessage as DropshippingAIMessage } from "@/components/dropshipping/types"

// This function sends a message to the AI and returns the response
export async function sendMessageToAIDropshipping(
  message: string,
  history: DropshippingAIMessage[] = [],
): Promise<{ response: string; provider: string }> {
  try {
    // In a real implementation, this would call an actual AI API
    // For now, we'll simulate a response based on the message content

    // Wait for a realistic delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a response based on the message content
    let response = ""
    const provider = "AI Assistant"

    if (message.toLowerCase().includes("product")) {
      response =
        "When looking for winning products, focus on items that solve a specific problem or fulfill a passionate need. Look for products with a 'wow factor' that can generate impulse purchases. The best products often have these characteristics:\n\n1. Solve a clear problem\n2. Have a profit margin of at least 40%\n3. Are lightweight and easy to ship\n4. Are not readily available in local stores\n5. Have potential for viral marketing content"
    } else if (message.toLowerCase().includes("ad") || message.toLowerCase().includes("marketing")) {
      response =
        "For effective dropshipping marketing, I recommend starting with Facebook or TikTok ads depending on your target audience. The key is to create compelling ad creatives that showcase your product solving a problem.\n\nStart with a small daily budget ($10-20) to test different ad creatives and audiences. Once you find a winning combination (ROAS > 1.5), gradually scale by increasing your budget by 20-30% every 2-3 days.\n\nDon't forget to implement retargeting campaigns for visitors who didn't convert on their first visit."
    } else if (message.toLowerCase().includes("scale") || message.toLowerCase().includes("grow")) {
      response =
        "Scaling a dropshipping business requires a systematic approach:\n\n1. Horizontal scaling: Test more products in your winning niche\n2. Vertical scaling: Increase ad spend on winning products gradually (20-30% every 2-3 days)\n3. Geographic expansion: Target new countries with proven products\n4. Platform expansion: Add new marketing channels beyond your initial platform\n5. Customer retention: Implement email marketing to increase lifetime value\n\nThe key is to maintain profitability while scaling. Monitor your metrics daily and be ready to adjust your strategy based on performance data."
    } else if (message.toLowerCase().includes("supplier") || message.toLowerCase().includes("shipping")) {
      response =
        "Finding reliable suppliers is crucial for dropshipping success. Here are my recommendations:\n\n1. AliExpress: Good for beginners, but longer shipping times (15-30 days)\n2. CJ Dropshipping: Better shipping times (7-15 days) and quality control\n3. Spocket: Premium suppliers with faster shipping (3-7 days) but higher costs\n4. Private agents: Best option once you're scaling, offering 7-12 day shipping and better rates\n\nWhen evaluating suppliers, check their communication responsiveness, product quality, and shipping times. Consider ordering samples before committing to a supplier for a product you plan to scale."
    } else if (message.toLowerCase().includes("brand") || message.toLowerCase().includes("branding")) {
      response =
        "Building a brand is essential for long-term dropshipping success. Here's how to transform your store into a brand:\n\n1. Develop a consistent visual identity (logo, colors, typography)\n2. Create a compelling brand story and mission\n3. Add branded elements to your packaging and products\n4. Build a content strategy that provides value beyond your products\n5. Establish a unique voice and personality in all communications\n6. Focus on customer experience to generate positive word-of-mouth\n\nBranded stores typically have higher conversion rates, better customer retention, and can command premium pricing compared to generic dropshipping stores."
    } else if (message.toLowerCase().includes("store") || message.toLowerCase().includes("shopify")) {
      response =
        "For a high-converting dropshipping store, focus on these key elements:\n\n1. Clean, mobile-optimized design with fast loading times\n2. High-quality product images and videos showing the product in use\n3. Benefit-focused product descriptions that address customer pain points\n4. Trust signals (reviews, guarantees, secure payment icons)\n5. Simplified checkout process with multiple payment options\n6. Clear shipping and return policies to build confidence\n7. Scarcity and urgency elements (limited stock, time-limited offers)\n\nRegularly test different elements of your store to improve conversion rates. Even small improvements can significantly impact your profitability."
    } else {
      response =
        "To succeed in dropshipping, focus on these key areas:\n\n1. Product research: Find items with a clear value proposition and good profit margins\n2. Store design: Create a professional, trustworthy store that converts visitors\n3. Marketing: Test different platforms and creatives to find winning combinations\n4. Customer service: Provide excellent support to build reputation and repeat business\n5. Optimization: Continuously improve your store, ads, and product offerings\n\nRemember that dropshipping is a real business that requires dedication and persistence. Most successful dropshippers test many products before finding winners that scale profitably."
    }

    return { response, provider }
  } catch (error) {
    console.error("Error in sendMessageToAI:", error)
    throw new Error("Failed to get AI response")
  }
}
