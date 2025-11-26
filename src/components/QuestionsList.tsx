import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MessageSquare, ThumbsUp, ThumbsDown, Clock, ChevronLeft, ChevronRight, TrendingUp, BarChart2, Plus, List, Grid } from 'lucide-react';
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

interface GroupedQuestion {
  normalizedContent: string;
  displayContent: string;
  count: number;
  firstAsked: string;
  lastAsked: string;
  positiveCount: number;
  negativeCount: number;
  instances: QuestionData[];
}

interface QuestionsListProps {
  refreshTrigger?: number;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ refreshTrigger }) => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'positive' | 'negative' | 'none' | 'highFrequency'>('all');
  const [sortBy, setSortBy] = useState<'frequency' | 'recent' | 'oldest' | 'popular'>('frequency');
  const [viewMode, setViewMode] = useState<'grouped' | 'individual'>('grouped');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadQuestions();
  }, [refreshTrigger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, feedbackFilter, sortBy, viewMode]);

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

  const groupedQuestions = useMemo((): GroupedQuestion[] => {
    const groups: Record<string, GroupedQuestion> = {};

    questions.forEach(q => {
      const normalized = q.content.toLowerCase().trim();

      if (!groups[normalized]) {
        groups[normalized] = {
          normalizedContent: normalized,
          displayContent: q.content,
          count: 0,
          firstAsked: q.created_at,
          lastAsked: q.created_at,
          positiveCount: 0,
          negativeCount: 0,
          instances: [],
        };
      }

      groups[normalized].count++;
      groups[normalized].instances.push(q);

      if (new Date(q.created_at) < new Date(groups[normalized].firstAsked)) {
        groups[normalized].firstAsked = q.created_at;
      }
      if (new Date(q.created_at) > new Date(groups[normalized].lastAsked)) {
        groups[normalized].lastAsked = q.created_at;
      }

      if (q.feedback_rating === 'positive') {
        groups[normalized].positiveCount++;
      } else if (q.feedback_rating === 'negative') {
        groups[normalized].negativeCount++;
      }
    });

    return Object.values(groups);
  }, [questions]);

  const statistics = useMemo(() => {
    const totalQuestions = questions.length;
    const uniqueQuestions = groupedQuestions.length;
    const questionsWithNegativeFeedback = questions.filter(q => q.feedback_rating === 'negative').length;

    const mostAskedQuestion = groupedQuestions.length > 0
      ? groupedQuestions.reduce((max, q) => q.count > max.count ? q : max, groupedQuestions[0])
      : null;

    const oldestDate = questions.length > 0
      ? new Date(questions[questions.length - 1].created_at)
      : new Date();
    const daysDiff = Math.max(1, Math.ceil((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgQuestionsPerDay = (totalQuestions / daysDiff).toFixed(1);

    return {
      totalQuestions,
      uniqueQuestions,
      questionsWithNegativeFeedback,
      mostAskedQuestion,
      avgQuestionsPerDay,
    };
  }, [questions, groupedQuestions]);

  const filteredData = useMemo(() => {
    let data = viewMode === 'grouped' ? groupedQuestions : questions.map(q => ({
      ...q,
      count: 1,
      normalizedContent: q.content.toLowerCase().trim(),
      displayContent: q.content,
      firstAsked: q.created_at,
      lastAsked: q.created_at,
      positiveCount: q.feedback_rating === 'positive' ? 1 : 0,
      negativeCount: q.feedback_rating === 'negative' ? 1 : 0,
      instances: [q],
    }));

    if (searchTerm) {
      data = data.filter(item =>
        item.displayContent.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (feedbackFilter === 'highFrequency') {
      data = data.filter(item => item.count >= 3);
    } else if (feedbackFilter === 'positive') {
      data = data.filter(item => item.positiveCount > 0);
    } else if (feedbackFilter === 'negative') {
      data = data.filter(item => item.negativeCount > 0);
    } else if (feedbackFilter === 'none') {
      data = data.filter(item => item.positiveCount === 0 && item.negativeCount === 0);
    }

    data.sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.count - a.count;
        case 'popular':
          const scoreA = a.count + (a.positiveCount * 2) - (a.negativeCount * 1);
          const scoreB = b.count + (b.positiveCount * 2) - (b.negativeCount * 1);
          return scoreB - scoreA;
        case 'recent':
          return new Date(b.lastAsked).getTime() - new Date(a.lastAsked).getTime();
        case 'oldest':
          return new Date(a.firstAsked).getTime() - new Date(b.firstAsked).getTime();
        default:
          return 0;
      }
    });

    return data;
  }, [viewMode, groupedQuestions, questions, searchTerm, feedbackFilter, sortBy]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleAddToCanned = async (questionText: string) => {
    if (!confirm(`Add "${questionText}" to canned questions?`)) return;

    try {
      const { data: existingQuestions } = await supabase
        .from('canned_questions')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = existingQuestions && existingQuestions.length > 0
        ? existingQuestions[0].display_order + 1
        : 1;

      const { error } = await supabase
        .from('canned_questions')
        .insert({
          question_text: questionText,
          display_order: nextOrder,
          is_active: true,
        });

      if (error) throw error;
      alert('Question added to canned questions successfully!');
    } catch (error) {
      console.error('Error adding to canned questions:', error);
      alert('Failed to add question to canned questions');
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Questions</p>
            <MessageSquare className="h-5 w-5 text-mn-primary" />
          </div>
          <p className="text-3xl font-bold text-mn-primary">{statistics.totalQuestions}</p>
          <p className="text-xs text-gray-500 mt-1">{statistics.uniqueQuestions} unique</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Most Asked</p>
            <TrendingUp className="h-5 w-5 text-mn-accent-teal" />
          </div>
          <p className="text-2xl font-bold text-mn-accent-teal">
            {statistics.mostAskedQuestion?.count || 0}x
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {statistics.mostAskedQuestion?.displayContent || 'N/A'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Per Day</p>
            <BarChart2 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{statistics.avgQuestionsPerDay}</p>
          <p className="text-xs text-gray-500 mt-1">questions daily</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Negative Feedback</p>
            <ThumbsDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{statistics.questionsWithNegativeFeedback}</p>
          <p className="text-xs text-gray-500 mt-1">needs attention</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mn-primary">All Questions Asked</h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grouped')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-white text-mn-accent-teal shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4" />
                <span className="text-sm font-medium">Grouped</span>
              </button>
              <button
                onClick={() => setViewMode('individual')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded transition-colors ${
                  viewMode === 'individual'
                    ? 'bg-white text-mn-accent-teal shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="text-sm font-medium">Individual</span>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Showing: <span className="font-semibold text-mn-primary">{filteredData.length}</span>
            </div>
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
                <option value="highFrequency">High Frequency (3+)</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent appearance-none bg-white"
            >
              <option value="frequency">Most Frequent</option>
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No questions found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedData.map((item, index) => {
                const maxCount = filteredData[0]?.count || 1;
                const popularityPercent = (item.count / maxCount) * 100;
                const primaryQuestion = item.instances[0];

                return (
                  <div
                    key={viewMode === 'grouped' ? item.normalizedContent : primaryQuestion.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-mn-accent-teal" />
                          {viewMode === 'individual' && (
                            <span className="text-xs text-gray-500">
                              {primaryQuestion.conversation_title || 'Untitled Conversation'}
                            </span>
                          )}
                          {viewMode === 'grouped' && item.count > 1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal">
                              Asked {item.count} times
                            </span>
                          )}
                          {item.count >= 5 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 font-medium mb-2">{item.displayContent}</p>

                        {viewMode === 'grouped' && item.count > 1 && (
                          <div className="mb-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-mn-accent-teal h-1.5 rounded-full"
                                style={{ width: `${popularityPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {(item.positiveCount > 0 || item.negativeCount > 0) && (
                          <div className="flex items-center space-x-1 text-xs">
                            {item.positiveCount > 0 && (
                              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{item.positiveCount}</span>
                              </div>
                            )}
                            {item.negativeCount > 0 && (
                              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-red-100 text-red-700">
                                <ThumbsDown className="h-3 w-3" />
                                <span>{item.negativeCount}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {primaryQuestion.assistant_response && (
                      <div className="mt-3 pl-6 border-l-2 border-gray-200">
                        <p className="text-sm text-gray-600 line-clamp-2">{primaryQuestion.assistant_response}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          {viewMode === 'grouped' && item.count > 1 ? (
                            <span>
                              {formatDateShort(item.firstAsked)} - {formatDateShort(item.lastAsked)}
                            </span>
                          ) : (
                            <span>{formatDate(item.firstAsked)}</span>
                          )}
                        </div>
                      </div>

                      {item.count >= 3 && (
                        <button
                          onClick={() => handleAddToCanned(item.displayContent)}
                          className="flex items-center space-x-1 text-xs text-mn-accent-teal hover:text-mn-primary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add to Canned Questions</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                  <span className="font-semibold">{filteredData.length}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
