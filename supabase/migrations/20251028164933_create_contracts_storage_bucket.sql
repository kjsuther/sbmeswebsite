/*
  # Create storage bucket for master contracts

  1. New Storage Bucket
    - `master-contracts` - stores generated PDF contracts
  
  2. Security Policies
    - Allow authenticated users to read their own contracts
    - Allow system (service role) to insert contracts
    - Public read access for contract verification
*/

-- Create the storage bucket for master contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('master-contracts', 'master-contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for contracts" ON storage.objects;
DROP POLICY IF EXISTS "Service role can insert contracts" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update contracts" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete contracts" ON storage.objects;

-- Allow public read access to contracts
CREATE POLICY "Public read access for contracts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'master-contracts');

-- Allow service role to insert contracts
CREATE POLICY "Service role can insert contracts"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'master-contracts');

-- Allow service role to update contracts
CREATE POLICY "Service role can update contracts"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'master-contracts');

-- Allow service role to delete contracts
CREATE POLICY "Service role can delete contracts"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'master-contracts');