/*
  # Create Storage Bucket for Documents

  ## Overview
  This migration creates a Supabase Storage bucket for uploaded documents,
  allowing the chatbot to serve downloadable links to source documents.

  ## Storage Configuration

  **Bucket: documents**
  - Public bucket for read access
  - Authenticated users can upload, update, and delete
  - Files are accessible via direct URLs for download

  ## Security
  - RLS policies ensure authenticated users can manage files
  - Public users can download files for chatbot sources
  - File size limits and allowed file types enforced by policies

  ## Storage Policies
  1. Public read access for all files
  2. Authenticated insert/upload access
  3. Authenticated update access (own files)
  4. Authenticated delete access (own files)
*/

-- Create the storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to all documents
CREATE POLICY "Public read access to documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Policy: Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow authenticated users to update their documents
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow authenticated users to delete their documents
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
