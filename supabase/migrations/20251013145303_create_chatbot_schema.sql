/*
  # AI Chatbot with RAG - Database Schema

  ## Overview
  This migration creates the complete database schema for an AI-powered chatbot with Retrieval-Augmented Generation (RAG) capabilities for the MES Challenge website.

  ## Tables Created

  1. **document_chunks**
     - Stores text chunks from website content and uploaded documents
     - Contains vector embeddings for semantic search
     - Includes metadata for filtering and source tracking
     - Fields: id, content, embedding (vector), metadata, source_page, source_section, document_name, chunk_index, created_at, updated_at

  2. **conversations**
     - Stores chat conversation sessions
     - Tracks user sessions and conversation metadata
     - Fields: id, session_id, title, created_at, updated_at

  3. **messages**
     - Stores individual chat messages within conversations
     - Links to conversations and includes source citations
     - Fields: id, conversation_id, role, content, sources, feedback_rating, feedback_text, created_at

  4. **chat_feedback**
     - Stores detailed user feedback on bot responses
     - Enables quality improvement tracking
     - Fields: id, message_id, rating, feedback_text, created_at

  5. **admin_config**
     - Stores admin configuration including password hash
     - Fields: id, key, value, created_at, updated_at

  ## Security
  - RLS enabled on all tables
  - Public read access to document_chunks for search
  - Public write access to conversations and messages for anonymous users
  - Admin_config restricted from public access
  - Feedback table allows public inserts

  ## Indexes
  - Vector index on document_chunks.embedding for fast similarity search
  - GIN index on document_chunks.metadata for metadata filtering
  - Standard indexes on foreign keys and commonly queried fields
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'::jsonb,
  source_page text,
  source_section text,
  document_name text,
  chunk_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  sources jsonb DEFAULT '[]'::jsonb,
  feedback_rating text CHECK (feedback_rating IN ('positive', 'negative')),
  feedback_text text,
  created_at timestamptz DEFAULT now()
);

-- Create chat_feedback table
CREATE TABLE IF NOT EXISTS chat_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('positive', 'negative')),
  feedback_text text,
  created_at timestamptz DEFAULT now()
);

-- Create admin_config table
CREATE TABLE IF NOT EXISTS admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance

-- Vector similarity search index (HNSW for fast approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks 
  USING hnsw (embedding vector_cosine_ops);

-- Metadata search index
CREATE INDEX IF NOT EXISTS idx_document_chunks_metadata ON document_chunks USING gin (metadata);

-- Source page index for filtering
CREATE INDEX IF NOT EXISTS idx_document_chunks_source_page ON document_chunks (source_page);

-- Conversation session index
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations (session_id);

-- Message conversation index
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id);

-- Message feedback index
CREATE INDEX IF NOT EXISTS idx_chat_feedback_message_id ON chat_feedback (message_id);

-- Created at indexes for sorting
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);

-- Enable Row Level Security
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_chunks
CREATE POLICY "Allow public read access to document chunks"
  ON document_chunks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert on document chunks"
  ON document_chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on document chunks"
  ON document_chunks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on document chunks"
  ON document_chunks
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for conversations
CREATE POLICY "Allow public read access to conversations"
  ON conversations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on conversations"
  ON conversations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on conversations"
  ON conversations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on conversations"
  ON conversations
  FOR DELETE
  TO public
  USING (true);

-- RLS Policies for messages
CREATE POLICY "Allow public read access to messages"
  ON messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on messages"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on messages"
  ON messages
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on messages"
  ON messages
  FOR DELETE
  TO public
  USING (true);

-- RLS Policies for chat_feedback
CREATE POLICY "Allow public read access to feedback"
  ON chat_feedback
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on feedback"
  ON chat_feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for admin_config (restricted)
CREATE POLICY "Allow authenticated read access to admin config"
  ON admin_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated write access to admin config"
  ON admin_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_document_chunks_updated_at
  BEFORE UPDATE ON document_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_config_updated_at
  BEFORE UPDATE ON admin_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
