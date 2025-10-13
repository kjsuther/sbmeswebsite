/*
  # Grant Permissions for Software Provider Submissions
  
  ## Overview
  This migration ensures proper permissions are granted to allow anonymous submissions.
  
  ## Changes
  1. Grant INSERT permission to anon role explicitly
  2. Grant SELECT permission to authenticated role
  3. Ensure policies work correctly with granted permissions
  
  ## Security
  - Anonymous users (anon role) can INSERT submissions
  - Authenticated users can SELECT, UPDATE, DELETE submissions
*/

-- Grant INSERT permission to anon role (for public form submissions)
GRANT INSERT ON software_provider_submissions TO anon;

-- Grant all permissions to authenticated role (for admin access)
GRANT SELECT, UPDATE, DELETE ON software_provider_submissions TO authenticated;

-- Grant USAGE on the sequence if it exists
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
