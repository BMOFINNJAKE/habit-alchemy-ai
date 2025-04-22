"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { BarChart, Activity, Clock, Layers } from "lucide-react"

interface DashboardCardProps {
  title: string
  value: string
  icon: "productivity" | "focus" | "projects" | "session"
  change?: number
  onClick?: () => void
  children?: React.ReactNode
}

export function DashboardCard({ title, value, icon, change, onClick, children }: DashboardCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const getIcon = () => {
    switch (icon) {
      case "productivity":
        return <BarChart className="h-5 w-5 text-blue-500" />
      case "focus":
        return <Clock className="h-5 w-5 text-green-500" />
      case "projects":
        return <Layers className="h-5 w-5 text-purple-500" />
      case "session":
        return <Activity className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  return (
    <>
      <Card
        className={`${onClick ? "cursor-pointer" : ""} hover:shadow-md transition-shadow`}
        onClick={() => {
          if (onClick) {
            onClick()
          } else if (icon === "session") {
            setDetailsOpen(true)
          }
        }}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
              {change !== undefined && (
                <p className={`text-xs mt-1 ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {change >= 0 ? "+" : ""}
                  {change}% from last week
                </p>
              )}
            </div>
            <div className="p-2 bg-muted rounded-full">{getIcon()}</div>
          </div>
          {children && <div className="mt-4">{children}</div>}
        </CardContent>
      </Card>

      {icon === "session" && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Current Status</h4>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
                {value.includes("Active") && (
                  <div>
                    <h4 className="text-sm font-medium">Session Controls</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      You can control your active session from the floating panel at the bottom of the screen.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
