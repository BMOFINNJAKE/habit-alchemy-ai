"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Clock, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Import the Supabase client from the lib file
import supabase from "@/lib/supabase"

// Define types
interface Task {
  id: string
  title: string
  description: string
  urgency: "high" | "medium" | "low"
  importance: "high" | "medium" | "low"
  dueDate: string | null
  completed: boolean
  createdAt: string
}

export function SmartTaskPrioritization() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    urgency: "medium" as "high" | "medium" | "low",
    importance: "medium" as "high" | "medium" | "low",
    dueDate: "",
  })

  // Load tasks from Supabase
  const loadTasks = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session) {
        console.log("No authenticated user")
        return
      }

      const userId = session.session.user.id

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading tasks:", error)
        toast({
          title: "Error loading tasks",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setTasks(data || [])
    } catch (error) {
      console.error("Error in loadTasks:", error)
    }
  }

  // Add a new task
  const addTask = async () => {
    try {
      if (!newTask.title.trim()) {
        toast({
          title: "Task title required",
          description: "Please enter a title for your task",
          variant: "destructive",
        })
        return
      }

      const { data: session } = await supabase.auth.getSession()
      if (!session?.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add tasks",
          variant: "destructive",
        })
        return
      }

      const userId = session.session.user.id

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: newTask.title,
          description: newTask.description,
          urgency: newTask.urgency,
          importance: newTask.importance,
          due_date: newTask.dueDate || null,
          completed: false,
        })
        .select()

      if (error) {
        console.error("Error adding task:", error)
        toast({
          title: "Error adding task",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Task added",
        description: "Your task has been added successfully",
      })

      // Reset form and close dialog
      setNewTask({
        title: "",
        description: "",
        urgency: "medium",
        importance: "medium",
        dueDate: "",
      })
      setIsAddingTask(false)

      // Reload tasks
      loadTasks()
    } catch (error) {
      console.error("Error in addTask:", error)
      toast({
        title: "Error adding task",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Toggle task completion status
  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session) return

      const userId = session.session.user.id

      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", id)
        .eq("user_id", userId)

      if (error) {
        console.error("Error updating task:", error)
        toast({
          title: "Error updating task",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // Reload tasks
      loadTasks()
    } catch (error) {
      console.error("Error in toggleTaskCompletion:", error)
    }
  }

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session) return

      const userId = session.session.user.id

      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", userId)

      if (error) {
        console.error("Error deleting task:", error)
        toast({
          title: "Error deleting task",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully",
      })

      // Reload tasks
      loadTasks()
    } catch (error) {
      console.error("Error in deleteTask:", error)
    }
  }

  // Load tasks on component mount
  useEffect(() => {
    loadTasks()
  }, [])

  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    switch (activeTab) {
      case "do":
        return tasks.filter((task) => task.importance === "high" && task.urgency === "high" && !task.completed)
      case "schedule":
        return tasks.filter((task) => task.importance === "high" && task.urgency !== "high" && !task.completed)
      case "delegate":
        return tasks.filter((task) => task.importance !== "high" && task.urgency === "high" && !task.completed)
      case "eliminate":
        return tasks.filter((task) => task.importance !== "high" && task.urgency !== "high" && !task.completed)
      case "completed":
        return tasks.filter((task) => task.completed)
      default:
        return tasks.filter((task) => !task.completed)
    }
  }

  // Get urgency badge color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return ""
    }
  }

  // Get importance badge color
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "medium":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return ""
    }
  }

  // Get quadrant name based on urgency and importance
  const getQuadrantName = (urgency: string, importance: string) => {
    if (urgency === "high" && importance === "high") return "Do"
    if (urgency !== "high" && importance === "high") return "Schedule"
    if (urgency === "high" && importance !== "high") return "Delegate"
    return "Eliminate"
  }

  // Render task list
  const renderTasks = () => {
    const filteredTasks = getFilteredTasks()

    if (filteredTasks.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No tasks found in this category</div>
    }

    return filteredTasks.map((task) => (
      <Card key={task.id} className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="pt-1">
              <button
                onClick={() => toggleTaskCompletion(task.id, task.completed)}
                className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                  task.completed ? "bg-primary border-primary" : "border-gray-300"
                }`}
              >
                {task.completed && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
              </button>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {task.description && (
                <p
                  className={`text-sm mt-1 ${task.completed ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
                >
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className={getUrgencyColor(task.urgency || "")}>
                  {(task.urgency || "").charAt(0).toUpperCase() + (task.urgency || "").slice(1)} Urgency
                </Badge>
                <Badge variant="outline" className={getImportanceColor(task.importance || "")}>
                  {(task.importance || "").charAt(0).toUpperCase() + (task.importance || "").slice(1)} Importance
                </Badge>
                {!task.completed && (
                  <Badge variant="outline">{getQuadrantName(task.urgency || "", task.importance || "")}</Badge>
                )}
                {task.dueDate && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-muted-foreground">
            {tasks.filter((t) => !t.completed).length} tasks • Prioritized by Eisenhower Matrix
          </span>
        </div>
        <Button onClick={() => setIsAddingTask(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="do">Do</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="delegate">Delegate</TabsTrigger>
          <TabsTrigger value="eliminate">Eliminate</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>{renderTasks()}</TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={newTask.urgency}
                  onValueChange={(value: "high" | "medium" | "low") => setNewTask({ ...newTask, urgency: value })}
                >
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="importance">Importance</Label>
                <Select
                  value={newTask.importance}
                  onValueChange={(value: "high" | "medium" | "low") => setNewTask({ ...newTask, importance: value })}
                >
                  <SelectTrigger id="importance">
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTask(false)}>
              Cancel
            </Button>
            <Button onClick={addTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
