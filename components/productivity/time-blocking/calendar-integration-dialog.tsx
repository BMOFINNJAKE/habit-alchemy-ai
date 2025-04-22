"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CloudIcon as CloudCheck, Calendar } from "lucide-react"

const CALENDAR_SERVICES = [
  { value: "google", label: "Google Calendar" },
  { value: "outlook", label: "Microsoft Outlook" },
  { value: "apple", label: "Apple Calendar" },
]

interface CalendarIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CalendarIntegrationDialog({ open, onOpenChange }: CalendarIntegrationDialogProps) {
  const [selectedService, setSelectedService] = useState("google")
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [syncFrequency, setSyncFrequency] = useState("hourly")
  const [calendarId, setCalendarId] = useState("")
  const { toast } = useToast()

  const handleConnect = () => {
    // In a real implementation, this would redirect to OAuth flow
    setIsConnecting(true)

    // Simulate API call
    setTimeout(() => {
      setIsConnecting(false)
      setIsConnected(true)
      setSyncEnabled(true)

      toast({
        title: "Calendar connected",
        description: `Successfully connected to ${CALENDAR_SERVICES.find((s) => s.value === selectedService)?.label}`,
      })
    }, 1500)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setSyncEnabled(false)

    toast({
      title: "Calendar disconnected",
      description: "Your calendar integration has been removed.",
    })
  }

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem(
      "calendarSettings",
      JSON.stringify({
        service: selectedService,
        syncEnabled,
        frequency: syncFrequency,
        calendarId,
      }),
    )

    toast({
      title: "Calendar settings saved",
      description: "Your calendar sync preferences have been updated.",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Calendar Integration</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="calendar-service">Calendar Service</Label>
            <Select value={selectedService} onValueChange={setSelectedService} disabled={isConnected}>
              <SelectTrigger id="calendar-service">
                <SelectValue placeholder="Select calendar service" />
              </SelectTrigger>
              <SelectContent>
                {CALENDAR_SERVICES.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isConnected ? (
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
              {isConnecting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Connecting...
                </>
              ) : (
                <>Connect Calendar</>
              )}
            </Button>
          ) : (
            <>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg flex items-start gap-3">
                <CloudCheck className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-300">
                    Connected to {CALENDAR_SERVICES.find((s) => s.value === selectedService)?.label}
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Your calendar is synced and up to date
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="mt-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sync-toggle" className="text-base font-medium">
                    Two-way synchronization
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sync events between your calendar and time blocks
                  </p>
                </div>
                <Switch id="sync-toggle" checked={syncEnabled} onCheckedChange={setSyncEnabled} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sync-frequency">Sync frequency</Label>
                <Select value={syncFrequency} onValueChange={setSyncFrequency} disabled={!syncEnabled}>
                  <SelectTrigger id="sync-frequency">
                    <SelectValue placeholder="Select sync frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="calendar-id">
                  Selected Calendar
                  <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                </Label>
                <Input
                  id="calendar-id"
                  value={calendarId}
                  onChange={(e) => setCalendarId(e.target.value)}
                  placeholder="Leave empty to use primary calendar"
                  disabled={!syncEnabled}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a specific calendar ID if you want to sync with a calendar other than your primary one
                </p>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" className="mx-auto flex items-center gap-2" disabled={!syncEnabled}>
                  <Calendar className="h-4 w-4" />
                  Sync Now
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
