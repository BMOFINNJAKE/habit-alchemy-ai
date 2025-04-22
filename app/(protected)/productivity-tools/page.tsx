"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import TimeBlockingModule from "@/components/productivity/time-blocking/time-blocking-module"
import HabitsAndChecklistModule from "@/components/productivity/habits/habits-and-checklist-module"
import PrioritizationModule from "@/components/productivity/prioritization/prioritization-module"

export default function ProductivityToolsPage() {
  const [activeTab, setActiveTab] = useState("time-blocking")

  return (
    <div className="container py-6 max-w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Productivity Tools</h1>
        <p className="text-muted-foreground">Advanced tools to optimize your workflow and productivity</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b">
          <TabsList className="bg-transparent p-0">
            <TabsTrigger
              value="time-blocking"
              className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
            >
              Time Blocking
            </TabsTrigger>
            <TabsTrigger
              value="habits-checklist"
              className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
            >
              Habits & Checklist
            </TabsTrigger>
            <TabsTrigger
              value="prioritization"
              className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
            >
              Prioritization
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="time-blocking" className="mt-0">
          <TimeBlockingModule />
        </TabsContent>

        <TabsContent value="habits-checklist" className="mt-0">
          <HabitsAndChecklistModule />
        </TabsContent>

        <TabsContent value="prioritization" className="mt-0">
          <PrioritizationModule />
        </TabsContent>
      </Tabs>
    </div>
  )
}
