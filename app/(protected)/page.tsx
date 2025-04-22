"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { DailyChecklist } from "@/components/daily-checklist"
import { DashboardCard } from "@/components/dashboard-card"
import { useRouter } from "next/navigation"
import { useProjectStore } from "@/lib/project-service"
import { useSessionStore } from "@/lib/session-service"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProjectStatus, ProjectType } from "@/lib/project-service"
import { Plus, Trash2 } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function Dashboard() {
  const router = useRouter()
  const { projects, addProject, resetAllData } = useProjectStore()
  const { getTodayTotalTime, getWeekTotalTime, resetAllData: resetSessionData } = useSessionStore()
  const { toast } = useToast()

  const [focusTime, setFocusTime] = useState(0)
  const [weeklyFocusTime, setWeeklyFocusTime] = useState(0)
  const [productivityScore, setProductivityScore] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [quickTasks, setQuickTasks] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: "1", text: "Review project deadlines", completed: false },
    { id: "2", text: "Prepare for tomorrow's meeting", completed: false },
    { id: "3", text: "Update task priorities", completed: false },
  ])
  const [newQuickTask, setNewQuickTask] = useState("")

  // New project form state
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    type: "Design" as ProjectType,
    status: "On track" as ProjectStatus,
    deadline: "",
  })

  // Update focus time and productivity score every second
  useEffect(() => {
    const interval = setInterval(() => {
      const todayTime = getTodayTotalTime()
      const weekTime = getWeekTotalTime()
      setFocusTime(todayTime)
      setWeeklyFocusTime(weekTime)

      // Calculate productivity score based on focus time and project progress
      const timeScore = Math.min(todayTime / (1000 * 60 * 60 * 3), 1) // 3 hours max
      const projectScore =
        projects.length > 0 ? projects.reduce((sum, project) => sum + project.progress, 0) / (projects.length * 100) : 0

      const score = Math.round((timeScore * 0.6 + projectScore * 0.4) * 100)
      setProductivityScore(score)
    }, 1000)

    return () => clearInterval(interval)
  }, [getTodayTotalTime, getWeekTotalTime, projects])

  // Format time for display
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // Get active projects
  const activeProjects = projects.filter((p) => p.progress < 100)
  const onTrackProjects = activeProjects.filter((p) => p.status === "On track")

  // Get recent projects (limit to 3)
  const recentProjects = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3)

  const handleCreateProject = () => {
    if (!newProject.title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      })
      return
    }

    const projectId = addProject({
      title: newProject.title,
      description: newProject.description || "No description provided",
      progress: 0,
      status: newProject.status,
      deadline: newProject.deadline || null,
      type: newProject.type,
      files: 0,
    })

    toast({
      title: "Project created",
      description: `${newProject.title} has been created successfully.`,
    })

    // Reset form
    setNewProject({
      title: "",
      description: "",
      type: "Design",
      status: "On track",
      deadline: "",
    })

    // Close dialog
    setCreateDialogOpen(false)

    // Navigate to the new project
    router.push(`/projects/${projectId}`)
  }

  const handleResetAllData = () => {
    resetAllData()
    resetSessionData()
    setResetDialogOpen(false)

    toast({
      title: "Data reset",
      description: "All project data and statistics have been reset to zero.",
    })
  }

  const handleAddQuickTask = () => {
    if (!newQuickTask.trim()) return

    setQuickTasks([...quickTasks, { id: Date.now().toString(), text: newQuickTask, completed: false }])
    setNewQuickTask("")

    toast({
      title: "Task added",
      description: "Quick task has been added to your list.",
    })
  }

  const toggleQuickTask = (id: string) => {
    setQuickTasks(quickTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteQuickTask = (id: string) => {
    setQuickTasks(quickTasks.filter((task) => task.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here's your productivity overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setResetDialogOpen(true)}>
            Reset Data
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard
          title="Productivity Score"
          value={`${productivityScore}%`}
          icon="productivity"
          change={weeklyFocusTime > 0 ? 5 : 0}
          onClick={() => {
            toast({
              title: "Productivity Score",
              description: "Your productivity score is calculated based on your focus time and project progress.",
            })
          }}
        />

        <DashboardCard
          title="Focus Time Today"
          value={formatTime(focusTime)}
          icon="focus"
          change={focusTime > 0 ? 10 : 0}
        />

        <DashboardCard
          title="Active Projects"
          value={`${onTrackProjects.length} / ${activeProjects.length} on track`}
          icon="projects"
        />

        <DashboardCard title="Current Session" value="No active session" icon="session" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Pomodoro Timer</h2>
            </div>
            <PomodoroTimer />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <CalendarComponent mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            {date && (
              <div className="mt-4">
                <h3 className="text-sm font-medium">Selected: {format(date, "PPP")}</h3>
                {projects.filter((p) => p.deadline === format(date, "yyyy-MM-dd")).length > 0 ? (
                  <div className="mt-2">
                    <h4 className="text-xs text-muted-foreground mb-2">Project Deadlines:</h4>
                    <ul className="space-y-1">
                      {projects
                        .filter((p) => p.deadline === format(date, "yyyy-MM-dd"))
                        .map((project) => (
                          <li key={project.id} className="text-sm flex items-center">
                            <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                            <span>{project.title}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No deadlines on this date</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent">
              <TabsList className="mb-4">
                <TabsTrigger value="recent">Recent Projects</TabsTrigger>
                <TabsTrigger value="tasks">Quick Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="recent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.length > 0 ? (
                    recentProjects.map((project) => (
                      <div
                        key={project.id}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              project.status === "On track"
                                ? "bg-green-500"
                                : project.status === "Needs attention"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                          <h3 className="font-medium">{project.title}</h3>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{project.type}</span>
                          <span>{project.progress}% complete</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-muted-foreground mb-4">No projects yet</p>
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </div>
                  )}
                </div>
                {recentProjects.length > 0 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => router.push("/projects")}>
                      View All Projects
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tasks">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a quick task..."
                      value={newQuickTask}
                      onChange={(e) => setNewQuickTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddQuickTask()
                      }}
                    />
                    <Button onClick={handleAddQuickTask}>Add</Button>
                  </div>

                  <div className="space-y-2">
                    {quickTasks.length > 0 ? (
                      quickTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleQuickTask(task.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                              {task.text}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => deleteQuickTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No quick tasks yet</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Daily Checklist</h2>
            </div>
            <DailyChecklist />
          </CardContent>
        </Card>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="Enter project title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Enter project description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Project Type</Label>
                <Select
                  value={newProject.type}
                  onValueChange={(value) => setNewProject({ ...newProject, type: value as ProjectType })}
                >
                  <SelectTrigger id="type">
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({ ...newProject, status: value as ProjectStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On track">On track</SelectItem>
                    <SelectItem value="Needs attention">Needs attention</SelectItem>
                    <SelectItem value="At risk">At risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Data Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reset All Data</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to reset all project data and statistics? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetAllData}>
              Reset All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
