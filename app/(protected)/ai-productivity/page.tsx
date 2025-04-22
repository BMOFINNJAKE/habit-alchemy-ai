"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import AISettingsDialog from "@/components/ai-settings-dialog"

export default function AIProductivityPage() {
  const [aiSettingsOpen, setAISettingsOpen] = useState(false)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Productivity Assistant</h1>
          <p className="text-muted-foreground">Leverage AI to boost your productivity</p>
        </div>
        <Button variant="outline" onClick={() => setAISettingsOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          AI Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productivity Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Get AI-powered insights based on your productivity patterns and habits.
            </p>
            <Button>Generate Insights</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Let AI help you optimize your task list and schedule for maximum efficiency.
            </p>
            <Button>Optimize Tasks</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Receive personalized recommendations to improve your focus and concentration.
            </p>
            <Button>Get Recommendations</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Chat Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Chat with your AI assistant for productivity tips, task management, and more.
            </p>
            <Button>Start Chat</Button>
          </CardContent>
        </Card>
      </div>

      <AISettingsDialog open={aiSettingsOpen} onOpenChange={setAISettingsOpen} />
    </div>
  )
}
