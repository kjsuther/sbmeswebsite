/*
  # Add Explicit Anon Role INSERT Policy
  
  ## Overview
  This migration adds an explicit policy for the anon role to insert submissions.
  
  ## Changes
  1. Add a specific policy for anon role INSERT operations
  
  ## Security
  - Anon role can INSERT submissions (public form submissions)
  - Existing policies for authenticated users remain unchanged
*/

-- Create explicit INSERT policy for anon role
CREATE POLICY "Anon can insert software provider submissions"
  ON software_provider_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);
