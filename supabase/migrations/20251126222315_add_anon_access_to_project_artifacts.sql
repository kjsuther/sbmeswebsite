/*
  # Add anonymous access to project_artifacts table

  1. Changes
    - Add policy to allow anonymous users to insert artifacts
    - Add policy to allow anonymous users to read artifacts
    - Add policy to allow anonymous users to update artifacts
    - Add policy to allow anonymous users to delete artifacts
  
  2. Security
    - These policies are permissive to allow the import functionality to work
    - Consider adding more restrictive policies in production based on your security requirements
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anonymous users can insert artifacts" ON project_artifacts;
DROP POLICY IF EXISTS "Anonymous users can read artifacts" ON project_artifacts;
DROP POLICY IF EXISTS "Anonymous users can update artifacts" ON project_artifacts;
DROP POLICY IF EXISTS "Anonymous users can delete artifacts" ON project_artifacts;

-- Allow anonymous users to insert artifacts
CREATE POLICY "Anonymous users can insert artifacts"
  ON project_artifacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read artifacts
CREATE POLICY "Anonymous users can read artifacts"
  ON project_artifacts
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to update artifacts
CREATE POLICY "Anonymous users can update artifacts"
  ON project_artifacts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete artifacts
CREATE POLICY "Anonymous users can delete artifacts"
  ON project_artifacts
  FOR DELETE
  TO anon
  USING (true);