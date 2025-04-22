"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Volume2, VolumeX, Moon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function FocusMode() {
  const { toast } = useToast()
  const [isActive, setIsActive] = useState(false)
  const [ambientSound, setAmbientSound] = useState(false)
  const [volume, setVolume] = useState(50)
  const [dimLevel, setDimLevel] = useState(30)
  const [timer, setTimer] = useState(25) // minutes
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [intervalId])

  const startFocusMode = () => {
    if (isActive) return

    // Set time remaining in seconds
    const seconds = timer * 60
    setTimeRemaining(seconds)

    // Create overlay element
    const overlay = document.createElement("div")
    overlay.id = "focus-mode-overlay"
    overlay.style.position = "fixed"
    overlay.style.top = "0"
    overlay.style.left = "0"
    overlay.style.width = "100%"
    overlay.style.height = "100%"
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${dimLevel / 100})`
    overlay.style.zIndex = "9998"
    overlay.style.pointerEvents = "none"
    document.body.appendChild(overlay)

    // Start timer
    const id = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up
          endFocusMode()
          toast({
            title: "Focus session completed",
            description: `You've completed a ${timer}-minute focus session!`,
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setIntervalId(id)
    setIsActive(true)

    toast({
      title: "Focus mode activated",
      description: `Screen dimmed to ${dimLevel}%. Focus for ${timer} minutes.`,
    })
  }

  const endFocusMode = () => {
    if (!isActive) return

    // Remove overlay
    const overlay = document.getElementById("focus-mode-overlay")
    if (overlay) document.body.removeChild(overlay)

    // Clear interval
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setIsActive(false)
    setTimeRemaining(0)

    toast({
      title: "Focus mode deactivated",
      description: "You've exited focus mode.",
    })
  }

  // Format time remaining as mm:ss
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Moon className="h-5 w-5 mr-2" />
          Focus Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="dim-level">Screen Dimming</Label>
            <div className="flex items-center">
              <EyeOff className="h-4 w-4 mr-2 text-muted-foreground" />
              <Slider
                id="dim-level"
                min={0}
                max={80}
                step={5}
                value={[dimLevel]}
                onValueChange={(value) => setDimLevel(value[0])}
                disabled={isActive}
                className="w-24"
              />
              <Eye className="h-4 w-4 ml-2 text-muted-foreground" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Label htmlFor="ambient-sound">Ambient Sound</Label>
            <div className="flex items-center">
              <Switch id="ambient-sound" checked={ambientSound} onCheckedChange={setAmbientSound} disabled={isActive} />
              {ambientSound ? (
                <Volume2 className="h-4 w-4 ml-2 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 ml-2 text-muted-foreground" />
              )}
            </div>
          </div>

          {ambientSound && (
            <div className="flex justify-between items-center">
              <Label htmlFor="volume">Volume</Label>
              <Slider
                id="volume"
                min={0}
                max={100}
                step={5}
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                disabled={isActive}
                className="w-24"
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <Label htmlFor="timer">Focus Duration</Label>
            <div className="flex items-center gap-2">
              <select
                id="timer"
                value={timer}
                onChange={(e) => setTimer(Number(e.target.value))}
                disabled={isActive}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value={15}>15 min</option>
                <option value={25}>25 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>
        </div>

        {isActive ? (
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{formatTimeRemaining()}</div>
            <p className="text-sm text-muted-foreground mb-4">Focus time remaining</p>
            <Button variant="destructive" onClick={endFocusMode}>
              Exit Focus Mode
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={startFocusMode}>
            Start Focus Mode
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
