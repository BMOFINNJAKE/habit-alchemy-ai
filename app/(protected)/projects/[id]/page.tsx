"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Calendar,
  Share,
  Trash2,
  Play,
  Pause,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Clock,
  CheckCircle,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useProjectStore } from "@/lib/project-service"
import { useSessionStore } from "@/lib/session-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProjectStatus, ProjectType, Task, ProjectNote } from "@/lib/project-service"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.id as string

  const {
    getProjectById,
    getTasksByProjectId,
    getNotesByProjectId,
    updateProject,
    deleteProject,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    addNote,
    deleteNote,
  } = useProjectStore()

  const {
    activeSession,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    getProjectTotalTime,
    getFormattedProjectTime,
  } = useSessionStore()

  const [project, setProject] = useState(getProjectById(projectId))
  const [tasks, setTasks] = useState(getTasksByProjectId(projectId))
  const [notes, setNotes] = useState(getNotesByProjectId(projectId))
  const [activeTab, setActiveTab] = useState("overview")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [progressValue, setProgressValue] = useState(project?.progress || 0)
  const [timeLogged, setTimeLogged] = useState(getFormattedProjectTime(projectId))
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskFilter, setTaskFilter] = useState("all")
  const [editProject, setEditProject] = useState({
    title: project?.title || "",
    description: project?.description || "",
    type: project?.type || ("Design" as ProjectType),
    status: project?.status || ("On track" as ProjectStatus),
    deadline: project?.deadline || "",
  })
  const [sessionElapsedTime, setSessionElapsedTime] = useState(0)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Update local state when project or tasks change
  useEffect(() => {
    const updatedProject = getProjectById(projectId)
    const updatedTasks = getTasksByProjectId(projectId)
    const updatedNotes = getNotesByProjectId(projectId)

    setProject(updatedProject)
    setTasks(updatedTasks)
    setNotes(updatedNotes)

    if (updatedProject) {
      setProgressValue(updatedProject.progress)
      setEditProject({
        title: updatedProject.title,
        description: updatedProject.description,
        type: updatedProject.type,
        status: updatedProject.status,
        deadline: updatedProject.deadline || "",
      })
    }
  }, [projectId, getProjectById, getTasksByProjectId, getNotesByProjectId])

  // Update time logged and session time
  useEffect(() => {
    const interval = setInterval(() => {
      // Update time logged
      setTimeLogged(getFormattedProjectTime(projectId))

      // Update current session time
      if (activeSession.projectId === projectId) {
        if (activeSession.isRunning) {
          const now = Date.now()
          const currentSessionTime = now - activeSession.startTime
          setSessionElapsedTime(currentSessionTime)
        } else {
          setSessionElapsedTime(activeSession.elapsedTime)
        }
      } else {
        setSessionElapsedTime(0)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [projectId, getFormattedProjectTime, activeSession])

  if (!project) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <p className="text-muted-foreground">The project you're looking for doesn't exist or has been deleted.</p>
        <Button className="mt-4" onClick={() => router.push("/projects")}>
          Back to Projects
        </Button>
      </div>
    )
  }

  const handleUpdateProgress = () => {
    updateProject(projectId, { progress: progressValue })

    toast({
      title: "Progress updated",
      description: `Project progress set to ${progressValue}%`,
    })
  }

  const handleIncreaseProgress = () => {
    const newValue = Math.min(progressValue + 5, 100)
    setProgressValue(newValue)
  }

  const handleDecreaseProgress = () => {
    const newValue = Math.max(progressValue - 5, 0)
    setProgressValue(newValue)
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    const taskId = addTask({
      projectId,
      title: newTaskTitle,
      completed: false,
    })

    // Update local state immediately
    const newTask: Task = {
      id: taskId,
      projectId,
      title: newTaskTitle,
      completed: false,
      createdAt: Date.now(),
    }

    setTasks((prevTasks) => [...prevTasks, newTask])
    setNewTaskTitle("")

    toast({
      title: "Task added",
      description: "New task has been added to the project",
    })
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const noteId = addNote({
      projectId,
      content: newNote,
    })

    // Update local state immediately
    const now = Date.now()
    const newNoteObj: ProjectNote = {
      id: noteId,
      projectId,
      content: newNote,
      createdAt: now,
      updatedAt: now,
    }

    setNotes((prevNotes) => [...prevNotes, newNoteObj])
    setNewNote("")
    setIsAddingNote(false)

    toast({
      title: "Note added",
      description: "New note has been added to the project",
    })
  }

  const handleDeleteProject = () => {
    deleteProject(projectId)
    setDeleteDialogOpen(false)
    router.push("/projects")

    toast({
      title: "Project deleted",
      description: "The project has been permanently deleted",
    })
  }

  const handleSetDeadline = (deadline: string) => {
    updateProject(projectId, { deadline })

    toast({
      title: "Deadline updated",
      description: "Project deadline has been updated",
    })
  }

  const handleEditProject = () => {
    updateProject(projectId, editProject)
    setEditDialogOpen(false)

    toast({
      title: "Project updated",
      description: "Project details have been updated",
    })
  }

  const isSessionActive = activeSession.isRunning && activeSession.projectId === projectId

  const handleSessionAction = () => {
    if (isSessionActive) {
      pauseSession()
      toast({
        title: "Session paused",
        description: "Your work session has been paused",
      })
    } else if (activeSession.projectId === projectId && !activeSession.isRunning) {
      resumeSession()
      toast({
        title: "Session resumed",
        description: "Your work session has been resumed",
      })
    } else {
      if (activeSession.projectId) {
        endSession()
      }
      startSession(projectId, project.title)
      toast({
        title: "Session started",
        description: "Your work session has started",
      })
    }
  }

  // Format time for display
  const formatSessionTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "all") return true
    if (taskFilter === "active") return !task.completed
    if (taskFilter === "completed") return task.completed
    return true
  })

  const handleToggleTaskCompletion = (taskId: string) => {
    toggleTaskCompletion(taskId)

    // Update local state immediately
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed, completedAt: !task.completed ? Date.now() : undefined }
          : task,
      ),
    )
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)

    // Update local state immediately
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))

    toast({
      title: "Task deleted",
      description: "The task has been removed from the project",
    })
  }

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId)

    // Update local state immediately
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId))

    toast({
      title: "Note deleted",
      description: "The note has been removed from the project",
    })
  }

  // Sidebar component for the right column
  const SidebarContent = () => (
    <div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Current Session</h2>

          {isSessionActive || (activeSession.projectId === projectId && !activeSession.isRunning) ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${isSessionActive ? "bg-green-100 text-green-500" : "bg-yellow-100 text-yellow-500"}`}
              >
                <Clock className="h-8 w-8" />
              </div>
              <p className="text-sm mb-2">{isSessionActive ? "Session in progress" : "Session paused"}</p>
              <p className="text-xl font-bold mb-4">{formatSessionTime(sessionElapsedTime)}</p>
              <Button className="w-full" onClick={handleSessionAction}>
                {isSessionActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Session
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Session
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">No active session</p>
              <Button className="w-full" onClick={handleSessionAction}>
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Set Deadline
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Set Project Deadline</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="deadline" className="text-sm font-medium">
                      Deadline Date
                    </label>
                    <Input id="deadline" type="date" defaultValue={project.deadline || ""} />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      const deadlineInput = document.getElementById("deadline") as HTMLInputElement
                      if (deadlineInput) {
                        handleSetDeadline(deadlineInput.value)
                      }
                    }}
                  >
                    Save Deadline
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                toast({
                  title: "Share Project",
                  description: "Project sharing functionality would open here",
                })
              }}
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-red-500 hover:text-red-500"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="text-muted-foreground ml-2">{project.description}</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="col-span-2">
            <TabsContent value="overview">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Project Progress</h2>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={handleDecreaseProgress} className="h-6 w-6 p-0">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <span className="mx-2">{progressValue}%</span>
                        <Button variant="ghost" size="icon" onClick={handleIncreaseProgress} className="h-6 w-6 p-0">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            project.status === "On track"
                              ? "bg-green-500"
                              : project.status === "Needs attention"
                                ? "bg-yellow-500"
                                : project.status === "At risk"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                          } mr-2`}
                        ></div>
                        <span>{project.status}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Type</div>
                      <div>{project.type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Deadline</div>
                      <div className="text-red-500">{project.deadline || "Not set"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Time Logged</div>
                      <div>{timeLogged}</div>
                    </div>
                  </div>

                  <Button onClick={handleUpdateProgress}>Update</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Tasks</h2>
                    <div className="flex gap-2">
                      <Select value={taskFilter} onValueChange={setTaskFilter}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Filter tasks" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tasks</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add new task..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="w-64"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddTask()
                            }
                          }}
                        />
                        <Button size="sm" onClick={handleAddTask}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {filteredTasks.length > 0 ? (
                    <div className="space-y-2">
                      {filteredTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => handleToggleTaskCompletion(task.id)}
                              id={`task-${task.id}`}
                            />
                            <label
                              htmlFor={`task-${task.id}`}
                              className={task.completed ? "line-through text-muted-foreground" : ""}
                            >
                              {task.title}
                            </label>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-muted p-6 mb-4">
                        <CheckCircle className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        {taskFilter === "all"
                          ? "No tasks yet"
                          : taskFilter === "active"
                            ? "No active tasks"
                            : "No completed tasks"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {taskFilter === "all"
                          ? "Add your first task to get started."
                          : taskFilter === "active"
                            ? "All tasks are completed."
                            : "Complete some tasks to see them here."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Project Notes</h2>
                    <Button size="sm" onClick={() => setIsAddingNote(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Note
                    </Button>
                  </div>

                  {isAddingNote && (
                    <div className="mb-6 border rounded-md p-4">
                      <Textarea
                        placeholder="Write your note here..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-[100px] mb-4"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingNote(false)
                            setNewNote("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddNote}>Save Note</Button>
                      </div>
                    </div>
                  )}

                  {notes.length > 0 ? (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="p-4 border rounded-md relative group">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="text-sm text-muted-foreground mb-1">
                            {new Date(note.createdAt).toLocaleString()}
                          </div>
                          <div className="whitespace-pre-wrap">{note.content}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-muted p-6 mb-4">
                        <div className="h-12 w-12 text-muted-foreground">📝</div>
                      </div>
                      <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Create your first note to get started.</p>
                      <Button onClick={() => setIsAddingNote(true)}>Create Note</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-assistant">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Project AI Assistant</h2>
                  <p className="text-muted-foreground mb-4">
                    Ask questions about your project, get suggestions, or generate content related to this project.
                  </p>

                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <div className="h-12 w-12 text-muted-foreground">🤖</div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">AI Assistant</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      How can I help with your {project.title} project today?
                    </p>
                    <Button onClick={() => router.push("/ai-assistant")}>Open AI Assistant</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div>
            <SidebarContent />
          </div>
        </div>
      </Tabs>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Project Title</Label>
              <Input
                id="edit-title"
                value={editProject.title}
                onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editProject.description}
                onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Project Type</Label>
                <Select
                  value={editProject.type}
                  onValueChange={(value) => setEditProject({ ...editProject, type: value as ProjectType })}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editProject.status}
                  onValueChange={(value) => setEditProject({ ...editProject, status: value as ProjectStatus })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On track">On track</SelectItem>
                    <SelectItem value="Needs attention">Needs attention</SelectItem>
                    <SelectItem value="At risk">At risk</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-deadline">Deadline</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={editProject.deadline}
                onChange={(e) => setEditProject({ ...editProject, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this project? This action cannot be undone and all project data will be
              permanently lost.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
