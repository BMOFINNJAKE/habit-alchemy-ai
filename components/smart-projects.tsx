"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Brain, Sparkles, Check, X } from "lucide-react"
import { useProjectStore } from "@/lib/project-service"
import { useToast } from "@/components/ui/use-toast"

export function SmartProjects() {
  const { toast } = useToast()
  const { addProject, addTask, addNote } = useProjectStore()

  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectType, setProjectType] = useState("Design")
  const [projectDeadline, setProjectDeadline] = useState("")
  const [useAI, setUseAI] = useState(true)

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    tasks: { title: string; completed: boolean }[]
    notes: { content: string }[]
  } | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleGenerateAIContent = () => {
    if (!projectTitle || !projectDescription) {
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
      const generatedTasks = generateTasksBasedOnProject(projectType, projectDescription)

      // Generate notes based on project type and description
      const generatedNotes = generateNotesBasedOnProject(projectType, projectDescription)

      setGeneratedContent({
        tasks: generatedTasks,
        notes: generatedNotes,
      })

      setIsGenerating(false)
      setIsDialogOpen(true)
    }, 2000)
  }

  const handleCreateProject = () => {
    if (!projectTitle) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your project.",
        variant: "destructive",
      })
      return
    }

    // Create the project
    const projectId = addProject({
      title: projectTitle,
      description: projectDescription,
      type: projectType as any,
      status: "On track",
      deadline: projectDeadline || undefined,
      progress: 0,
    })

    // Add generated tasks if AI was used
    if (useAI && generatedContent) {
      generatedContent.tasks.forEach((task) => {
        addTask({
          projectId,
          title: task.title,
          completed: false,
        })
      })

      // Add generated notes if AI was used
      generatedContent.notes.forEach((note) => {
        addNote({
          projectId,
          content: note.content,
        })
      })
    }

    toast({
      title: "Project created",
      description: useAI
        ? "Your project has been created with AI-generated tasks and notes."
        : "Your project has been created successfully.",
    })

    // Reset form
    setProjectTitle("")
    setProjectDescription("")
    setProjectType("Design")
    setProjectDeadline("")
    setGeneratedContent(null)
    setIsDialogOpen(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Smart Project</CardTitle>
        <CardDescription>
          Create a new project with AI-generated tasks and notes based on your description
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title</Label>
              <Input
                id="project-title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Enter project title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger id="project-type">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Project Description</Label>
            <Textarea
              id="project-description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe your project in detail to help the AI generate better tasks and notes"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-deadline">Deadline (Optional)</Label>
            <Input
              id="project-deadline"
              type="date"
              value={projectDeadline}
              onChange={(e) => setProjectDeadline(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch id="use-ai" checked={useAI} onCheckedChange={setUseAI} />
            <Label htmlFor="use-ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Use AI to generate tasks and notes
            </Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        {useAI ? (
          <Button onClick={handleGenerateAIContent} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate & Preview
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleCreateProject}>Create Project</Button>
        )}
      </CardFooter>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI-Generated Project Content</DialogTitle>
            <DialogDescription>Review the AI-generated tasks and notes for your project</DialogDescription>
          </DialogHeader>

          {generatedContent && (
            <Tabs defaultValue="tasks">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tasks">Tasks ({generatedContent.tasks.length})</TabsTrigger>
                <TabsTrigger value="notes">Notes ({generatedContent.notes.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2 p-2">
                  {generatedContent.tasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 border rounded-md">
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p>{task.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4 p-2">
                  {generatedContent.notes.map((note, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <p className="whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button onClick={handleCreateProject}>
              <Check className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
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
