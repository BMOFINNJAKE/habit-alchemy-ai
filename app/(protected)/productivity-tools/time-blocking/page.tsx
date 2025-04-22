"use client"

import TimeBlocking from "@/components/time-blocking"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TimeBlockingPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Time Blocking</CardTitle>
          <p className="text-sm text-muted-foreground">Plan your day by blocking time for specific activities</p>
        </CardHeader>
        <CardContent>
          <TimeBlocking />
        </CardContent>
      </Card>
    </div>
  )
}
