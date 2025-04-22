export interface Message {
  role: "user" | "assistant" | "system"
  content: string
  provider?: string
  id?: string
}

export interface Conversation {
  id: string
  messages: Message[]
}

export interface TimeBlock {
  id: string
  title: string
  duration: number
  category: string
  completed: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  dueDate?: string
  status: "not-started" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  priority: "low" | "medium" | "high"
}

export interface AIConfig {
  geminiApiKey?: string
  openaiApiKey?: string
  anthropicApiKey?: string
  mistralApiKey?: string
  cohereApiKey?: string
  huggingfaceApiKey?: string
  openrouterApiKey?: string
  useProviderFallback?: boolean
}
export interface TimeBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  color: string
  category?: string
  description?: string
}

export interface NewTimeBlock {
  title: string
  startTime: string
  endTime: string
  color: string
  category: string
  description: string
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  focusModeEnabled: boolean
  notificationsEnabled: boolean
  workHours: {
    start: string
    end: string
  }
  workDays: string[]
}
