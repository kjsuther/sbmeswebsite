import React from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';

const Feedback: React.FC = () => {

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-mn-accent-teal text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Feedback & Engagement
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Your input is crucial to the success of our MES modernization initiative.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Form Placeholder */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-blue-900 font-medium">
              This is a placeholder and will be replaced with interactive engagement tools once bake offs begin
            </p>
          </div>
        </div>
      </section>

      {/* RFI Engagement Results */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-mn-accent-teal text-white py-8 px-6 rounded-t-xl">
            <h2 className="text-3xl font-bold">
              RFI Engagement Results
            </h2>
          </div>
          <div className="bg-white rounded-b-xl shadow-lg p-8">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              The following dashboard summarizes participation in the MES RFI process. It shows the number of
              organizations and individuals who submitted responses, the types and sizes of vendors who engaged,
              and how well the strategy resonated. These results will help inform next steps as DHS transitions
              from the RFI into the upcoming RFP process.
            </p>
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                {/* Embed Notice */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Power BI reports may not display correctly in preview environments due to embedding restrictions.
                        For the best viewing experience, please click the button below to open the dashboard in a new tab.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call to Action Button - Primary */}
                <div className="mb-8 text-center">
                  <a
                    href="https://app.powerbi.com/view?r=eyJrIjoiMGQ1NGY1YjktNTAzMy00YzhiLTgzMzMtY2JhNWEzOTY4NDQ4IiwidCI6ImUwNTBkOWJiLTg4MDUtNGNkNi04NTRlLWQxYzYzMWI3ZjcxZCJ9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-4 bg-mn-primary text-white text-lg font-semibold rounded-lg hover:bg-mn-accent-teal transition-colors shadow-lg"
                  >
                    <ExternalLink className="mr-3 h-6 w-6" />
                    View RFI Dashboard
                  </a>
                </div>

                {/* Iframe Embed (may not work in all environments) */}
                <div className="w-full bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    title="RFI Vendor Survey Responses"
                    width="100%"
                    height="100%"
                    src="https://app.powerbi.com/view?r=eyJrIjoiMGQ1NGY1YjktNTAzMy00YzhiLTgzMzMtY2JhNWEzOTY4NDQ4IiwidCI6ImUwNTBkOWJiLTg4MDUtNGNkNi04NTRlLWQxYzYzMWI3ZjcxZCJ9"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Feedback;