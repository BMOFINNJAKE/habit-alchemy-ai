"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TimeBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  color: string
  category?: string
  description?: string
}

export default function TimeBlocking() {
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week">("day")
  const [newBlockOpen, setNewBlockOpen] = useState(false)
  const [newBlock, setNewBlock] = useState({
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "#3b82f6",
    category: "work",
    description: "",
  })
  const { toast } = useToast()

  // Generate time slots for the calendar view (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return `${hour}:00`
  })

  // Load time blocks from Supabase
  const loadBlocks = useCallback(
    async (date: Date) => {
      setIsLoading(true)
      try {
        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("User not authenticated")
        }

        let query = supabase
          .from("time_blocks")
          .select("*")
          .eq("user_id", user.id)
          .order("startTime", { ascending: true }) // Using camelCase column name

        if (viewMode === "day") {
          query = query.eq("date", format(date, "yyyy-MM-dd"))
        } else if (viewMode === "week") {
          const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
          const weekEnd = format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
          query = query.gte("date", weekStart).lte("date", weekEnd)
        }

        const { data, error } = await query

        if (error) throw error

        const formattedBlocks =
          data?.map((block: any) => ({
            id: block.id,
            title: block.title,
            startTime: block.startTime, // Using camelCase
            endTime: block.endTime, // Using camelCase
            date: block.date,
            color: block.color || "#3b82f6",
            category: block.category || "work",
            description: block.description || "",
          })) || []

        setBlocks(formattedBlocks)
      } catch (error) {
        console.error("Error loading time blocks:", error)
        toast({
          title: "Error",
          description: "Failed to load time blocks. Using local data instead.",
          variant: "destructive",
        })

        // Load from localStorage as fallback
        const savedBlocks = localStorage.getItem("time-blocks")
        if (savedBlocks) {
          try {
            const allBlocks = JSON.parse(savedBlocks)
            let filteredBlocks

            if (viewMode === "day") {
              filteredBlocks = allBlocks.filter((block: TimeBlock) => block.date === format(date, "yyyy-MM-dd"))
            } else if (viewMode === "week") {
              const weekStart = startOfWeek(date, { weekStartsOn: 1 })
              const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
              filteredBlocks = allBlocks.filter((block: TimeBlock) => {
                const blockDate = new Date(block.date)
                return blockDate >= weekStart && blockDate <= weekEnd
              })
            }

            setBlocks(filteredBlocks || [])
          } catch (e) {
            console.error("Error parsing saved blocks:", e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    },
    [viewMode, toast],
  )

  useEffect(() => {
    loadBlocks(selectedDate)
  }, [selectedDate, viewMode, loadBlocks])

  // Function to format time for display
  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const period = hour >= 12 ? "PM" : "AM"
    return `${hour % 12 || 12}:${minutes} ${period}`
  }

  // Function to get blocks for a specific time slot and date
  const getBlocksForTimeSlot = (timeSlot: string, date?: Date) => {
    return blocks.filter((block) => {
      const blockStartHour = Number.parseInt(block.startTime.split(":")[0])
      const timeSlotHour = Number.parseInt(timeSlot.split(":")[0])

      if (date && block.date !== format(date, "yyyy-MM-dd")) {
        return false
      }

      return blockStartHour === timeSlotHour
    })
  }

  // Function to handle deleting a block
  const handleDeleteBlock = async (id: string) => {
    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("time_blocks").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setBlocks(blocks.filter((block) => block.id !== id))

      toast({
        title: "Success",
        description: "Time block deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting time block:", error)
      toast({
        title: "Error",
        description: "Failed to delete time block",
        variant: "destructive",
      })

      // Still update UI
      setBlocks(blocks.filter((block) => block.id !== id))

      // Update localStorage as fallback
      const savedBlocks = localStorage.getItem("time-blocks") || "[]"
      const parsedBlocks = JSON.parse(savedBlocks)
      const updatedBlocks = parsedBlocks.filter((block: TimeBlock) => block.id !== id)
      localStorage.setItem("time-blocks", JSON.stringify(updatedBlocks))
    }
  }

  const addBlock = async () => {
    if (!newBlock.title) {
      toast({
        title: "Error",
        description: "Block title is required",
        variant: "destructive",
      })
      return
    }

    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Log the data we're about to insert for debugging
      console.log("Inserting block with data:", {
        title: newBlock.title,
        startTime: newBlock.startTime, // Using camelCase to match DB column
        endTime: newBlock.endTime, // Using camelCase to match DB column
        date: format(selectedDate, "yyyy-MM-dd"),
        color: newBlock.color,
        category: newBlock.category,
        user_id: user.id,
      })

      // Save to Supabase using camelCase column names
      const { data, error } = await supabase
        .from("time_blocks")
        .insert({
          title: newBlock.title,
          startTime: newBlock.startTime, // Using camelCase to match DB column
          endTime: newBlock.endTime, // Using camelCase to match DB column
          date: format(selectedDate, "yyyy-MM-dd"),
          color: newBlock.color,
          category: newBlock.category,
          user_id: user.id,
        })
        .select()

      if (error) throw error

      // Use the returned data with the generated ID
      if (data && data.length > 0) {
        const newBlockData = {
          id: data[0].id,
          title: data[0].title,
          startTime: data[0].startTime, // Using camelCase
          endTime: data[0].endTime, // Using camelCase
          date: data[0].date,
          color: data[0].color,
          category: data[0].category,
          description: newBlock.description,
        }

        setBlocks([...blocks, newBlockData])
      } else {
        // Fallback to local state if no data returned
        const block = {
          ...newBlock,
          id: Date.now().toString(),
          date: format(selectedDate, "yyyy-MM-dd"),
        }
        setBlocks([...blocks, block])
      }

      // Reset form
      setNewBlock({
        title: "",
        startTime: "09:00",
        endTime: "10:00",
        color: "#3b82f6",
        category: "work",
        description: "",
      })
      setNewBlockOpen(false)

      toast({
        title: "Success",
        description: "Time block added successfully",
      })
    } catch (error) {
      console.error("Error adding time block:", error)
      toast({
        title: "Error",
        description: "Failed to save time block to database. Adding locally only.",
        variant: "destructive",
      })

      // Fall back to local state
      const block = {
        ...newBlock,
        id: Date.now().toString(),
        date: format(selectedDate, "yyyy-MM-dd"),
      }
      setBlocks([...blocks, block])

      // Save to localStorage as fallback
      const savedBlocks = localStorage.getItem("time-blocks") || "[]"
      const parsedBlocks = JSON.parse(savedBlocks)
      parsedBlocks.push(block)
      localStorage.setItem("time-blocks", JSON.stringify(parsedBlocks))

      setNewBlockOpen(false)
    }
  }

  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1))
  const goToPrevDay = () => setSelectedDate(addDays(selectedDate, -1))
  const goToNextWeek = () => setSelectedDate(addDays(selectedDate, 7))
  const goToPrevWeek = () => setSelectedDate(addDays(selectedDate, -7))

  // Render day view
  const renderDayView = () => (
    <div className="space-y-0">
      {timeSlots.map((timeSlot) => {
        const blocksInSlot = getBlocksForTimeSlot(timeSlot)
        const [hour] = timeSlot.split(":")
        const hourNum = Number.parseInt(hour)
        const period = hourNum >= 12 ? "PM" : "AM"
        const displayHour = hourNum % 12 || 12
        const isCurrentHour = new Date().getHours() === hourNum
        const bgClass = isCurrentHour ? "bg-muted/30" : ""

        return (
          <div key={timeSlot} className={`grid grid-cols-[100px_1fr] border-t border-border ${bgClass}`}>
            <div className="text-sm text-muted-foreground py-3 px-2">
              {displayHour}:00 {period}
              {blocksInSlot.length === 0 && <div className="text-xs">Free time</div>}
            </div>
            <div className="py-2 min-h-[60px] pl-2">
              {blocksInSlot.map((block) => (
                <div
                  key={block.id}
                  className="p-2 rounded-md mb-1 flex justify-between items-center group hover:shadow-md transition-shadow"
                  style={{ backgroundColor: `${block.color}20`, borderLeft: `4px solid ${block.color}` }}
                >
                  <div>
                    <div className="font-medium">{block.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeForDisplay(block.startTime)} - {formatTimeForDisplay(block.endTime)}
                    </div>
                    {block.description && <div className="text-xs mt-1 text-muted-foreground">{block.description}</div>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteBlock(block.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
    })

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={format(day, "yyyy-MM-dd")} className="border rounded-md p-2">
            <div
              className={`text-center py-1 mb-2 font-medium ${isSameDay(day, new Date()) ? "bg-primary/20 rounded" : ""}`}
            >
              {format(day, "EEE")}
              <div className="text-sm">{format(day, "MMM d")}</div>
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {blocks
                .filter((block) => block.date === format(day, "yyyy-MM-dd"))
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((block) => (
                  <div
                    key={block.id}
                    className="p-2 rounded-md text-sm flex justify-between items-center group hover:shadow-sm transition-shadow"
                    style={{ backgroundColor: `${block.color}20`, borderLeft: `4px solid ${block.color}` }}
                  >
                    <div className="w-full">
                      <div className="font-medium truncate">{block.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeForDisplay(block.startTime)} - {formatTimeForDisplay(block.endTime)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 ml-1 flex-shrink-0"
                      onClick={() => handleDeleteBlock(block.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              {blocks.filter((block) => block.date === format(day, "yyyy-MM-dd")).length === 0 && (
                <div className="text-center py-2 text-xs text-muted-foreground">No blocks</div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week")} className="w-[200px]">
          <TabsList>
            <TabsTrigger value="day" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Day
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Week
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={viewMode === "day" ? goToPrevDay : goToPrevWeek}>
            <span className="sr-only">Previous</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Button>

          <div className="font-medium">{format(selectedDate, "MMMM d, yyyy")}</div>

          <Button variant="outline" size="icon" onClick={viewMode === "day" ? goToNextDay : goToNextWeek}>
            <span className="sr-only">Next</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Button>

          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="ml-2">
            Today
          </Button>
        </div>

        <Button size="sm" onClick={() => setNewBlockOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Block
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading your schedule...</p>
        </div>
      ) : viewMode === "day" ? (
        renderDayView()
      ) : (
        renderWeekView()
      )}

      <Dialog open={newBlockOpen} onOpenChange={setNewBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Block</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newBlock.title}
                onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                placeholder="Meeting, Deep Work, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newBlock.startTime}
                  onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newBlock.endTime}
                  onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newBlock.category}
                  onValueChange={(value) => setNewBlock({ ...newBlock, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex space-x-2">
                  {["#6b7280", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"].map((color) => (
                    <div
                      key={color}
                      className={`h-8 w-8 rounded-full cursor-pointer ${newBlock.color === color ? "ring-2 ring-offset-2" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewBlock({ ...newBlock, color })}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newBlock.description}
                onChange={(e) => setNewBlock({ ...newBlock, description: e.target.value })}
                placeholder="Add details about this time block"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setNewBlockOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addBlock}>Add Block</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
