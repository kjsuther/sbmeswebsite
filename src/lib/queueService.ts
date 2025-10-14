import { supabase } from './supabase';

export interface QueueItem {
  id: string;
  document_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  priority: number;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  retrying: number;
  total: number;
}

export const addToQueue = async (documentId: string, priority: number = 0): Promise<QueueItem> => {
  const { data, error } = await supabase
    .from('document_processing_queue')
    .insert({
      document_id: documentId,
      priority: priority,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to queue:', error);
    throw new Error('Failed to add document to processing queue');
  }

  return data;
};

export const getQueueStats = async (): Promise<QueueStats> => {
  const { data, error } = await supabase
    .from('document_processing_queue')
    .select('status');

  if (error) {
    console.error('Error fetching queue stats:', error);
    return {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      retrying: 0,
      total: 0,
    };
  }

  const stats = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    acc.total++;
    return acc;
  }, {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    retrying: 0,
    total: 0,
  } as QueueStats);

  return stats;
};

export const getQueueItems = async (limit: number = 50): Promise<QueueItem[]> => {
  const { data, error } = await supabase
    .from('document_processing_queue')
    .select(`
      *,
      uploaded_documents (
        filename,
        file_type,
        file_size
      )
    `)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching queue items:', error);
    return [];
  }

  return data || [];
};

export const getQueueItemByDocumentId = async (documentId: string): Promise<QueueItem | null> => {
  const { data, error } = await supabase
    .from('document_processing_queue')
    .select('*')
    .eq('document_id', documentId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching queue item:', error);
    return null;
  }

  return data;
};

export const subscribeToQueueChanges = (
  callback: (payload: any) => void
) => {
  const subscription = supabase
    .channel('queue-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'document_processing_queue',
      },
      callback
    )
    .subscribe();

  return subscription;
};

export const estimateWaitTime = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('document_processing_queue')
    .select('status')
    .in('status', ['pending', 'processing', 'retrying']);

  if (error || !data) {
    return 0;
  }

  const processingCount = data.filter(item => item.status === 'processing').length;
  const waitingCount = data.filter(item => item.status !== 'processing').length;

  const avgProcessingTime = 120;

  const estimatedSeconds = (processingCount > 0 ? avgProcessingTime : 0) +
                           (waitingCount * avgProcessingTime);

  return estimatedSeconds;
};

export const canUploadMore = async (): Promise<{ allowed: boolean; reason?: string; waitTime?: number }> => {
  const MAX_PENDING = 5;
  const MAX_PROCESSING = 2;

  const { data, error } = await supabase
    .from('document_processing_queue')
    .select('status')
    .in('status', ['pending', 'processing', 'retrying']);

  if (error) {
    return { allowed: true };
  }

  const pending = data.filter(item => item.status === 'pending' || item.status === 'retrying').length;
  const processing = data.filter(item => item.status === 'processing').length;

  if (processing >= MAX_PROCESSING) {
    const waitTime = await estimateWaitTime();
    return {
      allowed: false,
      reason: `${processing} document(s) currently processing. Please wait.`,
      waitTime,
    };
  }

  if (pending >= MAX_PENDING) {
    return {
      allowed: false,
      reason: `Queue is full with ${pending} pending document(s). Please wait for some to complete.`,
    };
  }

  return { allowed: true };
};
