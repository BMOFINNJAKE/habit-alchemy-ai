import { supabase } from "./supabase"

export async function runDatabaseMigrations() {
  console.log("Running database migrations...")

  try {
    // Create time_blocks table if it doesn't exist
    const { error: timeBlocksError } = await supabase.from("time_blocks").select("id").limit(1)

    if (timeBlocksError && timeBlocksError.code === "42P01") {
      // Table doesn't exist, create it
      const { error } = await supabase.rpc("create_time_blocks_table")
      if (error) {
        console.error("Error creating time_blocks table:", error)
      } else {
        console.log("Created time_blocks table")
      }
    }

    // Create daily_tasks table if it doesn't exist
    const { error: dailyTasksError } = await supabase.from("daily_tasks").select("id").limit(1)

    if (dailyTasksError && dailyTasksError.code === "42P01") {
      // Table doesn't exist, create it
      const { error } = await supabase.rpc("create_daily_tasks_table")
      if (error) {
        console.error("Error creating daily_tasks table:", error)
      } else {
        console.log("Created daily_tasks table")
      }
    }

    console.log("Database migrations completed successfully")
    return true
  } catch (error) {
    console.error("Error running database migrations:", error)
    return false
  }
}
