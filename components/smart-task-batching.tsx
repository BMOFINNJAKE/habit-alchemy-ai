"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Layers, Brain, Clock, ArrowRight, Plus, X } from "lucide-react"

type TaskCategory = "deep-work" | "admin" | "communication" | "learning" | "creative" | "other"

interface Task {
  id: string
  title: string
  category: TaskCategory
  estimatedTime: number // in minutes
  energyLevel: "high" | "medium" | "low"
  completed: boolean
}

export function SmartTaskBatching() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "completed">>({
    title: "",
    category: "deep-work",
    estimatedTime: 30,
    energyLevel: "medium",
  })
  const [activeTab, setActiveTab] = useState("all")
  const [batchedTasks, setBatchedTasks] = useState<Record<TaskCategory, Task[]>>({
    "deep-work": [],
    admin: [],
    communication: [],
    learning: [],
    creative: [],
    other: [],
  })

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("batched-tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("batched-tasks", JSON.stringify(tasks))

    // Batch tasks by category
    const newBatchedTasks: Record<TaskCategory, Task[]> = {
      "deep-work": [],
      admin: [],
      communication: [],
      learning: [],
      creative: [],
      other: [],
    }

    tasks.forEach((task) => {
      if (!task.completed) {
        newBatchedTasks[task.category].push(task)
      }
    })

    setBatchedTasks(newBatchedTasks)
  }, [tasks])

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
    }

    setTasks((prev) => [...prev, task])
    setNewTask({
      title: "",
      category: "deep-work",
      estimatedTime: 30,
      energyLevel: "medium",
    })
  }

  const handleToggleComplete = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case "deep-work":
        return "bg-blue-100 text-blue-800"
      case "admin":
        return "bg-gray-100 text-gray-800"
      case "communication":
        return "bg-purple-100 text-purple-800"
      case "learning":
        return "bg-green-100 text-green-800"
      case "creative":
        return "bg-yellow-100 text-yellow-800"
      case "other":
        return "bg-red-100 text-red-800"
    }
  }

  const getEnergyLevelColor = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-red-100 text-red-800"
    }
  }

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case "deep-work":
        return <Brain className="h-5 w-5" />
      case "admin":
        return <Layers className="h-5 w-5" />
      case "communication":
        return <ArrowRight className="h-5 w-5" />
      case "learning":
        return <Brain className="h-5 w-5" />
      case "creative":
        return <Layers className="h-5 w-5" />
      case "other":
        return <Layers className="h-5 w-5" />
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    if (activeTab === "completed") return task.completed
    if (activeTab === "active") return !task.completed
    return task.category === activeTab
  })

  const totalEstimatedTime = filteredTasks.reduce((acc, task) => acc + task.estimatedTime, 0)
  const hours = Math.floor(totalEstimatedTime / 60)
  const minutes = totalEstimatedTime % 60

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Smart Task Batching</CardTitle>
        <CardDescription>Group similar tasks together to reduce context switching and increase focus</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-category">Category</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value) => setNewTask({ ...newTask, category: value as TaskCategory })}
                >
                  <SelectTrigger id="task-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deep-work">Deep Work</SelectItem>
                    <SelectItem value="admin">Administrative</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-time">Est. Time (min)</Label>
                  <Input
                    id="task-time"
                    type="number"
                    min="5"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask({ ...newTask, estimatedTime: Number.parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-energy">Energy Level</Label>
                  <Select
                    value={newTask.energyLevel}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, energyLevel: value as "high" | "medium" | "low" })
                    }
                  >
                    <SelectTrigger id="task-energy">
                      <SelectValue placeholder="Energy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={handleAddTask} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 md:grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="deep-work" className="hidden md:block">
                Deep Work
              </TabsTrigger>
              <TabsTrigger value="admin" className="hidden md:block">
                Admin
              </TabsTrigger>
              <TabsTrigger value="communication" className="hidden md:block">
                Comm
              </TabsTrigger>
              <TabsTrigger value="learning" className="hidden md:block">
                Learning
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredTasks.length} tasks • Estimated time: {hours}h {minutes}m
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task.id)}
                          id={`task-${task.id}`}
                        />
                        <div>
                          <label
                            htmlFor={`task-${task.id}`}
                            className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.title}
                          </label>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className={getCategoryColor(task.category)}>
                              {task.category}
                            </Badge>
                            <Badge variant="outline" className={getEnergyLevelColor(task.energyLevel)}>
                              {task.energyLevel} energy
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimatedTime}m
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks found. Add some tasks to get started.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {activeTab === "all" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {Object.entries(batchedTasks).map(([category, tasks]) => {
                if (tasks.length === 0) return null

                return (
                  <Card key={category} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getCategoryIcon(category as TaskCategory)}
                          {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                        </CardTitle>
                        <Badge>{tasks.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between text-sm p-2 border rounded">
                            <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                              {task.title}
                            </span>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimatedTime}m
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
