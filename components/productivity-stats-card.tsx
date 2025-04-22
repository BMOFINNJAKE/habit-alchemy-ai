"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export function ProductivityStatsCard() {
  const [period, setPeriod] = useState("today")

  const stats = {
    today: {
      focusTime: 3.5,
      tasksCompleted: 7,
      totalTasks: 12,
      efficiency: 78,
    },
    week: {
      focusTime: 22.5,
      tasksCompleted: 34,
      totalTasks: 45,
      efficiency: 82,
    },
    month: {
      focusTime: 87.5,
      tasksCompleted: 145,
      totalTasks: 180,
      efficiency: 85,
    },
  }

  const currentStats = stats[period as keyof typeof stats]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity Stats</CardTitle>
        <Tabs value={period} onValueChange={setPeriod} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Focus Time</span>
            <span className="font-medium">{currentStats.focusTime} hours</span>
          </div>
          <Progress value={currentStats.focusTime * 10} className="h-2" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Tasks Completed</span>
            <span className="font-medium">
              {currentStats.tasksCompleted}/{currentStats.totalTasks}
            </span>
          </div>
          <Progress value={(currentStats.tasksCompleted / currentStats.totalTasks) * 100} className="h-2" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Efficiency Score</span>
            <span className="font-medium">{currentStats.efficiency}%</span>
          </div>
          <Progress value={currentStats.efficiency} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
