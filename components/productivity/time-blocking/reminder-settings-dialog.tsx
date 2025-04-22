"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Bell } from "lucide-react"

interface ReminderSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ReminderSettingsDialog({ open, onOpenChange }: ReminderSettingsDialogProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [defaultReminderTime, setDefaultReminderTime] = useState("15")
  const [systemSoundsEnabled, setSystemSoundsEnabled] = useState(true)
  const { toast } = useToast()

  const handleRequestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      })
      return
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true)
      toast({
        title: "Notifications enabled",
        description: "You'll receive reminders for your time blocks.",
      })
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      setNotificationsEnabled(true)
      toast({
        title: "Notifications enabled",
        description: "You'll receive reminders for your time blocks.",
      })
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please allow notifications in your browser settings.",
        variant: "destructive",
      })
    }
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem(
      "reminderSettings",
      JSON.stringify({
        enabled: notificationsEnabled,
        defaultTime: Number.parseInt(defaultReminderTime),
        sounds: systemSoundsEnabled,
      }),
    )

    toast({
      title: "Reminder settings saved",
      description: "Your reminder preferences have been updated.",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reminder Settings</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-toggle" className="text-base font-medium">
                Enable notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive notifications before your scheduled time blocks
              </p>
            </div>
            <Switch
              id="notifications-toggle"
              checked={notificationsEnabled}
              onCheckedChange={(checked) => {
                if (checked && Notification.permission !== "granted") {
                  handleRequestPermission()
                } else {
                  setNotificationsEnabled(checked)
                }
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="default-reminder">Default reminder time</Label>
            <Select value={defaultReminderTime} onValueChange={setDefaultReminderTime} disabled={!notificationsEnabled}>
              <SelectTrigger id="default-reminder">
                <SelectValue placeholder="Select default reminder time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="10">10 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">This will be the default for all new time blocks</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sounds-toggle" className="text-base font-medium">
                Play sounds with notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">Play a sound when reminder notifications appear</p>
            </div>
            <Switch
              id="sounds-toggle"
              checked={systemSoundsEnabled}
              onCheckedChange={setSystemSoundsEnabled}
              disabled={!notificationsEnabled}
            />
          </div>

          {notificationsEnabled && (
            <div className="bg-primary/10 p-4 rounded-lg flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Test your notifications</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Make sure notifications are working properly on your device
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    new Notification("Test notification", {
                      body: "This is a test reminder notification",
                      icon: "/favicon.ico",
                    })
                  }}
                  className="mt-2"
                >
                  Send test notification
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
