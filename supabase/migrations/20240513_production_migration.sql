-- 1. Update roles: Redirect editor/videographer to creator
UPDATE profiles SET role = 'creator' WHERE role IN ('editor', 'videographer');

-- 2. Add creator model fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS specialization TEXT CHECK (specialization IN ('editing', 'videography', 'both')),
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'beginner' CHECK (tier IN ('beginner', 'professional', 'premium')),
ADD COLUMN IF NOT EXISTS rating DECIMAL DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS completed_projects INTEGER DEFAULT 0;

-- 3. Update project statuses
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' 
CHECK (status IN ('open', 'reviewing', 'in_progress', 'delivered', 'completed', 'cancelled'));

-- 4. Create proposal logic
ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE proposals ADD CONSTRAINT proposals_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- 5. Commission Helper
CREATE OR REPLACE FUNCTION calculate_commission(delivery_days INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    IF delivery_days < 1 THEN RETURN 0.08; -- < 12h (simplified)
    ELSIF delivery_days = 1 THEN RETURN 0.06; -- 24h
    ELSIF delivery_days = 2 THEN RETURN 0.04; -- 48h
    ELSIF delivery_days BETWEEN 3 AND 5 THEN RETURN 0.02;
    ELSE RETURN 0.01; -- 7+
    END IF;
END;
$$ LANGUAGE plpgsql;
