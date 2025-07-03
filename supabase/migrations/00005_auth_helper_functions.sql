-- Create helper functions for RLS policies
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
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;