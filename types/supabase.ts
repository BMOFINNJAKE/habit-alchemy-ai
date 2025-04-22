export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          status: string
          user_id: string
          due_date: string | null
          priority: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          status?: string
          user_id: string
          due_date?: string | null
          priority?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          status?: string
          user_id?: string
          due_date?: string | null
          priority?: string | null
        }
      }
      journal_entries: {
        Row: {
          id: string
          created_at: string
          content: string
          user_id: string
          mood: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          user_id: string
          mood?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          user_id?: string
          mood?: string | null
          tags?: string[] | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          preferences: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          preferences?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          preferences?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
