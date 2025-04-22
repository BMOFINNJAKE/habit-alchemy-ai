"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Sun, Lightbulb, Droplet, Activity, Trash2, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BrainIcon, MoonIcon } from "lucide-react"
import { useRecommendationsStore, type RecommendationType } from "@/lib/recommendations-service"
import { useToast } from "@/components/ui/use-toast"
import { useAIStore, sendMessageToAI } from "@/lib/ai-service"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function RecommendationsPage() {
  const [customPrompt, setCustomPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("recommendations")
  const [learnMoreOpen, setLearnMoreOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null)
  const { toast } = useToast()
  const { apiKeys, provider } = useAIStore()

  const {
    recommendations,
    activeFilter,
    setActiveFilter,
    getFilteredRecommendations,
    completeRecommendation,
    resetRecommendation,
    deleteRecommendation,
    generateRecommendations,
    clearCompletedRecommendations,
    addCustomRecommendation,
  } = useRecommendationsStore()

  const filteredRecommendations = getFilteredRecommendations()

  const handleGenerateRecommendations = async () => {
    if (!customPrompt.trim()) {
      // Generate general recommendations
      generateRecommendations()

      toast({
        title: "Recommendations refreshed",
        description: "Your recommendations have been refreshed.",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Use AI to generate a recommendation based on the prompt
      const prompt = `Based on the following request, generate a science-based productivity recommendation:
      
Request: "${customPrompt}"

Format your response as a JSON object with the following structure:
{
"title": "Brief title of the recommendation",
"description": "Detailed description of the recommendation (2-3 sentences)",
"type": "One of: Focus, Break, Health, Sleep, Stress, Energy",
"source": "Huberman or Examine or Other",
"actions": {
  "primary": {
    "label": "Set timer or Set reminder or Start practice",
    "action": "timer or reminder or learn"
  },
  "secondary": {
    "label": "Learn more",
    "action": "learn"
  }
},
"detailedInfo": {
  "summary": "A 2-3 paragraph summary of the recommendation",
  "scientificBasis": "Brief explanation of the scientific research behind this recommendation",
  "howToImplement": "Step-by-step instructions on how to implement this recommendation",
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "references": ["Reference 1", "Reference 2"]
}
}

Ensure the recommendation is evidence-based and practical.`

      const response = await sendMessageToAI(prompt, [], apiKeys.gemini, provider)

      // Extract JSON from the response
      const jsonMatch =
        response.match(/```json\n([\s\S]*?)\n```/) ||
        response.match(/```\n([\s\S]*?)\n```/) ||
        response.match(/{[\s\S]*?}/)

      let recommendation

      if (jsonMatch) {
        try {
          recommendation = JSON.parse(jsonMatch[1] || jsonMatch[0])
        } catch (e) {
          console.error("Failed to parse JSON:", e)
        }
      }

      if (recommendation) {
        // Add the recommendation to the store
        addCustomRecommendation(recommendation)

        toast({
          title: "Recommendation generated",
          description: `New recommendation "${recommendation.title}" has been created.`,
        })
      } else {
        // Fallback to determining type based on the prompt
        let type: RecommendationType | undefined

        if (customPrompt.toLowerCase().includes("focus")) {
          type = "Focus"
        } else if (customPrompt.toLowerCase().includes("break")) {
          type = "Break"
        } else if (customPrompt.toLowerCase().includes("sleep")) {
          type = "Sleep"
        } else if (customPrompt.toLowerCase().includes("stress")) {
          type = "Stress"
        } else if (customPrompt.toLowerCase().includes("energy") || customPrompt.toLowerCase().includes("tired")) {
          type = "Energy"
        } else if (customPrompt.toLowerCase().includes("health")) {
          type = "Health"
        }

        // Generate recommendations based on the determined type
        generateRecommendations(type)

        toast({
          title: "Recommendations filtered",
          description: `Showing recommendations for ${type || "your needs"}.`,
        })
      }
    } catch (error) {
      console.error("Error generating recommendation:", error)
      toast({
        title: "Error",
        description: "Failed to generate recommendation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setCustomPrompt("")
    }
  }

  const getIconForType = (type: RecommendationType) => {
    switch (type) {
      case "Focus":
        return <Lightbulb className="h-5 w-5" />
      case "Break":
        return <Clock className="h-5 w-5" />
      case "Health":
        return <Activity className="h-5 w-5" />
      case "Sleep":
        return <MoonIcon className="h-5 w-5" />
      case "Stress":
        return <BrainIcon className="h-5 w-5" />
      case "Energy":
        return <Sun className="h-5 w-5" />
    }
  }

  const getIconBgForType = (type: RecommendationType) => {
    switch (type) {
      case "Focus":
        return "bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300"
      case "Break":
        return "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300"
      case "Health":
        return "bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300"
      case "Sleep":
        return "bg-indigo-100 text-indigo-500 dark:bg-indigo-900 dark:text-indigo-300"
      case "Stress":
        return "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300"
      case "Energy":
        return "bg-yellow-100 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-300"
    }
  }

  const handleAction = (recommendation: any, actionType: "timer" | "reminder" | "learn") => {
    switch (actionType) {
      case "timer":
        // In a real app, this would start a timer
        toast({
          title: "Timer started",
          description: `Timer set for ${recommendation.title}`,
        })
        break
      case "reminder":
        // In a real app, this would set a reminder
        toast({
          title: "Reminder set",
          description: `Reminder set for ${recommendation.title}`,
        })
        break
      case "learn":
        // Show detailed information
        setSelectedRecommendation(recommendation)
        setLearnMoreOpen(true)
        break
    }

    // Mark recommendation as completed if not "learn"
    if (actionType !== "learn") {
      completeRecommendation(recommendation.id)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Recommendations</h1>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          <Select
            defaultValue={activeFilter}
            value={activeFilter}
            onValueChange={(value) => setActiveFilter(value as any)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter recommendations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Focus">Focus</SelectItem>
              <SelectItem value="Break">Break</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Sleep">Sleep</SelectItem>
              <SelectItem value="Stress">Stress</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="Focus, Energy, Sleep..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full md:w-48"
            />
            <Button onClick={handleGenerateRecommendations} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Productivity Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          {activeFilter === "Completed" && filteredRecommendations.length > 0 && (
            <div className="flex justify-end mb-4">
              <Button variant="outline" onClick={() => setConfirmClearOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Completed
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${getIconBgForType(recommendation.type)}`}
                      >
                        {getIconForType(recommendation.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-xl font-semibold">{recommendation.title}</h2>
                          <div className="flex gap-2">
                            <Badge variant="outline">{recommendation.type}</Badge>
                            {recommendation.completed && (
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              >
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{recommendation.description}</p>
                        <div className="flex gap-2">
                          {recommendation.completed ? (
                            <Button onClick={() => resetRecommendation(recommendation.id)}>
                              <X className="h-4 w-4 mr-2" />
                              Mark as Incomplete
                            </Button>
                          ) : (
                            <Button onClick={() => handleAction(recommendation, recommendation.actions.primary.action)}>
                              {recommendation.actions.primary.label}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => handleAction(recommendation, recommendation.actions.secondary.action)}
                          >
                            {recommendation.actions.secondary.label}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRecommendation(recommendation.id)}
                            className="ml-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <h3 className="text-lg font-medium mb-2">No recommendations found</h3>
                <p className="text-muted-foreground mb-4">Try a different filter or generate new recommendations.</p>
                <Button onClick={() => setActiveFilter("All")}>Show all recommendations</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Productivity Research</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Evidence-Based Techniques</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 dark:bg-purple-900 dark:text-purple-300 mt-0.5">
                          <BrainIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">NSDR Protocol</h4>
                          <p className="text-sm text-muted-foreground">
                            Non-Sleep Deep Rest sessions to restore focus and consolidate learning.
                          </p>
                        </div>
                      </li>

                      <li className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 dark:bg-blue-900 dark:text-blue-300 mt-0.5">
                          <Droplet className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">Ultradian Rhythms</h4>
                          <p className="text-sm text-muted-foreground">
                            Work with your body's natural 90-minute focus cycles for optimal performance.
                          </p>
                        </div>
                      </li>

                      <li className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-500 dark:bg-green-900 dark:text-green-300 mt-0.5">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">Strategic Movement</h4>
                          <p className="text-sm text-muted-foreground">
                            Brief physical activities to boost BDNF and enhance creativity.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Research-Backed Protocols</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      All recommendations are based on protocols from leading researchers in neuroscience,
                      chronobiology, and performance optimization.
                    </p>
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                      "Taking a deliberate break every 90 minutes aligns with your body's natural ultradian rhythm and
                      can dramatically improve overall productivity."
                    </blockquote>
                    <p className="text-right text-sm text-muted-foreground mt-2">— Andrew Huberman, Ph.D.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Our AI-powered system analyzes your work patterns and preferences to provide personalized
                    recommendations that optimize your productivity and well-being.
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">How It Works</h3>
                    <ol className="space-y-3 list-decimal pl-5">
                      <li className="text-sm">
                        <span className="font-medium">Data Analysis:</span> We analyze your work patterns, focus
                        sessions, and task completion rates.
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Scientific Matching:</span> Your patterns are matched with
                        evidence-based productivity protocols.
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Personalized Suggestions:</span> Receive tailored recommendations
                        based on your unique needs.
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Continuous Improvement:</span> The system learns from your
                        feedback to improve future recommendations.
                      </li>
                    </ol>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-semibold mb-2">Try It Now</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a personalized recommendation by describing your current needs or challenges.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Need help staying focused during long work sessions"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                      />
                      <Button onClick={handleGenerateRecommendations} disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirm Clear Dialog */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear Completed Recommendations</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all completed recommendations? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmClearOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearCompletedRecommendations()
                setConfirmClearOpen(false)

                toast({
                  title: "Completed recommendations cleared",
                  description: "All completed recommendations have been removed.",
                })
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Learn More Dialog */}
      <Dialog open={learnMoreOpen} onOpenChange={setLearnMoreOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRecommendation && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${getIconBgForType(selectedRecommendation.type)}`}
                  >
                    {getIconForType(selectedRecommendation.type)}
                  </div>
                  <DialogTitle className="text-2xl">{selectedRecommendation.title}</DialogTitle>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedRecommendation.type}</Badge>
                  <Badge variant="outline">Source: {selectedRecommendation.source || "Research-based"}</Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {selectedRecommendation.detailedInfo ? (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Summary</h3>
                      <p className="text-muted-foreground">{selectedRecommendation.detailedInfo.summary}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Scientific Basis</h3>
                      <p className="text-muted-foreground">{selectedRecommendation.detailedInfo.scientificBasis}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">How to Implement</h3>
                      <p className="text-muted-foreground">{selectedRecommendation.detailedInfo.howToImplement}</p>
                    </div>

                    {selectedRecommendation.detailedInfo.benefits && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedRecommendation.detailedInfo.benefits.map((benefit: string, index: number) => (
                            <li key={index} className="text-muted-foreground">
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRecommendation.detailedInfo.references && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">References</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedRecommendation.detailedInfo.references.map((reference: string, index: number) => (
                            <li key={index} className="text-muted-foreground">
                              {reference}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{selectedRecommendation.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Scientific Background</h3>
                      <p className="text-muted-foreground">
                        {selectedRecommendation.type === "Focus" &&
                          "Focus-based techniques leverage the brain's attention networks and neurochemistry. Research shows that deliberate focus periods followed by breaks optimize cognitive performance and prevent mental fatigue."}
                        {selectedRecommendation.type === "Break" &&
                          "Strategic breaks prevent cognitive depletion and allow for memory consolidation. Studies show that brief breaks can restore attention resources and improve overall productivity."}
                        {selectedRecommendation.type === "Health" &&
                          "Physical health directly impacts cognitive function. Research demonstrates that nutrition, exercise, and proper ergonomics significantly enhance brain performance and work output."}
                        {selectedRecommendation.type === "Sleep" &&
                          "Sleep is essential for cognitive function, memory consolidation, and emotional regulation. Quality sleep improves decision-making, creativity, and problem-solving abilities."}
                        {selectedRecommendation.type === "Stress" &&
                          "Chronic stress impairs cognitive function and decision-making. Evidence-based stress management techniques can improve resilience, focus, and overall productivity."}
                        {selectedRecommendation.type === "Energy" &&
                          "Energy management involves optimizing physical, emotional, and mental resources. Research shows that strategic energy management leads to sustained high performance without burnout."}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Implementation Tips</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedRecommendation.type === "Focus" && (
                          <>
                            <li className="text-muted-foreground">Start with 25-minute focused work sessions</li>
                            <li className="text-muted-foreground">
                              Remove all potential distractions before beginning
                            </li>
                            <li className="text-muted-foreground">
                              Use implementation intentions: "When X happens, I will focus on Y"
                            </li>
                            <li className="text-muted-foreground">Track your focus sessions to identify patterns</li>
                          </>
                        )}
                        {selectedRecommendation.type === "Break" && (
                          <>
                            <li className="text-muted-foreground">
                              Take short breaks (5-10 minutes) every 25-50 minutes
                            </li>
                            <li className="text-muted-foreground">Use breaks for movement, not more screen time</li>
                            <li className="text-muted-foreground">Practice brief mindfulness during breaks</li>
                            <li className="text-muted-foreground">
                              Align longer breaks with your ultradian rhythm (90-120 minute cycles)
                            </li>
                          </>
                        )}
                        {selectedRecommendation.type === "Health" && (
                          <>
                            <li className="text-muted-foreground">Stay hydrated throughout the workday</li>
                            <li className="text-muted-foreground">Incorporate movement every hour</li>
                            <li className="text-muted-foreground">Optimize your workspace ergonomics</li>
                            <li className="text-muted-foreground">
                              Choose nutrient-dense foods that support brain function
                            </li>
                          </>
                        )}
                        {selectedRecommendation.type === "Sleep" && (
                          <>
                            <li className="text-muted-foreground">Maintain consistent sleep and wake times</li>
                            <li className="text-muted-foreground">
                              Create a wind-down routine 30-60 minutes before bed
                            </li>
                            <li className="text-muted-foreground">Limit blue light exposure in the evening</li>
                            <li className="text-muted-foreground">
                              Optimize your sleep environment (temperature, light, noise)
                            </li>
                          </>
                        )}
                        {selectedRecommendation.type === "Stress" && (
                          <>
                            <li className="text-muted-foreground">
                              Practice diaphragmatic breathing when feeling stressed
                            </li>
                            <li className="text-muted-foreground">Use the "box breathing" technique (4-4-4-4 count)</li>
                            <li className="text-muted-foreground">Schedule worry time to contain anxious thoughts</li>
                            <li className="text-muted-foreground">Practice progressive muscle relaxation</li>
                          </>
                        )}
                        {selectedRecommendation.type === "Energy" && (
                          <>
                            <li className="text-muted-foreground">
                              Align difficult tasks with your peak energy periods
                            </li>
                            <li className="text-muted-foreground">
                              Use strategic caffeine consumption (timing matters)
                            </li>
                            <li className="text-muted-foreground">Take a short walk outside to boost alertness</li>
                            <li className="text-muted-foreground">
                              Practice energy management, not just time management
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">References</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li className="text-muted-foreground">
                          Huberman, A. (2021). Huberman Lab Podcast: Optimize Your Brain.
                        </li>
                        <li className="text-muted-foreground">
                          Walker, M. (2017). Why We Sleep: Unlocking the Power of Sleep and Dreams.
                        </li>
                        <li className="text-muted-foreground">
                          Clear, J. (2018). Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones.
                        </li>
                        <li className="text-muted-foreground">
                          Newport, C. (2016). Deep Work: Rules for Focused Success in a Distracted World.
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button onClick={() => setLearnMoreOpen(false)}>Close</Button>
                {!selectedRecommendation.completed && (
                  <Button
                    variant="default"
                    onClick={() => {
                      completeRecommendation(selectedRecommendation.id)
                      setLearnMoreOpen(false)
                      toast({
                        title: "Recommendation completed",
                        description: `"${selectedRecommendation.title}" marked as completed.`,
                      })
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
