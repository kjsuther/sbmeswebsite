import { supabase } from './supabase';
import { generateEmbedding } from './openai';

export interface SearchResult {
  id: string;
  type: 'document' | 'conversation' | 'page' | 'upload';
  title: string;
  description: string;
  snippet: string;
  source: string;
  relevance_score: number;
  created_at: string;
  metadata?: any;
  url?: string;
}

export interface SearchFilters {
  contentTypes?: string[];
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  sources?: string[];
  minRelevance?: number;
}

export interface SearchOptions {
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'popularity';
  limit?: number;
  offset?: number;
}

const WEBSITE_PAGES: Record<string, string> = {
  'Home': '/',
  'FAQs': '/faqs',
  'Great Bake Off': '/great-bake-off',
  'MES Training': '/mes-training',
  'MES Modernization': '/mes-modernization',
  'Layer RFP Response': '/layer-rfp-response',
  'Slice RFP Response': '/slice-rfp-response',
  'Software Provider RFP Response': '/software-provider-rfp-response',
  'Software RFP Requirements': '/software-rfp-requirements',
  'Delivery Services Requirements': '/delivery-services-requirements',
  'Reference Materials': '/reference-materials',
  'Feedback': '/feedback',
};

export async function performUnifiedSearch(
  query: string,
  options: SearchOptions = {},
  sessionId: string
): Promise<SearchResult[]> {
  const { filters = {}, sortBy = 'relevance', limit = 20, offset = 0 } = options;

  try {
    const results: SearchResult[] = [];

    // Generate embedding for semantic search
    const embedding = await generateEmbedding(query);

    // Search document chunks with hybrid approach
    const chunkResults = await searchDocumentChunks(query, embedding, filters, limit);
    results.push(...chunkResults);

    // Search uploaded documents
    const uploadResults = await searchUploadedDocuments(query, filters, limit);
    results.push(...uploadResults);

    // Search conversations
    const conversationResults = await searchConversations(query, filters, limit);
    results.push(...conversationResults);

    // Sort results
    const sortedResults = sortResults(results, sortBy);

    // Track the search
    await trackSearch(query, sessionId, filters, sortedResults.length);

    // Apply pagination
    return sortedResults.slice(offset, offset + limit);
  } catch (error) {
    console.error('Error performing unified search:', error);
    throw error;
  }
}

async function searchDocumentChunks(
  query: string,
  embedding: number[],
  filters: SearchFilters,
  limit: number
): Promise<SearchResult[]> {
  try {
    // Build the query
    let dbQuery = supabase.rpc('match_document_chunks', {
      query_embedding: embedding,
      match_threshold: filters.minRelevance || 0.1,
      match_count: limit,
    });

    const { data, error } = await dbQuery;

    if (error) throw error;

    return (data || []).map((chunk: any) => {
      const isWebsitePage = chunk.document_name?.startsWith('Website - ');
      const pageName = isWebsitePage
        ? chunk.document_name.replace('Website - ', '')
        : null;

      return {
        id: chunk.id,
        type: isWebsitePage ? 'page' : 'document',
        title: chunk.document_name || 'Untitled',
        description: chunk.content.substring(0, 200),
        snippet: highlightSnippet(chunk.content, query),
        source: chunk.document_name || 'Unknown',
        relevance_score: chunk.similarity || 0,
        created_at: chunk.created_at,
        metadata: chunk.metadata,
        url: pageName && WEBSITE_PAGES[pageName] ? WEBSITE_PAGES[pageName] : undefined,
      };
    });
  } catch (error) {
    console.error('Error searching document chunks:', error);
    return [];
  }
}

async function searchUploadedDocuments(
  query: string,
  filters: SearchFilters,
  limit: number
): Promise<SearchResult[]> {
  try {
    const tsQuery = query.split(' ').join(' & ');

    let dbQuery = supabase
      .from('uploaded_documents')
      .select('*')
      .textSearch('file_name', tsQuery)
      .limit(limit);

    if (filters.dateFrom) {
      dbQuery = dbQuery.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      dbQuery = dbQuery.lte('created_at', filters.dateTo);
    }

    const { data, error } = await dbQuery;

    if (error) throw error;

    return (data || []).map((doc: any) => ({
      id: doc.id,
      type: 'upload',
      title: doc.file_name,
      description: `${doc.file_type} - ${(doc.file_size / 1024).toFixed(2)} KB`,
      snippet: doc.file_name,
      source: 'Uploaded Document',
      relevance_score: 0.8,
      created_at: doc.created_at,
      metadata: { storage_path: doc.storage_path, file_type: doc.file_type },
    }));
  } catch (error) {
    console.error('Error searching uploaded documents:', error);
    return [];
  }
}

async function searchConversations(
  query: string,
  filters: SearchFilters,
  limit: number
): Promise<SearchResult[]> {
  try {
    const tsQuery = query.split(' ').join(' & ');

    let dbQuery = supabase
      .from('messages')
      .select('id, content, created_at, conversation_id, conversations(title)')
      .eq('role', 'assistant')
      .textSearch('content_tsv', tsQuery)
      .limit(limit);

    if (filters.dateFrom) {
      dbQuery = dbQuery.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      dbQuery = dbQuery.lte('created_at', filters.dateTo);
    }

    const { data, error } = await dbQuery;

    if (error) throw error;

    return (data || []).map((msg: any) => ({
      id: msg.id,
      type: 'conversation',
      title: msg.conversations?.title || 'Untitled Conversation',
      description: msg.content.substring(0, 200),
      snippet: highlightSnippet(msg.content, query),
      source: 'Chatbot Conversation',
      relevance_score: 0.7,
      created_at: msg.created_at,
      metadata: { conversation_id: msg.conversation_id },
      url: `/chatbot?conversation=${msg.conversation_id}`,
    }));
  } catch (error) {
    console.error('Error searching conversations:', error);
    return [];
  }
}

function highlightSnippet(text: string, query: string): string {
  const queryWords = query.toLowerCase().split(' ');
  const lowerText = text.toLowerCase();

  let bestPosition = 0;
  let maxMatches = 0;

  for (let i = 0; i < text.length - 100; i += 20) {
    const chunk = lowerText.substring(i, i + 200);
    const matches = queryWords.filter((word) => chunk.includes(word)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestPosition = i;
    }
  }

  const start = Math.max(0, bestPosition);
  const snippet = text.substring(start, start + 200);

  return (start > 0 ? '...' : '') + snippet + (start + 200 < text.length ? '...' : '');
}

function sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
  switch (sortBy) {
    case 'date':
      return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'popularity':
      return results.sort((a, b) => b.relevance_score - a.relevance_score);
    case 'relevance':
    default:
      return results.sort((a, b) => b.relevance_score - a.relevance_score);
  }
}

async function trackSearch(
  query: string,
  sessionId: string,
  filters: SearchFilters,
  resultsCount: number
): Promise<void> {
  try {
    await supabase.from('search_queries').insert({
      session_id: sessionId,
      query_text: query,
      filters_applied: filters,
      results_count: resultsCount,
    });

    // Update popular searches
    await supabase.rpc('upsert_popular_search', {
      search_text: query,
    }).catch(() => {
      // Fallback if function doesn't exist yet
      supabase
        .from('popular_searches')
        .upsert(
          { query_text: query, search_count: 1, last_searched_at: new Date().toISOString() },
          { onConflict: 'query_text' }
        );
    });
  } catch (error) {
    console.error('Error tracking search:', error);
  }
}

export async function trackSearchClick(
  searchQueryId: string,
  contentId: string,
  contentType: string,
  position: number
): Promise<void> {
  try {
    await supabase.from('search_clicks').insert({
      search_query_id: searchQueryId,
      clicked_content_id: contentId,
      clicked_content_type: contentType,
      position_in_results: position,
    });
  } catch (error) {
    console.error('Error tracking search click:', error);
  }
}

export async function getSearchHistory(sessionId: string, limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('search_queries')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
}

export async function getSearchSuggestions(partialQuery: string, limit: number = 5): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('search_suggestions')
      .select('suggestion_text')
      .ilike('suggestion_text', `${partialQuery}%`)
      .order('weight', { ascending: false })
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Also get popular searches
    const { data: popularData } = await supabase
      .from('popular_searches')
      .select('query_text')
      .ilike('query_text', `${partialQuery}%`)
      .order('search_count', { ascending: false })
      .limit(limit);

    const suggestions = new Set<string>();
    data?.forEach((s) => suggestions.add(s.suggestion_text));
    popularData?.forEach((s) => suggestions.add(s.query_text));

    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
}

export async function trackContentView(
  sessionId: string,
  contentId: string,
  contentType: string,
  sourcePage?: string
): Promise<void> {
  try {
    await supabase.from('content_views').insert({
      session_id: sessionId,
      content_id: contentId,
      content_type: contentType,
      source_page: sourcePage,
    });
  } catch (error) {
    console.error('Error tracking content view:', error);
  }
}

export async function getRelatedContent(
  contentId: string,
  contentType: string,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase
      .from('related_content')
      .select('*')
      .eq('source_content_id', contentId)
      .eq('source_content_type', contentType)
      .order('similarity_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Fetch actual content details for related items
    const results: SearchResult[] = [];
    for (const rel of data || []) {
      if (rel.related_content_type === 'document') {
        const { data: chunk } = await supabase
          .from('document_chunks')
          .select('*')
          .eq('id', rel.related_content_id)
          .single();

        if (chunk) {
          results.push({
            id: chunk.id,
            type: 'document',
            title: chunk.document_name || 'Untitled',
            description: chunk.content.substring(0, 200),
            snippet: chunk.content.substring(0, 150),
            source: chunk.document_name || 'Unknown',
            relevance_score: rel.similarity_score,
            created_at: chunk.created_at,
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching related content:', error);
    return [];
  }
}
