/*
  # Create Slices Table for MES Admin

  1. New Tables
    - `slices`
      - `id` (uuid, primary key)
      - `slice_code` (text, unique) - e.g., "1A"
      - `slice_description` (text) - Description of the slice
      - `customer_journey` (text) - Customer journey narrative
      - `persona_definition` (text) - Persona details
      - `expected_result` (text) - Expected outcome description
      - `outcomes` (text) - Outcome measurements as text
      - `slice_focus` (text) - Focus area for the slice
      - `state_project_manager` (text) - State PM name
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `slices` table
    - Add policies for authenticated users
    - Add policies for anonymous users (public admin interface)
*/

CREATE TABLE IF NOT EXISTS slices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slice_code text UNIQUE NOT NULL,
  slice_description text NOT NULL,
  customer_journey text NOT NULL,
  persona_definition text NOT NULL,
  expected_result text NOT NULL,
  outcomes text NOT NULL DEFAULT '',
  slice_focus text NOT NULL,
  state_project_manager text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE slices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read slices"
  ON slices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert slices"
  ON slices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update slices"
  ON slices
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete slices"
  ON slices
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can read slices"
  ON slices
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can insert slices"
  ON slices
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update slices"
  ON slices
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous users can delete slices"
  ON slices
  FOR DELETE
  TO anon
  USING (true);