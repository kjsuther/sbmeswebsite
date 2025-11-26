/*
  # Enhanced Search and Discovery System

  ## Overview
  This migration creates a comprehensive search and discovery system with:
  - Search history and analytics
  - Document tagging with hierarchical structure
  - Content recommendations and related content tracking
  - User preferences and behavior tracking
  - Full-text search optimization

  ## New Tables

  1. **search_queries** - Tracks all user searches
  2. **search_clicks** - Records search result clicks
  3. **document_tags** - Hierarchical tag system
  4. **content_tags** - Many-to-many content-tag relationship
  5. **user_recommendations** - Personalized recommendations
  6. **related_content** - Pre-computed content relationships
  7. **popular_searches** - Trending search queries
  8. **user_search_preferences** - Saved search configurations
  9. **content_views** - Document/page view tracking
  10. **search_suggestions** - Autocomplete suggestions

  ## Security
  - RLS enabled on all tables
  - Public read/write for anonymous users on search features
  - User-specific data filtered by session_id or user_id
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- SEARCH QUERIES AND HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text NOT NULL,
  query_text text NOT NULL,
  filters_applied jsonb DEFAULT '{}'::jsonb,
  results_count integer DEFAULT 0,
  search_type text DEFAULT 'global',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_queries_session ON search_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_user ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created ON search_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_text ON search_queries USING gin(to_tsvector('english', query_text));

-- ============================================================================
-- SEARCH CLICK TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS search_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query_id uuid REFERENCES search_queries(id) ON DELETE CASCADE,
  clicked_content_id uuid NOT NULL,
  clicked_content_type text NOT NULL,
  position_in_results integer,
  clicked_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_clicks_query ON search_clicks(search_query_id);
CREATE INDEX IF NOT EXISTS idx_search_clicks_content ON search_clicks(clicked_content_id, clicked_content_type);
CREATE INDEX IF NOT EXISTS idx_search_clicks_created ON search_clicks(clicked_at DESC);

-- ============================================================================
-- DOCUMENT TAGS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name text UNIQUE NOT NULL,
  parent_tag_id uuid REFERENCES document_tags(id) ON DELETE SET NULL,
  description text,
  color text DEFAULT '#3B82F6',
  icon text,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_tags_parent ON document_tags(parent_tag_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_name ON document_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_document_tags_usage ON document_tags(usage_count DESC);

-- ============================================================================
-- CONTENT TAGS (MANY-TO-MANY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  tag_id uuid REFERENCES document_tags(id) ON DELETE CASCADE,
  confidence_score real DEFAULT 1.0,
  auto_generated boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, content_type, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_content_tags_content ON content_tags(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_tags_tag ON content_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_auto ON content_tags(auto_generated);

-- ============================================================================
-- USER RECOMMENDATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  recommended_content_id uuid NOT NULL,
  recommended_content_type text NOT NULL,
  recommendation_type text NOT NULL,
  score real DEFAULT 0.0,
  reason text,
  viewed boolean DEFAULT false,
  clicked boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_user_recommendations_user ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_session ON user_recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_content ON user_recommendations(recommended_content_id, recommended_content_type);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_score ON user_recommendations(score DESC);

-- ============================================================================
-- RELATED CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS related_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_content_id uuid NOT NULL,
  source_content_type text NOT NULL,
  related_content_id uuid NOT NULL,
  related_content_type text NOT NULL,
  similarity_score real DEFAULT 0.0,
  relationship_type text NOT NULL,
  calculated_at timestamptz DEFAULT now(),
  UNIQUE(source_content_id, source_content_type, related_content_id, related_content_type, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_related_content_source ON related_content(source_content_id, source_content_type);
CREATE INDEX IF NOT EXISTS idx_related_content_score ON related_content(similarity_score DESC);

-- ============================================================================
-- POPULAR SEARCHES
-- ============================================================================

CREATE TABLE IF NOT EXISTS popular_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text text UNIQUE NOT NULL,
  search_count integer DEFAULT 1,
  last_searched_at timestamptz DEFAULT now(),
  period_start timestamptz DEFAULT date_trunc('hour', now()),
  period_end timestamptz DEFAULT date_trunc('hour', now() + interval '1 hour')
);

CREATE INDEX IF NOT EXISTS idx_popular_searches_count ON popular_searches(search_count DESC);

-- ============================================================================
-- USER SEARCH PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_search_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  preference_name text NOT NULL,
  saved_filters jsonb DEFAULT '{}'::jsonb,
  saved_query text,
  sort_preference text DEFAULT 'relevance',
  is_default boolean DEFAULT false,
  is_scheduled boolean DEFAULT false,
  schedule_frequency text,
  last_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_search_prefs_user ON user_search_preferences(user_id);

-- ============================================================================
-- CONTENT VIEWS TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text NOT NULL,
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  view_duration integer,
  source_page text,
  referrer_type text,
  viewed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_views_session ON content_views(session_id);
CREATE INDEX IF NOT EXISTS idx_content_views_content ON content_views(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_views_date ON content_views(viewed_at DESC);

-- ============================================================================
-- SEARCH SUGGESTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS search_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_text text UNIQUE NOT NULL,
  suggestion_type text DEFAULT 'query',
  category text,
  weight integer DEFAULT 1,
  synonyms text[] DEFAULT ARRAY[]::text[],
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_suggestions_weight ON search_suggestions(weight DESC);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_usage ON search_suggestions(usage_count DESC);

-- ============================================================================
-- FULL-TEXT SEARCH ENHANCEMENT
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'document_chunks' AND column_name = 'content_tsv'
  ) THEN
    ALTER TABLE document_chunks ADD COLUMN content_tsv tsvector
      GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
    CREATE INDEX idx_document_chunks_tsv ON document_chunks USING gin(content_tsv);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'content_tsv'
  ) THEN
    ALTER TABLE messages ADD COLUMN content_tsv tsvector
      GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
    CREATE INDEX idx_messages_tsv ON messages USING gin(content_tsv);
  END IF;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert search queries" ON search_queries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read search queries" ON search_queries FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert search clicks" ON search_clicks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read search clicks" ON search_clicks FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can read tags" ON document_tags FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can manage tags" ON document_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read content tags" ON content_tags FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can manage content tags" ON content_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read recommendations" ON user_recommendations FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can insert recommendations" ON user_recommendations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update recommendations" ON user_recommendations FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read related content" ON related_content FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can manage related content" ON related_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read popular searches" ON popular_searches FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can manage popular searches" ON popular_searches FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read search preferences" ON user_search_preferences FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can manage search preferences" ON user_search_preferences FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can insert content views" ON content_views FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read content views" ON content_views FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can read search suggestions" ON search_suggestions FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can manage search suggestions" ON search_suggestions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE document_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE document_tags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_usage_on_content_tag_change
  AFTER INSERT OR DELETE ON content_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER update_document_tags_updated_at
  BEFORE UPDATE ON document_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_search_preferences_updated_at
  BEFORE UPDATE ON user_search_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_suggestions_updated_at
  BEFORE UPDATE ON search_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
