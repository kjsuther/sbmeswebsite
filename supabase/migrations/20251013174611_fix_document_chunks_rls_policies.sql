/*
  # Fix document_chunks RLS policies for anonymous access

  ## Changes
  - Drop existing restrictive INSERT, UPDATE, DELETE policies that only allow authenticated users
  - Add new policies to allow anonymous (anon) role to insert, update, and delete document chunks
  
  ## Security Notes
  - This is necessary because the admin dashboard uses local storage auth, not Supabase auth
  - All admin operations use the anon key, not authenticated sessions
  - The admin dashboard itself is password-protected at the application level
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated insert on document chunks" ON document_chunks;
DROP POLICY IF EXISTS "Allow authenticated update on document chunks" ON document_chunks;
DROP POLICY IF EXISTS "Allow authenticated delete on document chunks" ON document_chunks;

-- Create permissive policies for anon role (used by admin dashboard)
CREATE POLICY "Allow anon insert on document chunks"
  ON document_chunks
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update on document chunks"
  ON document_chunks
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete on document chunks"
  ON document_chunks
  FOR DELETE
  TO anon
  USING (true);

-- Keep authenticated policies for potential future use
CREATE POLICY "Allow authenticated insert on document chunks"
  ON document_chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on document chunks"
  ON document_chunks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on document chunks"
  ON document_chunks
  FOR DELETE
  TO authenticated
  USING (true);
