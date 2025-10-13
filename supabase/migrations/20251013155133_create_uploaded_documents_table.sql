/*
  # Create uploaded_documents table for document management

  ## Overview
  This migration creates a table to track uploaded documents in the chatbot knowledge base.
  This enables individual document management (view, delete) and prevents accidental deletion
  during knowledge base re-seeding.

  ## New Table

  **uploaded_documents**
  - `id` (uuid, primary key) - Unique identifier for the document
  - `filename` (text, not null) - Original filename of the uploaded document
  - `file_type` (text, not null) - MIME type or file extension
  - `file_size` (bigint) - Size in bytes
  - `content_hash` (text) - SHA-256 hash to detect duplicates
  - `storage_path` (text) - Path in storage (if using external storage)
  - `chunk_count` (integer, default 0) - Number of chunks created from this document
  - `processing_status` (text) - Status: pending, processing, completed, failed
  - `error_message` (text) - Error details if processing failed
  - `metadata` (jsonb) - Additional metadata (author, created date, etc.)
  - `uploaded_by` (text) - Session ID or user identifier
  - `created_at` (timestamptz) - When document was uploaded
  - `updated_at` (timestamptz) - Last update timestamp

  ## Changes to document_chunks

  Add a foreign key reference to link chunks back to their source document:
  - `uploaded_document_id` (uuid, nullable) - References uploaded_documents.id

  ## Security
  - RLS enabled on uploaded_documents table
  - Authenticated users can insert, update, delete documents
  - Public can read document metadata (but not file contents)

  ## Indexes
  - Index on filename for searching
  - Index on file_type for filtering
  - Index on processing_status for monitoring
  - Index on created_at for sorting
*/

-- Create uploaded_documents table
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_type text NOT NULL,
  file_size bigint DEFAULT 0,
  content_hash text,
  storage_path text,
  chunk_count integer DEFAULT 0,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  uploaded_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add uploaded_document_id to document_chunks if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_chunks' AND column_name = 'uploaded_document_id'
  ) THEN
    ALTER TABLE document_chunks ADD COLUMN uploaded_document_id uuid REFERENCES uploaded_documents(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_filename ON uploaded_documents (filename);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_file_type ON uploaded_documents (file_type);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_status ON uploaded_documents (processing_status);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_created_at ON uploaded_documents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_content_hash ON uploaded_documents (content_hash);
CREATE INDEX IF NOT EXISTS idx_document_chunks_uploaded_document_id ON document_chunks (uploaded_document_id);

-- Enable Row Level Security
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploaded_documents
CREATE POLICY "Allow public read access to uploaded documents metadata"
  ON uploaded_documents
  FOR SELECT
  TO public
  USING (true);

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

-- Create trigger for updated_at
CREATE TRIGGER update_uploaded_documents_updated_at
  BEFORE UPDATE ON uploaded_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
