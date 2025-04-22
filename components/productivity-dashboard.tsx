"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTimeBlockStore } from "@/lib/time-block-service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function ProductivityDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { timeBlocks } = useTimeBlockStore()

  // Calculate time spent by category
  const timeByCategory = timeBlocks.reduce(
    (acc, block) => {
      const category = block.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += block.duration
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(timeByCategory).map(([name, value]) => ({
    name,
    value,
  }))

  // Sample data for weekly productivity
  const weeklyData = [
    { day: "Mon", minutes: 240 },
    { day: "Tue", minutes: 180 },
    { day: "Wed", minutes: 300 },
    { day: "Thu", minutes: 270 },
    { day: "Fri", minutes: 210 },
    { day: "Sat", minutes: 120 },
    { day: "Sun", minutes: 90 },
  ]

  // Sample data for task completion
  const taskCompletionData = [
    { name: "Completed", value: 67 },
    { name: "Pending", value: 33 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity Dashboard</CardTitle>
        <CardDescription>Visualize your productivity data and insights</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="time">Time Analysis</TabsTrigger>
            <TabsTrigger value="tasks">Task Completion</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Weekly Focus Time</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} min`, "Focus Time"]} />
                      <Bar dataKey="minutes" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Time by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} min`, "Duration"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Productivity by Hour</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { hour: "8AM", productivity: 65 },
                      { hour: "9AM", productivity: 80 },
                      { hour: "10AM", productivity: 95 },
                      { hour: "11AM", productivity: 90 },
                      { hour: "12PM", productivity: 60 },
                      { hour: "1PM", productivity: 50 },
                      { hour: "2PM", productivity: 75 },
                      { hour: "3PM", productivity: 85 },
                      { hour: "4PM", productivity: 70 },
                      { hour: "5PM", productivity: 60 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Productivity"]} />
                    <Bar dataKey="productivity" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Task Completion Rate</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskCompletionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#4CAF50" />
                        <Cell fill="#FFC107" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Task Completion by Priority</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { priority: "High", completed: 85, pending: 15 },
                        { priority: "Medium", completed: 65, pending: 35 },
                        { priority: "Low", completed: 40, pending: 60 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" stackId="a" fill="#4CAF50" name="Completed" />
                      <Bar dataKey="pending" stackId="a" fill="#FFC107" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
