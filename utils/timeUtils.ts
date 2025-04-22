export const formatTimeForDisplay = (time: string) => {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const period = hour >= 12 ? "PM" : "AM"
  return `${hour % 12 || 12}:${minutes} ${period}`
}

export const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return `${hour}:00`
})
