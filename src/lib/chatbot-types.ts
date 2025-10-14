export interface DocumentChunk {
  id?: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
  source_page: string;
  source_section?: string;
  document_name?: string;
  uploaded_document_id?: string;
  storage_path?: string;
  chunk_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  session_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    page: string;
    section?: string;
    relevance: number;
    document_id?: string;
    document_name?: string;
    storage_path?: string;
    sourceNumber?: number;
    cited?: boolean;
  }>;
  feedback_rating?: 'positive' | 'negative';
  feedback_text?: string;
  created_at: string;
}

export interface ChatFeedback {
  id?: string;
  message_id: string;
  rating: 'positive' | 'negative';
  feedback_text?: string;
  created_at?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  session_id: string;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
  sources: Array<{
    page: string;
    section?: string;
    relevance: number;
    document_id?: string;
    document_name?: string;
    storage_path?: string;
    sourceNumber?: number;
    cited?: boolean;
  }>;
  message_id: string;
}
