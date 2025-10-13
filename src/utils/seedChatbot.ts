import { supabase } from '../lib/supabase';
import { generateEmbedding } from '../lib/openai';
import { createDocumentChunks } from './contentExtractor';
import { DocumentChunk } from '../lib/chatbot-types';

export const seedDocumentChunks = async (
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ success: boolean; message: string; chunksProcessed: number }> => {
  try {
    onProgress?.(0, 0, 'Extracting website content...');

    const chunks = createDocumentChunks();
    const total = chunks.length;

    onProgress?.(0, total, `Extracted ${total} chunks from website content`);

    const { data: existingChunks } = await supabase
      .from('document_chunks')
      .select('id')
      .limit(1);

    if (existingChunks && existingChunks.length > 0) {
      onProgress?.(0, total, 'Clearing existing website content chunks...');
      await supabase
        .from('document_chunks')
        .delete()
        .is('uploaded_document_id', null);
    }

    let processed = 0;
    const batchSize = 5;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (chunk) => {
          try {
            const embedding = await generateEmbedding(chunk.content);

            await supabase.from('document_chunks').insert({
              content: chunk.content,
              embedding: embedding,
              metadata: chunk.metadata,
              source_page: chunk.source_page,
              source_section: chunk.source_section,
              document_name: chunk.document_name,
              chunk_index: chunk.chunk_index,
            });

            processed++;
            onProgress?.(processed, total, `Processing embeddings: ${processed}/${total}`);
          } catch (error) {
            console.error(`Error processing chunk ${chunk.chunk_index}:`, error);
          }
        })
      );

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return {
      success: true,
      message: `Successfully processed ${processed} chunks`,
      chunksProcessed: processed,
    };
  } catch (error) {
    console.error('Error seeding document chunks:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      chunksProcessed: 0,
    };
  }
};

export const getChunkStats = async (): Promise<{
  totalChunks: number;
  chunksByPage: Record<string, number>;
}> => {
  const { data, error } = await supabase
    .from('document_chunks')
    .select('source_page');

  if (error || !data) {
    return { totalChunks: 0, chunksByPage: {} };
  }

  const chunksByPage: Record<string, number> = {};
  data.forEach(chunk => {
    const page = chunk.source_page || 'Unknown';
    chunksByPage[page] = (chunksByPage[page] || 0) + 1;
  });

  return {
    totalChunks: data.length,
    chunksByPage,
  };
};
