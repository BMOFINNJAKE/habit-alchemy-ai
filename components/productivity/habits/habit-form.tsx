
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
import { CalendarIcon, Sparkles, Check, Info } from "lucide-react"
import { useStore } from "@/lib/store-provider"
import { Badge } from "@/components/ui/badge"

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
 const { isOnline } = useStore()
 
 // Identity and atomic habits fields
 const [identity, setIdentity] = useState("")
 const [trigger, setTrigger] = useState("")
 const [smallStep, setSmallStep] = useState("")
 const [reward, setReward] = useState("")
 const [atomicHabitsExpanded, setAtomicHabitsExpanded] = useState(false)

 // Reset form when habit changes
 useEffect(() => {
   if (habit) {
     setName(habit.name)
     setDescription(habit.description || "")
     setFrequency(habit.frequency)
     setColor(habit.color || "#3b82f6")

     // Set atomic habits fields if they exist in the habit data
     if (habit.atomic_habits_data) {
       setIdentity(habit.atomic_habits_data.identity || "")
       setTrigger(habit.atomic_habits_data.trigger || "")
       setSmallStep(habit.atomic_habits_data.small_step || "")
       setReward(habit.atomic_habits_data.reward || "")
     } else {
       setIdentity("")
       setTrigger("")
       setSmallStep("")
       setReward("")
     }

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
   setIdentity("")
   setTrigger("")
   setSmallStep("")
   setReward("")
   setAtomicHabitsExpanded(false)
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

   // Include atomic habits data
   const atomicHabitsData = {
     identity: identity.trim(),
     trigger: trigger.trim(),
     small_step: smallStep.trim(),
     reward: reward.trim(),
   }
   
   // Only include if at least one field is filled
   const hasAtomicData = Object.values(atomicHabitsData).some(val => val.length > 0)

   const habitData = {
     name,
     description,
     frequency,
     frequency_config: frequencyConfig,
     color,
     start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
     end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
     atomic_habits_data: hasAtomicData ? atomicHabitsData : null,
     ai_enhanced: hasAtomicData,
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

 // Enhanced description function without a separate component
 const enhanceHabitWithAI = () => {
   if (!isOnline) return;
   
   // Simple simulation of AI enhancement
   setShowAIEnhancer(true);
   
   // Create an atomic habits based description
   const enhancedTrigger = trigger || "After I wake up";
   const enhancedAction = name.trim() ? `I will ${name.toLowerCase()}` : "I will do this habit";
   const enhancedIdentity = identity ? 
     `to become ${identity}` : 
     "to build this positive habit";
   
   let enhancedDescription = `${enhancedTrigger}, ${enhancedAction} ${enhancedIdentity}.`;
   
   if (smallStep) {
     enhancedDescription += `\n\nMake it easy: ${smallStep}`;
   }
   
   if (reward) {
     enhancedDescription += `\n\nMake it satisfying: ${reward}`;
   }
   
   setDescription(enhancedDescription);
   setShowAIEnhancer(false);
   setAtomicHabitsExpanded(true);
 }

 // Toggle atomic habits section expansion
 const toggleAtomicHabitsSection = () => {
   setAtomicHabitsExpanded(!atomicHabitsExpanded);
   if (!atomicHabitsExpanded) {
     setActiveTab("atomic");
   }
 }

 return (
   <Dialog open={open} onOpenChange={onOpenChange}>
     <DialogContent className="sm:max-w-[600px]">
       <DialogHeader>
         <DialogTitle className="flex items-center gap-2">
           {habit ? "Edit Habit" : "Add New Habit"}
           {identity && <Badge variant="secondary" className="ml-2">Identity-Based</Badge>}
         </DialogTitle>
       </DialogHeader>

       <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList className="grid w-full grid-cols-3">
           <TabsTrigger value="details">Basic Details</TabsTrigger>
           <TabsTrigger value="atomic">Atomic Habits</TabsTrigger>
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
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={enhanceHabitWithAI}
                 disabled={!isOnline}
                 className="h-8 px-2 text-xs"
               >
                 <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                 Enhance with AI
               </Button>
             </div>
             <Textarea
               id="description"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="Why is this habit important to you?"
               rows={3}
             />
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

           <Button 
             variant="outline" 
             className="w-full"
             onClick={toggleAtomicHabitsSection}
           >
             <div className="flex items-center justify-center gap-2">
               <Sparkles className="h-4 w-4 text-amber-500" />
               <span>Make this an Atomic Habit</span>
               <Info className="h-4 w-4 text-muted-foreground" />
             </div>
           </Button>
         </TabsContent>

         <TabsContent value="atomic" className="space-y-4 py-4">
           <div className="bg-muted/30 p-4 rounded-lg mb-4">
             <h3 className="text-sm font-medium mb-2">Build Better Habits with Atomic Habits Principles</h3>
             <p className="text-xs text-muted-foreground">
               Use the four laws of behavior change to make your habits stick: make it obvious, attractive, easy, and satisfying.
             </p>
           </div>

           <div className="grid gap-4">
             <div className="grid gap-2">
               <Label htmlFor="identity">
                 Who do you want to become? <span className="text-xs text-muted-foreground">(Identity)</span>
               </Label>
               <Input
                 id="identity"
                 value={identity}
                 onChange={(e) => setIdentity(e.target.value)}
                 placeholder="e.g., someone who stays calm under pressure"
               />
               <p className="text-xs text-muted-foreground">Tie your habit to the identity you want to build</p>
             </div>

             <div className="grid gap-2">
               <Label htmlFor="trigger">
                 What will trigger this habit? <span className="text-xs text-muted-foreground">(Make it obvious)</span>
               </Label>
               <Input
                 id="trigger"
                 value={trigger}
                 onChange={(e) => setTrigger(e.target.value)}
                 placeholder="e.g., After I brush my teeth"
               />
               <p className="text-xs text-muted-foreground">Specific cue that will remind you to do the habit</p>
             </div>

             <div className="grid gap-2">
               <Label htmlFor="smallStep">
                 How can you make it easy? <span className="text-xs text-muted-foreground">(Small step)</span>
               </Label>
               <Input
                 id="smallStep"
                 value={smallStep}
                 onChange={(e) => setSmallStep(e.target.value)}
                 placeholder="e.g., Just 2 minutes of meditation"
               />
               <p className="text-xs text-muted-foreground">Break it down to a two-minute version that's easy to do</p>
             </div>

             <div className="grid gap-2">
               <Label htmlFor="reward">
                 How will you reward yourself? <span className="text-xs text-muted-foreground">(Make it satisfying)</span>
               </Label>
               <Input
                 id="reward"
                 value={reward}
                 onChange={(e) => setReward(e.target.value)}
                 placeholder="e.g., Check off my habit tracker"
               />
               <p className="text-xs text-muted-foreground">Give yourself an immediate reward when you complete the habit</p>
             </div>
           </div>

           <Button 
             onClick={enhanceHabitWithAI} 
             className="w-full"
             disabled={!isOnline}
           >
             <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
             Generate Atomic Habit Description
           </Button>
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

         <DialogFooter className="flex justify-between sm:justify-between">
           <Button variant="outline" onClick={handleClose}>
             Cancel
           </Button>
           <Button onClick={handleSubmit}>
             {habit ? "Save Changes" : "Add Habit"}
           </Button>
         </DialogFooter>
       </Tabs>
     </DialogContent>
   </Dialog>
 )
}
