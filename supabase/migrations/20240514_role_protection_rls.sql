-- Update RLS policies for the new role model (client, creator, admin)

-- 1. Projects Table
DROP POLICY IF EXISTS "Clients can view their own projects" ON projects;
DROP POLICY IF EXISTS "Staff can view all projects" ON projects;
DROP POLICY IF EXISTS "Clients can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Clients can update their own projects" ON projects;
DROP POLICY IF EXISTS "Clients can delete their own projects" ON projects;

-- Viewing Projects: Clients see their own, Creators & Admins see all
CREATE POLICY "Clients can view their own projects" ON projects
    FOR SELECT TO authenticated
    USING (
        (auth.uid() = client_id) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('creator', 'admin')
        )
    );

-- Inserting Projects: Only Clients can insert
CREATE POLICY "Only clients can insert projects" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'client'
        ) AND (auth.uid() = client_id)
    );

-- Updating Projects: Only the owner (Client) can update
CREATE POLICY "Clients can update their own projects" ON projects
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'client'
        ) AND (auth.uid() = client_id)
    );

-- Deleting Projects: Only the owner (Client) can delete
CREATE POLICY "Clients can delete their own projects" ON projects
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'client'
        ) AND (auth.uid() = client_id)
    );


-- 2. Proposals Table
DROP POLICY IF EXISTS "Staff can create proposals" ON proposals;
DROP POLICY IF EXISTS "Freelancers can view own proposals" ON proposals;
DROP POLICY IF EXISTS "Clients can view project proposals" ON proposals;
DROP POLICY IF EXISTS "Clients can update proposal status" ON proposals;

-- Inserting Proposals: Only Creators can submit
CREATE POLICY "Only creators can submit proposals" ON proposals
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'creator'
        ) AND (freelancer_id = auth.uid())
    );

-- Viewing Proposals: Creators see their own, Clients see proposals for their projects
CREATE POLICY "Creators can view own proposals" ON proposals
    FOR SELECT TO authenticated
    USING (
        (freelancer_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND client_id = auth.uid()
        )
    );

-- Updating Proposals: Only Clients can update status of proposals for their projects
CREATE POLICY "Clients can update proposal status" ON proposals
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND client_id = auth.uid()
        )
    );


-- 3. Project Unlocks Table
DROP POLICY IF EXISTS "Freelancers can view own unlocks" ON project_unlocks;
DROP POLICY IF EXISTS "Freelancers can create unlocks" ON project_unlocks;
DROP POLICY IF EXISTS "Clients can view unlocks for their projects" ON project_unlocks;

-- Inserting Unlocks: Only Creators can unlock
CREATE POLICY "Only creators can unlock projects" ON project_unlocks
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'creator'
        ) AND (freelancer_id = auth.uid())
    );

-- Viewing Unlocks: Creators see their own, Clients see for their projects
CREATE POLICY "Creators can view own unlocks" ON project_unlocks
    FOR SELECT TO authenticated
    USING (
        (freelancer_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND client_id = auth.uid()
        )
    );
