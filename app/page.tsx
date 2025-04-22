import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to auth page by default
  redirect("/auth")

  // This code won't run due to the redirect above, but is needed to satisfy TypeScript
  return null
}
