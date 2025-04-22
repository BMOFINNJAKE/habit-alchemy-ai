"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreVertical, Plus, ArrowLeft, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  category: "health" | "work" | "personal"
  isHabit?: boolean
  frequency?: "daily" | "weekly"
  streak?: number
  history?: { date: string; completed: boolean }[]
}

export function EnhancedChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "1",
      label: "Morning sunlight exposure (10-30 mins)",
      checked: false,
      category: "health",
      isHabit: true,
      frequency: "daily",
      streak: 3,
      history: [
        { date: format(subDays(new Date(), 3), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 2), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 1), "yyyy-MM-dd"), completed: true },
        { date: format(new Date(), "yyyy-MM-dd"), completed: false },
      ],
    },
    {
      id: "2",
      label: "Take Omega-3 supplement",
      checked: false,
      category: "health",
      isHabit: true,
      frequency: "daily",
      streak: 5,
      history: [
        { date: format(subDays(new Date(), 5), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 4), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 3), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 2), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 1), "yyyy-MM-dd"), completed: true },
        { date: format(new Date(), "yyyy-MM-dd"), completed: false },
      ],
    },
    {
      id: "3",
      label: "Drink 16oz water upon waking",
      checked: false,
      category: "health",
      isHabit: true,
      frequency: "daily",
      streak: 2,
      history: [
        { date: format(subDays(new Date(), 2), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 1), "yyyy-MM-dd"), completed: true },
        { date: format(new Date(), "yyyy-MM-dd"), completed: false },
      ],
    },
    {
      id: "4",
      label: "Exercise/movement (30+ mins)",
      checked: false,
      category: "health",
      isHabit: true,
      frequency: "daily",
      streak: 0,
      history: [
        { date: format(subDays(new Date(), 3), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 2), "yyyy-MM-dd"), completed: false },
        { date: format(subDays(new Date(), 1), "yyyy-MM-dd"), completed: false },
        { date: format(new Date(), "yyyy-MM-dd"), completed: false },
      ],
    },
    {
      id: "5",
      label: "Cold exposure (2-5 mins)",
      checked: false,
      category: "health",
      isHabit: false,
    },
    {
      id: "6",
      label: "Meditation/breathwork (10-20 mins)",
      checked: false,
      category: "health",
      isHabit: true,
      frequency: "daily",
      streak: 1,
      history: [
        { date: format(subDays(new Date(), 1), "yyyy-MM-dd"), completed: true },
        { date: format(new Date(), "yyyy-MM-dd"), completed: false },
      ],
    },
    {
      id: "7",
      label: "Weekly review",
      checked: false,
      category: "work",
      isHabit: true,
      frequency: "weekly",
      streak: 3,
      history: [
        { date: format(subDays(new Date(), 21), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 14), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 7), "yyyy-MM-dd"), completed: true },
      ],
    },
    {
      id: "8",
      label: "Call parents",
      checked: false,
      category: "personal",
      isHabit: true,
      frequency: "weekly",
      streak: 2,
      history: [
        { date: format(subDays(new Date(), 14), "yyyy-MM-dd"), completed: true },
        { date: format(subDays(new Date(), 7), "yyyy-MM-dd"), completed: true },
      ],
    },
  ])

  const [newTaskLabel, setNewTaskLabel] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState<"health" | "work" | "personal">("health")
  const [newTaskIsHabit, setNewTaskIsHabit] = useState(false)
  const [newTaskFrequency, setNewTaskFrequency] = useState<"daily" | "weekly">("daily")
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("checklist")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week">("day")

  // Get days for week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Navigate to previous/next day or week
  const navigatePrevious = () => {
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, -1))
    } else {
      setCurrentDate(addDays(currentDate, -7))
    }
  }

  const navigateNext = () => {
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, 7))
    }
  }

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newChecked = !item.checked

          // If this is a habit, update the history and streak
          if (item.isHabit) {
            const today = format(new Date(), "yyyy-MM-dd")
            const history = item.history || []

            // Find if we already have an entry for today
            const todayIndex = history.findIndex((h) => h.date === today)

            if (todayIndex >= 0) {
              // Update existing entry
              history[todayIndex].completed = newChecked
            } else {
              // Add new entry for today
              history.push({ date: today, completed: newChecked })
            }

            // Calculate streak
            let streak = 0
            if (newChecked) {
              streak = 1 // Start with today

              // Sort history by date descending
              const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

              // Count consecutive completed days before today
              for (let i = 1; i < sortedHistory.length; i++) {
                if (sortedHistory[i].completed) {
                  // For daily habits, check if dates are consecutive
                  if (item.frequency === "daily") {
                    const currentDate = new Date(sortedHistory[i - 1].date)
                    const prevDate = new Date(sortedHistory[i].date)
                    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

                    if (diffDays === 1) {
                      streak++
                    } else {
                      break
                    }
                  }
                  // For weekly habits, check if dates are ~7 days apart
                  else if (item.frequency === "weekly") {
                    const currentDate = new Date(sortedHistory[i - 1].date)
                    const prevDate = new Date(sortedHistory[i].date)
                    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

                    if (diffDays >= 5 && diffDays <= 9) {
                      // Allow some flexibility
                      streak++
                    } else {
                      break
                    }
                  }
                } else {
                  break
                }
              }
            } else {
              // If unchecking, recalculate streak from previous entries
              const sortedHistory = [...history]
                .filter((h) => h.date !== today) // Exclude today
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

              for (let i = 0; i < sortedHistory.length; i++) {
                if (sortedHistory[i].completed) {
                  if (i === 0) {
                    streak = 1
                  } else {
                    const currentDate = new Date(sortedHistory[i - 1].date)
                    const prevDate = new Date(sortedHistory[i].date)
                    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

                    if (
                      (item.frequency === "daily" && diffDays === 1) ||
                      (item.frequency === "weekly" && diffDays >= 5 && diffDays <= 9)
                    ) {
                      streak++
                    } else {
                      break
                    }
                  }
                } else {
                  break
                }
              }
            }

            return { ...item, checked: newChecked, history, streak }
          }

          return { ...item, checked: newChecked }
        }
        return item
      }),
    )
  }

  const addTask = () => {
    if (!newTaskLabel.trim()) return

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      label: newTaskLabel,
      checked: false,
      category: newTaskCategory,
      isHabit: newTaskIsHabit,
      frequency: newTaskIsHabit ? newTaskFrequency : undefined,
      streak: 0,
      history: newTaskIsHabit ? [{ date: format(new Date(), "yyyy-MM-dd"), completed: false }] : undefined,
    }

    setItems([...items, newItem])
    setNewTaskLabel("")
    setNewTaskIsHabit(false)
    setNewTaskFrequency("daily")

    toast({
      title: newTaskIsHabit ? "Habit added" : "Task added",
      description: `Your new ${newTaskIsHabit ? "habit" : "task"} has been added to the checklist.`,
    })
  }

  const deleteTask = (id: string) => {
    setItems(items.filter((item) => item.id !== id))

    toast({
      title: "Item deleted",
      description: "The item has been removed from your checklist.",
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health":
        return "bg-green-500"
      case "work":
        return "bg-blue-500"
      case "personal":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  const completedItems = items.filter((item) => item.checked).length
  const totalItems = items.length
  const percentComplete = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // Filter items for habits view
  const habits = items.filter((item) => item.isHabit)
  const dailyHabits = habits.filter((item) => item.frequency === "daily")
  const weeklyHabits = habits.filter((item) => item.frequency === "weekly")

  // Get habits for a specific day
  const getHabitsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return habits
      .filter((habit) => {
        if (habit.frequency === "daily") {
          return true // Show all daily habits
        } else if (habit.frequency === "weekly") {
          // For weekly habits, show on the same day of week
          return date.getDay() === new Date().getDay()
        }
        return false
      })
      .map((habit) => {
        // Check if this habit was completed on this date
        const completed = habit.history?.some((h) => h.date === dateStr && h.completed) || false
        return { ...habit, checked: completed }
      })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Habits & Daily Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="checklist">Daily Checklist</TabsTrigger>
            <TabsTrigger value="habits">Habit Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">{formattedDate}</div>
              <div className="text-xs text-muted-foreground">
                {completedItems}/{totalItems} • {percentComplete}%
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getCategoryColor(item.category)}`}></div>
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <label
                      htmlFor={`item-${item.id}`}
                      className={`text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}
                    >
                      {item.label}
                      {item.isHabit && (
                        <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                          {item.streak} day{item.streak !== 1 ? "s" : ""} streak
                        </span>
                      )}
                    </label>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteTask(item.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setItems(items.map((item) => ({ ...item, checked: false })))}
              >
                Reset
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="task" className="text-sm font-medium">
                        Description
                      </label>
                      <Input
                        id="task"
                        placeholder="Enter task description"
                        value={newTaskLabel}
                        onChange={(e) => setNewTaskLabel(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <Select
                        value={newTaskCategory}
                        onValueChange={(value) => setNewTaskCategory(value as "health" | "work" | "personal")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="is-habit"
                        checked={newTaskIsHabit}
                        onCheckedChange={(checked) => setNewTaskIsHabit(checked === true)}
                      />
                      <label htmlFor="is-habit" className="text-sm font-medium">
                        Track as habit
                      </label>
                    </div>
                    {newTaskIsHabit && (
                      <div className="grid gap-2">
                        <label htmlFor="frequency" className="text-sm font-medium">
                          Frequency
                        </label>
                        <Select
                          value={newTaskFrequency}
                          onValueChange={(value) => setNewTaskFrequency(value as "daily" | "weekly")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={addTask}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="habits">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={navigatePrevious}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="font-medium">
                  {viewMode === "day"
                    ? format(currentDate, "MMMM d, yyyy")
                    : `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`}
                </div>
                <Button variant="outline" size="sm" onClick={navigateNext}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as "day" | "week")}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day View</SelectItem>
                  <SelectItem value="week">Week View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {viewMode === "day" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Daily Habits</h3>
                  <div className="space-y-2">
                    {dailyHabits.length > 0 ? (
                      dailyHabits.map((habit) => {
                        const habitForDay = getHabitsForDay(currentDate).find((h) => h.id === habit.id)
                        return (
                          <div key={habit.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${getCategoryColor(habit.category)}`}></div>
                              <Checkbox
                                id={`habit-${habit.id}`}
                                checked={habitForDay?.checked || false}
                                onCheckedChange={() => toggleItem(habit.id)}
                              />
                              <label htmlFor={`habit-${habit.id}`} className="text-sm">
                                {habit.label}
                              </label>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full mr-2">
                                {habit.streak} day{habit.streak !== 1 ? "s" : ""}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => deleteTask(habit.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No daily habits added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Weekly Habits</h3>
                  <div className="space-y-2">
                    {weeklyHabits.length > 0 ? (
                      weeklyHabits.map((habit) => {
                        const habitForDay = getHabitsForDay(currentDate).find((h) => h.id === habit.id)
                        // Only show weekly habits if they're due on this day
                        if (!habitForDay) return null
                        return (
                          <div key={habit.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${getCategoryColor(habit.category)}`}></div>
                              <Checkbox
                                id={`habit-${habit.id}`}
                                checked={habitForDay?.checked || false}
                                onCheckedChange={() => toggleItem(habit.id)}
                              />
                              <label htmlFor={`habit-${habit.id}`} className="text-sm">
                                {habit.label}
                              </label>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full mr-2">
                                {habit.streak} week{habit.streak !== 1 ? "s" : ""}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => deleteTask(habit.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No weekly habits added yet</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {daysInWeek.map((day) => (
                  <div key={day.toISOString()} className="border rounded-md p-2">
                    <div className="text-center font-medium mb-2">{format(day, "EEE")}</div>
                    <div className="text-center text-sm text-muted-foreground mb-3">{format(day, "MMM d")}</div>
                    <div className="space-y-1">
                      {getHabitsForDay(day).map((habit) => (
                        <div
                          key={habit.id}
                          className={`rounded-md px-2 py-1 text-xs ${
                            habit.checked
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          <div className="truncate">{habit.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Habit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Habit</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="habit" className="text-sm font-medium">
                        Habit Description
                      </label>
                      <Input
                        id="habit"
                        placeholder="Enter habit description"
                        value={newTaskLabel}
                        onChange={(e) => setNewTaskLabel(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <Select
                        value={newTaskCategory}
                        onValueChange={(value) => setNewTaskCategory(value as "health" | "work" | "personal")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="frequency" className="text-sm font-medium">
                        Frequency
                      </label>
                      <Select
                        value={newTaskFrequency}
                        onValueChange={(value) => setNewTaskFrequency(value as "daily" | "weekly")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        setNewTaskIsHabit(true)
                        addTask()
                      }}
                    >
                      Add Habit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default EnhancedChecklist
