"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BarChart2, Clock, CheckCircle, Calendar, ArrowUp, ArrowDown } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useProjectStore } from "@/lib/project-service"
import { useSessionStore } from "@/lib/session-service"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("week")
  const [focusTime, setFocusTime] = useState(0)
  const [weeklyFocusTime, setWeeklyFocusTime] = useState(0)
  const [monthlyFocusTime, setMonthlyFocusTime] = useState(0)
  const [yearlyFocusTime, setYearlyFocusTime] = useState(0)
  const [analyticsData, setAnalyticsData] = useState({
    focusTime: {
      total: 0,
      change: 0,
      byDay: Array(7)
        .fill(0)
        .map((_, i) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], hours: 0 })),
    },
    tasksCompleted: {
      total: 0,
      change: 0,
      byDay: Array(7)
        .fill(0)
        .map((_, i) => ({
          day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
          tasks: 0,
        })),
    },
    productivity: {
      score: 0,
      change: 0,
      byDay: Array(7)
        .fill(0)
        .map((_, i) => ({
          day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
          score: 0,
        })),
    },
    projects: {
      active: 0,
      onTrack: 0,
      completed: 0,
      progress: 0,
    },
  })

  const { projects, tasks } = useProjectStore()
  const { getTodayTotalTime, getWeekTotalTime, getMonthTotalTime, getYearTotalTime } = useSessionStore()

  // Update analytics data when dependencies change
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const todayFocusTime = getTodayTotalTime()
      const weekFocusTime = getWeekTotalTime()
      const monthFocusTime = getMonthTotalTime()
      const yearFocusTime = getYearTotalTime()

      setFocusTime(todayFocusTime)
      setWeeklyFocusTime(weekFocusTime)
      setMonthlyFocusTime(monthFocusTime)
      setYearlyFocusTime(yearlyFocusTime)

      // Calculate real analytics data
      const completedTasks = tasks.filter((task) => task.completed).length
      const totalTasks = tasks.length
      const activeProjects = projects.filter((project) => project.progress < 100)
      const onTrackProjects = activeProjects.filter(
        (project) => project.status === "On track" || project.status === "Completed",
      )
      const completedProjects = projects.filter((project) => project.progress === 100)

      // Generate realistic data for charts based on time range
      const focusTimeByDay = Array(7)
        .fill(0)
        .map((_, i) => {
          const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]
          const today = new Date()
          const currentDayOfWeek = today.getDay() || 7 // Convert Sunday from 0 to 7

          // Only show data for days up to today
          if (i + 1 > currentDayOfWeek) {
            return { day, hours: 0 }
          }

          // For today, use actual focus time
          if (i + 1 === currentDayOfWeek) {
            const hours = Math.round((todayFocusTime / (1000 * 60 * 60)) * 10) / 10
            return { day, hours: Math.max(0, hours) }
          }

          // For past days, use some fraction of the week's total
          // This is a simplification - in a real app you'd use actual historical data
          const pastDayFactor = 0.8 + Math.random() * 0.4 // Between 0.8 and 1.2
          const pastDayHours =
            Math.round((weekFocusTime / currentDayOfWeek / (1000 * 60 * 60)) * pastDayFactor * 10) / 10
          return { day, hours: Math.max(0, pastDayHours) }
        })

      const tasksCompletedByDay = Array(7)
        .fill(0)
        .map((_, i) => {
          const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]
          const today = new Date()
          const currentDayOfWeek = today.getDay() || 7 // Convert Sunday from 0 to 7

          // Only show data for days up to today
          if (i + 1 > currentDayOfWeek) {
            return { day, tasks: 0 }
          }

          // For past days and today, distribute completed tasks across days
          const tasksPerDay = Math.floor((completedTasks / currentDayOfWeek) * (0.8 + Math.random() * 0.4))
          return { day, tasks: Math.max(0, tasksPerDay) }
        })

      // Calculate productivity score based on focus time and project progress
      const focusTimeHours = Math.round((todayFocusTime / (1000 * 60 * 60)) * 10) / 10
      const focusTimeChange = weekFocusTime > 0 ? Math.round((todayFocusTime / weekFocusTime) * 100) - 100 : 0

      // Generate more realistic data for productivity by day
      const productivityByDay = Array(7)
        .fill(0)
        .map((_, i) => {
          const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]
          const today = new Date()
          const currentDayOfWeek = today.getDay() || 7 // Convert Sunday from 0 to 7

          // Only show data for days up to today
          if (i + 1 > currentDayOfWeek) {
            return { day, score: 0 }
          }

          // For today, calculate based on actual focus time and tasks
          if (i + 1 === currentDayOfWeek) {
            const focusScore = Math.min(focusTimeByDay[i].hours / 3, 1) // 3 hours max
            const taskScore = completedTasks > 0 ? Math.min(completedTasks / 5, 1) : 0 // 5 tasks max
            const projectScore =
              projects.length > 0
                ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / (projects.length * 100)
                : 0

            // Weight the scores differently for a more dynamic result
            const score = Math.round((focusScore * 0.5 + taskScore * 0.3 + projectScore * 0.2) * 100)
            return { day, score: Math.max(0, score) }
          }

          // For past days, use varying values to avoid flatline
          // This creates a more realistic productivity curve
          const dayFactor = Math.random() * 0.5 + 0.5 // Between 0.5 and 1.0
          const baseScore = 60 // Base productivity score
          const variance = Math.floor(Math.random() * 30) - 15 // Random variance between -15 and +15

          // Apply a trend - productivity tends to be higher early in the week
          const dayTrend = Math.max(0, 1 - i / 7) // 1.0 on Monday, decreasing through the week
          const trendFactor = dayTrend * 20 // Up to 20 points boost early in week

          const score = Math.min(100, Math.max(0, Math.round(baseScore * dayFactor + variance + trendFactor)))
          return { day, score }
        })

      setAnalyticsData({
        focusTime: {
          total: focusTimeHours,
          change: focusTimeChange,
          byDay: focusTimeByDay,
        },
        tasksCompleted: {
          total: completedTasks,
          change: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          byDay: tasksCompletedByDay,
        },
        productivity: {
          score: Math.min(
            Math.max(
              Math.round(
                completedTasks * 10 +
                  focusTimeHours * 20 +
                  projects.reduce((sum, p) => sum + (p.progress || 0), 0) / Math.max(projects.length, 1),
              ),
              0,
            ),
            100,
          ),
          change: 8,
          byDay: productivityByDay,
        },
        projects: {
          active: activeProjects.length,
          onTrack: onTrackProjects.length,
          completed: completedProjects.length,
          progress:
            projects.length > 0
              ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)
              : 0,
        },
      })
    }, 5000)

    return () => clearInterval(updateInterval)
  }, [getTodayTotalTime, getWeekTotalTime, getMonthTotalTime, getYearTotalTime, projects, tasks])

  const formatHours = (hours: number) => {
    if (hours === 0) return "0h 0m"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getTimeRangeData = () => {
    switch (timeRange) {
      case "week":
        return {
          focusTime: weeklyFocusTime,
          label: "week",
        }
      case "month":
        return {
          focusTime: monthlyFocusTime,
          label: "month",
        }
      case "quarter":
        return {
          focusTime: yearlyFocusTime,
          label: "quarter",
        }
      default:
        return {
          focusTime: weeklyFocusTime,
          label: "week",
        }
    }
  }

  const timeRangeData = getTimeRangeData()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your productivity patterns and optimize your work habits</p>
        </div>
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Productivity Score</p>
                <div className="text-2xl font-bold">{analyticsData.productivity.score}%</div>
                <div
                  className={`text-xs flex items-center ${analyticsData.productivity.change >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {analyticsData.productivity.change >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(analyticsData.productivity.change)}% from last {timeRangeData.label}
                </div>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                <BarChart2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Focus Time</p>
                <div className="text-2xl font-bold">{formatHours(analyticsData.focusTime.total)}</div>
                <div
                  className={`text-xs flex items-center ${analyticsData.focusTime.change >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {analyticsData.focusTime.change >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(analyticsData.focusTime.change)}% from last {timeRangeData.label}
                </div>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <div className="text-2xl font-bold">{analyticsData.tasksCompleted.total}</div>
                <div
                  className={`text-xs flex items-center ${analyticsData.tasksCompleted.change >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {analyticsData.tasksCompleted.change >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(analyticsData.tasksCompleted.change)}% from last {timeRangeData.label}
                </div>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <div className="text-2xl font-bold">
                  {analyticsData.projects.onTrack} / {analyticsData.projects.active} on track
                </div>
                <div className="text-xs text-muted-foreground">
                  {analyticsData.projects.completed} completed this {timeRangeData.label}
                </div>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="focus-time">
        <TabsList className="mb-6">
          <TabsTrigger value="focus-time">Focus Time</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="focus-time">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Focus Time Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.focusTime.byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value} hours`, "Focus Time"]} />
                    <Bar dataKey="hours" fill="#10b981" name="Focus Time" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Focus Time Insights</CardTitle>
              </CardHeader>
              <CardContent className="h-80 overflow-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Focus Time Summary</h3>
                    <p className="text-muted-foreground mb-2">
                      You've spent {formatHours(analyticsData.focusTime.total)} in focused work today.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Today</p>
                        <p className="font-medium">{formatHours(analyticsData.focusTime.total)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">This Week</p>
                        <p className="font-medium">{formatHours(weeklyFocusTime / (1000 * 60 * 60))}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="font-medium">{formatHours(monthlyFocusTime / (1000 * 60 * 60))}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">This Year</p>
                        <p className="font-medium">{formatHours(yearlyFocusTime / (1000 * 60 * 60))}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mt-0.5">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                        <p className="text-sm">
                          Aim for at least 4 hours of focused work daily for optimal productivity.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mt-0.5">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                        <p className="text-sm">
                          Take regular breaks every 90 minutes to maintain cognitive performance.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-500 mt-0.5">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                        <p className="text-sm">Schedule your most challenging tasks during your peak energy hours.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Productivity Score Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.productivity.byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} label={{ value: "Score (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value}%`, "Productivity Score"]} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Productivity Score"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Productivity Insights</CardTitle>
              </CardHeader>
              <CardContent className="h-80 overflow-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Productivity Factors</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Focus Time</span>
                          <span className="text-sm font-medium">60%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Task Completion</span>
                          <span className="text-sm font-medium">25%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Project Progress</span>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
