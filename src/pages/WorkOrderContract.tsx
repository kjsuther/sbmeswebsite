import React, { useState, useEffect } from 'react';
import { FileText, Save, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  company_name: string;
  contract_date: string;
  slice_number_description: string;
  monthly_delivery_cost: string;
  cost_of_delivering: string;
  calculated_total: string;
  state_project_manager: string;
  delivery_contact_name: string;
}

const WorkOrderContract: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [contractPdfUrl, setContractPdfUrl] = useState<string | null>(null);
  const [submittedContractId, setSubmittedContractId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contract_date: new Date().toISOString().split('T')[0],
    slice_number_description: '',
    monthly_delivery_cost: '',
    cost_of_delivering: '',
    calculated_total: '',
    state_project_manager: '',
    delivery_contact_name: '',
  });

  useEffect(() => {
    const monthly = parseFloat(formData.monthly_delivery_cost) || 0;
    const delivery = parseFloat(formData.cost_of_delivering) || 0;
    const total = monthly + delivery;

    if (total > 0 && formData.calculated_total !== total.toFixed(2)) {
      setFormData(prev => ({
        ...prev,
        calculated_total: total.toFixed(2)
      }));
    }
  }, [formData.monthly_delivery_cost, formData.cost_of_delivering]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: contract, error: insertError } = await supabase
        .from('work_order_contracts')
        .insert({
          company_name: formData.company_name,
          contract_date: formData.contract_date,
          slice_number_description: formData.slice_number_description,
          monthly_delivery_cost: parseFloat(formData.monthly_delivery_cost),
          cost_of_delivering: parseFloat(formData.cost_of_delivering),
          calculated_total: parseFloat(formData.calculated_total),
          state_project_manager: formData.state_project_manager,
          delivery_contact_name: formData.delivery_contact_name,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSubmittedContractId(contract.id);
      await handleDownloadPdf(contract);

      setMessage({
        type: 'success',
        text: 'Work Order Contract submitted successfully!'
      });

    } catch (error: any) {
      console.error('Error submitting contract:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to submit contract. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (contractData: any) => {
    try {
      console.log('Generating PDF for download...');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/fill-work-order-contract-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contractData }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PDF generation failed:', errorText);
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setContractPdfUrl(url);

      const link = document.createElement('a');
      link.href = url;
      link.download = `work-order-contract-${contractData.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Work Order Contract</h1>
            </div>
            <p className="mt-2 text-blue-100">
              Professional and Technical Services
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {message && (
              <div
                className={`rounded-lg p-4 ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Contractor Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contract Date *
                </label>
                <input
                  type="date"
                  name="contract_date"
                  value={formData.contract_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slice Number - Description *
                </label>
                <textarea
                  name="slice_number_description"
                  value={formData.slice_number_description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="e.g., Slice 1 - User Authentication Module"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Delivery Cost *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                    <input
                      type="number"
                      name="monthly_delivery_cost"
                      value={formData.monthly_delivery_cost}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost of Delivering Slice *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                    <input
                      type="number"
                      name="cost_of_delivering"
                      value={formData.cost_of_delivering}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Calculated Total
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                  <input
                    type="text"
                    name="calculated_total"
                    value={formData.calculated_total}
                    readOnly
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-semibold"
                    placeholder="Auto-calculated"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Automatically calculated from monthly cost and delivery cost
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State Project Manager *
                  </label>
                  <input
                    type="text"
                    name="state_project_manager"
                    value={formData.state_project_manager}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Project Manager Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Contact Name *
                  </label>
                  <input
                    type="text"
                    name="delivery_contact_name"
                    value={formData.delivery_contact_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Contractor Contact Name"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Submitting...' : 'Submit Contract'}</span>
              </button>

              {contractPdfUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = contractPdfUrl;
                    link.download = `work-order-contract-${submittedContractId}.pdf`;
                    link.click();
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-5 w-5" />
                  <span>Download PDF</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderContract;
