import React, { useState, useEffect } from 'react';
import { FileText, Shield, DollarSign, Users, Clock, Settings, Send, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateSoftwareProviderTestData } from '../utils/testDataGenerator';

const SoftwareProviderRFPResponse: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',

    productName: '',
    productDescription: '',

    trialCommitment: '',
    implementationModel: '',
    customImplementationDetails: '',

    licenseAgreementText: '',
    licenseAgreementFile: null as File | null,

    pricingModel: '',
    billingApproach: '',

    teamStructure: '',

    hasFedRAMP: false,
    otherCertifications: '',

    provisioningTimeline: '',

    documentationFiles: [] as File[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isTestMode, setIsTestMode] = useState(false);

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
  }, []);

  const populateTestData = () => {
    const testData = generateSoftwareProviderTestData();
    setFormData({
      companyName: testData.companyName,
      contactName: testData.contactName,
      contactEmail: testData.contactEmail,
      contactPhone: testData.contactPhone,
      productName: testData.productName,
      productDescription: testData.productDescription,
      trialCommitment: testData.trialCommitment,
      implementationModel: testData.implementationModel,
      customImplementationDetails: testData.customImplementationDetails,
      licenseAgreementText: testData.licenseAgreementText,
      licenseAgreementFile: null,
      pricingModel: testData.pricingModel,
      billingApproach: testData.billingApproach,
      teamStructure: testData.teamStructure,
      hasFedRAMP: testData.hasFedRAMP,
      otherCertifications: testData.otherCertifications,
      provisioningTimeline: testData.provisioningTimeline,
      documentationFiles: []
    });
  };

  const clearFormData = () => {
    setFormData({
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      productName: '',
      productDescription: '',
      trialCommitment: '',
      implementationModel: '',
      customImplementationDetails: '',
      licenseAgreementText: '',
      licenseAgreementFile: null,
      pricingModel: '',
      billingApproach: '',
      teamStructure: '',
      hasFedRAMP: false,
      otherCertifications: '',
      provisioningTimeline: '',
      documentationFiles: []
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      documentationFiles: files
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submissionData = {
        productName: formData.productName,
        productDescription: formData.productDescription,
        trialCommitment: formData.trialCommitment,
        implementationModel: formData.implementationModel,
        customImplementationDetails: formData.customImplementationDetails,
        softwareLicense: {
          licenseAgreementText: formData.licenseAgreementText,
          licenseAgreementFile: formData.licenseAgreementFile?.name || null,
          pricingModel: formData.pricingModel,
          billingApproach: formData.billingApproach
        },
        teamStructure: formData.teamStructure,
        certifications: {
          hasFedRAMP: formData.hasFedRAMP,
          otherCertifications: formData.otherCertifications
        },
        provisioningTimeline: formData.provisioningTimeline,
        documentationFiles: formData.documentationFiles.map(f => f.name),
        test_mode: isTestMode
      };

      const { data, error } = await supabase
        .from('software_provider_submissions')
        .insert({
          company_name: formData.companyName,
          contact_person: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone || null,
          submission_data: submissionData
        })
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      setSubmitStatus('success');
      setFormData({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        productName: '',
        productDescription: '',
        trialCommitment: '',
        implementationModel: '',
        customImplementationDetails: '',
        licenseAgreementText: '',
        licenseAgreementFile: null,
        pricingModel: '',
        billingApproach: '',
        teamStructure: '',
        hasFedRAMP: false,
        otherCertifications: '',
        provisioningTimeline: '',
        documentationFiles: []
      });

      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error submitting software provider RFP:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const implementationOptions = [
    'Any integration vendor can implement',
    'Specific partner list (provide details below)',
    'Our team only (exclusive implementation)'
  ];

  return (
    <div className="bg-white">
      {isTestMode && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-600 flex items-center space-x-2 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <div>
            <div className="font-bold">TEST MODE ACTIVE</div>
            <div className="text-xs">Press CTRL+I to exit</div>
          </div>
        </div>
      )}
      <section className="bg-mn-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Submit Software Provider RFP
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Submit your software product for consideration in the MES Modernization Challenge cupboard.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className={`space-y-12 ${isTestMode ? 'ring-4 ring-yellow-400 rounded-xl p-4' : ''}`}>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-primary rounded-full w-12 h-12 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Company Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Primary contact name"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    required
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-accent-teal rounded-full w-12 h-12 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Product Information</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    required
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Your software product name"
                  />
                </div>

                <div>
                  <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description *
                  </label>
                  <textarea
                    id="productDescription"
                    name="productDescription"
                    required
                    rows={6}
                    value={formData.productDescription}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Provide a comprehensive description of your software product, its key features, capabilities, and how it addresses MES modernization needs..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-secondary rounded-full w-12 h-12 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Trial Commitment</h2>
              </div>

              <div>
                <label htmlFor="trialCommitment" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm your willingness to provide and support the software in trial or limited-use mode *
                </label>
                <textarea
                  id="trialCommitment"
                  name="trialCommitment"
                  required
                  rows={6}
                  value={formData.trialCommitment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                  placeholder="Describe your commitment to trial period support, limited-use licensing terms, and support availability during the innovation phase..."
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-accent-yellow rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-mn-primary" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Implementation Model</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="implementationModel" className="block text-sm font-medium text-gray-700 mb-2">
                    Who can implement your software? *
                  </label>
                  <select
                    id="implementationModel"
                    name="implementationModel"
                    required
                    value={formData.implementationModel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                  >
                    <option value="">Select implementation model</option>
                    {implementationOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {formData.implementationModel === 'Specific partner list (provide details below)' && (
                  <div>
                    <label htmlFor="customImplementationDetails" className="block text-sm font-medium text-gray-700 mb-2">
                      Provide partner list and details *
                    </label>
                    <textarea
                      id="customImplementationDetails"
                      name="customImplementationDetails"
                      required
                      rows={4}
                      value={formData.customImplementationDetails}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      placeholder="List your implementation partners and any specific requirements or qualifications..."
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-primary rounded-full w-12 h-12 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Software License Agreement</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Agreement
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    You can either upload a license agreement document or provide the details in the text field below
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="licenseAgreementFile" className="block text-sm text-gray-600 mb-2">
                        Upload License Agreement (PDF, DOC, DOCX)
                      </label>
                      <input
                        type="file"
                        id="licenseAgreementFile"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'licenseAgreementFile')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="licenseAgreementText" className="block text-sm text-gray-600 mb-2">
                        Or enter license agreement details
                      </label>
                      <textarea
                        id="licenseAgreementText"
                        name="licenseAgreementText"
                        rows={4}
                        value={formData.licenseAgreementText}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                        placeholder="Summarize key terms and conditions of your software license agreement..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="pricingModel" className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing at scale with cost separation methodology *
                  </label>
                  <textarea
                    id="pricingModel"
                    name="pricingModel"
                    required
                    rows={4}
                    value={formData.pricingModel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Describe your pricing model, including how costs scale with usage, user count, or other metrics..."
                  />
                </div>

                <div>
                  <label htmlFor="billingApproach" className="block text-sm font-medium text-gray-700 mb-2">
                    Billing approach (monthly preferred) *
                  </label>
                  <textarea
                    id="billingApproach"
                    name="billingApproach"
                    required
                    rows={3}
                    value={formData.billingApproach}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Describe your billing frequency, payment terms, and any flexibility in billing arrangements..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-accent-brown rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Team Structure</h2>
              </div>

              <div>
                <label htmlFor="teamStructure" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum team structure required to support the software as part of implementing a single slice *
                </label>
                <textarea
                  id="teamStructure"
                  name="teamStructure"
                  required
                  rows={6}
                  value={formData.teamStructure}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                  placeholder="Describe the minimum team composition, required skill sets, and support responsibilities..."
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-accent-purple rounded-full w-12 h-12 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Certification & Security</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="hasFedRAMP"
                      name="hasFedRAMP"
                      type="checkbox"
                      checked={formData.hasFedRAMP}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-mn-accent-teal focus:ring-mn-accent-teal border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="hasFedRAMP" className="font-medium text-gray-700">
                      FedRAMP Certified
                    </label>
                    <p className="text-sm text-gray-500">Check if your software has FedRAMP certification</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="otherCertifications" className="block text-sm font-medium text-gray-700 mb-2">
                    Other relevant certifications and security compliance measures *
                  </label>
                  <textarea
                    id="otherCertifications"
                    name="otherCertifications"
                    required
                    rows={4}
                    value={formData.otherCertifications}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="List any other security certifications (SOC 2, ISO 27001, etc.) and compliance documentation..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-secondary rounded-full w-12 h-12 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Provisioning Timeline</h2>
              </div>

              <div>
                <label htmlFor="provisioningTimeline" className="block text-sm font-medium text-gray-700 mb-2">
                  Expected turnaround time for provisioning a new environment *
                </label>
                <input
                  type="text"
                  id="provisioningTimeline"
                  name="provisioningTimeline"
                  required
                  value={formData.provisioningTimeline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                  placeholder="e.g., 'Immediate', '24 hours', '3-5 business days', etc."
                />
                <p className="mt-2 text-sm text-gray-500">
                  If the environment is available immediately upon provisioning the licenses, enter "Immediate" or "0".
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-accent-teal rounded-full w-12 h-12 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Product Documentation</h2>
              </div>

              <div>
                <label htmlFor="documentationFiles" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload product documentation (optional)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  You can upload multiple files such as technical specifications, user guides, architecture diagrams, etc.
                </p>
                <input
                  type="file"
                  id="documentationFiles"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={handleMultipleFilesChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                />
                {formData.documentationFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {formData.documentationFiles.map((file, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-mn-accent-teal rounded-full mr-2"></span>
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-4">
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg">
                  Thank you for your submission! We will review your software provider RFP and contact you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
                  There was an error submitting your response. Please try again or contact support.
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center px-8 py-4 font-semibold rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  isTestMode
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600 border-2 border-yellow-700'
                    : 'bg-mn-secondary text-white hover:bg-mn-accent-teal'
                }`}
              >
                <Send className="mr-3 h-5 w-5" />
                {isSubmitting ? 'Submitting...' : isTestMode ? 'Submit TEST Software Provider RFP' : 'Submit Software Provider RFP'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SoftwareProviderRFPResponse;
