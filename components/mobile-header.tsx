"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { usePathname } from "next/navigation"

export function MobileHeader() {
  const pathname = usePathname()

  // Function to get the current page title based on the pathname
  const getPageTitle = () => {
    const path = pathname.split("/").pop() || "dashboard"
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 md:hidden">
      <div className="flex-1 pl-10">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      </div>
      <ModeToggle />
    </header>
  )
}
