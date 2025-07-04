-- Simple migration to fix the immediate issues

-- First, let's check what tables we have
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Add missing columns to existing tables if needed
DO $$ 
BEGIN 
    -- Add organization_id to users table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='organization_id') THEN
        ALTER TABLE users ADD COLUMN organization_id UUID;
    END IF;
    
    -- Add role to users table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'MEMBER';
    END IF;
END $$;

-- Create the families table if it doesn't exist
CREATE TABLE IF NOT EXISTS families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT NOT NULL,
    organization_id UUID NOT NULL,
    created_by_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create the assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    currency TEXT DEFAULT 'AUD' NOT NULL,
    current_balance DECIMAL(20,2) DEFAULT 0 NOT NULL,
    initial_balance DECIMAL(20,2) DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE NOT NULL,
    account_number TEXT,
    institution_name TEXT,
    notes TEXT,
    color TEXT,
    icon TEXT,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    family_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create the transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    amount DECIMAL(20,2) NOT NULL,
    currency TEXT DEFAULT 'AUD' NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    category TEXT,
    subcategory TEXT,
    merchant TEXT,
    location TEXT,
    notes TEXT,
    tags TEXT[],
    is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
    recurring_frequency TEXT,
    receipt_url TEXT,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    transfer_asset_id UUID,
    plaid_transaction_id TEXT,
    basiq_transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create budget_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    organization_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

-- Create helper functions in PUBLIC schema (not auth schema)
CREATE OR REPLACE FUNCTION public.get_user_organization_id() 
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_user_admin() 
RETURNS BOOLEAN AS $$
  SELECT role IN ('OWNER', 'ADMIN') FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Create the setup_default_categories function
CREATE OR REPLACE FUNCTION public.setup_default_categories(org_id UUID)
RETURNS void AS $$
BEGIN
  -- Just return for now - prevents registration errors
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Basic RLS policies using the public functions
-- Allow users to see their own data
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view assets in their org" ON assets
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create assets" ON assets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own assets" ON assets
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own assets" ON assets
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view transactions in their org" ON transactions
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create transactions" ON transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transactions" ON transactions
    FOR DELETE USING (user_id = auth.uid());