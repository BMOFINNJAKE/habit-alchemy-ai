"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, MessageSquare, Send, ArrowUpRight } from "lucide-react"
import type { ChatMessage, Mentor } from "@/components/dropshipping/types"
import { sendMessageToAIDropshipping } from "@/lib/ai-service"

interface ChatInterfaceProps {
  selectedMentor: Mentor | null
  chatHistory: ChatMessage[]
  setChatHistory: (history: ChatMessage[]) => void
  isLoadingChat: boolean
  setIsLoadingChat: (isLoading: boolean) => void
}

export function ChatInterface({
  selectedMentor,
  chatHistory,
  setChatHistory,
  isLoadingChat,
  setIsLoadingChat,
}: ChatInterfaceProps) {
  const [chatMessage, setChatMessage] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Handle chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim() || isLoadingChat || !selectedMentor) return

    // Generate a unique ID for this message
    const messageId = Date.now().toString()

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: messageId,
      role: "user",
      content: chatMessage,
      timestamp: new Date().toISOString(),
    }

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: messageId + "-loading",
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isLoading: true,
    }

    setChatHistory([...chatHistory, userMessage, loadingMessage])
    setIsLoadingChat(true)
    setChatMessage("")

    try {
      // Prepare context for the AI
      let contextPrompt = ""

      if (selectedMentor) {
        contextPrompt = `You are an AI assistant trained on ${selectedMentor.name}'s dropshipping strategies. ${selectedMentor.name} is known for ${selectedMentor.specialty}. ${selectedMentor.description} Please provide advice based on this expertise. The user's question is: ${chatMessage}`
      } else {
        contextPrompt = `You are a dropshipping expert AI assistant. Please provide helpful advice on dropshipping strategies, product research, marketing, and store optimization. The user's question is: ${chatMessage}`
      }

      // Send message to AI
      const { response } = await sendMessageToAIDropshipping(contextPrompt)

      // Remove loading message and add AI response
      const filteredHistory = chatHistory.filter((msg) => msg.id !== loadingMessage.id)
      setChatHistory([
        ...filteredHistory,
        userMessage,
        {
          id: messageId + "-response",
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error("Error sending message to AI:", error)

      // Remove loading message and add error message
      const filteredHistory = chatHistory.filter((msg) => msg.id !== loadingMessage.id)
      setChatHistory([
        ...filteredHistory,
        userMessage,
        {
          id: messageId + "-error",
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again later.",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoadingChat(false)
    }
  }

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    if (selectedMentor && !isLoadingChat) {
      setChatMessage(question)
    }
  }

  // Scroll to bottom of chat when new messages are added
  if (chatEndRef.current) {
    chatEndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-3">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              AI Dropshipping Assistant
            </CardTitle>
            <CardDescription>
              {selectedMentor
                ? `Ask anything about ${selectedMentor.name}'s dropshipping strategy`
                : "Select a mentor to get personalized advice"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto mb-4 p-4">
            <div className="space-y-4">
              {chatHistory.length > 0 ? (
                chatHistory.map((message) =>
                  message.role === "system" ? (
                    <div key={message.id} className="bg-muted p-3 rounded-lg text-center text-sm">
                      {message.content}
                    </div>
                  ) : (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <p className="text-sm">Thinking...</p>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">Ask anything about dropshipping</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Get personalized advice based on your selected mentor's strategy and approach
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input
                placeholder={
                  selectedMentor ? `Ask about ${selectedMentor.name}'s strategy...` : "Select a mentor first..."
                }
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={!selectedMentor || isLoadingChat}
                className="flex-1"
              />
              <Button type="submit" disabled={!selectedMentor || !chatMessage.trim() || isLoadingChat}>
                {isLoadingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2 px-3"
                onClick={() => handleSuggestedQuestion("How do I find winning products for dropshipping?")}
                disabled={!selectedMentor || isLoadingChat}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                How to find winning products?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2 px-3"
                onClick={() => handleSuggestedQuestion("What's the best way to scale a successful ad campaign?")}
                disabled={!selectedMentor || isLoadingChat}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                How to scale a successful ad?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2 px-3"
                onClick={() =>
                  handleSuggestedQuestion("What are the best practices for store design and optimization?")
                }
                disabled={!selectedMentor || isLoadingChat}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Best store design practices?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2 px-3"
                onClick={() => handleSuggestedQuestion("How do I handle customer service and returns effectively?")}
                disabled={!selectedMentor || isLoadingChat}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Customer service best practices?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2 px-3"
                onClick={() => handleSuggestedQuestion("What are the most reliable suppliers for dropshipping?")}
                disabled={!selectedMentor || isLoadingChat}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Finding reliable suppliers?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
