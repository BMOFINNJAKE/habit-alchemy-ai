"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T, shouldParse = false): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Initialize the value from localStorage if it exists
  useEffect(() => {
    try {
      if (typeof window === "undefined") {
        return
      }

      const item = window.localStorage.getItem(key)

      if (item) {
        if (shouldParse) {
          setStoredValue(JSON.parse(item))
        } else {
          setStoredValue(item as unknown as T)
        }
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return initialValue
    }
  }, [key, initialValue, shouldParse])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to localStorage
      if (typeof window !== "undefined") {
        if (shouldParse) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } else {
          window.localStorage.setItem(key, valueToStore as unknown as string)
        }
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  }

  return [storedValue, setValue]
}
