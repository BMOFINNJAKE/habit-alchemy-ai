"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Calendar, Sparkles, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useProjectStore, type ProjectType, type ProjectStatus } from "@/lib/project-service"
import { ProjectCard } from "@/components/project-card"
import { useSessionStore } from "@/lib/session-service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [useAI, setUseAI] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    tasks: { title: string; completed: boolean }[]
    notes: { content: string }[]
  } | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const {
    projects,
    addProject,
    addTask,
    addNote,
    fetchUserData,
    isLoading: storeLoading,
    initialized,
  } = useProjectStore()
  const { getFormattedProjectTime, userId } = useSessionStore()

  // New project form state
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    type: "Design" as ProjectType,
    status: "On track" as ProjectStatus,
    deadline: "",
  })

  // Fetch user data on component mount
  useEffect(() => {
    if (!initialized) {
      fetchUserData().catch((error) => {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        })
      })
    }
    setIsLoading(false)
  }, [fetchUserData, initialized, toast])

  // Refresh project data periodically
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (userId) {
        fetchUserData().catch(console.error)
      }
    }, 60000) // Refresh every minute

    return () => clearInterval(refreshInterval)
  }, [userId, fetchUserData])

  const filteredProjects = projects.filter((project) => {
    // Filter by search query
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by status
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && project.progress < 100) ||
      (filterStatus === "completed" && project.progress === 100) ||
      (filterStatus === "on-track" && project.status === "On track") ||
      (filterStatus === "needs-attention" && project.status === "Needs attention") ||
      (filterStatus === "at-risk" && project.status === "At risk")

    return matchesSearch && matchesStatus
  })

  const handleGenerateAIContent = () => {
    if (!newProject.title || !newProject.description) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and description for your project.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate AI generation with a timeout
    setTimeout(() => {
      // Generate tasks based on project type and description
      const generatedTasks = generateTasksBasedOnProject(newProject.type, newProject.description)

      // Generate notes based on project type and description
      const generatedNotes = generateNotesBasedOnProject(newProject.type, newProject.description)

      setGeneratedContent({
        tasks: generatedTasks,
        notes: generatedNotes,
      })

      setIsGenerating(false)
    }, 2000)
  }

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const projectId = await addProject({
        title: newProject.title,
        description: newProject.description || "No description provided",
        progress: 0,
        status: newProject.status,
        deadline: newProject.deadline || null,
        type: newProject.type,
        files: 0,
      })

      // Add generated tasks if AI was used
      if (useAI && generatedContent) {
        for (const task of generatedContent.tasks) {
          await addTask({
            projectId,
            title: task.title,
            completed: false,
          })
        }

        // Add generated notes if AI was used
        for (const note of generatedContent.notes) {
          await addNote({
            projectId,
            content: note.content,
          })
        }
      }

      toast({
        title: "Project created",
        description: useAI
          ? `${newProject.title} has been created with AI-generated tasks and notes.`
          : `${newProject.title} has been created successfully.`,
      })

      // Reset form
      setNewProject({
        title: "",
        description: "",
        type: "Design",
        status: "On track",
        deadline: "",
      })
      setUseAI(false)
      setGeneratedContent(null)

      // Close dialog
      setCreateDialogOpen(false)

      // Navigate to the new project
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and organize all your projects</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="needs-attention">Needs Attention</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading || storeLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              progress={project.progress}
              status={project.status}
              deadline={project.deadline || "Not set"}
              timeLogged={getFormattedProjectTime(project.id)}
              files={project.files}
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="text-sm text-muted-foreground">Time logged: {getFormattedProjectTime(project.id)}</div>
            </ProjectCard>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">No projects found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "No projects match your search criteria." : "Create your first project to get started."}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
                rows={4}
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

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="use-ai" checked={useAI} onCheckedChange={setUseAI} />
              <Label htmlFor="use-ai" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Use Smart Template (AI)
              </Label>
            </div>

            {useAI && (
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">
                  AI will analyze your project description and generate relevant tasks and notes to help you get started
                  quickly.
                </p>
                {generatedContent ? (
                  <Tabs defaultValue="tasks" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="tasks">Tasks ({generatedContent.tasks.length})</TabsTrigger>
                      <TabsTrigger value="notes">Notes ({generatedContent.notes.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tasks" className="max-h-[200px] overflow-y-auto">
                      <ul className="space-y-1">
                        {generatedContent.tasks.map((task, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                            {task.title}
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="notes" className="max-h-[200px] overflow-y-auto">
                      <div className="space-y-2">
                        {generatedContent.notes.map((note, index) => (
                          <div key={index} className="text-sm border-l-2 border-primary pl-2">
                            {note.content.substring(0, 100)}...
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleGenerateAIContent}
                    disabled={isGenerating || !newProject.title || !newProject.description}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Tasks & Notes
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper functions to generate content based on project type and description
function generateTasksBasedOnProject(projectType: string, description: string) {
  const commonTasks = [
    { title: "Project kickoff meeting", completed: false },
    { title: "Define project scope and objectives", completed: false },
    { title: "Create project timeline", completed: false },
    { title: "Set up project documentation", completed: false },
  ]

  const typeTasks: Record<string, { title: string; completed: boolean }[]> = {
    Design: [
      { title: "Research design inspiration", completed: false },
      { title: "Create mood board", completed: false },
      { title: "Design wireframes", completed: false },
      { title: "Create high-fidelity mockups", completed: false },
      { title: "Conduct user testing", completed: false },
      { title: "Finalize design assets", completed: false },
    ],
    Development: [
      { title: "Set up development environment", completed: false },
      { title: "Create project architecture", completed: false },
      { title: "Implement core functionality", completed: false },
      { title: "Write unit tests", completed: false },
      { title: "Perform code review", completed: false },
      { title: "Deploy to staging environment", completed: false },
    ],
    Content: [
      { title: "Research topic and keywords", completed: false },
      { title: "Create content outline", completed: false },
      { title: "Write first draft", completed: false },
      { title: "Edit and revise content", completed: false },
      { title: "Add images and media", completed: false },
      { title: "Publish and promote content", completed: false },
    ],
    Research: [
      { title: "Define research questions", completed: false },
      { title: "Develop research methodology", completed: false },
      { title: "Collect data", completed: false },
      { title: "Analyze findings", completed: false },
      { title: "Create research report", completed: false },
      { title: "Present research findings", completed: false },
    ],
    Marketing: [
      { title: "Define target audience", completed: false },
      { title: "Develop marketing strategy", completed: false },
      { title: "Create marketing assets", completed: false },
      { title: "Launch campaign", completed: false },
      { title: "Monitor campaign performance", completed: false },
      { title: "Analyze results and optimize", completed: false },
    ],
  }

  // Combine common tasks with type-specific tasks
  return [...commonTasks, ...(typeTasks[projectType] || [])]
}

function generateNotesBasedOnProject(projectType: string, description: string) {
  const notes = [
    {
      content: `# Project Overview\n\nThis ${projectType.toLowerCase()} project aims to ${description.substring(0, 100)}${description.length > 100 ? "..." : ""}\n\n## Key Objectives\n- Deliver high-quality results\n- Meet project deadlines\n- Ensure stakeholder satisfaction`,
    },
  ]

  const typeNotes: Record<string, { content: string }[]> = {
    Design: [
      {
        content:
          "## Design Inspiration\n\nSome key design principles to consider for this project:\n- Focus on user experience\n- Maintain consistent visual language\n- Ensure accessibility standards are met\n- Consider responsive design for all devices",
      },
    ],
    Development: [
      {
        content:
          "## Technical Considerations\n\n- Ensure code quality and maintainability\n- Follow best practices for security\n- Implement proper error handling\n- Document API endpoints and functions\n- Consider scalability from the beginning",
      },
    ],
    Content: [
      {
        content:
          "## Content Strategy\n\n- Focus on providing value to the target audience\n- Maintain consistent tone and voice\n- Incorporate relevant keywords for SEO\n- Structure content for readability\n- Include compelling calls to action",
      },
    ],
    Research: [
      {
        content:
          "## Research Methodology\n\n- Define clear research questions\n- Use a mix of qualitative and quantitative methods\n- Ensure data collection is unbiased\n- Document all sources and methodologies\n- Consider ethical implications of research",
      },
    ],
    Marketing: [
      {
        content:
          "## Marketing Strategy\n\n- Define clear KPIs for campaign success\n- Focus on target audience needs and pain points\n- Create compelling messaging that resonates\n- Test different approaches and optimize\n- Track and analyze results regularly",
      },
    ],
  }

  return [...notes, ...(typeNotes[projectType] || [])]
}
