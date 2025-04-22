"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, MoreHorizontal, Edit2, Trash2, Award, Flame } from "lucide-react"
import type { Habit, HabitLog } from "@/types/habit"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HabitProgressProps {
  habits: Habit[]
  habitLogs: HabitLog[]
  selectedMonth: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onCurrentMonth: () => void
  onEditHabit: (habit: Habit) => void
  onDeleteHabit: (id: string) => void
}

export default function HabitProgress({
  habits,
  habitLogs,
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  onEditHabit,
  onDeleteHabit,
}: HabitProgressProps) {
  // Calculate days in the selected month
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth),
    })
  }, [selectedMonth])

  // Calculate completion rate for each habit
  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      // Filter logs for this habit and month
      const logs = habitLogs.filter(
        (log) => log.habit_id === habit.id && isSameMonth(new Date(log.date), selectedMonth),
      )

      // Calculate eligible days based on frequency
      let eligibleDays = daysInMonth

      if (habit.frequency === "weekly" && habit.frequency_config?.days) {
        eligibleDays = daysInMonth.filter((day) => {
          const dayOfWeek = format(day, "EEEE").toLowerCase()
          return habit.frequency_config?.days.includes(dayOfWeek)
        })
      } else if (habit.frequency === "monthly" && habit.frequency_config?.days) {
        eligibleDays = daysInMonth.filter((day) => {
          const dayOfMonth = day.getDate()
          return habit.frequency_config?.days.includes(dayOfMonth)
        })
      }

      // Also filter by habit's active period
      if (habit.start_date) {
        const startDate = new Date(habit.start_date)
        eligibleDays = eligibleDays.filter((day) => day >= startDate)
      }

      if (habit.end_date) {
        const endDate = new Date(habit.end_date)
        eligibleDays = eligibleDays.filter((day) => day <= endDate)
      }

      const completedDays = logs.length
      const totalEligibleDays = eligibleDays.length
      const completionRate = totalEligibleDays > 0 ? Math.round((completedDays / totalEligibleDays) * 100) : 0

      // Get streak
      let currentStreak = 0
      let longestStreak = 0

      // This is a simplified version - a more robust implementation would take into account habit frequency
      let tempStreak = 0

      // Sort logs by date
      const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Calculate streaks
      for (let i = 0; i < eligibleDays.length; i++) {
        const day = eligibleDays[i]
        const dateString = format(day, "yyyy-MM-dd")
        const completed = sortedLogs.some((log) => log.date === dateString)

        if (completed) {
          tempStreak++
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
        } else {
          tempStreak = 0
        }
      }

      // Calculate current streak (check if today is in the current streak)
      const today = new Date()

      if (isSameMonth(today, selectedMonth)) {
        for (let i = 0; i < eligibleDays.length; i++) {
          const day = eligibleDays[i]
          if (day > today) break

          const dateString = format(day, "yyyy-MM-dd")
          const completed = sortedLogs.some((log) => log.date === dateString)

          if (completed) {
            currentStreak++
          } else {
            currentStreak = 0
          }
        }
      }

      return {
        habit,
        completedDays,
        totalEligibleDays,
        completionRate,
        currentStreak,
        longestStreak,
      }
    })
  }, [habits, habitLogs, selectedMonth, daysInMonth])

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No habits yet</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Start building better habits by adding your first habit to track.
        </p>
        <Button onClick={() => {}} className="mt-4">
          Add Your First Habit
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold">{format(selectedMonth, "MMMM yyyy")}</h3>
          <Button variant="outline" size="sm" onClick={onCurrentMonth}>
            Today
          </Button>
        </div>

        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habitStats.map(({ habit, completedDays, totalEligibleDays, completionRate, currentStreak, longestStreak }) => (
          <Card key={habit.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color || "#3b82f6" }}></div>
                    {habit.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {habit.frequency === "daily" ? "Daily" : habit.frequency === "weekly" ? "Weekly" : "Monthly"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditHabit(habit)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDeleteHabit(habit.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Completion rate</span>
                    <span className="text-sm font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedDays} of {totalEligibleDays} days completed
                  </p>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Flame className="h-4 w-4 mr-1 text-orange-500" />
                    <span className="text-sm">
                      Current streak: <strong>{currentStreak}</strong>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1 text-amber-500" />
                    <span className="text-sm">
                      Best: <strong>{longestStreak}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 py-2 px-6">
              <div className="text-xs text-center w-full text-muted-foreground">
                {habit.description || "No description"}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
