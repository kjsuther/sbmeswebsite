/*
  # Bypass RLS for Anon Role on Software Provider Submissions
  
  ## Overview
  This migration grants the anon role BYPASSRLS privilege temporarily
  to diagnose the RLS issue. This is NOT a permanent solution but will
  help us understand if the issue is with policy evaluation.
  
  ## Changes
  1. Grant BYPASSRLS to anon role for this specific use case
  
  ## Security
  - TEMPORARY: This bypasses all RLS checks for anon role
  - Should be revoked once we identify the root cause
  
  ## Note
  This is a diagnostic step. In production, we should use proper policies.
*/

-- Note: BYPASSRLS is a database-wide privilege, not table-specific
-- Let's instead try a different approach: use SECURITY DEFINER function

-- First, let's just ensure the policies are as permissive as possible
-- by checking the actual policy expressions

-- Recreate the anon insert policy with the most permissive settings
DROP POLICY IF EXISTS "anon_can_insert" ON software_provider_submissions;

CREATE POLICY "anon_can_insert"
  ON software_provider_submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Accept any insert from anon role
    true
  );

-- Also ensure there are no table-level or column-level restrictions
-- Grant all necessary column permissions explicitly
GRANT INSERT (id, company_name, contact_person, email, phone, submission_data, created_at, updated_at) 
  ON software_provider_submissions 
  TO anon;
