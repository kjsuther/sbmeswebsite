/*
  # Fix Software Provider Submissions INSERT Policy
  
  ## Overview
  This migration completely recreates the INSERT policy for software_provider_submissions
  to allow anonymous (public) submissions without authentication.
  
  ## Changes
  1. Drop all existing policies on the table
  2. Recreate INSERT policy with proper configuration for anonymous access
  3. Recreate other policies for authenticated admin access
  
  ## Security
  - Anonymous users can INSERT new submissions (public form submissions)
  - Only authenticated users can SELECT, UPDATE, or DELETE submissions (admin access)
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can submit software provider RFPs" ON software_provider_submissions;
DROP POLICY IF EXISTS "Authenticated users can view all software provider submissions" ON software_provider_submissions;
DROP POLICY IF EXISTS "Authenticated users can update software provider submissions" ON software_provider_submissions;
DROP POLICY IF EXISTS "Authenticated users can delete software provider submissions" ON software_provider_submissions;

-- Create INSERT policy for anonymous submissions (no authentication required)
CREATE POLICY "Public can insert software provider submissions"
  ON software_provider_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create SELECT policy for authenticated users only
CREATE POLICY "Authenticated users can view software provider submissions"
  ON software_provider_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create UPDATE policy for authenticated users only
CREATE POLICY "Authenticated users can update software provider submissions"
  ON software_provider_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create DELETE policy for authenticated users only
CREATE POLICY "Authenticated users can delete software provider submissions"
  ON software_provider_submissions
  FOR DELETE
  TO authenticated
  USING (true);
