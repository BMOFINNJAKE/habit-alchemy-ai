"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PomodoroTimer from "@/components/pomodoro-timer"

export default function FocusTimerPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Focus Timer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pomodoro Technique</CardTitle>
        </CardHeader>
        <CardContent>
          <PomodoroTimer />
        </CardContent>
      </Card>
    </div>
  )
}
