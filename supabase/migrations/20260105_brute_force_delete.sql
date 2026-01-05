-- Migration: Brute Force Admin Deletion
-- Description: RPC to manually clean up all user data before deleting the auth record.

CREATE OR REPLACE FUNCTION delete_user_admin(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF auth.jwt() ->> 'email' = 'bigbricey@gmail.com' THEN
        -- Manually delete from all child tables to prevent FKEY violation
        DELETE FROM public.metabolic_logs WHERE user_id = target_user_id;
        DELETE FROM public.daily_summaries WHERE user_id = target_user_id;
        DELETE FROM public.goals WHERE user_id = target_user_id;
        DELETE FROM public.conversations WHERE user_id = target_user_id;
        DELETE FROM public.users_secure WHERE id = target_user_id;
        
        -- Finally delete the auth record
        DELETE FROM auth.users WHERE id = target_user_id;
    ELSE
        RAISE EXCEPTION 'Unauthorized';
    END IF;
END;
$$;
