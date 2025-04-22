"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

// A hook to get user-specific storage keys
export function useUserStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const { user } = useUser()
  const userId = user?.id || "anonymous"
  const userSpecificKey = `${userId}:${key}`

  // State to hold the current value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Load from localStorage when component mounts or user changes
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(userSpecificKey)
      setStoredValue(item ? JSON.parse(item) : initialValue)
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      setStoredValue(initialValue)
    }
  }, [userSpecificKey, initialValue])

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value)
      // Save to localStorage
      window.localStorage.setItem(userSpecificKey, JSON.stringify(value))
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  }

  return [storedValue, setValue]
}

// Function to get user-specific storage key (for use in Zustand persist middleware)
export function getUserStorageKey(key: string, userId = "anonymous") {
  return `${userId}:${key}`
}
