"use client"

import { SmartTaskPrioritization } from "@/components/smart-task-prioritization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TaskPrioritizationPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Task Prioritization</CardTitle>
          <p className="text-sm text-muted-foreground">Organize your tasks using the Eisenhower Matrix</p>
        </CardHeader>
        <CardContent>
          <SmartTaskPrioritization />
        </CardContent>
      </Card>
    </div>
  )
}
