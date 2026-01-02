-- Migration: Add DELETE and UPDATE policies for metabolic_logs
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Allow users to delete their own logs
DROP POLICY IF EXISTS "Users can delete own logs" ON metabolic_logs;
CREATE POLICY "Users can delete own logs" ON metabolic_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Allow users to update their own logs  
DROP POLICY IF EXISTS "Users can update own logs" ON metabolic_logs;
CREATE POLICY "Users can update own logs" ON metabolic_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Verify policies are in place
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'metabolic_logs';
