-- ====================================================
-- CRITICAL FIX: Grant Table Permissions to Authenticated Role
-- ====================================================
-- This migration fixes "permission denied for table users_secure" errors.
-- 
-- ROOT CAUSE: RLS policies define WHO CAN ACCESS WHICH ROWS,
-- but PostgreSQL GRANTs define IF THE ROLE CAN ACCESS THE TABLE AT ALL.
-- Without these GRANTs, RLS policies are never even evaluated.
-- ====================================================

-- Grant permissions on users_secure table
GRANT SELECT, INSERT, UPDATE ON TABLE public.users_secure TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.users_secure TO anon;

-- Grant permissions on metabolic_logs table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.metabolic_logs TO authenticated;
GRANT SELECT ON TABLE public.metabolic_logs TO anon;

-- Grant permissions on conversations table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.conversations TO authenticated;
GRANT SELECT ON TABLE public.conversations TO anon;

-- Grant permissions on messages table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.messages TO authenticated;
GRANT SELECT ON TABLE public.messages TO anon;

-- Grant usage on sequences (for auto-increment IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify the fix by checking grants
SELECT tablename, grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE tablename IN ('users_secure', 'metabolic_logs', 'conversations', 'messages')
AND grantee IN ('authenticated', 'anon')
ORDER BY tablename, grantee;
