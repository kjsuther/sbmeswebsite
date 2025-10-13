import React from 'react';
import { Target, DollarSign, Users, Package, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const DeliveryServicesRequirements: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-mn-accent-teal text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Delivery Services RFP Requirements
            </h1>
            <p className="text-xl text-mn-neutral-blue max-w-3xl mx-auto">
              Requirements and evaluation criteria for implementation teams proposing to deliver business slices.
            </p>
          </div>
        </div>
      </section>

      {/* Submission Requirements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              Submission Requirements
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              All delivery services RFP submissions must include the following components.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Specific Slice */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-primary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Specific Slice Selection</h3>
              <p className="text-gray-700 mb-4">
                A specific slice for delivery from the backlog, clearly defined with scope and outcomes.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Choose from slice backlog or enablement backlog</li>
                  <li>• Define clear scope boundaries</li>
                  <li>• Specify expected outcomes</li>
                </ul>
              </div>
            </div>

            {/* Slice Delivery Cost */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-accent-yellow rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-mn-primary" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Slice Delivery Cost</h3>
              <p className="text-gray-700 mb-4">
                The cost for delivering the selected slice, achieving the defined outcome and meeting future-state vision criteria.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Fixed cost for initial slice delivery</li>
                  <li>• Must meet all success criteria</li>
                  <li>• Include all necessary resources</li>
                </ul>
              </div>
            </div>

            {/* Monthly Team Cost */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-secondary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Monthly Team Cost</h3>
              <p className="text-gray-700 mb-4">
                The monthly cost for the team to deliver additional slices based on mutual agreement between team and state outcome owner.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Ongoing monthly team rate</li>
                  <li>• Flexible engagement model</li>
                  <li>• Performance-based agreements</li>
                </ul>
              </div>
            </div>

            {/* Proposed Ingredients */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-mn-accent-brown rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Proposed Ingredients</h3>
              <p className="text-gray-700 mb-4">
                List of proposed ingredients that must be provisioned to begin work and cost estimate at scale.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Required software products</li>
                  <li>• Infrastructure needs</li>
                  <li>• Cost estimate when implemented at scale</li>
                </ul>
              </div>
            </div>

            {/* Team Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8 lg:col-span-2">
              <div className="bg-mn-accent-purple rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Team Summary</h3>
              <p className="text-gray-700 mb-4">
                A summary paragraph describing why the proposed team has the skills, experience, approach, and mindset most likely to achieve outcome results within Minnesota's strategic framework.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-mn-primary mb-2">Include:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Team skills and experience</li>
                  <li>• Approach methodology</li>
                  <li>• Strategic framework alignment</li>
                  <li>• Outcome-focused mindset</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Criteria */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              Evaluation Criteria
            </h2>
            <p className="text-xl text-gray-700">
              Submissions will be evaluated based on the following weighted criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Strategy Framework Ability */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-4">
                <div className="bg-mn-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-mn-primary">30%</div>
              </div>
              <h3 className="text-lg font-bold text-mn-primary mb-2 text-center">
                Strategy Framework Delivery
              </h3>
              <p className="text-sm text-gray-700 text-center">
                Evaluation of the team's ability to deliver within the strategy framework
              </p>
            </div>

            {/* Initial Slice Cost */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-4">
                <div className="bg-mn-accent-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-8 w-8 text-mn-primary" />
                </div>
                <div className="text-3xl font-bold text-mn-primary">20%</div>
              </div>
              <h3 className="text-lg font-bold text-mn-primary mb-2 text-center">
                Initial Slice Cost
              </h3>
              <p className="text-sm text-gray-700 text-center">
                Cost competitiveness for the initial slice delivery
              </p>
            </div>

            {/* Monthly Team Cost */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-4">
                <div className="bg-mn-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-mn-primary">20%</div>
              </div>
              <h3 className="text-lg font-bold text-mn-primary mb-2 text-center">
                Monthly Team Cost
              </h3>
              <p className="text-sm text-gray-700 text-center">
                Ongoing monthly cost for continued team engagement
              </p>
            </div>

            {/* Product Accessibility */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-4">
                <div className="bg-mn-accent-teal rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-mn-primary">20%</div>
              </div>
              <h3 className="text-lg font-bold text-mn-primary mb-2 text-center">
                Product Accessibility
              </h3>
              <p className="text-sm text-gray-700 text-center">
                Percentage of products that don't require specialized implementors and can be provisioned immediately
              </p>
            </div>

            {/* Scale Cost Estimate */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-1">
              <div className="text-center mb-4">
                <div className="bg-mn-accent-brown rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-mn-primary">10%</div>
              </div>
              <h3 className="text-lg font-bold text-mn-primary mb-2 text-center">
                Product Suite Scale Cost
              </h3>
              <p className="text-sm text-gray-700 text-center">
                Estimated cost of the product suite when implemented at scale
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-mn-primary mb-6">
              Ready to Submit Your Proposal?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Ensure your submission includes all required components and addresses the evaluation criteria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-8 py-3 bg-mn-accent-teal text-white font-semibold rounded-lg hover:bg-mn-secondary transition-colors">
                Submit Delivery Services RFP
              </button>
              <Link
                to="/great-bake-off"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-mn-accent-teal text-mn-accent-teal font-semibold rounded-lg hover:bg-mn-accent-teal hover:text-white transition-colors"
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

export default DeliveryServicesRequirements;