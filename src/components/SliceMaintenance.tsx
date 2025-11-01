import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Slice {
  id: string;
  slice_code: string;
  slice_description: string;
  customer_journey: string;
  persona_definition: string;
  expected_result: string;
  outcomes: string;
  slice_focus: string;
}

const SliceMaintenance: React.FC = () => {
  const [slices, setSlices] = useState<Slice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Slice, 'id'>>({
    slice_code: '',
    slice_description: '',
    customer_journey: '',
    persona_definition: '',
    expected_result: '',
    outcomes: '',
    slice_focus: '',
  });

  useEffect(() => {
    fetchSlices();
  }, []);

  const fetchSlices = async () => {
    try {
      const { data, error } = await supabase
        .from('slices')
        .select('*')
        .order('slice_code');

      if (error) throw error;
      setSlices(data || []);
    } catch (error) {
      console.error('Error fetching slices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('slices')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('slices')
          .insert([formData]);

        if (error) throw error;
      }

      await fetchSlices();
      resetForm();
    } catch (error) {
      console.error('Error saving slice:', error);
      alert('Error saving slice. Please try again.');
    }
  };

  const handleEdit = (slice: Slice) => {
    setEditingId(slice.id);
    setFormData({
      slice_code: slice.slice_code,
      slice_description: slice.slice_description,
      customer_journey: slice.customer_journey,
      persona_definition: slice.persona_definition,
      expected_result: slice.expected_result,
      outcomes: slice.outcomes,
      slice_focus: slice.slice_focus,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slice?')) return;

    try {
      const { error } = await supabase
        .from('slices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSlices();
    } catch (error) {
      console.error('Error deleting slice:', error);
      alert('Error deleting slice. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      slice_code: '',
      slice_description: '',
      customer_journey: '',
      persona_definition: '',
      expected_result: '',
      outcomes: '',
      slice_focus: '',
    });
    setEditingId(null);
    setIsEditing(false);
  };


  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-mn-primary">Slice Maintenance</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-mn-primary text-white rounded-lg hover:bg-mn-accent-teal transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Slice
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slice Code *
              </label>
              <input
                type="text"
                required
                value={formData.slice_code}
                onChange={(e) => setFormData({ ...formData, slice_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
                placeholder="e.g., 1A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slice Description *
              </label>
              <input
                type="text"
                required
                value={formData.slice_description}
                onChange={(e) => setFormData({ ...formData, slice_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
                placeholder="e.g., New applicant (ineligible for MA, but eligible for MSP)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Journey *
            </label>
            <textarea
              required
              value={formData.customer_journey}
              onChange={(e) => setFormData({ ...formData, customer_journey: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
              placeholder="Describe the customer journey..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Persona Definition *
            </label>
            <textarea
              required
              value={formData.persona_definition}
              onChange={(e) => setFormData({ ...formData, persona_definition: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
              placeholder="Define the persona with details like age, disability status, marital status, income, assets, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Result *
            </label>
            <textarea
              required
              value={formData.expected_result}
              onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
              placeholder="Describe the expected outcome..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outcomes
            </label>
            <textarea
              value={formData.outcomes}
              onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
              placeholder="e.g., New enrollment&#10;• Elapsed processing duration&#10;• Agency effectiveness (staff effort and satisfaction)&#10;• Customer satisfaction"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slice Focus *
            </label>
            <textarea
              required
              value={formData.slice_focus}
              onChange={(e) => setFormData({ ...formData, slice_focus: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mn-accent-teal"
              placeholder="e.g., Evaluate the ability to create an integrated solution that achieves the desired new enrollment end-to-end outcomes"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-mn-primary text-white rounded-lg hover:bg-mn-accent-teal transition-colors"
            >
              <Save className="h-4 w-4" />
              {editingId ? 'Update' : 'Save'} Slice
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {slices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No slices found. Click "Add New Slice" to create one.
          </div>
        ) : (
          slices.map((slice) => (
            <div key={slice.id} className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-mn-primary">
                    Slice {slice.slice_code}
                  </h3>
                  <p className="text-gray-600">{slice.slice_description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(slice)}
                    className="p-2 text-mn-primary hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slice.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Journey</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{slice.customer_journey}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Persona Definition</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{slice.persona_definition}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Expected Result</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{slice.expected_result}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Slice Focus</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{slice.slice_focus}</p>
                </div>
              </div>

              {slice.outcomes && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Outcomes</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{slice.outcomes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SliceMaintenance;
