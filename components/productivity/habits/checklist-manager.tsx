"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2, Save, X, MoreHorizontal, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { v4 as uuidv4 } from "uuid"

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  category?: string
  priority?: "low" | "medium" | "high"
  due_date?: string
}

interface Checklist {
  id: string
  name: string
  type: "daily" | "weekly" | "custom"
  items: ChecklistItem[]
}

export default function ChecklistManager() {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null)
  const [newItem, setNewItem] = useState("")
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [newChecklistDialog, setNewChecklistDialog] = useState(false)
  const [editChecklistDialog, setEditChecklistDialog] = useState(false)
  const [newChecklistName, setNewChecklistName] = useState("")
  const [newChecklistType, setNewChecklistType] = useState<"daily" | "weekly" | "custom">("daily")
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  // Load checklists from Supabase
  useEffect(() => {
    const loadChecklists = async () => {
      try {
        setIsLoading(true)

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("User not authenticated")
        }

        // Fetch checklists
        const { data, error } = await supabase
          .from("checklists")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
          setChecklists(data)
          setActiveChecklist(data[0].id)
        } else {
          // Create default daily checklist if none exists
          const defaultChecklist = {
            name: "Daily Checklist",
            type: "daily" as const,
            items: [],
          }

          await createChecklist(defaultChecklist)
        }
      } catch (error) {
        console.error("Error loading checklists:", error)
        toast({
          title: "Error loading checklists",
          description: "We couldn't load your checklists. Using local data instead.",
          variant: "destructive",
        })

        // Try loading from localStorage as fallback
        const savedChecklists = localStorage.getItem("checklists")
        if (savedChecklists) {
          try {
            const parsed = JSON.parse(savedChecklists)
            setChecklists(parsed)
            setActiveChecklist(parsed[0]?.id || null)
          } catch (e) {
            console.error("Error parsing saved checklists:", e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadChecklists()
  }, [supabase, toast])

  // Save checklists to localStorage for offline access
  useEffect(() => {
    if (checklists.length > 0) {
      localStorage.setItem("checklists", JSON.stringify(checklists))
    }
  }, [checklists])

  // Create a new checklist
  const createChecklist = async (checklist: Omit<Checklist, "id">) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const newChecklist = {
        id: uuidv4(),
        ...checklist,
        user_id: user.id,
      }

      const { data, error } = await supabase.from("checklists").insert(newChecklist).select().single()

      if (error) throw error

      setChecklists([data, ...checklists])
      setActiveChecklist(data.id)

      toast({
        title: "Checklist created",
        description: `Your ${checklist.type} checklist "${checklist.name}" has been created.`,
      })

      return data
    } catch (error) {
      console.error("Error creating checklist:", error)
      toast({
        title: "Error creating checklist",
        description: "Your checklist was saved locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })

      // Add to local state anyway
      const newChecklist = {
        id: uuidv4(),
        ...checklist,
        user_id: "local",
      }

      setChecklists([newChecklist, ...checklists])
      setActiveChecklist(newChecklist.id)

      return newChecklist
    }
  }

  // Update a checklist
  const updateChecklist = async (id: string, updates: Partial<Checklist>) => {
    try {
      const { error } = await supabase.from("checklists").update(updates).eq("id", id)

      if (error) throw error

      setChecklists(checklists.map((checklist) => (checklist.id === id ? { ...checklist, ...updates } : checklist)))

      toast({
        title: "Checklist updated",
        description: "Your checklist has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating checklist:", error)
      toast({
        title: "Error updating checklist",
        description: "Your changes were saved locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })

      // Update local state anyway
      setChecklists(checklists.map((checklist) => (checklist.id === id ? { ...checklist, ...updates } : checklist)))
    }
  }

  // Delete a checklist
  const deleteChecklist = async (id: string) => {
    if (checklists.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one checklist.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("checklists").delete().eq("id", id)

      if (error) throw error

      const updatedChecklists = checklists.filter((checklist) => checklist.id !== id)
      setChecklists(updatedChecklists)

      // Set a new active checklist if the deleted one was active
      if (activeChecklist === id) {
        setActiveChecklist(updatedChecklists[0]?.id || null)
      }

      toast({
        title: "Checklist deleted",
        description: "Your checklist has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting checklist:", error)
      toast({
        title: "Error deleting checklist",
        description: "The checklist was removed locally but we couldn't sync this change to the cloud.",
        variant: "destructive",
      })

      // Remove from local state anyway
      const updatedChecklists = checklists.filter((checklist) => checklist.id !== id)
      setChecklists(updatedChecklists)

      // Set a new active checklist if the deleted one was active
      if (activeChecklist === id) {
        setActiveChecklist(updatedChecklists[0]?.id || null)
      }
    }
  }

  // Handle adding a new item to the active checklist
  const handleAddItem = async () => {
    if (!activeChecklist || !newItem.trim()) return

    const checklist = checklists.find((c) => c.id === activeChecklist)
    if (!checklist) return

    const newItemObject: ChecklistItem = {
      id: uuidv4(),
      text: newItem,
      completed: false,
    }

    const updatedItems = [...checklist.items, newItemObject]

    try {
      await updateChecklist(activeChecklist, { items: updatedItems })
      setNewItem("")
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  // Handle toggling an item's completion status
  const handleToggleItem = async (itemId: string) => {
    if (!activeChecklist) return

    const checklist = checklists.find((c) => c.id === activeChecklist)
    if (!checklist) return

    const updatedItems = checklist.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    )

    try {
      await updateChecklist(activeChecklist, { items: updatedItems })
    } catch (error) {
      console.error("Error toggling item:", error)
    }
  }

  // Handle editing an item
  const handleEditStart = (item: ChecklistItem) => {
    setEditingItemId(item.id)
    setEditText(item.text)
  }

  const handleEditSave = async () => {
    if (!activeChecklist || !editingItemId || !editText.trim()) {
      setEditingItemId(null)
      setEditText("")
      return
    }

    const checklist = checklists.find((c) => c.id === activeChecklist)
    if (!checklist) return

    const updatedItems = checklist.items.map((item) => (item.id === editingItemId ? { ...item, text: editText } : item))

    try {
      await updateChecklist(activeChecklist, { items: updatedItems })
      setEditingItemId(null)
      setEditText("")
    } catch (error) {
      console.error("Error updating item:", error)
      setEditingItemId(null)
      setEditText("")
    }
  }

  // Handle deleting an item
  const handleDeleteItem = async (itemId: string) => {
    if (!activeChecklist) return

    const checklist = checklists.find((c) => c.id === activeChecklist)
    if (!checklist) return

    const updatedItems = checklist.items.filter((item) => item.id !== itemId)

    try {
      await updateChecklist(activeChecklist, { items: updatedItems })
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  // Handle adding a new checklist
  const handleAddChecklist = async () => {
    if (!newChecklistName.trim()) return

    const newChecklist = {
      name: newChecklistName,
      type: newChecklistType,
      items: [],
    }

    await createChecklist(newChecklist)
    setNewChecklistName("")
    setNewChecklistDialog(false)
  }

  // Handle editing the active checklist
  const handleEditChecklist = async () => {
    if (!activeChecklist || !newChecklistName.trim()) return

    try {
      await updateChecklist(activeChecklist, {
        name: newChecklistName,
        type: newChecklistType,
      })

      setNewChecklistName("")
      setEditChecklistDialog(false)
    } catch (error) {
      console.error("Error updating checklist:", error)
    }
  }

  // Handle duplicating a checklist
  const handleDuplicateChecklist = async () => {
    if (!activeChecklist) return

    const checklist = checklists.find((c) => c.id === activeChecklist)
    if (!checklist) return

    const newChecklist = {
      name: `${checklist.name} (Copy)`,
      type: checklist.type,
      items: checklist.items,
    }

    await createChecklist(newChecklist)
  }

  // Get the active checklist
  const getActiveChecklist = () => {
    return checklists.find((c) => c.id === activeChecklist) || null
  }

  const currentChecklist = getActiveChecklist()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Your Checklists</h3>
          <p className="text-sm text-muted-foreground">Create and manage your daily tasks and recurring checklists</p>
        </div>
        <Button onClick={() => setNewChecklistDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Checklist
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <Tabs value={activeChecklist || ""} onValueChange={setActiveChecklist}>
            <TabsList className="mb-4 w-full h-auto flex flex-wrap">
              {checklists.map((checklist) => (
                <TabsTrigger key={checklist.id} value={checklist.id} className="flex-1">
                  {checklist.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {checklists.map((checklist) => (
              <TabsContent key={checklist.id} value={checklist.id} className="m-0">
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{checklist.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {checklist.type === "daily"
                          ? "Daily recurring checklist"
                          : checklist.type === "weekly"
                            ? "Weekly recurring checklist"
                            : "Custom checklist"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setNewChecklistName(checklist.name)
                            setNewChecklistType(checklist.type)
                            setEditChecklistDialog(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Checklist
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateChecklist()}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteChecklist(checklist.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a new item..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddItem()
                          }
                        }}
                      />
                      <Button onClick={handleAddItem}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {checklist.items.length > 0 ? (
                        checklist.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 rounded-md border">
                            {editingItemId === item.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleEditSave()
                                    } else if (e.key === "Escape") {
                                      setEditingItemId(null)
                                      setEditText("")
                                    }
                                  }}
                                />
                                <Button size="icon" variant="ghost" onClick={handleEditSave}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingItemId(null)
                                    setEditText("")
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={item.completed}
                                    onCheckedChange={() => handleToggleItem(item.id)}
                                    id={`item-${item.id}`}
                                  />
                                  <label
                                    htmlFor={`item-${item.id}`}
                                    className={`${item.completed ? "line-through text-muted-foreground" : ""}`}
                                  >
                                    {item.text}
                                  </label>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="icon" variant="ghost" onClick={() => handleEditStart(item)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No items in this checklist.</p>
                          <p className="text-sm">Add a new item to get started.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* New Checklist Dialog */}
          <Dialog open={newChecklistDialog} onOpenChange={setNewChecklistDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a new checklist</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Checklist Name</Label>
                  <Input
                    id="name"
                    value={newChecklistName}
                    onChange={(e) => setNewChecklistName(e.target.value)}
                    placeholder="e.g., Morning Routine"
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Checklist Type</Label>
                  <Select
                    value={newChecklistType}
                    onValueChange={(value) => setNewChecklistType(value as "daily" | "weekly" | "custom")}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select checklist type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Checklist</SelectItem>
                      <SelectItem value="weekly">Weekly Checklist</SelectItem>
                      <SelectItem value="custom">Custom Checklist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewChecklistDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddChecklist}>Create Checklist</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Checklist Dialog */}
          <Dialog open={editChecklistDialog} onOpenChange={setEditChecklistDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit checklist</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Checklist Name</Label>
                  <Input
                    id="edit-name"
                    value={newChecklistName}
                    onChange={(e) => setNewChecklistName(e.target.value)}
                    placeholder="e.g., Morning Routine"
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Checklist Type</Label>
                  <Select
                    value={newChecklistType}
                    onValueChange={(value) => setNewChecklistType(value as "daily" | "weekly" | "custom")}
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue placeholder="Select checklist type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Checklist</SelectItem>
                      <SelectItem value="weekly">Weekly Checklist</SelectItem>
                      <SelectItem value="custom">Custom Checklist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditChecklistDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditChecklist}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
