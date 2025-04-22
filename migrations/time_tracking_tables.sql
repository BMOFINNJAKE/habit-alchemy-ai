-- Create time_tracking table to store focus time data
CREATE TABLE IF NOT EXISTS time_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  focus_time_ms BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_tracking_sessions table to store individual focus sessions
CREATE TABLE IF NOT EXISTS time_tracking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms BIGINT,
  category VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_tracking_stats table to store aggregated statistics
CREATE TABLE IF NOT EXISTS time_tracking_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_average_ms BIGINT DEFAULT 0,
  weekly_average_ms BIGINT DEFAULT 0,
  monthly_average_ms BIGINT DEFAULT 0,
  total_tracked_ms BIGINT DEFAULT 0,
  most_productive_day VARCHAR(10),
  most_productive_hour INTEGER,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update daily focus time
CREATE OR REPLACE FUNCTION update_daily_focus_time(
  p_user_id UUID,
  p_date DATE,
  p_duration_ms BIGINT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO time_tracking (user_id, date, focus_time_ms)
  VALUES (p_user_id, p_date, p_duration_ms)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    focus_time_ms = time_tracking.focus_time_ms + p_duration_ms,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to end a focus session and update stats
CREATE OR REPLACE FUNCTION end_focus_session(
  p_session_id UUID,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_start_time TIMESTAMP WITH TIME ZONE;
  v_duration_ms BIGINT;
  v_user_id UUID;
  v_date DATE;
BEGIN
  -- Get session info
  SELECT start_time, user_id INTO v_start_time, v_user_id
  FROM time_tracking_sessions
  WHERE id = p_session_id;
  
  -- Calculate duration
  v_duration_ms := EXTRACT(EPOCH FROM (p_end_time - v_start_time)) * 1000;
  
  -- Update session
  UPDATE time_tracking_sessions
  SET 
    end_time = p_end_time,
    duration_ms = v_duration_ms,
    notes = p_notes,
    updated_at = NOW()
  WHERE id = p_session_id;
  
  -- Update daily focus time
  v_date := DATE(v_start_time);
  PERFORM update_daily_focus_time(v_user_id, v_date, v_duration_ms);
  
  RETURN p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for weekly focus time
CREATE OR REPLACE VIEW weekly_focus_time AS
SELECT 
  user_id,
  date_trunc('week', date) AS week_start,
  SUM(focus_time_ms) AS weekly_focus_time_ms
FROM time_tracking
GROUP BY user_id, week_start
ORDER BY week_start DESC;

-- Create view for daily focus time for the current week
CREATE OR REPLACE VIEW current_week_daily_focus AS
SELECT 
  user_id,
  date,
  to_char(date, 'Day') AS day_name,
  focus_time_ms
FROM time_tracking
WHERE date >= date_trunc('week', CURRENT_DATE)
  AND date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY date;

-- Create RLS policies
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own time tracking data"
  ON time_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own time tracking data"
  ON time_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own time tracking data"
  ON time_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own time tracking sessions"
  ON time_tracking_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own time tracking sessions"
  ON time_tracking_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own time tracking sessions"
  ON time_tracking_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own time tracking stats"
  ON time_tracking_stats FOR SELECT
  USING (auth.uid() = user_id);
