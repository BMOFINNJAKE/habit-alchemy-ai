"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Calendar, FileText, Layers, MessageSquare, Mic, Smartphone, Sparkles, Zap } from "lucide-react"

export function AdditionalFeatures() {
  const features = [
    {
      title: "Voice Commands & Notes",
      description: "Capture ideas and create tasks using voice commands for hands-free productivity.",
      icon: <Mic className="h-5 w-5" />,
      status: "Coming Soon",
    },
    {
      title: "AI Writing Assistant",
      description: "Get help drafting emails, documents, and content with AI-powered writing suggestions.",
      icon: <FileText className="h-5 w-5" />,
      status: "Planned",
    },
    {
      title: "Team Collaboration",
      description: "Share projects, assign tasks, and collaborate with team members in real-time.",
      icon: <MessageSquare className="h-5 w-5" />,
      status: "Planned",
    },
    {
      title: "Advanced Calendar Integration",
      description: "Two-way sync with Google, Outlook, and Apple calendars with smart scheduling.",
      icon: <Calendar className="h-5 w-5" />,
      status: "In Development",
    },
    {
      title: "Flow State Tracker",
      description: "Analyze when you enter flow states and optimize your environment to achieve them more often.",
      icon: <Zap className="h-5 w-5" />,
      status: "Concept",
    },
    {
      title: "Knowledge Management",
      description: "Organize notes, documents, and resources with smart tagging and AI-powered search.",
      icon: <Brain className="h-5 w-5" />,
      status: "Planned",
    },
    {
      title: "Mobile Companion App",
      description: "Native mobile app with offline support, notifications, and quick capture features.",
      icon: <Smartphone className="h-5 w-5" />,
      status: "In Development",
    },
    {
      title: "Integrations Marketplace",
      description: "Connect with 50+ tools including Notion, Slack, GitHub, Trello, and more.",
      icon: <Layers className="h-5 w-5" />,
      status: "Planned",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Features</CardTitle>
        <CardDescription>Exciting new capabilities coming to PocketWinDryftPro</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div className="font-medium">{feature.title}</div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs bg-muted px-2 py-1 rounded-full">{feature.status}</div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
