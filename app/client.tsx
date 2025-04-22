"use client"

import type React from "react"

import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { StoreProvider } from "@/lib/store-provider"
import { AIProvider } from "@/components/ai-provider"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { initializeDatabase } from "@/lib/database-setup"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize database on client-side
    initializeDatabase()
  }, [])

  return (
    <StoreProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <AIProvider>
            <ServiceWorkerRegistration />
            {children}
          </AIProvider>
        </AuthProvider>
      </ThemeProvider>
    </StoreProvider>
  )
}
