"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Clock, CheckCircle, Calendar } from "lucide-react"
import { useProjectStore } from "@/lib/project-service"
import { useSessionStore } from "@/lib/session-service"
import DailyChecklist from "@/components/daily-checklist"
import ProductivityInsights from "@/components/productivity-insights"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { projects, tasks } = useProjectStore()
  const { getTodayTotalTime } = useSessionStore()
  const [focusTime, setFocusTime] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)
  const [activeProjects, setActiveProjects] = useState(0)

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setFocusTime(getTodayTotalTime())
      setCompletedTasks(tasks.filter((task) => task.completed).length)
      setActiveProjects(projects.filter((project) => project.progress < 100).length)
    }, 5000)

    return () => clearInterval(updateInterval)
  }, [getTodayTotalTime, projects, tasks])

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your productivity.</p>
        </div>
        <Button onClick={() => (window.location.href = "/projects")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Focus Time Today</p>
                <div className="text-2xl font-bold">{formatTime(focusTime)}</div>
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
                <div className="text-2xl font-bold">{completedTasks}</div>
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
                <div className="text-2xl font-bold">{activeProjects}</div>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyChecklist />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            project.status === "On track"
                              ? "bg-green-500"
                              : project.status === "Needs attention"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        ></div>
                        <span className="font-medium">{project.title}</span>
                      </div>
                      <span className="text-sm">{project.progress}%</span>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No projects yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => (window.location.href = "/projects")}
                      >
                        Create Project
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Productivity Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductivityInsights />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
