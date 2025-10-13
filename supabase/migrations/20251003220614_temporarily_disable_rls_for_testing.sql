/*
  # Temporarily Disable RLS for Testing
  
  ## Overview
  This migration temporarily disables RLS on software_provider_submissions
  to test if submissions work without RLS, confirming that RLS is the issue.
  
  ## Changes
  1. Disable RLS on the table
  
  ## Security
  - TEMPORARY: All users can perform all operations
  - This should be re-enabled with proper policies once we confirm it works
*/

-- Temporarily disable RLS for testing
ALTER TABLE software_provider_submissions DISABLE ROW LEVEL SECURITY;
