/*
  # Create Work Order Contracts Table

  1. New Tables
    - `work_order_contracts`
      - `id` (uuid, primary key)
      - `company_name` (text) - Contractor company name
      - `contract_date` (date) - Effective date of contract
      - `slice_number_description` (text) - Slice being delivered
      - `monthly_delivery_cost` (numeric) - Monthly payment amount
      - `cost_of_delivering` (numeric) - Total cost for slice completion
      - `calculated_total` (numeric) - Total contract obligation
      - `state_project_manager` (text) - State's project manager
      - `delivery_contact_name` (text) - Contractor's project manager
      - `pdf_url` (text) - URL to generated PDF in storage
      - `submission_date` (timestamptz) - When contract was submitted
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `work_order_contracts` table
    - Add policy for public/anonymous insert access
    - Add policy for public/anonymous read access
*/

CREATE TABLE IF NOT EXISTS work_order_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contract_date date NOT NULL DEFAULT CURRENT_DATE,
  slice_number_description text NOT NULL,
  monthly_delivery_cost numeric(12, 2) NOT NULL,
  cost_of_delivering numeric(12, 2) NOT NULL,
  calculated_total numeric(12, 2) NOT NULL,
  state_project_manager text NOT NULL,
  delivery_contact_name text NOT NULL,
  pdf_url text,
  submission_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE work_order_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert on work_order_contracts"
  ON work_order_contracts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read on work_order_contracts"
  ON work_order_contracts
  FOR SELECT
  TO anon
  USING (true);