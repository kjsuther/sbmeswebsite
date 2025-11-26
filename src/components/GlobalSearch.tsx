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
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-mn-neutral-lightblue rounded-lg hover:border-mn-accent-teal hover:shadow-md focus:outline-none focus:ring-2 focus:ring-mn-accent-teal transition-all duration-200"
      >
        <Search className="h-5 w-5 text-mn-accent-teal" />
        <span className="text-sm text-mn-primary font-medium hidden sm:inline">Search</span>
        <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-xs font-semibold text-mn-primary bg-mn-neutral-lightblue bg-opacity-30 border border-mn-neutral-lightblue rounded">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-start justify-center p-4 pt-20">
            <div className="fixed inset-0 bg-mn-primary bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

            <div ref={dropdownRef} className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border-2 border-mn-accent-teal">
              <div className="flex items-center border-b-2 border-mn-neutral-lightblue p-6 bg-gradient-to-r from-white to-mn-neutral-lightblue bg-opacity-10">
                <Search className="h-6 w-6 text-mn-accent-teal mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search documents, conversations, and pages..."
                  className="flex-1 text-lg outline-none text-mn-primary placeholder-gray-400"
                  autoFocus
                />
                {isLoading && <Loader2 className="h-5 w-5 text-mn-accent-teal animate-spin mr-3" />}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="p-2 hover:bg-mn-neutral-lightblue hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-mn-primary" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-3">
                {query.length >= 2 && suggestions.length > 0 && (
                  <div className="mb-4">
                    <div className="px-4 py-3 text-xs font-bold text-mn-accent-teal uppercase tracking-wider flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Suggestions
                    </div>
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-3 hover:bg-mn-neutral-lightblue hover:bg-opacity-20 rounded-lg transition-all duration-200 ${
                          selectedIndex === idx ? 'bg-mn-accent-teal bg-opacity-10 border-l-4 border-mn-accent-teal' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <Search className="h-4 w-4 text-mn-accent-teal mr-3" />
                          <span className="text-sm font-semibold text-mn-primary">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {query.length === 0 && searchHistory.length > 0 && (
                  <div>
                    <div className="px-4 py-3 text-xs font-bold text-mn-accent-teal uppercase tracking-wider flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Searches
                    </div>
                    {searchHistory.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => handleSuggestionClick(item.query_text)}
                        className={`w-full text-left px-4 py-3 hover:bg-mn-neutral-lightblue hover:bg-opacity-20 rounded-lg transition-all duration-200 ${
                          selectedIndex === idx ? 'bg-mn-accent-teal bg-opacity-10 border-l-4 border-mn-accent-teal' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <Clock className="h-4 w-4 text-mn-accent-teal mr-3" />
                            <span className="text-sm font-semibold text-mn-primary">{item.query_text}</span>
                          </div>
                          <span className="text-xs font-medium text-mn-accent-teal bg-mn-neutral-lightblue bg-opacity-30 px-2 py-1 rounded">
                            {item.results_count} results
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {query.length >= 2 && suggestions.length === 0 && !isLoading && (
                  <div className="px-4 py-12 text-center">
                    <div className="bg-mn-neutral-lightblue bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-10 w-10 text-mn-accent-teal" />
                    </div>
                    <p className="text-mn-primary font-medium">No suggestions found. Press Enter to search.</p>
                  </div>
                )}

                {query.length === 0 && searchHistory.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <div className="bg-mn-neutral-lightblue bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-10 w-10 text-mn-accent-teal" />
                    </div>
                    <p className="text-lg font-semibold text-mn-primary mb-2">Start typing to search</p>
                    <p className="text-sm text-gray-600">Search documents, conversations, and pages</p>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-mn-neutral-lightblue px-6 py-4 bg-gradient-to-r from-mn-neutral-lightblue from-opacity-10 to-white rounded-b-2xl">
                <div className="flex items-center justify-between text-xs text-mn-primary font-medium">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <kbd className="px-2 py-1 bg-white border-2 border-mn-neutral-lightblue rounded font-semibold mr-1">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-2 py-1 bg-white border-2 border-mn-neutral-lightblue rounded font-semibold mr-1">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-2 py-1 bg-white border-2 border-mn-neutral-lightblue rounded font-semibold mr-1">esc</kbd>
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
