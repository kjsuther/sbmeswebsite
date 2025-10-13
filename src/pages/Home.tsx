import React from 'react';
import { ArrowRight, Target, Users, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-mn-primary to-mn-accent-teal text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                MES Modernization
                <span className="block text-mn-accent-yellow">MES Bake Off Challenge</span>
              </h1>
              <p className="text-xl text-mn-primary leading-relaxed">
                Join us in transforming Minnesota's Medicaid Enterprise Systems through innovative partnerships, 
                strategic collaboration, and cutting-edge technology solutions. This is your opportunity to shape 
                the future of government services delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/great-bake-off"
                  className="inline-flex items-center justify-center px-8 py-3 bg-mn-accent-yellow text-mn-primary font-semibold rounded-lg hover:bg-mn-neutral-yellow transition-colors duration-200"
                >
                  Learn About The Challenge
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  to="/mes-modernization"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-mn-primary transition-colors duration-200"
                >
                  View Strategy
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Strategic Transformation</h3>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Collaborative Innovation</h3>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Future-Ready Solutions</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold text-mn-primary">
              Transforming Government Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our MES Modernization Strategy represents an innovative approach to digital transformation in transformation-resistant environments. Through common vision, outcome orientation, clear focus, and and innovative approaches, 
              we're building the foundation for next-generation government services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Strategy Card 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-mn-secondary rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Strategic Vision</h3>
              <p className="text-gray-600 mb-6">
                An innovative approach for transforming our Medicaid Enterprise ecosystem to achieve better outcomes for Minnesotans.
              </p>
              <Link
                to="/mes-modernization"
                className="inline-flex items-center text-mn-accent-teal font-semibold hover:text-mn-primary transition-colors"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Strategy Card 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-mn-accent-teal rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Collaborative Approach</h3>
              <p className="text-gray-600 mb-6">
                Engaging with industry partners, stakeholders, and the community to ensure our 
                modernization efforts meet real-world needs and expectations.
              </p>
              <Link
                to="/great-bake-off"
                className="inline-flex items-center text-mn-accent-teal font-semibold hover:text-mn-primary transition-colors"
              >
                Join the Challenge
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Strategy Card 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-mn-accent-yellow rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Lightbulb className="h-8 w-8 text-mn-primary" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-mn-primary mb-4">Innovation Focus</h3>
              <p className="text-gray-600 mb-6">
                Leveraging cutting-edge technology and innovative approaches to create scalable, 
                sustainable solutions for Minnesota's future.
              </p>
              <Link
                to="/reference-materials"
                className="inline-flex items-center text-mn-accent-teal font-semibold hover:text-mn-primary transition-colors"
              >
                View Resources
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;