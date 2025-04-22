"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Brain, Clock, Coffee, Sun, Moon, Zap, Lightbulb, BookOpen } from "lucide-react"

export function ProductivityRecommendations() {
  const [activeTab, setActiveTab] = useState("time-management")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Productivity Recommendations</CardTitle>
        <CardDescription>Science-backed strategies to boost your productivity</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="time-management" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="time-management">Time</TabsTrigger>
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="energy">Energy</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="time-management" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5 flex-shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Time Blocking</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule specific blocks of time for different types of work. Research shows this can increase
                  productivity by up to 50%.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5 flex-shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">The 2-Minute Rule</h3>
                <p className="text-sm text-muted-foreground">
                  If a task takes less than 2 minutes, do it immediately instead of scheduling it for later. This
                  prevents small tasks from piling up.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5 flex-shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">The Eisenhower Matrix</h3>
                <p className="text-sm text-muted-foreground">
                  Prioritize tasks based on urgency and importance. Focus on important but not urgent tasks to prevent
                  constant firefighting.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="focus" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mt-0.5 flex-shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Deep Work Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule 90-minute blocks of distraction-free deep work. This aligns with your brain's natural
                  ultradian rhythm.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mt-0.5 flex-shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Digital Minimalism</h3>
                <p className="text-sm text-muted-foreground">
                  Remove non-essential apps from your phone and computer. Research shows the mere presence of your phone
                  reduces cognitive capacity.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mt-0.5 flex-shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Implementation Intentions</h3>
                <p className="text-sm text-muted-foreground">
                  Create "if-then" plans for potential distractions. Example: "If I feel the urge to check social media,
                  then I'll drink a glass of water instead."
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="energy" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5 flex-shrink-0">
                <Sun className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Morning Sunlight Exposure</h3>
                <p className="text-sm text-muted-foreground">
                  Get 10-30 minutes of morning sunlight to regulate your circadian rhythm and boost alertness throughout
                  the day.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5 flex-shrink-0">
                <Coffee className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Strategic Caffeine Timing</h3>
                <p className="text-sm text-muted-foreground">
                  Wait 90-120 minutes after waking before consuming caffeine to work with your natural cortisol rhythm
                  rather than against it.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5 flex-shrink-0">
                <Moon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Non-Sleep Deep Rest (NSDR)</h3>
                <p className="text-sm text-muted-foreground">
                  Practice 10-20 minute NSDR sessions in the afternoon to restore focus and cognitive function,
                  especially during the afternoon slump.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5 flex-shrink-0">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Spaced Repetition</h3>
                <p className="text-sm text-muted-foreground">
                  Review information at increasing intervals to maximize long-term retention. This technique can improve
                  learning efficiency by 200-400%.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5 flex-shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Active Recall</h3>
                <p className="text-sm text-muted-foreground">
                  Test yourself on material rather than passively reviewing it. This strengthens neural pathways and
                  improves retention.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5 flex-shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Interleaving Practice</h3>
                <p className="text-sm text-muted-foreground">
                  Mix different but related topics or skills during practice instead of focusing on one at a time. This
                  improves transfer of learning.
                </p>
                <Button variant="link" className="p-0 h-auto text-sm mt-1">
                  Learn more
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
