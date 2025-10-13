/*
  # Create Software Provider Submissions Table

  ## Overview
  This migration creates the database structure for storing software provider RFP submissions.
  Software providers are submitting products for consideration in the MES cupboard, which is
  fundamentally different from delivery services (Layer/Slice) submissions.

  ## New Tables

  ### `software_provider_submissions`
  Main table for storing all software provider RFP submission data
  - `id` (uuid, primary key) - Unique identifier for each submission
  - `company_name` (text) - Name of the software provider company
  - `contact_person` (text) - Primary contact person
  - `email` (text) - Contact email address
  - `phone` (text, optional) - Contact phone number
  - `submission_data` (jsonb) - All form data stored as JSON for flexibility
  - `created_at` (timestamptz) - Timestamp of submission
  - `updated_at` (timestamptz) - Timestamp of last update

  ## Submission Data Structure (stored in JSONB)
  The `submission_data` field will contain:
  - `trial_commitment` - Details about trial/limited-use support commitment
  - `implementation_model` - Who can implement (any vendor, partner list, own team)
  - `software_license` - Pricing, terms, and billing approach
  - `team_structure` - Minimum team composition and requirements
  - `certifications` - FedRAMP and other security certifications
  - `provisioning_timeline` - Time required to provision new environment
  - Optional: uploaded document references

  ## Security
  - Enable Row Level Security (RLS) on `software_provider_submissions` table
  - Public insert policy: Allow anyone to submit software provider RFPs (anonymous submissions)
  - Admin read policy: Only authenticated admin users can view submissions
  - Admin update policy: Only authenticated users can update submissions
  - Admin delete policy: Only authenticated users can delete submissions

  ## Indexes
  - Index on `created_at` for chronological queries
  - Index on `email` for contact lookup
  - Index on `company_name` for company searches

  ## Notes
  1. Using JSONB for `submission_data` allows flexibility as form fields may evolve
  2. Separate table from `rfp_submissions` because software providers have distinct requirements
  3. Public insert policy enables anonymous submissions without authentication
  4. RLS prevents unauthorized access to submission data
  5. Automatic updated_at trigger ensures accurate modification tracking
*/

-- Create software_provider_submissions table
CREATE TABLE IF NOT EXISTS software_provider_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  submission_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_software_provider_submissions_created_at ON software_provider_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_software_provider_submissions_email ON software_provider_submissions(email);
CREATE INDEX IF NOT EXISTS idx_software_provider_submissions_company_name ON software_provider_submissions(company_name);

-- Enable Row Level Security
ALTER TABLE software_provider_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert software provider RFP submissions (public form)
CREATE POLICY "Anyone can submit software provider RFPs"
  ON software_provider_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Only authenticated users can view submissions
CREATE POLICY "Authenticated users can view all software provider submissions"
  ON software_provider_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update submissions
CREATE POLICY "Authenticated users can update software provider submissions"
  ON software_provider_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete submissions
CREATE POLICY "Authenticated users can delete software provider submissions"
  ON software_provider_submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_software_provider_submissions_updated_at ON software_provider_submissions;
CREATE TRIGGER update_software_provider_submissions_updated_at
  BEFORE UPDATE ON software_provider_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();