import type { TimeBlock } from "@/types/timeBlock"
import { TimeBlockComponent } from "./TimeBlock"

interface TimeSlotProps {
  timeSlot: string
  blocks: TimeBlock[]
  onDeleteBlock: (id: string) => Promise<void>
}

export const TimeSlot = ({ timeSlot, blocks, onDeleteBlock }: TimeSlotProps) => {
  const [hour] = timeSlot.split(":")
  const hourNum = Number.parseInt(hour)
  const period = hourNum >= 12 ? "PM" : "AM"
  const displayHour = hourNum % 12 || 12
  const isCurrentHour = new Date().getHours() === hourNum
  const bgClass = isCurrentHour ? "bg-muted/30" : ""

  return (
    <div key={timeSlot} className={`grid grid-cols-[100px_1fr] border-t border-border ${bgClass}`}>
      <div className="text-sm text-muted-foreground py-3 px-2">
        {displayHour}:00 {period}
        {blocks.length === 0 && <div className="text-xs">Free time</div>}
      </div>
      <div className="py-2 min-h-[60px] pl-2">
        {blocks.map((block) => (
          <TimeBlockComponent key={block.id} block={block} onDelete={onDeleteBlock} />
        ))}
      </div>
    </div>
  )
}
