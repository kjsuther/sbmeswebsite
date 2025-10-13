import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, RefreshCw, LogOut, Upload, Trash2, BarChart3 } from 'lucide-react';
import { isAdminAuthenticated, clearAdminSession } from '../lib/adminAuth';
import { seedDocumentChunks, getChunkStats } from '../utils/seedChatbot';
import { seedWebsiteContent } from '../utils/seedWebsiteContent';
import { supabase } from '../lib/supabase';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'documents' | 'analytics'>('knowledge');
  const [documentRefreshTrigger, setDocumentRefreshTrigger] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState({ current: 0, total: 0, message: '' });
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);
  const [chunkStats, setChunkStats] = useState<{ totalChunks: number; chunksByPage: Record<string, number> }>({
    totalChunks: 0,
    chunksByPage: {},
  });
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalMessages: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }

    loadChunkStats();
    loadAnalytics();
  }, [navigate]);

  const loadChunkStats = async () => {
    const stats = await getChunkStats();
    setChunkStats(stats);
  };

  const loadAnalytics = async () => {
    try {
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      const { count: positiveFeedback } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('feedback_rating', 'positive');

      const { count: negativeFeedback } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('feedback_rating', 'negative');

      setAnalytics({
        totalConversations: conversationsCount || 0,
        totalMessages: messagesCount || 0,
        positiveFeedback: positiveFeedback || 0,
        negativeFeedback: negativeFeedback || 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleSeedDatabase = async () => {
    if (!confirm('This will replace all existing document chunks. Continue?')) return;

    setIsSeeding(true);
    setSeedResult(null);

    const result = await seedDocumentChunks((current, total, message) => {
      setSeedProgress({ current, total, message });
    });

    setSeedResult(result);
    setIsSeeding(false);
    await loadChunkStats();
  };

  const handleSeedWebsiteContent = async () => {
    if (!confirm('This will add website content to the knowledge base. Continue?')) return;

    setIsSeeding(true);
    setSeedResult(null);
    setSeedProgress({ current: 0, total: 0, message: 'Seeding website content...' });

    try {
      await seedWebsiteContent();
      setSeedResult({ success: true, message: 'Website content seeded successfully!' });
    } catch (error) {
      setSeedResult({ success: false, message: `Error: ${error}` });
    }

    setIsSeeding(false);
    await loadChunkStats();
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-mn-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Chatbot Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'knowledge'
                    ? 'border-mn-accent-teal text-mn-accent-teal'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Website Content
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'documents'
                    ? 'border-mn-accent-teal text-mn-accent-teal'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-mn-accent-teal text-mn-accent-teal'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-mn-primary mb-4">Website Content Management</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-mn-neutral-lightblue bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Chunks</p>
                  <p className="text-3xl font-bold text-mn-primary">{chunkStats.totalChunks}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Pages Indexed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {Object.keys(chunkStats.chunksByPage).length}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {chunkStats.totalChunks > 0 ? 'Ready' : 'Not Seeded'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-mn-primary mb-4">Actions</h3>

                <div className="flex gap-4">
                  <button
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    className="flex items-center space-x-2 bg-mn-accent-teal text-white px-6 py-3 rounded-lg hover:bg-mn-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-5 w-5 ${isSeeding ? 'animate-spin' : ''}`} />
                    <span>{isSeeding ? 'Processing...' : 'Re-index PDF Content'}</span>
                  </button>

                  <button
                    onClick={handleSeedWebsiteContent}
                    disabled={isSeeding}
                    className="flex items-center space-x-2 bg-mn-primary text-white px-6 py-3 rounded-lg hover:bg-mn-accent-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-5 w-5 ${isSeeding ? 'animate-spin' : ''}`} />
                    <span>{isSeeding ? 'Processing...' : 'Index Website Content'}</span>
                  </button>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  Use "Re-index PDF Content" to re-process uploaded PDF documents. Use "Index Website Content" to add website pages (FAQs, Home, etc.) to the knowledge base.
                </p>

                {isSeeding && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">{seedProgress.message}</p>
                    {seedProgress.total > 0 && (
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(seedProgress.current / seedProgress.total) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {seedResult && (
                  <div
                    className={`mt-4 border rounded-lg p-4 ${
                      seedResult.success
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {seedResult.message}
                  </div>
                )}
              </div>

              {Object.keys(chunkStats.chunksByPage).length > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-mn-primary mb-4">Chunks by Page</h3>
                  <div className="space-y-2">
                    {Object.entries(chunkStats.chunksByPage)
                      .sort(([, a], [, b]) => b - a)
                      .map(([page, count]) => (
                        <div key={page} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-700">{page}</span>
                          <span className="text-sm font-semibold text-mn-accent-teal">{count} chunks</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentUpload onUploadComplete={() => {
              setDocumentRefreshTrigger(prev => prev + 1);
              loadChunkStats();
            }} />
            <DocumentList refreshTrigger={documentRefreshTrigger} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Conversations</p>
                  <BarChart3 className="h-5 w-5 text-mn-primary" />
                </div>
                <p className="text-3xl font-bold text-mn-primary">{analytics.totalConversations}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalMessages}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Positive Feedback</p>
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{analytics.positiveFeedback}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Negative Feedback</p>
                  <BarChart3 className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">{analytics.negativeFeedback}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-mn-primary mb-4">Usage Overview</h2>
              <p className="text-gray-600">
                The chatbot has handled {analytics.totalMessages} messages across {analytics.totalConversations} conversations.
              </p>
              {analytics.positiveFeedback + analytics.negativeFeedback > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Satisfaction Rate</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-600 h-4 rounded-full flex items-center justify-center text-xs text-white font-semibold"
                      style={{
                        width: `${
                          (analytics.positiveFeedback / (analytics.positiveFeedback + analytics.negativeFeedback)) * 100
                        }%`,
                      }}
                    >
                      {Math.round(
                        (analytics.positiveFeedback / (analytics.positiveFeedback + analytics.negativeFeedback)) * 100
                      )}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
