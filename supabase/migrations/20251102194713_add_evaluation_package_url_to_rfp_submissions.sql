/*
  # Add Evaluation Package URL to RFP Submissions

  1. Changes
    - Add `evaluation_package_url` column to `rfp_submissions` table to store the URL of the generated evaluation package PDF

  2. Details
    - Column: `evaluation_package_url` (text, nullable)
    - This will store the public URL of the evaluation package PDF in Supabase storage
    - Allows users to access both the contract PDF and evaluation package PDF separately

  3. Notes
    - Uses IF NOT EXISTS pattern to prevent errors on re-run
    - No changes to existing RLS policies needed
*/

-- Add evaluation_package_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rfp_submissions' AND column_name = 'evaluation_package_url'
  ) THEN
    ALTER TABLE rfp_submissions ADD COLUMN evaluation_package_url text;
  END IF;
END $$;