"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Zap,
  Clock,
  Calendar,
  Bell,
  Mail,
  FileText,
  Plus,
  Play,
  Pause,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type TriggerType =
  | "time"
  | "project_deadline"
  | "task_completion"
  | "session_start"
  | "session_end"
  | "low_productivity"

type ActionType = "send_notification" | "send_email" | "create_task" | "schedule_focus_time" | "generate_report"

interface Automation {
  id: string
  name: string
  active: boolean
  trigger: {
    type: TriggerType
    config: Record<string, any>
  }
  action: {
    type: ActionType
    config: Record<string, any>
  }
  createdAt: number
}

export function WorkflowAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: "1",
      name: "Daily Agenda Email",
      active: true,
      trigger: {
        type: "time",
        config: {
          time: "08:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
      },
      action: {
        type: "send_email",
        config: {
          template: "daily_agenda",
          includeTasksForToday: true,
          includeUpcomingDeadlines: true,
        },
      },
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: "2",
      name: "Focus Mode Before Deadline",
      active: true,
      trigger: {
        type: "project_deadline",
        config: {
          daysBeforeDeadline: 2,
        },
      },
      action: {
        type: "schedule_focus_time",
        config: {
          duration: 120,
          blockCalendar: true,
          disableNotifications: true,
        },
      },
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: "3",
      name: "Task Rollover",
      active: false,
      trigger: {
        type: "time",
        config: {
          time: "23:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        },
      },
      action: {
        type: "create_task",
        config: {
          moveUncompletedTasks: true,
          prioritizeRolledOver: true,
        },
      },
      createdAt: Date.now() - 86400000,
    },
  ])

  const [isCreating, setIsCreating] = useState(false)
  const [newAutomation, setNewAutomation] = useState<Omit<Automation, "id" | "createdAt">>({
    name: "",
    active: true,
    trigger: {
      type: "time",
      config: {
        time: "09:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      },
    },
    action: {
      type: "send_notification",
      config: {
        message: "Time to start your day!",
        includeTaskList: true,
      },
    },
  })

  const handleToggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((automation) => (automation.id === id ? { ...automation, active: !automation.active } : automation)),
    )
  }

  const handleDeleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((automation) => automation.id !== id))
  }

  const handleCreateAutomation = () => {
    const newItem: Automation = {
      id: Date.now().toString(),
      ...newAutomation,
      createdAt: Date.now(),
    }

    setAutomations((prev) => [...prev, newItem])
    setIsCreating(false)
    setNewAutomation({
      name: "",
      active: true,
      trigger: {
        type: "time",
        config: {
          time: "09:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
      },
      action: {
        type: "send_notification",
        config: {
          message: "Time to start your day!",
          includeTaskList: true,
        },
      },
    })
  }

  const getTriggerIcon = (type: TriggerType) => {
    switch (type) {
      case "time":
        return <Clock className="h-4 w-4" />
      case "project_deadline":
        return <Calendar className="h-4 w-4" />
      case "task_completion":
        return <Check className="h-4 w-4" />
      case "session_start":
        return <Play className="h-4 w-4" />
      case "session_end":
        return <Pause className="h-4 w-4" />
      case "low_productivity":
        return <X className="h-4 w-4" />
    }
  }

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case "send_notification":
        return <Bell className="h-4 w-4" />
      case "send_email":
        return <Mail className="h-4 w-4" />
      case "create_task":
        return <FileText className="h-4 w-4" />
      case "schedule_focus_time":
        return <Clock className="h-4 w-4" />
      case "generate_report":
        return <FileText className="h-4 w-4" />
    }
  }

  const getTriggerDescription = (trigger: Automation["trigger"]) => {
    switch (trigger.type) {
      case "time":
        return `At ${trigger.config.time} on ${trigger.config.days.join(", ")}`
      case "project_deadline":
        return `${trigger.config.daysBeforeDeadline} days before deadline`
      case "task_completion":
        return "When a task is completed"
      case "session_start":
        return "When a work session starts"
      case "session_end":
        return "When a work session ends"
      case "low_productivity":
        return "When productivity is low"
    }
  }

  const getActionDescription = (action: Automation["action"]) => {
    switch (action.type) {
      case "send_notification":
        return `Send notification: "${action.config.message}"`
      case "send_email":
        return `Send ${action.config.template} email`
      case "create_task":
        return "Create task"
      case "schedule_focus_time":
        return `Schedule ${action.config.duration} min focus time`
      case "generate_report":
        return "Generate report"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workflow Automations</CardTitle>
            <CardDescription>Create automated workflows to save time and stay focused</CardDescription>
          </div>
          <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            Workflow automations are currently running in development mode. Some features may be limited.
          </AlertDescription>
        </Alert>

        {isCreating ? (
          <Card>
            <CardHeader>
              <CardTitle>Create New Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="automation-name">Automation Name</Label>
                  <Input
                    id="automation-name"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                    placeholder="e.g., Morning Reminder"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Trigger</h3>
                  <p className="text-sm text-muted-foreground mb-4">When should this automation run?</p>

                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="trigger-type">Trigger Type</Label>
                      <Select
                        value={newAutomation.trigger.type}
                        onValueChange={(value) =>
                          setNewAutomation({
                            ...newAutomation,
                            trigger: {
                              type: value as TriggerType,
                              config: {},
                            },
                          })
                        }
                      >
                        <SelectTrigger id="trigger-type">
                          <SelectValue placeholder="Select trigger" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="time">Specific Time</SelectItem>
                          <SelectItem value="project_deadline">Project Deadline Approaching</SelectItem>
                          <SelectItem value="task_completion">Task Completion</SelectItem>
                          <SelectItem value="session_start">Session Start</SelectItem>
                          <SelectItem value="session_end">Session End</SelectItem>
                          <SelectItem value="low_productivity">Low Productivity Detected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newAutomation.trigger.type === "time" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="trigger-time">Time</Label>
                          <Input
                            id="trigger-time"
                            type="time"
                            value={newAutomation.trigger.config.time || "09:00"}
                            onChange={(e) =>
                              setNewAutomation({
                                ...newAutomation,
                                trigger: {
                                  ...newAutomation.trigger,
                                  config: {
                                    ...newAutomation.trigger.config,
                                    time: e.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Days</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                              (day) => (
                                <Badge
                                  key={day}
                                  variant={newAutomation.trigger.config.days?.includes(day) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    const days = newAutomation.trigger.config.days || []
                                    const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day]

                                    setNewAutomation({
                                      ...newAutomation,
                                      trigger: {
                                        ...newAutomation.trigger,
                                        config: {
                                          ...newAutomation.trigger.config,
                                          days: newDays,
                                        },
                                      },
                                    })
                                  }}
                                >
                                  {day.substring(0, 3)}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {newAutomation.trigger.type === "project_deadline" && (
                      <div>
                        <Label htmlFor="days-before">Days Before Deadline</Label>
                        <Input
                          id="days-before"
                          type="number"
                          min="1"
                          value={newAutomation.trigger.config.daysBeforeDeadline || 2}
                          onChange={(e) =>
                            setNewAutomation({
                              ...newAutomation,
                              trigger: {
                                ...newAutomation.trigger,
                                config: {
                                  ...newAutomation.trigger.config,
                                  daysBeforeDeadline: Number.parseInt(e.target.value) || 2,
                                },
                              },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Action</h3>
                  <p className="text-sm text-muted-foreground mb-4">What should happen when the trigger fires?</p>

                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="action-type">Action Type</Label>
                      <Select
                        value={newAutomation.action.type}
                        onValueChange={(value) =>
                          setNewAutomation({
                            ...newAutomation,
                            action: {
                              type: value as ActionType,
                              config: {},
                            },
                          })
                        }
                      >
                        <SelectTrigger id="action-type">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="send_notification">Send Notification</SelectItem>
                          <SelectItem value="send_email">Send Email</SelectItem>
                          <SelectItem value="create_task">Create Task</SelectItem>
                          <SelectItem value="schedule_focus_time">Schedule Focus Time</SelectItem>
                          <SelectItem value="generate_report">Generate Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newAutomation.action.type === "send_notification" && (
                      <div>
                        <Label htmlFor="notification-message">Notification Message</Label>
                        <Textarea
                          id="notification-message"
                          value={newAutomation.action.config.message || ""}
                          onChange={(e) =>
                            setNewAutomation({
                              ...newAutomation,
                              action: {
                                ...newAutomation.action,
                                config: {
                                  ...newAutomation.action.config,
                                  message: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="Enter notification message"
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch
                            id="include-tasks"
                            checked={newAutomation.action.config.includeTaskList || false}
                            onCheckedChange={(checked) =>
                              setNewAutomation({
                                ...newAutomation,
                                action: {
                                  ...newAutomation.action,
                                  config: {
                                    ...newAutomation.action.config,
                                    includeTaskList: checked,
                                  },
                                },
                              })
                            }
                          />
                          <Label htmlFor="include-tasks">Include today's tasks</Label>
                        </div>
                      </div>
                    )}

                    {newAutomation.action.type === "schedule_focus_time" && (
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="focus-duration">Duration (minutes)</Label>
                          <Input
                            id="focus-duration"
                            type="number"
                            min="15"
                            step="15"
                            value={newAutomation.action.config.duration || 60}
                            onChange={(e) =>
                              setNewAutomation({
                                ...newAutomation,
                                action: {
                                  ...newAutomation.action,
                                  config: {
                                    ...newAutomation.action.config,
                                    duration: Number.parseInt(e.target.value) || 60,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="block-calendar"
                            checked={newAutomation.action.config.blockCalendar || false}
                            onCheckedChange={(checked) =>
                              setNewAutomation({
                                ...newAutomation,
                                action: {
                                  ...newAutomation.action,
                                  config: {
                                    ...newAutomation.action.config,
                                    blockCalendar: checked,
                                  },
                                },
                              })
                            }
                          />
                          <Label htmlFor="block-calendar">Block calendar</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="disable-notifications"
                            checked={newAutomation.action.config.disableNotifications || false}
                            onCheckedChange={(checked) =>
                              setNewAutomation({
                                ...newAutomation,
                                action: {
                                  ...newAutomation.action,
                                  config: {
                                    ...newAutomation.action.config,
                                    disableNotifications: checked,
                                  },
                                },
                              })
                            }
                          />
                          <Label htmlFor="disable-notifications">Disable notifications</Label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAutomation} disabled={!newAutomation.name}>
                Create
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-4">
            {automations.length > 0 ? (
              automations.map((automation) => (
                <Card key={automation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${automation.active ? "bg-green-100" : "bg-gray-100"}`}>
                          <Zap className={`h-5 w-5 ${automation.active ? "text-green-600" : "text-gray-400"}`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{automation.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(automation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={automation.active}
                          onCheckedChange={() => handleToggleAutomation(automation.id)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAutomation(automation.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="border rounded-md p-3">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          {getTriggerIcon(automation.trigger.type)}
                          <span>Trigger</span>
                        </div>
                        <p className="text-sm">{getTriggerDescription(automation.trigger)}</p>
                      </div>

                      <div className="border rounded-md p-3">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          {getActionIcon(automation.action.type)}
                          <span>Action</span>
                        </div>
                        <p className="text-sm">{getActionDescription(automation.action)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No automations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first automation to save time and increase productivity.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Automation
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
