import React, { useState, useEffect } from 'react';
import { FileText, Save, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { generateMasterContractTestData } from '../utils/testDataGenerator';

interface Solicitation {
  id: string;
  solicitation_id: string;
  swift_event_no: string;
  description: string;
}

interface FormData {
  vendor_name: string;
  vendor_address: string;
  solicitation_id: string;
  auth_rep_name: string;
  auth_rep_title: string;
  auth_rep_address: string;
  auth_rep_phone: string;
  submitter_name: string;
  submitter_signature: string;
  submitter_title: string;
  insurance_cert_holder: string;
}

const MasterContractSubmission: React.FC = () => {
  const navigate = useNavigate();
  const [solicitations, setSolicitations] = useState<Solicitation[]>([]);
  const [selectedSolicitation, setSelectedSolicitation] = useState<Solicitation | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    vendor_name: '',
    vendor_address: '',
    solicitation_id: '',
    auth_rep_name: '',
    auth_rep_title: '',
    auth_rep_address: '',
    auth_rep_phone: '',
    submitter_name: '',
    submitter_signature: '',
    submitter_title: '',
    insurance_cert_holder: '',
  });

  useEffect(() => {
    fetchSolicitations();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setIsTestMode(prev => {
          const newTestMode = !prev;
          if (newTestMode) {
            populateTestData();
            console.log('Test Mode ACTIVATED');
          } else {
            clearFormData();
            console.log('Test Mode DEACTIVATED');
          }
          return newTestMode;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [solicitations]);

  const fetchSolicitations = async () => {
    const { data, error } = await supabase
      .from('solicitations')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching solicitations:', error);
      setMessage({ type: 'error', text: 'Failed to load solicitations' });
    } else if (data) {
      setSolicitations(data);
    }
  };

  const populateTestData = () => {
    const testData = generateMasterContractTestData();
    setFormData({
      vendor_name: testData.vendor_name,
      vendor_address: testData.vendor_address,
      solicitation_id: solicitations.length > 0 ? solicitations[0].id : '',
      auth_rep_name: testData.auth_rep_name,
      auth_rep_title: testData.auth_rep_title,
      auth_rep_address: testData.auth_rep_address,
      auth_rep_phone: testData.auth_rep_phone,
      submitter_name: testData.submitter_name,
      submitter_signature: testData.submitter_signature,
      submitter_title: testData.submitter_title,
      insurance_cert_holder: testData.insurance_cert_holder,
    });
    if (solicitations.length > 0) {
      setSelectedSolicitation(solicitations[0]);
    }
  };

  const clearFormData = () => {
    setFormData({
      vendor_name: '',
      vendor_address: '',
      solicitation_id: '',
      auth_rep_name: '',
      auth_rep_title: '',
      auth_rep_address: '',
      auth_rep_phone: '',
      submitter_name: '',
      submitter_signature: '',
      submitter_title: '',
      insurance_cert_holder: '',
    });
    setSelectedSolicitation(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'solicitation_id') {
      const selected = solicitations.find(s => s.id === value);
      setSelectedSolicitation(selected || null);
    }
  };

  const validateForm = (): boolean => {
    console.log('Validating form with data:', formData);
    const requiredFields: (keyof FormData)[] = [
      'vendor_name',
      'vendor_address',
      'solicitation_id',
      'auth_rep_name',
      'auth_rep_title',
      'auth_rep_address',
      'auth_rep_phone',
      'submitter_name',
      'submitter_title',
      'insurance_cert_holder',
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        const errorMsg = `Please fill in all required fields: ${field.replace(/_/g, ' ')}`;
        console.error('Validation failed:', errorMsg, 'Field:', field, 'Value:', formData[field]);
        setMessage({ type: 'error', text: errorMsg });
        return false;
      }
    }

    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(formData.auth_rep_phone)) {
      console.error('Phone validation failed:', formData.auth_rep_phone);
      setMessage({ type: 'error', text: 'Please enter a valid phone number' });
      return false;
    }

    console.log('Validation passed!');
    return true;
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('master_contracts')
        .insert([{
          ...formData,
          status: 'draft',
          solicitation_date: new Date().toISOString(),
          effective_date: new Date().toISOString(),
          submission_date: new Date().toISOString(),
        }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Draft saved successfully! You can continue editing or submit when ready.' });
    } catch (error) {
      console.error('Error saving draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to save draft: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!');

    if (!validateForm()) {
      console.log('Validation failed, stopping submission');
      return;
    }

    console.log('Starting submission...');
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('master_contracts')
        .insert([{
          ...formData,
          status: 'submitted',
          solicitation_date: new Date().toISOString(),
          effective_date: new Date().toISOString(),
          submission_date: new Date().toISOString(),
        }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Contract submitted successfully! Thank you for your submission.' });
    } catch (error) {
      console.error('Error submitting contract:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to submit contract: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {isTestMode && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-600 flex items-center space-x-2 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span className="font-bold">TEST MODE ACTIVE (CTRL+I to toggle)</span>
        </div>
      )}

      <section className="bg-mn-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <FileText className="h-16 w-16 mx-auto" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Master Contract Submission
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Complete this form to submit your master contract pre-qualification response
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p>{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-mn-primary mb-6">Vendor Information</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Contractor Name (Vendor Name) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="vendor_name"
                    name="vendor_name"
                    value={formData.vendor_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="vendor_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Contractor Business Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="vendor_address"
                    name="vendor_address"
                    value={formData.vendor_address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Street Address, City, State, ZIP"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-mn-primary mb-6">Solicitation Information</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="solicitation_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Solicitation Identification <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="solicitation_id"
                    name="solicitation_id"
                    value={formData.solicitation_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    required
                  >
                    <option value="">Select a solicitation</option>
                    {solicitations.map(sol => (
                      <option key={sol.id} value={sol.id}>
                        {sol.solicitation_id} - {sol.description}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSolicitation && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">SWIFT Event Number:</span> {selectedSolicitation.swift_event_no}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Solicitation Date:</span> {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">Effective Date:</span> {new Date().toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-mn-primary mb-6">Authorized Representative</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="auth_rep_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="auth_rep_name"
                      name="auth_rep_name"
                      value={formData.auth_rep_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="auth_rep_title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="auth_rep_title"
                      name="auth_rep_title"
                      value={formData.auth_rep_title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth_rep_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="auth_rep_address"
                    name="auth_rep_address"
                    value={formData.auth_rep_address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Street Address, City, State, ZIP"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="auth_rep_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telephone <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    id="auth_rep_phone"
                    name="auth_rep_phone"
                    value={formData.auth_rep_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="(555) 555-5555"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-mn-primary mb-6">Submitter Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="submitter_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="submitter_name"
                      name="submitter_name"
                      value={formData.submitter_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="submitter_title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="submitter_title"
                      name="submitter_title"
                      value={formData.submitter_title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="submitter_signature" className="block text-sm font-medium text-gray-700 mb-2">
                    Digital Signature
                  </label>
                  <input
                    type="text"
                    id="submitter_signature"
                    name="submitter_signature"
                    value={formData.submitter_signature}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Type your full name as signature"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    By typing your name, you are providing a digital signature
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Submission Date:</span> {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-mn-primary mb-6">Insurance Information</h2>
              <div>
                <label htmlFor="insurance_cert_holder" className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Certificate Holder <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="insurance_cert_holder"
                  name="insurance_cert_holder"
                  value={formData.insurance_cert_holder}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-mn-accent-teal text-white font-semibold rounded-lg hover:bg-mn-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
                {loading ? 'Submitting...' : 'Submit Contract'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default MasterContractSubmission;
