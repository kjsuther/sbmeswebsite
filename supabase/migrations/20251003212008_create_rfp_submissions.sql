/*
  # RFP Submissions Database Schema

  ## Overview
  This migration creates the database structure for storing Layer Cake and Slice Cake RFP form submissions.

  ## New Tables

  ### `rfp_submissions`
  Main table for storing all RFP submission data
  - `id` (uuid, primary key) - Unique identifier for each submission
  - `rfp_type` (text) - Type of RFP: 'layer' or 'slice'
  - `company_name` (text) - Name of the company submitting the RFP
  - `contact_person` (text) - Primary contact person
  - `email` (text) - Contact email address
  - `phone` (text, optional) - Contact phone number
  - `submission_data` (jsonb) - All form data stored as JSON for flexibility
  - `created_at` (timestamptz) - Timestamp of submission
  - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
  - Enable Row Level Security (RLS) on `rfp_submissions` table
  - Public insert policy: Allow anyone to submit RFPs (anonymous submissions)
  - Admin read policy: Only authenticated admin users can view submissions

  ## Indexes
  - Index on `rfp_type` for filtering by RFP type
  - Index on `created_at` for chronological queries
  - Index on `email` for contact lookup

  ## Notes
  1. Using JSONB for `submission_data` allows flexibility as form fields may evolve
  2. Public insert policy enables anonymous submissions without authentication
  3. RLS prevents unauthorized access to submission data
*/

-- Create rfp_submissions table
CREATE TABLE IF NOT EXISTS rfp_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_type text NOT NULL CHECK (rfp_type IN ('layer', 'slice')),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  submission_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_rfp_submissions_rfp_type ON rfp_submissions(rfp_type);
CREATE INDEX IF NOT EXISTS idx_rfp_submissions_created_at ON rfp_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfp_submissions_email ON rfp_submissions(email);

-- Enable Row Level Security
ALTER TABLE rfp_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert RFP submissions (public form)
CREATE POLICY "Anyone can submit RFPs"
  ON rfp_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Only authenticated users can view submissions
CREATE POLICY "Authenticated users can view all submissions"
  ON rfp_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update submissions
CREATE POLICY "Authenticated users can update submissions"
  ON rfp_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete submissions
CREATE POLICY "Authenticated users can delete submissions"
  ON rfp_submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_rfp_submissions_updated_at ON rfp_submissions;
CREATE TRIGGER update_rfp_submissions_updated_at
  BEFORE UPDATE ON rfp_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();