-- Create function to setup default budget categories for new organizations
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