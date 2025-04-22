"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Save, CalendarIcon, Search, Tag, Plus } from "lucide-react"

export default function JournalPage() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("write")
  const [journalEntry, setJournalEntry] = useState("")
  const [journalTitle, setJournalTitle] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock journal entries for demonstration
  const [journalEntries, setJournalEntries] = useState([
    {
      id: "1",
      date: new Date(Date.now() - 86400000 * 2), // 2 days ago
      title: "Project Planning Session",
      content:
        "Today I planned out the structure for the new marketing campaign. I'm excited about the direction it's taking.",
      tags: ["work", "planning", "marketing"],
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000), // 1 day ago
      title: "Deep Work Session",
      content: "Had a great 3-hour deep work session. Completed the design mockups ahead of schedule.",
      tags: ["productivity", "design", "focus"],
    },
  ])

  const handleSaveEntry = () => {
    if (!journalTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title for your journal entry",
        variant: "destructive",
      })
      return
    }

    if (!journalEntry.trim()) {
      toast({
        title: "Content Required",
        description: "Please write something in your journal entry",
        variant: "destructive",
      })
      return
    }

    const newEntry = {
      id: Date.now().toString(),
      date: date,
      title: journalTitle,
      content: journalEntry,
      tags: [...tags],
    }

    setJournalEntries([newEntry, ...journalEntries])

    // Reset form
    setJournalTitle("")
    setJournalEntry("")
    setTags([])

    toast({
      title: "Journal Entry Saved",
      description: "Your journal entry has been saved successfully",
    })
  }

  const handleAddTag = () => {
    if (!newTag.trim()) return
    if (!tags.includes(newTag.toLowerCase())) {
      setTags([...tags, newTag.toLowerCase()])
    }
    setNewTag("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const filteredEntries = journalEntries.filter((entry) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.tags.some((tag) => tag.includes(query))
    )
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-muted-foreground">Record your thoughts, ideas, and reflections</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
        </TabsList>

        <TabsContent value="write">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>New Journal Entry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Entry title..."
                      value={journalTitle}
                      onChange={(e) => setJournalTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entry">Journal Entry</Label>
                    <Textarea
                      id="entry"
                      placeholder="Write your thoughts here..."
                      className="min-h-[300px]"
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <div
                          key={tag}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center"
                        >
                          <span>{tag}</span>
                          <button
                            className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button onClick={handleAddTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleSaveEntry} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Journal Entry
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    className="rounded-md border"
                  />
                  <p className="mt-4 text-center text-sm">
                    Selected: <span className="font-medium">{format(date, "PPP")}</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Journal Entries</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEntries.length > 0 ? (
                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg">{entry.title}</h3>
                          <span className="text-sm text-muted-foreground">{format(entry.date, "PPP")}</span>
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-3">{entry.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag) => (
                            <div
                              key={tag}
                              className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-xs flex items-center"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              <span>{tag}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No journal entries found</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("write")}>
                    Create your first entry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
