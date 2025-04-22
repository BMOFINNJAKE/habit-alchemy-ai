"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"
import {
  saveToIndexedDB,
  getAllFromIndexedDB,
  isOnline,
  registerBackgroundSync,
  addPendingSync,
} from "@/lib/offline-storage"

export interface Session {
  id: string
  projectId: string
  projectTitle: string
  startTime: number
  endTime?: number
  elapsedTime: number
  isRunning: boolean
  userId?: string
}

interface SessionState {
  sessions: Session[]
  activeSession: {
    id: string | null
    projectId: string
    projectTitle: string
    startTime: number
    elapsedTime: number
    isRunning: boolean
  }
  isLoading: boolean
  error: string | null
  userId: string | null
  setUserId: (userId: string | null) => void
  syncWithSupabase: () => Promise<void>
  startSession: (projectId: string, projectTitle: string) => void
  pauseSession: () => void
  resumeSession: () => void
  endSession: () => void
  getTodayTotalTime: () => number
  getWeekTotalTime: () => number
  getMonthTotalTime: () => number
  getYearTotalTime: () => number
  getProjectTotalTime: (projectId: string) => number
  getFormattedProjectTime: (projectId: string) => string
  getActiveSession: () => {
    projectId: string
    projectTitle: string
    startTime: number
    elapsedTime: number
    isRunning: boolean
  } | null
  resetAllData: () => void
  updateDailyFocusStats: (userId: string, date: string, focusTimeMs: number) => Promise<void>
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSession: {
        id: null,
        projectId: "",
        projectTitle: "",
        startTime: 0,
        elapsedTime: 0,
        isRunning: false,
      },
      isLoading: false,
      error: null,
      userId: null,

      setUserId: (userId) => {
        set({ userId })
        if (userId) {
          get().syncWithSupabase()
        }
      },

      syncWithSupabase: async () => {
        const { userId } = get()
        if (!userId) return

        set({ isLoading: true, error: null })

        try {
          // Only sync if online
          if (isOnline()) {
            // Fetch sessions from Supabase
            const { data: sessionsData, error: sessionsError } = await supabase
              .from("sessions")
              .select("*")
              .eq("user_id", userId)
              .catch((err) => {
                console.error("Error fetching sessions:", err)
                return { data: null, error: err }
              })

            if (sessionsError) {
              if (sessionsError.message.includes("does not exist")) {
                // Table doesn't exist, we'll create it
                console.warn("Sessions table doesn't exist in Supabase, creating it")

                // Create the sessions table
                const { error: createTableError } = await supabase.rpc("create_sessions_table")

                if (createTableError) {
                  console.error("Error creating sessions table:", createTableError)
                  throw createTableError
                }
              } else {
                throw new Error(`Error syncing with Supabase: ${sessionsError.message}`)
              }
            }

            // Update local state with remote data if available
            if (sessionsData) {
              set({
                sessions: sessionsData,
              })
            }
          } else {
            // If offline, load from IndexedDB
            const sessions = await getAllFromIndexedDB("sessions", "userId", userId)

            set({
              sessions: sessions || [],
            })
          }
        } catch (error) {
          console.error("Sync error:", error)
          set({ error: (error as Error).message })

          // If there's an error, try to load from IndexedDB as fallback
          try {
            const sessions = await getAllFromIndexedDB("sessions", "userId", userId)

            set({
              sessions: sessions || [],
            })
          } catch (dbError) {
            console.error("IndexedDB fallback error:", dbError)
          }
        } finally {
          set({ isLoading: false })
        }
      },

      startSession: (projectId, projectTitle) => {
        const { userId, activeSession } = get()

        // End any active session first
        if (activeSession.projectId) {
          get().endSession()
        }

        const now = Date.now()
        const id = Math.random().toString(36).substring(2, 9)

        const newSession: Session = {
          id,
          projectId,
          projectTitle,
          startTime: now,
          elapsedTime: 0,
          isRunning: true,
          userId: userId || undefined,
        }

        set((state) => ({
          sessions: [...state.sessions, newSession],
          activeSession: {
            id,
            projectId,
            projectTitle,
            startTime: now,
            elapsedTime: 0,
            isRunning: true,
          },
        }))

        // Save to IndexedDB
        saveToIndexedDB("sessions", newSession).catch(console.error)

        // Save to Supabase if online
        if (userId && isOnline()) {
          supabase
            .from("sessions")
            .insert({
              id,
              project_id: projectId,
              project_title: projectTitle,
              start_time: now,
              elapsed_time: 0,
              is_running: true,
              user_id: userId,
            })
            .then(({ error }) => {
              if (error) {
                console.error("Error saving session to Supabase:", error)
              }
            })
            .catch((err) => {
              console.error("Error in Supabase insert:", err)
            })
        } else if (userId) {
          // Queue for background sync
          addPendingSync({
            url: `${window.location.origin}/api/sessions`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSession),
          }).then(() => {
            registerBackgroundSync()
          })
        }
      },

      pauseSession: () => {
        const { activeSession, userId } = get()
        if (!activeSession.projectId || !activeSession.isRunning) return

        const now = Date.now()
        const elapsedTime = activeSession.elapsedTime + (now - activeSession.startTime)

        // Find the session to update
        const sessionId = activeSession.id
        if (!sessionId) return

        set((state) => {
          // Find the active session in the sessions array
          const updatedSessions = state.sessions.map((session) => {
            if (session.id === sessionId) {
              return {
                ...session,
                elapsedTime,
                isRunning: false,
              }
            }
            return session
          })

          return {
            sessions: updatedSessions,
            activeSession: {
              ...activeSession,
              elapsedTime,
              isRunning: false,
            },
          }
        })

        // Save to Supabase if online
        if (userId && isOnline()) {
          supabase
            .from("sessions")
            .update({
              elapsed_time: elapsedTime,
              is_running: false,
            })
            .eq("id", sessionId)
            .then(({ error }) => {
              if (error) {
                console.error("Error updating session in Supabase:", error)
              }
            })
            .catch((err) => {
              console.error("Error in Supabase update:", err)
            })
        } else if (userId) {
          // Queue for background sync
          addPendingSync({
            url: `${window.location.origin}/api/sessions/${sessionId}`,
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elapsed_time: elapsedTime, is_running: false }),
          }).then(() => {
            registerBackgroundSync()
          })
        }
      },

      resumeSession: () => {
        const { activeSession, userId } = get()
        if (!activeSession.projectId || activeSession.isRunning) return

        const now = Date.now()
        const sessionId = activeSession.id
        if (!sessionId) return

        set((state) => {
          // Find the active session in the sessions array
          const updatedSessions = state.sessions.map((session) => {
            if (session.id === sessionId) {
              return {
                ...session,
                startTime: now,
                isRunning: true,
              }
            }
            return session
          })

          return {
            sessions: updatedSessions,
            activeSession: {
              ...activeSession,
              startTime: now,
              isRunning: true,
            },
          }
        })

        // Save to Supabase if online
        if (userId && isOnline()) {
          supabase
            .from("sessions")
            .update({
              start_time: now,
              is_running: true,
            })
            .eq("id", sessionId)
            .then(({ error }) => {
              if (error) {
                console.error("Error updating session in Supabase:", error)
              }
            })
            .catch((err) => {
              console.error("Error in Supabase update:", err)
            })
        } else if (userId) {
          // Queue for background sync
          addPendingSync({
            url: `${window.location.origin}/api/sessions/${sessionId}`,
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_time: now, is_running: true }),
          }).then(() => {
            registerBackgroundSync()
          })
        }
      },

      endSession: () => {
        const { activeSession, userId } = get()
        if (!activeSession.projectId) return

        const now = Date.now()
        let finalElapsedTime = activeSession.elapsedTime

        if (activeSession.isRunning) {
          finalElapsedTime += now - activeSession.startTime
        }

        const sessionId = activeSession.id
        if (!sessionId) return

        set((state) => {
          // Find the active session in the sessions array
          const updatedSessions = state.sessions.map((session) => {
            if (session.id === sessionId) {
              return {
                ...session,
                endTime: now,
                elapsedTime: finalElapsedTime,
                isRunning: false,
              }
            }
            return session
          })

          return {
            sessions: updatedSessions,
            activeSession: {
              id: null,
              projectId: "",
              projectTitle: "",
              startTime: 0,
              elapsedTime: 0,
              isRunning: false,
            },
          }
        })

        // Save to Supabase if online
        if (userId && isOnline()) {
          supabase
            .from("sessions")
            .update({
              end_time: now,
              elapsed_time: finalElapsedTime,
              is_running: false,
            })
            .eq("id", sessionId)
            .then(({ error }) => {
              if (error) {
                console.error("Error updating session in Supabase:", error)
              } else {
                // Update daily focus stats
                const today = new Date().toISOString().split("T")[0]
                get().updateDailyFocusStats(userId, today, finalElapsedTime)
              }
            })
            .catch((err) => {
              console.error("Error in Supabase update:", err)
            })
        } else if (userId) {
          // Queue for background sync
          addPendingSync({
            url: `${window.location.origin}/api/sessions/${sessionId}`,
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ end_time: now, elapsed_time: finalElapsedTime, is_running: false }),
          }).then(() => {
            registerBackgroundSync()
          })
        }
      },

      updateDailyFocusStats: async (userId, date, focusTimeMs) => {
        if (!userId || !isOnline()) return

        try {
          // Check if a record exists for this date
          const { data, error } = await supabase
            .from("daily_focus_stats")
            .select("*")
            .eq("user_id", userId)
            .eq("date", date)
            .single()

          if (error && error.code !== "PGRST116") {
            // PGRST116 means no rows returned
            console.error("Error checking daily focus stats:", error)
            return
          }

          if (data) {
            // Update existing record
            await supabase
              .from("daily_focus_stats")
              .update({
                focus_time_ms: data.focus_time_ms + focusTimeMs,
                updated_at: new Date().toISOString(),
              })
              .eq("id", data.id)
          } else {
            // Insert new record
            await supabase.from("daily_focus_stats").insert({
              user_id: userId,
              date: date,
              focus_time_ms: focusTimeMs,
            })
          }
        } catch (error) {
          console.error("Error updating daily focus stats:", error)
        }
      },

      getActiveSession: () => {
        const { activeSession } = get()
        if (!activeSession.projectId) return null
        return activeSession
      },

      getTodayTotalTime: () => {
        const { sessions, activeSession } = get()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTimestamp = today.getTime()

        // Calculate time from completed sessions today
        const completedSessionsTime = sessions.reduce((total, session) => {
          // Only count sessions that started today
          if (session.startTime >= todayTimestamp) {
            return total + session.elapsedTime
          }
          return total
        }, 0)

        // Add time from active session if it's running and started today
        let activeSessionTime = 0
        if (activeSession.isRunning && activeSession.startTime >= todayTimestamp) {
          activeSessionTime = Date.now() - activeSession.startTime
        } else if (!activeSession.isRunning && activeSession.startTime >= todayTimestamp) {
          activeSessionTime = 0 // Don't double count - the active session is already in the sessions array
        }

        return completedSessionsTime + activeSessionTime
      },

      getWeekTotalTime: () => {
        const { sessions, activeSession } = get()
        const today = new Date()
        const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - dayOfWeek) // Set to Sunday
        startOfWeek.setHours(0, 0, 0, 0)
        const startOfWeekTimestamp = startOfWeek.getTime()

        // Calculate time from completed sessions this week
        const completedSessionsTime = sessions.reduce((total, session) => {
          // Only count sessions that started this week
          if (session.startTime >= startOfWeekTimestamp) {
            return total + session.elapsedTime
          }
          return total
        }, 0)

        // Add time from active session if it's running and started this week
        let activeSessionTime = 0
        if (activeSession.isRunning && activeSession.startTime >= startOfWeekTimestamp) {
          activeSessionTime = Date.now() - activeSession.startTime
        } else if (!activeSession.isRunning && activeSession.startTime >= startOfWeekTimestamp) {
          activeSessionTime = 0 // Don't double count
        }

        return completedSessionsTime + activeSessionTime
      },

      getMonthTotalTime: () => {
        const { sessions, activeSession } = get()
        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        startOfMonth.setHours(0, 0, 0, 0)
        const startOfMonthTimestamp = startOfMonth.getTime()

        // Calculate time from completed sessions this month
        const completedSessionsTime = sessions.reduce((total, session) => {
          // Only count sessions that started this month
          if (session.startTime >= startOfMonthTimestamp) {
            return total + session.elapsedTime
          }
          return total
        }, 0)

        // Add time from active session if it's running and started this month
        let activeSessionTime = 0
        if (activeSession.isRunning && activeSession.startTime >= startOfMonthTimestamp) {
          activeSessionTime = Date.now() - activeSession.startTime
        } else if (!activeSession.isRunning && activeSession.startTime >= startOfMonthTimestamp) {
          activeSessionTime = 0 // Don't double count
        }

        return completedSessionsTime + activeSessionTime
      },

      getYearTotalTime: () => {
        const { sessions, activeSession } = get()
        const today = new Date()
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        startOfYear.setHours(0, 0, 0, 0)
        const startOfYearTimestamp = startOfYear.getTime()

        // Calculate time from completed sessions this year
        const completedSessionsTime = sessions.reduce((total, session) => {
          // Only count sessions that started this year
          if (session.startTime >= startOfYearTimestamp) {
            return total + session.elapsedTime
          }
          return total
        }, 0)

        // Add time from active session if it's running and started this year
        let activeSessionTime = 0
        if (activeSession.isRunning && activeSession.startTime >= startOfYearTimestamp) {
          activeSessionTime = Date.now() - activeSession.startTime
        } else if (!activeSession.isRunning && activeSession.startTime >= startOfYearTimestamp) {
          activeSessionTime = 0 // Don't double count
        }

        return completedSessionsTime + activeSessionTime
      },

      getProjectTotalTime: (projectId) => {
        const { sessions, activeSession } = get()

        // Calculate time from completed sessions for this project
        const completedSessionsTime = sessions.reduce((total, session) => {
          if (session.projectId === projectId) {
            return total + session.elapsedTime
          }
          return total
        }, 0)

        // Add time from active session if it's for this project and running
        let activeSessionTime = 0
        if (activeSession.projectId === projectId && activeSession.isRunning) {
          activeSessionTime = Date.now() - activeSession.startTime
        }

        return completedSessionsTime + activeSessionTime
      },

      getFormattedProjectTime: (projectId) => {
        const totalTime = get().getProjectTotalTime(projectId)
        const hours = Math.floor(totalTime / (1000 * 60 * 60))
        const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((totalTime % (1000 * 60)) / 1000)
        return `${hours}h ${minutes}m ${seconds}s`
      },

      resetAllData: () => {
        set({
          sessions: [],
          activeSession: {
            id: null,
            projectId: "",
            projectTitle: "",
            startTime: 0,
            elapsedTime: 0,
            isRunning: false,
          },
        })
      },
    }),
    {
      name: "session-storage",
    },
  ),
)
