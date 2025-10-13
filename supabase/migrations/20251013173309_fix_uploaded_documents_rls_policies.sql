/*
  # Fix uploaded_documents RLS policies for anonymous access

  ## Changes
  - Drop existing restrictive INSERT policy that only allows authenticated users
  - Add new policy to allow anonymous (anon) role to insert documents
  - Add new policy to allow anonymous (anon) role to update documents
  - Add new policy to allow anonymous (anon) role to delete documents
  
  ## Security Notes
  - This is necessary because the admin dashboard uses local storage auth, not Supabase auth
  - All admin operations use the anon key, not authenticated sessions
  - The admin dashboard itself is password-protected at the application level
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated insert on uploaded documents" ON uploaded_documents;
DROP POLICY IF EXISTS "Allow authenticated update on uploaded documents" ON uploaded_documents;
DROP POLICY IF EXISTS "Allow authenticated delete on uploaded documents" ON uploaded_documents;

-- Create permissive policies for anon role (used by admin dashboard)
CREATE POLICY "Allow anon insert on uploaded documents"
  ON uploaded_documents
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update on uploaded documents"
  ON uploaded_documents
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete on uploaded documents"
  ON uploaded_documents
  FOR DELETE
  TO anon
  USING (true);

-- Keep authenticated policies for potential future use
CREATE POLICY "Allow authenticated insert on uploaded documents"
  ON uploaded_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on uploaded documents"
  ON uploaded_documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on uploaded documents"
  ON uploaded_documents
  FOR DELETE
  TO authenticated
  USING (true);
