import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, DollarSign, Users, Package, FileText, Send, AlertCircle, Search, ChevronDown } from 'lucide-react';
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

    // Primary Delivery Contact
    deliveryContactName: '',
    deliveryContactEmail: '',
    deliveryContactPhone: '',

    // Costs
    firstSliceCost: '',
    monthlyTeamCost: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isTestMode, setIsTestMode] = useState(false);
  const [sliceOptions, setSliceOptions] = useState<string[]>([]);
  const [sliceDetails, setSliceDetails] = useState<Map<string, any>>(new Map());
  const [selectedSliceData, setSelectedSliceData] = useState<any>(null);
  const [isLoadingSlices, setIsLoadingSlices] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSlices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortSlicesByCode = (a: string, b: string) => {
    if (a === 'Custom/Other (specify below)') return 1;
    if (b === 'Custom/Other (specify below)') return -1;

    const extractNumber = (code: string) => {
      const match = code.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const numA = extractNumber(a);
    const numB = extractNumber(b);

    if (numA !== numB) {
      return numA - numB;
    }

    return a.localeCompare(b);
  };

  const loadSlices = async () => {
    try {
      const { data, error } = await supabase
        .from('slices')
        .select('*')
        .order('slice_code');

      if (error) throw error;

      if (data) {
        const detailsMap = new Map();
        const options = data.map(slice => {
          const key = `${slice.slice_code} - ${slice.slice_description}`;
          detailsMap.set(key, slice);
          return key;
        });
        options.sort(sortSlicesByCode);
        options.push('Custom/Other (specify below)');
        setSliceOptions(options);
        setSliceDetails(detailsMap);
      }
    } catch (error) {
      console.error('Error loading slices:', error);
      setSliceOptions(['Custom/Other (specify below)']);
    } finally {
      setIsLoadingSlices(false);
    }
  };

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
  }, [sliceOptions, sliceDetails]);

  const populateTestData = () => {
    const testData = generateSliceRFPTestData();

    const availableSlices = sliceOptions.filter(opt => opt !== 'Custom/Other (specify below)');
    const randomSlice = availableSlices.length > 0
      ? availableSlices[Math.floor(Math.random() * availableSlices.length)]
      : '';

    const sliceData = randomSlice ? sliceDetails.get(randomSlice) : null;

    setFormData({
      companyName: testData.companyName,
      contactName: testData.contactName,
      contactEmail: testData.contactEmail,
      contactPhone: testData.contactPhone,
      sliceFocus: randomSlice,
      customSliceFocus: testData.customSliceFocus,
      cakeSolution: testData.cakeSolution,
      ingredientsNeeded: testData.ingredientsNeeded,
      dependencies: testData.dependencies,
      teamDescription: testData.teamDescription,
      deliveryContactName: testData.deliveryContactName,
      deliveryContactEmail: testData.deliveryContactEmail,
      deliveryContactPhone: testData.deliveryContactPhone,
      firstSliceCost: testData.firstSliceCost,
      monthlyTeamCost: testData.monthlyTeamCost,
      resume1: null,
      resume2: null,
      resume3: null
    });

    setSelectedSliceData(sliceData);
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
      deliveryContactName: '',
      deliveryContactEmail: '',
      deliveryContactPhone: '',
      firstSliceCost: '',
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

  const handleSliceSelect = (option: string) => {
    setFormData(prev => ({
      ...prev,
      sliceFocus: option
    }));

    if (option === 'Custom/Other (specify below)') {
      setSelectedSliceData(null);
    } else {
      const details = sliceDetails.get(option);
      setSelectedSliceData(details || null);
    }

    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const filteredOptions = sliceOptions
    .filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(sortSlicesByCode);

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
        deliveryContactName: formData.deliveryContactName,
        deliveryContactEmail: formData.deliveryContactEmail,
        deliveryContactPhone: formData.deliveryContactPhone,
        firstSliceCost: formData.firstSliceCost,
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
        deliveryContactName: '',
        deliveryContactEmail: '',
        deliveryContactPhone: '',
        firstSliceCost: '',
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
                  <div ref={dropdownRef} className="relative">
                    <div
                      onClick={() => !isLoadingSlices && setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-mn-accent-teal focus-within:border-transparent cursor-pointer bg-white flex items-center justify-between"
                    >
                      <span className={formData.sliceFocus ? 'text-gray-900' : 'text-gray-500'}>
                        {isLoadingSlices ? 'Loading slices...' : (formData.sliceFocus || 'Select a slice focus')}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 flex flex-col">
                        <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search slices..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto max-h-80">
                          {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                              <div
                                key={option}
                                onClick={() => handleSliceSelect(option)}
                                className={`px-4 py-3 hover:bg-mn-accent-teal hover:text-white cursor-pointer transition-colors ${
                                  formData.sliceFocus === option ? 'bg-mn-accent-teal/10 text-mn-accent-teal font-medium' : 'text-gray-900'
                                }`}
                              >
                                {option}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                              No slices found matching "{searchTerm}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <input
                      type="hidden"
                      name="sliceFocus"
                      value={formData.sliceFocus}
                      required
                    />
                  </div>
                </div>
                
                {selectedSliceData && (
                  <div className="mt-6 border border-mn-accent-teal/30 rounded-lg p-6 bg-gradient-to-br from-mn-accent-teal/5 to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-12 bg-mn-accent-teal rounded"></div>
                      <h3 className="text-lg font-semibold text-mn-primary">Slice Details</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-mn-primary mb-1">Customer Journey</h4>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedSliceData.customer_journey}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-mn-primary mb-1">Expected Result</h4>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedSliceData.expected_result}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-mn-primary mb-1">Persona Definition</h4>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedSliceData.persona_definition}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-mn-primary mb-1">Slice Focus</h4>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedSliceData.slice_focus}</p>
                          </div>
                        </div>
                      </div>

                      {selectedSliceData.outcomes && (
                        <div className="pt-3 border-t border-mn-accent-teal/20">
                          <h4 className="text-sm font-semibold text-mn-primary mb-1">Outcomes</h4>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedSliceData.outcomes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.sliceFocus === 'Custom/Other (specify below)' && (
                  <div className="mt-4">
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

            {/* Step 4: Primary Delivery Contact */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-mn-accent-teal rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-mn-primary">Primary Delivery Contact</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="deliveryContactName" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Contact Name *
                  </label>
                  <input
                    type="text"
                    id="deliveryContactName"
                    name="deliveryContactName"
                    required
                    value={formData.deliveryContactName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="Enter the primary contact person for delivery coordination"
                  />
                </div>

                <div>
                  <label htmlFor="deliveryContactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Contact Email *
                  </label>
                  <input
                    type="email"
                    id="deliveryContactEmail"
                    name="deliveryContactEmail"
                    required
                    value={formData.deliveryContactEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="delivery@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="deliveryContactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Contact Phone *
                  </label>
                  <input
                    type="tel"
                    id="deliveryContactPhone"
                    name="deliveryContactPhone"
                    required
                    value={formData.deliveryContactPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mn-accent-teal focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Costs */}
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
                  <label htmlFor="monthlyTeamCost" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Delivery Cost of Your Baker Team *
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