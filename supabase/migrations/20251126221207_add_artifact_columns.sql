/*
  # Add Sub-Category, Link Type, and Content Notes columns

  1. Changes
    - Add `sub_category` column to store secondary categorization
    - Add `link_type` column to store the type of link (internal, external, document, etc.)
    - Add `content_notes` column to store additional notes about the content
  
  2. Notes
    - All columns are optional (nullable)
    - Uses text type for flexibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_artifacts' AND column_name = 'sub_category'
  ) THEN
    ALTER TABLE project_artifacts ADD COLUMN sub_category text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_artifacts' AND column_name = 'link_type'
  ) THEN
    ALTER TABLE project_artifacts ADD COLUMN link_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_artifacts' AND column_name = 'content_notes'
  ) THEN
    ALTER TABLE project_artifacts ADD COLUMN content_notes text;
  END IF;
END $$;