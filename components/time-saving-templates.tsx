"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Copy, Plus, Star, Clock, Calendar, Mail, MessageSquare } from "lucide-react"

export function TimeSavingTemplates() {
  const [activeTab, setActiveTab] = useState("project")
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const openTemplate = (template) => {
    setSelectedTemplate(template)
    setTemplateDialogOpen(true)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Time-Saving Templates
        </CardTitle>
        <CardDescription>Ready-to-use templates to streamline your workflow</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="project">Project</TabsTrigger>
            <TabsTrigger value="meeting">Meeting</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="project" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TemplateCard
                title="Project Kickoff"
                description="Template for starting a new project with goals, timeline, and resources"
                icon={<Calendar className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Project Kickoff",
                    content:
                      "# Project Kickoff: [Project Name]\n\n## Project Overview\n[Brief description of the project]\n\n## Goals & Objectives\n- [Goal 1]\n- [Goal 2]\n\n## Timeline\n- Start Date: [Date]\n- End Date: [Date]\n\n## Team Members\n- [Name] - [Role]\n- [Name] - [Role]\n\n## Resources\n- [Resource 1]\n- [Resource 2]\n\n## Next Steps\n1. [Action item]\n2. [Action item]",
                  })
                }
              />
              <TemplateCard
                title="Weekly Status Report"
                description="Template for reporting weekly project progress and blockers"
                icon={<Clock className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Weekly Status Report",
                    content:
                      "# Weekly Status Report: [Project Name]\n\n## Week of [Date Range]\n\n## Accomplishments\n- [Accomplishment 1]\n- [Accomplishment 2]\n\n## In Progress\n- [Task 1] - [Status]\n- [Task 2] - [Status]\n\n## Blockers\n- [Blocker 1]\n- [Blocker 2]\n\n## Next Week's Goals\n- [Goal 1]\n- [Goal 2]\n\n## Notes\n[Any additional notes]",
                  })
                }
              />
              <TemplateCard
                title="Project Plan"
                description="Detailed project plan with milestones, tasks, and assignments"
                icon={<FileText className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Project Plan",
                    content:
                      "# Project Plan: [Project Name]\n\n## Project Overview\n[Brief description of the project]\n\n## Milestones\n\n### Milestone 1: [Name]\n- Due Date: [Date]\n- Description: [Description]\n- Tasks:\n  - [ ] [Task 1] - Assigned to: [Name]\n  - [ ] [Task 2] - Assigned to: [Name]\n\n### Milestone 2: [Name]\n- Due Date: [Date]\n- Description: [Description]\n- Tasks:\n  - [ ] [Task 1] - Assigned to: [Name]\n  - [ ] [Task 2] - Assigned to: [Name]\n\n## Dependencies\n- [Task 1] depends on [Task 2]\n\n## Resources\n- [Resource 1]\n- [Resource 2]",
                  })
                }
              />
              <TemplateCard
                title="Risk Assessment"
                description="Template for identifying and mitigating project risks"
                icon={<FileText className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Risk Assessment",
                    content:
                      "# Risk Assessment: [Project Name]\n\n## Risk Register\n\n### Risk 1: [Risk Name]\n- Description: [Description]\n- Probability: [Low/Medium/High]\n- Impact: [Low/Medium/High]\n- Mitigation Strategy: [Strategy]\n- Owner: [Name]\n\n### Risk 2: [Risk Name]\n- Description: [Description]\n- Probability: [Low/Medium/High]\n- Impact: [Low/Medium/High]\n- Mitigation Strategy: [Strategy]\n- Owner: [Name]\n\n## Contingency Plans\n- [Plan 1]\n- [Plan 2]",
                  })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="meeting" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TemplateCard
                title="Team Meeting"
                description="Agenda template for regular team meetings"
                icon={<MessageSquare className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Team Meeting",
                    content:
                      "# Team Meeting: [Date]\n\n## Agenda\n\n### 1. Updates (10 min)\n- Team member updates\n\n### 2. Current Sprint/Project Status (15 min)\n- Progress on key deliverables\n- Blockers and challenges\n\n### 3. Discussion Topics (20 min)\n- [Topic 1]\n- [Topic 2]\n\n### 4. Action Items & Next Steps (10 min)\n- [Action Item 1] - Owner: [Name], Due: [Date]\n- [Action Item 2] - Owner: [Name], Due: [Date]\n\n## Notes\n[Meeting notes go here]",
                  })
                }
              />
              <TemplateCard
                title="1:1 Meeting"
                description="Template for one-on-one meetings with team members"
                icon={<MessageSquare className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "1:1 Meeting",
                    content:
                      "# 1:1 Meeting: [Name] - [Date]\n\n## Check-in (5 min)\n- How are you doing?\n- Energy level (1-10)?\n\n## Updates (10 min)\n- Progress on current work\n- Blockers or challenges\n\n## Discussion Topics (10 min)\n- [Topic 1]\n- [Topic 2]\n\n## Career Development (5 min)\n- Progress on goals\n- Learning opportunities\n\n## Action Items\n- [Action Item 1] - Due: [Date]\n- [Action Item 2] - Due: [Date]\n\n## Notes\n[Meeting notes go here]",
                  })
                }
              />
              <TemplateCard
                title="Client Meeting"
                description="Template for client meetings and presentations"
                icon={<MessageSquare className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Client Meeting",
                    content:
                      "# Client Meeting: [Client Name] - [Date]\n\n## Attendees\n- [Your Company]: [Names]\n- [Client]: [Names]\n\n## Agenda\n\n### 1. Introductions (5 min)\n\n### 2. Project Status Update (15 min)\n- Accomplishments since last meeting\n- Current status\n- Timeline update\n\n### 3. Demos/Presentations (20 min)\n- [Demo 1]\n- [Demo 2]\n\n### 4. Discussion Items (15 min)\n- [Item 1]\n- [Item 2]\n\n### 5. Next Steps (5 min)\n- [Action Item 1] - Owner: [Name], Due: [Date]\n- [Action Item 2] - Owner: [Name], Due: [Date]\n\n## Notes\n[Meeting notes go here]",
                  })
                }
              />
              <TemplateCard
                title="Retrospective"
                description="Template for project or sprint retrospectives"
                icon={<MessageSquare className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Retrospective",
                    content:
                      "# Retrospective: [Project/Sprint] - [Date]\n\n## What Went Well\n- [Item 1]\n- [Item 2]\n\n## What Could Be Improved\n- [Item 1]\n- [Item 2]\n\n## Action Items for Next Time\n- [Action Item 1] - Owner: [Name]\n- [Action Item 2] - Owner: [Name]\n\n## Kudos\n- [Kudos 1]\n- [Kudos 2]\n\n## Metrics\n- Velocity: [Value]\n- Quality: [Value]\n\n## Notes\n[Additional notes]",
                  })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TemplateCard
                title="Project Update"
                description="Email template for sending project updates to stak"
                icon={<Mail className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Project Update Email",
                    content:
                      "Subject: [Project Name] - Status Update: [Date]\n\nHi team,\n\nHere's the latest update on the [Project Name] project:\n\n## Progress\n- [Accomplishment 1]\n- [Accomplishment 2]\n\n## Current Status\nWe are currently [on track/behind schedule/ahead of schedule] for our [milestone/deadline].\n\n## Next Steps\n- [Next step 1]\n- [Next step 2]\n\n## Blockers/Challenges\n- [Blocker 1]\n- [Blocker 2]\n\nPlease let me know if you have any questions or concerns.\n\nBest regards,\n[Your Name]",
                  })
                }
              />
              <TemplateCard
                title="Meeting Follow-up"
                description="Email template for following up after meetings"
                icon={<Mail className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Meeting Follow-up Email",
                    content:
                      "Subject: Follow-up: [Meeting Topic] - [Date]\n\nHi [Name/team],\n\nThank you for your time during our meeting about [topic] on [date].\n\n## Summary\n[Brief summary of what was discussed]\n\n## Action Items\n- [Action item 1] - Owner: [Name], Due: [Date]\n- [Action item 2] - Owner: [Name], Due: [Date]\n\n## Next Meeting\nOur next meeting is scheduled for [date and time].\n\nPlease let me know if you have any questions or if I missed anything important.\n\nBest regards,\n[Your Name]",
                  })
                }
              />
              <TemplateCard
                title="Client Proposal"
                description="Email template for sending proposals to clients"
                icon={<Mail className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Client Proposal Email",
                    content:
                      "Subject: Proposal for [Project/Service] - [Client Name]\n\nDear [Client Name],\n\nThank you for the opportunity to submit a proposal for [project/service]. Based on our discussion, I'm pleased to present our approach to help you achieve [client's goal].\n\n## Proposed Solution\n[Brief description of your proposed solution]\n\n## Scope of Work\n- [Deliverable 1]\n- [Deliverable 2]\n- [Deliverable 3]\n\n## Timeline\n- Start date: [Date]\n- Completion date: [Date]\n\n## Investment\n[Price/cost information]\n\n## Next Steps\nIf you'd like to proceed, here are the next steps:\n1. [Step 1]\n2. [Step 2]\n\nPlease let me know if you have any questions or would like to discuss any aspect of this proposal further.\n\nI look forward to the possibility of working together.\n\nBest regards,\n[Your Name]",
                  })
                }
              />
              <TemplateCard
                title="Status Request"
                description="Email template for requesting status updates"
                icon={<Mail className="h-5 w-5" />}
                onClick={() =>
                  openTemplate({
                    title: "Status Request Email",
                    content:
                      "Subject: Status Update Request: [Project/Task]\n\nHi [Name],\n\nI hope this email finds you well. I'm reaching out to request a status update on [project/task].\n\nSpecifically, I'd appreciate information on:\n\n1. Current progress\n2. Any blockers or challenges you're facing\n3. Expected completion date\n4. Any resources you need\n\nPlease let me know if you need any assistance or if there's anything I can do to help move things forward.\n\nThank you,\n[Your Name]",
                  })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Your Custom Templates</h3>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TemplateCard
                title="Weekly Review"
                description="Personal template for weekly reviews and planning"
                icon={<Star className="h-5 w-5 text-yellow-500" />}
                custom={true}
                onClick={() =>
                  openTemplate({
                    title: "Weekly Review",
                    content:
                      "# Weekly Review: [Date Range]\n\n## Reflection\n\n### Wins\n- [Win 1]\n- [Win 2]\n\n### Challenges\n- [Challenge 1]\n- [Challenge 2]\n\n### Lessons Learned\n- [Lesson 1]\n- [Lesson 2]\n\n## Next Week\n\n### Top 3 Priorities\n1. [Priority 1]\n2. [Priority 2]\n3. [Priority 3]\n\n### Key Meetings/Events\n- [Meeting/Event 1]\n- [Meeting/Event 2]\n\n### Personal Goals\n- [Goal 1]\n- [Goal 2]",
                  })
                }
              />
              <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="font-medium">Create Custom Template</h4>
                <p className="text-sm text-muted-foreground mt-1">Create your own reusable templates</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Create Template
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Template Dialog */}
      {selectedTemplate && (
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.title}</DialogTitle>
              <DialogDescription>Use this template as a starting point for your work</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="template-content">Template Content</Label>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">{selectedTemplate.content}</pre>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex items-center gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(selectedTemplate.content)
                  setTemplateDialogOpen(false)
                }}
              >
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
              <Button onClick={() => setTemplateDialogOpen(false)}>Use Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

function TemplateCard({ title, description, icon, custom = false, onClick }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start space-x-4">
            <div
              className={`p-2 rounded-full ${custom ? "bg-yellow-100" : "bg-primary/10"} ${custom ? "text-yellow-600" : "text-primary"}`}
            >
              {icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
        <div className="border-t p-4 flex justify-between items-center bg-muted/50">
          <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={onClick}>
            <FileText className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" className="flex items-center gap-1" onClick={onClick}>
            <Copy className="h-4 w-4" />
            Use
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
