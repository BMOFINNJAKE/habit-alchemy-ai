"use client"

import { useMemo } from "react"
import { format, isSameDay, addDays, compareAsc } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, ArrowRight } from "lucide-react"
import type { TimeBlock } from "@/types/time-block"

interface TimeBlockAgendaProps {
  blocks: TimeBlock[]
  selectedDate: Date
  onEditBlock: (block: TimeBlock) => void
  onDeleteBlock: (id: string) => void
}

export default function TimeBlockAgenda({ blocks, selectedDate, onEditBlock, onDeleteBlock }: TimeBlockAgendaProps) {
  // Group blocks by date
  const groupedBlocks = useMemo(() => {
    // Show 30 days from selected date
    const days: Date[] = []
    for (let i = 0; i < 30; i++) {
      days.push(addDays(selectedDate, i))
    }

    const grouped = days.map((day) => {
      const dateBlocks = blocks
        .filter((block) => isSameDay(block.date, day))
        .sort((a, b) => compareAsc(a.startTime, b.startTime))

      return {
        date: day,
        blocks: dateBlocks,
      }
    })

    // Filter out days with no blocks
    return grouped.filter((group) => group.blocks.length > 0)
  }, [blocks, selectedDate])

  // Format time for display
  const formatTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  // Calculate block duration in minutes
  const getBlockDuration = (block: TimeBlock) => {
    const durationMs = block.endTime.getTime() - block.startTime.getTime()
    return Math.round(durationMs / (1000 * 60))
  }

  if (groupedBlocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h3 className="text-lg font-medium">No upcoming time blocks</h3>
        <p className="text-muted-foreground mt-2">Your schedule is clear for the next 30 days.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groupedBlocks.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          <div className="sticky top-0 z-10 bg-background pt-4 pb-2">
            <h3 className="text-lg font-semibold">
              {isSameDay(group.date, new Date())
                ? "Today"
                : isSameDay(group.date, addDays(new Date(), 1))
                  ? "Tomorrow"
                  : format(group.date, "EEEE, MMMM d")}
            </h3>
          </div>

          {group.blocks.map((block) => (
            <Card key={block.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div
                  className="w-2 h-full absolute left-0 top-0 bottom-0"
                  style={{ backgroundColor: block.color }}
                ></div>
                <div className="p-4 pl-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{block.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span>{formatTime(block.startTime)}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span>{formatTime(block.endTime)}</span>
                        <span className="ml-2">({getBlockDuration(block)} min)</span>
                      </div>
                      {block.description && <p className="text-sm mt-2">{block.description}</p>}
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => onEditBlock(block)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteBlock(block.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {block.category && (
                    <div className="mt-2">
                      <span
                        className="inline-block px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${block.color}20`,
                          color: block.color,
                        }}
                      >
                        {block.category}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
