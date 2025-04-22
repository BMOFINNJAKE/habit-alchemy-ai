"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { TimeBlock } from "@/types/timeBlock"
import { formatTimeForDisplay } from "@/utils/timeUtils"

interface TimeBlockProps {
  block: TimeBlock
  onDelete: (id: string) => Promise<void>
  compact?: boolean
}

export const TimeBlockComponent = ({ block, onDelete, compact = false }: TimeBlockProps) => {
  return (
    <div
      className={`p-2 rounded-md mb-1 flex justify-between items-center group hover:shadow-md transition-shadow`}
      style={{ backgroundColor: `${block.color}20`, borderLeft: `4px solid ${block.color}` }}
    >
      <div className="w-full">
        <div className={`font-medium ${compact ? "truncate" : ""}`}>{block.title}</div>
        <div className="text-xs text-muted-foreground">
          {formatTimeForDisplay(block.startTime)} - {formatTimeForDisplay(block.endTime)}
        </div>
        {!compact && block.description && <div className="text-xs mt-1 text-muted-foreground">{block.description}</div>}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
          compact ? "h-6 w-6 ml-1 flex-shrink-0" : ""
        }`}
        onClick={() => onDelete(block.id)}
      >
        <Trash2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
      </Button>
    </div>
  )
}
