import React from 'react';
import { FileText, Download, Calendar, ExternalLink } from 'lucide-react';

const ReferenceMaterials: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-mn-accent-brown text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Reference Materials
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Access important documents, guidelines, and resources for the MES modernization initiative.
            </p>
          </div>
        </div>
      </section>

      {/* Document Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Strategy Documents */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-primary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Strategy Documents</h3>
              <p className="text-gray-600 mb-6">
                [Placeholder text] Core strategic documents outlining the vision and approach for MES modernization.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">MES Modernization Strategy</span>
                  <Download className="h-4 w-4 text-mn-accent-teal" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Implementation Roadmap</span>
                  <Download className="h-4 w-4 text-mn-accent-teal" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Stakeholder Analysis</span>
                  <Download className="h-4 w-4 text-mn-accent-teal" />
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-accent-teal rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Technical Specifications</h3>
              <p className="text-gray-600 mb-6">
                [Placeholder text] Detailed technical requirements and specifications for system development.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">System Architecture</span>
                  <Download className="h-4 w-4 text-mn-accent-teal" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Security Requirements</span>
                  <Download className="h-4 w-4 text-mn-accent-teal" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Data Standards</span>
                  <Download className="h-4 w-4 text-mn-accent-teal" />
                </div>
              </div>
            </div>

            {/* Process Guidelines */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-secondary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Process Guidelines</h3>
              <p className="text-gray-600 mb-6">
                [Placeholder text] Guidelines and procedures for participating in the modernization process.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Participation Guide</span>
                  <Download className="h-4 w-4 text-mn-accent-teal" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Evaluation Criteria</span>
                  <Download className="h-4 w-4 text-mn-accent-teal" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Submission Requirements</span>
                  <Download className="h-4 w-4 text-mn-accent-teal" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              Recent Updates
            </h2>
            <p className="text-xl text-gray-600">
              [Placeholder text] Stay current with the latest documents and announcements.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-5 w-5 text-mn-accent-teal" />
                <span className="text-sm text-gray-600">January 15, 2025</span>
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-3">
                Updated Technical Requirements
              </h3>
              <p className="text-gray-600 mb-4">
                [Placeholder text] Revised technical specifications based on stakeholder feedback and industry best practices.
              </p>
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-mn-accent-teal" />
                <span className="text-sm text-mn-accent-teal font-medium">Download PDF</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-5 w-5 text-mn-accent-teal" />
                <span className="text-sm text-gray-600">January 10, 2025</span>
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-3">
                Challenge Timeline Update
              </h3>
              <p className="text-gray-600 mb-4">
                [Placeholder text] Revised timeline for the Great MES Modernization Bake-Off phases and milestones.
              </p>
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-mn-accent-teal" />
                <span className="text-sm text-mn-accent-teal font-medium">Download PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* External Resources */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              External Resources
            </h2>
            <p className="text-xl text-gray-600">
              [Placeholder text] Helpful links and resources from external sources.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-lg font-bold text-mn-primary mb-3">
                Government Standards
              </h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm">Federal IT Standards</span>
                  <ExternalLink className="h-4 w-4 text-mn-accent-teal" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm">Accessibility Guidelines</span>
                  <ExternalLink className="h-4 w-4 text-mn-accent-teal" />
                </a>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-lg font-bold text-mn-primary mb-3">
                Industry Best Practices
              </h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm">Modernization Frameworks</span>
                  <ExternalLink className="h-4 w-4 text-mn-accent-teal" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm">Security Standards</span>
                  <ExternalLink className="h-4 w-4 text-mn-accent-teal" />
                </a>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-lg font-bold text-mn-primary mb-3">
                Technical Resources
              </h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm">API Documentation</span>
                  <ExternalLink className="h-4 w-4 text-mn-accent-teal" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm">Development Tools</span>
                  <ExternalLink className="h-4 w-4 text-mn-accent-teal" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReferenceMaterials;