-- Payments table to track Razorpay transactions
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    payment_id TEXT,
    signature TEXT,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- amount in paise
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Unlocked chats table to track access
CREATE TABLE IF NOT EXISTS unlocked_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, creator_id)
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_chats ENABLE ROW LEVEL SECURITY;

-- Policies for payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = creator_id);

-- Policies for unlocked_chats
CREATE POLICY "Clients can view their unlocked chats" ON unlocked_chats
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Creators can see who unlocked them" ON unlocked_chats
    FOR SELECT USING (auth.uid() = creator_id);
