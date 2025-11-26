import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Artifact {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category_id: string | null;
  sub_category: string | null;
  link_type: string | null;
  content_notes: string | null;
  tags: string[];
  file_type: string | null;
  owner: string | null;
}

interface ArtifactFormModalProps {
  artifact: Artifact | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

const ArtifactFormModal: React.FC<ArtifactFormModalProps> = ({ artifact, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category_id: '',
    sub_category: '',
    link_type: '',
    content_notes: '',
    tags: '',
    file_type: '',
    owner: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (artifact) {
      setFormData({
        title: artifact.title,
        description: artifact.description || '',
        url: artifact.url,
        category_id: artifact.category_id || '',
        sub_category: artifact.sub_category || '',
        link_type: artifact.link_type || '',
        content_notes: artifact.content_notes || '',
        tags: artifact.tags.join(', '),
        file_type: artifact.file_type || '',
        owner: artifact.owner || '',
      });
    }
  }, [artifact]);

  useEffect(() => {
    if (formData.url) {
      detectFileType(formData.url);
    }
  }, [formData.url]);

  const detectFileType = (url: string) => {
    const lowerUrl = url.toLowerCase();
    let detectedType = '';

    if (lowerUrl.includes('sharepoint')) {
      detectedType = 'SharePoint';
    } else if (lowerUrl.includes('.xlsx') || lowerUrl.includes('.xls')) {
      detectedType = 'Excel';
    } else if (lowerUrl.includes('.docx') || lowerUrl.includes('.doc')) {
      detectedType = 'Word';
    } else if (lowerUrl.includes('.pptx') || lowerUrl.includes('.ppt')) {
      detectedType = 'PowerPoint';
    } else if (lowerUrl.includes('.pdf')) {
      detectedType = 'PDF';
    } else if (lowerUrl.includes('teams.microsoft.com')) {
      detectedType = 'Teams';
    } else if (lowerUrl.includes('.zip') || lowerUrl.includes('.rar')) {
      detectedType = 'Archive';
    }

    if (detectedType && !formData.file_type) {
      setFormData((prev) => ({ ...prev, file_type: detectedType }));
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const checkDuplicateUrl = async (url: string): Promise<boolean> => {
    const { data } = await supabase
      .from('project_artifacts')
      .select('id')
      .eq('url', url)
      .neq('id', artifact?.id || '');

    return (data?.length || 0) > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }

    if (!validateUrl(formData.url)) {
      setError('Please enter a valid URL');
      return;
    }

    const isDuplicate = await checkDuplicateUrl(formData.url);
    if (isDuplicate) {
      if (!confirm('This URL already exists. Do you want to continue?')) {
        return;
      }
    }

    setIsSaving(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const dataToSave = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        url: formData.url.trim(),
        category_id: formData.category_id || null,
        sub_category: formData.sub_category.trim() || null,
        link_type: formData.link_type.trim() || null,
        content_notes: formData.content_notes.trim() || null,
        tags: tagsArray,
        file_type: formData.file_type.trim() || null,
        owner: formData.owner.trim() || null,
      };

      if (artifact) {
        const { error } = await supabase
          .from('project_artifacts')
          .update(dataToSave)
          .eq('id', artifact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('project_artifacts').insert([dataToSave]);

        if (error) throw error;
      }

      onSave();
    } catch (err: any) {
      console.error('Error saving artifact:', err);
      setError(err.message || 'Failed to save artifact');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-mn-primary">
            {artifact ? 'Edit Artifact' : 'Add New Artifact'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              placeholder="Enter artifact title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              placeholder="Enter a description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              placeholder="https://example.com/document"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter the full URL including https://</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
            <input
              type="text"
              value={formData.sub_category}
              onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              placeholder="Enter sub-category (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Type</label>
            <input
              type="text"
              value={formData.link_type}
              onChange={(e) => setFormData({ ...formData, link_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              placeholder="e.g., Internal, External, Documentation (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Notes</label>
            <textarea
              value={formData.content_notes}
              onChange={(e) => setFormData({ ...formData, content_notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              placeholder="Additional notes about the content (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
            <input
              type="text"
              value={formData.file_type}
              onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              placeholder="Auto-detected from URL"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-detected, but you can override it if needed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
              placeholder="Enter owner name"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-mn-accent-teal text-white rounded-lg hover:bg-mn-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : artifact ? 'Update Artifact' : 'Create Artifact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtifactFormModal;
