import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a Supabase client for use in components
export const createClientComponent = () => {
  return createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        // Add fetch options for better network handling
        fetch: (url, options) => {
          const controller = new AbortController()
          const { signal } = controller

          // Set a timeout for fetch requests
          const timeoutId = setTimeout(() => controller.abort(), 30000)

          return fetch(url, {
            ...options,
            signal,
            // Add retry logic for network issues
            headers: {
              ...options?.headers,
              "Cache-Control": "no-cache",
            },
          })
            .then((response) => {
              clearTimeout(timeoutId)
              return response
            })
            .catch((error) => {
              clearTimeout(timeoutId)
              // Improve error handling for network issues
              if (error.name === "AbortError") {
                console.error("Request timed out")
                throw new Error("Request timed out. Please check your connection and try again.")
              }
              if (!navigator.onLine) {
                console.error("Network offline")
                throw new Error("You appear to be offline. Please check your connection and try again.")
              }
              throw error
            })
        },
      },
    },
  })
}

import { createClient } from "@supabase/supabase-js"

// Define fallback values for Supabase URL and key
// These are used when environment variables are not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iomcrexljskwxxjwyoet.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbWNyZXhsanNrd3h4and5b2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNTkwMDQsImV4cCI6MjA2MDYzNTAwNH0.gdlK_5cWMFNsJbJsR8Iq-SbI2haqJz3vHPZQ33CUvJ4"

// Create Supabase client with additional options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  // Add global error handler
  global: {
    fetch: (...args) => {
      return fetch(...args).catch((err) => {
        console.error("Supabase fetch error:", err)
        // Re-throw with more descriptive message for "Failed to fetch" errors
        if (err.message === "Failed to fetch") {
          throw new Error("Network error: Unable to connect to Supabase. Please check your internet connection.")
        }
        throw err
      })
    },
  },
})

// Helper function to check if Supabase is reachable
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple health check by fetching session (lightweight operation)
    await supabase.auth.getSession()
    return true
  } catch (error) {
    console.error("Supabase connection check failed:", error)
    return false
  }
}

export default supabase
