import { supabase } from './supabase';
import { generateEmbedding, generateChatResponse, generateConversationTitle } from './openai';
import { DocumentChunk, Message, Conversation, ChatRequest, ChatResponse } from './chatbot-types';

const SIMILARITY_THRESHOLD = 0.3;
const MAX_CONTEXT_CHUNKS = 5;

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
      return fallbackData || [];
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

  const relevantChunks = await searchSimilarChunks(request.message);

  const context = relevantChunks
    .map((chunk, index) => {
      const source = chunk.source_section
        ? `${chunk.source_page} - ${chunk.source_section}`
        : chunk.source_page;
      return `[Source ${index + 1}: ${source}]\n${chunk.content}`;
    })
    .join('\n\n');

  const systemPrompt = `You are a helpful AI assistant for the Minnesota MES (Medicaid Enterprise Systems) Modernization Challenge website. Your role is to answer questions about the MES Challenge, the Great Bake-Off process, RFP requirements, evaluation criteria, and all related information.

CRITICAL INSTRUCTIONS:
1. Answer questions ONLY based on the context provided below
2. If the context doesn't contain enough information to answer the question, say: "I don't have enough information in my knowledge base to answer that question. You may want to check the website directly or contact the MES team at mes.modernization.dhs@state.mn.us"
3. Always cite your sources by mentioning which page the information comes from
4. Be concise but thorough
5. Use a professional but friendly tone
6. If asked about processes, explain them step-by-step

CONTEXT:
${context || 'No relevant context found.'}`;

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

  const sources = relevantChunks.map(chunk => ({
    page: chunk.source_page,
    section: chunk.source_section,
    relevance: 0.9,
  }));

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
