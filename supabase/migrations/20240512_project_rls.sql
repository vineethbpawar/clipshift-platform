-- Enable RLS on the projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 1. VIEWING PROJECTS
-- Clients: Can only see their own
CREATE POLICY "Clients can view their own projects" ON projects
    FOR SELECT TO authenticated
    USING (auth.uid() = client_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'client');

-- Editors & Videographers: Can see all projects
CREATE POLICY "Staff can view all projects" ON projects
    FOR SELECT TO authenticated
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'videographer', 'admin'));

-- 2. INSERTING PROJECTS
-- Clients: Can only insert their own
CREATE POLICY "Clients can insert their own projects" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = client_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'client');

-- 3. UPDATING PROJECTS
-- Clients: Can only update their own
CREATE POLICY "Clients can update their own projects" ON projects
    FOR UPDATE TO authenticated
    USING (auth.uid() = client_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'client');

-- 4. DELETING PROJECTS
-- Clients: Can only delete their own
CREATE POLICY "Clients can delete their own projects" ON projects
    FOR DELETE TO authenticated
    USING (auth.uid() = client_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'client');
