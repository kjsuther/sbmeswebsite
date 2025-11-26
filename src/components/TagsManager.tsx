import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DocumentTag {
  id: string;
  tag_name: string;
  parent_tag_id: string | null;
  description: string;
  color: string;
  usage_count: number;
  created_at: string;
}

const TagsManager: React.FC = () => {
  const [tags, setTags] = useState<DocumentTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  const [newTag, setNewTag] = useState({
    tag_name: '',
    parent_tag_id: null as string | null,
    description: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_tags')
        .select('*')
        .order('tag_name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.tag_name.trim()) return;

    try {
      const { error } = await supabase
        .from('document_tags')
        .insert([newTag]);

      if (error) throw error;

      setNewTag({
        tag_name: '',
        parent_tag_id: null,
        description: '',
        color: '#3B82F6',
      });
      setIsAddingTag(false);
      await loadTags();
    } catch (error) {
      console.error('Error adding tag:', error);
      alert('Failed to add tag');
    }
  };

  const handleUpdateTag = async (tagId: string, updates: Partial<DocumentTag>) => {
    try {
      const { error } = await supabase
        .from('document_tags')
        .update(updates)
        .eq('id', tagId);

      if (error) throw error;

      await loadTags();
      setEditingTag(null);
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? This will remove it from all associated content.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('document_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      await loadTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Failed to delete tag');
    }
  };

  const toggleExpanded = (tagId: string) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedTags(newExpanded);
  };

  const getChildTags = (parentId: string | null) => {
    return tags.filter(tag => tag.parent_tag_id === parentId);
  };

  const renderTag = (tag: DocumentTag, level: number = 0) => {
    const children = getChildTags(tag.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedTags.has(tag.id);
    const isEditing = editingTag === tag.id;

    return (
      <div key={tag.id} style={{ marginLeft: `${level * 24}px` }}>
        <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg group">
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(tag.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}

            {!hasChildren && <div className="w-6" />}

            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: tag.color }}
            />

            {isEditing ? (
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  defaultValue={tag.tag_name}
                  onChange={(e) => {
                    const input = e.target;
                    input.dataset.value = e.target.value;
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  defaultValue={tag.description || ''}
                  placeholder="Description"
                  onChange={(e) => {
                    const input = e.target;
                    input.dataset.description = e.target.value;
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="color"
                  defaultValue={tag.color}
                  onChange={(e) => {
                    const input = e.target;
                    input.dataset.color = e.target.value;
                  }}
                  className="w-20 h-8"
                />
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{tag.tag_name}</span>
                  <span className="text-xs text-gray-500">({tag.usage_count} uses)</span>
                </div>
                {tag.description && (
                  <p className="text-sm text-gray-600 mt-1">{tag.description}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isEditing ? (
              <>
                <button
                  onClick={(e) => {
                    const container = e.currentTarget.closest('.flex-1') as HTMLElement;
                    const nameInput = container?.querySelector('input[type="text"]') as HTMLInputElement;
                    const descInput = container?.querySelectorAll('input[type="text"]')[1] as HTMLInputElement;
                    const colorInput = container?.querySelector('input[type="color"]') as HTMLInputElement;

                    handleUpdateTag(tag.id, {
                      tag_name: nameInput?.dataset.value || nameInput?.value || tag.tag_name,
                      description: descInput?.dataset.description || descInput?.value || tag.description,
                      color: colorInput?.dataset.color || colorInput?.value || tag.color,
                    });
                  }}
                  className="p-2 hover:bg-green-100 text-green-600 rounded"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingTag(null)}
                  className="p-2 hover:bg-gray-200 text-gray-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditingTag(tag.id)}
                  className="p-2 hover:bg-blue-100 text-blue-600 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="p-2 hover:bg-red-100 text-red-600 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderTag(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootTags = getChildTags(null);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Tag className="h-6 w-6 text-mn-primary" />
          <h2 className="text-2xl font-bold text-mn-primary">Tags Management</h2>
        </div>
        <button
          onClick={() => setIsAddingTag(true)}
          className="flex items-center space-x-2 bg-mn-accent-teal text-white px-4 py-2 rounded-lg hover:bg-mn-primary transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Tag</span>
        </button>
      </div>

      {isAddingTag && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Add New Tag</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name
              </label>
              <input
                type="text"
                value={newTag.tag_name}
                onChange={(e) => setNewTag({ ...newTag, tag_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
                placeholder="e.g., RFP Requirements"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
                placeholder="Brief description of the tag"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Tag (Optional)
              </label>
              <select
                value={newTag.parent_tag_id || ''}
                onChange={(e) => setNewTag({ ...newTag, parent_tag_id: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
              >
                <option value="">None (Top Level)</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.tag_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={newTag.color}
                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                className="w-20 h-10 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-mn-accent-teal text-white rounded-lg hover:bg-mn-primary transition-colors"
              >
                Add Tag
              </button>
              <button
                onClick={() => {
                  setIsAddingTag(false);
                  setNewTag({
                    tag_name: '',
                    parent_tag_id: null,
                    description: '',
                    color: '#3B82F6',
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading tags...</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tags yet. Create your first tag to get started.
        </div>
      ) : (
        <div className="space-y-1">
          {rootTags.map(tag => renderTag(tag))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total Tags: <span className="font-semibold">{tags.length}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Tags help organize and categorize content for better searchability and discovery.
        </p>
      </div>
    </div>
  );
};

export default TagsManager;
