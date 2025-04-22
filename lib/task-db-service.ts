import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

export interface TaskDB {
  id: string
  title: string
  description?: string
  completed: boolean
  project_id?: string
  due_date?: string
  priority?: "low" | "medium" | "high" | "urgent"
  created_at?: string
  updated_at?: string
  user_id?: string
}

// Get all tasks for a user
export async function getTasksFromDB(userId: string): Promise<TaskDB[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Error fetching tasks:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
}

// Get tasks for a specific project
export async function getTasksByProjectId(userId: string, projectId: string): Promise<TaskDB[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Error fetching tasks by project:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching tasks by project:", error)
    return []
  }
}

// Add a new task
export async function addTaskToDB(task: Omit<TaskDB, "id" | "created_at" | "updated_at">): Promise<TaskDB | null> {
  try {
    const newTask = {
      ...task,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("tasks").insert([newTask]).select().single()

    if (error) {
      console.error("Error adding task:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error adding task:", error)
    return null
  }
}

// Update an existing task
export async function updateTaskInDB(id: string, task: Partial<TaskDB>): Promise<TaskDB | null> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...task,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating task:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error updating task:", error)
    return null
  }
}

// Toggle task completion
export async function toggleTaskCompletionInDB(id: string): Promise<TaskDB | null> {
  try {
    // First get the current task
    const { data: task, error: fetchError } = await supabase.from("tasks").select("*").eq("id", id).single()

    if (fetchError) {
      console.error("Error fetching task:", fetchError)
      return null
    }

    // Then toggle the completed status
    const { data, error } = await supabase
      .from("tasks")
      .update({
        completed: !task.completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error toggling task completion:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error toggling task completion:", error)
    return null
  }
}

// Delete a task
export async function deleteTaskFromDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) {
      console.error("Error deleting task:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting task:", error)
    return false
  }
}
