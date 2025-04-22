"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Calendar, Clock, Lightbulb, Loader2, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function AIProductivityInsights() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasInsights, setHasInsights] = useState(false)

  const generateInsights = () => {
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false)
      setHasInsights(true)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Productivity Insights
        </CardTitle>
        <CardDescription>Get personalized insights and recommendations based on your work patterns</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasInsights ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Discover Your Productivity Patterns</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Our AI will analyze your time tracking data, completed tasks, and work habits to provide personalized
              insights and recommendations.
            </p>
            <Button onClick={generateInsights} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing your data...
                </>
              ) : (
                "Generate Insights"
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="patterns">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patterns">
                <TrendingUp className="h-4 w-4 mr-2" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <Lightbulb className="h-4 w-4 mr-2" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart className="h-4 w-4 mr-2" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patterns" className="pt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Peak Productivity Hours</span>
                    <span className="text-sm text-muted-foreground">9:00 AM - 11:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Progress value={85} className="h-2" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Most Productive Day</span>
                    <span className="text-sm text-muted-foreground">Tuesday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Progress value={78} className="h-2" />
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-1">Focus Pattern Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    You tend to work in 52-minute focused sessions followed by longer breaks. Your deep work sessions
                    are most effective when scheduled before noon.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="pt-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-md">
                  <h4 className="font-medium">Schedule Deep Work in the Morning</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on your patterns, schedule your most important tasks between 9-11 AM when your focus is
                    strongest.
                  </p>
                </div>

                <div className="p-3 border rounded-md">
                  <h4 className="font-medium">Batch Similar Tasks</h4>
                  <p className="text-sm text-muted-foreground">
                    Group similar tasks together to reduce context switching. You lose approximately 23 minutes per
                    context switch.
                  </p>
                </div>

                <div className="p-3 border rounded-md">
                  <h4 className="font-medium">Optimize Meeting Schedule</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule meetings in the afternoon to preserve your morning focus time for deep work.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-md">
                  <div className="text-2xl font-bold">52 min</div>
                  <div className="text-sm text-muted-foreground">Avg. Focus Session</div>
                </div>

                <div className="p-3 border rounded-md">
                  <div className="text-2xl font-bold">3.2 hrs</div>
                  <div className="text-sm text-muted-foreground">Daily Deep Work</div>
                </div>

                <div className="p-3 border rounded-md">
                  <div className="text-2xl font-bold">27%</div>
                  <div className="text-sm text-muted-foreground">Time in Meetings</div>
                </div>

                <div className="p-3 border rounded-md">
                  <div className="text-2xl font-bold">18 min</div>
                  <div className="text-sm text-muted-foreground">Avg. Task Switch</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      {hasInsights && (
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => setHasInsights(false)}>
            Refresh Insights
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export default AIProductivityInsights
