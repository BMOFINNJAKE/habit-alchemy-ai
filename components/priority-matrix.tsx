"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, X, ArrowUp, ArrowRight, ArrowDown, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Priority = "high" | "medium" | "low"
type Urgency = "urgent" | "important" | "optional"

interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  urgency: Urgency
}

export function PriorityMatrix() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      description: "Finish the draft by EOD",
      priority: "high",
      urgency: "urgent",
    },
    {
      id: "2",
      title: "Review team metrics",
      description: "Analyze last week's performance",
      priority: "high",
      urgency: "important",
    },
    {
      id: "3",
      title: "Update documentation",
      description: "Add new features to docs",
      priority: "medium",
      urgency: "important",
    },
    {
      id: "4",
      title: "Schedule team meeting",
      description: "Plan for next sprint",
      priority: "medium",
      urgency: "urgent",
    },
    {
      id: "5",
      title: "Research new tools",
      description: "Look for productivity improvements",
      priority: "low",
      urgency: "important",
    },
    { id: "6", title: "Clean up email inbox", description: "Archive old emails", priority: "low", urgency: "optional" },
  ])
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    priority: "medium",
    urgency: "important",
  })

  const addTask = () => {
    if (!newTask.title) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      })
      return
    }

    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      urgency: "important",
    })
    setNewTaskOpen(false)

    toast({
      title: "Task added",
      description: "Your task has been added to the priority matrix",
    })
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
    toast({
      title: "Task removed",
      description: "Your task has been removed from the priority matrix",
    })
  }

  const getTasksByQuadrant = (priority: Priority[], urgency: Urgency[]) => {
    return tasks.filter((task) => priority.includes(task.priority) && urgency.includes(task.urgency))
  }

  const renderQuadrant = (
    title: string,
    icon: React.ReactNode,
    priority: Priority[],
    urgency: Urgency[],
    color: string,
  ) => {
    const quadrantTasks = getTasksByQuadrant(priority, urgency)

    return (
      <div className={`border rounded-lg p-4 ${color}`}>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="space-y-2">
          {quadrantTasks.length > 0 ? (
            quadrantTasks.map((task) => (
              <div key={task.id} className="bg-background rounded-md p-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">No tasks</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Eisenhower Priority Matrix</CardTitle>
          <Button size="sm" onClick={() => setNewTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="matrix">
          <TabsList className="mb-4">
            <TabsTrigger value="matrix">Matrix View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix">
            <div className="grid grid-cols-2 gap-4">
              {renderQuadrant(
                "Do First (Urgent & Important)",
                <ArrowUp className="h-4 w-4 text-red-500" />,
                ["high"],
                ["urgent", "important"],
                "bg-red-50 dark:bg-red-950/20",
              )}

              {renderQuadrant(
                "Schedule (Important, Not Urgent)",
                <ArrowRight className="h-4 w-4 text-blue-500" />,
                ["medium", "high"],
                ["important"],
                "bg-blue-50 dark:bg-blue-950/20",
              )}

              {renderQuadrant(
                "Delegate (Urgent, Not Important)",
                <ArrowDown className="h-4 w-4 text-yellow-500" />,
                ["low", "medium"],
                ["urgent"],
                "bg-yellow-50 dark:bg-yellow-950/20",
              )}

              {renderQuadrant(
                "Eliminate (Not Urgent or Important)",
                <ArrowLeft className="h-4 w-4 text-gray-500" />,
                ["low"],
                ["optional"],
                "bg-gray-50 dark:bg-gray-800/20",
              )}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-2">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            task.priority === "high"
                              ? "bg-red-500"
                              : task.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        />
                        <h4 className="font-medium">{task.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">{task.priority} priority</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">{task.urgency}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">No tasks added yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as Priority })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={newTask.urgency}
                  onValueChange={(value) => setNewTask({ ...newTask, urgency: value as Urgency })}
                >
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
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
