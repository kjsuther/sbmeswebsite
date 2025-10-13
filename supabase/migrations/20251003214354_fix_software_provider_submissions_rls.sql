/*
  # Fix Software Provider Submissions RLS Policy

  ## Overview
  This migration fixes the Row Level Security policy for the software_provider_submissions table
  to allow both anonymous and authenticated users to submit RFPs.

  ## Changes
  1. Drop the existing insert policy that only allows anon users
  2. Create a new policy that allows both anon and authenticated users to insert
  
  ## Security
  - Maintains secure read/update/delete policies for authenticated users only
  - Allows public submissions from both logged-in and anonymous users
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Anyone can submit software provider RFPs" ON software_provider_submissions;

-- Create new insert policy that allows both anon and authenticated users
CREATE POLICY "Anyone can submit software provider RFPs"
  ON software_provider_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);