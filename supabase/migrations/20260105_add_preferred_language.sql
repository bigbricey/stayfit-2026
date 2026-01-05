-- Migration: Add preferred_language to users_secure
-- Run this in Supabase SQL Editor

ALTER TABLE users_secure 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Update RLS for the new column (though policies are usually table-wide, good to be explicit here if needed)
COMMENT ON COLUMN users_secure.preferred_language IS 'ISO language code (e.g., en, pt, es) for UI and AI responses.';
