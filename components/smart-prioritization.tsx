"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Plus, X, ArrowUp, ArrowDown, Clock, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Task {
  id: string
  title: string
  description: string
  urgency: number // 1-10
  importance: number // 1-10
  estimatedTime: number // in minutes
  category: string
  quadrant?: 1 | 2 | 3 | 4 // Eisenhower matrix quadrant
}

export function SmartPrioritization() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Finish project proposal",
      description: "Complete the draft and send for review",
      urgency: 9,
      importance: 8,
      estimatedTime: 90,
      category: "work",
      quadrant: 1,
    },
    {
      id: "2",
      title: "Weekly team meeting",
      description: "Discuss project progress and blockers",
      urgency: 7,
      importance: 6,
      estimatedTime: 60,
      category: "work",
      quadrant: 1,
    },
    {
      id: "3",
      title: "Respond to client emails",
      description: "Address questions about timeline and deliverables",
      urgency: 8,
      importance: 5,
      estimatedTime: 30,
      category: "work",
      quadrant: 2,
    },
    {
      id: "4",
      title: "Research new productivity tools",
      description: "Find tools to improve team workflow",
      urgency: 3,
      importance: 7,
      estimatedTime: 45,
      category: "work",
      quadrant: 3,
    },
    {
      id: "5",
      title: "Organize digital files",
      description: "Clean up project folders and archive completed work",
      urgency: 2,
      importance: 4,
      estimatedTime: 60,
      category: "personal",
      quadrant: 4,
    },
  ])
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "quadrant">>({
    title: "",
    description: "",
    urgency: 5,
    importance: 5,
    estimatedTime: 30,
    category: "work",
  })
  const [sortBy, setSortBy] = useState<"smart" | "urgency" | "importance" | "time" | "manual">("smart")

  // Calculate quadrant for each task
  const calculateQuadrant = (urgency: number, importance: number): 1 | 2 | 3 | 4 => {
    if (urgency >= 6 && importance >= 6) return 1 // Urgent & Important
    if (urgency >= 6 && importance < 6) return 2 // Urgent & Not Important
    if (urgency < 6 && importance >= 6) return 3 // Not Urgent & Important
    return 4 // Not Urgent & Not Important
  }

  // Add a new task
  const addTask = () => {
    if (!newTask.title) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      })
      return
    }

    const quadrant = calculateQuadrant(newTask.urgency, newTask.importance)
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      quadrant,
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      urgency: 5,
      importance: 5,
      estimatedTime: 30,
      category: "work",
    })
    setNewTaskOpen(false)

    toast({
      title: "Task added",
      description: "Your task has been added to the prioritization matrix",
    })
  }

  // Remove a task
  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
    toast({
      title: "Task removed",
      description: "Your task has been removed from the prioritization matrix",
    })
  }

  // Move task up in the list
  const moveTaskUp = (index: number) => {
    if (index === 0) return
    const newTasks = [...tasks]
    const temp = newTasks[index]
    newTasks[index] = newTasks[index - 1]
    newTasks[index - 1] = temp
    setTasks(newTasks)
    setSortBy("manual")
  }

  // Move task down in the list
  const moveTaskDown = (index: number) => {
    if (index === tasks.length - 1) return
    const newTasks = [...tasks]
    const temp = newTasks[index]
    newTasks[index] = newTasks[index + 1]
    newTasks[index + 1] = temp
    setTasks(newTasks)
    setSortBy("manual")
  }

  // Sort tasks based on selected criteria
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "smart") {
      // Smart sorting: Quadrant first, then combined score of urgency and importance
      if (a.quadrant !== b.quadrant) {
        return (a.quadrant || 4) - (b.quadrant || 4)
      }
      const aScore = a.urgency * 0.6 + a.importance * 0.4
      const bScore = b.urgency * 0.6 + b.importance * 0.4
      return bScore - aScore
    } else if (sortBy === "urgency") {
      return b.urgency - a.urgency
    } else if (sortBy === "importance") {
      return b.importance - a.importance
    } else if (sortBy === "time") {
      return a.estimatedTime - b.estimatedTime
    }
    return 0 // For manual sorting, maintain current order
  })

  // Get tasks by quadrant
  const getTasksByQuadrant = (quadrant: 1 | 2 | 3 | 4) => {
    return tasks.filter((task) => task.quadrant === quadrant)
  }

  // Get quadrant label and color
  const getQuadrantInfo = (quadrant: 1 | 2 | 3 | 4) => {
    switch (quadrant) {
      case 1:
        return { label: "Do First", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
      case 2:
        return { label: "Schedule", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" }
      case 3:
        return { label: "Delegate", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
      case 4:
        return { label: "Eliminate", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }
    }
  }

  // Format time display
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Get icon for task based on quadrant
  const getTaskIcon = (quadrant: 1 | 2 | 3 | 4) => {
    switch (quadrant) {
      case 1:
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 2:
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 3:
        return <ArrowUp className="h-4 w-4 text-blue-500" />
      case 4:
        return <ArrowDown className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Smart Task Prioritization</CardTitle>
          <Button size="sm" onClick={() => setNewTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} • Prioritized by{" "}
            {sortBy === "smart" ? "Eisenhower Matrix" : sortBy}
          </div>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smart">Smart (Eisenhower)</SelectItem>
              <SelectItem value="urgency">Urgency</SelectItem>
              <SelectItem value="importance">Importance</SelectItem>
              <SelectItem value="time">Time (shortest first)</SelectItem>
              <SelectItem value="manual">Manual (reorder)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((quadrant) => {
            const { label, color } = getQuadrantInfo(quadrant as 1 | 2 | 3 | 4)
            const quadrantTasks = getTasksByQuadrant(quadrant as 1 | 2 | 3 | 4)
            return (
              <div key={quadrant} className="border rounded-md p-3">
                <div className={`inline-block px-2 py-1 rounded-md text-xs font-medium mb-2 ${color}`}>{label}</div>
                <div className="space-y-2">
                  {quadrantTasks.length > 0 ? (
                    quadrantTasks.map((task) => (
                      <div key={task.id} className="flex items-start justify-between p-2 border rounded-md">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">{getTaskIcon(task.quadrant!)}</div>
                          <div>
                            <div className="font-medium text-sm">{task.title}</div>
                            <div className="text-xs text-muted-foreground">{task.description}</div>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                                {formatTime(task.estimatedTime)}
                              </span>
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">U: {task.urgency}/10</span>
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                                I: {task.importance}/10
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeTask(task.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">No tasks in this quadrant</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-3">Prioritized Task List</h3>
          <div className="space-y-2">
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{index + 1}.</div>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                          {formatTime(task.estimatedTime)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getQuadrantInfo(task.quadrant!).color}`}>
                          {getQuadrantInfo(task.quadrant!).label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {sortBy === "manual" && (
                      <div className="flex mr-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => moveTaskUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => moveTaskDown(index)}
                          disabled={index === sortedTasks.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeTask(task.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No tasks added yet</div>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urgency">
                Urgency: {newTask.urgency}/10 {newTask.urgency >= 6 ? "(High)" : "(Low)"}
              </Label>
              <Slider
                id="urgency"
                min={1}
                max={10}
                step={1}
                value={[newTask.urgency]}
                onValueChange={(value) => setNewTask({ ...newTask, urgency: value[0] })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="importance">
                Importance: {newTask.importance}/10 {newTask.importance >= 6 ? "(High)" : "(Low)"}
              </Label>
              <Slider
                id="importance"
                min={1}
                max={10}
                step={1}
                value={[newTask.importance]}
                onValueChange={(value) => setNewTask({ ...newTask, importance: value[0] })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
              <Input
                id="estimatedTime"
                type="number"
                min={5}
                max={480}
                value={newTask.estimatedTime}
                onChange={(e) => setNewTask({ ...newTask, estimatedTime: Number(e.target.value) })}
              />
              <div className="text-xs text-muted-foreground">
                {formatTime(newTask.estimatedTime)} • Quadrant:{" "}
                {getQuadrantInfo(calculateQuadrant(newTask.urgency, newTask.importance)).label}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default SmartPrioritization
