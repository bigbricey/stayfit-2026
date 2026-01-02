-- Migration: Ensure all core tables exist
-- Run this in Supabase SQL Editor

-- 1. users_secure (Profile Data)
CREATE TABLE IF NOT EXISTS users_secure (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  diet_mode TEXT DEFAULT 'standard',
  biometrics JSONB DEFAULT '{}'::jsonb,
  safety_flags JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users_secure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON users_secure;
CREATE POLICY "Users can view own profile" ON users_secure
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users_secure;
CREATE POLICY "Users can update own profile" ON users_secure
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users_secure;
CREATE POLICY "Users can insert own profile" ON users_secure
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. goals (User Goals)
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric TEXT,
  target_value NUMERIC,
  period TEXT, -- 'daily', 'weekly'
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);


-- 3. metabolic_logs (Activity Logs)
CREATE TABLE IF NOT EXISTS metabolic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_type TEXT, -- 'meal', 'workout', etc
  content_raw TEXT,
  data_structured JSONB,
  logged_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE metabolic_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own logs" ON metabolic_logs;
CREATE POLICY "Users can view own logs" ON metabolic_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own logs" ON metabolic_logs;
CREATE POLICY "Users can insert own logs" ON metabolic_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON metabolic_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);
