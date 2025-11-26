import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  MessageSquare,
  Globe,
  Upload,
  TrendingUp,
  Loader2,
  X,
  ArrowLeft,
} from 'lucide-react';
import {
  performUnifiedSearch,
  SearchResult,
  SearchFilters,
  trackSearchClick,
} from '../lib/searchService';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
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
        return <FileText className="h-5 w-5 text-mn-accent-teal" />;
      case 'conversation':
        return <MessageSquare className="h-5 w-5 text-mn-secondary" />;
      case 'page':
        return <Globe className="h-5 w-5 text-mn-accent-purple" />;
      case 'upload':
        return <Upload className="h-5 w-5 text-mn-accent-yellow" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      document: { label: 'Document', color: 'bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal border-mn-accent-teal' },
      conversation: { label: 'Conversation', color: 'bg-mn-secondary bg-opacity-10 text-mn-secondary border-mn-secondary' },
      page: { label: 'Page', color: 'bg-mn-accent-purple bg-opacity-10 text-mn-accent-purple border-mn-accent-purple' },
      upload: { label: 'Upload', color: 'bg-mn-accent-yellow bg-opacity-10 text-mn-accent-yellow border-mn-accent-yellow' },
    };
    const badge = badges[type as keyof typeof badges] || { label: type, color: 'bg-gray-100 text-gray-700 border-gray-300' };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleResultClick = (result: SearchResult, index: number) => {
    trackSearchClick(sessionId, result.id, result.type, index);

    if (result.url) {
      navigate(result.url);
    } else if (result.type === 'upload' && result.metadata?.storage_path) {
      window.open(result.metadata.storage_path, '_blank');
    }
  };

  const clearFilter = (filterType: keyof SearchFilters) => {
    setFilters((prev) => {
      if (filterType === 'dateFrom' || filterType === 'dateTo' || filterType === 'minRelevance') {
        return { ...prev, [filterType]: filterType === 'minRelevance' ? 0 : '' };
      }
      if (Array.isArray(prev[filterType])) {
        return { ...prev, [filterType]: [] };
      }
      return prev;
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.dateFrom ||
      filters.dateTo ||
      filters.minRelevance! > 0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-mn-primary to-mn-accent-teal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-mn-accent-yellow mb-4 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <Search className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Search Results</h1>
              <p className="text-mn-neutral-lightblue text-lg mt-1">
                {filteredResults.length} results for "{query}"
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-2 mt-6 overflow-x-auto">
            {[
              { key: 'all', label: 'All Results', count: results.length },
              { key: 'documents', label: 'Documents', count: results.filter((r) => r.type === 'document').length },
              { key: 'conversations', label: 'Conversations', count: results.filter((r) => r.type === 'conversation').length },
              { key: 'pages', label: 'Pages', count: results.filter((r) => r.type === 'page').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-mn-primary shadow-lg'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {tab.label} <span className="ml-2">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-5 py-2.5 border-2 rounded-lg font-semibold transition-all duration-200 ${
                showFilters
                  ? 'bg-mn-accent-teal text-white border-mn-accent-teal shadow-md'
                  : 'bg-white text-mn-primary border-mn-neutral-lightblue hover:border-mn-accent-teal hover:shadow-md'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {hasActiveFilters() && (
                <span className="bg-mn-accent-yellow text-mn-primary rounded-full px-2.5 py-0.5 text-xs font-bold">
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
                className="text-sm text-mn-accent-teal hover:text-mn-primary font-semibold transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-mn-primary font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
              className="px-4 py-2.5 border-2 border-mn-neutral-lightblue rounded-lg text-sm font-medium text-mn-primary focus:outline-none focus:ring-2 focus:ring-mn-accent-teal focus:border-mn-accent-teal transition-all"
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
              <span className="inline-flex items-center px-4 py-2 bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal rounded-lg text-sm font-semibold border-2 border-mn-accent-teal">
                From: {new Date(filters.dateFrom).toLocaleDateString()}
                <button
                  onClick={() => clearFilter('dateFrom')}
                  className="ml-2 hover:text-mn-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center px-4 py-2 bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal rounded-lg text-sm font-semibold border-2 border-mn-accent-teal">
                To: {new Date(filters.dateTo).toLocaleDateString()}
                <button
                  onClick={() => clearFilter('dateTo')}
                  className="ml-2 hover:text-mn-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border-2 border-mn-neutral-lightblue p-6 space-y-6">
                <h3 className="text-lg font-bold text-mn-primary flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-mn-accent-teal" />
                  Filter Results
                </h3>

                <div>
                  <h4 className="font-semibold text-mn-primary mb-3">Date Range</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
                      <input
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-mn-neutral-lightblue rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mn-accent-teal focus:border-mn-accent-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
                      <input
                        type="date"
                        value={filters.dateTo || ''}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-mn-neutral-lightblue rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mn-accent-teal focus:border-mn-accent-teal"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-mn-primary mb-3">Relevance Score</h4>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={filters.minRelevance || 0}
                    onChange={(e) => setFilters({ ...filters, minRelevance: parseFloat(e.target.value) })}
                    className="w-full accent-mn-accent-teal"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
                    <span>Any</span>
                    <span>{Math.round((filters.minRelevance || 0) * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="bg-mn-neutral-lightblue bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="h-10 w-10 text-mn-accent-teal animate-spin" />
                  </div>
                  <p className="text-lg font-semibold text-mn-primary">Searching...</p>
                </div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-mn-neutral-lightblue">
                <div className="bg-mn-neutral-lightblue bg-opacity-20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-mn-accent-teal" />
                </div>
                <h3 className="text-2xl font-bold text-mn-primary mb-3">No results found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search query or filters</p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-6 py-3 bg-mn-accent-teal text-white font-semibold rounded-lg hover:bg-mn-primary transition-colors duration-200"
                >
                  Return to Home
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result, index)}
                    className="bg-white rounded-xl shadow-md border-2 border-mn-neutral-lightblue p-6 hover:shadow-xl hover:border-mn-accent-teal transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1 bg-mn-neutral-lightblue bg-opacity-20 p-3 rounded-lg group-hover:bg-mn-accent-teal group-hover:bg-opacity-10 transition-colors">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          {getTypeBadge(result.type)}
                          <span className="text-xs font-medium text-gray-500">
                            {new Date(result.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-mn-primary mb-2 group-hover:text-mn-accent-teal transition-colors">
                          {result.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{result.snippet}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">{result.source}</span>
                          <div className="flex items-center space-x-2 bg-mn-secondary bg-opacity-10 px-3 py-1.5 rounded-full">
                            <TrendingUp className="h-4 w-4 text-mn-secondary" />
                            <span className="text-sm font-bold text-mn-secondary">
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
