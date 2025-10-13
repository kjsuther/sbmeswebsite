import React from 'react';
import { FileText, Clock, Users, Shield, DollarSign, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const SoftwareRFPRequirements: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-mn-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Software RFP Submission Requirements
            </h1>
            <p className="text-xl text-mn-neutral-blue max-w-3xl mx-auto">
              <span className="text-white">Requirements for software providers looking to submit products for consideration in the MES Modernization Challenge.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Requirements Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              Submission Requirements
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              All software RFP submissions must include the following components to be considered for the challenge cupboard.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trial Commitment */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-accent-teal rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Trial Commitment</h3>
              <p className="text-gray-700 mb-4">
                Confirm your willingness to provide and support the proposed software in a trial or limited-use mode during the innovation phase.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Commitment to trial period support</li>
                  <li>• Limited-use licensing terms</li>
                  <li>• Support availability during innovation phase</li>
                </ul>
              </div>
            </div>

            {/* Implementation Model */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-accent-yellow rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-mn-primary" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Implementation Model</h3>
              <p className="text-gray-700 mb-4">
                Identify whether your software can be implemented by any integration vendor, a specific partner list, or your own team only.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Any integration vendor</li>
                  <li>• Specific partner list</li>
                  <li>• Your team only</li>
                </ul>
              </div>
            </div>

            {/* Software License Agreement */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-primary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Software License Agreement</h3>
              <p className="text-gray-700 mb-4">
                Provide a clear licensing model including pricing, terms, and billing approach.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-mn-primary mb-2">Required Components:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Pricing at scale with cost separation methodology</li>
                  <li>• Terms and conditions</li>
                  <li>• Billing approach (monthly preferred)</li>
                </ul>
              </div>
            </div>

            {/* Team Structure */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-accent-brown rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Team Structure</h3>
              <p className="text-gray-700 mb-4">
                Describe the minimum team structure required to support the software as part of implementing a single slice.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Minimum team composition</li>
                  <li>• Required skill sets</li>
                  <li>• Support responsibilities</li>
                </ul>
              </div>
            </div>

            {/* Certification & Security */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-accent-purple rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Certification & Security</h3>
              <p className="text-gray-700 mb-4">
                List any relevant certifications and security compliance measures.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• FedRAMP certification (if applicable)</li>
                  <li>• Other relevant security certifications</li>
                  <li>• Compliance documentation</li>
                </ul>
              </div>
            </div>

            {/* Provisioning Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-secondary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Provisioning Timeline</h3>
              <p className="text-gray-700 mb-4">
                State expected turnaround time for provisioning a new environment.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  If the environment is available immediately upon provisioning the licenses, this is zero.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-mn-primary mb-6">Important Notes</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-mn-accent-teal rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">
                  RFPs submitted through the challenge process remain in consideration until one of two things happen:
                </p>
              </div>
              <div className="ml-5 space-y-2">
                <p className="text-sm text-gray-600">
                  1. The product is implemented through a subsequent delivery services challenge RFP and a full license is purchased once demonstrated to meet the future-state vision criteria
                </p>
                <p className="text-sm text-gray-600">
                  2. The vendor withdraws the RFP from consideration
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-mn-accent-teal rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">
                  Vendors can submit new RFPs at any time throughout the challenge process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-mn-primary mb-6">
              Ready to Submit?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Ensure you have all required components prepared before submitting your software RFP.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/software-provider-rfp-response"
                className="inline-flex items-center justify-center px-8 py-3 bg-mn-secondary text-white font-semibold rounded-lg hover:bg-mn-accent-teal transition-colors"
              >
                Submit Software RFP
              </Link>
              <Link
                to="/great-bake-off"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-mn-secondary text-mn-secondary font-semibold rounded-lg hover:bg-mn-secondary hover:text-white transition-colors"
              >
                Back to Challenge Overview
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SoftwareRFPRequirements;