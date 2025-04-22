export interface TimeBlock {
  id: string
  title: string
  startTime: Date
  endTime: Date
  date: Date
  color: string
  category?: string
  description?: string
  reminder?: number | null
  recurrence?: string | null
}
