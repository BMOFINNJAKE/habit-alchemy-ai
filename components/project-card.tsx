"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Play } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

interface ProjectCardProps {
  title: string
  description: string
  progress: number
  status: string
  deadline: string
  timeLogged: string
  files: number
  onClick?: () => void
}

export function ProjectCard({
  title,
  description,
  progress,
  status,
  deadline,
  timeLogged,
  files,
  onClick,
}: ProjectCardProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "on track":
        return "bg-green-500"
      case "needs attention":
        return "bg-yellow-500"
      case "at risk":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) onClick()
  }

  const handleStartSession = (e: React.MouseEvent) => {
    e.stopPropagation()
    // In a real app, this would start a session for this project
    router.push(`/session/new?project=${encodeURIComponent(title)}`)
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-blue-100 p-2 rounded text-blue-500">
            {title.startsWith("Website") && <div className="w-5 h-5">🌐</div>}
            {title.startsWith("Content") && <div className="w-5 h-5">📝</div>}
            {title.startsWith("User") && <div className="w-5 h-5">👥</div>}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(status)} mr-2`}></div>
              <span className="text-sm">{status}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Deadline</div>
            <div className="text-sm text-red-500">{deadline}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <div className="text-xs text-muted-foreground">Time Logged</div>
            <div className="text-sm">{timeLogged}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Files</div>
            <div className="text-sm">{files}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="w-full" onClick={handleViewClick}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" className="w-full" onClick={handleStartSession}>
            <Play className="h-4 w-4 mr-1" />
            Start Session
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
