"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import {
  Home,
  BarChart2,
  BookOpen,
  LogOut,
  PenToolIcon as Tool,
  Lightbulb,
  ThumbsUp,
  MessageSquare,
  FileText,
  Layers,
  ShoppingCart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useSafeAuth } from "./auth-provider"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const auth = useSafeAuth()

  const handleLogout = () => {
    auth?.signOut()
    setOpen(false)
  }

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: Layers,
    },
    {
      title: "Journal",
      href: "/journal",
      icon: BookOpen,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart2,
    },
  ]

  const productivityItems = [
    {
      title: "Tools",
      href: "/productivity-tools",
      icon: Tool,
    },
    {
      title: "Tips",
      href: "/productivity-tips",
      icon: Lightbulb,
    },
    {
      title: "Recommendations",
      href: "/recommendations",
      icon: ThumbsUp,
    },
  ]

  const toolsItems = [
    {
      title: "AI Assistant",
      href: "/ai-assistant",
      icon: MessageSquare,
    },
    {
      title: "Content Tools",
      href: "/content-tools",
      icon: FileText,
    },
    {
      title: "Dropshipping",
      href: "/dropshipping",
      icon: ShoppingCart,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-40">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex flex-col gap-6 p-4">
          <nav className="flex flex-col gap-2">
            {mainNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                  pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          <div>
            <h3 className="px-3 text-xs font-semibold text-foreground/70 uppercase tracking-wider">Productivity</h3>
            <nav className="mt-2 flex flex-col gap-2">
              {productivityItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                    pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-foreground/70 uppercase tracking-wider">Tools</h3>
            <nav className="mt-2 flex flex-col gap-2">
              {toolsItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                    pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <Button variant="outline" className="mt-auto flex items-center gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
