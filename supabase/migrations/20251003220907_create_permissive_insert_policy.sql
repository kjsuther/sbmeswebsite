/*
  # Create Fully Permissive INSERT Policy
  
  ## Overview
  This migration creates an INSERT policy that doesn't restrict by role at all,
  allowing any connection to insert data.
  
  ## Changes
  1. Drop all existing policies
  2. Disable and re-enable RLS to ensure clean state
  3. Create a single INSERT policy with no role restriction
  4. Keep service_role policies for admin operations
  
  ## Security
  - Anyone can INSERT submissions (no role check)
  - Service role can perform all operations for admin access
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "anon_insert_policy" ON software_provider_submissions;
DROP POLICY IF EXISTS "authenticated_insert_policy" ON software_provider_submissions;
DROP POLICY IF EXISTS "service_role_select_policy" ON software_provider_submissions;
DROP POLICY IF EXISTS "service_role_update_policy" ON software_provider_submissions;
DROP POLICY IF EXISTS "service_role_delete_policy" ON software_provider_submissions;

-- Disable and re-enable RLS for clean state
ALTER TABLE software_provider_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE software_provider_submissions ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy with NO role restriction (applies to everyone)
-- Don't use TO clause at all
CREATE POLICY "allow_all_inserts"
  ON software_provider_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create policies for service_role to manage submissions
CREATE POLICY "service_role_all_operations"
  ON software_provider_submissions
  TO service_role
  USING (true)
  WITH CHECK (true);
