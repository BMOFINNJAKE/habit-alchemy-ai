"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocalStorage } from "@/hooks/use-local-storage"

const steps = [
  {
    title: "Welcome to PocketWindryftPro",
    description: "Your all-in-one productivity solution. Let's get you set up in just a few steps.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "Track Your Time",
    description: "Use time blocking to plan your day and track how you spend your time.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "Manage Projects",
    description: "Create projects, break them down into tasks, and track your progress.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "AI Assistant",
    description: "Get help with your tasks, generate content, and receive personalized recommendations.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "You're All Set!",
    description: "You're ready to boost your productivity. Let's get started!",
    image: "/placeholder.svg?height=200&width=400",
  },
]

export default function UserOnboarding() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage("hasSeenOnboarding", false)

  useEffect(() => {
    // Only show onboarding if the user hasn't seen it before
    if (!hasSeenOnboarding) {
      setOpen(true)
    }
  }, [hasSeenOnboarding])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setHasSeenOnboarding(true)
    setOpen(false)
  }

  const handleSkip = () => {
    setHasSeenOnboarding(true)
    setOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{steps[currentStep].title}</DialogTitle>
            <DialogDescription>{steps[currentStep].description}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            <img
              src={steps[currentStep].image || "/placeholder.svg"}
              alt={steps[currentStep].title}
              className="rounded-md max-h-[200px] object-cover"
            />
          </div>

          <div className="flex justify-center space-x-1 py-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-16 rounded-full ${index === currentStep ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {currentStep > 0 ? (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
              )}
            </div>
            <Button onClick={handleNext}>{currentStep < steps.length - 1 ? "Next" : "Get Started"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Button to reopen onboarding */}
      {hasSeenOnboarding && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Need a refresher?</CardTitle>
            <CardDescription>You can revisit the onboarding tour anytime.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setOpen(true)}>Restart Tour</Button>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
