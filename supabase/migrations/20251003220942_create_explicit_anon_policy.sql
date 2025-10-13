/*
  # Create Explicit Anon Policy with All Permissions
  
  ## Overview
  This migration creates explicit policies for the anon role and ensures
  all necessary grants are in place.
  
  ## Changes
  1. Drop existing policies
  2. Grant explicit permissions to anon role
  3. Create explicit INSERT policy for anon role
  4. Create explicit INSERT policy for authenticated role as backup
  
  ## Security
  - Anon and authenticated roles can INSERT submissions
  - Service role has full access for admin operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_all_inserts" ON software_provider_submissions;
DROP POLICY IF EXISTS "service_role_all_operations" ON software_provider_submissions;

-- Explicitly grant INSERT permission to anon role
GRANT INSERT ON TABLE software_provider_submissions TO anon;
GRANT INSERT ON TABLE software_provider_submissions TO authenticated;

-- Grant USAGE on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create explicit policy for anon role
CREATE POLICY "anon_can_insert"
  ON software_provider_submissions
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create explicit policy for authenticated role  
CREATE POLICY "authenticated_can_insert"
  ON software_provider_submissions
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Service role policy for all operations
CREATE POLICY "service_role_full_access"
  ON software_provider_submissions
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
