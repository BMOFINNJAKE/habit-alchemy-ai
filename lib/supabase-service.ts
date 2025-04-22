import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

// Types
export interface Project {
  id: string
  name: string
  description: string
  category?: string
  progress: number
  deadline?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  project_id?: string
  due_date?: string
  priority?: "low" | "medium" | "high" | "urgent"
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  project_id?: string
  start_time: string
  end_time?: string
  duration?: number
  notes?: string
  created_at: string
}

export interface TimeBlock {
  id: string
  title: string
  start_time: string
  end_time: string
  category?: string
  color?: string
  description?: string
  is_recurring: boolean
  recurrence_pattern?: string
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  name: string
  description?: string
  frequency: "daily" | "weekly" | "monthly" | "custom"
  frequency_config?: any
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  completed_date: string
  notes?: string
  created_at: string
}

export interface AIConversation {
  id: string
  title: string
  project_id?: string
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system"
  content: string
  provider?: string
  created_at: string
}

export interface Automation {
  id: string
  name: string
  active: boolean
  trigger_type: string
  trigger_config: any
  action_type: string
  action_config: any
  created_at: string
  updated_at: string
}

export interface UserSettings {
  theme: string
  notifications_enabled: boolean
  ai_provider: string
  ai_config?: any
  created_at: string
  updated_at: string
}

// Helper function to get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

// Projects
export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return data || []
}

export const getProject = async (id: string): Promise<Project | null> => {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching project ${id}:`, error)
    return null
  }

  return data
}

export const createProject = async (
  project: Omit<Project, "id" | "created_at" | "updated_at" | "progress">,
): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...project,
      progress: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    return null
  }

  return data
}

export const updateProject = async (id: string, project: Partial<Project>): Promise<Project | null> => {
  const { data, error } = await supabase.from("projects").update(project).eq("id", id).select().single()

  if (error) {
    console.error(`Error updating project ${id}:`, error)
    return null
  }

  return data
}

export const deleteProject = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting project ${id}:`, error)
    return false
  }

  return true
}

// Tasks
export const getTasks = async (projectId?: string): Promise<Task[]> => {
  let query = supabase.from("tasks").select("*").order("due_date", { ascending: true })

  if (projectId) {
    query = query.eq("project_id", projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data || []
}

export const getTask = async (id: string): Promise<Task | null> => {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching task ${id}:`, error)
    return null
  }

  return data
}

export const createTask = async (task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task | null> => {
  const { data, error } = await supabase.from("tasks").insert(task).select().single()

  if (error) {
    console.error("Error creating task:", error)
    return null
  }

  return data
}

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task | null> => {
  const { data, error } = await supabase.from("tasks").update(task).eq("id", id).select().single()

  if (error) {
    console.error(`Error updating task ${id}:`, error)
    return null
  }

  return data
}

export const deleteTask = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting task ${id}:`, error)
    return false
  }

  return true
}

export const toggleTaskCompletion = async (id: string): Promise<Task | null> => {
  // First get the current task
  const { data: task, error: fetchError } = await supabase.from("tasks").select("*").eq("id", id).single()

  if (fetchError) {
    console.error(`Error fetching task ${id}:`, fetchError)
    return null
  }

  // Then toggle the completed status
  const { data, error } = await supabase
    .from("tasks")
    .update({ completed: !task.completed })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error toggling task ${id} completion:`, error)
    return null
  }

  return data
}

// Sessions
export const getSessions = async (projectId?: string): Promise<Session[]> => {
  let query = supabase.from("sessions").select("*").order("start_time", { ascending: false })

  if (projectId) {
    query = query.eq("project_id", projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching sessions:", error)
    return []
  }

  return data || []
}

export const startSession = async (projectId?: string): Promise<Session | null> => {
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      project_id: projectId,
      start_time: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error starting session:", error)
    return null
  }

  return data
}

export const endSession = async (id: string, notes?: string): Promise<Session | null> => {
  const { data, error } = await supabase
    .from("sessions")
    .update({
      end_time: new Date().toISOString(),
      notes,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error ending session ${id}:`, error)
    return null
  }

  return data
}

// Time Blocks
export const getTimeBlocks = async (startDate: Date, endDate: Date): Promise<TimeBlock[]> => {
  const { data, error } = await supabase.rpc("get_user_time_blocks", {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  })

  if (error) {
    console.error("Error fetching time blocks:", error)
    return []
  }

  return data || []
}

export const createTimeBlock = async (
  timeBlock: Omit<TimeBlock, "id" | "created_at" | "updated_at">,
): Promise<TimeBlock | null> => {
  const { data, error } = await supabase.from("time_blocks").insert(timeBlock).select().single()

  if (error) {
    console.error("Error creating time block:", error)
    return null
  }

  return data
}

export const updateTimeBlock = async (id: string, timeBlock: Partial<TimeBlock>): Promise<TimeBlock | null> => {
  const { data, error } = await supabase.from("time_blocks").update(timeBlock).eq("id", id).select().single()

  if (error) {
    console.error(`Error updating time block ${id}:`, error)
    return null
  }

  return data
}

export const deleteTimeBlock = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("time_blocks").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting time block ${id}:`, error)
    return false
  }

  return true
}

// AI Conversations
export const getAIConversations = async (): Promise<AIConversation[]> => {
  const { data, error } = await supabase.from("ai_conversations").select("*").order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching AI conversations:", error)
    return []
  }

  return data || []
}

export const getAIConversation = async (
  id: string,
): Promise<{ conversation: AIConversation; messages: AIMessage[] } | null> => {
  const { data: conversation, error: convError } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("id", id)
    .single()

  if (convError) {
    console.error(`Error fetching AI conversation ${id}:`, convError)
    return null
  }

  const { data: messages, error: msgError } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })

  if (msgError) {
    console.error(`Error fetching AI messages for conversation ${id}:`, msgError)
    return null
  }

  return {
    conversation,
    messages: messages || [],
  }
}

export const createAIConversation = async (title: string, projectId?: string): Promise<AIConversation | null> => {
  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      title,
      project_id: projectId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating AI conversation:", error)
    return null
  }

  return data
}

export const addAIMessage = async (
  conversationId: string,
  message: Omit<AIMessage, "id" | "conversation_id" | "created_at">,
): Promise<AIMessage | null> => {
  const { data, error } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      ...message,
    })
    .select()
    .single()

  if (error) {
    console.error(`Error adding AI message to conversation ${conversationId}:`, error)
    return null
  }

  // Update the conversation's updated_at timestamp
  await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)

  return data
}

// User Settings
export const getUserSettings = async (): Promise<UserSettings | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

  if (error) {
    if (error.code === "PGRST116") {
      // No settings found, create default settings
      return createDefaultUserSettings()
    }
    console.error("Error fetching user settings:", error)
    return null
  }

  return data
}

export const createDefaultUserSettings = async (): Promise<UserSettings | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  const defaultSettings = {
    user_id: user.id,
    theme: "system",
    notifications_enabled: true,
    ai_provider: "auto",
    ai_config: {
      enableFallback: true,
    },
  }

  const { data, error } = await supabase.from("user_settings").insert(defaultSettings).select().single()

  if (error) {
    console.error("Error creating default user settings:", error)
    return null
  }

  return data
}

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("user_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating user settings:", error)
    return null
  }

  return data
}

// Automations
export const getAutomations = async (): Promise<Automation[]> => {
  const { data, error } = await supabase.from("automations").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching automations:", error)
    return []
  }

  return data || []
}

export const createAutomation = async (
  automation: Omit<Automation, "id" | "created_at" | "updated_at">,
): Promise<Automation | null> => {
  const { data, error } = await supabase.from("automations").insert(automation).select().single()

  if (error) {
    console.error("Error creating automation:", error)
    return null
  }

  return data
}

export const updateAutomation = async (id: string, automation: Partial<Automation>): Promise<Automation | null> => {
  const { data, error } = await supabase
    .from("automations")
    .update({
      ...automation,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating automation ${id}:`, error)
    return null
  }

  return data
}

export const deleteAutomation = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("automations").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting automation ${id}:`, error)
    return false
  }

  return true
}

// Productivity Stats
export const getUserProductivityStats = async (): Promise<any | null> => {
  const { data, error } = await supabase.from("user_productivity_stats").select("*").single()

  if (error) {
    console.error("Error fetching user productivity stats:", error)
    return null
  }

  return data
}

export const getWeeklyFocusTime = async (): Promise<any[]> => {
  const { data, error } = await supabase.from("weekly_focus_time").select("*").order("day", { ascending: true })

  if (error) {
    console.error("Error fetching weekly focus time:", error)
    return []
  }

  return data || []
}

export const getUpcomingDeadlines = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from("upcoming_deadlines")
    .select("*")
    .order("days_remaining", { ascending: true })
    .limit(5)

  if (error) {
    console.error("Error fetching upcoming deadlines:", error)
    return []
  }

  return data || []
}

export const getDailyTasks = async (): Promise<any[]> => {
  const { data, error } = await supabase.from("daily_tasks").select("*")

  if (error) {
    console.error("Error fetching daily tasks:", error)
    return []
  }

  return data || []
}
