import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ExternalLink, Copy, Check, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ArtifactFormModal from './ArtifactFormModal';

interface Artifact {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category_id: string | null;
  category_name?: string;
  category_color?: string;
  sub_category: string | null;
  link_type: string | null;
  content_notes: string | null;
  tags: string[];
  file_type: string | null;
  owner: string | null;
  created_at: string;
  updated_at: string;
}

interface ArtifactsTableProps {
  refreshTrigger: number;
  onUpdate: () => void;
}

const ArtifactsTable: React.FC<ArtifactsTableProps> = ({ refreshTrigger, onUpdate }) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [filteredArtifacts, setFilteredArtifacts] = useState<Artifact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'title' | 'created_at' | 'updated_at'>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  useEffect(() => {
    filterArtifacts();
  }, [artifacts, searchQuery, categoryFilter, fileTypeFilter, sortField, sortDirection]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: categoriesData } = await supabase
        .from('artifact_categories')
        .select('id, name, color')
        .order('display_order');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      const { data: artifactsData } = await supabase
        .from('project_artifacts')
        .select(`
          *,
          category:artifact_categories(name, color)
        `)
        .order('updated_at', { ascending: false });

      if (artifactsData) {
        const transformedData = artifactsData.map((artifact: any) => ({
          ...artifact,
          category_name: artifact.category?.name,
          category_color: artifact.category?.color,
        }));
        setArtifacts(transformedData);
      }
    } catch (error) {
      console.error('Error loading artifacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterArtifacts = () => {
    let filtered = [...artifacts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (artifact) =>
          artifact.title.toLowerCase().includes(query) ||
          artifact.description?.toLowerCase().includes(query) ||
          artifact.url.toLowerCase().includes(query) ||
          artifact.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          artifact.owner?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((artifact) => artifact.category_id === categoryFilter);
    }

    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter((artifact) => artifact.file_type === fileTypeFilter);
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'title') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredArtifacts(filtered);
  };

  const handleSort = (field: 'title' | 'created_at' | 'updated_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artifact?')) return;

    try {
      const { error } = await supabase.from('project_artifacts').delete().eq('id', id);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error deleting artifact:', error);
      alert('Failed to delete artifact');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected artifacts?`)) return;

    try {
      const { error } = await supabase
        .from('project_artifacts')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      setSelectedIds(new Set());
      onUpdate();
    } catch (error) {
      console.error('Error deleting artifacts:', error);
      alert('Failed to delete artifacts');
    }
  };

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Title', 'Description', 'URL', 'Category', 'Sub-Category', 'Link Type', 'Content Notes', 'Tags', 'File Type', 'Owner', 'Created At'].join(','),
      ...filteredArtifacts.map((artifact) =>
        [
          `"${artifact.title}"`,
          `"${artifact.description || ''}"`,
          `"${artifact.url}"`,
          `"${artifact.category_name || ''}"`,
          `"${artifact.sub_category || ''}"`,
          `"${artifact.link_type || ''}"`,
          `"${artifact.content_notes || ''}"`,
          `"${artifact.tags.join('; ')}"`,
          `"${artifact.file_type || ''}"`,
          `"${artifact.owner || ''}"`,
          `"${new Date(artifact.created_at).toLocaleDateString()}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artifacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const fileTypes = Array.from(new Set(artifacts.map((a) => a.file_type).filter(Boolean)));

  if (isLoading) {
    return <div className="text-center py-12">Loading artifacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search artifacts by title, description, URL, tags, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setEditingArtifact(null);
              setShowFormModal(true);
            }}
            className="ml-4 flex items-center space-x-2 bg-mn-accent-teal text-white px-4 py-2 rounded-lg hover:bg-mn-primary transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Artifact</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
          >
            <option value="all">All File Types</option>
            {fileTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete ({selectedIds.size})</span>
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredArtifacts.length} of {artifacts.length} artifacts
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredArtifacts.length && filteredArtifacts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(filteredArtifacts.map((a) => a.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:text-mn-primary"
                  onClick={() => handleSort('title')}
                >
                  Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sub-Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Link Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:text-mn-primary"
                  onClick={() => handleSort('updated_at')}
                >
                  Updated {sortField === 'updated_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArtifacts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    No artifacts found
                  </td>
                </tr>
              ) : (
                filteredArtifacts.map((artifact) => (
                  <tr key={artifact.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(artifact.id)}
                        onChange={() => toggleSelection(artifact.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{artifact.title}</div>
                      {artifact.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{artifact.description}</div>
                      )}
                      {artifact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {artifact.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {artifact.category_name && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: artifact.category_color }}
                        >
                          {artifact.category_name}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{artifact.sub_category || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{artifact.link_type || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{artifact.owner || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(artifact.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(artifact.url, '_blank')}
                          className="p-1 text-gray-600 hover:text-mn-primary transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopyUrl(artifact.url, artifact.id)}
                          className="p-1 text-gray-600 hover:text-mn-accent-teal transition-colors"
                          title="Copy URL"
                        >
                          {copiedId === artifact.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingArtifact(artifact);
                            setShowFormModal(true);
                          }}
                          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(artifact.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFormModal && (
        <ArtifactFormModal
          artifact={editingArtifact}
          categories={categories}
          onClose={() => {
            setShowFormModal(false);
            setEditingArtifact(null);
          }}
          onSave={() => {
            setShowFormModal(false);
            setEditingArtifact(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default ArtifactsTable;
