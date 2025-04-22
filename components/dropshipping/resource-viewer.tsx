"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Resource } from "@/components/dropshipping/types"

interface ResourceViewerProps {
  resource: Resource | null
  isOpen: boolean
  onClose: () => void
}

export function ResourceViewer({ resource, isOpen, onClose }: ResourceViewerProps) {
  if (!resource) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{resource.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto">
          <div className="prose prose-sm dark:prose-invert">
            {resource.content.map((section, index) => (
              <div key={index} className="mb-6">
                {section.heading && <h3 className="text-lg font-semibold mb-2">{section.heading}</h3>}
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-3 text-sm">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    {section.bullets.map((bullet, bIndex) => (
                      <li key={bIndex} className="text-sm">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
