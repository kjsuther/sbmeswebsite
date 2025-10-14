import React from 'react';
import { TrendingUp, MessageSquare, Clock, FileText } from 'lucide-react';

interface AnalyticsData {
  topQuestions: Array<{ question: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
  messagesPerConversation: number;
  timeBasedData: Array<{ date: string; count: number }>;
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-mn-primary" />
            <h3 className="text-lg font-semibold text-mn-primary">Top Questions Asked</h3>
          </div>

          {data.topQuestions.length === 0 ? (
            <p className="text-gray-500 text-sm">No question data available yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topQuestions.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 line-clamp-1 flex-1">{item.question}</span>
                    <span className="font-semibold text-mn-accent-teal ml-2">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-mn-accent-teal h-2 rounded-full"
                      style={{
                        width: `${(item.count / data.topQuestions[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-mn-primary" />
            <h3 className="text-lg font-semibold text-mn-primary">Most Referenced Sources</h3>
          </div>

          {data.topSources.length === 0 ? (
            <p className="text-gray-500 text-sm">No source data available yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topSources.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 line-clamp-1 flex-1">{item.source}</span>
                    <span className="font-semibold text-mn-primary ml-2">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-mn-primary h-2 rounded-full"
                      style={{
                        width: `${(item.count / data.topSources[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="h-5 w-5 text-mn-primary" />
          <h3 className="text-lg font-semibold text-mn-primary">Engagement Metrics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-mn-neutral-lightblue bg-opacity-20 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Avg Messages Per Conversation</p>
            <p className="text-3xl font-bold text-mn-primary">
              {data.messagesPerConversation.toFixed(1)}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Conversations</p>
            <p className="text-3xl font-bold text-green-600">
              {data.timeBasedData.reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Most Active Period</p>
            <p className="text-lg font-semibold text-blue-600">
              {data.timeBasedData.length > 0
                ? new Date(data.timeBasedData[0].date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-mn-primary" />
          <h3 className="text-lg font-semibold text-mn-primary">Activity Over Time (Last 7 Days)</h3>
        </div>

        {data.timeBasedData.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity data available yet.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-end space-x-2 h-48">
              {data.timeBasedData.map((day, idx) => {
                const maxCount = Math.max(...data.timeBasedData.map(d => d.count), 1);
                const heightPercent = (day.count / maxCount) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end space-y-2">
                    <div className="text-xs font-semibold text-mn-primary">{day.count}</div>
                    <div
                      className="w-full bg-mn-accent-teal rounded-t hover:bg-mn-primary transition-colors cursor-pointer"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      title={`${day.count} conversations`}
                    />
                    <div className="text-xs text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCharts;
