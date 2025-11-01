/*
  # Add submission PDF URL column to rfp_submissions table

  1. Changes
    - Add `submission_pdf_url` column to `rfp_submissions` table
      - Stores the URL of the generated PDF document
      - Nullable field (not required for old submissions)

  2. Security
    - No RLS changes needed (table already has RLS disabled)
*/

-- Add submission_pdf_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rfp_submissions' AND column_name = 'submission_pdf_url'
  ) THEN
    ALTER TABLE rfp_submissions ADD COLUMN submission_pdf_url text;
  END IF;
END $$;