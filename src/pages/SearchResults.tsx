import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  MessageSquare,
  Globe,
  Upload,
  Calendar,
  TrendingUp,
  Loader2,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  performUnifiedSearch,
  SearchResult,
  SearchFilters,
  trackSearchClick,
} from '../lib/searchService';

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'conversations' | 'pages'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('chatbot_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('chatbot_session_id', newId);
    return newId;
  });

  const [filters, setFilters] = useState<SearchFilters>({
    contentTypes: [],
    dateFrom: '',
    dateTo: '',
    tags: [],
    sources: [],
    minRelevance: 0,
  });

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, sortBy, filters]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const searchResults = await performUnifiedSearch(
        query,
        {
          filters,
          sortBy,
          limit: 50,
        },
        sessionId
      );
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    if (activeTab === 'documents') return results.filter((r) => r.type === 'document');
    if (activeTab === 'conversations') return results.filter((r) => r.type === 'conversation');
    if (activeTab === 'pages') return results.filter((r) => r.type === 'page');
    return results;
  };

  const filteredResults = getFilteredResults();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'conversation':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'page':
        return <Globe className="h-5 w-5 text-purple-500" />;
      case 'upload':
        return <Upload className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      document: { label: 'Document', color: 'bg-blue-100 text-blue-700' },
      conversation: { label: 'Conversation', color: 'bg-green-100 text-green-700' },
      page: { label: 'Page', color: 'bg-purple-100 text-purple-700' },
      upload: { label: 'Upload', color: 'bg-orange-100 text-orange-700' },
    };
    const badge = badges[type as keyof typeof badges] || { label: type, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleResultClick = (result: SearchResult, index: number) => {
    trackSearchClick(sessionId, result.id, result.type, index);

    if (result.url) {
      navigate(result.url);
    } else if (result.type === 'upload' && result.metadata?.storage_path) {
      // Open uploaded document
      window.open(result.metadata.storage_path, '_blank');
    }
  };

  const clearFilter = (filterType: keyof SearchFilters, value?: any) => {
    setFilters((prev) => {
      if (filterType === 'dateFrom' || filterType === 'dateTo' || filterType === 'minRelevance') {
        return { ...prev, [filterType]: filterType === 'minRelevance' ? 0 : '' };
      }
      if (Array.isArray(prev[filterType])) {
        return {
          ...prev,
          [filterType]: value
            ? (prev[filterType] as any[]).filter((v) => v !== value)
            : [],
        };
      }
      return prev;
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.contentTypes && filters.contentTypes.length > 0 ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.tags && filters.tags.length > 0 ||
      filters.sources && filters.sources.length > 0 ||
      filters.minRelevance! > 0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-mn-primary">Search Results</h1>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-mn-accent-teal hover:text-mn-primary"
            >
              Back
            </button>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              {query}
            </span>
            <span>•</span>
            <span>{filteredResults.length} results</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-6 mt-6 border-b border-gray-200">
            {[
              { key: 'all', label: 'All', count: results.length },
              { key: 'documents', label: 'Documents', count: results.filter((r) => r.type === 'document').length },
              { key: 'conversations', label: 'Conversations', count: results.filter((r) => r.type === 'conversation').length },
              { key: 'pages', label: 'Pages', count: results.filter((r) => r.type === 'page').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-4 px-1 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-mn-accent-teal text-mn-accent-teal font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-mn-accent-teal text-white border-mn-accent-teal'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-mn-accent-teal'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters() && (
                <span className="bg-white text-mn-accent-teal rounded-full px-2 py-0.5 text-xs font-semibold">
                  Active
                </span>
              )}
            </button>

            {hasActiveFilters() && (
              <button
                onClick={() => setFilters({
                  contentTypes: [],
                  dateFrom: '',
                  dateTo: '',
                  tags: [],
                  sources: [],
                  minRelevance: 0,
                })}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.dateFrom && (
              <span className="inline-flex items-center px-3 py-1 bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal rounded-full text-sm">
                From: {new Date(filters.dateFrom).toLocaleDateString()}
                <button
                  onClick={() => clearFilter('dateFrom')}
                  className="ml-2 hover:text-mn-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center px-3 py-1 bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal rounded-full text-sm">
                To: {new Date(filters.dateTo).toLocaleDateString()}
                <button
                  onClick={() => clearFilter('dateTo')}
                  className="ml-2 hover:text-mn-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Date Range</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">From</label>
                      <input
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">To</label>
                      <input
                        type="date"
                        value={filters.dateTo || ''}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Relevance</h3>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={filters.minRelevance || 0}
                    onChange={(e) => setFilters({ ...filters, minRelevance: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Any</span>
                    <span>High only</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-mn-accent-teal animate-spin" />
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search query or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result, index)}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">{getTypeIcon(result.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeBadge(result.type)}
                          <span className="text-xs text-gray-500">
                            {new Date(result.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-mn-primary mb-2 hover:text-mn-accent-teal">
                          {result.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{result.snippet}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{result.source}</span>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500">
                              {Math.round(result.relevance_score * 100)}% match
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
