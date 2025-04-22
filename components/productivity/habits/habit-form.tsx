
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import type { Habit } from "@/types/habit"
import { CalendarIcon, Sparkles } from "lucide-react"
import AIHabitEnhancer from "./ai-habit-enhancer"
import AtomicHabitEnhancer from "./atomic-habit-enhancer"
import { useStore } from "@/lib/store-provider"
import { AtomicHabitEnhancement } from "@/hooks/use-atomic-habits-ai"

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
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

interface HabitFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (habit: any) => void
  onDelete?: () => void
  habit?: Habit | null
}

export default function HabitForm({ open, onOpenChange, onSubmit, onDelete, habit = null }: HabitFormProps) {
 const [name, setName] = useState("")
 const [description, setDescription] = useState("")
 const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily")
 const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([])
 const [selectedDaysOfMonth, setSelectedDaysOfMonth] = useState<number[]>([])
 const [color, setColor] = useState("#3b82f6")
 const [startDate, setStartDate] = useState<Date | undefined>(new Date())
 const [endDate, setEndDate] = useState<Date | undefined>(undefined)
 const [activeTab, setActiveTab] = useState("details")
 const [showAIEnhancer, setShowAIEnhancer] = useState(false)
 const [showAtomicEnhancer, setShowAtomicEnhancer] = useState(false)
 const { isOnline } = useStore()
 const [atomicHabitMeta, setAtomicHabitMeta] = useState<AtomicHabitEnhancement | null>(null)

 // Reset form when habit changes
 useEffect(() => {
   if (habit) {
     setName(habit.name)
     setDescription(habit.description || "")
     setFrequency(habit.frequency)
     setColor(habit.color || "#3b82f6")

     if (habit.frequency_config) {
       if (habit.frequency === "weekly" && habit.frequency_config.days) {
         setSelectedDaysOfWeek(habit.frequency_config.days)
       } else if (habit.frequency === "monthly" && habit.frequency_config.days) {
         setSelectedDaysOfMonth(habit.frequency_config.days)
       }
     }

     if (habit.start_date) {
       setStartDate(new Date(habit.start_date))
     }

     if (habit.end_date) {
       setEndDate(new Date(habit.end_date))
     }
   } else {
     resetForm()
   }
 }, [habit])

 const resetForm = () => {
   setName("")
   setDescription("")
   setFrequency("daily")
   setSelectedDaysOfWeek([])
   setSelectedDaysOfMonth([])
   setColor("#3b82f6")
   setStartDate(new Date())
   setEndDate(undefined)
   setActiveTab("details")
   setShowAIEnhancer(false)
   setShowAtomicEnhancer(false)
   setAtomicHabitMeta(null)
 }

 const handleClose = () => {
   onOpenChange(false)
   setTimeout(() => {
     resetForm()
   }, 300)
 }

 const handleSubmit = () => {
   if (!name.trim()) {
     // Show validation error
     return
   }

   let frequencyConfig = {}

   if (frequency === "weekly") {
     frequencyConfig = {
       days: selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : DAYS_OF_WEEK.map((d) => d.value),
     }
   } else if (frequency === "monthly") {
     frequencyConfig = {
       days: selectedDaysOfMonth.length > 0 ? selectedDaysOfMonth : [1],
     }
   }

   const habitData = {
     name,
     description,
     frequency,
     frequency_config: frequencyConfig,
     color,
     start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
     end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
     atomic_habit_meta: atomicHabitMeta ? {
       trigger: atomicHabitMeta.trigger,
       identity: atomicHabitMeta.identity,
       small_step: atomicHabitMeta.smallStep,
       reward: atomicHabitMeta.reward,
       full_suggestion: atomicHabitMeta.fullSuggestion
     } : null
   }

   // If editing, include the id
   if (habit) {
     onSubmit({
       ...habitData,
       id: habit.id,
       user_id: habit.user_id,
     })
   } else {
     onSubmit(habitData)
   }

   handleClose()
 }

 const toggleDayOfWeek = (day: string) => {
   if (selectedDaysOfWeek.includes(day)) {
     setSelectedDaysOfWeek(selectedDaysOfWeek.filter((d) => d !== day))
   } else {
     setSelectedDaysOfWeek([...selectedDaysOfWeek, day])
   }
 }

 const toggleDayOfMonth = (day: number) => {
   if (selectedDaysOfMonth.includes(day)) {
     setSelectedDaysOfMonth(selectedDaysOfMonth.filter((d) => d !== day))
   } else {
     setSelectedDaysOfMonth([...selectedDaysOfMonth, day])
   }
 }

 const handleEnhancedDescription = (enhancedText: string) => {
   setDescription(enhancedText)
   setShowAIEnhancer(false)
   setActiveTab("details")
 }

 const handleAtomicHabitEnhancement = (enhancement: AtomicHabitEnhancement) => {
   setName(enhancement.enhancedName)
   setDescription(enhancement.fullSuggestion)
   setAtomicHabitMeta(enhancement)
   setShowAtomicEnhancer(false)
   setActiveTab("details")
 }

 return (
   <Dialog open={open} onOpenChange={onOpenChange}>
     <DialogContent className="sm:max-w-[600px]">
       <DialogHeader>
         <DialogTitle>{habit ? "Edit Habit" : "Add New Habit"}</DialogTitle>
       </DialogHeader>

       {showAtomicEnhancer ? (
         <AtomicHabitEnhancer 
           habitName={name}
           frequency={frequency}
           onSave={handleAtomicHabitEnhancement}
           onCancel={() => setShowAtomicEnhancer(false)}
         />
       ) : showAIEnhancer ? (
         <AIHabitEnhancer
           habitDescription={description}
           onSave={handleEnhancedDescription}
           onCancel={() => setShowAIEnhancer(false)}
         />
       ) : (
         <>
           <Tabs value={activeTab} onValueChange={setActiveTab}>
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="details">Basic Details</TabsTrigger>
               <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
             </TabsList>

             <TabsContent value="details" className="space-y-4 py-4">
               <div className="grid gap-2">
                 <Label htmlFor="name">Habit Name</Label>
                 <Input
                   id="name"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   placeholder="What habit do you want to track?"
                   autoFocus
                 />
               </div>

               <div className="grid gap-2">
                 <div className="flex justify-between items-center">
                   <Label htmlFor="description">Description (Optional)</Label>
                   <div className="flex gap-2">
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => setShowAIEnhancer(true)}
                       disabled={!isOnline}
                       className="h-8 px-2 text-xs"
                     >
                       <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                       AI Enhance
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowAtomicEnhancer(true)}
                       disabled={!name.trim() || !isOnline}
                       className="h-8 px-2 text-xs"
                     >
                       <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                       Atomic Habits
                     </Button>
                   </div>
                 </div>
                 <Textarea
                   id="description"
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Why is this habit important to you?"
                   rows={3}
                 />
                 {atomicHabitMeta && (
                   <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-900 text-xs text-muted-foreground">
                     <p className="font-medium text-green-700 dark:text-green-300 mb-1">Atomic Habit Format:</p>
                     <p>{atomicHabitMeta.fullSuggestion}</p>
                   </div>
                 )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                   <Label htmlFor="frequency">Frequency</Label>
                   <Select
                     value={frequency}
                     onValueChange={(value: "daily" | "weekly" | "monthly") => {
                       setFrequency(value)
                       // Reset selected days
                       setSelectedDaysOfWeek([])
                       setSelectedDaysOfMonth([])
                     }}
                   >
                     <SelectTrigger id="frequency">
                       <SelectValue placeholder="How often?" />
                     </SelectTrigger>
                     <SelectContent>
                       {FREQUENCY_OPTIONS.map((option) => (
                         <SelectItem key={option.value} value={option.value}>
                           {option.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="grid gap-2">
                   <Label htmlFor="color">Color</Label>
                   <Select value={color} onValueChange={setColor}>
                     <SelectTrigger id="color" className="w-full">
                       <SelectValue>
                         <div className="flex items-center">
                           <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                           <span>{COLOR_OPTIONS.find((c) => c.value === color)?.label}</span>
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
           </TabsContent>

           <TabsContent value="advanced" className="space-y-4 py-4">
             {frequency === "weekly" && (
               <div className="grid gap-2">
                 <Label>Days of the Week</Label>
                 <div className="flex flex-wrap gap-2">
                   {DAYS_OF_WEEK.map((day) => (
                     <div key={day.value} className="flex items-center space-x-2">
                       <Checkbox
                         id={`day-${day.value}`}
                         checked={selectedDaysOfWeek.includes(day.value)}
                         onCheckedChange={() => toggleDayOfWeek(day.value)}
                       />
                       <label
                         htmlFor={`day-${day.value}`}
                         className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                       >
                         {day.label.substring(0, 3)}
                       </label>
                     </div>
                   ))}
                 </div>
                 <p className="text-xs text-muted-foreground mt-1">
                   {selectedDaysOfWeek.length === 0
                     ? "If no days are selected, the habit will be tracked every day."
                     : `This habit will be tracked on ${selectedDaysOfWeek
                         .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
                         .join(", ")}.`}
                 </p>
               </div>
             )}

             <div className="grid gap-2">
               <Label htmlFor="startDate">Start Date</Label>
               <Popover>
                 <PopoverTrigger asChild>
                   <Button variant="outline" className="w-full justify-start text-left font-normal">
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {startDate ? format(startDate, "PPP") : "Select start date"}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0">
                   <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                 </PopoverContent>
               </Popover>
             </div>

             <div className="grid gap-2">
               <Label htmlFor="endDate">End Date (Optional)</Label>
               <Popover>
                 <PopoverTrigger asChild>
                   <Button variant="outline" className="w-full justify-start text-left font-normal">
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {endDate ? format(endDate, "PPP") : "No end date"}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0">
                   <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                 </PopoverContent>
               </Popover>
             </div>
           </TabsContent>
           </Tabs>

           <DialogFooter className="flex justify-between sm:justify-between">
             <Button variant="outline" onClick={handleClose}>
               Cancel
             </Button>
             <Button onClick={handleSubmit}>{habit ? "Save Changes" : "Add Habit"}</Button>
           </DialogFooter>
         </>
       )}
     </DialogContent>
   </Dialog>
 )
}
