-- Add coach preference columns to users_secure
-- These power the "Layer Cake" persona system

ALTER TABLE users_secure ADD COLUMN IF NOT EXISTS 
  active_coach text DEFAULT 'fat_loss' 
  CHECK (active_coach IN ('hypertrophy', 'fat_loss', 'longevity'));

ALTER TABLE users_secure ADD COLUMN IF NOT EXISTS 
  coach_intensity text DEFAULT 'neutral'
  CHECK (coach_intensity IN ('savage', 'neutral', 'supportive'));

-- Add comment for documentation
COMMENT ON COLUMN users_secure.active_coach IS 'Training focus: hypertrophy (mass), fat_loss (recomp), longevity (healthspan)';
COMMENT ON COLUMN users_secure.coach_intensity IS 'Communication tone: savage (drill sergeant), neutral (professional), supportive (encouraging)';
