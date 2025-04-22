import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ResourceCard } from "@/components/dropshipping/resource-card"
import type { Resource } from "@/components/dropshipping/types"

interface ResourceSectionProps {
  beginnerResources: Resource[]
  advancedResources: Resource[]
  onViewResource: (resourceId: string) => void
}

export function ResourceSection({ beginnerResources, advancedResources, onViewResource }: ResourceSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Getting Started with Dropshipping</CardTitle>
          <CardDescription>Essential resources for beginners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {beginnerResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onView={onViewResource} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Strategies</CardTitle>
          <CardDescription>Take your dropshipping business to the next level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {advancedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onView={onViewResource} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
