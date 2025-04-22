"use client"

import { Button } from "@/components/ui/button"
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
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { useSafeAuth } from "./auth-provider"

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const auth = useSafeAuth()

  const mainNavItems = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Projects", href: "/projects", icon: Layers },
    { title: "Journal", href: "/journal", icon: BookOpen },
    { title: "Analytics", href: "/analytics", icon: BarChart2 },
  ]

  const productivityItems = [
    { title: "Tools", href: "/productivity-tools", icon: Tool },
    { title: "Tips", href: "/productivity-tips", icon: Lightbulb },
    { title: "Recommendations", href: "/recommendations", icon: ThumbsUp },
  ]

  const toolsItems = [
    { title: "AI Assistant", href: "/ai-assistant", icon: MessageSquare },
    { title: "Content Tools", href: "/content-tools", icon: FileText },
    { title: "Dropshipping", href: "/dropshipping", icon: ShoppingCart },
  ]

  return (
    <div className={cn("fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r", className)}>
      <div className="flex-1 flex flex-col gap-6 p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Pocket WinDryft Pro
        </Link>

        <nav className="flex flex-col gap-2">
          {mainNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
              )}
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
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto flex items-center justify-between">
          {auth && (
            <Button variant="outline" className="mt-auto flex items-center gap-2" onClick={() => auth.signOut()}>
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
