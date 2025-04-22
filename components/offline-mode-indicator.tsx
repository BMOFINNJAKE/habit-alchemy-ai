"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function OfflineModeIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      // Hide the reconnected message after 5 seconds
      setTimeout(() => setShowReconnected(false), 5000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOnline) {
    return (
      <Alert variant="destructive" className="fixed bottom-4 right-4 max-w-md z-50">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>You're offline</AlertTitle>
        <AlertDescription>
          Some features may be unavailable. We'll automatically reconnect when your internet connection is restored.
        </AlertDescription>
      </Alert>
    )
  }

  if (showReconnected) {
    return (
      <Alert
        variant="default"
        className="fixed bottom-4 right-4 max-w-md z-50 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
      >
        <Wifi className="h-4 w-4" />
        <AlertTitle>Connected</AlertTitle>
        <AlertDescription>Your internet connection has been restored.</AlertDescription>
      </Alert>
    )
  }

  return null
}
