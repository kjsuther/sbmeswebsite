import React, { useState, useEffect } from 'react';
import { ChefHat, DollarSign, Users, Package, FileText, Send, AlertCircle } from 'lucide-react';
import { generateSliceRFPPDF } from '../utils/pdfGenerator';
import { supabase } from '../lib/supabase';
import { generateSliceRFPTestData } from '../utils/testDataGenerator';

const SliceRFPResponse: React.FC = () => {
  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',

    // Slice Focus
    sliceFocus: '',
    customSliceFocus: '',

    // Cake Solution
    cakeSolution: '',
    ingredientsNeeded: '',
    dependencies: '',

    // Baker Team
    teamDescription: '',
    resume1: null as File | null,
    resume2: null as File | null,
    resume3: null as File | null,

    // Costs
    firstSliceCost: '',
    cakeBatterScaleCost: '',
    monthlyTeamCost: ''
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
    const testData = generateSliceRFPTestData();
    setFormData({
      companyName: testData.companyName,
      contactName: testData.contactName,
      contactEmail: testData.contactEmail,
      contactPhone: testData.contactPhone,
      sliceFocus: testData.sliceFocus,
      customSliceFocus: testData.customSliceFocus,
      cakeSolution: testData.cakeSolution,
      ingredientsNeeded: testData.ingredientsNeeded,
      dependencies: testData.dependencies,
      teamDescription: testData.teamDescription,
      firstSliceCost: testData.firstSliceCost,
      cakeBatterScaleCost: testData.cakeBatterScaleCost,
      monthlyTeamCost: testData.monthlyTeamCost,
      resume1: null,
      resume2: null,
      resume3: null
    });
  };

  const clearFormData = () => {
    setFormData({
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      sliceFocus: '',
      customSliceFocus: '',
      cakeSolution: '',
      ingredientsNeeded: '',
      dependencies: '',
      teamDescription: '',
      firstSliceCost: '',
      cakeBatterScaleCost: '',
      monthlyTeamCost: '',
      resume1: null,
      resume2: null,
      resume3: null
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, resumeField: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [resumeField]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submissionData = {
        sliceFocus: formData.sliceFocus,
        customSliceFocus: formData.customSliceFocus,
        cakeSolution: formData.cakeSolution,
        ingredientsNeeded: formData.ingredientsNeeded,
        dependencies: formData.dependencies,
        teamDescription: formData.teamDescription,
        firstSliceCost: formData.firstSliceCost,
        cakeBatterScaleCost: formData.cakeBatterScaleCost,
        monthlyTeamCost: formData.monthlyTeamCost,
        resumeFiles: {
          resume1: formData.resume1?.name || null,
          resume2: formData.resume2?.name || null,
          resume3: formData.resume3?.name || null,
        }
      };

      const { data, error } = await supabase
        .from('rfp_submissions')
        .insert({
          rfp_type: 'slice',
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

      try {
        generateSliceRFPPDF(formData);
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
      }

      setSubmitStatus('success');
      setFormData({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        sliceFocus: '',
        customSliceFocus: '',
        cakeSolution: '',
        ingredientsNeeded: '',
        dependencies: '',
        teamDescription: '',
        resume1: null,
        resume2: null,
        resume3: null,
        firstSliceCost: '',
        cakeBatterScaleCost: '',
        monthlyTeamCost: ''
      });

      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error submitting RFP:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sliceOptions = [
    '1A - New applicant (ineligible for MA, but eligible for MSP)',
    '1B - Household Change',
    '1C - Reduce Income',
    '1D - Annual Redetermination (Version 1 - Auto Renew)',
    '1E - Annual Redetermination (Version 2 - Manual Review Required)',
    '1F - New Enrollment',
    '1G - Asset reduction increases coverage and authorized rep',
    '1H - Household Change and Spend-Down Transition',
    '1I - Asset change for household',
    '1J - Pregnancy',
    '1K - Give birth',
    '1L - Additional pregnancy',
    '1M - Remove child from the home',
    '1N - Foster Care',
    '1O - Adoption',
    '1P - Annual Reviews for automatically eligible cases',
    '2A - New Disability Application with Spenddown',
    '3A - New application for LTC Facility',
    '4A - Children with a MA basis due to disability turning 18',
    '5A - Tribal enrollment',
    '5B - Tribal and limited internet access enrollment',
    '6A - Multiple PMI – Newborn (also on a food support case)',
    '6B - Multiple PMI – Same person applies with alternative demographic details',
    '7A - MA-EPD New Application',
    '7B - MA-EPD – Income decrease due to job loss',
    '7C - MA-EPD – Income Increase due to marriage',
    '8A - Work Requirements ("Community Engagement") – New Enrollment',
    '8B - Work Requirements ("Community Engagement") – 6 Month renewal',
    '8C - Work Requirements ("Community Engagement") – No longer meeting work requirements',
    '8D - Work Requirements ("Community Engagement") – New enrollment with employment',
    'Custom/Other (specify below)'
  ];

  return (
    <div className="bg-white">
      {isTestMode && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-600 flex items-center space-x-2 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span className="font-bold">TEST MODE ACTIVE (CTRL+I to toggle)</span>
        </div>
      )}

      {/* Header */}
      <section className="bg-mn-accent-teal text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Submit Slice RFP Response
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Propose your team and solution for delivering a specific slice of the MES modernization.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Company Information */}
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

            {/* Step 1: Slice Focus */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-secondary rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">1</span>
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Choose a Slice Focus</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="sliceFocus" className="block text-sm font-medium text-gray-700 mb-2">
                    Select from delivery backlog or propose your own *
                  </label>
                  <select
                    id="sliceFocus"
                    name="sliceFocus"
                    required
                    value={formData.sliceFocus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                  >
                    <option value="">Select a slice focus</option>
                    {sliceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                {formData.sliceFocus === 'Custom/Other (specify below)' && (
                  <div>
                    <label htmlFor="customSliceFocus" className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your proposed slice focus *
                    </label>
                    <textarea
                      id="customSliceFocus"
                      name="customSliceFocus"
                      required
                      rows={4}
                      value={formData.customSliceFocus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      placeholder="Describe your custom slice focus and why it's important for the MES modernization..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Cake Solution */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-accent-yellow rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-mn-primary text-lg font-bold">2</span>
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Propose a Cake Solution</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="cakeSolution" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your proposed cake solution *
                  </label>
                  <textarea
                    id="cakeSolution"
                    name="cakeSolution"
                    required
                    rows={6}
                    value={formData.cakeSolution}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Describe your overall solution approach, architecture, and how it addresses the selected slice..."
                  />
                </div>
                
                <div>
                  <label htmlFor="ingredientsNeeded" className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients needed *
                  </label>
                  <textarea
                    id="ingredientsNeeded"
                    name="ingredientsNeeded"
                    required
                    rows={4}
                    value={formData.ingredientsNeeded}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="List the software products, tools, and technologies you plan to use from the MES cupboard..."
                  />
                </div>
                
                <div>
                  <label htmlFor="dependencies" className="block text-sm font-medium text-gray-700 mb-2">
                    Dependencies and support required *
                  </label>
                  <textarea
                    id="dependencies"
                    name="dependencies"
                    required
                    rows={4}
                    value={formData.dependencies}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Identify any dependencies on other teams, systems, or support that will be required..."
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Baker Team */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-accent-brown rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Describe Your Baker Team</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Why is your team best equipped to deliver the tastiest cake? *
                  </label>
                  <textarea
                    id="teamDescription"
                    name="teamDescription"
                    required
                    rows={6}
                    value={formData.teamDescription}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Describe your team's experience, skills, approach, and what makes them uniquely qualified for this work..."
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-mn-primary mb-4">Expert Baker Resumes (1-3 required)</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="resume1" className="block text-sm font-medium text-gray-700 mb-2">
                        Resume 1 *
                      </label>
                      <input
                        type="file"
                        id="resume1"
                        accept=".pdf,.doc,.docx"
                        required
                        onChange={(e) => handleFileChange(e, 'resume1')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="resume2" className="block text-sm font-medium text-gray-700 mb-2">
                        Resume 2
                      </label>
                      <input
                        type="file"
                        id="resume2"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'resume2')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="resume3" className="block text-sm font-medium text-gray-700 mb-2">
                        Resume 3
                      </label>
                      <input
                        type="file"
                        id="resume3"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'resume3')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Costs */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-accent-purple rounded-full w-12 h-12 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Cost Information</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="firstSliceCost" className="block text-sm font-medium text-gray-700 mb-2">
                    Cost of delivering a first slice meeting definition of done criteria *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      id="firstSliceCost"
                      name="firstSliceCost"
                      required
                      min="1"
                      value={formData.firstSliceCost}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="cakeBatterScaleCost" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated cost of your proposed cake batter when at scale *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      id="cakeBatterScaleCost"
                      name="cakeBatterScaleCost"
                      required
                      min="0"
                      value={formData.cakeBatterScaleCost}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="monthlyTeamCost" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly cost of your baker team to deliver additional slices *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      id="monthlyTeamCost"
                      name="monthlyTeamCost"
                      required
                      min="1"
                      value={formData.monthlyTeamCost}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center space-y-4">
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg">
                  Thank you for your submission! We will review your Slice RFP response and contact you soon.
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
                className="inline-flex items-center justify-center px-8 py-4 bg-mn-accent-teal text-white font-semibold rounded-lg hover:bg-mn-secondary transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="mr-3 h-5 w-5" />
                {isSubmitting ? 'Submitting...' : 'Submit Slice RFP Response'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SliceRFPResponse;