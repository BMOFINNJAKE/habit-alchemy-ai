import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

export interface TimeBlockDB {
  id: string
  user_id: string
  title: string
  start_time: string
  end_time: string
  date: string
  category: string
  created_at?: string
  updated_at?: string
}

// Get all time blocks for a user
export async function getTimeBlocksFromDB(userId: string): Promise<TimeBlockDB[]> {
  try {
    const { data, error } = await supabase
      .from("time_blocks")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching time blocks:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching time blocks:", error)
    return []
  }
}

// Get time blocks for a specific date range
export async function getTimeBlocksInRange(userId: string, startDate: string, endDate: string): Promise<TimeBlockDB[]> {
  try {
    const { data, error } = await supabase
      .from("time_blocks")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching time blocks in range:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching time blocks in range:", error)
    return []
  }
}

// Add a new time block
export async function addTimeBlockToDB(
  block: Omit<TimeBlockDB, "id" | "created_at" | "updated_at">,
): Promise<TimeBlockDB | null> {
  try {
    const newBlock = {
      ...block,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("time_blocks").insert([newBlock]).select().single()

    if (error) {
      console.error("Error adding time block:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error adding time block:", error)
    return null
  }
}

// Update an existing time block
export async function updateTimeBlockInDB(id: string, block: Partial<TimeBlockDB>): Promise<TimeBlockDB | null> {
  try {
    const { data, error } = await supabase
      .from("time_blocks")
      .update({
        ...block,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating time block:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error updating time block:", error)
    return null
  }
}

// Delete a time block
export async function deleteTimeBlockFromDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("time_blocks").delete().eq("id", id)

    if (error) {
      console.error("Error deleting time block:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting time block:", error)
    return false
  }
}
