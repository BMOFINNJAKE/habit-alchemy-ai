"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CheckCircle, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Integration {
  id: string
  name: string
  description: string
  category: string
  icon: string
  isPopular: boolean
  isInstalled: boolean
  setupInstructions?: string
  apiKeyRequired?: boolean
  benefits?: string[]
  url?: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: "1",
    name: "Google Calendar",
    description: "Sync your calendar events and schedule",
    category: "Calendar",
    icon: "📅",
    isPopular: true,
    isInstalled: false,
    setupInstructions: "Connect your Google account to sync calendar events with your productivity schedule.",
    apiKeyRequired: false,
    benefits: [
      "Automatically import calendar events as time blocks",
      "Schedule focus sessions around meetings",
      "Get reminders for upcoming events",
      "Track meeting time vs. focus time",
    ],
    url: "https://calendar.google.com/",
  },
  {
    id: "2",
    name: "Notion",
    description: "Connect your Notion workspace",
    category: "Notes",
    icon: "📝",
    isPopular: true,
    isInstalled: false,
    setupInstructions: "Link your Notion account to sync notes, databases, and tasks.",
    apiKeyRequired: true,
    benefits: [
      "Import tasks from Notion databases",
      "Sync completed tasks between platforms",
      "Create notes during focus sessions",
      "Build a knowledge base of productivity insights",
    ],
    url: "https://www.notion.so/",
  },
  {
    id: "3",
    name: "Slack",
    description: "Get notifications and updates in Slack",
    category: "Communication",
    icon: "💬",
    isPopular: true,
    isInstalled: false,
    setupInstructions: "Connect your Slack workspace to receive notifications and updates.",
    apiKeyRequired: true,
    benefits: [
      "Get focus session summaries in Slack",
      "Share productivity insights with your team",
      "Set automatic status updates during focus time",
      "Receive daily productivity digests",
    ],
    url: "https://slack.com/",
  },
  {
    id: "4",
    name: "GitHub",
    description: "Track issues and pull requests",
    category: "Development",
    icon: "👨‍💻",
    isPopular: false,
    isInstalled: false,
    setupInstructions: "Connect your GitHub account to track development work and issues.",
    apiKeyRequired: true,
    benefits: [
      "Import GitHub issues as tasks",
      "Track time spent on different repositories",
      "Analyze coding productivity patterns",
      "Link focus sessions to specific issues or PRs",
    ],
    url: "https://github.com/",
  },
  {
    id: "5",
    name: "Trello",
    description: "Sync your Trello boards and cards",
    category: "Project Management",
    icon: "📋",
    isPopular: false,
    isInstalled: false,
    setupInstructions: "Link your Trello account to sync boards, lists, and cards.",
    apiKeyRequired: true,
    benefits: [
      "Import Trello cards as tasks",
      "Update card status based on focus sessions",
      "Track time spent on different boards",
      "Create time estimates for cards",
    ],
    url: "https://trello.com/",
  },
  {
    id: "6",
    name: "Todoist",
    description: "Import and sync your tasks",
    category: "Task Management",
    icon: "✅",
    isPopular: true,
    isInstalled: false,
    setupInstructions: "Connect your Todoist account to sync tasks and projects.",
    apiKeyRequired: true,
    benefits: [
      "Two-way sync of tasks and completion status",
      "Import Todoist projects as focus areas",
      "Schedule focus sessions based on task priority",
      "Track productivity across different projects",
    ],
    url: "https://todoist.com/",
  },
  {
    id: "7",
    name: "Asana",
    description: "Connect your Asana projects",
    category: "Project Management",
    icon: "🗂️",
    isPopular: false,
    isInstalled: false,
    setupInstructions: "Link your Asana account to sync projects, tasks, and assignments.",
    apiKeyRequired: true,
    benefits: [
      "Import Asana tasks into your workflow",
      "Update task status based on focus sessions",
      "Track time spent on different projects",
      "Analyze productivity by project or team",
    ],
    url: "https://asana.com/",
  },
  {
    id: "8",
    name: "Zapier",
    description: "Create automated workflows",
    category: "Automation",
    icon: "⚡",
    isPopular: true,
    isInstalled: false,
    setupInstructions: "Connect Zapier to create custom automations between your productivity app and other services.",
    apiKeyRequired: true,
    benefits: [
      "Create custom workflows between apps",
      "Automate task creation from emails or events",
      "Send focus session data to other platforms",
      "Build custom productivity reports",
    ],
    url: "https://zapier.com/",
  },
  {
    id: "9",
    name: "Evernote",
    description: "Sync your notes and notebooks",
    category: "Notes",
    icon: "📔",
    isPopular: false,
    isInstalled: false,
    setupInstructions: "Connect your Evernote account to sync notes and notebooks.",
    apiKeyRequired: true,
    benefits: [
      "Access notes during focus sessions",
      "Create session notes automatically",
      "Link tasks to reference materials",
      "Build a productivity knowledge base",
    ],
    url: "https://evernote.com/",
  },
  {
    id: "10",
    name: "Jira",
    description: "Track issues and projects",
    category: "Project Management",
    icon: "🔄",
    isPopular: false,
    isInstalled: false,
    setupInstructions: "Link your Jira account to sync issues, projects, and sprints.",
    apiKeyRequired: true,
    benefits: [
      "Import Jira issues as tasks",
      "Track time spent on different issues",
      "Update issue status based on focus sessions",
      "Analyze productivity by project or sprint",
    ],
    url: "https://www.atlassian.com/software/jira",
  },
]

const categories = [
  "All",
  "Calendar",
  "Notes",
  "Communication",
  "Development",
  "Project Management",
  "Task Management",
  "Automation",
]

export function IntegrationsMarketplace() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const { toast } = useToast()

  const handleInstall = (id: string) => {
    const integrationToUpdate = integrations.find((i) => i.id === id)

    if (integrationToUpdate && !integrationToUpdate.isInstalled) {
      // If not installed and requires API key, show setup dialog
      if (integrationToUpdate.apiKeyRequired) {
        setSelectedIntegration(integrationToUpdate)
        setSetupDialogOpen(true)
        return
      }
    }

    // Otherwise, toggle installation status
    setIntegrations((prevIntegrations) =>
      prevIntegrations.map((integration) =>
        integration.id === id ? { ...integration, isInstalled: !integration.isInstalled } : integration,
      ),
    )

    const updatedIntegration = integrations.find((i) => i.id === id)
    if (updatedIntegration) {
      toast({
        title: updatedIntegration.isInstalled
          ? `${updatedIntegration.name} disconnected`
          : `${updatedIntegration.name} connected`,
        description: updatedIntegration.isInstalled
          ? `${updatedIntegration.name} has been disconnected from your account.`
          : `${updatedIntegration.name} has been connected to your account.`,
      })
    }
  }

  const handleSetupComplete = () => {
    if (!selectedIntegration || !apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key to connect this integration.",
        variant: "destructive",
      })
      return
    }

    // Install the integration
    setIntegrations((prevIntegrations) =>
      prevIntegrations.map((integration) =>
        integration.id === selectedIntegration.id ? { ...integration, isInstalled: true } : integration,
      ),
    )

    toast({
      title: `${selectedIntegration.name} connected`,
      description: `${selectedIntegration.name} has been successfully connected to your account.`,
    })

    // Reset and close dialog
    setApiKey("")
    setSetupDialogOpen(false)
    setSelectedIntegration(null)
  }

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "All" || integration.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integrations Marketplace</CardTitle>
        <CardDescription>Connect with 50+ productivity tools to enhance your workflow</CardDescription>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search integrations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} onClick={() => setActiveCategory(category)} className="mb-1">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeCategory} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2">
                    <div className="text-2xl mr-2">{integration.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription className="text-xs">{integration.description}</CardDescription>
                    </div>
                    {integration.isPopular && (
                      <Badge variant="secondary" className="ml-auto">
                        Popular
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-2">
                    <div className="text-xs text-muted-foreground">
                      {integration.benefits && integration.benefits.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1 mt-2">
                          {integration.benefits.slice(0, 2).map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-2 flex justify-between">
                    <Button
                      variant={integration.isInstalled ? "outline" : "default"}
                      size="sm"
                      className="w-full mr-2"
                      onClick={() => handleInstall(integration.id)}
                    >
                      {integration.isInstalled ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                    {integration.url && (
                      <Button variant="outline" size="sm" className="px-2" asChild>
                        <a href={integration.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              {selectedIntegration?.setupInstructions || "Enter your API key to connect this integration."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find your API key in your {selectedIntegration?.name} account settings.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetupComplete}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default IntegrationsMarketplace
