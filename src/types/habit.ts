
export interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekdays" | "weekends" | "weekly";
  motivation?: string;
  identity?: string;
  createdAt: string;
  streak: number;
  lastCompleted: string | null;
}
