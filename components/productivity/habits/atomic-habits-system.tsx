"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, ArrowRight, Brain, Target, Calendar, Lightbulb, CheckCircle2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import type { Habit } from "@/types/habit"

interface AtomicHabitsSystemProps {
 onCreateHabit: (habit: Omit<Habit, "id" | "user_id">) => void
 onCancel: () => void
}

export default function AtomicHabitsSystem({ onCreateHabit, onCancel }: AtomicHabitsSystemProps) {
 const [step, setStep] = useState(1)
 const [habitGoal, setHabitGoal] = useState("")
 const [habitType, setHabitType] = useState<"build" | "break">("build")
 const [habitTrigger, setHabitTrigger] = useState("")
 const [habitAction, setHabitAction] = useState("")
 const [habitReward, setHabitReward] = useState("")
 const [habitFrequency, setHabitFrequency] = useState<"daily" | "weekly" | "monthly">("daily")
 const [selectedDays, setSelectedDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday"])
 const [habitColor, setHabitColor] = useState("#10b981") // Default green
 const [isGenerating, setIsGenerating] = useState(false)
 const [generatedHabit, setGeneratedHabit] = useState<Partial<Habit> | null>(null)
 const { toast } = useToast()

 const DAYS_OF_WEEK = [
   { value: "monday", label: "Monday" },
   { value: "tuesday", label: "Tuesday" },
   { value: "wednesday", label: "Wednesday" },
   { value: "thursday", label: "Thursday" },
   { value: "friday", label: "Friday" },
   { value: "saturday", label: "Saturday" },
   { value: "sunday", label: "Sunday" },
 ]

 const nextStep = () => {
   if (step === 1 && !habitGoal.trim()) {
     toast({
       title: "Goal required",
       description: "Please enter your habit goal to continue.",
       variant: "destructive",
     })
     return
   }

   if (step === 2 && !habitTrigger.trim()) {
     toast({
       title: "Cue/Trigger required",
       description: "Please enter a cue or trigger for your habit.",
       variant: "destructive",
     })
     return
   }

   if (step === 3 && !habitAction.trim()) {
     toast({
       title: "Action required",
       description: "Please describe the action for your habit.",
       variant: "destructive",
     })
     return
   }

   setStep(step + 1)
 }

 const prevStep = () => {
   setStep(step - 1)
 }

 const generateHabitSystem = async () => {
   setIsGenerating(true)

   try {
     // In a real implementation, this would call an AI service
     // For now, we'll simulate the AI response with Atomic Habits principles
     await new Promise((resolve) => setTimeout(resolve, 1500))

     // Create a habit name based on the action
     const habitName = habitAction
       .split(" ")
       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
       .join(" ")

     // Create a description based on the 4 laws of behavior change from Atomic Habits
     let description = `Goal: ${habitGoal}

`

     // 1. Make it obvious (Cue)
     description += `🔍 Make it Obvious: ${habitTrigger}

`

     // 2. Make it attractive (Craving)
     description += `✨ Make it Attractive: ${habitReward}

`

     // 3. Make it easy (Response)
     const easyAction = `Break down "${habitAction}" into a two-minute version to start.`
     description += `👌 Make it Easy: ${easyAction}

`

     // 4. Make it satisfying (Reward)
     description += `🎉 Make it Satisfying: Track your progress visually and celebrate streaks.`

     // Add science from Atomic Habits
     description += `

📚 Science: Research shows that habits are formed through the habit loop: cue, craving, response, and reward. By designing your environment and making your habit obvious, attractive, easy, and satisfying, you significantly increase your chances of success.`

     // Create the habit object
     const habit: Partial<Habit> = {
       name: habitName,
       description,
       frequency: habitFrequency,
       frequency_config: {
         days: habitFrequency === "weekly" ? selectedDays : undefined,
       },
       color: habitColor,
       start_date: new Date().toISOString().split("T")[0],
       ai_suggestions: true,
       icon: habitType === "build" ? "plus-circle" : "minus-circle",
       target: 1, // Default target (completed/not completed)
     }

     setGeneratedHabit(habit)
   } catch (error) {
     console.error("Error generating habit system:", error)
     toast({
       title: "Generation failed",
       description: "There was an error generating your habit system. Please try again.",
       variant: "destructive",
     })
   } finally {
     setIsGenerating(false)
   }
 }

 const handleCreateHabit = () => {
   if (!generatedHabit) return

   // Call the parent component's onCreateHabit function
   onCreateHabit(generatedHabit as Omit<Habit, "id" | "user_id">)
 }

 return (
   <Card className="w-full max-w-4xl mx-auto">
     <CardHeader>
       <CardTitle className="flex items-center gap-2 text-xl">
         <Sparkles className="h-5 w-5 text-amber-500" />
         Atomic Habits System Builder
       </CardTitle>
       <CardDescription>
         Create an effective habit system based on James Clear's Atomic Habits framework
       </CardDescription>
     </CardHeader>

     <CardContent>
       <Tabs value={`step-${step}`} className="w-full">
         <TabsList className="grid grid-cols-5 w-full">
           <TabsTrigger value="step-1" disabled={step !== 1} onClick={() => setStep(1)}>
             Goal
           </TabsTrigger>
           <TabsTrigger value="step-2" disabled={step !== 2} onClick={() => setStep(2)}>
             Cue
           </TabsTrigger>
           <TabsTrigger value="step-3" disabled={step !== 3} onClick={() => setStep(3)}>
             Action
           </TabsTrigger>
           <TabsTrigger value="step-4" disabled={step !== 4} onClick={() => setStep(4)}>
             Reward
           </TabsTrigger>
           <TabsTrigger value="step-5" disabled={step !== 5} onClick={() => setStep(5)}>
             Schedule
           </TabsTrigger>
         </TabsList>

         {/* Step 1: Define the Goal */}
         <TabsContent value="step-1" className="space-y-4 mt-4">
           <div className="flex items-start gap-4">
             <div className="bg-primary/10 p-3 rounded-full">
               <Target className="h-6 w-6 text-primary" />
             </div>
             <div className="space-y-2">
               <h3 className="text-lg font-medium">What's your habit goal?</h3>
               <p className="text-sm text-muted-foreground">
                 Define what you want to achieve with this habit. Be specific and focus on the identity you want to
                 build.
               </p>
             </div>
           </div>

           <div className="space-y-2 mt-6">
             <Label htmlFor="habit-goal">I want to become the type of person who...</Label>
             <Textarea
               id="habit-goal"
               value={habitGoal}
               onChange={(e) => setHabitGoal(e.target.value)}
               placeholder="e.g., reads every day, exercises regularly, meditates consistently"
               rows={3}
             />
           </div>

           <div className="space-y-2 mt-4">
             <Label>Type of habit</Label>
             <RadioGroup value={habitType} onValueChange={(value) => setHabitType(value as "build" | "break")}>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="build" id="build" />
                 <Label htmlFor="build">Build a new habit</Label>
               </div>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="break" id="break" />
                 <Label htmlFor="break">Break a bad habit</Label>
               </div>
             </RadioGroup>
           </div>

           <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg mt-6">
             <div className="flex items-start gap-2">
               <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Atomic Habits Tip</p>
                 <p className="text-sm text-amber-700 dark:text-amber-400">
                   Focus on the identity you want to build, not just the outcome. Instead of "I want to lose weight,"
                   try "I want to become a healthy person who exercises regularly."
                 </p>
               </div>
             </div>
           </div>
         </TabsContent>

         {/* Step 2: Define the Cue/Trigger */}
         <TabsContent value="step-2" className="space-y-4 mt-4">
           <div className="flex items-start gap-4">
             <div className="bg-primary/10 p-3 rounded-full">
               <Brain className="h-6 w-6 text-primary" />
             </div>
             <div className="space-y-2">
               <h3 className="text-lg font-medium">What will trigger your habit?</h3>
               <p className="text-sm text-muted-foreground">
                 The cue triggers your brain to initiate a behavior. Make it obvious by connecting it to something you
                 already do.
               </p>
             </div>
           </div>

           <div className="space-y-2 mt-6">
             <Label htmlFor="habit-trigger">After I...</Label>
             <Textarea
               id="habit-trigger"
               value={habitTrigger}
               onChange={(e) => setHabitTrigger(e.target.value)}
               placeholder="e.g., finish breakfast, arrive at work, brush my teeth"
               rows={2}
             />
           </div>

           <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg mt-6">
             <div className="flex items-start gap-2">
               <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Atomic Habits Tip</p>
                 <p className="text-sm text-amber-700 dark:text-amber-400">
                   Implementation intention is a powerful strategy: "After [current habit], I will [new habit]." This
                   makes your cue obvious and leverages existing routines.
                 </p>
               </div>
             </div>
           </div>
         </TabsContent>

         {/* Step 3: Define the Action */}
         <TabsContent value="step-3" className="space-y-4 mt-4">
           <div className="flex items-start gap-4">
             <div className="bg-primary/10 p-3 rounded-full">
               <CheckCircle2 className="h-6 w-6 text-primary" />
             </div>
             <div className="space-y-2">
               <h3 className="text-lg font-medium">What action will you take?</h3>
               <p className="text-sm text-muted-foreground">
                 Define the specific action for your habit. Make it small and easy to do in less than two minutes.
               </p>
             </div>
           </div>

           <div className="space-y-2 mt-6">
             <Label htmlFor="habit-action">I will...</Label>
             <Textarea
               id="habit-action"
               value={habitAction}
               onChange={(e) => setHabitAction(e.target.value)}
               placeholder="e.g., read one page, do 5 push-ups, meditate for 1 minute"
               rows={2}
             />
           </div>

           <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg mt-6">
             <div className="flex items-start gap-2">
               <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Atomic Habits Tip</p>
                 <p className="text-sm text-amber-700 dark:text-amber-400">
                   Use the "Two-Minute Rule" - scale down your habit to something that takes less than two minutes to
                   do. This makes it easy to start and helps overcome resistance.
                 </p>
               </div>
             </div>
           </div>
         </TabsContent>

         {/* Step 4: Define the Reward */}
         <TabsContent value="step-4" className="space-y-4 mt-4">
           <div className="flex items-start gap-4">
             <div className="bg-primary/10 p-3 rounded-full">
               <Sparkles className="h-6 w-6 text-primary" />
             </div>
             <div className="space-y-2">
               <h3 className="text-lg font-medium">How will you reward yourself?</h3>
               <p className="text-sm text-muted-foreground">
                 Make your habit satisfying by adding an immediate reward. This helps your brain associate positive
                 feelings with the behavior.
               </p>
             </div>
           </div>

           <div className="space-y-2 mt-6">
             <Label htmlFor="habit-reward">After completing my habit, I will...</Label>
             <Textarea
               id="habit-reward"
               value={habitReward}
               onChange={(e) => setHabitReward(e.target.value)}
               placeholder="e.g., mark my progress, celebrate with a small treat, feel proud of my consistency"
               rows={2}
             />
           </div>

           <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg mt-6">
             <div className="flex items-start gap-2">
               <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Atomic Habits Tip</p>
                 <p className="text-sm text-amber-700 dark:text-amber-400">
                   The most effective form of motivation is progress. Use a habit tracker to make your progress visible
                   and satisfying. Don't break the chain of successful days.
                 </p>
               </div>
             </div>
           </div>
         </TabsContent>

         {/* Step 5: Define the Schedule */}
         <TabsContent value="step-5" className="space-y-4 mt-4">
           <div className="flex items-start gap-4">
             <div className="bg-primary/10 p-3 rounded-full">
               <Calendar className="h-6 w-6 text-primary" />
             </div>
             <div className="space-y-2">
               <h3 className="text-lg font-medium">When will you perform this habit?</h3>
               <p className="text-sm text-muted-foreground">
                 Set a consistent schedule for your habit to make it part of your routine.
               </p>
             </div>
           </div>

           <div className="space-y-4 mt-6">
             <div className="space-y-2">
               <Label>Frequency</Label>
               <RadioGroup
                 value={habitFrequency}
                 onValueChange={(value) => setHabitFrequency(value as "daily" | "weekly" | "monthly")}
               >
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="daily" id="daily" />
                   <Label htmlFor="daily">Daily</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="weekly" id="weekly" />
                   <Label htmlFor="weekly">Weekly</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="monthly" id="monthly" />
                   <Label htmlFor="monthly">Monthly</Label>
                 </div>
               </RadioGroup>
             </div>

             {habitFrequency === "weekly" && (
               <div className="space-y-2">
                 <Label>Days of the Week</Label>
                 <div className="flex flex-wrap gap-2">
                   {DAYS_OF_WEEK.map((day) => (
                     <div key={day.value} className="flex items-center space-x-2">
                       <Checkbox
                         id={`day-${day.value}`}
                         checked={selectedDays.includes(day.value)}
                         onCheckedChange={(checked) => {
                           if (checked) {
                             setSelectedDays([...selectedDays, day.value])
                           } else {
                             setSelectedDays(selectedDays.filter((d) => d !== day.value))
                           }
                         }}
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
               </div>
             )}

             <div className="space-y-2">
               <Label>Color</Label>
               <div className="flex flex-wrap gap-2">
                 {["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444", "#6b7280"].map((color) => (
                   <button
                     key={color}
                     type="button"
                     className={`w-8 h-8 rounded-full ${
                       habitColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                     }`}
                     style={{ backgroundColor: color }}
                     onClick={() => setHabitColor(color)}
                     aria-label={`Select color ${color}`}
                   />
                 ))}
               </div>
             </div>
           </div>

           <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg mt-6">
             <div className="flex items-start gap-2">
               <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Atomic Habits Tip</p>
                 <p className="text-sm text-amber-700 dark:text-amber-400">
                   Habit stacking is powerful: "After [current habit], I will [new habit]." By anchoring your new habit
                   to an existing one at a specific time, you make it more likely to stick.
                 </p>
               </div>
             </div>
           </div>
         </TabsContent>
       </Tabs>

       {generatedHabit && (
         <div className="mt-8 border rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
           <h3 className="text-lg font-medium mb-2">Your Atomic Habits System</h3>
           <div className="space-y-2">
             <div>
               <span className="font-medium">Habit:</span> {generatedHabit.name}
             </div>
             <div>
               <span className="font-medium">Description:</span>
               <div className="whitespace-pre-line mt-1 text-sm">{generatedHabit.description}</div>
             </div>
             <div>
               <span className="font-medium">Frequency:</span>{" "}
               {generatedHabit.frequency === "daily"
                 ? "Daily"
                 : generatedHabit.frequency === "weekly"
                   ? `Weekly (${selectedDays.map((d) => d.substring(0, 3)).join(", ")})`
                   : "Monthly"}
             </div>
           </div>
         </div>
       )}
     </CardContent>

     <CardFooter className="flex justify-between">
       {step > 1 ? (
         <Button variant="outline" onClick={prevStep}>
           Back
         </Button>
       ) : (
         <Button variant="outline" onClick={onCancel}>
           Cancel
         </Button>
       )}

       {step < 5 ? (
         <Button onClick={nextStep}>
           Next <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
       ) : (
         <Button onClick={handleCreateHabit}>Create Habit</Button>
       )}
     </CardFooter>
   </Card>
 )
}
