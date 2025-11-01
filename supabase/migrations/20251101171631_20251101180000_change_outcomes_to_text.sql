/*
  # Change outcomes column from array to text

  1. Changes
    - Alter `outcomes` column in `slices` table from text[] to text
    - This allows storing outcomes as a single text field like other fields

  2. Notes
    - Existing array data will be converted to text representation
*/

ALTER TABLE slices 
ALTER COLUMN outcomes TYPE text 
USING array_to_string(outcomes, E'\n');

ALTER TABLE slices 
ALTER COLUMN outcomes SET DEFAULT '';