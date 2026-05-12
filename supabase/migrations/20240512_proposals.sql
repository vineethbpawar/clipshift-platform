-- 1. Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    freelancer_role TEXT NOT NULL,
    cover_letter TEXT,
    proposed_budget DECIMAL,
    estimated_delivery_days INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, freelancer_id)
);

-- 2. Enable RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Editors/Videographers can create proposals
CREATE POLICY "Staff can create proposals" ON proposals
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('editor', 'videographer')
    ));

-- Freelancers can only view their own proposals
CREATE POLICY "Freelancers can view own proposals" ON proposals
    FOR SELECT TO authenticated
    USING (freelancer_id = auth.uid());

-- Clients can only view proposals for their projects
CREATE POLICY "Clients can view project proposals" ON proposals
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id 
        AND client_id = auth.uid()
    ));

-- Clients can update proposal status
CREATE POLICY "Clients can update proposal status" ON proposals
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id 
        AND client_id = auth.uid()
    ));
