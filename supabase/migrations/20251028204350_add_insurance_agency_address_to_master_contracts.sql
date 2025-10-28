/*
  # Add Insurance Agency Address Field

  1. Changes
    - Add `insurance_agency_address` column to `master_contracts` table
    - Field stores the insurance agency mailing address as required in Section 2.2 of the master contract

  2. Notes
    - This is a non-breaking change (nullable field with default)
    - Existing contracts will have NULL for this field until updated
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'master_contracts' AND column_name = 'insurance_agency_address'
  ) THEN
    ALTER TABLE master_contracts ADD COLUMN insurance_agency_address text;
  END IF;
END $$;