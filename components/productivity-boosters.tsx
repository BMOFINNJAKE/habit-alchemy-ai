"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Zap, Brain, Clock, Lightbulb, Hourglass, Rocket } from "lucide-react"

export function ProductivityBoosters() {
  const [activeTab, setActiveTab] = useState("quick-wins")
  const [focusLevel, setFocusLevel] = useState(50)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Productivity Boosters
        </CardTitle>
        <CardDescription>Powerful techniques to maximize your productivity and focus</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
            <TabsTrigger value="techniques">Techniques</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
          </TabsList>

          <TabsContent value="quick-wins" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickWinCard
                icon={<Brain className="h-5 w-5" />}
                title="Brain Dump"
                description="Quickly capture all your thoughts and tasks in one place"
                action="Start Now"
              />
              <QuickWinCard
                icon={<Clock className="h-5 w-5" />}
                title="Time Blocking"
                description="Schedule focused work blocks for your most important tasks"
                action="Schedule"
              />
              <QuickWinCard
                icon={<Zap className="h-5 w-5" />}
                title="Energy Audit"
                description="Identify your peak energy hours and optimize your schedule"
                action="Start Audit"
              />
              <QuickWinCard
                icon={<Lightbulb className="h-5 w-5" />}
                title="Idea Capture"
                description="Never lose a brilliant idea with quick capture tools"
                action="Capture"
              />
            </div>
          </TabsContent>

          <TabsContent value="techniques" className="space-y-4">
            <div className="space-y-4">
              <TechniqueCard
                title="Pomodoro Technique"
                description="Work in focused 25-minute intervals with 5-minute breaks"
                difficulty="Easy"
                timeRequired="25 minutes"
              />
              <TechniqueCard
                title="Deep Work"
                description="Schedule blocks of distraction-free, high-concentration work"
                difficulty="Medium"
                timeRequired="1-4 hours"
              />
              <TechniqueCard
                title="Eisenhower Matrix"
                description="Prioritize tasks based on urgency and importance"
                difficulty="Easy"
                timeRequired="15 minutes"
              />
              <TechniqueCard
                title="Time Blocking"
                description="Assign specific time blocks to tasks or categories of work"
                difficulty="Medium"
                timeRequired="Varies"
              />
            </div>
          </TabsContent>

          <TabsContent value="automations" className="space-y-4">
            <div className="space-y-4">
              <AutomationCard
                title="Daily Agenda Email"
                description="Receive your schedule and top priorities every morning"
                enabled={true}
              />
              <AutomationCard
                title="Task Rollover"
                description="Automatically move incomplete tasks to the next day"
                enabled={false}
              />
              <AutomationCard
                title="Focus Mode Scheduler"
                description="Automatically enter focus mode during scheduled deep work"
                enabled={true}
              />
              <AutomationCard
                title="Project Progress Reports"
                description="Weekly summary of project progress and time spent"
                enabled={false}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="focus-level" className="text-sm font-medium">
              Focus Environment Level
            </Label>
            <span className="text-sm text-muted-foreground">{focusLevel}%</span>
          </div>
          <Slider
            id="focus-level"
            min={0}
            max={100}
            step={10}
            value={[focusLevel]}
            onValueChange={(value) => setFocusLevel(value[0])}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {focusLevel < 30
              ? "Light focus: Allows notifications and background tasks"
              : focusLevel < 70
                ? "Medium focus: Blocks non-urgent notifications"
                : "Deep focus: Blocks all distractions and notifications"}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

function QuickWinCard({ icon, title, description, action }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="bg-primary/10 p-2 rounded-full text-primary">{icon}</div>
          <div className="flex-1">
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full">
          {action}
        </Button>
      </CardFooter>
    </Card>
  )
}

function TechniqueCard({ title, description, difficulty, timeRequired }) {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium">{title}</h4>
          <Badge variant={difficulty === "Easy" ? "outline" : difficulty === "Medium" ? "secondary" : "destructive"}>
            {difficulty}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Hourglass className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{timeRequired}</span>
        <Button size="sm">Try</Button>
      </div>
    </div>
  )
}

function AutomationCard({ title, description, enabled }) {
  const [isEnabled, setIsEnabled] = useState(enabled)

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
          id={`automation-${title.toLowerCase().replace(/\s+/g, "-")}`}
        />
        <Label htmlFor={`automation-${title.toLowerCase().replace(/\s+/g, "-")}`} className="sr-only">
          {isEnabled ? "Disable" : "Enable"} {title}
        </Label>
      </div>
    </div>
  )
}
