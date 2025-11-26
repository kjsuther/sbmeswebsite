import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, FileType } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  totalArtifacts: number;
  totalCategories: number;
  mostCommonFileType: string;
  artifactsThisMonth: number;
  byCategory: Array<{ name: string; count: number; color: string }>;
  byFileType: Array<{ type: string; count: number }>;
  recentActivity: Array<{ title: string; action: string; date: string }>;
}

interface ArtifactsAnalyticsProps {
  refreshTrigger: number;
}

const ArtifactsAnalytics: React.FC<ArtifactsAnalyticsProps> = ({ refreshTrigger }) => {
  const [data, setData] = useState<AnalyticsData>({
    totalArtifacts: 0,
    totalCategories: 0,
    mostCommonFileType: 'N/A',
    artifactsThisMonth: 0,
    byCategory: [],
    byFileType: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [refreshTrigger]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const { count: totalArtifacts } = await supabase
        .from('project_artifacts')
        .select('*', { count: 'exact', head: true });

      const { count: totalCategories } = await supabase
        .from('artifact_categories')
        .select('*', { count: 'exact', head: true });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: artifactsThisMonth } = await supabase
        .from('project_artifacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      const { data: categories } = await supabase
        .from('artifact_categories')
        .select('id, name, color')
        .order('display_order');

      const byCategory = await Promise.all(
        (categories || []).map(async (cat) => {
          const { count } = await supabase
            .from('project_artifacts')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id);

          return {
            name: cat.name,
            count: count || 0,
            color: cat.color,
          };
        })
      );

      const { data: artifacts } = await supabase
        .from('project_artifacts')
        .select('file_type')
        .not('file_type', 'is', null);

      const fileTypeCounts: Record<string, number> = {};
      (artifacts || []).forEach((artifact) => {
        if (artifact.file_type) {
          fileTypeCounts[artifact.file_type] = (fileTypeCounts[artifact.file_type] || 0) + 1;
        }
      });

      const byFileType = Object.entries(fileTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      const mostCommonFileType = byFileType.length > 0 ? byFileType[0].type : 'N/A';

      const { data: recentArtifacts } = await supabase
        .from('project_artifacts')
        .select('title, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(10);

      const recentActivity = (recentArtifacts || []).map((artifact) => ({
        title: artifact.title,
        action: 'Added',
        date: artifact.created_at,
      }));

      setData({
        totalArtifacts: totalArtifacts || 0,
        totalCategories: totalCategories || 0,
        mostCommonFileType,
        artifactsThisMonth: artifactsThisMonth || 0,
        byCategory: byCategory.filter((cat) => cat.count > 0),
        byFileType,
        recentActivity,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Artifacts</p>
            <BarChart3 className="h-5 w-5 text-mn-primary" />
          </div>
          <p className="text-3xl font-bold text-mn-primary">{data.totalArtifacts}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Categories</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.totalCategories}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Most Common Type</p>
            <FileType className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{data.mostCommonFileType}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Added This Month</p>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{data.artifactsThisMonth}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-mn-primary mb-4">Artifacts by Category</h3>
          {data.byCategory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {data.byCategory.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{cat.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(cat.count / data.totalArtifacts) * 100}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-mn-primary mb-4">Artifacts by File Type</h3>
          {data.byFileType.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {data.byFileType.map((ft) => (
                <div key={ft.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{ft.type}</span>
                  <span className="text-lg font-bold text-mn-accent-teal">{ft.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-mn-primary mb-4">Recent Activity</h3>
        {data.recentActivity.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-mn-primary mb-4">Summary</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            Your project artifacts library contains <span className="font-bold text-mn-primary">{data.totalArtifacts}</span> artifacts
            organized across <span className="font-bold text-blue-600">{data.totalCategories}</span> categories.
          </p>
          <p>
            The most common file type is <span className="font-bold text-green-600">{data.mostCommonFileType}</span>, and
            you've added <span className="font-bold text-purple-600">{data.artifactsThisMonth}</span> artifacts this month.
          </p>
          {data.byCategory.length > 0 && (
            <p>
              The largest category is <span className="font-bold" style={{ color: data.byCategory[0].color }}>{data.byCategory[0].name}</span> with {data.byCategory[0].count} artifacts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtifactsAnalytics;
