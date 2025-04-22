"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { TimeBlock } from "@/types/time-block"
import { startOfDay, addHours, format } from "date-fns"

const BLOCK_CATEGORIES = [
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "health", label: "Health & Fitness" },
  { value: "learning", label: "Learning" },
  { value: "social", label: "Social" },
  { value: "meeting", label: "Meeting" },
  { value: "focus", label: "Focus Time" },
]

const COLOR_OPTIONS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#ef4444", label: "Red" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6b7280", label: "Gray" },
]

const REMINDER_OPTIONS = [
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
]

const RECURRENCE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "weekdays", label: "Weekdays (Mon-Fri)" },
  { value: "monthly", label: "Monthly" },
]

interface AddBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddBlock: (block: Omit<TimeBlock, "id">) => void
  selectedDate: Date
}

export default function AddBlockDialog({ open, onOpenChange, onAddBlock, selectedDate }: AddBlockDialogProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false)

  // Set default times (9 AM - 10 AM on selected date)
  const baseDate = startOfDay(selectedDate)
  const defaultStartTime = addHours(baseDate, 9)
  const defaultEndTime = addHours(baseDate, 10)

  const [formState, setFormState] = useState({
    title: "",
    startTime: defaultStartTime,
    endTime: defaultEndTime,
    date: selectedDate,
    color: "#3b82f6",
    category: "work",
    description: "",
    reminder: null as number | null,
    recurrence: null as string | null,
  })

  const resetForm = () => {
    setFormState({
      title: "",
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      date: selectedDate,
      color: "#3b82f6",
      category: "work",
      description: "",
      reminder: null,
      recurrence: null,
    })
    setShowAdvanced(false)
    setReminderEnabled(false)
    setRecurrenceEnabled(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!formState.title.trim()) {
      // Show error
      return
    }

    const newBlock: Omit<TimeBlock, "id"> = {
      ...formState,
      // Only include reminder if enabled
      reminder: reminderEnabled ? formState.reminder : null,
      // Only include recurrence if enabled
      recurrence: recurrenceEnabled ? formState.recurrence : null,
    }

    onAddBlock(newBlock)
    handleClose()
  }

  const updateFormState = (key: keyof typeof formState, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateStartTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const newStartTime = new Date(formState.date)
    newStartTime.setHours(hours, minutes, 0, 0)

    updateFormState("startTime", newStartTime)

    // If end time is before start time, update it
    if (formState.endTime < newStartTime) {
      const newEndTime = new Date(newStartTime)
      newEndTime.setHours(newStartTime.getHours() + 1)
      updateFormState("endTime", newEndTime)
    }
  }

  const updateEndTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const newEndTime = new Date(formState.date)
    newEndTime.setHours(hours, minutes, 0, 0)

    // If end time is before start time, adjust start time
    if (newEndTime <= formState.startTime) {
      const adjustedStartTime = new Date(newEndTime)
      adjustedStartTime.setMinutes(adjustedStartTime.getMinutes() - 30)
      updateFormState("startTime", adjustedStartTime)
    }

    updateFormState("endTime", newEndTime)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Time Block</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(e) => updateFormState("title", e.target.value)}
              placeholder="What are you planning to do?"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={format(formState.startTime, "HH:mm")}
                onChange={(e) => updateStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={format(formState.endTime, "HH:mm")}
                onChange={(e) => updateEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formState.category} onValueChange={(value) => updateFormState("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <Select value={formState.color} onValueChange={(value) => updateFormState("color", value)}>
                <SelectTrigger id="color" className="w-full">
                  <SelectValue>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: formState.color }}></div>
                      <span>{COLOR_OPTIONS.find((color) => color.value === formState.color)?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color.value }}></div>
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Description (Optional)</Label>
              <Button variant="link" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="h-auto p-0">
                {showAdvanced ? "Hide advanced options" : "Show advanced options"}
              </Button>
            </div>
            <Textarea
              id="description"
              value={formState.description}
              onChange={(e) => updateFormState("description", e.target.value)}
              placeholder="Add details about this time block"
              rows={2}
            />
          </div>

          {showAdvanced && (
            <>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-toggle">Set a reminder</Label>
                  <Switch id="reminder-toggle" checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
                </div>

                {reminderEnabled && (
                  <Select
                    value={formState.reminder?.toString() || "15"}
                    onValueChange={(value) => updateFormState("reminder", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Remind me..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="recurrence-toggle">Make this recurring</Label>
                  <Switch id="recurrence-toggle" checked={recurrenceEnabled} onCheckedChange={setRecurrenceEnabled} />
                </div>

                {recurrenceEnabled && (
                  <Select
                    value={formState.recurrence || "weekly"}
                    onValueChange={(value) => updateFormState("recurrence", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Repeats..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Block</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
