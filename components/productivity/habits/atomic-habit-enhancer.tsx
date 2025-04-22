
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2, Save, RotateCcw, Brain, Target, Bell, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store-provider"
import { useAtomicHabitsAI, AtomicHabitEnhancement } from "@/hooks/use-atomic-habits-ai"

interface AtomicHabitEnhancerProps {
  habitName: string
  frequency: string
  onSave: (enhancedHabit: AtomicHabitEnhancement) => void
  onCancel: () => void
}

export default function AtomicHabitEnhancer({ 
  habitName, 
  frequency, 
  onSave, 
  onCancel 
}: AtomicHabitEnhancerProps) {
  const [desiredIdentity, setDesiredIdentity] = useState("")
  const [enhancement, setEnhancement] = useState<AtomicHabitEnhancement | null>(null)
  const { toast } = useToast()
  const { isOnline } = useStore()
  const { isGenerating, generateHabitEnhancement } = useAtomicHabitsAI()

  const generateEnhancement = async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "AI enhancement requires an internet connection.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await generateHabitEnhancement(habitName, desiredIdentity, frequency)
      setEnhancement(result)
      
      toast({
        title: "Habit Enhanced",
        description: "Your habit has been transformed with Atomic Habits principles.",
      })
    } catch (error) {
      console.error("Error enhancing habit:", error)
      toast({
        title: "Enhancement failed",
        description: "There was an error enhancing your habit. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSave = () => {
    if (enhancement) {
      onSave(enhancement)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Atomic Habits Enhancement
        </CardTitle>
        <CardDescription>
          Transform your habit with principles from Atomic Habits by James Clear
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identity">Who do you want to become? (Optional)</Label>
          <Input
            id="identity"
            value={desiredIdentity}
            onChange={(e) => setDesiredIdentity(e.target.value)}
            placeholder="e.g., a consistent reader, someone who prioritizes health..."
          />
          <p className="text-xs text-muted-foreground">
            Connecting habits to your identity makes them more likely to stick
          </p>
        </div>

        <Button
          onClick={generateEnhancement}
          disabled={isGenerating || !habitName.trim() || !isOnline}
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
              Enhance Habit with AI
            </>
          )}
        </Button>

        {enhancement && (
          <div className="space-y-4 pt-4 border-t">
            <div className="text-center">
              <h3 className="font-semibold text-lg">{enhancement.enhancedName}</h3>
              <p className="text-sm text-muted-foreground mb-4">Your Atomic Habit</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-900">
              <p className="text-sm font-medium">{enhancement.fullSuggestion}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">Make it obvious</h4>
                  <p className="text-sm text-muted-foreground">{enhancement.trigger}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">Make it attractive</h4>
                  <p className="text-sm text-muted-foreground">Become {enhancement.identity}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Target className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">Make it easy</h4>
                  <p className="text-sm text-muted-foreground">{enhancement.smallStep}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Award className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">Make it satisfying</h4>
                  <p className="text-sm text-muted-foreground">{enhancement.reward}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!enhancement}>
          <Save className="mr-2 h-4 w-4" />
          Save Enhanced Habit
        </Button>
      </CardFooter>
    </Card>
  )
}
