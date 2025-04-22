"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Plus, Upload, Download, Bell } from "lucide-react"
import { format, addDays, startOfDay } from "date-fns"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/hooks/use-toast"
import TimeBlockCalendar from "./time-block-calendar"
import TimeBlockAgenda from "./time-block-agenda"
import AddBlockDialog from "./add-block-dialog"
import EditBlockDialog from "./edit-block-dialog"
import ReminderSettingsDialog from "./reminder-settings-dialog"
import CalendarIntegrationDialog from "./calendar-integration-dialog"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { exportToICS, importFromICS } from "@/lib/calendar-utils"
import type { TimeBlock } from "@/types/time-block"

export default function TimeBlockingModule() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "agenda">("day")
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newBlockOpen, setNewBlockOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null)
  const [reminderSettingsOpen, setReminderSettingsOpen] = useState(false)
  const [calendarIntegrationOpen, setCalendarIntegrationOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  // Load blocks from Supabase
  useEffect(() => {
    const loadBlocks = async () => {
      try {
        setIsLoading(true)

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // If no user, load from localStorage as fallback
          const savedBlocks = localStorage.getItem("time-blocks")
          if (savedBlocks) {
            try {
              setBlocks(JSON.parse(savedBlocks))
            } catch (e) {
              console.error("Error parsing saved blocks:", e)
            }
          }
          setIsLoading(false)
          return
        }

        // Fetch blocks for the current date range
        let query = supabase.from("time_blocks").select("*").eq("user_id", user.id)

        if (viewMode === "day") {
          const dateString = format(selectedDate, "yyyy-MM-dd")
          query = query.eq("date", dateString)
        } else if (viewMode === "week") {
          const startDate = format(
            new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate() - selectedDate.getDay(),
            ),
            "yyyy-MM-dd",
          )
          const endDate = format(
            new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate() - selectedDate.getDay() + 6,
            ),
            "yyyy-MM-dd",
          )
          query = query.gte("date", startDate).lte("date", endDate)
        } else {
          // For agenda view, get blocks for next 30 days
          const startDate = format(selectedDate, "yyyy-MM-dd")
          const endDate = format(addDays(selectedDate, 30), "yyyy-MM-dd")
          query = query.gte("date", startDate).lte("date", endDate)
        }

        const { data, error } = await query.order("start_time")

        if (error) throw error

        const formattedBlocks = data.map((block: any) => ({
          id: block.id,
          title: block.title,
          startTime: new Date(`${block.date}T${block.start_time}`),
          endTime: new Date(`${block.date}T${block.end_time}`),
          date: new Date(block.date),
          color: block.color || "#3b82f6",
          category: block.category || "work",
          description: block.description || "",
          reminder: block.reminder || null,
          recurrence: block.recurrence || null,
        }))

        setBlocks(formattedBlocks)
      } catch (error) {
        console.error("Error loading time blocks:", error)
        toast({
          title: "Error loading schedule",
          description: "We couldn't load your schedule. Please try again later.",
          variant: "destructive",
        })

        // Load from localStorage as fallback
        const savedBlocks = localStorage.getItem("time-blocks")
        if (savedBlocks) {
          try {
            setBlocks(JSON.parse(savedBlocks))
          } catch (e) {
            console.error("Error parsing saved blocks:", e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadBlocks()
  }, [selectedDate, viewMode, supabase, toast])

  // Save blocks to localStorage for offline access
  useEffect(() => {
    if (blocks.length > 0) {
      localStorage.setItem("time-blocks", JSON.stringify(blocks))
    }
  }, [blocks])

  // Add a new block
  const handleAddBlock = async (newBlock: Omit<TimeBlock, "id">) => {
    try {
      const blockId = uuidv4()
      const block: TimeBlock = {
        id: blockId,
        ...newBlock,
      }

      // Try to save to Supabase if user is authenticated
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Convert to DB format
          const dbBlock = {
            id: block.id,
            title: block.title,
            start_time: format(block.startTime, "HH:mm"),
            end_time: format(block.endTime, "HH:mm"),
            date: format(block.date, "yyyy-MM-dd"),
            color: block.color,
            category: block.category,
            description: block.description,
            reminder: block.reminder,
            recurrence: block.recurrence,
            user_id: user.id,
          }

          const { error } = await supabase.from("time_blocks").insert([dbBlock])
          if (error) throw error
        }
      } catch (error) {
        console.error("Error saving to Supabase:", error)
        // Continue with local storage save even if Supabase fails
      }

      // Always update local state
      setBlocks([...blocks, block])

      toast({
        title: "Block added",
        description: "Your time block has been added to your schedule.",
      })

      // Set reminder if enabled
      if (block.reminder) {
        scheduleReminder(block)
      }
    } catch (error) {
      console.error("Error adding time block:", error)
      toast({
        title: "Error adding block",
        description: "Your block was saved locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })
    }
  }

  // Update an existing block
  const handleUpdateBlock = async (updatedBlock: TimeBlock) => {
    try {
      // Try to update in Supabase
      try {
        // Convert to DB format
        const dbBlock = {
          title: updatedBlock.title,
          start_time: format(updatedBlock.startTime, "HH:mm"),
          end_time: format(updatedBlock.endTime, "HH:mm"),
          date: format(updatedBlock.date, "yyyy-MM-dd"),
          color: updatedBlock.color,
          category: updatedBlock.category,
          description: updatedBlock.description,
          reminder: updatedBlock.reminder,
          recurrence: updatedBlock.recurrence,
        }

        const { error } = await supabase.from("time_blocks").update(dbBlock).eq("id", updatedBlock.id)
        if (error) throw error
      } catch (error) {
        console.error("Error updating in Supabase:", error)
        // Continue with local update even if Supabase fails
      }

      // Always update local state
      setBlocks(blocks.map((block) => (block.id === updatedBlock.id ? updatedBlock : block)))

      toast({
        title: "Block updated",
        description: "Your time block has been updated.",
      })

      // Update reminder if enabled
      if (updatedBlock.reminder) {
        scheduleReminder(updatedBlock)
      }
    } catch (error) {
      console.error("Error updating time block:", error)
      toast({
        title: "Error updating block",
        description: "Your changes were saved locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })
    }
  }

  // Delete a block
  const handleDeleteBlock = async (id: string) => {
    try {
      // Try to delete from Supabase
      try {
        const { error } = await supabase.from("time_blocks").delete().eq("id", id)
        if (error) throw error
      } catch (error) {
        console.error("Error deleting from Supabase:", error)
        // Continue with local deletion even if Supabase fails
      }

      // Always update local state
      setBlocks(blocks.filter((block) => block.id !== id))

      toast({
        title: "Block deleted",
        description: "Your time block has been removed from your schedule.",
      })
    } catch (error) {
      console.error("Error deleting time block:", error)
      toast({
        title: "Error deleting block",
        description: "The block was removed locally but we couldn't sync this change to the cloud.",
        variant: "destructive",
      })
    }
  }

  // Handle drag and drop repositioning
  const handleMoveBlock = async (id: string, newStartTime: Date) => {
    const blockToMove = blocks.find((block) => block.id === id)
    if (!blockToMove) return

    // Calculate the duration of the block
    const duration = blockToMove.endTime.getTime() - blockToMove.startTime.getTime()

    // Create new end time maintaining the same duration
    const newEndTime = new Date(newStartTime.getTime() + duration)

    // Create updated block
    const updatedBlock = {
      ...blockToMove,
      startTime: newStartTime,
      endTime: newEndTime,
      date: startOfDay(newStartTime),
    }

    // Call the update handler
    await handleUpdateBlock(updatedBlock)
  }

  // Schedule a notification reminder
  const scheduleReminder = (block: TimeBlock) => {
    if (!block.reminder || !("Notification" in window)) return

    // Request notification permission if not granted
    if (Notification.permission !== "granted") {
      Notification.requestPermission()
    }

    const reminderTime = new Date(block.startTime.getTime() - block.reminder * 60 * 1000)
    const now = new Date()

    // Only schedule if reminder is in the future
    if (reminderTime > now) {
      const timeoutId = setTimeout(() => {
        new Notification(`Reminder: ${block.title}`, {
          body: `Your time block starts in ${block.reminder} minutes.`,
          icon: "/favicon.ico",
        })
      }, reminderTime.getTime() - now.getTime())

      // Store timeout ID to clear it if needed
      return timeoutId
    }
  }

  // Export calendar to ICS file
  const handleExportCalendar = () => {
    try {
      const filename = `calendar-export-${format(new Date(), "yyyy-MM-dd")}.ics`
      const icsContent = exportToICS(blocks)

      const blob = new Blob([icsContent], { type: "text/calendar" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Calendar exported",
        description: "Your calendar has been exported as an ICS file.",
      })
    } catch (error) {
      console.error("Error exporting calendar:", error)
      toast({
        title: "Export failed",
        description: "We couldn't export your calendar. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Import calendar from ICS file
  const handleImportCalendar = () => {
    fileInputRef.current?.click()
  }

  const processImportedFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()

      reader.onload = async (event) => {
        const content = event.target?.result as string
        const importedBlocks = importFromICS(content)

        // Try to save to Supabase if user is authenticated
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // Convert to DB format
            const dbBlocks = importedBlocks.map((block) => ({
              id: uuidv4(),
              title: block.title,
              start_time: format(block.startTime, "HH:mm"),
              end_time: format(block.endTime, "HH:mm"),
              date: format(block.date, "yyyy-MM-dd"),
              color: block.color || "#3b82f6",
              category: block.category || "imported",
              description: block.description || "",
              user_id: user.id,
            }))

            const { error } = await supabase.from("time_blocks").insert(dbBlocks)
            if (error) throw error
          }
        } catch (error) {
          console.error("Error saving imported blocks to Supabase:", error)
          // Continue with local storage save even if Supabase fails
        }

        // Add IDs to imported blocks if they don't have them
        const blocksWithIds = importedBlocks.map((block) => ({
          ...block,
          id: block.id || uuidv4(),
        }))

        // Always update local state
        setBlocks([...blocks, ...blocksWithIds])

        toast({
          title: "Calendar imported",
          description: `Successfully imported ${importedBlocks.length} events.`,
        })
      }

      reader.readAsText(file)
    } catch (error) {
      console.error("Error importing calendar:", error)
      toast({
        title: "Import failed",
        description: "We couldn't import your calendar. Please check the file format and try again.",
        variant: "destructive",
      })
    } finally {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Navigation functions
  const goToToday = () => setSelectedDate(new Date())
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1))
  const goToPrevDay = () => setSelectedDate(addDays(selectedDate, -1))
  const goToNextWeek = () => setSelectedDate(addDays(selectedDate, 7))
  const goToPrevWeek = () => setSelectedDate(addDays(selectedDate, -7))

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Time Blocking Schedule</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop blocks to reschedule. Double-click to edit.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week" | "agenda")}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={handleImportCalendar} className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleExportCalendar} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setReminderSettingsOpen(true)}
              className="flex items-center gap-1"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Reminders</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarIntegrationOpen(true)}
              className="flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Sync</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setNewBlockOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Block</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between my-4">
          <Button variant="outline" size="icon" onClick={viewMode === "day" ? goToPrevDay : goToPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="font-medium">{format(selectedDate, "MMMM d, yyyy")}</span>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={viewMode === "day" ? goToNextDay : goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="mt-2">
            {viewMode === "agenda" ? (
              <TimeBlockAgenda
                blocks={blocks}
                selectedDate={selectedDate}
                onEditBlock={setEditingBlock}
                onDeleteBlock={handleDeleteBlock}
              />
            ) : (
              <TimeBlockCalendar
                blocks={blocks}
                selectedDate={selectedDate}
                viewMode={viewMode}
                onMoveBlock={handleMoveBlock}
                onEditBlock={setEditingBlock}
                onDeleteBlock={handleDeleteBlock}
              />
            )}
          </div>
        )}

        {/* Hidden file input for import */}
        <input type="file" ref={fileInputRef} accept=".ics,.ical" className="hidden" onChange={processImportedFile} />

        {/* Dialogs */}
        <AddBlockDialog
          open={newBlockOpen}
          onOpenChange={setNewBlockOpen}
          onAddBlock={handleAddBlock}
          selectedDate={selectedDate}
        />

        {editingBlock && (
          <EditBlockDialog
            open={!!editingBlock}
            onOpenChange={() => setEditingBlock(null)}
            block={editingBlock}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
          />
        )}

        <ReminderSettingsDialog open={reminderSettingsOpen} onOpenChange={setReminderSettingsOpen} />

        <CalendarIntegrationDialog open={calendarIntegrationOpen} onOpenChange={setCalendarIntegrationOpen} />
      </div>
    </DndProvider>
  )
}
