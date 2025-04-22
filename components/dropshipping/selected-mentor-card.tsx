"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import type { Mentor } from "@/components/dropshipping/types"

interface SelectedMentorCardProps {
  selectedMentor: Mentor | null
  onChangeMentor: () => void
}

export function SelectedMentorCard({ selectedMentor, onChangeMentor }: SelectedMentorCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          Selected Mentor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedMentor ? (
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={selectedMentor.image || "/placeholder.svg"} alt={selectedMentor.name} />
              <AvatarFallback>{selectedMentor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="font-medium">{selectedMentor.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{selectedMentor.specialty}</p>
            <Button variant="outline" size="sm" className="w-full" onClick={onChangeMentor}>
              Change Mentor
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">No mentor selected</p>
            <Button variant="outline" size="sm" onClick={onChangeMentor}>
              Select a Mentor
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
