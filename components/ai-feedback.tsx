"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface AIFeedbackProps {
  responseId?: string
  onFeedbackSubmit?: (feedback: { helpful: boolean; comment: string; responseId?: string }) => void
}

export default function AIFeedback({ responseId, onFeedbackSubmit }: AIFeedbackProps) {
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [comment, setComment] = useState("")
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFeedback = (isHelpful: boolean) => {
    setHelpful(isHelpful)
    setShowCommentBox(true)
  }

  const handleSubmit = () => {
    if (helpful === null) return

    setIsSubmitting(true)

    // If onFeedbackSubmit is provided, call it
    if (onFeedbackSubmit) {
      onFeedbackSubmit({
        helpful,
        comment,
        responseId,
      })
    }

    // Otherwise, just show a toast
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!",
    })

    // Reset the form
    setHelpful(null)
    setComment("")
    setShowCommentBox(false)
    setIsSubmitting(false)
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Was this response helpful?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Button variant={helpful === true ? "default" : "outline"} size="sm" onClick={() => handleFeedback(true)}>
            <ThumbsUp className="h-4 w-4 mr-1" />
            Yes
          </Button>
          <Button variant={helpful === false ? "default" : "outline"} size="sm" onClick={() => handleFeedback(false)}>
            <ThumbsDown className="h-4 w-4 mr-1" />
            No
          </Button>
        </div>

        {showCommentBox && (
          <div className="mt-4">
            <Textarea
              placeholder="Tell us more about your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )}
      </CardContent>

      {showCommentBox && (
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
