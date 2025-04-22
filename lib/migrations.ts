import { supabase } from "./supabase"

export async function createSessionsTable() {
  const { error } = await supabase.rpc("create_sessions_table")
  if (error) {
    console.error("Error creating sessions table:", error)
    throw error
  }
}

export async function createTimeBlocksTable() {
  const { error } = await supabase.rpc("create_time_blocks_table")
  if (error) {
    console.error("Error creating time_blocks table:", error)
    throw error
  }
}

export async function createTasksTable() {
  const { error } = await supabase.rpc("create_tasks_table")
  if (error) {
    console.error("Error creating tasks table:", error)
    throw error
  }
}

export async function createJournalEntriesTable() {
  const { error } = await supabase.rpc("create_journal_entries_table")
  if (error) {
    console.error("Error creating journal_entries table:", error)
    throw error
  }
}

// SQL functions to be executed on the Supabase database
export const sqlFunctions = `
-- Function to create sessions table if it doesn't exist
CREATE OR REPLACE FUNCTION create_sessions_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
 IF NOT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'sessions'
 ) THEN
   CREATE TABLE public.sessions (
     id TEXT PRIMARY KEY,
     project_id TEXT NOT NULL,
     project_title TEXT NOT NULL,
     start_time BIGINT NOT NULL,
     end_time BIGINT,
     elapsed_time BIGINT NOT NULL DEFAULT 0,
     is_running BOOLEAN NOT NULL DEFAULT false,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );

   -- Add RLS policies
   ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own sessions"
     ON public.sessions
     FOR SELECT
     USING (auth.uid() = user_id);
     
   CREATE POLICY "Users can insert their own sessions"
     ON public.sessions
     FOR INSERT
     WITH CHECK (auth.uid() = user_id);
     
   CREATE POLICY "Users can update their own sessions"
     ON public.sessions
     FOR UPDATE
     USING (auth.uid() = user_id);
     
   CREATE POLICY "Users can delete their own sessions"
     ON public.sessions
     FOR DELETE
     USING (auth.uid() = user_id);
 END IF;
END;
$;

-- Function to create time_blocks table if it doesn't exist
CREATE OR REPLACE FUNCTION create_time_blocks_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
 IF NOT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'time_blocks'
 ) THEN
   CREATE TABLE public.time_blocks (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     start_time TEXT NOT NULL,
     end_time TEXT NOT NULL,
     project_id TEXT,
     color TEXT,
     is_completed BOOLEAN NOT NULL DEFAULT false,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );

   -- Add RLS policies
   ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own time blocks"
     ON public.time_blocks
     FOR SELECT
     USING (auth.uid() = user_id);
     
   CREATE POLICY "Users can insert their own time blocks"
     ON public.time_blocks
     FOR INSERT
     WITH CHECK (auth.uid() = user_id);
     
   CREATE POLICY "Users can update their own time blocks"
     ON public.time_blocks
     FOR UPDATE
     USING (auth.uid() = user_id);
     
   CREATE POLICY "Users can delete their own time blocks"
     ON public.time_blocks
     FOR DELETE
     USING (auth.uid() = user_id);
 END IF;
END;
$;

-- Function to create tasks table if it doesn't exist
CREATE OR REPLACE FUNCTION create_tasks_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
 IF NOT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'tasks'
 ) THEN
   CREATE TABLE public.tasks (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     urgency INTEGER NOT NULL DEFAULT 5,
     importance INTEGER NOT NULL DEFAULT 5,
     estimated_time INTEGER NOT NULL DEFAULT 30,
     category TEXT NOT NULL DEFAULT 'work',
     due_date TEXT,
     energy TEXT DEFAULT 'medium',
     complexity TEXT DEFAULT 'medium',
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );

   -- Add RLS policies
   ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own tasks"
     ON public.tasks
     FOR SELECT
     USING (auth.uid() = user_id);
     
   CREATE POLICY "Users can insert their own tasks"
     ON public.tasks
     FOR INSERT
     WITH CHECK (auth.uid() = user_id);
     
   CREATE POLICY "Users can update their own tasks"
     ON public.tasks
     FOR UPDATE
     USING (auth.uid() = user_id);
     
   CREATE POLICY "Users can delete their own tasks"
     ON public.tasks
     FOR DELETE
     USING (auth.uid() = user_id);
 END IF;
END;
$;

-- Function to create journal_entries table if it doesn't exist
CREATE OR REPLACE FUNCTION create_journal_entries_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
 IF NOT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'journal_entries'
 ) THEN
   CREATE TABLE public.journal_entries (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     title VARCHAR(255) NOT NULL,
     content TEXT,
     date DATE NOT NULL,
     tags TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );

   -- Add RLS policies
   ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own journal entries"
     ON public.journal_entries
     FOR SELECT
     USING (auth.uid() = user_id);
     
   CREATE POLICY "Users can insert their own journal entries"
     ON public.journal_entries
     FOR INSERT
     WITH CHECK (auth.uid() = user_id);
     
   CREATE POLICY "Users can update their own journal entries"
     ON public.journal_entries
     FOR UPDATE
     USING (auth.uid() = user_id);
     
   CREATE POLICY "Users can delete their own journal entries"
     ON public.journal_entries
     FOR DELETE
     USING (auth.uid() = user_id);
 END IF;
END;
$;
`
