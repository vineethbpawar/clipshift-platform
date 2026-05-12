-- 1. Create project_unlocks table
CREATE TABLE IF NOT EXISTS project_unlocks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    unlock_fee DECIMAL DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, freelancer_id)
);

-- 2. Enable RLS
ALTER TABLE project_unlocks ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Freelancers can view their own unlocks
CREATE POLICY "Freelancers can view own unlocks" ON project_unlocks
    FOR SELECT TO authenticated
    USING (freelancer_id = auth.uid());

-- Freelancers can create (initiate) unlocks
CREATE POLICY "Freelancers can create unlocks" ON project_unlocks
    FOR INSERT TO authenticated
    WITH CHECK (freelancer_id = auth.uid());

-- Clients can view unlocks for their own projects
CREATE POLICY "Clients can view unlocks for their projects" ON project_unlocks
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id 
        AND client_id = auth.uid()
    ));
