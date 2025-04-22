
"use client"

import { useState } from "react"
import { useStore } from "@/lib/store-provider"

interface AtomicHabitEnhancement {
  enhancedName: string
  trigger: string
  identity: string
  smallStep: string
  reward: string
  fullSuggestion: string
}

export function useAtomicHabitsAI() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { isOnline } = useStore()

  const generateHabitEnhancement = async (
    habitName: string,
    desiredIdentity?: string,
    frequency?: string
  ): Promise<AtomicHabitEnhancement> => {
    setIsGenerating(true)
    
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll provide predefined enhancements based on common habits
      
      // Create a simple mapping of common habits to enhancements
      const habits: Record<string, AtomicHabitEnhancement> = {
        "read": {
          enhancedName: "Daily Reading Habit",
          trigger: "After dinner",
          identity: desiredIdentity || "someone who is constantly learning",
          smallStep: "read 10 pages",
          reward: "mark progress in a reading journal",
          fullSuggestion: `After dinner, I will read 10 pages of a book to become ${desiredIdentity || "someone who is constantly learning"}. I'll mark my progress in a reading journal to celebrate consistency.`
        },
        "meditate": {
          enhancedName: "Mindful Meditation Practice",
          trigger: "After I brush my teeth in the morning",
          identity: desiredIdentity || "someone who stays calm under pressure",
          smallStep: "meditate for 2 minutes",
          reward: "take a deep breath and smile",
          fullSuggestion: `After I brush my teeth in the morning, I will meditate for 2 minutes to become ${desiredIdentity || "someone who stays calm under pressure"}. I'll take a deep breath and smile afterward to celebrate this small win.`
        },
        "exercise": {
          enhancedName: "Regular Movement Routine",
          trigger: "When I get home from work",
          identity: desiredIdentity || "someone who takes care of their body",
          smallStep: "exercise for 5 minutes",
          reward: "drink a glass of water and check off my streak",
          fullSuggestion: `When I get home from work, I will exercise for 5 minutes to become ${desiredIdentity || "someone who takes care of their body"}. I'll drink a glass of water and check off my streak to celebrate.`
        },
        "write": {
          enhancedName: "Daily Writing Practice",
          trigger: "After my morning coffee",
          identity: desiredIdentity || "a consistent writer",
          smallStep: "write for 10 minutes",
          reward: "review what I wrote and note one good idea",
          fullSuggestion: `After my morning coffee, I will write for 10 minutes to become ${desiredIdentity || "a consistent writer"}. I'll review what I wrote and note one good idea to reinforce the habit.`
        },
        "drink water": {
          enhancedName: "Hydration Habit",
          trigger: "When I start a new work task",
          identity: desiredIdentity || "someone who prioritizes health",
          smallStep: "drink a glass of water",
          reward: "take a moment to stretch",
          fullSuggestion: `When I start a new work task, I will drink a glass of water to become ${desiredIdentity || "someone who prioritizes health"}. I'll take a moment to stretch as a small reward.`
        }
      }
      
      // Extract the base habit name (lowercased)
      const baseHabit = habitName.toLowerCase().trim()
      
      // Find a matching habit or generate a custom one
      let enhancement: AtomicHabitEnhancement
      
      if (baseHabit in habits) {
        enhancement = habits[baseHabit]
      } else {
        // Generate a custom enhancement for habits not in our predefined list
        const frequencyText = frequency || "daily"
        const triggers = ["After breakfast", "After I wake up", "When I arrive at my desk", "After lunch", "Before bed"]
        const randomTrigger = triggers[Math.floor(Math.random() * triggers.length)]
        
        enhancement = {
          enhancedName: `${habitName.charAt(0).toUpperCase() + habitName.slice(1)} ${frequencyText === "daily" ? "Daily" : frequencyText === "weekly" ? "Weekly" : "Regular"} Practice`,
          trigger: randomTrigger,
          identity: desiredIdentity || "someone who is committed to self-improvement",
          smallStep: `${habitName} for 5 minutes`,
          reward: "track my progress and reflect on how it feels",
          fullSuggestion: `${randomTrigger}, I will ${habitName} for 5 minutes to become ${desiredIdentity || "someone who is committed to self-improvement"}. I'll track my progress and reflect on how it feels to build momentum.`
        }
      }
      
      // Wait for a short time to simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 800))
      
      return enhancement
    } catch (error) {
      console.error("Error generating habit enhancement:", error)
      
      // Return a fallback enhancement
      return {
        enhancedName: habitName,
        trigger: "At a specific time each day",
        identity: desiredIdentity || "someone who takes action",
        smallStep: habitName,
        reward: "track my progress",
        fullSuggestion: `At a specific time each day, I will ${habitName} to become ${desiredIdentity || "someone who takes action"}. I'll track my progress to build momentum.`
      }
    } finally {
      setIsGenerating(false)
    }
  }
  
  return {
    isGenerating,
    generateHabitEnhancement,
  }
}

export type { AtomicHabitEnhancement }
