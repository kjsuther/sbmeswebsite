import { supabase } from './supabase';
import { generateEmbedding, generateChatResponse, generateConversationTitle } from './openai';
import { DocumentChunk, Message, Conversation, ChatRequest, ChatResponse } from './chatbot-types';
import { hybridSearch, extractVendorList } from './hybridSearchService';
import { analyzeStructuredData } from './structuredDataAnalyzer';
import { detectVideoContent } from '../utils/videoContentDetector';

const SIMILARITY_THRESHOLD = 0.1;
const MAX_CONTEXT_CHUNKS = 25;

const extractVideoFromChunk = (chunk: DocumentChunk): { url: string; title: string } | null => {
  if (!chunk.document_name?.endsWith('.md')) {
    return null;
  }

  const videoMetadata = detectVideoContent(chunk.content);
  if (videoMetadata && videoMetadata.url) {
    return {
      url: videoMetadata.url,
      title: videoMetadata.title
    };
  }

  return null;
};

export const searchSimilarChunks = async (query: string, limit: number = MAX_CONTEXT_CHUNKS): Promise<DocumentChunk[]> => {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: SIMILARITY_THRESHOLD,
      match_count: limit,
    });

    if (error) {
      console.error('Error searching similar chunks:', error);

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('document_chunks')
        .select('*')
        .limit(limit);

      if (fallbackError) throw fallbackError;
      console.log('Using fallback data, first chunk:', fallbackData?.[0]);
      return fallbackData || [];
    }

    console.log('Query:', query);
    console.log('Similarity threshold:', SIMILARITY_THRESHOLD);
    console.log('Database returned chunks:', data?.length);
    if (data && data.length > 0) {
      console.log('First chunk similarity:', data[0].similarity);
      console.log('First chunk content preview:', data[0].content?.substring(0, 100));
    }

    if (!data || data.length === 0) {
      console.warn('No chunks found with threshold', SIMILARITY_THRESHOLD, 'trying with lower threshold...');

      const { data: relaxedData } = await supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.05,
        match_count: limit,
      });

      if (relaxedData && relaxedData.length > 0) {
        console.log('Found', relaxedData.length, 'chunks with relaxed threshold (0.05)');
        return relaxedData;
      }
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchSimilarChunks:', error);
    return [];
  }
};

export const createOrGetConversation = async (sessionId: string, conversationId?: string): Promise<string> => {
  if (conversationId) {
    const { data } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .single();

    if (data) return conversationId;
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      session_id: sessionId,
      title: 'New Conversation',
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
  try {
    const title = await generateConversationTitle(firstMessage);
    await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);
  } catch (error) {
    console.error('Error updating conversation title:', error);
  }
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const saveMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  sources?: Array<{ page: string; section?: string; relevance: number }>
): Promise<string> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      sources: sources || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const processUserMessage = async (
  request: ChatRequest,
  onStream?: (chunk: string) => void
): Promise<ChatResponse> => {
  const conversationId = await createOrGetConversation(request.session_id, request.conversation_id);

  const previousMessages = await getConversationMessages(conversationId);
  const isFirstMessage = previousMessages.filter(m => m.role === 'user').length === 0;

  const userMessageId = await saveMessage(conversationId, 'user', request.message);

  if (isFirstMessage) {
    updateConversationTitle(conversationId, request.message);
  }

  console.log('=== CHECKING STRUCTURED DATA ANALYZER ===');
  const structuredAnalysis = await analyzeStructuredData(request.message);

  if (structuredAnalysis) {
    console.log('Structured data analysis found direct answer:', structuredAnalysis.answer);

    const messageId = await saveMessage(conversationId, 'assistant', structuredAnalysis.answer, [{
      page: 'Final RFI Response List.xlsx',
      section: 'Company Size Category Analysis',
      relevance: 1.0,
      document_name: 'Final RFI Response List.xlsx',
      storage_path: '/documents/Final RFI Response List.xlsx',
      cited: true,
      sourceNumber: 1
    }]);

    return {
      message: structuredAnalysis.answer,
      conversation_id: conversationId,
      sources: [{
        page: 'Final RFI Response List.xlsx',
        section: 'Company Size Category Analysis',
        relevance: 1.0,
        document_name: 'Final RFI Response List.xlsx',
        storage_path: '/documents/Final RFI Response List.xlsx',
        cited: true,
        sourceNumber: 1
      }],
      message_id: messageId,
    };
  }

  console.log('=== USING HYBRID SEARCH ===');
  const hybridResults = await hybridSearch(request.message, {
    vectorLimit: 20,
    structuredLimit: 50,
    similarityThreshold: SIMILARITY_THRESHOLD,
    includeStructured: true
  });

  console.log(`Hybrid search returned ${hybridResults.length} results`);
  console.log(`- Vector results: ${hybridResults.filter(r => r.type === 'vector').length}`);
  console.log(`- Structured results: ${hybridResults.filter(r => r.type === 'structured').length}`);

  const relevantChunks: DocumentChunk[] = hybridResults.map(result => ({
    id: result.id,
    content: result.content,
    similarity: result.similarity,
    metadata: result.metadata,
    source_page: result.source_page || '',
    document_name: result.document_name || '',
    uploaded_document_id: result.uploaded_document_id || null,
    storage_path: result.storage_path || null
  }));

  let vendorListContext = '';
  const vendors = await extractVendorList(hybridResults);
  if (vendors.length > 0) {
    vendorListContext = `\n\nLARGE VENDORS WHO RESPONDED TO THE RFI:\n${vendors.join('\n')}`;
    console.log(`=== EXTRACTED ${vendors.length} LARGE VENDORS ===`);
    console.log(vendorListContext);
  }

  console.log('=== CHUNKS RETURNED FROM SEARCH ===');
  console.log('Number of chunks:', relevantChunks.length);
  relevantChunks.forEach((chunk, idx) => {
    console.log(`Chunk ${idx}:`, {
      document_name: chunk.document_name,
      uploaded_document_id: chunk.uploaded_document_id,
      source_page: chunk.source_page,
      similarity: chunk.similarity,
      content_preview: chunk.content?.substring(0, 100)
    });
  });

  const uniqueSourcesForContext = new Map<string, { source: string; number: number; chunks: string[] }>();
  relevantChunks.forEach((chunk, index) => {
    const key = chunk.uploaded_document_id || chunk.source_page;
    const source = chunk.document_name || chunk.source_page;

    if (!uniqueSourcesForContext.has(key)) {
      uniqueSourcesForContext.set(key, {
        source,
        number: uniqueSourcesForContext.size + 1,
        chunks: [chunk.content]
      });
    } else {
      uniqueSourcesForContext.get(key)!.chunks.push(chunk.content);
    }
  });

  const context = Array.from(uniqueSourcesForContext.values())
    .map(({ source, number, chunks }) => {
      const combinedContent = chunks.join('\n');
      console.log(`Source ${number} (${source}): ${chunks.length} chunks, ${combinedContent.length} chars`);
      if (source.includes('.xlsx')) {
        console.log('Excel content preview:', combinedContent.substring(0, 300));
      }
      return `[Source ${number}: ${source}]\n${combinedContent}`;
    })
    .join('\n\n');

  console.log('=== CONTEXT BEING SENT TO AI ===');
  console.log('Context length:', context.length);
  console.log('Context preview (first 500 chars):', context.substring(0, 500));
  console.log('Number of sources:', uniqueSourcesForContext.size);

  const finalContext = context + vendorListContext;

  const systemPrompt = `You are a helpful AI assistant for the Minnesota MES (Medicaid Enterprise Systems) Modernization Challenge website. Your role is to answer questions about the MES Challenge, the Great Bake-Off process, RFP requirements, evaluation criteria, and all related information.

CRITICAL INSTRUCTIONS:
1. Answer questions BASED on the context provided below. The context contains relevant information from uploaded documents.
2. If the context contains relevant information, USE IT to answer the question. DO NOT say you don't have information if the context contains it!
3. When asked about large vendors who responded to the RFI:
   - Check if there is a "LARGE VENDORS WHO RESPONDED TO THE RFI" section at the end of the context
   - If present, use that list as the definitive source - it contains ALL the large vendors
   - Present the complete list in your response
   - You may also reference additional details from the document chunks in the context
4. Always cite your sources by referencing them as "Source 1", "Source 2", etc. (e.g., "According to Source 1...", "As mentioned in Source 2...")
5. Only say you don't have enough information if the context truly doesn't contain anything relevant to the question
6. Be concise but thorough
7. Use a professional but friendly tone

VIDEO CONTENT HANDLING:
- When context includes video documentation with timestamps, provide specific timestamp references (e.g., "At 5:30 in the video...")
- If a video URL is mentioned in the context, include it in your response as a direct link
- For questions about video content, reference the key topics covered and guide users to specific sections using timestamps
- When multiple related videos exist, mention them and explain how they connect to the user's question

CONTEXT:
${finalContext || 'No relevant context found.'}`;

  const conversationHistory = previousMessages
    .slice(-5)
    .map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: request.message },
  ];

  const assistantResponse = await generateChatResponse(messages, onStream);

  const uniqueSourcesMap = new Map<string, any>();
  relevantChunks.forEach(chunk => {
    const key = chunk.uploaded_document_id || chunk.source_page;
    if (!uniqueSourcesMap.has(key)) {
      const videoData = extractVideoFromChunk(chunk);

      if (videoData) {
        uniqueSourcesMap.set(key, {
          page: chunk.source_page,
          section: chunk.source_section,
          relevance: 0.9,
          document_id: chunk.uploaded_document_id,
          document_name: videoData.title,
          storage_path: null,
          video_url: videoData.url,
          video_title: videoData.title,
        });
      } else {
        uniqueSourcesMap.set(key, {
          page: chunk.source_page,
          section: chunk.source_section,
          relevance: 0.9,
          document_id: chunk.uploaded_document_id,
          document_name: chunk.document_name,
          storage_path: chunk.storage_path,
        });
      }
    }
  });

  const allSources = Array.from(uniqueSourcesMap.values()).map((source, index) => ({
    ...source,
    sourceNumber: index + 1,
  }));

  const citedSourceNumbers = new Set<number>();
  const sourceRegex = /Source\s+(\d+)/gi;
  let match;
  while ((match = sourceRegex.exec(assistantResponse)) !== null) {
    citedSourceNumbers.add(parseInt(match[1]));
  }

  const sources = allSources.map(source => ({
    ...source,
    cited: citedSourceNumbers.has(source.sourceNumber),
  }));

  console.log('Final sources array with citation status:', JSON.stringify(sources, null, 2));

  const messageId = await saveMessage(conversationId, 'assistant', assistantResponse, sources);

  return {
    message: assistantResponse,
    conversation_id: conversationId,
    sources,
    message_id: messageId,
  };
};

export const getUserConversations = async (sessionId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteConversation = async (conversationId: string): Promise<void> => {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) throw error;
};

export const submitFeedback = async (
  messageId: string,
  rating: 'positive' | 'negative',
  feedbackText?: string
): Promise<void> => {
  await supabase
    .from('messages')
    .update({
      feedback_rating: rating,
      feedback_text: feedbackText,
    })
    .eq('id', messageId);

  await supabase
    .from('chat_feedback')
    .insert({
      message_id: messageId,
      rating,
      feedback_text: feedbackText,
    });
};
