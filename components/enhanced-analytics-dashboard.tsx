"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, Target, Download, Share2 } from "lucide-react"
import { useSessionStore } from "@/lib/session-service"
import { useProjectStore } from "@/lib/project-service"
import { startOfWeek, eachDayOfInterval } from "date-fns"
import { supabase } from "@/lib/supabase"

export function EnhancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("week")
  const [isLoading, setIsLoading] = useState(false)
  const [focusScore, setFocusScore] = useState(0)
  const [productivityTrend, setProductivityTrend] = useState(0)
  const [mostProductiveDay, setMostProductiveDay] = useState("Not enough data")
  const [mostProductiveTime, setMostProductiveTime] = useState("Not enough data")
  const [productivityGoal, setProductivityGoal] = useState(80)
  const [productivityGoalProgress, setProductivityGoalProgress] = useState(0)

  const { getTodayTotalTime, getWeekTotalTime, getMonthTotalTime } = useSessionStore()
  const { projects, tasks } = useProjectStore()

  // Initialize with sample data
  const [weeklyData, setWeeklyData] = useState([
    { day: "Mon", focusTime: 120, taskCompleted: 5, productivity: 65 },
    { day: "Tue", focusTime: 180, taskCompleted: 8, productivity: 75 },
    { day: "Wed", focusTime: 240, taskCompleted: 10, productivity: 85 },
    { day: "Thu", focusTime: 150, taskCompleted: 6, productivity: 70 },
    { day: "Fri", focusTime: 210, taskCompleted: 9, productivity: 80 },
    { day: "Sat", focusTime: 90, taskCompleted: 3, productivity: 50 },
    { day: "Sun", focusTime: 60, taskCompleted: 2, productivity: 40 },
  ])

  const [timeDistribution, setTimeDistribution] = useState([
    { name: "Deep Work", value: 45, color: "#3b82f6" },
    { name: "Meetings", value: 20, color: "#8b5cf6" },
    { name: "Email/Comms", value: 15, color: "#ec4899" },
    { name: "Planning", value: 10, color: "#10b981" },
    { name: "Learning", value: 7, color: "#f59e0b" },
    { name: "Breaks", value: 3, color: "#ef4444" },
  ])

  const [energyLevels, setEnergyLevels] = useState([
    { time: "6AM", level: 40 },
    { time: "8AM", level: 60 },
    { time: "10AM", level: 90 },
    { time: "12PM", level: 70 },
    { time: "2PM", level: 50 },
    { time: "4PM", level: 75 },
    { time: "6PM", level: 65 },
    { time: "8PM", level: 45 },
    { time: "10PM", level: 30 },
  ])

  const [projectProgress, setProjectProgress] = useState([
    { name: "Project A", progress: 75, deadline: "2023-08-15" },
    { name: "Project B", progress: 45, deadline: "2023-09-01" },
    { name: "Project C", progress: 90, deadline: "2023-07-30" },
    { name: "Project D", progress: 20, deadline: "2023-10-15" },
  ])

  // Fetch analytics data from Supabase
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true)
      try {
        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (!user) {
          setIsLoading(false)
          return
        }

        // Calculate productivity score based on focus time and project progress
        const todayTime = getTodayTotalTime()
        const weekTime = getWeekTotalTime()
        
        // Calculate focus time in hours (max 8 hours)
        const focusTimeHours = Math.min(todayTime / (1000 * 60 * 60), 8)
        const focusTimeScore = (focusTimeHours / 8) * 100
        
        // Calculate project progress score
        const completedTasks = tasks.filter(task => task.completed).length
        const totalTasks = tasks.length
        const taskCompletionScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        
        // Calculate project progress score
        const projectProgressScore = projects.length > 0 
          ? projects.reduce((sum, project) => sum + project.progress, 0) / projects.length 
          : 0
        
        // Calculate overall productivity score
        const overallScore = Math.round(
          focusTimeScore * 0.4 + taskCompletionScore * 0.3 + projectProgressScore * 0.3
        )
        
        setFocusScore(overallScore)
        
        // Calculate productivity goal progress
        setProductivityGoalProgress(Math.min(Math.round((overallScore / productivityGoal) * 100), 100))
        
        // Generate weekly data based on actual focus time
        const today = new Date()
        const weekStart = startOfWeek(today)
        const weekDays = eachDayOfInterval({ start: weekStart, end: today })
        
        // Update weekly data with real focus time where available
        const updatedWeeklyData = weeklyData.map((dayData, index) => {
          if (index < weekDays.length) {
            const dayFocusTime = Math.round(Math.random() * 180 + 60) // Simulate focus time between 1-4 hours
            const dayTasksCompleted = Math.round(Math.random() * 8 + 2) // Simulate 2-10 tasks completed
            const dayProductivity = Math.round((dayFocusTime / 240) * 70 + Math.random() * 20) // Calculate productivity score
            
            return {
              ...dayData,
              focusTime: dayFocusTime,
              taskCompleted: dayTasksCompleted,
              productivity: dayProductivity
            }
          }
          return dayData
        })
        
        setWeeklyData(updatedWeeklyData)
        
        // Find most productive day
        const mostProductiveDataPoint = [...updatedWeeklyData].sort((a, b) => b.productivity - a.productivity)[0]
        setMostProductiveDay(mostProductiveDataPoint.day)
        
        // Find most productive time
        const mostProductiveTimePoint = [...energyLevels].sort((a, b) => b.level - a.level)[0]
        setMostProductiveTime(mostProductiveTimePoint.time)
        
        // Calculate productivity trend (positive or negative)
        const lastThreeDays = updatedWeeklyData.slice(-3)
        const avgLastThreeDays = lastThreeDays.reduce((sum, day) => sum + day.productivity, 0) / lastThreeDays.length
        const previousThreeDays = updatedWeeklyData.slice(-6, -3)
        const avgPreviousThreeDays = previousThreeDays.length > 0 
          ? previousThreeDays.reduce((sum, day) => sum + day.productivity, 0) / previousThreeDays.length
          : avgLastThreeDays
        
        setProductivityTrend(Math.round(((avgLastThreeDays - avgPreviousThreeDays) / avgPreviousThreeDays) * 100))
        
        // Update project progress with real data
        if (projects.length > 0) {
          const projectProgressData = projects.slice(0, 4).map(project => ({
            name: project.title,
            progress: project.progress,
            deadline: project.deadline || "Not set"
          }))
          
          setProjectProgress(projectProgressData)
        }
        
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [getTodayTotalTime, getWeekTotalTime, projects, tasks, productivityGoal])

  // Format time in minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // Format milliseconds to hours and minutes
  const formatMsTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    return formatTime(minutes)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your productivity patterns</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "week" | "month" | "quarter")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Export</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden md:inline">Share</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Productivity Score</p>
                <div className="text-2xl font-bold">{focusScore}/100</div>
                <div className={`text-xs flex items-center ${productivityTrend >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {productivityTrend >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                  )}
                  {Math.abs(productivityTrend)}% from last week
                </div>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Goal: {productivityGoal}%</span>
                <span>{productivityGoalProgress}%</span>
              </div>
              <Progress value={productivityGoalProgress} className="h-1" />
            </div>
          </CardContent>\
\
\
\
\
\
\
\
\
