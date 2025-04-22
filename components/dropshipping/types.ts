export interface Mentor {
  id: string
  name: string
  specialty: string
  image: string
  description: string
  expertise: string[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  isLoading?: boolean
}

export interface ResourceSection {
  heading?: string
  paragraphs: string[]
  bullets?: string[]
}

export interface Resource {
  id: string
  title: string
  description: string
  category: "beginner" | "advanced"
  content: ResourceSection[]
  author?: string
  relatedResources?: string[]
}
