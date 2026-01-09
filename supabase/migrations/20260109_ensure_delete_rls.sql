-- Migration: Ensure DELETE policy exists on metabolic_logs
-- This is a safety migration to guarantee the policy is applied

-- Ensure RLS is enabled
ALTER TABLE public.metabolic_logs ENABLE ROW LEVEL SECURITY;

-- Drop and recreate DELETE policy to ensure it exists
DROP POLICY IF EXISTS "Users can delete own logs" ON public.metabolic_logs;
CREATE POLICY "Users can delete own logs" ON public.metabolic_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Also ensure UPDATE policy exists
DROP POLICY IF EXISTS "Users can update own logs" ON public.metabolic_logs;
CREATE POLICY "Users can update own logs" ON public.metabolic_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant DELETE privilege to authenticated role
GRANT DELETE ON public.metabolic_logs TO authenticated;
GRANT UPDATE ON public.metabolic_logs TO authenticated;

-- Verify policies exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'metabolic_logs'
ORDER BY policyname;
