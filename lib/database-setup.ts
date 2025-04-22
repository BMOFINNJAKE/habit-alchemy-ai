import { supabase } from "./supabase"

export async function setupDatabase() {
  // Create the time_blocks table if it doesn't exist
  const { error: timeBlocksError } = await supabase.rpc("create_time_blocks_table")
  if (timeBlocksError && !timeBlocksError.message.includes("already exists")) {
    console.error("Error creating time_blocks table:", timeBlocksError)
  }

  // Create the tasks table if it doesn't exist
  const { error: tasksError } = await supabase.rpc("create_tasks_table")
  if (tasksError && !tasksError.message.includes("already exists")) {
    console.error("Error creating tasks table:", tasksError)
  }
}

// Call this function when the app initializes
export async function initializeDatabase() {
  try {
    await setupDatabase()
    console.log("Database setup complete")
  } catch (error) {
    console.error("Database setup failed:", error)
  }
}
