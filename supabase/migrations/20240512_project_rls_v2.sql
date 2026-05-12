-- 1. Enable RLS on the projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to replace them with corrected ones
DROP POLICY IF EXISTS "Clients can view their own projects" ON projects;
DROP POLICY IF EXISTS "Staff can view all projects" ON projects;
DROP POLICY IF EXISTS "Clients can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Clients can update their own projects" ON projects;
DROP POLICY IF EXISTS "Clients can delete their own projects" ON projects;

-- 3. VIEWING PROJECTS
-- Clients: Can only see their own
CREATE POLICY "Clients can view their own projects" ON projects
    FOR SELECT TO authenticated
    USING (auth.uid() = client_id);

-- Editors & Videographers: Can see all projects
-- Assuming 'role' is in user_metadata or we have a profiles table
CREATE POLICY "Staff can view all projects" ON projects
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('editor', 'videographer', 'admin')
    ));

-- 4. INSERTING PROJECTS
-- Clients: Can only insert their own
CREATE POLICY "Clients can insert their own projects" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = client_id);

-- 5. UPDATING PROJECTS
-- Clients: Can only update their own
CREATE POLICY "Clients can update their own projects" ON projects
    FOR UPDATE TO authenticated
    USING (auth.uid() = client_id);

-- 6. DELETING PROJECTS
-- Clients: Can only delete their own
CREATE POLICY "Clients can delete their own projects" ON projects
    FOR DELETE TO authenticated
    USING (auth.uid() = client_id);

-- 7. Add service_type column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS service_type TEXT;
