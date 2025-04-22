"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase" // Import the pre-configured supabase client

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signUp: (email: string, password: string) => Promise<{ error: any | null; data: any | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any | null }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  // We'll use the pre-configured supabase client from lib/supabase.ts instead of creating a new one

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error fetching session:", error.message)
        }

        setSession(session)
        setUser(session?.user ?? null)
      } catch (err) {
        console.error("Failed to get session:", err)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      // Validate inputs before sending to Supabase
      if (!email || !password) {
        return { error: { message: "Email and password are required" } }
      }

      // Trim whitespace from inputs
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      })

      if (error) {
        console.error("Auth error during sign in:", error.message)
        return { error }
      }

      router.refresh()
      return { error: null }
    } catch (error: any) {
      console.error("Unexpected error during sign in:", error.message)
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      // Validate inputs
      if (!email || !password) {
        return {
          error: { message: "Email and password are required" },
          data: null,
        }
      }

      // Trim whitespace from inputs
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Auth error during sign up:", error.message)
        return { error, data: null }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error("Unexpected error during sign up:", error.message)
      return { error, data: null }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      router.refresh()
      router.push("/auth")
    } catch (error: any) {
      console.error("Error signing out:", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true)

      if (!email) {
        return { error: { message: "Email is required" } }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error("Error resetting password:", error.message)
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      console.error("Unexpected error resetting password:", error.message)
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Safe version of useAuth that doesn't throw when used outside AuthProvider
export function useSafeAuth() {
  return useContext(AuthContext)
}
