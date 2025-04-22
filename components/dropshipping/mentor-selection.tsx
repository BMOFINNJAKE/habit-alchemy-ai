"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Mentor } from "@/components/dropshipping/types"

interface MentorSelectionProps {
  mentors: Mentor[]
  selectedMentor: string | null
  showMentorDialog: boolean
  setShowMentorDialog: (show: boolean) => void
  handleSelectMentor: (mentorId: string) => void
}

export function MentorSelection({
  mentors,
  selectedMentor,
  showMentorDialog,
  setShowMentorDialog,
  handleSelectMentor,
}: MentorSelectionProps) {
  return (
    <Dialog open={showMentorDialog} onOpenChange={setShowMentorDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Mentor</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className={`p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                selectedMentor === mentor.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleSelectMentor(mentor.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={mentor.image || "/placeholder.svg"} alt={mentor.name} />
                  <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{mentor.name}</h3>
                  <p className="text-sm text-muted-foreground">{mentor.specialty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowMentorDialog(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
