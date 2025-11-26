import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, FileQuestion, Target, Clock, AlertCircle } from 'lucide-react';
import { analyzeContentGaps, ContentGap, TopicCoverage } from '../utils/analyticsUtils';

interface ContentGapAnalysisProps {
  refreshTrigger?: number;
}

const ContentGapAnalysis: React.FC<ContentGapAnalysisProps> = ({ refreshTrigger }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [unansweredQuestions, setUnansweredQuestions] = useState<ContentGap[]>([]);
  const [lowSourceResponses, setLowSourceResponses] = useState<ContentGap[]>([]);
  const [topicCoverage, setTopicCoverage] = useState<TopicCoverage[]>([]);
  const [missingDocSuggestions, setMissingDocSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadContentGapAnalysis();
  }, [refreshTrigger]);

  const loadContentGapAnalysis = async () => {
    setIsLoading(true);
    try {
      const data = await analyzeContentGaps();
      setUnansweredQuestions(data.unansweredQuestions);
      setLowSourceResponses(data.lowSourceResponses);
      setTopicCoverage(data.topicCoverage);
      setMissingDocSuggestions(data.missingDocSuggestions);
    } catch (error) {
      console.error('Error loading content gap analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <FileQuestion className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mn-primary"></div>
      </div>
    );
  }

  const highPriorityCount = unansweredQuestions.filter(q => q.priority === 'high').length;
  const totalGaps = unansweredQuestions.length;
  const avgSourceCount = unansweredQuestions.length > 0
    ? unansweredQuestions.reduce((sum, q) => sum + q.avgSourceCount, 0) / unansweredQuestions.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Content Gaps Identified</p>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">{totalGaps}</p>
          <p className="text-xs text-gray-500 mt-1">
            {highPriorityCount} high priority
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Sources Per Response</p>
            <FileQuestion className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{avgSourceCount.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {avgSourceCount < 2 ? 'Below target' : 'On target'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Uncovered Topics</p>
            <Target className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            {topicCoverage.filter(t => !t.hasDocumentation).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            of {topicCoverage.length} topics
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-mn-primary" />
            <h3 className="text-lg font-semibold text-mn-primary">Unanswered Questions</h3>
          </div>
          <p className="text-sm text-gray-600">
            Questions with poor source coverage or negative feedback
          </p>
        </div>

        {unansweredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No significant content gaps detected. Great job!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unansweredQuestions.map((gap, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(gap.priority)}`}>
                        {getPriorityIcon(gap.priority)}
                        <span className="uppercase">{gap.priority} Priority</span>
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal">
                        Asked {gap.count} times
                      </span>
                      {gap.negativeFeedbackCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {gap.negativeFeedbackCount} negative feedback
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 font-medium mb-2">{gap.question}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FileQuestion className="h-3 w-3" />
                        <span>Avg sources: {gap.avgSourceCount.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Last asked: {formatDate(gap.lastAsked)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileQuestion className="h-5 w-5 text-mn-primary" />
            <h3 className="text-lg font-semibold text-mn-primary">Low Source Responses</h3>
          </div>

          {lowSourceResponses.length === 0 ? (
            <p className="text-gray-500 text-sm">All responses have adequate source coverage.</p>
          ) : (
            <div className="space-y-3">
              {lowSourceResponses.map((response, idx) => (
                <div key={idx} className="border-l-4 border-yellow-400 pl-4 py-2">
                  <p className="text-sm text-gray-900 font-medium mb-1">{response.question}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>Asked {response.count} times</span>
                    <span>•</span>
                    <span>Avg sources: {response.avgSourceCount.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-mn-primary" />
            <h3 className="text-lg font-semibold text-mn-primary">Topic Coverage</h3>
          </div>

          {topicCoverage.length === 0 ? (
            <p className="text-gray-500 text-sm">No topic data available yet.</p>
          ) : (
            <div className="space-y-3">
              {topicCoverage.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {topic.topic}
                      </span>
                      {!topic.hasDocumentation && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          No docs
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {topic.questionCount} questions
                    </p>
                  </div>
                  <div className={`h-2 w-20 rounded-full ${topic.hasDocumentation ? 'bg-green-500' : 'bg-red-300'}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {missingDocSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Suggested Documentation Improvements
              </h3>
              <p className="text-sm text-orange-800 mb-4">
                Based on question patterns, consider adding documentation for these topics:
              </p>
              <ul className="space-y-2">
                {missingDocSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-sm text-orange-900">
                    <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGapAnalysis;
