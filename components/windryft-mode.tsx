"use client"

import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function WinDryftMode() {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Pocket WinDryft Mode</h2>
        <Badge variant="outline">Personalized</Badge>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mt-1">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium">Take a strategic break</h3>
          <p className="text-sm text-muted-foreground">Recommended</p>
        </div>
      </div>

      <Button className="w-full">Apply Recommendation</Button>
    </div>
  )
}
