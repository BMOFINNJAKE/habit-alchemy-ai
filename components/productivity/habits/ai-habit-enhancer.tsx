"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, Save, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store-provider"

interface AIHabitEnhancerProps {
  habitDescription: string
  onSave: (enhancedDescription: string) => void
  onCancel: () => void
}

export default function AIHabitEnhancer({ habitDescription, onSave, onCancel }: AIHabitEnhancerProps) {
  const [description, setDescription] = useState(habitDescription)
  const [enhancedDescription, setEnhancedDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [includeMotivation, setIncludeMotivation] = useState(true)
  const [includeScience, setIncludeScience] = useState(true)
  const [includeTracking, setIncludeTracking] = useState(true)
  const { toast } = useToast()
  const { isOnline, isSupabaseConnected } = useStore()

  const generateEnhancedDescription = async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "AI enhancement requires an internet connection.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate the AI response
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let enhancedText = description

      if (includeMotivation) {
        enhancedText +=
          "\n\n🔥 Motivation: Building this habit will help you improve focus, reduce stress, and increase overall productivity. Consistency is key to seeing long-term benefits."
      }

      if (includeScience) {
        enhancedText +=
          "\n\n🧪 Science: Research shows that consistent practice of this habit can lead to improved cognitive function and reduced cortisol levels. Studies indicate it takes approximately 66 days to form a new habit."
      }

      if (includeTracking) {
        enhancedText +=
          "\n\n📊 Tracking Tips: Track your progress daily, note any obstacles, and celebrate small wins. Consider using the 'don't break the chain' method to maintain consistency."
      }

      setEnhancedDescription(enhancedText)
      toast({
        title: "Description enhanced",
        description: "AI has enhanced your habit description with additional insights.",
      })
    } catch (error) {
      console.error("Error generating enhanced description:", error)
      toast({
        title: "Enhancement failed",
        description: "There was an error enhancing your description. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    onSave(enhancedDescription || description)
  }

  const handleReset = () => {
    setEnhancedDescription("")
    setDescription(habitDescription)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Habit Enhancement
        </CardTitle>
        <CardDescription>
          Let AI enhance your habit description with motivation, science-backed insights, and tracking tips
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="original-description">Original Description</Label>
          <Textarea
            id="original-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your habit description..."
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <Switch id="include-motivation" checked={includeMotivation} onCheckedChange={setIncludeMotivation} />
            <Label htmlFor="include-motivation">Add Motivation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="include-science" checked={includeScience} onCheckedChange={setIncludeScience} />
            <Label htmlFor="include-science">Add Science</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="include-tracking" checked={includeTracking} onCheckedChange={setIncludeTracking} />
            <Label htmlFor="include-tracking">Add Tracking Tips</Label>
          </div>
        </div>

        <Button
          onClick={generateEnhancedDescription}
          disabled={isGenerating || !description.trim() || !isOnline}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Enhance Description
            </>
          )}
        </Button>

        {enhancedDescription && (
          <div className="space-y-2">
            <Label htmlFor="enhanced-description">Enhanced Description</Label>
            <Textarea
              id="enhanced-description"
              value={enhancedDescription}
              onChange={(e) => setEnhancedDescription(e.target.value)}
              rows={6}
              className="border-green-200 bg-green-50 dark:bg-green-900/10"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!enhancedDescription && description === habitDescription}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
