/*
  # Fix INSERT Policy - Remove Role Restriction
  
  ## Overview
  This migration removes the TO clause from the INSERT policy to allow ALL users
  (authenticated, anonymous, and service_role) to insert submissions.
  
  ## Changes
  1. Drop existing INSERT policy
  2. Create new INSERT policy without TO clause (applies to all roles by default)
  
  ## Security
  - All users can INSERT submissions (public form access)
  - Only authenticated users can SELECT, UPDATE, DELETE
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Enable insert for all users" ON software_provider_submissions;

-- Create INSERT policy without TO clause to apply to ALL roles
CREATE POLICY "Allow public insert"
  ON software_provider_submissions
  FOR INSERT
  WITH CHECK (true);

-- Explicitly grant INSERT to anon and authenticated to be sure
GRANT INSERT ON software_provider_submissions TO anon, authenticated;
