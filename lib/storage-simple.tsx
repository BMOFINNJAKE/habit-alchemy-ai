// lib/storage-simple.tsx
"use client"

const storage = {
  get: <T,>(key: string, defaultValue: T, isJson = false): T => {
    try {
      if (typeof window === "undefined") {
        return defaultValue
      }

      const storedValue = localStorage.getItem(key)
      if (storedValue === null) {
        return defaultValue
      }
      return isJson ? JSON.parse(storedValue) : (storedValue as T)
    } catch (error) {
      console.error(`Error getting item from localStorage: ${error}`)
      return defaultValue
    }
  },

  set: <T,>(key: string, value: T, isJson = false): void => {
    try {
      if (typeof window === "undefined") {
        return
      }

      const valueToStore = isJson ? JSON.stringify(value) : String(value)
      localStorage.setItem(key, valueToStore)
    } catch (error) {
      console.error(`Error setting item in localStorage: ${error}`)
    }
  },

  remove: (key: string): void => {
    try {
      if (typeof window === "undefined") {
        return
      }

      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from localStorage: ${error}`)
    }
  },

  clear: (): void => {
    try {
      if (typeof window === "undefined") {
        return
      }

      localStorage.clear()
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`)
    }
  },
}

export default storage
