/*
  # Create Vector Similarity Search Function

  Creates a PostgreSQL function to perform vector similarity search on document chunks.
  This function uses cosine distance to find the most similar document chunks to a query embedding.

  ## Function Details
  - Name: match_document_chunks
  - Parameters:
    - query_embedding: vector(1536) - The embedding vector to search for
    - match_threshold: float - Minimum similarity threshold (default 0.7)
    - match_count: int - Maximum number of results to return (default 5)
  - Returns: Set of document_chunks with similarity scores
*/

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
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
