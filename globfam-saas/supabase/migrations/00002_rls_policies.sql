-- Row Level Security Policies for GlobFam

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
  );