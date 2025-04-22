"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, ArrowRight } from "lucide-react"

const PRODUCTIVITY_TIPS = [
  {
    title: "The Two-Minute Rule",
    description: "If a task takes less than two minutes, do it immediately instead of scheduling it for later.",
    source: "David Allen, Getting Things Done",
  },
  {
    title: "Time Blocking",
    description: "Dedicate specific blocks of time to specific tasks or types of work to minimize context switching.",
    source: "Cal Newport, Deep Work",
  },
  {
    title: "The Eisenhower Matrix",
    description: "Prioritize tasks based on their urgency and importance to focus on what truly matters.",
    source: "Stephen Covey, 7 Habits of Highly Effective People",
  },
  {
    title: "Pomodoro Technique",
    description: "Work in focused 25-minute intervals with 5-minute breaks to maintain high productivity.",
    source: "Francesco Cirillo",
  },
  {
    title: "Eat the Frog",
    description: "Start your day by tackling your most challenging task to build momentum for the rest of the day.",
    source: "Brian Tracy",
  },
  {
    title: "The 80/20 Rule",
    description: "Focus on the 20% of activities that produce 80% of your results.",
    source: "Vilfredo Pareto",
  },
  {
    title: "Batching Similar Tasks",
    description: "Group similar tasks together to reduce the mental cost of context switching.",
    source: "Tim Ferriss, The 4-Hour Workweek",
  },
  {
    title: "Implementation Intentions",
    description: "Create specific if-then plans for when and where you'll complete tasks to increase follow-through.",
    source: "Peter Gollwitzer",
  },
]

export function ProductivityTip() {
  const [currentTip, setCurrentTip] = useState(0)

  // Change tip every day
  useEffect(() => {
    const today = new Date().toDateString()
    const storedDate = localStorage.getItem("lastTipDate")

    if (storedDate !== today) {
      // New day, new tip
      const newTipIndex = Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)
      setCurrentTip(newTipIndex)
      localStorage.setItem("lastTipDate", today)
      localStorage.setItem("currentTipIndex", newTipIndex.toString())
    } else {
      // Same day, use stored tip
      const storedTip = localStorage.getItem("currentTipIndex")
      if (storedTip) {
        setCurrentTip(Number.parseInt(storedTip))
      }
    }
  }, [])

  const nextTip = () => {
    const newTip = (currentTip + 1) % PRODUCTIVITY_TIPS.length
    setCurrentTip(newTip)
    localStorage.setItem("currentTipIndex", newTip.toString())
  }

  const tip = PRODUCTIVITY_TIPS[currentTip]

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5 flex-shrink-0 dark:bg-blue-900 dark:text-blue-300">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300">{tip.title}</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{tip.description}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-blue-600 dark:text-blue-500 italic">Source: {tip.source}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 dark:text-blue-400 p-0 h-auto"
                onClick={nextTip}
              >
                Next tip <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
