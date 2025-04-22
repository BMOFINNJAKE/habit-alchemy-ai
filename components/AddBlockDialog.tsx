"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NewTimeBlock } from "@/types/timeBlock"

interface AddBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newBlock: NewTimeBlock
  onNewBlockChange: (block: NewTimeBlock) => void
  onAddBlock: () => void
}

export const AddBlockDialog = ({ open, onOpenChange, newBlock, onNewBlockChange, onAddBlock }: AddBlockDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => onNewBlockChange({ ...newBlock, title: e.target.value })}
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
                onChange={(e) => onNewBlockChange({ ...newBlock, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newBlock.endTime}
                onChange={(e) => onNewBlockChange({ ...newBlock, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newBlock.category}
                onValueChange={(value) => onNewBlockChange({ ...newBlock, category: value })}
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
                    className={`h-8 w-8 rounded-full cursor-pointer ${
                      newBlock.color === color ? "ring-2 ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onNewBlockChange({ ...newBlock, color })}
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
              onChange={(e) => onNewBlockChange({ ...newBlock, description: e.target.value })}
              placeholder="Add details about this time block"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onAddBlock}>Add Block</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
