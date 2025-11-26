import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSearchSuggestions, getSearchHistory } from '../lib/searchService';

interface GlobalSearchProps {
  sessionId: string;
  onSearch?: (query: string) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ sessionId, onSearch }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      loadSearchHistory();
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const results = await getSearchSuggestions(query, 5);
        setSuggestions(results);
        setIsLoading(false);
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const loadSearchHistory = async () => {
    const history = await getSearchHistory(sessionId, 5);
    setSearchHistory(history);
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
    setIsOpen(false);
    setQuery('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = suggestions.length > 0 ? suggestions : searchHistory.map(h => h.query_text);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        handleSearch(items[selectedIndex]);
      } else {
        handleSearch(query);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-mn-accent-teal focus:outline-none focus:ring-2 focus:ring-mn-accent-teal transition-colors"
      >
        <Search className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500 hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-start justify-center p-4 pt-20">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsOpen(false)} />

            <div ref={dropdownRef} className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center border-b border-gray-200 p-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search documents, conversations, and pages..."
                  className="flex-1 text-lg outline-none"
                  autoFocus
                />
                {isLoading && <Loader2 className="h-5 w-5 text-gray-400 animate-spin mr-3" />}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Suggestions and History */}
              <div className="max-h-96 overflow-y-auto p-2">
                {query.length >= 2 && suggestions.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Suggestions
                    </div>
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors ${
                          selectedIndex === idx ? 'bg-mn-accent-teal bg-opacity-10' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <Search className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {query.length === 0 && searchHistory.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Searches
                    </div>
                    {searchHistory.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => handleSuggestionClick(item.query_text)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors ${
                          selectedIndex === idx ? 'bg-mn-accent-teal bg-opacity-10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <Clock className="h-4 w-4 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{item.query_text}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {item.results_count} results
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {query.length >= 2 && suggestions.length === 0 && !isLoading && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No suggestions found. Press Enter to search.</p>
                  </div>
                )}

                {query.length === 0 && searchHistory.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Start typing to search across all content</p>
                    <p className="text-sm mt-2">Search documents, conversations, and pages</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <kbd className="px-2 py-1 bg-white border border-gray-200 rounded mr-1">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-2 py-1 bg-white border border-gray-200 rounded mr-1">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-2 py-1 bg-white border border-gray-200 rounded mr-1">esc</kbd>
                      Close
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
