"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Edit2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export function DailyChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [newItem, setNewItem] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load checklist items from localStorage on component mount
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true)

      // First try to load from localStorage as a quick start
      const savedItems = localStorage.getItem("daily-checklist")
      if (savedItems) {
        try {
          setItems(JSON.parse(savedItems))
        } catch (error) {
          console.error("Error parsing saved checklist items:", error)
        }
      }

      try {
        // Then try to load from Supabase
        const { data, error } = await supabase.from("daily_tasks").select("*").order("created_at", { ascending: true })

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          const formattedItems = data.map((item) => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
          }))
          setItems(formattedItems)
        }
      } catch (error) {
        console.error("Error fetching checklist items:", error)
        toast({
          title: "Error",
          description: "Failed to load items from the cloud. Using local data instead.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [toast])

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("daily-checklist", JSON.stringify(items))
  }, [items])

  const handleAddItem = async () => {
    if (!newItem.trim()) return

    const item: ChecklistItem = {
      id: Date.now().toString(),
      text: newItem,
      completed: false,
    }

    try {
      // Add to Supabase
      const { data, error } = await supabase
        .from("daily_tasks")
        .insert([{ text: item.text, completed: item.completed }])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update with the returned data
      const newItem: ChecklistItem = {
        id: data.id,
        text: data.text,
        completed: data.completed,
      }

      setItems([...items, newItem])
      setNewItem("")

      toast({
        title: "Item added",
        description: "New item added to your checklist.",
      })
    } catch (error) {
      console.error("Error adding checklist item:", error)

      // Fallback to local only
      setItems([...items, item])
      setNewItem("")

      toast({
        title: "Item added locally",
        description: "Item added locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })
    }
  }

  const handleToggleItem = async (id: string) => {
    // Find the item
    const item = items.find((i) => i.id === id)
    if (!item) return

    try {
      // Update in Supabase
      const { error } = await supabase.from("daily_tasks").update({ completed: !item.completed }).eq("id", id)

      if (error) {
        throw error
      }

      // Update local state
      setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
    } catch (error) {
      console.error("Error toggling checklist item:", error)

      // Fallback to local only
      setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))

      toast({
        title: "Sync error",
        description: "Change saved locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      // Remove from Supabase
      const { error } = await supabase.from("daily_tasks").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Update local state
      setItems(items.filter((item) => item.id !== id))

      toast({
        title: "Item removed",
        description: "Item removed from your checklist.",
      })
    } catch (error) {
      console.error("Error removing checklist item:", error)

      // Fallback to local only
      setItems(items.filter((item) => item.id !== id))

      toast({
        title: "Sync error",
        description: "Item removed locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })
    }
  }

  const handleEditStart = (item: ChecklistItem) => {
    setEditingId(item.id)
    setEditText(item.text)
  }

  const handleEditSave = async () => {
    if (!editText.trim()) {
      toast({
        title: "Error",
        description: "Item text cannot be empty.",
        variant: "destructive",
      })
      return
    }

    try {
      // Update in Supabase
      const { error } = await supabase.from("daily_tasks").update({ text: editText }).eq("id", editingId)

      if (error) {
        throw error
      }

      // Update local state
      setItems(items.map((item) => (item.id === editingId ? { ...item, text: editText } : item)))
      setEditingId(null)
      setEditText("")

      toast({
        title: "Item updated",
        description: "Checklist item has been updated.",
      })
    } catch (error) {
      console.error("Error updating checklist item:", error)

      // Fallback to local only
      setItems(items.map((item) => (item.id === editingId ? { ...item, text: editText } : item)))
      setEditingId(null)
      setEditText("")

      toast({
        title: "Sync error",
        description: "Item updated locally but couldn't be synced to the cloud.",
        variant: "destructive",
      })
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditText("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Checklist</CardTitle>
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

        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading your checklist...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-md border">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditSave()
                          } else if (e.key === "Escape") {
                            handleEditCancel()
                          }
                        }}
                      />
                      <Button size="icon" variant="ghost" onClick={handleEditSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleEditCancel}>
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
              <div className="text-center py-4 text-muted-foreground">
                <p>No items in your checklist.</p>
                <p className="text-sm">Add a new item to get started.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DailyChecklist
