import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "./supabase" // Import the existing supabase client

export interface TimeBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  color?: string
  category?: string
  created_at?: string
  updated_at?: string
}

interface TimeBlockStore {
  blocks: TimeBlock[]
  addBlock: (block: TimeBlock) => void
  removeBlock: (id: string) => void
  updateBlock: (block: TimeBlock) => void
  loadBlocks: () => Promise<void>
}

export const useTimeBlockStore = create<TimeBlockStore>()(
  persist(
    (set) => ({
      blocks: [],
      addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
      removeBlock: (id) => set((state) => ({ blocks: state.blocks.filter((block) => block.id !== id) })),
      updateBlock: (updatedBlock) =>
        set((state) => ({
          blocks: state.blocks.map((block) => (block.id === updatedBlock.id ? updatedBlock : block)),
        })),
      loadBlocks: async () => {
        try {
          const { data, error } = await supabase
            .from("time_blocks")
            .select("*")
            .order("date", { ascending: true })
            .order("start_time", { ascending: true })

          if (error) {
            console.error("Error fetching time blocks:", error)
            return
          }

          // Convert from DB format to our format
          const blocks = data.map((block: any) => ({
            id: block.id,
            title: block.title,
            startTime: block.start_time,
            endTime: block.end_time,
            date: block.date,
            color: block.color || "#3b82f6",
            category: block.category,
          }))

          set({ blocks })
        } catch (error) {
          console.error("Error loading time blocks:", error)
        }
      },
    }),
    {
      name: "time-blocks-storage",
    },
  ),
)

// Function to fetch time blocks from Supabase
export async function fetchTimeBlocks(): Promise<TimeBlock[]> {
  try {
    const { data, error } = await supabase
      .from("time_blocks")
      .select("*")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching time blocks:", error)
      return []
    }

    // Convert from DB format to our format
    return data.map((block: any) => ({
      id: block.id,
      title: block.title,
      startTime: block.start_time,
      endTime: block.end_time,
      date: block.date,
      color: block.color || "#3b82f6",
      category: block.category,
    }))
  } catch (error) {
    console.error("Error fetching time blocks:", error)
    return []
  }
}

// Function to add a time block to Supabase
export async function addTimeBlock(block: TimeBlock): Promise<TimeBlock | null> {
  try {
    // Convert to DB format
    const dbBlock = {
      id: block.id,
      title: block.title,
      start_time: block.startTime,
      end_time: block.endTime,
      date: block.date,
      color: block.color,
      category: block.category,
    }

    const { data, error } = await supabase.from("time_blocks").insert([dbBlock]).select().single()

    if (error) {
      console.error("Error adding time block:", error)
      return null
    }

    // Convert back to our format
    return {
      id: data.id,
      title: data.title,
      startTime: data.start_time,
      endTime: data.end_time,
      date: data.date,
      color: data.color,
      category: data.category,
    }
  } catch (error) {
    console.error("Error adding time block:", error)
    return null
  }
}

// Function to remove a time block from Supabase
export async function removeTimeBlock(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("time_blocks").delete().eq("id", id)

    if (error) {
      console.error("Error removing time block:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error removing time block:", error)
    return false
  }
}

// Function to update a time block in Supabase
export async function updateTimeBlock(block: TimeBlock): Promise<TimeBlock | null> {
  try {
    // Convert to DB format
    const dbBlock = {
      title: block.title,
      start_time: block.startTime,
      end_time: block.endTime,
      date: block.date,
      color: block.color,
      category: block.category,
    }

    const { data, error } = await supabase.from("time_blocks").update(dbBlock).eq("id", block.id).select().single()

    if (error) {
      console.error("Error updating time block:", error)
      return null
    }

    // Convert back to our format
    return {
      id: data.id,
      title: data.title,
      startTime: data.start_time,
      endTime: data.end_time,
      date: data.date,
      color: data.color,
      category: data.category,
    }
  } catch (error) {
    console.error("Error updating time block:", error)
    return null
  }
}
