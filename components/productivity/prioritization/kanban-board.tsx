"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, MoreVertical } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type KanbanStatus = "todo" | "inProgress" | "review" | "done"

type KanbanTask = {
  id: string
  title: string
  description: string
  status: KanbanStatus
  createdAt: Date
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<KanbanTask[]>([])
  const [newTask, setNewTask] = useState<Partial<KanbanTask>>({
    title: "",
    description: "",
    status: "todo",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("kanbanTasks")
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
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks))
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

    const task: KanbanTask = {
      id: crypto.randomUUID(),
      title: newTask.title || "",
      description: newTask.description || "",
      status: (newTask.status as KanbanStatus) || "todo",
      createdAt: new Date(),
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      status: "todo",
    })
    setIsDialogOpen(false)

    toast({
      title: "Task added",
      description: "Your task has been added to the board",
    })
  }

  const handleMoveTask = (taskId: string, newStatus: KanbanStatus) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
    toast({
      title: "Task deleted",
      description: "Your task has been removed from the board",
    })
  }

  const getTasksByStatus = (status: KanbanStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  const renderColumn = (title: string, status: KanbanStatus, bgColor: string) => {
    const columnTasks = getTasksByStatus(status)

    return (
      <div className={`${bgColor} rounded-lg p-4 min-h-[500px]`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">{title}</h3>
          <span className="bg-white dark:bg-gray-800 text-xs px-2 py-1 rounded-full">{columnTasks.length}</span>
        </div>

        <div className="space-y-3">
          {columnTasks.map((task) => (
            <Card key={task.id} className="bg-white dark:bg-gray-800">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {status !== "todo" && (
                        <DropdownMenuItem onClick={() => handleMoveTask(task.id, "todo")}>
                          Move to Todo
                        </DropdownMenuItem>
                      )}
                      {status !== "inProgress" && (
                        <DropdownMenuItem onClick={() => handleMoveTask(task.id, "inProgress")}>
                          Move to In Progress
                        </DropdownMenuItem>
                      )}
                      {status !== "review" && (
                        <DropdownMenuItem onClick={() => handleMoveTask(task.id, "review")}>
                          Move to Review
                        </DropdownMenuItem>
                      )}
                      {status !== "done" && (
                        <DropdownMenuItem onClick={() => handleMoveTask(task.id, "done")}>
                          Move to Done
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-500 dark:text-red-400"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Kanban Board</h3>

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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({ ...newTask, status: value as KanbanStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddTask} className="w-full">
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {renderColumn("Todo", "todo", "bg-gray-50 dark:bg-gray-800/50")}
        {renderColumn("In Progress", "inProgress", "bg-blue-50 dark:bg-blue-950/30")}
        {renderColumn("Review", "review", "bg-yellow-50 dark:bg-yellow-950/30")}
        {renderColumn("Done", "done", "bg-green-50 dark:bg-green-950/30")}
      </div>
    </div>
  )
}
