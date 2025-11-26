import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchAnalyticsData {
  topSearches: Array<{ query: string; count: number }>;
  zeroResultSearches: Array<{ query: string; count: number }>;
  avgResultsPerSearch: number;
  totalSearches: number;
  popularSearches: Array<{ query: string; count: number }>;
}

const SearchAnalytics: React.FC = () => {
  const [data, setData] = useState<SearchAnalyticsData>({
    topSearches: [],
    zeroResultSearches: [],
    avgResultsPerSearch: 0,
    totalSearches: 0,
    popularSearches: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data: searches, error } = await supabase
        .from('search_queries')
        .select('query_text, results_count, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const queryCounts: Record<string, number> = {};
      const zeroResultQueries: Record<string, number> = {};
      let totalResults = 0;

      (searches || []).forEach((search) => {
        queryCounts[search.query_text] = (queryCounts[search.query_text] || 0) + 1;
        totalResults += search.results_count;

        if (search.results_count === 0) {
          zeroResultQueries[search.query_text] = (zeroResultQueries[search.query_text] || 0) + 1;
        }
      });

      const topSearches = Object.entries(queryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      const zeroResultSearches = Object.entries(zeroResultQueries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      const { data: popularData } = await supabase
        .from('popular_searches')
        .select('query_text, search_count')
        .order('search_count', { ascending: false })
        .limit(10);

      setData({
        topSearches,
        zeroResultSearches,
        avgResultsPerSearch: searches.length > 0 ? totalResults / searches.length : 0,
        totalSearches: searches.length,
        popularSearches: popularData || [],
      });
    } catch (error) {
      console.error('Error loading search analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Searches</p>
            <Search className="h-5 w-5 text-mn-primary" />
          </div>
          <p className="text-3xl font-bold text-mn-primary">{data.totalSearches}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Results</p>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.avgResultsPerSearch.toFixed(1)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Zero Results</p>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{data.zeroResultSearches.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-mn-accent-teal" />
            <h3 className="text-lg font-semibold text-mn-primary">Top Searches</h3>
          </div>

          {data.topSearches.length === 0 ? (
            <p className="text-sm text-gray-500">No search data available yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topSearches.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="flex items-center justify-center w-6 h-6 bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal rounded-full text-xs font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-900 truncate">{item.query}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{item.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-mn-primary">Zero Result Searches</h3>
          </div>

          {data.zeroResultSearches.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Great! All searches are returning results.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                These searches returned no results. Consider adding content to address these queries.
              </p>
              {data.zeroResultSearches.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3 flex-1">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 truncate">{item.query}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{item.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-mn-accent-teal" />
          <h3 className="text-lg font-semibold text-mn-primary">Trending Searches (24h)</h3>
        </div>

        {data.popularSearches.length === 0 ? (
          <p className="text-sm text-gray-500">No trending searches yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.popularSearches.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-900 truncate flex-1">{item.query}</span>
                <span className="text-xs font-semibold text-mn-accent-teal ml-2">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Search className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Search Insights</h4>
            <p className="text-sm text-blue-800">
              Monitor zero-result searches to identify content gaps. Use this data to improve your knowledge base
              and create content that addresses user needs. High-performing searches indicate well-covered topics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;
