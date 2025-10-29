import React, { useState, useEffect } from 'react';
import { FileText, Save, Send, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { generateMasterContractTestData } from '../utils/testDataGenerator';
import { generateMasterContractPDF } from '../utils/masterContractPdfGenerator';

interface Solicitation {
  id: string;
  solicitation_id: string;
  swift_event_no: string;
  description: string;
}

interface FormData {
  vendor_name: string;
  vendor_address: string;
  solicitation_id: string | null;
  auth_rep_name: string;
  auth_rep_title: string;
  auth_rep_address: string;
  auth_rep_phone: string;
  submitter_name: string;
  submitter_signature: string;
  submitter_title: string;
  insurance_cert_holder: string;
  insurance_agency_address: string;
}

const MasterContractSubmission: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [contractPdfUrl, setContractPdfUrl] = useState<string | null>(null);
  const [submittedContractData, setSubmittedContractData] = useState<any>(null);
  const [submittedContractId, setSubmittedContractId] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    vendor_name: '',
    vendor_address: '',
    solicitation_id: null,
    auth_rep_name: '',
    auth_rep_title: '',
    auth_rep_address: '',
    auth_rep_phone: '',
    submitter_name: '',
    submitter_signature: '',
    submitter_title: '',
    insurance_cert_holder: '',
    insurance_agency_address: '',
  });


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setIsTestMode(prev => {
          const newTestMode = !prev;
          if (newTestMode) {
            populateTestData();
          } else {
            clearFormData();
          }
          return newTestMode;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const populateTestData = () => {
    const testData = generateMasterContractTestData();
    setFormData({
      vendor_name: testData.vendor_name,
      vendor_address: testData.vendor_address,
      solicitation_id: null,
      auth_rep_name: testData.auth_rep_name,
      auth_rep_title: testData.auth_rep_title,
      auth_rep_address: testData.auth_rep_address,
      auth_rep_phone: testData.auth_rep_phone,
      submitter_name: testData.submitter_name,
      submitter_signature: testData.submitter_signature,
      submitter_title: testData.submitter_title,
      insurance_cert_holder: testData.insurance_cert_holder,
      insurance_agency_address: testData.insurance_agency_address,
    });
  };

  const handleDownloadPdf = async (contractData: any, contractId: string) => {
    try {
      console.log('Generating PDF for download...');
      const pdfBlob = await generateMasterContractPDF(contractData, contractId);

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `Master_Contract_${contractData.vendor_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown'}_${timestamp}.pdf`;

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('PDF download initiated');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try viewing it instead.');
    }
  };

  const clearFormData = () => {
    setFormData({
      vendor_name: '',
      vendor_address: '',
      solicitation_id: null,
      auth_rep_name: '',
      auth_rep_title: '',
      auth_rep_address: '',
      auth_rep_phone: '',
      submitter_name: '',
      submitter_signature: '',
      submitter_title: '',
      insurance_cert_holder: '',
      insurance_agency_address: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof FormData)[] = [
      'vendor_name',
      'vendor_address',
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
        setMessage({ type: 'error', text: errorMsg });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
    }

    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(formData.auth_rep_phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

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

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setContractPdfUrl(null);

    try {
      const submissionData = {
        ...formData,
        status: 'submitted',
        solicitation_date: '2025-10-01T00:00:00.000Z',
        effective_date: new Date().toISOString(),
        submission_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('master_contracts')
        .insert([submissionData])
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No contract data returned');
      }

      const contractId = data[0].id;

      setMessage({
        type: 'success',
        text: 'Contract submitted successfully! Generating your contract document...'
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        console.log('Starting PDF generation...');
        const fullContractData = {
          ...data[0],
          solicitation: {
            solicitation_id: 'MES MODERNIZATION',
            swift_event_no: null,
            description: 'MES MODERNIZATION'
          },
        };

        let pdfBlob: Blob;

        try {
          console.log('Attempting to call edge function to fill PDF template...');
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fill-master-contract-pdf`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ contractData: fullContractData }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.warn('Template edge function failed, trying server-side generation:', errorText);
            throw new Error('Template not available');
          }

          pdfBlob = await response.blob();
          console.log('PDF blob generated from template, size:', pdfBlob.size);
        } catch (templateError) {
          try {
            console.log('Attempting server-side PDF generation...');
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-master-contract-pdf`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractData: fullContractData, contractId }),
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.warn('Server-side generation failed, falling back to client-side:', errorText);
              throw new Error('Server-side generation failed');
            }

            pdfBlob = await response.blob();
            console.log('PDF blob generated from server, size:', pdfBlob.size);
          } catch (serverError) {
            console.log('Server-side generation failed, using client-side fallback');
            pdfBlob = await generateMasterContractPDF(fullContractData, contractId);
            console.log('PDF blob generated using client-side fallback, size:', pdfBlob.size);
          }
        }

        const fileName = `contract_${contractId}_${Date.now()}.pdf`;
        console.log('Uploading PDF to storage:', fileName);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('master-contracts')
          .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: false,
          });

        if (uploadError) {
          console.error('PDF upload error:', uploadError);
          setMessage({
            type: 'success',
            text: 'Contract submitted successfully!'
          });
          clearFormData();
        } else {
          console.log('PDF uploaded successfully!');
          const { data: urlData } = supabase.storage
            .from('master-contracts')
            .getPublicUrl(fileName);

          console.log('Public URL:', urlData.publicUrl);

          await supabase
            .from('master_contracts')
            .update({ contract_document_url: urlData.publicUrl })
            .eq('id', contractId);

          setContractPdfUrl(urlData.publicUrl);
          setSubmittedContractData(fullContractData);
          setSubmittedContractId(contractId);
          setMessage({
            type: 'success',
            text: 'Contract submitted successfully! Your contract PDF is ready.'
          });
        }
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        setMessage({
          type: 'success',
          text: 'Contract submitted successfully!'
        });
        clearFormData();
      }

      setIsTestMode(false);
    } catch (error) {
      console.error('Error submitting contract:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to submit contract: ${errorMessage}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <div className={`mb-6 p-6 rounded-lg border-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-900 border-green-300' : 'bg-red-50 text-red-900 border-red-300'
            }`}>
              <div className="flex items-center gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="h-6 w-6 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 flex-shrink-0" />
                )}
                <div className="text-lg font-semibold">
                  {message.text.includes('Generating your contract document') ? (
                    <>
                      Contract submitted successfully!{' '}
                      <span className="animate-pulse">
                        Generating your contract document...
                      </span>
                    </>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
              {contractPdfUrl && message.type === 'success' && submittedContractData && submittedContractId && (
                <div className="mt-4 pt-4 border-t border-green-300">
                  <a
                    href={contractPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                  >
                    <FileText className="h-6 w-6" />
                    View PDF
                  </a>
                </div>
              )}
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
              <div className="space-y-6">
                <div>
                  <label htmlFor="insurance_cert_holder" className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Certificate Holder Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="insurance_cert_holder"
                    name="insurance_cert_holder"
                    value={formData.insurance_cert_holder}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Enter the address where certificate holder should be sent"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Section 2.2 - Add agency contract holder's address</p>
                </div>

                <div>
                  <label htmlFor="insurance_agency_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Agency Mailing Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="insurance_agency_address"
                    name="insurance_agency_address"
                    value={formData.insurance_agency_address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Enter the insurance agency mailing address"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Section 2.2 - Insert Agency Mailing Address</p>
                </div>
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
