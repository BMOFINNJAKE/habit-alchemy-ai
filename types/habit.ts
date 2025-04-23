
export interface Habit {
  id: string
  name: string
  description?: string
  frequency: "daily" | "weekly" | "monthly"
  frequency_config?: {
    days?: string[] | number[]
    [key: string]: any
  }
  category: string
  color?: string
  icon?: string
  target?: number
  start_date?: string
  end_date?: string
  user_id: string
  identity?: string
  system?: string
  ai_suggestions?: boolean
}

export interface HabitLog {
  id: string
  habit_id: string
  date: string
  value?: number
  user_id: string
  created_at: string
}
