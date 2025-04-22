"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import EisenhowerMatrix from "./eisenhower-matrix"
import TaskList from "./task-list"
import KanbanBoard from "./kanban-board"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function PrioritizationModule() {
  const [activeView, setActiveView] = useState("matrix")
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    status: "todo",
    quadrant: "urgent-important",
  })
  const { toast } = useToast()

  const handleAddTask = () => {
    if (!newTask.title) {
      toast({
        title: "Task title required",
        description: "Please enter a title for your task",
        variant: "destructive",
      })
      return
    }

    // Create a custom event to notify the active component about the new task
    const taskEvent = new CustomEvent("addNewTask", {
      detail: {
        ...newTask,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      },
    })

    document.dispatchEvent(taskEvent)

    // Reset form and close dialog
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      status: "todo",
      quadrant: "urgent-important",
    })

    setIsAddTaskDialogOpen(false)

    toast({
      title: "Task added",
      description: "Your task has been added successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Smart Task Prioritization</h2>
          <p className="text-sm text-muted-foreground">Organize and prioritize your tasks for maximum productivity</p>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex justify-end">
        <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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

              {activeView === "list" && (
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeView === "list" && (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              )}

              {activeView === "kanban" && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
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
              )}

              {activeView === "matrix" && (
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
              )}

              <Button onClick={handleAddTask} className="w-full">
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <TabsContent value="matrix" className="m-0">
        <EisenhowerMatrix />
      </TabsContent>

      <TabsContent value="list" className="m-0">
        <TaskList />
      </TabsContent>

      <TabsContent value="kanban" className="m-0">
        <KanbanBoard />
      </TabsContent>
    </div>
  )
}
