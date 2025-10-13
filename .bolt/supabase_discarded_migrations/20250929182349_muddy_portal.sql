/*
  # Create feedback submissions table

  1. New Tables
    - `feedback_submissions`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text)
      - `email` (text)
      - `category` (text)
      - `message` (text)

  2. Security
    - Enable RLS on `feedback_submissions` table
    - Add policy for public insert access (no authentication required for feedback)
*/

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  category text NOT NULL,
  message text NOT NULL
);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public form)
CREATE POLICY "Anyone can submit feedback"
  ON feedback_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all feedback (for admin purposes)
CREATE POLICY "Authenticated users can read feedback"
  ON feedback_submissions
  FOR SELECT
  TO authenticated
  USING (true);