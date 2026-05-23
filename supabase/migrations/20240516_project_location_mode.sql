ALTER TABLE projects
ADD COLUMN IF NOT EXISTS location_mode TEXT DEFAULT 'anywhere_india',
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS shoot_radius_km INTEGER DEFAULT 100;

ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_location_mode_check;

ALTER TABLE projects
ADD CONSTRAINT projects_location_mode_check
CHECK (location_mode IN ('anywhere_india', 'preferred_location', 'shoot_location'));
