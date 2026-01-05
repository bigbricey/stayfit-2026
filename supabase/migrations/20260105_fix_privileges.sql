-- Migration: Fix Table Privileges and Admin Delete Policies
-- Description: Grants DELETE permissions to authenticated users and adds master admin policies.

GRANT DELETE ON users_secure TO authenticated;
GRANT DELETE ON goals TO authenticated;
GRANT DELETE ON metabolic_logs TO authenticated;

-- Master Admin Policies for DELETE
DROP POLICY IF EXISTS "Admins can delete all profiles" ON users_secure;
CREATE POLICY "Admins can delete all profiles" ON users_secure
  FOR DELETE USING (auth.jwt() ->> 'email' = 'bigbricey@gmail.com');

DROP POLICY IF EXISTS "Admins can delete all goals" ON goals;
CREATE POLICY "Admins can delete all goals" ON goals
  FOR DELETE USING (auth.jwt() ->> 'email' = 'bigbricey@gmail.com');

DROP POLICY IF EXISTS "Admins can delete all logs" ON metabolic_logs;
CREATE POLICY "Admins can delete all logs" ON metabolic_logs
  FOR DELETE USING (auth.jwt() ->> 'email' = 'bigbricey@gmail.com');
