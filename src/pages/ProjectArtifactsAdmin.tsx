import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, LogOut, Upload, Tag, BarChart3, RefreshCw } from 'lucide-react';
import { isAdminAuthenticated, clearAdminSession } from '../lib/adminAuth';
import { supabase } from '../lib/supabase';
import ArtifactsTable from '../components/ArtifactsTable';
import ArtifactImport from '../components/ArtifactImport';
import CategoryManager from '../components/CategoryManager';
import ArtifactsAnalytics from '../components/ArtifactsAnalytics';

const ProjectArtifactsAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'artifacts' | 'import' | 'categories' | 'analytics'>('artifacts');
  const [stats, setStats] = useState({
    totalArtifacts: 0,
    totalCategories: 0,
    recentAdditions: 0,
    lastImportDate: null as string | null,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadStats();
  }, [navigate, refreshTrigger]);

  const loadStats = async () => {
    try {
      const { count: artifactCount } = await supabase
        .from('project_artifacts')
        .select('*', { count: 'exact', head: true });

      const { count: categoryCount } = await supabase
        .from('artifact_categories')
        .select('*', { count: 'exact', head: true });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentCount } = await supabase
        .from('project_artifacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: lastImport } = await supabase
        .from('project_artifacts')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalArtifacts: artifactCount || 0,
        totalCategories: categoryCount || 0,
        recentAdditions: recentCount || 0,
        lastImportDate: lastImport?.created_at || null,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-mn-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FolderKanban className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Project Artifacts Admin</h1>
                <p className="text-blue-100 mt-1">Manage project links and reference materials</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/portal')}
                className="text-white hover:text-blue-100 transition-colors"
              >
                Back to Portal
              </button>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Artifacts</p>
            <p className="text-3xl font-bold text-mn-primary">{stats.totalArtifacts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Categories</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalCategories}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Added This Month</p>
            <p className="text-3xl font-bold text-green-600">{stats.recentAdditions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Last Import</p>
            <p className="text-lg font-semibold text-gray-700">
              {stats.lastImportDate
                ? new Date(stats.lastImportDate).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200 flex items-center justify-between">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('artifacts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === 'artifacts'
                    ? 'border-mn-accent-teal text-mn-accent-teal'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FolderKanban className="h-4 w-4" />
                <span>Artifacts</span>
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === 'import'
                    ? 'border-mn-accent-teal text-mn-accent-teal'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === 'categories'
                    ? 'border-mn-accent-teal text-mn-accent-teal'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Tag className="h-4 w-4" />
                <span>Categories</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === 'analytics'
                    ? 'border-mn-accent-teal text-mn-accent-teal'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </nav>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 text-gray-600 hover:text-mn-primary transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {activeTab === 'artifacts' && (
          <ArtifactsTable refreshTrigger={refreshTrigger} onUpdate={handleRefresh} />
        )}

        {activeTab === 'import' && (
          <ArtifactImport onImportComplete={handleRefresh} />
        )}

        {activeTab === 'categories' && (
          <CategoryManager refreshTrigger={refreshTrigger} onUpdate={handleRefresh} />
        )}

        {activeTab === 'analytics' && (
          <ArtifactsAnalytics refreshTrigger={refreshTrigger} />
        )}
      </div>
    </div>
  );
};

export default ProjectArtifactsAdmin;
