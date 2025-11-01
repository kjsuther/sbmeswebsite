/*
  # Add State Project Manager to Slices Table

  1. Changes
    - Add `state_project_manager` column to `slices` table
    - This field is optional (not required)
    - Stores the name of the state project manager for each slice
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slices' AND column_name = 'state_project_manager'
  ) THEN
    ALTER TABLE slices ADD COLUMN state_project_manager text;
  END IF;
END $$;