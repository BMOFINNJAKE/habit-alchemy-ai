"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "@/components/ui/circular-progress"
import { useToast } from "@/components/ui/use-toast"
import { useSessionStore } from "@/lib/session-service"

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState("focus") // 'focus', 'shortBreak', 'longBreak'
  const { addFocusSession } = useSessionStore()
  const { toast } = useToast()

  const totalTime = minutes * 60 + seconds
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        if (minutes === 0 && seconds === 0) {
          clearInterval(interval)
          setIsActive(false)
          handleTimerEnd()
        } else if (seconds === 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isActive, minutes, seconds, addFocusSession, toast])

  useEffect(() => {
    setProgress(0)
    const totalSeconds = minutes * 60 + seconds
    if (totalSeconds > 0) {
      setProgress(1 - totalSeconds / (25 * 60))
    }
  }, [minutes, seconds])

  const startTimer = () => {
    setIsActive(true)
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMinutes(25)
    setSeconds(0)
    setMode("focus")
  }

  const handleTimerEnd = () => {
    toast({
      title: `${mode === "focus" ? "Focus" : mode === "shortBreak" ? "Short break" : "Long break"} session complete!`,
      description: "Time for a change!",
    })
    if (mode === "focus") {
      addFocusSession(25 * 60 * 1000) // duration in milliseconds
    }
  }

  const setFocusMode = () => {
    setMode("focus")
    setMinutes(25)
    setSeconds(0)
    setIsActive(false)
  }

  const setShortBreakMode = () => {
    setMode("shortBreak")
    setMinutes(5)
    setSeconds(0)
    setIsActive(false)
  }

  const setLongBreakMode = () => {
    setMode("longBreak")
    setMinutes(15)
    setSeconds(0)
    setIsActive(false)
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-4">
        <div className="flex justify-center gap-4">
          <Button variant={mode === "focus" ? "default" : "outline"} onClick={setFocusMode}>
            Focus
          </Button>
          <Button variant={mode === "shortBreak" ? "default" : "outline"} onClick={setShortBreakMode}>
            Short Break
          </Button>
          <Button variant={mode === "longBreak" ? "default" : "outline"} onClick={setLongBreakMode}>
            Long Break
          </Button>
        </div>
      </div>

      <div className="relative w-64 h-64">
        <CircularProgress value={getProgressPercent()} className="h-full w-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl font-bold">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Button onClick={startTimer} disabled={isActive}>
          Start
        </Button>
        <Button onClick={pauseTimer} disabled={!isActive}>
          Pause
        </Button>
        <Button onClick={resetTimer} variant="outline">
          Reset
        </Button>
      </div>
    </div>
  )
}
