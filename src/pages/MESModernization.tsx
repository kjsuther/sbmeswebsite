import React from 'react';
import { Search, Compass, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MESModernization: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-mn-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              MES Modernization Strategy
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              A focused, coherent approach to transforming Minnesota's Medicaid Enterprise Systems (MES)
            </p>
          </div>
        </div>
      </section>

      {/* Strategic Framework */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              Strategic Framework
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Challenges Diagnosis */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-mn-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Challenges Diagnosis</h3>
              <p className="text-gray-600">
                An assessment of the root cause issues preventing successful MES modernizations
              </p>
            </div>

            {/* Guiding Approach Tenets */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-mn-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Compass className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Guiding Approach Tenets</h3>
              <p className="text-gray-600">
                Key operating commitments Minnesota has made to directly address the diagnosed challenges
              </p>
            </div>

            {/* Coherent Action Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-mn-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Coherent Action Plan</h3>
              <p className="text-gray-600">
                An actionable framework and approach for applying the guiding approach tenets to overcome the challenges
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              Strategy Overview
            </h2>
            <p className="text-xl text-gray-700">
              [Placeholder text] Detailed overview of our strategic approach to MES modernization.
            </p>
          </div>
          
          <div className="text-center">
            <Link
              to="/mes-training"
              className="inline-flex items-center justify-center px-8 py-3 bg-mn-accent-yellow text-mn-primary font-semibold rounded-lg hover:bg-mn-neutral-yellow transition-colors"
            >
              Take MES Modernization Training
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-mn-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Join Our Modernization Effort?
            </h2>
            <p className="text-xl text-mn-neutral-blue mb-8 max-w-2xl mx-auto">
              Learn more about how you can participate in transforming Minnesota's Medicaid Enterprise Systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/great-bake-off"
                className="inline-flex items-center justify-center px-8 py-3 bg-mn-accent-yellow text-mn-primary font-semibold rounded-lg hover:bg-mn-neutral-yellow transition-colors"
              >
                Join the Challenge
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/reference-materials"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-mn-primary transition-colors"
              >
                View Resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MESModernization;