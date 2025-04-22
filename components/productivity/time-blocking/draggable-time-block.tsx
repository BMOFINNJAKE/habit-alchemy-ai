"use client"

import { useState, useRef } from "react"
import { useDrag } from "react-dnd"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2 } from "lucide-react"
import type { TimeBlock } from "@/types/time-block"

interface DraggableTimeBlockProps {
  block: TimeBlock
  startIndex: number
  height: number
  onEdit: () => void
  onDelete: () => void
}

export default function DraggableTimeBlock({ block, startIndex, height, onEdit, onDelete }: DraggableTimeBlockProps) {
  const [showControls, setShowControls] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "timeBlock",
    item: { id: block.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const formatTimeRange = () => {
    const formatTime = (dateStr: string | Date) => {
      // Ensure we have a proper Date object
      const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr

      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "Invalid time"
      }

      const hours = date.getHours() % 12 || 12
      const minutes = date.getMinutes().toString().padStart(2, "0")
      const period = date.getHours() >= 12 ? "PM" : "AM"
      return `${hours}:${minutes} ${period}`
    }

    return `${formatTime(block.startTime)} - ${formatTime(block.endTime)}`
  }

  const handleDoubleClick = () => {
    onEdit()
  }

  return (
    <div
      ref={(el) => {
        blockRef.current = el
        drag(el)
      }}
      className={`absolute left-0 right-0 m-1 p-2 rounded-md cursor-grab transition-opacity duration-200 overflow-hidden ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{
        top: `${startIndex * 15}px`,
        height: `${height * 15}px`,
        backgroundColor: `${block.color}20`,
        borderLeft: `4px solid ${block.color}`,
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex flex-col h-full">
        <div className="font-medium text-sm truncate">{block.title}</div>
        <div className="text-xs text-muted-foreground">{formatTimeRange()}</div>
        {block.category && (
          <div className="text-xs mt-auto">
            <span
              className="inline-block px-1.5 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: `${block.color}30`,
                color: block.color,
              }}
            >
              {block.category}
            </span>
          </div>
        )}

        {/* Block controls */}
        {showControls && (
          <div className="absolute top-1 right-1 flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 bg-background/80 hover:bg-background"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 bg-background/80 hover:bg-background hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
