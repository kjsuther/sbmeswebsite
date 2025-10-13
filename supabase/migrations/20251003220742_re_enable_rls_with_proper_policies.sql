/*
  # Re-enable RLS with Proper Policies
  
  ## Overview
  This migration re-enables RLS and creates policies that properly allow anonymous submissions.
  After testing, we've confirmed the issue was with policy configuration.
  
  ## Changes
  1. Re-enable RLS on software_provider_submissions
  2. Create INSERT policy for anon role explicitly
  3. Create SELECT policy for service_role (admin access)
  4. Create UPDATE/DELETE policies for service_role (admin access)
  
  ## Security
  - Anonymous users (anon role) can INSERT submissions only
  - Service role can SELECT, UPDATE, DELETE for admin operations
  - Regular authenticated users cannot access submissions (can be added later if needed)
*/

-- Re-enable RLS
ALTER TABLE software_provider_submissions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Allow public insert" ON software_provider_submissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON software_provider_submissions;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON software_provider_submissions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON software_provider_submissions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON software_provider_submissions;

-- Create INSERT policy specifically for anon role
CREATE POLICY "anon_insert_policy"
  ON software_provider_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create INSERT policy for authenticated users too (in case they're logged in)
CREATE POLICY "authenticated_insert_policy"
  ON software_provider_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create SELECT policy for service_role (for admin dashboard)
CREATE POLICY "service_role_select_policy"
  ON software_provider_submissions
  FOR SELECT
  TO service_role
  USING (true);

-- Create UPDATE policy for service_role
CREATE POLICY "service_role_update_policy"
  ON software_provider_submissions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create DELETE policy for service_role
CREATE POLICY "service_role_delete_policy"
  ON software_provider_submissions
  FOR DELETE
  TO service_role
  USING (true);
