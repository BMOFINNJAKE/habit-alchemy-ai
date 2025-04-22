"use client"

import { useState, useEffect } from "react"
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ChevronLeft, ChevronRight, Calendar, BarChart, CheckCircle2, Info, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import HabitForm from "./habit-form"
import HabitProgress from "./habit-progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Habit, HabitLog } from "@/types/habit"

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [view, setView] = useState<"calendar" | "progress">("calendar")
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  // Generate days for the selected month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  })

  // Load habits and logs from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // If not authenticated, try loading from localStorage
          const savedHabits = localStorage.getItem("habits")
          const savedLogs = localStorage.getItem("habit-logs")

          if (savedHabits) {
            try {
              setHabits(JSON.parse(savedHabits))
            } catch (e) {
              console.error("Error parsing saved habits:", e)
            }
          }

          if (savedLogs) {
            try {
              setHabitLogs(JSON.parse(savedLogs))
            } catch (e) {
              console.error("Error parsing saved logs:", e)
            }
          }

          return
        }

        // Fetch habits
        const { data: habitsData, error: habitsError } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (habitsError) throw habitsError

        // Fetch habit logs for the selected month
        const startDate = format(startOfMonth(selectedMonth), "yyyy-MM-dd")
        const endDate = format(endOfMonth(selectedMonth), "yyyy-MM-dd")

        const { data: logsData, error: logsError } = await supabase
          .from("habit_logs")
          .select("*")
          .gte("date", startDate)
          .lte("date", endDate)
          .eq("user_id", user.id)

        if (logsError) throw logsError

        setHabits(habitsData || [])
        setHabitLogs(logsData || [])

        // Save to localStorage for offline access
        localStorage.setItem("habits", JSON.stringify(habitsData || []))
        localStorage.setItem("habit-logs", JSON.stringify(logsData || []))
      } catch (error) {
        console.error("Error loading habits data:", error)
        toast({
          title: "Error loading habits",
          description: "We couldn't load your habits from the cloud. Using local data instead.",
          variant: "destructive",
        })

        // Try loading from localStorage as fallback
        const savedHabits = localStorage.getItem("habits")
        const savedLogs = localStorage.getItem("habit-logs")

        if (savedHabits) {
          try {
            setHabits(JSON.parse(savedHabits))
          } catch (e) {
            console.error("Error parsing saved habits:", e)
          }
        }

        if (savedLogs) {
          try {
            setHabitLogs(JSON.parse(savedLogs))
          } catch (e) {
            console.error("Error parsing saved logs:", e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedMonth, supabase, toast])

  // Add a new habit
  const handleAddHabit = async (habit: Omit<Habit, "id" | "user_id">) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Handle offline mode
        const newHabit = {
          ...habit,
          id: Math.random().toString(36).substring(2, 11),
          user_id: "local",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const updatedHabits = [newHabit, ...habits]
        setHabits(updatedHabits)
        localStorage.setItem("habits", JSON.stringify(updatedHabits))

        toast({
          title: "Habit created locally",
          description: "Your habit was saved locally. Sign in to sync across devices.",
        })
        return
      }

      const { data, error } = await supabase
        .from("habits")
        .insert({
          ...habit,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      const updatedHabits = [data, ...habits]
      setHabits(updatedHabits)
      localStorage.setItem("habits", JSON.stringify(updatedHabits))

      toast({
        title: "Habit created",
        description: "Your new habit has been added to your tracker.",
      })
    } catch (error) {
      console.error("Error adding habit:", error)
      toast({
        title: "Error creating habit",
        description: "Your habit was saved locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })

      // Add to local state anyway
      const newHabit = {
        ...habit,
        id: Math.random().toString(36).substring(2, 11),
        user_id: "local",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const updatedHabits = [newHabit, ...habits]
      setHabits(updatedHabits)
      localStorage.setItem("habits", JSON.stringify(updatedHabits))
    }
  }

  // Update an existing habit
  const handleUpdateHabit = async (updatedHabit: Habit) => {
    try {
      // If this is a local habit (no Supabase connection)
      if (updatedHabit.user_id === "local") {
        const updatedHabits = habits.map((habit) =>
          habit.id === updatedHabit.id ? { ...updatedHabit, updated_at: new Date().toISOString() } : habit,
        )
        setHabits(updatedHabits)
        localStorage.setItem("habits", JSON.stringify(updatedHabits))

        toast({
          title: "Habit updated locally",
          description: "Your habit has been updated in local storage.",
        })
        return
      }

      const { error } = await supabase
        .from("habits")
        .update({
          name: updatedHabit.name,
          description: updatedHabit.description,
          frequency: updatedHabit.frequency,
          frequency_config: updatedHabit.frequency_config,
          color: updatedHabit.color,
          icon: updatedHabit.icon,
          target: updatedHabit.target,
          start_date: updatedHabit.start_date,
          end_date: updatedHabit.end_date,
          ai_suggestions: updatedHabit.ai_suggestions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedHabit.id)

      if (error) throw error

      const updatedHabits = habits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit))
      setHabits(updatedHabits)
      localStorage.setItem("habits", JSON.stringify(updatedHabits))

      toast({
        title: "Habit updated",
        description: "Your habit has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating habit:", error)
      toast({
        title: "Error updating habit",
        description: "Your changes were saved locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })

      // Update local state anyway
      const updatedHabits = habits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit))
      setHabits(updatedHabits)
      localStorage.setItem("habits", JSON.stringify(updatedHabits))
    }
  }

  // Delete a habit
  const handleDeleteHabit = async (id: string) => {
    try {
      // Check if this is a local habit
      const habitToDelete = habits.find((h) => h.id === id)
      if (!habitToDelete || habitToDelete.user_id === "local") {
        const updatedHabits = habits.filter((habit) => habit.id !== id)
        setHabits(updatedHabits)
        localStorage.setItem("habits", JSON.stringify(updatedHabits))

        toast({
          title: "Habit deleted locally",
          description: "Your habit has been removed from local storage.",
        })
        return
      }

      const { error } = await supabase.from("habits").delete().eq("id", id)

      if (error) throw error

      const updatedHabits = habits.filter((habit) => habit.id !== id)
      setHabits(updatedHabits)
      localStorage.setItem("habits", JSON.stringify(updatedHabits))

      toast({
        title: "Habit deleted",
        description: "Your habit has been removed from your tracker.",
      })
    } catch (error) {
      console.error("Error deleting habit:", error)
      toast({
        title: "Error deleting habit",
        description: "The habit was removed locally but we couldn't sync this change to the cloud.",
        variant: "destructive",
      })

      // Remove from local state anyway
      const updatedHabits = habits.filter((habit) => habit.id !== id)
      setHabits(updatedHabits)
      localStorage.setItem("habits", JSON.stringify(updatedHabits))
    }
  }

  // Toggle habit completion for a specific date
  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")

    // Check if there's already a log for this habit and date
    const existingLog = habitLogs.find((log) => log.habit_id === habitId && log.date === dateString)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Handle offline mode
      if (!user) {
        if (existingLog) {
          // Remove the log locally
          const updatedLogs = habitLogs.filter((log) => !(log.habit_id === habitId && log.date === dateString))
          setHabitLogs(updatedLogs)
          localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
        } else {
          // Add a new log locally
          const newLog = {
            id: Math.random().toString(36).substring(2, 11),
            habit_id: habitId,
            date: dateString,
            user_id: "local",
            value: 1,
            created_at: new Date().toISOString(),
          }
          const updatedLogs = [...habitLogs, newLog]
          setHabitLogs(updatedLogs)
          localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
        }
        return
      }

      if (existingLog) {
        // Delete the log to mark as incomplete
        const { error } = await supabase.from("habit_logs").delete().eq("id", existingLog.id)

        if (error) throw error

        // Update local state
        const updatedLogs = habitLogs.filter((log) => log.id !== existingLog.id)
        setHabitLogs(updatedLogs)
        localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
      } else {
        // Create a new log to mark as complete
        const { data, error } = await supabase
          .from("habit_logs")
          .insert({
            habit_id: habitId,
            date: dateString,
            user_id: user.id,
            value: 1, // Default completion value
          })
          .select()
          .single()

        if (error) throw error

        // Update local state
        const updatedLogs = [...habitLogs, data]
        setHabitLogs(updatedLogs)
        localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
      }
    } catch (error) {
      console.error("Error toggling habit completion:", error)
      toast({
        title: "Sync error",
        description: "Your change was saved locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })

      // Update local state anyway for immediate feedback
      if (existingLog) {
        const updatedLogs = habitLogs.filter((log) => log.id !== existingLog.id)
        setHabitLogs(updatedLogs)
        localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
      } else {
        const newLog = {
          id: Math.random().toString(36).substring(2, 11),
          habit_id: habitId,
          date: dateString,
          user_id: "local",
          value: 1,
          created_at: new Date().toISOString(),
        }
        const updatedLogs = [...habitLogs, newLog]
        setHabitLogs(updatedLogs)
        localStorage.setItem("habit-logs", JSON.stringify(updatedLogs))
      }
    }
  }

  // Check if a habit is completed for a specific date
  const isHabitCompleted = (habitId: string, date: Date): boolean => {
    const dateString = format(date, "yyyy-MM-dd")
    return habitLogs.some((log) => log.habit_id === habitId && log.date === dateString)
  }

  // Get the streak for a habit
  const getHabitStreak = (habitId: string): number => {
    // Sort logs by date and filter for this habit
    const sortedLogs = habitLogs
      .filter((log) => log.habit_id === habitId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Count consecutive days
    let streak = 0
    const currentDate = new Date()

    while (true) {
      const dateString = format(currentDate, "yyyy-MM-dd")
      const completed = sortedLogs.some((log) => log.date === dateString)

      if (completed) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  // Navigation functions
  const goToPreviousMonth = () => setSelectedMonth(subMonths(selectedMonth, 1))
  const goToNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1))
  const goToCurrentMonth = () => setSelectedMonth(new Date())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold">Track Your Habits</h3>
          <p className="text-sm text-muted-foreground">Build consistency and track your progress over time</p>
        </div>

        <div className="flex gap-3">
          <Select value={view} onValueChange={(value) => setView(value as "calendar" | "progress")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue>{view === "calendar" ? "Calendar View" : "Progress View"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Calendar View</span>
              </SelectItem>
              <SelectItem value="progress" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span>Progress View</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Habit
          </Button>
        </div>
      </div>

      {view === "calendar" ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h3 className="text-xl font-bold">{format(selectedMonth, "MMMM yyyy")}</h3>

            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No habits yet</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Start building better habits by adding your first habit to track.
              </p>
              <Button onClick={() => setFormOpen(true)} className="mt-4">
                Add Your First Habit
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium text-sm sticky left-0 bg-muted/50 z-10">Habit</th>
                    {daysInMonth.map((day) => (
                      <th
                        key={day.toISOString()}
                        className={`py-3 px-1 text-center font-medium text-sm w-10 ${
                          isSameDay(day, new Date()) ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">{format(day, "EEE")}</span>
                          <span>{format(day, "d")}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => (
                    <tr key={habit.id} className="border-t hover:bg-muted/30">
                      <td className="py-3 px-4 sticky left-0 bg-background z-10 w-60">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: habit.color || "#3b82f6" }}
                          ></div>
                          <span className="font-medium truncate">{habit.name}</span>
                          {habit.frequency === "daily" ? (
                            <span className="text-xs text-muted-foreground ml-1">Daily</span>
                          ) : habit.frequency === "weekly" ? (
                            <span className="text-xs text-muted-foreground ml-1">Weekly</span>
                          ) : (
                            <span className="text-xs text-muted-foreground ml-1">Monthly</span>
                          )}

                          {habit.ai_suggestions && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help">
                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">AI-enhanced habit</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 ml-5">
                          <span>Streak: {getHabitStreak(habit.id)} days</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full"
                            onClick={() => setEditingHabit(habit)}
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      {daysInMonth.map((day) => {
                        const isCompleted = isHabitCompleted(habit.id, day)

                        // Check if the date is eligible for this habit based on frequency
                        let isEligible = true
                        const dayOfWeek = format(day, "EEEE").toLowerCase()

                        if (habit.frequency === "weekly" && habit.frequency_config) {
                          // Check if this day of week is included in frequency config
                          isEligible = habit.frequency_config.days?.includes(dayOfWeek)
                        } else if (habit.frequency === "monthly" && habit.frequency_config) {
                          // Check if this day of month is included in frequency config
                          const dayOfMonth = day.getDate()
                          isEligible = habit.frequency_config.days?.includes(dayOfMonth)
                        }

                        // Also check if the date is in the habit's active period
                        const isInActivePeriod =
                          (!habit.start_date || new Date(habit.start_date) <= day) &&
                          (!habit.end_date || new Date(habit.end_date) >= day)

                        const isDisabled = !isEligible || !isInActivePeriod || !isSameMonth(day, selectedMonth)

                        return (
                          <td
                            key={day.toISOString()}
                            className={`px-1 text-center align-middle ${isDisabled ? "opacity-30" : "cursor-pointer"} ${
                              isSameDay(day, new Date()) ? "bg-primary/5" : ""
                            }`}
                            onClick={() => {
                              if (!isDisabled) {
                                toggleHabitCompletion(habit.id, day)
                              }
                            }}
                          >
                            <div className="flex justify-center">
                              {isCompleted ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                              ) : isDisabled ? (
                                <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted"></div>
                              ) : (
                                <div className="h-6 w-6 rounded-full border-2 border-muted hover:border-primary"></div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <HabitProgress
          habits={habits}
          habitLogs={habitLogs}
          selectedMonth={selectedMonth}
          onPrevMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onCurrentMonth={goToCurrentMonth}
          onEditHabit={setEditingHabit}
          onDeleteHabit={handleDeleteHabit}
        />
      )}

      {/* Habit Form Dialog */}
      <HabitForm
        open={formOpen || !!editingHabit}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            setEditingHabit(null)
          }
        }}
        onSubmit={editingHabit ? handleUpdateHabit : handleAddHabit}
        onDelete={editingHabit ? () => handleDeleteHabit(editingHabit.id) : undefined}
        habit={editingHabit}
      />
    </div>
  )
}
