import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as LucideIcons from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
  display_order: number;
  artifact_count?: number;
}

interface CategoryManagerProps {
  refreshTrigger: number;
  onUpdate: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ refreshTrigger, onUpdate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'folder',
    color: '#3B82F6',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [refreshTrigger]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const { data: categoriesData } = await supabase
        .from('artifact_categories')
        .select('*')
        .order('display_order');

      if (categoriesData) {
        const categoriesWithCounts = await Promise.all(
          categoriesData.map(async (cat) => {
            const { count } = await supabase
              .from('project_artifacts')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', cat.id);

            return { ...cat, artifact_count: count || 0 };
          })
        );

        setCategories(categoriesWithCounts);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: '',
      icon: 'folder',
      color: '#3B82F6',
      description: '',
    });
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setIsAdding(false);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      description: category.description || '',
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      icon: 'folder',
      color: '#3B82F6',
      description: '',
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      if (isAdding) {
        const maxOrder = Math.max(...categories.map((c) => c.display_order), 0);
        const { error } = await supabase.from('artifact_categories').insert([
          {
            name: formData.name.trim(),
            icon: formData.icon,
            color: formData.color,
            description: formData.description.trim() || null,
            display_order: maxOrder + 1,
          },
        ]);

        if (error) throw error;
      } else if (editingId) {
        const { error } = await supabase
          .from('artifact_categories')
          .update({
            name: formData.name.trim(),
            icon: formData.icon,
            color: formData.color,
            description: formData.description.trim() || null,
          })
          .eq('id', editingId);

        if (error) throw error;
      }

      handleCancel();
      loadCategories();
      onUpdate();
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert('Failed to save category: ' + error.message);
    }
  };

  const handleDelete = async (id: string, artifactCount: number) => {
    if (artifactCount > 0) {
      alert(`Cannot delete category with ${artifactCount} artifacts. Please reassign the artifacts first.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase.from('artifact_categories').delete().eq('id', id);

      if (error) throw error;

      loadCategories();
      onUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const commonIcons = [
    'folder',
    'file-text',
    'target',
    'code',
    'workflow',
    'package',
    'book-open',
    'link',
    'settings',
    'database',
    'layers',
    'briefcase',
    'archive',
  ];

  const IconComponent = LucideIcons[formData.icon as keyof typeof LucideIcons] as any || LucideIcons.Folder;

  if (isLoading) {
    return <div className="text-center py-12">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mn-primary">Category Management</h2>
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="flex items-center space-x-2 bg-mn-accent-teal text-white px-4 py-2 rounded-lg hover:bg-mn-primary transition-colors disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        </div>

        {(isAdding || editingId) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-mn-primary mb-4">
              {isAdding ? 'Add New Category' : 'Edit Category'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
                >
                  {commonIcons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300"
                  />
                  <div
                    className="flex items-center justify-center w-16 h-10 rounded"
                    style={{ backgroundColor: formData.color }}
                  >
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm text-gray-600">{formData.color}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal"
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-mn-accent-teal text-white px-4 py-2 rounded-lg hover:bg-mn-primary transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No categories found</div>
          ) : (
            categories.map((category) => {
              const CategoryIcon = LucideIcons[category.icon as keyof typeof LucideIcons] as any || LucideIcons.Folder;

              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <CategoryIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <span className="text-sm text-gray-500">({category.artifact_count} artifacts)</span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Icon: {category.icon}</span>
                        <span>Color: {category.color}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.artifact_count || 0)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                      disabled={(category.artifact_count || 0) > 0}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
