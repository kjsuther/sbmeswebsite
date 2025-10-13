/*
  # Update Vector Search Function to Include Document ID

  ## Overview
  Updates the match_document_chunks function to include the uploaded_document_id
  field in the results. This is needed so the chatbot can provide downloadable
  links to source documents.

  ## Changes
  - Drop the existing function
  - Recreate with uploaded_document_id in the RETURNS TABLE
  - Add uploaded_document_id to the SELECT query
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS match_document_chunks(vector, float, int);

-- Recreate with uploaded_document_id included
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  embedding vector(1536),
  metadata jsonb,
  source_page text,
  source_section text,
  document_name text,
  uploaded_document_id uuid,
  chunk_index integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.embedding,
    dc.metadata,
    dc.source_page,
    dc.source_section,
    dc.document_name,
    dc.uploaded_document_id,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
