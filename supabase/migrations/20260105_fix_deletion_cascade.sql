-- Migration: Fix Cascade Deletion
-- Description: Updates constraints to ensure related data is removed when a user is deleted.

-- 1. users_secure
ALTER TABLE public.users_secure 
DROP CONSTRAINT IF EXISTS users_secure_id_fkey,
ADD CONSTRAINT users_secure_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. goals
ALTER TABLE public.goals 
DROP CONSTRAINT IF EXISTS goals_user_id_fkey,
ADD CONSTRAINT goals_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. metabolic_logs
ALTER TABLE public.metabolic_logs 
DROP CONSTRAINT IF EXISTS metabolic_logs_user_id_fkey,
ADD CONSTRAINT metabolic_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
