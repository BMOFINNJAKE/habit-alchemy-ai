"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, subDays } from "date-fns"

interface InsightData {
  date: string
  focusScore: number
  tasksCompleted: number
  focusTime: number // in minutes
  energyLevel: number // 1-10
}

export function ProductivityInsights() {
  const [data, setData] = useState<InsightData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeMetric, setActiveMetric] = useState("focusScore")
  const [timeRange, setTimeRange] = useState("week")

  useEffect(() => {
    // Generate sample data
    const generateData = () => {
      const today = new Date()
      let days = 7

      if (timeRange === "month") {
        days = 30
      } else if (timeRange === "year") {
        days = 365
      }

      const data: InsightData[] = []

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(today, i)
        data.push({
          date: format(date, "yyyy-MM-dd"),
          focusScore: Math.floor(Math.random() * 40) + 60, // 60-100
          tasksCompleted: Math.floor(Math.random() * 8) + 2, // 2-10
          focusTime: Math.floor(Math.random() * 180) + 60, // 60-240 minutes
          energyLevel: Math.floor(Math.random() * 6) + 4, // 4-10
        })
      }

      return data
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setData(generateData())
      setIsLoading(false)
    }, 500)
  }, [timeRange])

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "focusScore":
        return "Focus Score"
      case "tasksCompleted":
        return "Tasks Completed"
      case "focusTime":
        return "Focus Time (min)"
      case "energyLevel":
        return "Energy Level"
      default:
        return metric
    }
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "focusScore":
        return "#3b82f6" // blue
      case "tasksCompleted":
        return "#10b981" // green
      case "focusTime":
        return "#8b5cf6" // purple
      case "energyLevel":
        return "#f59e0b" // yellow
      default:
        return "#6b7280" // gray
    }
  }

  const formatDate = (date: string) => {
    if (timeRange === "week") {
      return format(new Date(date), "EEE")
    } else if (timeRange === "month") {
      return format(new Date(date), "MMM d")
    } else {
      return format(new Date(date), "MMM")
    }
  }

  const calculateAverage = (metric: keyof InsightData) => {
    if (data.length === 0) return 0
    const sum = data.reduce((acc, item) => acc + (item[metric] as number), 0)
    return Math.round((sum / data.length) * 10) / 10
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Productivity Insights</CardTitle>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <p>Loading insights...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-blue-950/10 border-blue-900/50">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Avg. Focus Score</div>
                  <div className="text-2xl font-bold">{calculateAverage("focusScore")}</div>
                </CardContent>
              </Card>
              <Card className="bg-green-950/10 border-green-900/50">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Avg. Tasks Completed</div>
                  <div className="text-2xl font-bold">{calculateAverage("tasksCompleted")}</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-950/10 border-purple-900/50">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Avg. Focus Time</div>
                  <div className="text-2xl font-bold">{calculateAverage("focusTime")} min</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-950/10 border-yellow-900/50">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Avg. Energy Level</div>
                  <div className="text-2xl font-bold">{calculateAverage("energyLevel")}/10</div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeMetric} onValueChange={setActiveMetric}>
              <TabsList className="mb-4">
                <TabsTrigger value="focusScore">Focus Score</TabsTrigger>
                <TabsTrigger value="tasksCompleted">Tasks</TabsTrigger>
                <TabsTrigger value="focusTime">Focus Time</TabsTrigger>
                <TabsTrigger value="energyLevel">Energy</TabsTrigger>
              </TabsList>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      formatter={(value) => [value, getMetricLabel(activeMetric)]}
                      labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
                    />
                    <Line
                      type="monotone"
                      dataKey={activeMetric}
                      stroke={getMetricColor(activeMetric)}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ProductivityInsights
