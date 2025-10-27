import React, { useState } from 'react';
import { AlertCircle, ExternalLink, TrendingUp, ChevronDown, ChevronUp, Building2 } from 'lucide-react';

const RFIEngagementInsights: React.FC = () => {
  const [isVendorsOpen, setIsVendorsOpen] = useState(false);

  const vendors = [
    "Lean Techniques, Inc.",
    "Ignite Insight + Innovation",
    "Blue Tack Consulting LLC",
    "TOREXUS CONSULTING LLC",
    "Trility Consulting",
    "Health Chain",
    "MedicaSoft",
    "Vitlycare, Inc",
    "Unite Us",
    "Chainguard",
    "MongoDB",
    "HeyMirza, Inc (dba Mirza)",
    "iValeo Consulting",
    "Very Little Gravitas",
    "Fuse Chamber Inc.",
    "Advocatia Solutions",
    "Improving",
    "Celonis Inc.",
    "Neural Web",
    "Chainguard, Inc.",
    "Turnberry Solutions",
    "Gov Bloom, LLC (d/b/a Bloom Works)",
    "Vimo, Inc., dba Change & Innovation Agency",
    "Boston Consulting Group (BCG)",
    "Conduent",
    "Meaningful Systems LLC",
    "Accenture, LLC",
    "UiPath Inc.",
    "LexisNexis Risk Solutions",
    "Naviant, LLC",
    "CapTech Ventures, Inc",
    "Mon Ami",
    "Salesforce",
    "D2Sol",
    "Nava PBC",
    "Cloudwick",
    "Entropy Group Limited, Inc",
    "Innovaccer, Inc.",
    "Health Management Associates",
    "Select Computing, Inc. (SCi)",
    "Cerner Corporation (Oracle Health)",
    "Auctor Corporation",
    "Digital Public Works",
    "The SME Alliance LLC",
    "Ernst & Young LLP",
    "Gainwell Technologies, LLC",
    "Telligen, Inc.",
    "Mathematica Inc.",
    "Unisys Corporation",
    "Twenty Labs, LLC dba Healthy Together",
    "Aveshka, d.b.a. Softtek Government Solutions",
    "Acentra Health, LLC",
    "RedMane Technology LLC",
    "CSRA State and Local Solutions LLC (GDIT)",
    "HighCloud Solutions, Inc.",
    "Edifecs, Inc. (Cotiviti, Inc.)",
    "Forrester Research",
    "Varyn Consulting in collaboration with Affable BPM",
    "Amazon Web Services, Inc. (AWS)",
    "CyncHealth Minnesota",
    "Public Knowledge, LLC",
    "Clarity Solutions Group",
    "Airdev Inc.",
    "AidKit",
    "KPMG LLP",
    "OptumInsight, Inc. (Optum)",
    "Briljent, LLC",
    "Last Call Media",
    "Noridian Healthcare Solutions (Noridian)",
    "IBM Consulting",
    "Equifax Workforce Solutions LLC",
    "Cloud Technology Innovations, LLC dba Healthcare Fraud Shield",
    "CaseWorthy, Inc.",
    "Elixir Lab USA Inc (d/b/a Cardinality.ai)",
    "Skyward IT Solutions, LLC (Skyward)",
    "Solventum",
    "Google LLC",
    "Leidos, Inc.",
    "FEI.com, Inc. dba FEI Systems (FEI)",
    "SteadyIQ",
    "Insight Public Sector, Inc.",
    "Flexion Inc.",
    "Slalom",
    "Paragon Employment Solutions, LLC dba Paragon IT Professionals",
    "Microsoft Corporation",
    "Red Hat, Inc.",
    "Merative US L.P.",
    "Quantiphi Inc.",
    "Abt Global",
    "Lotak LLC",
    "Fortuna Health",
    "Deloitte Consulting LLP",
    "ID.me, LLC",
    "HealthTech Solutions",
    "Speridian Technologies, LLC"
  ];

  return (
    <div className="bg-white">
      <section className="bg-mn-accent-teal text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              RFI Engagement Insights
            </h1>
            <p className="text-xl text-white max-w-4xl leading-relaxed">
              This page summarizes insights from the MES Request for Information (RFI), which closed on September 30, 2025.
              Over 95 unique organizations and 130 individuals shared feedback, data, and ideas to help shape Minnesota's
              approach to Medicaid Enterprise Systems (MES) modernization. The summaries and PowerBI dashboard below highlight
              what we learned from the RFI process - including participation data, vendor feedback themes, and shared
              recommendations that will help inform upcoming challenge-based RFP opportunities.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              RFI Participation Dashboard
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              The following dashboard summarizes participation in the MES RFI process. It shows the number of
              organizations and individuals who submitted responses, the types and sizes of vendors who engaged,
              and how well the strategy resonated. These results will help inform next steps as DHS transitions
              from the RFI into the upcoming RFP process.
            </p>
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
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

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              Vendors Who Contributed
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We are grateful to the 95 organizations that contributed to the MES RFI process.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-secondary">
            <button
              onClick={() => setIsVendorsOpen(!isVendorsOpen)}
              className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
              aria-expanded={isVendorsOpen}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-mn-secondary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-mn-primary">
                  View All {vendors.length} Contributing Organizations
                </h3>
              </div>
              {isVendorsOpen ? (
                <ChevronUp className="h-6 w-6 text-mn-secondary flex-shrink-0" />
              ) : (
                <ChevronDown className="h-6 w-6 text-mn-secondary flex-shrink-0" />
              )}
            </button>
            {isVendorsOpen && (
              <div className="px-8 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {vendors.map((vendor, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-mn-accent-teal hover:shadow-md transition-all duration-200"
                    >
                      <p className="text-sm text-gray-800 font-medium">
                        {vendor}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-mn-primary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-mn-primary mb-4">
                  Vendor-Identified Risk Themes
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Vendors raised a number of thoughtful risks and considerations about implementing a slice-based
                  modernization strategy. We've grouped those insights into 11 major themes below, along with our
                  initial reflections and planned mitigations.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-700 text-lg">
                <strong>Coming Soon:</strong> Detailed analysis of vendor-identified risk themes and DHS mitigation strategies
                will be published here following comprehensive review of all RFI submissions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RFIEngagementInsights;
