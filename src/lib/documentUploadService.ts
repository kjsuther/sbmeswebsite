import { supabase } from './supabase';
import { generateEmbedding } from './openai';
import { processDocument, calculateFileHash, isSupportedFileType } from '../utils/documentProcessor';
import { chunkText } from '../utils/contentExtractor';

export interface UploadedDocument {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  content_hash?: string;
  chunk_count: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UploadProgress {
  stage: 'validating' | 'hashing' | 'extracting' | 'chunking' | 'embedding' | 'saving' | 'completed' | 'error';
  message: string;
  progress?: number;
  total?: number;
}

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!isSupportedFileType(file.name)) {
    return {
      valid: false,
      error: `File type not supported. Please upload: PDF, PowerPoint, plain text, or markdown`,
    };
  }

  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' };
  }

  return { valid: true };
};

export const uploadDocument = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; documentId?: string; error?: string }> => {
  try {
    onProgress?.({ stage: 'validating', message: 'Validating file...' });

    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    onProgress?.({ stage: 'hashing', message: 'Calculating file hash...' });
    const contentHash = await calculateFileHash(file);

    const { data: existingDoc } = await supabase
      .from('uploaded_documents')
      .select('id, filename')
      .eq('content_hash', contentHash)
      .maybeSingle();

    if (existingDoc) {
      return {
        success: false,
        error: `This document has already been uploaded as "${existingDoc.filename}"`,
      };
    }

    const { data: document, error: insertError } = await supabase
      .from('uploaded_documents')
      .insert({
        filename: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        content_hash: contentHash,
        processing_status: 'processing',
        uploaded_by: 'admin',
      })
      .select()
      .single();

    if (insertError || !document) {
      throw new Error('Failed to create document record');
    }

    try {
      onProgress?.({ stage: 'extracting', message: 'Extracting text from document...' });
      const { text, metadata } = await processDocument(file);

      onProgress?.({ stage: 'chunking', message: 'Splitting document into chunks...' });
      const textChunks = chunkText(text);

      onProgress?.({
        stage: 'embedding',
        message: 'Generating embeddings...',
        progress: 0,
        total: textChunks.length,
      });

      let processedChunks = 0;
      const batchSize = 5;

      for (let i = 0; i < textChunks.length; i += batchSize) {
        const batch = textChunks.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (chunk, batchIndex) => {
            const chunkIndex = i + batchIndex;
            const embedding = await generateEmbedding(chunk);

            await supabase.from('document_chunks').insert({
              content: chunk,
              embedding: embedding,
              metadata: { ...metadata, originalFilename: file.name },
              source_page: `/documents/${file.name}`,
              document_name: file.name,
              chunk_index: chunkIndex,
              uploaded_document_id: document.id,
            });

            processedChunks++;
            onProgress?.({
              stage: 'embedding',
              message: `Processing chunk ${processedChunks}/${textChunks.length}...`,
              progress: processedChunks,
              total: textChunks.length,
            });
          })
        );

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      onProgress?.({ stage: 'saving', message: 'Finalizing upload...' });

      await supabase
        .from('uploaded_documents')
        .update({
          processing_status: 'completed',
          chunk_count: textChunks.length,
          metadata: metadata,
        })
        .eq('id', document.id);

      onProgress?.({ stage: 'completed', message: 'Document uploaded successfully!' });

      return { success: true, documentId: document.id };
    } catch (processingError) {
      await supabase
        .from('uploaded_documents')
        .update({
          processing_status: 'failed',
          error_message: processingError instanceof Error ? processingError.message : 'Unknown error',
        })
        .eq('id', document.id);

      throw processingError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    onProgress?.({ stage: 'error', message: errorMessage });
    return { success: false, error: errorMessage };
  }
};

export const getUploadedDocuments = async (): Promise<UploadedDocument[]> => {
  const { data, error } = await supabase
    .from('uploaded_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching uploaded documents:', error);
    return [];
  }

  return data || [];
};

export const deleteDocument = async (documentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('uploaded_documents').delete().eq('id', documentId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete document';
    return { success: false, error: errorMessage };
  }
};

export const getDocumentStats = async (): Promise<{
  totalDocuments: number;
  totalChunks: number;
  byFileType: Record<string, number>;
  byStatus: Record<string, number>;
}> => {
  const { data, error } = await supabase.from('uploaded_documents').select('file_type, processing_status, chunk_count');

  if (error || !data) {
    return {
      totalDocuments: 0,
      totalChunks: 0,
      byFileType: {},
      byStatus: {},
    };
  }

  const stats = {
    totalDocuments: data.length,
    totalChunks: data.reduce((sum, doc) => sum + (doc.chunk_count || 0), 0),
    byFileType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  };

  data.forEach(doc => {
    const fileType = doc.file_type || 'unknown';
    stats.byFileType[fileType] = (stats.byFileType[fileType] || 0) + 1;

    const status = doc.processing_status || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
  });

  return stats;
};
