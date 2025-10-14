import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, ThumbsUp, ThumbsDown, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QuestionData {
  id: string;
  content: string;
  created_at: string;
  conversation_id: string;
  feedback_rating?: 'positive' | 'negative';
  conversation_title?: string;
  assistant_response?: string;
}

interface QuestionsListProps {
  refreshTrigger?: number;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ refreshTrigger }) => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'positive' | 'negative' | 'none'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadQuestions();
  }, [refreshTrigger]);

  useEffect(() => {
    filterAndSortQuestions();
    setCurrentPage(1);
  }, [questions, searchTerm, feedbackFilter, sortBy]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const { data: userMessages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          conversation_id,
          conversations (
            title
          )
        `)
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const questionsWithFeedback = await Promise.all(
        (userMessages || []).map(async (msg: any) => {
          const { data: assistantMsg } = await supabase
            .from('messages')
            .select('feedback_rating, content')
            .eq('conversation_id', msg.conversation_id)
            .eq('role', 'assistant')
            .gt('created_at', msg.created_at)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            conversation_id: msg.conversation_id,
            conversation_title: msg.conversations?.title,
            feedback_rating: assistantMsg?.feedback_rating,
            assistant_response: assistantMsg?.content,
          };
        })
      );

      setQuestions(questionsWithFeedback);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortQuestions = () => {
    let filtered = [...questions];

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (feedbackFilter !== 'all') {
      if (feedbackFilter === 'none') {
        filtered = filtered.filter(q => !q.feedback_rating);
      } else {
        filtered = filtered.filter(q => q.feedback_rating === feedbackFilter);
      }
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });

    setFilteredQuestions(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mn-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mn-primary">All Questions Asked</h2>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-mn-primary">{filteredQuestions.length}</span> questions
            {filteredQuestions.length !== questions.length && (
              <span className="text-gray-400 ml-1">({questions.length} total)</span>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={feedbackFilter}
                onChange={(e) => setFeedbackFilter(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Feedback</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="none">No Feedback</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent appearance-none bg-white"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No questions found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedQuestions.map((question) => (
              <div
                key={question.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-mn-accent-teal" />
                      <span className="text-xs text-gray-500">
                        {question.conversation_title || 'Untitled Conversation'}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{question.content}</p>
                  </div>

                  {question.feedback_rating && (
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                      question.feedback_rating === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {question.feedback_rating === 'positive' ? (
                        <ThumbsUp className="h-4 w-4" />
                      ) : (
                        <ThumbsDown className="h-4 w-4" />
                      )}
                      <span className="capitalize">{question.feedback_rating}</span>
                    </div>
                  )}
                </div>

                {question.assistant_response && (
                  <div className="mt-3 pl-6 border-l-2 border-gray-200">
                    <p className="text-sm text-gray-600 line-clamp-2">{question.assistant_response}</p>
                  </div>
                )}

                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(question.created_at)}</span>
                  </div>
                </div>
              </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(endIndex, filteredQuestions.length)}</span> of{' '}
                  <span className="font-semibold">{filteredQuestions.length}</span> questions
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              pageNum === currentPage
                                ? 'bg-mn-accent-teal text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionsList;
