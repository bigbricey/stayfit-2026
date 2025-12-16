-- Create ENUMs for types
CREATE TYPE food_log_source AS ENUM ('ai_estimate', 'api_verified', 'user_override');

-- 1. PROFILES (Extending existing auth.users)
-- Note: 'profiles' usually exists in Supabase starter. We alter it.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    is_premium BOOLEAN DEFAULT FALSE,
    active_persona TEXT DEFAULT 'neutral', -- 'neutral', 'keto_doc', etc.
    daily_calorie_goal INT DEFAULT 2000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. FOOD LOGS (The Session/Wrapper)
CREATE TABLE public.food_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    raw_input TEXT NOT NULL, -- "I had 2 eggs"
    coach_feedback TEXT -- "Looks good, but watch the cholesterol."
);

-- Enable RLS for food_logs
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON public.food_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON public.food_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON public.food_logs
    FOR DELETE USING (auth.uid() = user_id);

-- 3. LOG ITEMS (The Atomic Data)
CREATE TABLE public.log_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    log_id UUID REFERENCES public.food_logs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- De-normalized for easier querying
    name TEXT NOT NULL,
    weight_g INT,
    calories INT,
    protein FLOAT,
    carbs FLOAT,
    fat FLOAT,
    is_estimated BOOLEAN DEFAULT FALSE,
    source food_log_source DEFAULT 'ai_estimate',
    confidence INT, -- 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for log_items
ALTER TABLE public.log_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items" ON public.log_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON public.log_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON public.log_items
    FOR DELETE USING (auth.uid() = user_id);

-- 4. PERSONAS (System Prompts)
CREATE TABLE public.personas (
    slug TEXT PRIMARY KEY, -- 'neutral', 'drill_sergeant'
    display_name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE
);

-- RLS for Personas (Public Read)
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read personas" ON public.personas FOR SELECT USING (true);

-- SEED DATA FOR PERSONAS
INSERT INTO public.personas (slug, display_name, system_prompt, is_premium)
VALUES 
    ('neutral', 'The Clerk', 'You are a Nutrition Data API. Extract food items to JSON. No small talk.', FALSE),
    ('drill_sergeant', 'Drill Sergeant', 'You are a hardcore drill instructor. Yell at the user about their poor choices.', TRUE),
    ('keto_doc', 'Metabolic Scientist', 'You are a metabolic health expert. Focus on insulin, glucose, and inflammation.', TRUE)
ON CONFLICT (slug) DO NOTHING;
