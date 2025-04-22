import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes - redirect to login if not authenticated
  if (
    pathname.startsWith("/(protected)") ||
    pathname === "/dashboard" ||
    pathname === "/projects" ||
    pathname === "/journal" ||
    pathname === "/analytics" ||
    pathname === "/productivity-tools" ||
    pathname === "/productivity-tips" ||
    pathname === "/recommendations" ||
    pathname === "/ai-assistant" ||
    pathname === "/content-tools" ||
    pathname === "/dropshipping"
  ) {
    if (!session) {
      const redirectUrl = new URL("/auth", req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Auth routes - redirect to dashboard if already authenticated
  if (pathname === "/auth" || pathname === "/") {
    if (session) {
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Specify which paths this middleware should run for
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
