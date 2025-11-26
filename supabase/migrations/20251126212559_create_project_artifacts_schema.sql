/*
  # Project Artifacts Management System

  ## Overview
  This migration creates a complete admin-only project artifacts management system for organizing
  and searching team project links and resources.

  ## New Tables

  1. **artifact_categories** - Hierarchical category system for organizing artifacts
     - `id` (uuid, primary key)
     - `name` (text, unique, required) - Category name
     - `icon` (text) - Lucide icon name
     - `color` (text) - Hex color for badges
     - `description` (text) - Category description
     - `display_order` (integer) - Sort order
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **project_artifacts** - Core artifacts table storing all project links and resources
     - `id` (uuid, primary key)
     - `title` (text, required) - Artifact title
     - `description` (text) - Detailed description
     - `url` (text, required) - External link URL
     - `category_id` (uuid, foreign key) - Links to artifact_categories
     - `tags` (text[]) - Array of tags for filtering
     - `file_type` (text) - File type (Excel, Word, PDF, etc.)
     - `owner` (text) - Owner or responsible person
     - `metadata` (jsonb) - Additional flexible metadata
     - `created_by` (uuid) - Admin who created
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  3. **artifact_access_logs** - Track artifact views and modifications
     - `id` (uuid, primary key)
     - `artifact_id` (uuid, foreign key)
     - `admin_id` (uuid) - Admin who accessed
     - `action_type` (text) - view, edit, delete, etc.
     - `accessed_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Authenticated-only access for all operations
  - Admin authentication required via existing adminAuth system

  ## Indexes
  - Full-text search on title and description
  - Indexes on category_id, tags, file_type for fast filtering
  - Index on created_at for sorting
*/

-- ============================================================================
-- ARTIFACT CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS artifact_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text DEFAULT 'folder',
  color text DEFAULT '#3B82F6',
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifact_categories_order ON artifact_categories(display_order);

-- ============================================================================
-- PROJECT ARTIFACTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  category_id uuid REFERENCES artifact_categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  file_type text,
  owner text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_artifacts_category ON project_artifacts(category_id);
CREATE INDEX IF NOT EXISTS idx_project_artifacts_tags ON project_artifacts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_project_artifacts_file_type ON project_artifacts(file_type);
CREATE INDEX IF NOT EXISTS idx_project_artifacts_created ON project_artifacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_artifacts_title_search ON project_artifacts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_project_artifacts_desc_search ON project_artifacts USING gin(to_tsvector('english', coalesce(description, '')));

-- ============================================================================
-- ARTIFACT ACCESS LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS artifact_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id uuid REFERENCES project_artifacts(id) ON DELETE CASCADE,
  admin_id uuid,
  action_type text NOT NULL,
  accessed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifact_access_logs_artifact ON artifact_access_logs(artifact_id);
CREATE INDEX IF NOT EXISTS idx_artifact_access_logs_admin ON artifact_access_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_artifact_access_logs_date ON artifact_access_logs(accessed_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE artifact_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifact_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read categories"
  ON artifact_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON artifact_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read artifacts"
  ON project_artifacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert artifacts"
  ON project_artifacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update artifacts"
  ON project_artifacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete artifacts"
  ON project_artifacts FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read access logs"
  ON artifact_access_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert access logs"
  ON artifact_access_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artifact_categories_updated_at
  BEFORE UPDATE ON artifact_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_artifacts_updated_at
  BEFORE UPDATE ON project_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DEFAULT CATEGORIES
-- ============================================================================

INSERT INTO artifact_categories (name, icon, color, description, display_order) VALUES
  ('Strategy Documents', 'target', '#8B5CF6', 'Strategic planning documents and roadmaps', 1),
  ('Technical Specifications', 'code', '#3B82F6', 'Technical specs, architecture docs, and system designs', 2),
  ('RFP Documents', 'file-text', '#10B981', 'RFP submissions, proposals, and related documents', 3),
  ('Process Guidelines', 'workflow', '#F59E0B', 'Process documentation, SOPs, and guidelines', 4),
  ('Deliverables', 'package', '#EF4444', 'Project deliverables and outputs', 5),
  ('Training Materials', 'book-open', '#06B6D4', 'Training guides, tutorials, and learning resources', 6),
  ('Reference Links', 'link', '#6B7280', 'General reference materials and external resources', 7)
ON CONFLICT (name) DO NOTHING;
