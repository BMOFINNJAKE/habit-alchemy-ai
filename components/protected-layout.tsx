"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { useEffect } from "react"
import { useProjectStore } from "@/lib/project-service"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { fetchUserData, initialized } = useProjectStore()

  useEffect(() => {
    if (!initialized) {
      fetchUserData()
    }
  }, [fetchUserData, initialized])

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:block" />

      {/* Content */}
      <div className="flex flex-col w-full md:pl-64">
        <MobileHeader />
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </div>
  )
}
