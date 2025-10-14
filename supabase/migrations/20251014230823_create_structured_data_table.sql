/*
  # Create Structured Data Table for Excel/CSV Data

  1. New Tables
    - `structured_data`
      - `id` (uuid, primary key)
      - `uploaded_document_id` (uuid, foreign key to uploaded_documents)
      - `sheet_name` (text) - for multi-sheet Excel files
      - `row_number` (integer) - original row number in the spreadsheet
      - `headers` (jsonb) - column headers as array
      - `values` (jsonb) - row values as array
      - `data` (jsonb) - key-value pairs of header:value
      - `searchable_text` (text) - semantic text for full-text search
      - `created_at` (timestamptz)

    - Indexes for efficient querying
      - GIN index on `data` for JSONB queries
      - Full-text search index on `searchable_text`
      - Index on `uploaded_document_id` for joins

  2. Security
    - Enable RLS on `structured_data` table
    - Allow public SELECT access (same as document_chunks)
    - Allow authenticated INSERT/UPDATE/DELETE
*/

-- Create structured_data table
CREATE TABLE IF NOT EXISTS structured_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_document_id uuid REFERENCES uploaded_documents(id) ON DELETE CASCADE,
  sheet_name text,
  row_number integer NOT NULL,
  headers jsonb NOT NULL DEFAULT '[]'::jsonb,
  values jsonb NOT NULL DEFAULT '[]'::jsonb,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  searchable_text text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_structured_data_document_id 
  ON structured_data(uploaded_document_id);

CREATE INDEX IF NOT EXISTS idx_structured_data_data_gin 
  ON structured_data USING gin(data);

CREATE INDEX IF NOT EXISTS idx_structured_data_searchable_text 
  ON structured_data USING gin(to_tsvector('english', searchable_text));

-- Enable RLS
ALTER TABLE structured_data ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT access (read-only for all users)
CREATE POLICY "Allow public read access to structured_data"
  ON structured_data
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert to structured_data"
  ON structured_data
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete from structured_data"
  ON structured_data
  FOR DELETE
  TO authenticated
  USING (true);
