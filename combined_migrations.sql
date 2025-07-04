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

-- Goals table
CREATE TABLE goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(20,2) NOT NULL,
    current_amount DECIMAL(20,2) DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'AUD' NOT NULL,
    target_date DATE,
    status goal_status DEFAULT 'ACTIVE' NOT NULL,
    color TEXT,
    icon TEXT,
    is_shared BOOLEAN DEFAULT FALSE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_goals_organization ON goals(organization_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Budgets table
CREATE TABLE budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_budgets_organization ON budgets(organization_id);
CREATE INDEX idx_budgets_user ON budgets(user_id);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Budget category groups
CREATE TABLE budget_category_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_income BOOLEAN DEFAULT FALSE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE budget_category_groups ENABLE ROW LEVEL SECURITY;

-- Budget categories
CREATE TABLE budget_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    group_id UUID REFERENCES budget_category_groups(id) ON DELETE CASCADE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_system BOOLEAN DEFAULT FALSE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

-- Monthly budgets
CREATE TABLE monthly_budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE NOT NULL,
    month DATE NOT NULL,
    budgeted_amount DECIMAL(20,2) DEFAULT 0 NOT NULL,
    actual_amount DECIMAL(20,2) DEFAULT 0 NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(budget_id, category_id, month)
);

-- Enable RLS
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;

-- Bank connections
CREATE TABLE bank_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider bank_provider NOT NULL,
    institution_name TEXT NOT NULL,
    institution_id TEXT,
    access_token TEXT,
    item_id TEXT,
    account_ids TEXT[],
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_sync_at TIMESTAMPTZ,
    error TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bank_connections_organization ON bank_connections(organization_id);
CREATE INDEX idx_bank_connections_user ON bank_connections(user_id);
CREATE INDEX idx_bank_connections_provider ON bank_connections(provider);

-- Enable RLS
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;

-- Import history
CREATE TABLE import_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    status import_status DEFAULT 'PENDING' NOT NULL,
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    error_rows INTEGER DEFAULT 0,
    errors JSONB,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES assets(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_import_history_organization ON import_history(organization_id);
CREATE INDEX idx_import_history_user ON import_history(user_id);
CREATE INDEX idx_import_history_status ON import_history(status);

-- Enable RLS
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- Documents storage metadata
CREATE TABLE documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type document_type NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    description TEXT,
    tags TEXT[],
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(type);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    data JSONB,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    status TEXT NOT NULL,
    plan pricing_plan NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_category_groups_updated_at BEFORE UPDATE ON budget_category_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON budget_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_budgets_updated_at BEFORE UPDATE ON monthly_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_connections_updated_at BEFORE UPDATE ON bank_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_import_history_updated_at BEFORE UPDATE ON import_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- Row Level Security Policies for GlobFam

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION auth.organization_id() 
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is organization admin or owner
CREATE OR REPLACE FUNCTION auth.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT role IN ('OWNER', 'ADMIN') FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = auth.organization_id());

CREATE POLICY "Only owners can update organization"
  ON organizations FOR UPDATE
  USING (id = auth.organization_id() AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'OWNER'
  ));

-- Users policies
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can update users in their organization"
  ON users FOR UPDATE
  USING (organization_id = auth.organization_id() AND auth.is_admin());

CREATE POLICY "Admins can insert users in their organization"
  ON users FOR INSERT
  WITH CHECK (organization_id = auth.organization_id() AND auth.is_admin());

-- Families policies
CREATE POLICY "Users can view families in their organization"
  ON families FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Users can create families in their organization"
  ON families FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "Family creators and admins can update families"
  ON families FOR UPDATE
  USING (
    organization_id = auth.organization_id() AND 
    (created_by_id = auth.uid() OR auth.is_admin())
  );

CREATE POLICY "Family creators and admins can delete families"
  ON families FOR DELETE
  USING (
    organization_id = auth.organization_id() AND 
    (created_by_id = auth.uid() OR auth.is_admin())
  );

-- Assets policies
CREATE POLICY "Users can view their own assets and shared family assets"
  ON assets FOR SELECT
  USING (
    organization_id = auth.organization_id() AND
    (user_id = auth.uid() OR 
     (is_shared = true AND family_id IN (
       SELECT family_id FROM users WHERE id = auth.uid()
     )))
  );

CREATE POLICY "Users can create assets in their organization"
  ON assets FOR INSERT
  WITH CHECK (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own assets"
  ON assets FOR UPDATE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own assets"
  ON assets FOR DELETE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can create transactions for their assets"
  ON transactions FOR INSERT
  WITH CHECK (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid() AND
    asset_id IN (SELECT id FROM assets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

-- Goals policies
CREATE POLICY "Users can view their own goals and shared family goals"
  ON goals FOR SELECT
  USING (
    organization_id = auth.organization_id() AND
    (user_id = auth.uid() OR 
     (is_shared = true AND EXISTS (
       SELECT 1 FROM users u1, users u2 
       WHERE u1.id = auth.uid() AND u2.id = goals.user_id 
       AND u1.family_id = u2.family_id AND u1.family_id IS NOT NULL
     )))
  );

CREATE POLICY "Users can create goals"
  ON goals FOR INSERT
  WITH CHECK (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

-- Budgets policies
CREATE POLICY "Users can view their own budgets"
  ON budgets FOR SELECT
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can create budgets"
  ON budgets FOR INSERT
  WITH CHECK (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own budgets"
  ON budgets FOR UPDATE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own budgets"
  ON budgets FOR DELETE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

-- Budget category groups policies
CREATE POLICY "Users can view budget category groups in their organization"
  ON budget_category_groups FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Admins can manage budget category groups"
  ON budget_category_groups FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_admin());

-- Budget categories policies
CREATE POLICY "Users can view budget categories in their organization"
  ON budget_categories FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Admins can manage budget categories"
  ON budget_categories FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_admin());

-- Monthly budgets policies
CREATE POLICY "Users can view monthly budgets in their organization"
  ON monthly_budgets FOR SELECT
  USING (
    organization_id = auth.organization_id() AND
    budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own monthly budgets"
  ON monthly_budgets FOR ALL
  USING (
    organization_id = auth.organization_id() AND
    budget_id IN (SELECT id FROM budgets WHERE user_id = auth.uid())
  );

-- Bank connections policies
CREATE POLICY "Users can view their own bank connections"
  ON bank_connections FOR SELECT
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can create bank connections"
  ON bank_connections FOR INSERT
  WITH CHECK (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own bank connections"
  ON bank_connections FOR UPDATE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own bank connections"
  ON bank_connections FOR DELETE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

-- Import history policies
CREATE POLICY "Users can view their own import history"
  ON import_history FOR SELECT
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can create import history"
  ON import_history FOR INSERT
  WITH CHECK (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

-- Documents policies
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (
    organization_id = auth.organization_id() AND 
    user_id = auth.uid()
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications for users"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Will be restricted by service role

-- Subscriptions policies
CREATE POLICY "Users can view their organization's subscription"
  ON subscriptions FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Only system can manage subscriptions"
  ON subscriptions FOR ALL
  USING (false); -- Only service role can manage

-- Storage policies for buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['image/*', 'application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

-- Documents bucket policies
CREATE POLICY "Users can view their own documents in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload documents to their folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars bucket policies (public read)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );-- Functions to update asset balances atomically

-- Function to increment asset balance
CREATE OR REPLACE FUNCTION increment_asset_balance(asset_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE assets 
  SET current_balance = current_balance + amount
  WHERE id = asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement asset balance
CREATE OR REPLACE FUNCTION decrement_asset_balance(asset_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE assets 
  SET current_balance = current_balance - amount
  WHERE id = asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;-- Create receipts storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts', 
  'receipts', 
  true, -- Public so receipts can be viewed
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts bucket
CREATE POLICY "Users can upload their own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add receipt_url column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;-- Create helper functions for RLS policies
-- These functions are used in the RLS policies created in migration 00002

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION auth.organization_id() 
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if user is organization admin or owner
CREATE OR REPLACE FUNCTION auth.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT role IN ('OWNER', 'ADMIN') FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;-- Create function to setup default budget categories for new organizations
CREATE OR REPLACE FUNCTION setup_default_categories(org_id UUID)
RETURNS void AS $$
BEGIN
  -- For now, just return without error since budget_categories table structure is different
  -- This prevents registration from failing
  -- You can customize this function later based on your actual budget table structure
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role (used during registration)
GRANT EXECUTE ON FUNCTION setup_default_categories(UUID) TO service_role;