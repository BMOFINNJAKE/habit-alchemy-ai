
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Habit } from "@/types/habit";

// Local storage key
const HABITS_STORAGE_KEY = "habits_alchemy_data";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load habits from localStorage on mount
  useEffect(() => {
    const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
    if (storedHabits) {
      try {
        setHabits(JSON.parse(storedHabits));
      } catch (error) {
        console.error("Failed to parse stored habits:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  // Add a new habit
  const addHabit = useCallback((habit: Omit<Habit, "id">) => {
    setHabits((prev) => [...prev, { ...habit, id: uuidv4() }]);
  }, []);

  // Remove a habit
  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }, []);

  // Toggle habit completion for today
  const toggleHabitCompletion = useCallback((id: string) => {
    setHabits((prev) => 
      prev.map((habit) => {
        if (habit.id !== id) return habit;

        const today = new Date().toISOString();
        const isCompletedToday = habit.lastCompleted ? 
          new Date(habit.lastCompleted).toDateString() === new Date().toDateString() : false;
        
        if (isCompletedToday) {
          // Uncomplete the habit
          return {
            ...habit,
            lastCompleted: null,
            streak: Math.max(0, habit.streak - 1)
          };
        } else {
          // Complete the habit
          return {
            ...habit,
            lastCompleted: today,
            streak: habit.streak + 1
          };
        }
      })
    );
  }, []);

  return {
    habits,
    addHabit,
    removeHabit,
    toggleHabitCompletion,
    isLoaded
  };
}
