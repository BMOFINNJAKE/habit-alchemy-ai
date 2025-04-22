export interface TimeBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  color: string
  category?: string
  description?: string
}

export interface NewTimeBlock {
  title: string
  startTime: string
  endTime: string
  color: string
  category: string
  description: string
}
