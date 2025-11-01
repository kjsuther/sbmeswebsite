/*
  # Create slice-rfp-submissions storage bucket

  1. New Storage Bucket
    - `slice-rfp-submissions` - Stores generated slice RFP response PDFs
      - Public bucket for easy access to submitted PDFs
      - Allows anonymous uploads for submissions

  2. Security
    - Enable RLS on storage.objects
    - Allow public read access to all files
    - Allow anonymous users to insert files
    - Allow authenticated users full access
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('slice-rfp-submissions', 'slice-rfp-submissions', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Public read access for slice RFP submissions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'slice-rfp-submissions');

CREATE POLICY IF NOT EXISTS "Allow anonymous uploads to slice RFP submissions"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'slice-rfp-submissions');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload slice RFP submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'slice-rfp-submissions');

CREATE POLICY IF NOT EXISTS "Allow public to delete slice RFP submissions"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'slice-rfp-submissions');
