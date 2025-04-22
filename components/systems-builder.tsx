"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Plus, X, Check, Target, Layers, Repeat } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface System {
  id: string
  name: string
  description: string
  category: string
  identity: string // The identity you want to build
  cue: string // Environmental trigger
  craving: string // The motivation/desire
  response: string // The actual habit/action
  reward: string // The benefit
  consistency: number // 0-100%
  startDate: string
  checkIns: CheckIn[]
  user_id?: string
}

interface CheckIn {
  id: string
  date: string
  completed: boolean
  notes?: string
}

const CATEGORIES = [
  { value: "health", label: "Health & Fitness" },
  { value: "productivity", label: "Productivity" },
  { value: "learning", label: "Learning" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "social", label: "Social" },
  { value: "finance", label: "Finance" },
  { value: "career", label: "Career" },
]

export function SystemsBuilder() {
  const { toast } = useToast()
  const [systems, setSystems] = useState<System[]>([
    {
      id: "1",
      name: "Daily Reading Habit",
      description: "Build a consistent reading habit to expand knowledge",
      category: "learning",
      identity: "I am a lifelong learner who reads every day",
      cue: "After dinner, I will go to my reading chair",
      craving: "I want to learn something new and interesting",
      response: "Read for at least 20 minutes",
      reward: "Track progress in reading journal and share insights",
      consistency: 85,
      startDate: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0], // 30 days ago
      checkIns: [
        {
          id: "c1",
          date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
          completed: true,
          notes: "Read 25 pages of Atomic Habits",
        },
        {
          id: "c2",
          date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
          completed: true,
          notes: "Read 30 pages of Deep Work",
        },
        {
          id: "c3",
          date: new Date().toISOString().split("T")[0],
          completed: false,
        },
      ],
    },
    {
      id: "2",
      name: "Morning Exercise Routine",
      description: "Create a consistent morning exercise system",
      category: "health",
      identity: "I am a person who prioritizes physical health",
      cue: "After brushing teeth, change into workout clothes",
      craving: "I want to feel energized and strong",
      response: "Complete a 15-minute workout routine",
      reward: "Take a refreshing shower and log workout in app",
      consistency: 70,
      startDate: new Date(Date.now() - 45 * 86400000).toISOString().split("T")[0], // 45 days ago
      checkIns: [
        {
          id: "c4",
          date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
          completed: true,
          notes: "15 min HIIT workout",
        },
        {
          id: "c5",
          date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
          completed: false,
          notes: "Skipped due to early meeting",
        },
        {
          id: "c6",
          date: new Date().toISOString().split("T")[0],
          completed: false,
        },
      ],
    },
  ])
  const [newSystemOpen, setNewSystemOpen] = useState(false)
  const [newSystem, setNewSystem] = useState<Omit<System, "id" | "consistency" | "checkIns">>({
    name: "",
    description: "",
    category: "productivity",
    identity: "",
    cue: "",
    craving: "",
    response: "",
    reward: "",
    startDate: new Date().toISOString().split("T")[0],
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("systems")
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [newCheckIn, setNewCheckIn] = useState({
    completed: true,
    notes: "",
  })

  // Get user ID on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
        fetchSystems(data.user.id)
      } else {
        setIsLoading(false)
      }
    }
    getUser()
  }, [])

  // Fetch systems from Supabase
  const fetchSystems = async (uid: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("systems")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })

      if (error) throw error

      if (data) {
        // Transform data to match our System interface
        const transformedSystems = data.map((system) => ({
          id: system.id,
          name: system.name,
          description: system.description || "",
          category: system.category || "productivity",
          identity: system.identity || "",
          cue: system.cue || "",
          craving: system.craving || "",
          response: system.response || "",
          reward: system.reward || "",
          consistency: system.consistency || 0,
          startDate: system.start_date || new Date().toISOString().split("T")[0],
          checkIns: system.check_ins || [],
          user_id: system.user_id,
        }))
        setSystems(transformedSystems)
      }
    } catch (error) {
      console.error("Error fetching systems:", error)
      toast({
        title: "Error",
        description: "Failed to fetch systems. Using sample data instead.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSystem = async () => {
    if (!newSystem.name) {
      toast({
        title: "Error",
        description: "System name is required",
        variant: "destructive",
      })
      return
    }

    const system: System = {
      ...newSystem,
      id: Date.now().toString(),
      consistency: 0,
      checkIns: [],
    }

    if (userId) {
      // Save to Supabase
      try {
        const { error } = await supabase.from("systems").insert({
          name: system.name,
          description: system.description,
          category: system.category,
          identity: system.identity,
          cue: system.cue,
          craving: system.craving,
          response: system.response,
          reward: system.reward,
          consistency: 0,
          start_date: system.startDate,
          check_ins: [],
          user_id: userId,
        })

        if (error) throw error

        // Refresh systems
        fetchSystems(userId)
      } catch (error) {
        console.error("Error adding system:", error)
        toast({
          title: "Error",
          description: "Failed to save system to database. Adding locally only.",
          variant: "destructive",
        })
        // Fall back to local state
        setSystems([...systems, system])
      }
    } else {
      // Just update local state if no user ID
      setSystems([...systems, system])
    }

    setNewSystem({
      name: "",
      description: "",
      category: "productivity",
      identity: "",
      cue: "",
      craving: "",
      response: "",
      reward: "",
      startDate: new Date().toISOString().split("T")[0],
    })
    setNewSystemOpen(false)

    toast({
      title: "System added",
      description: "Your new system has been created",
    })
  }

  const removeSystem = async (id: string) => {
    if (userId) {
      try {
        const { error } = await supabase.from("systems").delete().eq("id", id)

        if (error) throw error

        // Refresh systems
        fetchSystems(userId)
      } catch (error) {
        console.error("Error removing system:", error)
        toast({
          title: "Error",
          description: "Failed to remove system from database. Removing locally only.",
          variant: "destructive",
        })
        // Fall back to local state
        setSystems(systems.filter((system) => system.id !== id))
      }
    } else {
      // Just update local state if no user ID
      setSystems(systems.filter((system) => system.id !== id))
    }

    toast({
      title: "System removed",
      description: "Your system has been removed",
    })
  }

  const addCheckIn = async () => {
    if (!selectedSystem) return

    const today = new Date().toISOString().split("T")[0]
    const existingCheckIn = selectedSystem.checkIns.find((c) => c.date === today)

    if (existingCheckIn) {
      toast({
        title: "Already checked in",
        description: "You've already checked in for today",
        variant: "destructive",
      })
      return
    }

    const newCheckInItem = {
      id: Date.now().toString(),
      date: today,
      completed: newCheckIn.completed,
      notes: newCheckIn.notes,
    }

    // Calculate new consistency
    const totalDays = Math.max(
      1,
      Math.floor((Date.now() - new Date(selectedSystem.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
    )
    const completedCheckIns = selectedSystem.checkIns.filter((c) => c.completed).length + (newCheckIn.completed ? 1 : 0)
    const newConsistency = Math.round((completedCheckIns / totalDays) * 100)

    const updatedSystem = {
      ...selectedSystem,
      checkIns: [...selectedSystem.checkIns, newCheckInItem],
      consistency: newConsistency,
    }

    if (userId) {
      try {
        const { error } = await supabase
          .from("systems")
          .update({
            check_ins: updatedSystem.checkIns,
            consistency: newConsistency,
          })
          .eq("id", selectedSystem.id)

        if (error) throw error

        // Update local state
        setSystems(systems.map((s) => (s.id === selectedSystem.id ? updatedSystem : s)))
      } catch (error) {
        console.error("Error updating system:", error)
        toast({
          title: "Error",
          description: "Failed to update system in database. Updating locally only.",
          variant: "destructive",
        })
        // Fall back to local state update
        setSystems(systems.map((s) => (s.id === selectedSystem.id ? updatedSystem : s)))
      }
    } else {
      // Just update local state if no user ID
      setSystems(systems.map((s) => (s.id === selectedSystem.id ? updatedSystem : s)))
    }

    setSelectedSystem(updatedSystem)
    setCheckInOpen(false)
    setNewCheckIn({
      completed: true,
      notes: "",
    })

    toast({
      title: "Check-in recorded",
      description: newCheckIn.completed
        ? "Great job maintaining your system!"
        : "Don't worry, consistency is built over time.",
    })
  }

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category
  }

  const getRecentCheckIns = (system: System, days = 7) => {
    const result = []
    const today = new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const checkIn = system.checkIns.find((c) => c.date === dateString)
      result.push({
        date: dateString,
        completed: checkIn ? checkIn.completed : false,
        notes: checkIn?.notes || "",
      })
    }

    return result
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  const getDaysSinceStart = (startDate: string) => {
    const start = new Date(startDate)
    const today = new Date()
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getCurrentStreak = (system: System) => {
    let streak = 0
    const sortedCheckIns = [...system.checkIns]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((c) => new Date(c.date) <= new Date())

    for (const checkIn of sortedCheckIns) {
      if (checkIn.completed) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Systems Builder</CardTitle>
            <CardDescription>Build identity-based habits and systems</CardDescription>
          </div>
          <Button size="sm" onClick={() => setNewSystemOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New System
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="systems" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="systems">My Systems</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="systems" className="space-y-4">
            {systems.length > 0 ? (
              systems.map((system) => (
                <Card key={system.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-lg">{system.name}</h3>
                        <p className="text-sm text-muted-foreground">{system.description}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {getCategoryLabel(system.category)}
                          </span>
                          <span className="text-xs ml-2">
                            {getDaysSinceStart(system.startDate)} days • {getCurrentStreak(system)} day streak
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSystem(system)
                          setCheckInOpen(true)
                        }}
                      >
                        Check In
                      </Button>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Consistency</span>
                        <span>{system.consistency}%</span>
                      </div>
                      <Progress value={system.consistency} className="h-2" />
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-1">
                      {getRecentCheckIns(system).map((checkIn, index) => (
                        <div key={index} className="text-center">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto ${
                              checkIn.completed
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {checkIn.completed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </div>
                          <div className="text-xs mt-1">{formatDate(checkIn.date)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Target className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">Identity</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{system.identity}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Repeat className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">Response</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{system.response}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeSystem(system.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium mb-1">No systems yet</h3>
                <p className="text-sm mb-4">Create your first system to start building better habits</p>
                <Button onClick={() => setNewSystemOpen(true)}>Create System</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">System Insights</h3>
                {systems.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted/50 p-3 rounded-md text-center">
                        <div className="text-2xl font-bold">
                          {systems.reduce((sum, system) => sum + getCurrentStreak(system), 0) / systems.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg. Current Streak</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md text-center">
                        <div className="text-2xl font-bold">
                          {Math.round(
                            systems.reduce((sum, system) => sum + system.consistency, 0) / systems.length || 0,
                          )}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">Avg. Consistency</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md text-center">
                        <div className="text-2xl font-bold">{systems.length}</div>
                        <div className="text-xs text-muted-foreground">Active Systems</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Most Consistent Systems</h4>
                      <div className="space-y-2">
                        {[...systems]
                          .sort((a, b) => b.consistency - a.consistency)
                          .slice(0, 3)
                          .map((system) => (
                            <div key={system.id} className="flex justify-between items-center">
                              <div className="text-sm">{system.name}</div>
                              <div className="text-sm font-medium">{system.consistency}%</div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Systems Needing Attention</h4>
                      <div className="space-y-2">
                        {[...systems]
                          .sort((a, b) => a.consistency - b.consistency)
                          .slice(0, 3)
                          .map((system) => (
                            <div key={system.id} className="flex justify-between items-center">
                              <div className="text-sm">{system.name}</div>
                              <div className="text-sm font-medium">{system.consistency}%</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Create systems to see insights</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Atomic Habits Framework</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center mr-2">
                        1
                      </div>
                      <div className="font-medium">Make it obvious</div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-10">
                      Design your environment to make cues for good habits visible and clear.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center justify-center mr-2">
                        2
                      </div>
                      <div className="font-medium">Make it attractive</div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-10">
                      Pair habits you need to do with habits you want to do.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 flex items-center justify-center mr-2">
                        3
                      </div>
                      <div className="font-medium">Make it easy</div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-10">
                      Reduce friction for good habits and increase friction for bad ones.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 flex items-center justify-center mr-2">
                        4
                      </div>
                      <div className="font-medium">Make it satisfying</div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-10">
                      Create immediate rewards to reinforce your habit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={newSystemOpen} onOpenChange={setNewSystemOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New System</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">System Name</Label>
              <Input
                id="name"
                value={newSystem.name}
                onChange={(e) => setNewSystem({ ...newSystem, name: e.target.value })}
                placeholder="Enter system name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newSystem.description}
                onChange={(e) => setNewSystem({ ...newSystem, description: e.target.value })}
                placeholder="Describe your system"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newSystem.category}
                onValueChange={(value) => setNewSystem({ ...newSystem, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="identity">Identity Statement</Label>
              <Input
                id="identity"
                value={newSystem.identity}
                onChange={(e) => setNewSystem({ ...newSystem, identity: e.target.value })}
                placeholder="I am someone who..."
              />
              <p className="text-xs text-muted-foreground">
                Focus on the type of person you wish to become, not the outcome
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cue">Cue (Trigger)</Label>
              <Input
                id="cue"
                value={newSystem.cue}
                onChange={(e) => setNewSystem({ ...newSystem, cue: e.target.value })}
                placeholder="After I..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="craving">Craving (Motivation)</Label>
              <Input
                id="craving"
                value={newSystem.craving}
                onChange={(e) => setNewSystem({ ...newSystem, craving: e.target.value })}
                placeholder="I want to..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="response">Response (Action)</Label>
              <Input
                id="response"
                value={newSystem.response}
                onChange={(e) => setNewSystem({ ...newSystem, response: e.target.value })}
                placeholder="I will..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reward">Reward (Benefit)</Label>
              <Input
                id="reward"
                value={newSystem.reward}
                onChange={(e) => setNewSystem({ ...newSystem, reward: e.target.value })}
                placeholder="Then I will..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={newSystem.startDate}
                onChange={(e) => setNewSystem({ ...newSystem, startDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSystemOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addSystem}>Create System</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Daily Check-In</DialogTitle>
          </DialogHeader>
          {selectedSystem && (
            <div className="py-4">
              <div className="mb-4">
                <h3 className="font-medium">{selectedSystem.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedSystem.response}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="completed">Did you complete this today?</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={newCheckIn.completed ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewCheckIn({ ...newCheckIn, completed: true })}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Yes
                    </Button>
                    <Button
                      variant={!newCheckIn.completed ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewCheckIn({ ...newCheckIn, completed: false })}
                    >
                      <X className="h-4 w-4 mr-2" />
                      No
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newCheckIn.notes}
                    onChange={(e) => setNewCheckIn({ ...newCheckIn, notes: e.target.value })}
                    placeholder="Add any notes about today's progress..."
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCheckIn}>Save Check-In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
