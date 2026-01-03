-- Migration: Add is_approved flag to users_secure
ALTER TABLE users_secure ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Ensure RLS allows the user to see their own status
-- (Existing policies already cover SELECT based on auth.uid())
