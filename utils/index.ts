// AI Configuration
interface AIConfig {
  geminiApiKey?: string
  openaiApiKey?: string
  anthropicApiKey?: string
  mistralApiKey?: string
  cohereApiKey?: string
  huggingfaceApiKey?: string
  openrouterApiKey?: string
  useProviderFallback?: boolean
}

// Get AI configuration from localStorage
export function getAIConfig(): AIConfig {
  if (typeof window === "undefined") return {}

  const config = localStorage.getItem("aiConfig")
  return config ? JSON.parse(config) : {}
}

// Save AI configuration to localStorage
export function saveAIConfig(config: AIConfig): void {
  if (typeof window === "undefined") return

  localStorage.setItem("aiConfig", JSON.stringify(config))
}

// Get active provider from localStorage
export function getActiveProvider(): string {
  if (typeof window === "undefined") return "gemini"

  const provider = localStorage.getItem("activeProvider")
  return provider || "gemini"
}

// Set active provider in localStorage
export function setActiveProvider(provider: string): void {
  if (typeof window === "undefined") return

  localStorage.setItem("activeProvider", provider)
}

// Conversation management
interface Message {
  role: "user" | "assistant" | "system"
  content: string
  provider?: string
  id?: string
}

interface Conversation {
  id: string
  messages: Message[]
}

// Get all conversations from localStorage
export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return []

  const conversations = localStorage.getItem("conversations")
  return conversations ? JSON.parse(conversations) : []
}

// Get a specific conversation by ID
export function getConversation(id: string): Conversation | null {
  const conversations = getConversations()
  return conversations.find((conv) => conv.id === id) || null
}

// Add a new conversation
export function addConversation(conversation: Conversation): void {
  const conversations = getConversations()
  conversations.push(conversation)
  localStorage.setItem("conversations", JSON.stringify(conversations))
}

// Update an existing conversation
export function updateConversation(updatedConversation: Conversation): boolean {
  const conversations = getConversations()
  const index = conversations.findIndex((conv) => conv.id === updatedConversation.id)

  if (index === -1) return false

  conversations[index] = updatedConversation
  localStorage.setItem("conversations", JSON.stringify(conversations))
  return true
}

// Delete a conversation
export function deleteConversation(id: string): boolean {
  const conversations = getConversations()
  const filteredConversations = conversations.filter((conv) => conv.id !== id)

  if (filteredConversations.length === conversations.length) return false

  localStorage.setItem("conversations", JSON.stringify(filteredConversations))
  return true
}

// Add a message to a conversation
export function addMessageToConversation(conversationId: string, message: Message): Conversation | null {
  const conversation = getConversation(conversationId)
  if (!conversation) return null

  conversation.messages.push(message)
  updateConversation(conversation)
  return conversation
}

// Send message to AI
export async function sendMessageToAI(
  message: string,
  conversationHistory: Message[],
  apiKey: string,
  provider = "gemini",
): Promise<string> {
  // This is a placeholder implementation
  // In a real app, you would call your AI provider's API here

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For demo purposes, return a simple response
  const responses = {
    gemini: `This is a simulated response from Gemini AI. You said: "${message}"`,
    openai: `This is a simulated response from OpenAI. You said: "${message}"`,
    anthropic: `This is a simulated response from Anthropic Claude. You said: "${message}"`,
    mistral: `This is a simulated response from Mistral AI. You said: "${message}"`,
    cohere: `This is a simulated response from Cohere. You said: "${message}"`,
    huggingface: `This is a simulated response from Hugging Face. You said: "${message}"`,
  }

  return responses[provider] || `This is a simulated response. You said: "${message}"`
}
