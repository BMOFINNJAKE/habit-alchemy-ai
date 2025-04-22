"use client"

import { Button } from "@/components/ui/button"
import type { Resource } from "@/components/dropshipping/types"

interface ResourceCardProps {
  resource: Resource
  onView: (resourceId: string) => void
}

export function ResourceCard({ resource, onView }: ResourceCardProps) {
  return (
    <div className="p-3 border rounded-md mb-4">
      <h3 className="font-medium mb-1">{resource.title}</h3>
      <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
      <Button variant="outline" size="sm" onClick={() => onView(resource.id)}>
        View Guide
      </Button>
    </div>
  )
}
