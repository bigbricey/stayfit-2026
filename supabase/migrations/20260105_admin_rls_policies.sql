-- Migration: Grant Master Admin permissions to bigbricey@gmail.com
-- Description: Allows the admin to manage all user records in users_secure.

-- 1. Admin Select Policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_secure;
CREATE POLICY "Admins can view all profiles" ON users_secure
  FOR SELECT USING (auth.jwt() ->> 'email' = 'bigbricey@gmail.com');

-- 2. Admin Update Policy
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_secure;
CREATE POLICY "Admins can update all profiles" ON users_secure
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'bigbricey@gmail.com');

-- 3. Admin Delete Policy
DROP POLICY IF EXISTS "Admins can delete all profiles" ON users_secure;
CREATE POLICY "Admins can delete all profiles" ON users_secure
  FOR DELETE USING (auth.jwt() ->> 'email' = 'bigbricey@gmail.com');

-- 4. Admin Insert Policy (for future backfills/invites)
DROP POLICY IF EXISTS "Admins can insert any profile" ON users_secure;
CREATE POLICY "Admins can insert any profile" ON users_secure
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'bigbricey@gmail.com');
