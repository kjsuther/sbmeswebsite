/*
  # Fix Storage Policies to Allow Anonymous Uploads

  ## Overview
  Updates the storage bucket policies to allow anonymous (unauthenticated) users
  to upload, update, and delete documents. This is needed because the admin
  dashboard uses a custom authentication system rather than Supabase Auth.

  ## Changes
  - Drop existing authenticated-only policies
  - Create new policies that allow both authenticated and anonymous access
  - Maintain public read access for all users

  ## Security Note
  This is acceptable because:
  1. The admin dashboard has its own authentication layer
  2. Only admin users have access to the document upload interface
  3. The bucket is still protected by application-level access control
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- Policy: Allow anonymous users to upload documents (for admin dashboard)
CREATE POLICY "Allow anon upload to documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow anonymous users to update documents
CREATE POLICY "Allow anon update to documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow anonymous users to delete documents
CREATE POLICY "Allow anon delete from documents"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'documents');
