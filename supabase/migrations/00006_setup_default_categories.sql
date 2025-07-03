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