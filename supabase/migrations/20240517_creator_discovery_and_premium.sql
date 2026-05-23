-- 1. Create creator_unlocks table
CREATE TABLE IF NOT EXISTS creator_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  unlock_fee NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, creator_id)
);

-- 2. Update profiles with premium and discovery fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'creator_pro', 'creator_premium', 'client_pro', 'client_business')),
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_creator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_creator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS portfolio_link TEXT,
ADD COLUMN IF NOT EXISTS starting_price NUMERIC;

-- 3. Update conversations for direct chat and optional project_id
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS conversation_type TEXT DEFAULT 'project' CHECK (conversation_type IN ('project', 'direct')),
ALTER COLUMN project_id DROP NOT NULL;

-- 4. Enable RLS and add policies
ALTER TABLE creator_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own creator unlocks"
ON creator_unlocks FOR SELECT TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Creators can view their own unlocks"
ON creator_unlocks FOR SELECT TO authenticated
USING (creator_id = auth.uid());

CREATE POLICY "Clients can insert their own unlocks"
ON creator_unlocks FOR INSERT TO authenticated
WITH CHECK (client_id = auth.uid());

-- 5. Update profiles RLS (Ensure public visibility for discovery)
-- Assuming some policies might exist, we add/update
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- 6. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE creator_unlocks;
