/*
  # Fix master-contracts bucket policies for anonymous access

  1. Changes
    - Add policy to allow anonymous users to insert PDFs into master-contracts bucket
    - This enables the form submission to upload generated PDFs
  
  2. Security
    - Anonymous users can upload to the bucket (needed for form submissions)
    - Public can read from the bucket (already configured)
*/

-- Allow anonymous users to insert PDFs into master-contracts bucket
CREATE POLICY "Allow anon users to upload contracts"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'master-contracts');

-- Allow authenticated users to insert PDFs as well
CREATE POLICY "Allow authenticated users to upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'master-contracts');
