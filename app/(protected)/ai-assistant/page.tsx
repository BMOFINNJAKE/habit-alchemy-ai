"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AIChat from "@/components/ai-chat"
import AISettings from "@/components/ai-settings-dialog"
import AIDebugConsole from "@/components/ai-debug-console"
import AIDiagnostics from "@/components/ai-diagnostics"
import AIProductivityInsights from "@/components/ai-productivity-insights"

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("chat")

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground">Your personal productivity AI assistant</p>
        </div>
        <AISettings />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="debug">Debug Console</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <AIChat />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <AIDiagnostics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <AIProductivityInsights />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <AIDebugConsole />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
