import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Award, Archive, BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import { analyzeKnowledgeBaseEffectiveness, DocumentPerformance, ChunkUtilization } from '../utils/analyticsUtils';

interface KnowledgeBaseEffectivenessProps {
  refreshTrigger?: number;
}

const KnowledgeBaseEffectiveness: React.FC<KnowledgeBaseEffectivenessProps> = ({ refreshTrigger }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [documentPerformance, setDocumentPerformance] = useState<DocumentPerformance[]>([]);
  const [chunkUtilization, setChunkUtilization] = useState<ChunkUtilization[]>([]);
  const [citationStats, setCitationStats] = useState({
    totalResponses: 0,
    responsesWithCitations: 0,
    avgCitationsPerResponse: 0,
    citationRate: 0,
  });
  const [unusedDocuments, setUnusedDocuments] = useState<string[]>([]);

  useEffect(() => {
    loadKnowledgeBaseEffectiveness();
  }, [refreshTrigger]);

  const loadKnowledgeBaseEffectiveness = async () => {
    setIsLoading(true);
    try {
      const data = await analyzeKnowledgeBaseEffectiveness();
      setDocumentPerformance(data.documentPerformance);
      setChunkUtilization(data.chunkUtilization);
      setCitationStats(data.citationStats);
      setUnusedDocuments(data.unusedDocuments);
    } catch (error) {
      console.error('Error loading knowledge base effectiveness:', error);
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

  const getHealthScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mn-primary"></div>
      </div>
    );
  }

  const topPerformers = documentPerformance.slice(0, 3);
  const avgHealthScore = documentPerformance.length > 0
    ? documentPerformance.reduce((sum, doc) => sum + doc.healthScore, 0) / documentPerformance.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Citation Rate</p>
            <BarChart3 className="h-5 w-5 text-mn-primary" />
          </div>
          <p className="text-3xl font-bold text-mn-primary">{citationStats.citationRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {citationStats.responsesWithCitations} of {citationStats.totalResponses} responses
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Citations</p>
            <FileText className="h-5 w-5 text-mn-accent-teal" />
          </div>
          <p className="text-3xl font-bold text-mn-accent-teal">
            {citationStats.avgCitationsPerResponse.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">sources per response</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Health Score</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className={`text-3xl font-bold ${getHealthScoreColor(avgHealthScore)}`}>
            {avgHealthScore.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">out of 100</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Unused Documents</p>
            <Archive className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-600">{unusedDocuments.length}</p>
          <p className="text-xs text-gray-500 mt-1">not cited yet</p>
        </div>
      </div>

      {topPerformers.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-3 mb-4">
            <Award className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-1">Top Performing Documents</h3>
              <p className="text-sm text-green-800">Your most valuable knowledge base assets</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((doc, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-green-600">#{idx + 1}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthScoreBg(doc.healthScore)} ${getHealthScoreColor(doc.healthScore)}`}>
                    Score: {doc.healthScore.toFixed(0)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                  {doc.documentName}
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Citations:</span>
                    <span className="font-semibold">{doc.totalCitations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Positive feedback:</span>
                    <span className="font-semibold text-green-600">{doc.positiveFeedbackCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-mn-primary" />
            <h3 className="text-lg font-semibold text-mn-primary">Document Performance Ranking</h3>
          </div>
          <p className="text-sm text-gray-600">Sorted by total citations</p>
        </div>

        {documentPerformance.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No document citation data available yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Document Name</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Citations</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Feedback</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Health Score</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Utilization</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Cited</th>
                </tr>
              </thead>
              <tbody>
                {documentPerformance.map((doc, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal font-semibold text-sm">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{doc.documentName}</p>
                      <p className="text-xs text-gray-500">{doc.chunkCount} chunks</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-mn-primary bg-opacity-10 text-mn-primary">
                        {doc.totalCitations}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center space-x-1 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 font-semibold">{doc.positiveFeedbackCount}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <XCircle className="h-3 w-3 text-red-600" />
                          <span className="text-red-600 font-semibold">{doc.negativeFeedbackCount}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-bold ${getHealthScoreColor(doc.healthScore)}`}>
                          {doc.healthScore.toFixed(0)}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${doc.healthScore >= 70 ? 'bg-green-500' : doc.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${doc.healthScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium text-gray-700">
                        {doc.utilizationRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(doc.lastCited)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-mn-primary" />
            <h3 className="text-lg font-semibold text-mn-primary">Top Cited Chunks</h3>
          </div>

          {chunkUtilization.length === 0 ? (
            <p className="text-gray-500 text-sm">No chunk citation data available yet.</p>
          ) : (
            <div className="space-y-3">
              {chunkUtilization.slice(0, 10).map((chunk, idx) => (
                <div key={idx} className="border-l-4 border-mn-accent-teal pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-mn-accent-teal">
                      {chunk.documentName}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-mn-accent-teal bg-opacity-10 text-mn-accent-teal">
                      {chunk.citationCount} citations
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{chunk.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last cited: {formatDate(chunk.lastCited)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Archive className="h-5 w-5 text-mn-primary" />
            <h3 className="text-lg font-semibold text-mn-primary">Unused Documents</h3>
          </div>

          {unusedDocuments.length === 0 ? (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 rounded-lg p-4">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">All documents are being utilized!</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                These documents haven't been cited in any responses yet. Consider reviewing their content or removing if no longer needed.
              </p>
              <div className="space-y-2">
                {unusedDocuments.map((docName, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <Archive className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 line-clamp-1">{docName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {documentPerformance.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Knowledge Base Insights
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Health Score</strong> combines citation frequency, feedback quality, utilization rate, and recency
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>
                    <strong>Utilization Rate</strong> shows what percentage of a document's chunks are being actively used
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                  <span>
                    Documents with low health scores or high negative feedback may need updating or removal
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseEffectiveness;
