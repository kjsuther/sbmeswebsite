/*
  # Create contract-templates storage bucket

  1. Storage Bucket
    - `contract-templates` - Stores master contract PDF templates with form fields
  
  2. Security
    - Enable RLS on the bucket
    - Allow anonymous read access for edge functions to read templates
    - Allow authenticated users to upload new templates
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-templates', 'contract-templates', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow anon to read templates"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'contract-templates');

CREATE POLICY "Allow authenticated to upload templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contract-templates');

CREATE POLICY "Allow authenticated to update templates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'contract-templates');

CREATE POLICY "Allow authenticated to delete templates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contract-templates');
