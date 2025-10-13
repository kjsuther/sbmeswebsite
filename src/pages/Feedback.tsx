import React from 'react';
import { useState } from 'react';
import { MessageCircle, Mail, Phone, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Feedback: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Insert into feedback_outbox table with payload structure
      const outboxData = {
        payload: {
          name: formData.name,
          email: formData.email,
          category: formData.category,
          message: formData.message
        }
      };

      const { error } = await supabase
        .from('feedback_outbox')
        .insert([outboxData]);

      if (error) {
        throw error;
      }

      // Also insert into feedback_submissions for record keeping
      const submissionData = {
        name: formData.name,
        email: formData.email,
        category: formData.category,
        message: formData.message
      };

      const { error: submissionError } = await supabase
        .from('feedback_submissions')
        .insert([submissionData]);

      if (submissionError) {
        console.warn('Failed to insert into feedback_submissions:', submissionError);
        // Don't throw here - the main functionality (outbox) succeeded
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        category: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-mn-accent-teal text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Feedback & Engagement
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Your input is crucial to the success of our MES modernization initiative.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-mn-primary">
                We Want to Hear From You
              </h2>
              <p className="text-lg text-gray-600">
                [Placeholder text] Your feedback and insights are essential to ensuring our MES modernization 
                efforts meet the needs of all stakeholders. Whether you're a government employee, citizen, 
                or industry partner, your perspective matters.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MessageCircle className="h-6 w-6 text-mn-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-mn-primary">Share Your Thoughts</h3>
                    <p className="text-gray-600">Tell us about your current experiences and future needs.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-mn-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-mn-primary">Stay Informed</h3>
                    <p className="text-gray-600">Receive updates on our modernization progress.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-mn-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-mn-primary">Participate in Sessions</h3>
                    <p className="text-gray-600">Join stakeholder meetings and feedback sessions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-mn-primary mb-6">
                Submit Your Feedback
              </h3>
              
              {submitStatus === 'success' && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Thank you! Your feedback has been submitted successfully.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        Error submitting feedback: {errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Your full name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a category</option>
                    <option value="general">General Feedback</option>
                    <option value="technical">Technical Suggestions</option>
                    <option value="process">Process Improvements</option>
                    <option value="challenge">Challenge Questions</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Share your thoughts, suggestions, or questions..."
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-mn-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-mn-accent-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* RFI Engagement Results */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-mn-accent-teal text-white py-8 px-6 rounded-t-xl">
            <h2 className="text-3xl font-bold">
              RFI Engagement Results
            </h2>
          </div>
          <div className="bg-white rounded-b-xl shadow-lg p-8">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              The following dashboard summarizes participation in the MES RFI process. It shows the number of
              organizations and individuals who submitted responses, the types and sizes of vendors who engaged,
              and how well the strategy resonated. These results will help inform next steps as DHS transitions
              from the RFI into the upcoming RFP process.
            </p>
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                <div className="w-full bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    title="RFI Vendor Survey Responses"
                    width="100%"
                    height="100%"
                    src="https://app.powerbi.com/view?r=eyJrIjoiMGQ1NGY1YjktNTAzMy00YzhiLTgzMzMtY2JhNWEzOTY4NDQ4IiwidCI6ImUwNTBkOWJiLTg4MDUtNGNkNi04NTRlLWQxYzYzMWI3ZjcxZCJ9"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    If the dashboard does not display above, you can view it directly:
                  </p>
                  <a
                    href="https://app.powerbi.com/view?r=eyJrIjoiMGQ1NGY1YjktNTAzMy00YzhiLTgzMzMtY2JhNWEzOTY4NDQ4IiwidCI6ImUwNTBkOWJiLTg4MDUtNGNkNi04NTRlLWQxYzYzMWI3ZjcxZCJ9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-mn-accent-teal text-white font-semibold rounded-lg hover:bg-mn-accent-darkteal transition-colors shadow-md"
                  >
                    Open Dashboard in New Tab
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Feedback;