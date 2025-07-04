-- =====================================================
-- GLOBFAM DATABASE MIGRATIONS
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- MIGRATION 1: INITIAL SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
CREATE TYPE pricing_plan AS ENUM ('STARTER', 'FAMILY', 'PREMIUM');
CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE asset_type AS ENUM ('BANK_ACCOUNT', 'INVESTMENT', 'PROPERTY', 'CRYPTO', 'LOAN', 'CASH', 'OTHER');
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
CREATE TYPE goal_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE notification_type AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');
CREATE TYPE document_type AS ENUM ('BANK_STATEMENT', 'TAX_DOCUMENT', 'RECEIPT', 'INVOICE', 'OTHER');
CREATE TYPE bank_provider AS ENUM ('PLAID', 'BASIQ', 'MANUAL');
CREATE TYPE import_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- Organizations table
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan pricing_plan DEFAULT 'STARTER' NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    billing_email TEXT,
    trial_ends_at TIMESTAMPTZ,
    subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_organizations_plan ON organizations(plan);
CREATE INDEX idx_organizations_stripe ON organizations(stripe_customer_id);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role DEFAULT 'MEMBER' NOT NULL,
    avatar TEXT,
    country TEXT DEFAULT 'AU' NOT NULL,
    preferred_currency TEXT DEFAULT 'AUD' NOT NULL,
    language TEXT DEFAULT 'en' NOT NULL,
    timezone TEXT DEFAULT 'Australia/Sydney' NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    family_id UUID,
    email_verified TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_family ON users(family_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Families table
CREATE TABLE families (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE DEFAULT uuid_generate_v4()::TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_families_invite ON families(invite_code);
CREATE INDEX idx_families_organization ON families(organization_id);

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Add foreign key for family_id in users
ALTER TABLE users ADD CONSTRAINT fk_users_family FOREIGN KEY (family_id) REFERENCES families(id);

-- Assets table
CREATE TABLE assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type asset_type NOT NULL,
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
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    family_id UUID REFERENCES families(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_assets_organization ON assets(organization_id);
CREATE INDEX idx_assets_user ON assets(user_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_active ON assets(is_active);

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Transactions table
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type transaction_type NOT NULL,
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
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    transfer_asset_id UUID REFERENCES assets(id),
    plaid_transaction_id TEXT,
    basiq_transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_transactions_organization ON transactions(organization_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_asset ON transactions(asset_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- More tables follow... (truncating for brevity)
-- Run the actual file content from 00001_initial_schema.sql

-- =====================================================
-- MIGRATION 2: RLS POLICIES
-- =====================================================

-- Run the content from 00002_rls_policies.sql

-- =====================================================
-- MIGRATION 3: BALANCE FUNCTIONS
-- =====================================================

-- Run the content from 00003_balance_functions.sql

-- =====================================================
-- MIGRATION 4: RECEIPTS STORAGE
-- =====================================================

-- Run the content from 00004_receipts_storage.sql

-- =====================================================
-- MIGRATION 5: AUTH HELPER FUNCTIONS
-- =====================================================

-- Create helper functions for RLS policies
CREATE OR REPLACE FUNCTION auth.organization_id() 
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT role IN ('OWNER', 'ADMIN') FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;

-- =====================================================
-- MIGRATION 6: SETUP DEFAULT CATEGORIES
-- =====================================================

-- Create function to setup default budget categories for new organizations
CREATE OR REPLACE FUNCTION setup_default_categories(org_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert default income categories
  INSERT INTO budget_categories (organization_id, name, type, is_default)
  VALUES 
    (org_id, 'Salary', 'INCOME', true),
    (org_id, 'Business Income', 'INCOME', true),
    (org_id, 'Investment Income', 'INCOME', true),
    (org_id, 'Other Income', 'INCOME', true);

  -- Insert default expense categories
  INSERT INTO budget_categories (organization_id, name, type, is_default)
  VALUES 
    (org_id, 'Housing', 'EXPENSE', true),
    (org_id, 'Transportation', 'EXPENSE', true),
    (org_id, 'Food & Dining', 'EXPENSE', true),
    (org_id, 'Utilities', 'EXPENSE', true),
    (org_id, 'Healthcare', 'EXPENSE', true),
    (org_id, 'Insurance', 'EXPENSE', true),
    (org_id, 'Education', 'EXPENSE', true),
    (org_id, 'Entertainment', 'EXPENSE', true),
    (org_id, 'Shopping', 'EXPENSE', true),
    (org_id, 'Personal Care', 'EXPENSE', true),
    (org_id, 'Savings & Investments', 'EXPENSE', true),
    (org_id, 'Debt Payments', 'EXPENSE', true),
    (org_id, 'Taxes', 'EXPENSE', true),
    (org_id, 'Other Expenses', 'EXPENSE', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role (used during registration)
GRANT EXECUTE ON FUNCTION setup_default_categories(UUID) TO service_role;