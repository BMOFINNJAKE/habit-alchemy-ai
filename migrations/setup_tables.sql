-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 name VARCHAR(255) NOT NULL,
 description TEXT,
 frequency VARCHAR(50) NOT NULL,
 frequency_config JSONB,
 color VARCHAR(50),
 icon VARCHAR(50),
 target INTEGER,
 start_date DATE,
 end_date DATE,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS public.habit_logs (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 date DATE NOT NULL,
 value INTEGER DEFAULT 1,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checklists table
CREATE TABLE IF NOT EXISTS public.checklists (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 name VARCHAR(255) NOT NULL,
 type VARCHAR(50) NOT NULL,
 items JSONB DEFAULT '[]'::jsonb,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 title VARCHAR(255) NOT NULL,
 description TEXT,
 progress INTEGER NOT NULL DEFAULT 0,
 status VARCHAR(50) DEFAULT 'not-started',
 priority VARCHAR(50) DEFAULT 'medium',
 deadline DATE,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 title VARCHAR(255) NOT NULL,
 description TEXT,
 status VARCHAR(50) DEFAULT 'todo',
 priority VARCHAR(50) DEFAULT 'medium',
 due_date DATE,
 completed BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_blocks table
CREATE TABLE IF NOT EXISTS public.time_blocks (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 title VARCHAR(255) NOT NULL,
 start_time TIME WITH TIME ZONE NOT NULL,
 end_time TIME WITH TIME ZONE NOT NULL,
 date DATE NOT NULL,
 color VARCHAR(50),
 category VARCHAR(50),
 description TEXT,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create productivity_insights table
CREATE TABLE IF NOT EXISTS public.productivity_insights (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 insight_type VARCHAR(50) NOT NULL,
 insight_data JSONB NOT NULL,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_time_logs table
CREATE TABLE IF NOT EXISTS public.project_time_logs (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
 duration_ms BIGINT NOT NULL,
 start_time TIMESTAMP WITH TIME ZONE NOT NULL,
 end_time TIMESTAMP WITH TIME ZONE NOT NULL,
 notes TEXT,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_tasks table
CREATE TABLE IF NOT EXISTS public.daily_tasks (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 title VARCHAR(255) NOT NULL,
 completed BOOLEAN DEFAULT FALSE,
 date DATE NOT NULL,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 title VARCHAR(255) NOT NULL,
 content TEXT,
 date DATE NOT NULL,
 tags TEXT[],
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects_time_logged table
CREATE TABLE IF NOT EXISTS public.projects_time_logged (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
 date DATE NOT NULL,
 total_time_ms BIGINT NOT NULL DEFAULT 0,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_time_logged ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for habits
CREATE POLICY "Users can view their own habits" 
 ON public.habits FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" 
 ON public.habits FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" 
 ON public.habits FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" 
 ON public.habits FOR DELETE 
 USING (auth.uid() = user_id);

-- Create RLS policies for habit_logs
CREATE POLICY "Users can view their own habit logs" 
 ON public.habit_logs FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs" 
 ON public.habit_logs FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs" 
 ON public.habit_logs FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs" 
 ON public.habit_logs FOR DELETE 
 USING (auth.uid() = user_id);

-- Create RLS policies for checklists
CREATE POLICY "Users can view their own checklists" 
 ON public.checklists FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checklists" 
 ON public.checklists FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists" 
 ON public.checklists FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklists" 
 ON public.checklists FOR DELETE 
 USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" 
 ON public.projects FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" 
 ON public.projects FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
 ON public.projects FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
 ON public.projects FOR DELETE 
 USING (auth.uid() = user_id);

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" 
 ON public.tasks FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" 
 ON public.tasks FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
 ON public.tasks FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
 ON public.tasks FOR DELETE 
 USING (auth.uid() = user_id);

-- Create RLS policies for time_blocks
CREATE POLICY "Users can view their own time blocks" 
 ON public.time_blocks FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time blocks" 
 ON public.time_blocks FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time blocks" 
 ON public.time_blocks FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time blocks" 
 ON public.time_blocks FOR DELETE 
 USING (auth.uid() = user_id);

-- Create RLS policies for productivity_insights
CREATE POLICY "Users can view their own productivity insights" 
 ON public.productivity_insights FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own productivity insights" 
 ON public.productivity_insights FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productivity insights" 
 ON public.productivity_insights FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own productivity insights" 
 ON public.productivity_insights FOR DELETE 
 USING (auth.uid() = user_id);

-- Create RLS policies for project_time_logs
CREATE POLICY "Users can view their own project time logs" 
 ON public.project_time_logs FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project time logs" 
 ON public.project_time_logs FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project time logs" 
 ON public.project_time_logs FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project time logs" 
 ON public.project_time_logs FOR DELETE 
 USING (auth.uid() = user_id);

-- Create RLS policies for daily_tasks
CREATE POLICY "Users can view their own daily tasks" 
 ON public.daily_tasks FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily tasks" 
 ON public.daily_tasks FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily tasks" 
 ON public.daily_tasks FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily tasks" 
 ON public.daily_tasks FOR DELETE 
 USING (auth.uid() = user_id);

-- Create RLS policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
 ON public.journal_entries FOR SELECT
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
 ON public.journal_entries FOR INSERT
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
 ON public.journal_entries FOR UPDATE
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
 ON public.journal_entries FOR DELETE
 USING (auth.uid() = user_id);

-- Create RLS policies for projects_time_logged
CREATE POLICY "Users can view their own projects time logged" 
 ON public.projects_time_logged FOR SELECT 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects time logged" 
 ON public.projects_time_logged FOR INSERT 
 WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects time logged" 
 ON public.projects_time_logged FOR UPDATE 
 USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects time logged" 
 ON public.projects_time_logged FOR DELETE 
 USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON public.habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_checklists_user_id ON public.checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_user_id ON public.time_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON public.time_blocks(date);
CREATE INDEX IF NOT EXISTS idx_productivity_insights_user_id ON public.productivity_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_project_time_logs_user_id ON public.project_time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_project_time_logs_project_id ON public.project_time_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON public.daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON public.daily_tasks(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_projects_time_logged_user_id ON public.projects_time_logged(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_time_logged_project_id ON public.projects_time_logged(project_id);
