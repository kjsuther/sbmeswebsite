/*
  # Add anonymous access to artifact_categories table

  1. Changes
    - Add policy to allow anonymous users to read categories
    - This is needed for the import functionality to work
  
  2. Security
    - Anonymous users can only read categories, not modify them
    - Only authenticated users can manage categories
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anonymous users can read categories" ON artifact_categories;

-- Allow anonymous users to read categories
CREATE POLICY "Anonymous users can read categories"
  ON artifact_categories
  FOR SELECT
  TO anon
  USING (true);