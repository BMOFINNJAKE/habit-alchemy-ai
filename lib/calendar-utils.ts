import type { TimeBlock } from "@/types/time-block"
import { format, parse } from "date-fns"

/**
 * Export time blocks to iCalendar (.ics) format
 */
export function exportToICS(blocks: TimeBlock[]): string {
  const icsHeader = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PocketWinDryft//TimeBlocking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n")

  const icsFooter = "END:VCALENDAR"

  const events = blocks.map((block) => {
    // Format dates to iCalendar format (YYYYMMDDTHHmmssZ)
    const startDate = format(block.startTime, "yyyyMMdd'T'HHmmss")
    const endDate = format(block.endTime, "yyyyMMdd'T'HHmmss")
    const now = format(new Date(), "yyyyMMdd'T'HHmmss")
    const uid = `${block.id}@pocketwindryft.app`

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${block.title}`,
      block.description ? `DESCRIPTION:${block.description.replace(/\n/g, "\\n")}` : "",
      `CATEGORIES:${block.category || ""}`,
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n")
  })

  return [icsHeader, ...events, icsFooter].join("\r\n")
}

/**
 * Import time blocks from iCalendar (.ics) format
 */
export function importFromICS(icsContent: string): Omit<TimeBlock, "id">[] {
  const blocks: Omit<TimeBlock, "id">[] = []
  const lines = icsContent.split(/\r\n|\n|\r/)

  let currentBlock: Partial<Omit<TimeBlock, "id">> = {}
  let isInEvent = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line === "BEGIN:VEVENT") {
      isInEvent = true
      currentBlock = {}
    } else if (line === "END:VEVENT") {
      isInEvent = false
      if (currentBlock.title && currentBlock.startTime && currentBlock.endTime && currentBlock.date) {
        blocks.push(currentBlock as Omit<TimeBlock, "id">)
      }
    } else if (isInEvent) {
      const [key, value] = line.split(":")

      if (!key || !value) continue

      switch (key) {
        case "SUMMARY":
          currentBlock.title = value
          break
        case "DTSTART":
          try {
            const startTime = parseICSDate(value)
            currentBlock.startTime = startTime
            currentBlock.date = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate())
          } catch (e) {
            console.error("Error parsing start date:", e)
          }
          break
        case "DTEND":
          try {
            currentBlock.endTime = parseICSDate(value)
          } catch (e) {
            console.error("Error parsing end date:", e)
          }
          break
        case "DESCRIPTION":
          currentBlock.description = value.replace(/\\n/g, "\n")
          break
        case "CATEGORIES":
          currentBlock.category = value
          break
      }
    }
  }

  return blocks
}

/**
 * Parse iCalendar date format to JavaScript Date
 */
function parseICSDate(icsDate: string): Date {
  // Handle different date formats in ICS files
  if (icsDate.includes("T")) {
    // Format: YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ
    const dateStr = icsDate.replace("Z", "")

    try {
      return parse(dateStr, "yyyyMMdd'T'HHmmss", new Date())
    } catch (e) {
      console.error("Error parsing date with T:", e)
      return new Date() // Fallback to current date
    }
  } else {
    // Format: YYYYMMDD (all day event)
    try {
      // For all-day events, set time to 9:00 AM
      const date = parse(icsDate, "yyyyMMdd", new Date())
      date.setHours(9, 0, 0, 0)
      return date
    } catch (e) {
      console.error("Error parsing all-day date:", e)
      return new Date() // Fallback to current date
    }
  }
}
