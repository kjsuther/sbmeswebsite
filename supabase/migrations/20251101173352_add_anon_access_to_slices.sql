/*
  # Add anonymous access to slices table

  1. Changes
    - Add SELECT policy for anonymous users to read slices
    - Add INSERT policy for anonymous users to create slices
    - Add UPDATE policy for anonymous users to modify slices
    - Add DELETE policy for anonymous users to remove slices
  
  2. Security
    - Allows public access to slices table for admin interface
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slices' 
    AND policyname = 'Anonymous users can read slices'
  ) THEN
    CREATE POLICY "Anonymous users can read slices"
      ON slices
      FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slices' 
    AND policyname = 'Anonymous users can insert slices'
  ) THEN
    CREATE POLICY "Anonymous users can insert slices"
      ON slices
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slices' 
    AND policyname = 'Anonymous users can update slices'
  ) THEN
    CREATE POLICY "Anonymous users can update slices"
      ON slices
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'slices' 
    AND policyname = 'Anonymous users can delete slices'
  ) THEN
    CREATE POLICY "Anonymous users can delete slices"
      ON slices
      FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;
