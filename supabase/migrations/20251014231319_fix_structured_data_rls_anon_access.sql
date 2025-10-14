/*
  # Fix Structured Data RLS Policies for Anonymous Access

  1. Changes
    - Drop existing authenticated-only INSERT policy
    - Create new INSERT policy that allows both anonymous and authenticated users
    - This matches the pattern used for document_chunks table

  2. Security
    - Maintains RLS protection while allowing public uploads
    - Consistent with existing document upload flow
*/

-- Drop the authenticated-only insert policy
DROP POLICY IF EXISTS "Allow authenticated insert to structured_data" ON structured_data;

-- Create new policy that allows both anonymous and authenticated inserts
CREATE POLICY "Allow public insert to structured_data"
  ON structured_data
  FOR INSERT
  WITH CHECK (true);
