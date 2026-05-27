-- Add workspace fields to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS assigned_creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS accepted_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'kickoff';

-- Add check constraint for current_stage if it doesn't exist
DO $$ 
BEGIN 
    ALTER TABLE projects ADD CONSTRAINT projects_current_stage_check 
    CHECK (current_stage IN ('kickoff', 'production', 'review', 'delivery', 'completed'));
EXCEPTION 
    WHEN duplicate_object THEN NULL; 
END $$;
