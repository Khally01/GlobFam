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
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();