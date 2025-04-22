"use client"

import { useState, useRef, useMemo } from "react"
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, getHours, getMinutes } from "date-fns"
import { useDrop } from "react-dnd"
import type { TimeBlock } from "@/types/time-block"
import DraggableTimeBlock from "./draggable-time-block"

interface TimeBlockCalendarProps {
  blocks: TimeBlock[]
  selectedDate: Date
  viewMode: "day" | "week"
  onMoveBlock: (id: string, newStartTime: Date) => void
  onEditBlock: (block: TimeBlock) => void
  onDeleteBlock: (id: string) => void
}

export default function TimeBlockCalendar({
  blocks,
  selectedDate,
  viewMode,
  onMoveBlock,
  onEditBlock,
  onDeleteBlock,
}: TimeBlockCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null)
  const [highlightedHour, setHighlightedHour] = useState<number | null>(null)

  // Generate the time slots (00:00 to 23:45 in 15-minute increments)
  const timeSlots = useMemo(() => {
    return Array.from({ length: 24 * 4 }, (_, i) => {
      const hour = Math.floor(i / 4)
      const minute = (i % 4) * 15
      return { hour, minute }
    })
  }, [])

  // Calculate the days to display based on view mode
  const daysToDisplay = useMemo(() => {
    if (viewMode === "day") {
      return [selectedDate]
    } else {
      // Week view - start on Sunday
      const start = startOfWeek(selectedDate)
      const end = endOfWeek(selectedDate)
      return eachDayOfInterval({ start, end })
    }
  }, [selectedDate, viewMode])

  // Format the time slot for display
  const formatTimeSlot = (hour: number, minute: number) => {
    const formattedHour = hour % 12 || 12
    const period = hour >= 12 ? "PM" : "AM"
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`
  }

  // Filter blocks for the visible days
  const visibleBlocks = useMemo(() => {
    return blocks.filter((block) => daysToDisplay.some((day) => isSameDay(day, block.date)))
  }, [blocks, daysToDisplay])

  // Calculate the position for a block based on its start time
  const getBlockPosition = (block: TimeBlock, day: Date) => {
    if (!isSameDay(block.date, day)) return null

    const startHour = getHours(block.startTime)
    const startMinute = getMinutes(block.startTime)
    const endHour = getHours(block.endTime)
    const endMinute = getMinutes(block.endTime)

    // Calculate top position based on start time
    const startIndex = startHour * 4 + Math.floor(startMinute / 15)
    // Calculate height based on duration
    const endIndex = endHour * 4 + Math.floor(endMinute / 15)
    const height = endIndex - startIndex

    return { startIndex, height }
  }

  // Create drop targets for each time slot
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "timeBlock",
    drop: (item: { id: string }, monitor) => {
      const dropPosition = monitor.getClientOffset()
      if (!dropPosition || !calendarRef.current) return

      const calendarRect = calendarRef.current.getBoundingClientRect()
      const relativeY = dropPosition.y - calendarRect.top
      const relativeX = dropPosition.x - calendarRect.left

      // Calculate which day was dropped on (for week view)
      const dayIndex = viewMode === "week" ? Math.min(Math.floor(relativeX / (calendarRect.width / 7)), 6) : 0

      // Calculate which time slot was dropped on
      const slotHeight = 15 // height of each 15-minute slot in pixels
      const timeSlotIndex = Math.floor(relativeY / slotHeight)
      const hour = Math.floor(timeSlotIndex / 4)
      const minute = (timeSlotIndex % 4) * 15

      // Create the new start time
      const day = daysToDisplay[dayIndex]
      const newStartTime = new Date(day)
      newStartTime.setHours(hour, minute, 0, 0)

      onMoveBlock(item.id, newStartTime)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
    hover: (item, monitor) => {
      const dropPosition = monitor.getClientOffset()
      if (!dropPosition || !calendarRef.current) return

      const calendarRect = calendarRef.current.getBoundingClientRect()
      const relativeY = dropPosition.y - calendarRect.top

      // Calculate which hour is being hovered
      const slotHeight = 15
      const timeSlotIndex = Math.floor(relativeY / slotHeight)
      const hour = Math.floor(timeSlotIndex / 4)

      setHighlightedHour(hour)
    },
  }))

  return (
    <div
      ref={(el) => {
        calendarRef.current = el
        drop(el)
      }}
      className={`border rounded-lg overflow-auto ${isOver ? "bg-primary/5" : ""}`}
      style={{ height: "600px" }}
    >
      <div className="sticky top-0 z-10 flex border-b bg-background">
        {/* Time column header */}
        <div className="w-20 shrink-0"></div>

        {/* Day columns header */}
        {daysToDisplay.map((day, i) => (
          <div
            key={i}
            className={`flex-1 p-2 text-center font-medium border-l ${
              isSameDay(day, new Date()) ? "bg-primary/10" : ""
            }`}
          >
            <div>{format(day, "EEE")}</div>
            <div className="text-sm text-muted-foreground">{format(day, "MMM d")}</div>
          </div>
        ))}
      </div>

      <div className="relative flex">
        {/* Time labels column */}
        <div className="w-20 shrink-0">
          {timeSlots.map(
            (slot, i) =>
              slot.minute === 0 && (
                <div
                  key={i}
                  className="h-[60px] border-t flex items-start justify-end pr-2 text-xs text-muted-foreground"
                >
                  {formatTimeSlot(slot.hour, slot.minute)}
                </div>
              ),
          )}
        </div>

        {/* Day columns */}
        {daysToDisplay.map((day, dayIndex) => (
          <div key={dayIndex} className="flex-1 relative border-l">
            {/* Time slot grid */}
            {timeSlots.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className={`h-[15px] border-t ${slot.hour === highlightedHour ? "bg-primary/5" : ""} ${
                  slot.hour === new Date().getHours() && isSameDay(day, new Date()) ? "bg-primary/10" : ""
                }`}
              ></div>
            ))}

            {/* Blocks for this day */}
            {visibleBlocks.map((block) => {
              const position = getBlockPosition(block, day)
              if (!position) return null

              return (
                <DraggableTimeBlock
                  key={block.id}
                  block={block}
                  startIndex={position.startIndex}
                  height={position.height}
                  onEdit={() => onEditBlock(block)}
                  onDelete={() => onDeleteBlock(block.id)}
                />
              )
            })}
          </div>
        ))}

        {/* Current time indicator */}
        {daysToDisplay.some((day) => isSameDay(day, new Date())) && (
          <div
            className="absolute w-full border-t border-red-500 z-10"
            style={{
              top: `${((getHours(new Date()) * 60 + getMinutes(new Date())) / 15) * 15}px`,
            }}
          >
            <div className="relative">
              <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-red-500"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
