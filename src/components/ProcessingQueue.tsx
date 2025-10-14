import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { getQueueStats, getQueueItems, subscribeToQueueChanges, estimateWaitTime, type QueueItem, type QueueStats } from '../lib/queueService';

export const ProcessingQueue = () => {
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    retrying: 0,
    total: 0,
  });
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [waitTime, setWaitTime] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadData = async () => {
    const [statsData, items, estimatedWait] = await Promise.all([
      getQueueStats(),
      getQueueItems(10),
      estimateWaitTime(),
    ]);
    setStats(statsData);
    setQueueItems(items);
    setWaitTime(estimatedWait);
  };

  useEffect(() => {
    loadData();

    const subscription = subscribeToQueueChanges(() => {
      loadData();
    });

    const interval = setInterval(loadData, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'retrying':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'retrying':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (stats.total === 0) {
    return null;
  }

  const activeCount = stats.processing + stats.pending + stats.retrying;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Processing Queue
            </h3>
            {stats.processing > 0 && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-blue-600 font-medium">
                  {stats.processing} processing
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {activeCount > 0 && waitTime > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Est. wait: {formatTime(waitTime)}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs">
              {stats.pending > 0 && (
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {stats.pending} pending
                </span>
              )}
              {stats.retrying > 0 && (
                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  {stats.retrying} retrying
                </span>
              )}
              {stats.failed > 0 && (
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">
                  {stats.failed} failed
                </span>
              )}
            </div>
          </div>
        </div>

        {stats.processing > 0 && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 animate-pulse transition-all duration-300"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gray-50">
            <div className="space-y-2">
              {queueItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No items in queue
                </p>
              ) : (
                queueItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(item.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.uploaded_documents?.filename || 'Unknown file'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.retry_count > 0 && `Retry ${item.retry_count}/${item.max_retries} • `}
                          {new Date(item.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
