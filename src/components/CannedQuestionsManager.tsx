import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Save, X, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CannedQuestion {
  id: string;
  question_text: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CannedQuestionsManagerProps {
  refreshTrigger?: number;
}

const CannedQuestionsManager: React.FC<CannedQuestionsManagerProps> = ({ refreshTrigger }) => {
  const [questions, setQuestions] = useState<CannedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOrder, setNewOrder] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, [refreshTrigger]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('canned_questions')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading canned questions:', error);
      alert('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newQuestion.trim()) {
      alert('Please enter a question');
      return;
    }

    try {
      const { error } = await supabase
        .from('canned_questions')
        .insert({
          question_text: newQuestion.trim(),
          display_order: newOrder,
          is_active: true,
        });

      if (error) throw error;

      setNewQuestion('');
      setNewOrder(0);
      setIsAddingNew(false);
      await loadQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  const handleEdit = (question: CannedQuestion) => {
    setEditingId(question.id);
    setEditText(question.question_text);
    setEditOrder(question.display_order);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) {
      alert('Please enter a question');
      return;
    }

    try {
      const { error } = await supabase
        .from('canned_questions')
        .update({
          question_text: editText.trim(),
          display_order: editOrder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditText('');
      setEditOrder(0);
      await loadQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditOrder(0);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('canned_questions')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await loadQuestions();
    } catch (error) {
      console.error('Error toggling question status:', error);
      alert('Failed to toggle question status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('canned_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const handleStartAdd = () => {
    const maxOrder = questions.length > 0
      ? Math.max(...questions.map(q => q.display_order))
      : 0;
    setNewOrder(maxOrder + 1);
    setIsAddingNew(true);
  };

  const activeCount = questions.filter(q => q.is_active).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mn-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-mn-primary">Canned Questions Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage suggested questions that appear in the chatbot interface
            </p>
          </div>
          <button
            onClick={handleStartAdd}
            className="flex items-center space-x-2 bg-mn-accent-teal text-white px-4 py-2 rounded-lg hover:bg-mn-primary transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-mn-neutral-lightblue bg-opacity-20 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Questions</p>
            <p className="text-3xl font-bold text-mn-primary">{questions.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Active Questions</p>
            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Inactive Questions</p>
            <p className="text-3xl font-bold text-gray-600">{questions.length - activeCount}</p>
          </div>
        </div>

        {isAddingNew && (
          <div className="border-2 border-mn-accent-teal rounded-lg p-4 mb-6 bg-blue-50">
            <h3 className="text-lg font-semibold text-mn-primary mb-4">Add New Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter your question here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={newOrder}
                  onChange={(e) => setNewOrder(parseInt(e.target.value) || 0)}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAdd}
                  className="flex items-center space-x-2 bg-mn-accent-teal text-white px-4 py-2 rounded-lg hover:bg-mn-primary transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Question</span>
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewQuestion('');
                    setNewOrder(0);
                  }}
                  className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {questions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No questions yet</p>
            <button
              onClick={handleStartAdd}
              className="text-mn-accent-teal hover:text-mn-primary font-medium"
            >
              Add your first question
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question) => (
              <div
                key={question.id}
                className={`border rounded-lg p-4 transition-all ${
                  question.is_active
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-300 bg-gray-100 opacity-60'
                }`}
              >
                {editingId === question.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text
                      </label>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={editOrder}
                        onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)}
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleSaveEdit(question.id)}
                        className="flex items-center space-x-2 bg-mn-accent-teal text-white px-4 py-2 rounded-lg hover:bg-mn-primary transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <GripVertical className="h-5 w-5" />
                        <span className="text-sm font-medium">#{question.display_order}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{question.question_text}</p>
                      </div>
                      <div>
                        {question.is_active ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-2 text-gray-600 hover:text-mn-accent-teal hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit question"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(question.id, question.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          question.is_active
                            ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                        title={question.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {question.is_active ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CannedQuestionsManager;
