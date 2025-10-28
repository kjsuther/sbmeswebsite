/*
  # Make solicitation_id nullable in master_contracts

  This migration allows master_contracts to be created without a foreign key reference
  to the solicitations table, since we're hardcoding the solicitation information.

  1. Changes
    - Drop the foreign key constraint on master_contracts.solicitation_id
    - The column is already nullable, so no change needed there
*/

-- Drop the foreign key constraint
ALTER TABLE master_contracts 
DROP CONSTRAINT IF EXISTS master_contracts_solicitation_id_fkey;