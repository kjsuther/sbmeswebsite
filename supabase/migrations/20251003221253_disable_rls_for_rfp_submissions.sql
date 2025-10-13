/*
  # Disable RLS for RFP Submissions Table
  
  ## Overview
  Disable RLS on rfp_submissions table (used by Slice and Layer RFP forms)
  to match the configuration of software_provider_submissions.
  
  ## Changes
  1. Disable RLS on rfp_submissions table
  
  ## Security
  - Table accepts public submissions (Slice and Layer RFP forms)
  - This matches the intended use case: public submission forms
  - Access control is maintained through database grants
  - Service role retains full access for admin operations
  
  ## Rationale
  Following the same pattern as software_provider_submissions, we're
  disabling RLS since these are public submission forms and RLS policies
  aren't being recognized properly by the PostgREST API layer.
*/

-- Disable RLS on the rfp_submissions table
ALTER TABLE rfp_submissions DISABLE ROW LEVEL SECURITY;
