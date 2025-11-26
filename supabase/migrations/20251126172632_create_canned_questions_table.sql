/*
  # Create Canned Questions Table

  1. New Tables
    - `canned_questions`
      - `id` (uuid, primary key) - Unique identifier for each question
      - `question_text` (text) - The actual question content
      - `display_order` (integer) - Sort order for displaying questions
      - `is_active` (boolean) - Flag to enable/disable questions
      - `created_at` (timestamptz) - Timestamp when question was created
      - `updated_at` (timestamptz) - Timestamp when question was last updated

  2. Security
    - Enable RLS on `canned_questions` table
    - Add policy for public read access to active questions
    - Add policy for anonymous insert/update/delete (admin functionality)

  3. Initial Data
    - Seed table with existing hardcoded questions from the application
*/

CREATE TABLE IF NOT EXISTS canned_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for efficient querying of active questions
CREATE INDEX IF NOT EXISTS idx_canned_questions_active_order
  ON canned_questions (is_active, display_order)
  WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE canned_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active canned questions
CREATE POLICY "Anyone can read active canned questions"
  ON canned_questions
  FOR SELECT
  USING (is_active = true);

-- Policy: Allow anonymous users to read all questions (for admin dashboard)
CREATE POLICY "Anonymous can read all canned questions"
  ON canned_questions
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow anonymous users to insert questions (for admin dashboard)
CREATE POLICY "Anonymous can insert canned questions"
  ON canned_questions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous users to update questions (for admin dashboard)
CREATE POLICY "Anonymous can update canned questions"
  ON canned_questions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anonymous users to delete questions (for admin dashboard)
CREATE POLICY "Anonymous can delete canned questions"
  ON canned_questions
  FOR DELETE
  TO anon
  USING (true);

-- Seed with existing questions from the application
INSERT INTO canned_questions (question_text, display_order, is_active) VALUES
  ('What is the Great Bake Off?', 1, true),
  ('How do I submit a slice RFP response?', 2, true),
  ('What are the evaluation criteria for vendors?', 3, true),
  ('What''s the difference between a slice and a layer?', 4, true),
  ('When are RFP submissions evaluated?', 5, true),
  ('What is the budget for the project?', 6, true)
ON CONFLICT (id) DO NOTHING;