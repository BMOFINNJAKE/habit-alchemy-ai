"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AIContextType {
  apiKeys: {
    gemini: string
    openRouter: string
    openai?: string
    anthropic?: string
    mistral?: string
    cohere?: string
    deepseek?: string
    huggingface?: string
  }
  setApiKeys: (keys: {
    gemini?: string
    openRouter?: string
    openai?: string
    anthropic?: string
    mistral?: string
    cohere?: string
    deepseek?: string
    huggingface?: string
  }) => void
  provider: string
  setProvider: (provider: string) => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: ReactNode }) {
  const [apiKeys, setApiKeys] = useState({
    gemini: "AIzaSyA8pVCXhk7uVDgUNcrUqOmUwCK1dECWyPg",
    openRouter: "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",
  })

  const [provider, setProvider] = useState("gemini")

  const updateApiKeys = (keys: {
    gemini?: string
    openRouter?: string
    openai?: string
    anthropic?: string
    mistral?: string
    cohere?: string
    deepseek?: string
    huggingface?: string
  }) => {
    setApiKeys((prev) => ({
      ...prev,
      ...keys,
    }))
  }

  return (
    <AIContext.Provider
      value={{
        apiKeys,
        setApiKeys: updateApiKeys,
        provider,
        setProvider,
      }}
    >
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider")
  }
  return context
}

// Add this export to fix the missing useAIStore error
export const useAIStore = () => {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error("useAIStore must be used within an AIProvider")
  }
  return {
    apiKeys: context.apiKeys,
    provider: context.provider,
    setApiKeys: context.setApiKeys,
    setProvider: context.setProvider,
  }
}

export default AIProvider
