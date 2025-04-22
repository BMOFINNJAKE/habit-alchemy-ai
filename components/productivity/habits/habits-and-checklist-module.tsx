"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import HabitTracker from "./habit-tracker"
import ChecklistManager from "./checklist-manager"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import AtomicHabitsSystem from "./atomic-habits-system"

interface HabitsAndChecklistModuleProps {
}

export default function HabitsAndChecklistModule({}: HabitsAndChecklistModuleProps) {
 const [activeTab, setActiveTab] = useState("habits")
 const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false)
 const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false)
 const [newHabit, setNewHabit] = useState({ name: "", frequency: "daily", category: "health" })
 const [newChecklist, setNewChecklist] = useState({ name: "", type: "daily" })
 const { toast } = useToast()
 const supabase = useSupabaseClient()

 // Local storage keys
 const HABITS_STORAGE_KEY = "user-habits"
 const CHECKLISTS_STORAGE_KEY = "user-checklists"

 // State for habits and checklists
 const [habits, setHabits] = useState([])
 const [checklists, setChecklists] = useState([])

 // Load data from localStorage on component mount
 useEffect(() => {
   const savedHabits = localStorage.getItem(HABITS_STORAGE_KEY)
   if (savedHabits) {
     try {
       setHabits(JSON.parse(savedHabits))
     } catch (e) {
       console.error("Failed to parse saved habits", e)
     }
   }

   const savedChecklists = localStorage.getItem(CHECKLISTS_STORAGE_KEY)
   if (savedChecklists) {
     try {
       setChecklists(JSON.parse(savedChecklists))
     } catch (e) {
       console.error("Failed to parse saved checklists", e)
     }
   }
 }, [])

 // Save data to localStorage whenever they change
 useEffect(() => {
   if (habits.length > 0) {
     localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits))
   }

   if (checklists.length > 0) {
     localStorage.setItem(CHECKLISTS_STORAGE_KEY, JSON.stringify(checklists))
   }
 }, [habits, checklists])

 const handleAddHabit = () => {
   if (!newHabit.name) {
     toast({
       title: "Habit name required",
       description: "Please enter a name for your habit",
       variant: "destructive",
     })
     return
   }

   const habit = {
     id: crypto.randomUUID(),
     name: newHabit.name,
     frequency: newHabit.frequency,
     category: newHabit.category,
     createdAt: new Date(),
     streak: 0,
     history: [],
   }

   setHabits([...habits, habit])
   setNewHabit({ name: "", frequency: "daily", category: "health" })
   setIsHabitDialogOpen(false)

   toast({
     title: "Habit added",
     description: "Your new habit has been added to the tracker",
   })
 }

 const handleAddChecklist = () => {
   if (!newChecklist.name) {
     toast({
       title: "Checklist name required",
       description: "Please enter a name for your checklist",
       variant: "destructive",
     })
     return
   }

   const checklist = {
     id: crypto.randomUUID(),
     name: newChecklist.name,
     type: newChecklist.type,
     createdAt: new Date(),
     items: [],
   }

   setChecklists([...checklists, checklist])
   setNewChecklist({ name: "", type: "daily" })
   setIsChecklistDialogOpen(false)

   toast({
     title: "Checklist added",
     description: "Your new checklist has been created",
   })
 }

 return (
   <div className="space-y-6">
     <div className="flex justify-between items-center">
       <h2 className="text-xl font-bold">Habits & Daily Checklist</h2>
       <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList>
           <TabsTrigger value="habits">Habit Tracker</TabsTrigger>
           <TabsTrigger value="checklist">Checklists</TabsTrigger>
         </TabsList>
       </Tabs>
     </div>

     <div className="flex justify-end">
       {activeTab === "habits" ? (
         <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
           <DialogTrigger asChild>
             <Button>
               <PlusCircle className="h-4 w-4 mr-2" />
               Add Habit
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Add New Habit</DialogTitle>
             </DialogHeader>
             <div className="space-y-4 py-2">
               <div className="space-y-2">
                 <Label htmlFor="habit-name">Habit Name</Label>
                 <Input
                   id="habit-name"
                   value={newHabit.name}
                   onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                   placeholder="Enter habit name"
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="frequency">Frequency</Label>
                 <Select
                   value={newHabit.frequency}
                   onValueChange={(value) => setNewHabit({ ...newHabit, frequency: value })}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select frequency" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="daily">Daily</SelectItem>
                     <SelectItem value="weekly">Weekly</SelectItem>
                     <SelectItem value="monthly">Monthly</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                 <Select
                   value={newHabit.category}
                   onValueChange={(value) => setNewHabit({ ...newHabit, category: value })}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select category" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="health">Health</SelectItem>
                     <SelectItem value="productivity">Productivity</SelectItem>
                     <SelectItem value="learning">Learning</SelectItem>
                     <SelectItem value="finance">Finance</SelectItem>
                     <SelectItem value="other">Other</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <Button onClick={handleAddHabit} className="w-full">
                 Add Habit
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       ) : (
         <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
           <DialogTrigger asChild>
             <Button>
               <PlusCircle className="h-4 w-4 mr-2" />
               Add Checklist
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Create New Checklist</DialogTitle>
             </DialogHeader>
             <div className="space-y-4 py-2">
               <div className="space-y-2">
                 <Label htmlFor="checklist-name">Checklist Name</Label>
                 <Input
                   id="checklist-name"
                   value={newChecklist.name}
                   onChange={(e) => setNewChecklist({ ...newChecklist, name: e.target.value })}
                   placeholder="Enter checklist name"
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="type">Type</Label>
                 <Select
                   value={newChecklist.type}
                   onValueChange={(value) => setNewChecklist({ ...newChecklist, type: value })}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select type" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="daily">Daily Checklist</SelectItem>
                     <SelectItem value="weekly">Weekly Checklist</SelectItem>
                     <SelectItem value="project">Project Checklist</SelectItem>
                     <SelectItem value="shopping">Shopping Checklist</SelectItem>
                     <SelectItem value="custom">Custom Checklist</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <Button onClick={handleAddChecklist} className="w-full">
                 Create Checklist
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       )}
     </div>

     <TabsContent value="habits" className="m-0">
       <HabitTracker habits={habits} setHabits={setHabits} />
     </TabsContent>

     <TabsContent value="checklist" className="m-0">
       <ChecklistManager checklists={checklists} setChecklists={setChecklists} />
     </TabsContent>
   </div>
 )
}
