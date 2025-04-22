"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Mentor } from "@/components/dropshipping/types"

interface MentorCardProps {
  mentor: Mentor
  isSelected: boolean
  onSelect: (mentorId: string) => void
}

export function MentorCard({ mentor, isSelected, onSelect }: MentorCardProps) {
  return (
    <Card
      className={`cursor-pointer hover:border-primary transition-colors ${isSelected ? "border-primary" : ""}`}
      onClick={() => onSelect(mentor.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={mentor.image || "/placeholder.svg"} alt={mentor.name} />
            <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{mentor.name}</CardTitle>
            <CardDescription>{mentor.specialty}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{mentor.description}</p>
        <Button variant={isSelected ? "default" : "outline"} size="sm" className="w-full">
          {isSelected ? "Selected" : "Select as Mentor"}
        </Button>
      </CardContent>
    </Card>
  )
}
