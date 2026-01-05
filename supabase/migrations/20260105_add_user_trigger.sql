-- Migration: Add user registration trigger and backfill missing users
-- Description: Automatically creates a row in users_secure when a new user signs up.

-- 1. Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_secure (id, name, is_approved)
  VALUES (new.id, new.raw_user_meta_data->>'name', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing users who are in auth.users but not in users_secure
INSERT INTO public.users_secure (id, name, is_approved)
SELECT id, raw_user_meta_data->>'name', false
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users_secure)
ON CONFLICT (id) DO NOTHING;
