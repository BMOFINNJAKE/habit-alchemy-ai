"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

type Task = {
  id: string
  title: string
  description: string
  quadrant: "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important"
  createdAt: Date
}

export default function EisenhowerMatrix() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    quadrant: "urgent-important",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("eisenhowerTasks")
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (e) {
        console.error("Failed to parse saved tasks", e)
      }
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("eisenhowerTasks", JSON.stringify(tasks))
  }, [tasks])

  const handleAddTask = () => {
    if (!newTask.title) {
      toast({
        title: "Task title required",
        description: "Please enter a title for your task",
        variant: "destructive",
      })
      return
    }

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.title || "",
      description: newTask.description || "",
      quadrant: (newTask.quadrant as Task["quadrant"]) || "urgent-important",
      createdAt: new Date(),
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      quadrant: "urgent-important",
    })
    setIsDialogOpen(false)

    toast({
      title: "Task added",
      description: "Your task has been added to the matrix",
    })
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
    toast({
      title: "Task deleted",
      description: "Your task has been removed from the matrix",
    })
  }

  const getTasksByQuadrant = (quadrant: Task["quadrant"]) => {
    return tasks.filter((task) => task.quadrant === quadrant)
  }

  const renderQuadrant = (title: string, description: string, quadrant: Task["quadrant"], bgColor: string) => {
    const quadrantTasks = getTasksByQuadrant(quadrant)

    return (
      <Card className={`${bgColor} h-[300px] overflow-auto`}>
        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-2">
            {quadrantTasks.map((task) => (
              <Card key={task.id} className="bg-white dark:bg-gray-800 p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="h-6 w-6 p-0">
                    ×
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Eisenhower Matrix</h3>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Quadrant</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={newTask.quadrant === "urgent-important" ? "default" : "outline"}
                    onClick={() => setNewTask({ ...newTask, quadrant: "urgent-important" })}
                    className="justify-start h-auto py-2"
                  >
                    <div className="text-left">
                      <div className="font-medium">Urgent & Important</div>
                      <div className="text-xs">Do First</div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant={newTask.quadrant === "not-urgent-important" ? "default" : "outline"}
                    onClick={() => setNewTask({ ...newTask, quadrant: "not-urgent-important" })}
                    className="justify-start h-auto py-2"
                  >
                    <div className="text-left">
                      <div className="font-medium">Not Urgent & Important</div>
                      <div className="text-xs">Schedule</div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant={newTask.quadrant === "urgent-not-important" ? "default" : "outline"}
                    onClick={() => setNewTask({ ...newTask, quadrant: "urgent-not-important" })}
                    className="justify-start h-auto py-2"
                  >
                    <div className="text-left">
                      <div className="font-medium">Urgent & Not Important</div>
                      <div className="text-xs">Delegate</div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant={newTask.quadrant === "not-urgent-not-important" ? "default" : "outline"}
                    onClick={() => setNewTask({ ...newTask, quadrant: "not-urgent-not-important" })}
                    className="justify-start h-auto py-2"
                  >
                    <div className="text-left">
                      <div className="font-medium">Not Urgent & Not Important</div>
                      <div className="text-xs">Eliminate</div>
                    </div>
                  </Button>
                </div>
              </div>

              <Button onClick={handleAddTask} className="w-full">
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderQuadrant("Do First", "Urgent & Important", "urgent-important", "bg-red-50 dark:bg-red-950/30")}

        {renderQuadrant(
          "Schedule",
          "Not Urgent & Important",
          "not-urgent-important",
          "bg-green-50 dark:bg-green-950/30",
        )}

        {renderQuadrant(
          "Delegate",
          "Urgent & Not Important",
          "urgent-not-important",
          "bg-yellow-50 dark:bg-yellow-950/30",
        )}

        {renderQuadrant(
          "Eliminate",
          "Not Urgent & Not Important",
          "not-urgent-not-important",
          "bg-gray-50 dark:bg-gray-800/50",
        )}
      </div>
    </div>
  )
}
