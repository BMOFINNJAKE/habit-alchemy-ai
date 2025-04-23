"use client"

import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Check, X, Trophy, TrendingUp, Calendar, BarChart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface Habit {
  id: string
  name: string
  category: string
  frequency: "daily" | "weekly" | "monthly"
  streak: number
  completedDays: string[]
  startDate: string
  longestStreak: number
  totalCompletions: number
  description?: string
  reminderTime?: string
  user_id?: string
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const CATEGORIES = [
  { value: "health", label: "Health & Fitness" },
  { value: "productivity", label: "Productivity" },
  { value: "learning", label: "Learning" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "social", label: "Social" },
]

export function HabitTracker() {
  const { toast } = useToast()
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      name: "Morning Exercise",
      category: "health",
      frequency: "daily",
      streak: 3,
      completedDays: ["Mon", "Tue", "Wed"],
      startDate: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0], // 7 days ago
      longestStreak: 5,
      totalCompletions: 12,
      description: "30 minutes of cardio or strength training",
      reminderTime: "07:00",
    },
    {
      id: "2",
      name: "Read 30 minutes",
      category: "learning",
      frequency: "daily",
      streak: 5,
      completedDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      startDate: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0], // 14 days ago
      longestStreak: 7,
      totalCompletions: 18,
      description: "Read non-fiction books or articles",
      reminderTime: "21:00",
    },
    {
      id: "3",
      name: "Meditate",
      category: "mindfulness",
      frequency: "daily",
      streak: 2,
      completedDays: ["Tue", "Wed"],
      startDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0], // 5 days ago
      longestStreak: 3,
      totalCompletions: 8,
      description: "10 minutes of guided meditation",
      reminderTime: "08:00",
    },
    {
      id: "4",
      name: "Weekly Review",
      category: "productivity",
      frequency: "weekly",
      streak: 1,
      completedDays: ["Sun"],
      startDate: new Date(Date.now() - 21 * 86400000).toISOString().split("T")[0], // 21 days ago
      longestStreak: 3,
      totalCompletions: 4,
      description: "Review goals and plan for the week ahead",
    },
  ])
  const [newHabitOpen, setNewHabitOpen] = useState(false)
  const [newHabit, setNewHabit] = useState<
    Omit<Habit, "id" | "streak" | "completedDays" | "longestStreak" | "totalCompletions">
  >({
    name: "",
    category: "productivity",
    frequency: "daily",
    startDate: new Date().toISOString().split("T")[0],
    description: "",
    reminderTime: "",
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"tracker" | "stats">("tracker")
  const [habitDetailsOpen, setHabitDetailsOpen] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)

  // Get user ID on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
        fetchHabits(data.user.id)
      } else {
        setIsLoading(false)
      }
    }
    getUser()
  }, [])

  // Fetch habits from Supabase
  const fetchHabits = async (uid: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data) {
        // Transform data to match our Habit interface
        const transformedHabits = data.map((habit) => ({
          id: habit.id,
          name: habit.name,
          category: habit.category || "productivity",
          frequency: habit.frequency || "daily",
          streak: habit.streak || 0,
          completedDays: habit.completed_days || [],
          startDate: habit.start_date || new Date().toISOString().split("T")[0],
          longestStreak: habit.longest_streak || 0,
          totalCompletions: habit.total_completions || 0,
          description: habit.description,
          reminderTime: habit.reminder_time,
          user_id: habit.user_id,
        }))
        setHabits(transformedHabits)
      }
    } catch (error) {
      console.error("Error fetching habits:", error)
      toast({
        title: "Error",
        description: "Failed to fetch habits. Using sample data instead.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addHabit = async () => {
    if (!newHabit.name) {
      toast({
        title: "Error",
        description: "Habit name is required",
        variant: "destructive",
      })
      return
    }

    const habit: Habit = {
      ...newHabit,
      id: Date.now().toString(),
      streak: 0,
      completedDays: [],
      longestStreak: 0,
      totalCompletions: 0,
    }

    if (userId) {
      // Save to Supabase
      try {
        const { error } = await supabase.from("habits").insert({
          name: habit.name,
          category: habit.category,
          frequency: habit.frequency,
          streak: 0,
          completed_days: [],
          start_date: habit.startDate,
          longest_streak: 0,
          total_completions: 0,
          description: habit.description,
          reminder_time: habit.reminderTime,
          user_id: userId,
        })

        if (error) throw error

        // Refresh habits
        fetchHabits(userId)
      } catch (error) {
        console.error("Error adding habit:", error)
        toast({
          title: "Error",
          description: "Failed to save habit to database. Adding locally only.",
          variant: "destructive",
        })
        // Fall back to local state
        setHabits([...habits, habit])
      }
    } else {
      // Just update local state if no user ID
      setHabits([...habits, habit])
    }

    setNewHabit({
      name: "",
      category: "productivity",
      frequency: "daily",
      startDate: new Date().toISOString().split("T")[0],
      description: "",
      reminderTime: "",
    })
    setNewHabitOpen(false)

    toast({
      title: "Habit added",
      description: "Your new habit has been added to the tracker",
    })
  }

  const removeHabit = async (id: string) => {
    if (userId) {
      try {
        const { error } = await supabase.from("habits").delete().eq("id", id)

        if (error) throw error

        // Refresh habits
        fetchHabits(userId)
      } catch (error) {
        console.error("Error removing habit:", error)
        toast({
          title: "Error",
          description: "Failed to remove habit from database. Removing locally only.",
          variant: "destructive",
        })
        // Fall back to local state
        setHabits(habits.filter((habit) => habit.id !== id))
      }
    } else {
      // Just update local state if no user ID
      setHabits(habits.filter((habit) => habit.id !== id))
    }

    toast({
      title: "Habit removed",
      description: "Your habit has been removed from the tracker",
    })
  }

  const toggleDay = async (habitId: string, day: string) => {
    // Find the habit to update
    const habitToUpdate = habits.find((h) => h.id === habitId)
    if (!habitToUpdate) return

    // Calculate new completed days
    const completedDays = habitToUpdate.completedDays.includes(day)
      ? habitToUpdate.completedDays.filter((d) => d !== day)
      : [...habitToUpdate.completedDays, day]

    // Calculate streak
    let streak = 0
    let longestStreak = habitToUpdate.longestStreak
    let totalCompletions = habitToUpdate.totalCompletions

    if (habitToUpdate.frequency === "daily") {
      // For daily habits, count consecutive days
      const sortedDays = [...completedDays].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))

      let currentStreak = 0
      for (let i = 0; i < DAYS.length; i++) {
        if (sortedDays.includes(DAYS[i])) {
          currentStreak++
        } else {
          break
        }
      }
      streak = currentStreak
    } else {
      // For weekly habits, just check if completed this week
      streak = completedDays.length > 0 ? 1 : 0
    }

    // Update total completions
    if (!habitToUpdate.completedDays.includes(day) && completedDays.includes(day)) {
      totalCompletions++
    } else if (habitToUpdate.completedDays.includes(day) && !completedDays.includes(day)) {
      totalCompletions = Math.max(0, totalCompletions - 1)
    }

    // Update longest streak
    if (streak > longestStreak) {
      longestStreak = streak
    }

    // Create updated habit
    const updatedHabit = {
      ...habitToUpdate,
      completedDays,
      streak,
      longestStreak,
      totalCompletions,
    }

    if (userId) {
      try {
        const { error } = await supabase
          .from("habits")
          .update({
            completed_days: completedDays,
            streak: streak,
            longest_streak: longestStreak,
            total_completions: totalCompletions,
          })
          .eq("id", habitId)

        if (error) throw error

        // Update local state
        setHabits(habits.map((h) => (h.id === habitId ? updatedHabit : h)))
      } catch (error) {
        console.error("Error updating habit:", error)
        toast({
          title: "Error",
          description: "Failed to update habit in database. Updating locally only.",
          variant: "destructive",
        })
        // Fall back to local state update
        setHabits(habits.map((h) => (h.id === habitId ? updatedHabit : h)))
      }
    } else {
      // Just update local state if no user ID
      setHabits(habits.map((h) => (h.id === habitId ? updatedHabit : h)))
    }
  }

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category
  }

  const getCompletionRate = (habit: Habit) => {
    const daysSinceStart = Math.max(
      1,
      Math.floor((Date.now() - new Date(habit.startDate).getTime()) / (1000 * 60 * 60 * 24)),
    )

    if (habit.frequency === "daily") {
      return Math.round((habit.totalCompletions / daysSinceStart) * 100)
    } else if (habit.frequency === "weekly") {
      const weeksSinceStart = Math.max(1, Math.floor(daysSinceStart / 7))
      return Math.round((habit.totalCompletions / weeksSinceStart) * 100)
    } else {
      const monthsSinceStart = Math.max(1, Math.floor(daysSinceStart / 30))
      return Math.round((habit.totalCompletions / monthsSinceStart) * 100)
    }
  }

  const openHabitDetails = (habit: Habit) => {
    setSelectedHabit(habit)
    setHabitDetailsOpen(true)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Habit Tracker</CardTitle>
          <div className="flex gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "tracker" | "stats")}>
              <TabsList>
                <TabsTrigger value="tracker">Tracker</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" onClick={() => setNewHabitOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TabsContent value="tracker" className="mt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left font-medium text-sm py-2 w-1/3">Habit</th>
                  {DAYS.map((day) => (
                    <th key={day} className="text-center font-medium text-sm py-2">
                      {day}
                    </th>
                  ))}
                  <th className="text-center font-medium text-sm py-2">Streak</th>
                  <th className="text-center font-medium text-sm py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {habits.length > 0 ? (
                  habits.map((habit) => (
                    <tr key={habit.id} className="border-t">
                      <td className="py-3">
                        <div className="cursor-pointer" onClick={() => openHabitDetails(habit)}>
                          <div className="font-medium text-sm">{habit.name}</div>
                          <div className="text-xs text-muted-foreground">{getCategoryLabel(habit.category)}</div>
                        </div>
                      </td>
                      {DAYS.map((day) => (
                        <td key={`${habit.id}-${day}`} className="text-center py-3">
                          <Button
                            variant={habit.completedDays.includes(day) ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleDay(habit.id, day)}
                          >
                            {habit.completedDays.includes(day) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      ))}
                      <td className="text-center py-3">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {habit.streak}
                        </span>
                      </td>
                      <td className="text-center py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeHabit(habit.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted-foreground">
                      No habits added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.length > 0 ? (
              habits.map((habit) => {
                const completionRate = getCompletionRate(habit)
                return (
                  <Card key={habit.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{habit.name}</h3>
                          <p className="text-xs text-muted-foreground">{getCategoryLabel(habit.category)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openHabitDetails(habit)}
                        >
                          <BarChart className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3 mt-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion Rate</span>
                            <span>{completionRate}%</span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="flex justify-center mb-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div className="text-xl font-bold">{habit.longestStreak}</div>
                            <div className="text-xs text-muted-foreground">Best Streak</div>
                          </div>

                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="flex justify-center mb-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="text-xl font-bold">{habit.streak}</div>
                            <div className="text-xs text-muted-foreground">Current</div>
                          </div>

                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="flex justify-center mb-1">
                              <Calendar className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="text-xl font-bold">{habit.totalCompletions}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">No habits added yet</div>
            )}
          </div>
        </TabsContent>

      <Dialog open={newHabitOpen} onOpenChange={setNewHabitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="Enter habit name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newHabit.description || ""}
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                placeholder="Enter habit description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newHabit.category}
                onValueChange={(value) => setNewHabit({ ...newHabit, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={newHabit.frequency}
                onValueChange={(value) =>
                  setNewHabit({ ...newHabit, frequency: value as "daily" | "weekly" | "monthly" })
                }
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={newHabit.startDate}
                onChange={(e) => setNewHabit({ ...newHabit, startDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reminderTime">Reminder Time (Optional)</Label>
              <Input
                id="reminderTime"
                type="time"
                value={newHabit.reminderTime || ""}
                onChange={(e) => setNewHabit({ ...newHabit, reminderTime: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewHabitOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addHabit}>Add Habit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={habitDetailsOpen} onOpenChange={setHabitDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedHabit?.name}</DialogTitle>
          </DialogHeader>
          {selectedHabit && (
            <div className="py-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedHabit.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Category</h3>
                    <p className="text-sm">{getCategoryLabel(selectedHabit.category)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Frequency</h3>
                    <p className="text-sm capitalize">{selectedHabit.frequency}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Start Date</h3>
                    <p className="text-sm">{new Date(selectedHabit.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Reminder</h3>
                    <p className="text-sm">{selectedHabit.reminderTime || "None"}</p>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-3">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{selectedHabit.streak}</div>
                      <div className="text-xs text-muted-foreground">Current Streak</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{selectedHabit.longestStreak}</div>
                      <div className="text-xs text-muted-foreground">Longest Streak</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{selectedHabit.totalCompletions}</div>
                      <div className="text-xs text-muted-foreground">Total Completions</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion Rate</span>
                      <span>{getCompletionRate(selectedHabit)}%</span>
                    </div>
                    <Progress value={getCompletionRate(selectedHabit)} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHabitDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
}
