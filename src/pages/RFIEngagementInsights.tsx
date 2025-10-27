import React, { useState } from 'react';
import { AlertCircle, ExternalLink, TrendingUp, ChevronDown, ChevronUp, Building2 } from 'lucide-react';

const RFIEngagementInsights: React.FC = () => {
  const [isVendorsOpen, setIsVendorsOpen] = useState(false);

  const vendors = [
    { name: "Lean Techniques, Inc.", url: "https://www.leantechniques.com" },
    { name: "Ignite Insight + Innovation", url: "https://www.igniteyourbusiness.com" },
    { name: "Blue Tack Consulting LLC", url: "https://www.bluetackconsulting.com" },
    { name: "TOREXUS CONSULTING LLC", url: "https://www.torexus.com" },
    { name: "Trility Consulting", url: "https://www.trilityconsulting.com" },
    { name: "Health Chain", url: null },
    { name: "MedicaSoft", url: "https://www.medicasoft.us" },
    { name: "Vitlycare, Inc", url: "https://www.vitlycare.com" },
    { name: "Unite Us", url: "https://www.uniteus.com" },
    { name: "Chainguard", url: "https://www.chainguard.dev" },
    { name: "MongoDB", url: "https://www.mongodb.com" },
    { name: "HeyMirza, Inc (dba Mirza)", url: "https://www.heymirza.com" },
    { name: "iValeo Consulting", url: "https://www.ivaleo.com" },
    { name: "Very Little Gravitas", url: "https://www.verylittlegravitas.com" },
    { name: "Fuse Chamber Inc.", url: "https://www.fusechamber.com" },
    { name: "Advocatia Solutions", url: "https://www.advocatiasolutions.com" },
    { name: "Improving", url: "https://improving.com" },
    { name: "Celonis Inc.", url: "https://www.celonis.com" },
    { name: "Neural Web", url: null },
    { name: "Chainguard, Inc.", url: "https://www.chainguard.dev" },
    { name: "Turnberry Solutions", url: "https://www.turnberrysolutions.com" },
    { name: "Gov Bloom, LLC (d/b/a Bloom Works)", url: "https://bloomworks.digital" },
    { name: "Vimo, Inc., dba Change & Innovation Agency", url: "https://www.thechangeandco.com" },
    { name: "Boston Consulting Group (BCG)", url: "https://www.bcg.com" },
    { name: "Conduent", url: "https://www.conduent.com" },
    { name: "Meaningful Systems LLC", url: "https://www.meaningfulsystems.com" },
    { name: "Accenture, LLC", url: "https://www.accenture.com" },
    { name: "UiPath Inc.", url: "https://www.uipath.com" },
    { name: "LexisNexis Risk Solutions", url: "https://risk.lexisnexis.com" },
    { name: "Naviant, LLC", url: "https://www.naviant.com" },
    { name: "CapTech Ventures, Inc", url: "https://www.captechconsulting.com" },
    { name: "Mon Ami", url: "https://www.monami.io" },
    { name: "Salesforce", url: "https://www.salesforce.com" },
    { name: "D2Sol", url: "https://www.d2sol.com" },
    { name: "Nava PBC", url: "https://www.navapbc.com" },
    { name: "Cloudwick", url: "https://www.cloudwick.com" },
    { name: "Entropy Group Limited, Inc", url: null },
    { name: "Innovaccer, Inc.", url: "https://innovaccer.com" },
    { name: "Health Management Associates", url: "https://www.healthmanagement.com" },
    { name: "Select Computing, Inc. (SCi)", url: "https://www.selectcomputing.com" },
    { name: "Cerner Corporation (Oracle Health)", url: "https://www.oracle.com/health/" },
    { name: "Auctor Corporation", url: "https://www.auctor.tv" },
    { name: "Digital Public Works", url: "https://www.digitalpublicworks.com" },
    { name: "The SME Alliance LLC", url: "https://www.thesmealliance.com" },
    { name: "Ernst & Young LLP", url: "https://www.ey.com" },
    { name: "Gainwell Technologies, LLC", url: "https://www.gainwelltechnologies.com" },
    { name: "Telligen, Inc.", url: "https://www.telligen.com" },
    { name: "Mathematica Inc.", url: "https://www.mathematica.org" },
    { name: "Unisys Corporation", url: "https://www.unisys.com" },
    { name: "Twenty Labs, LLC dba Healthy Together", url: "https://www.healthytogether.io" },
    { name: "Aveshka, d.b.a. Softtek Government Solutions", url: "https://www.softtek.com" },
    { name: "Acentra Health, LLC", url: "https://www.acentra.com" },
    { name: "RedMane Technology LLC", url: "https://www.redmanetechnology.com" },
    { name: "CSRA State and Local Solutions LLC (GDIT)", url: "https://www.gdit.com" },
    { name: "HighCloud Solutions, Inc.", url: "https://www.highcloudsolutions.com" },
    { name: "Edifecs, Inc. (Cotiviti, Inc.)", url: "https://www.edifecs.com" },
    { name: "Forrester Research", url: "https://www.forrester.com" },
    { name: "Varyn Consulting in collaboration with Affable BPM", url: "https://www.varyn.com" },
    { name: "Amazon Web Services, Inc. (AWS)", url: "https://aws.amazon.com" },
    { name: "CyncHealth Minnesota", url: "https://cynchealth.org" },
    { name: "Public Knowledge, LLC", url: "https://www.publicknowledge.io" },
    { name: "Clarity Solutions Group", url: "https://www.clarity-innovations.com" },
    { name: "Airdev Inc.", url: "https://www.airdev.co" },
    { name: "AidKit", url: "https://www.aidkit.io" },
    { name: "KPMG LLP", url: "https://kpmg.com" },
    { name: "OptumInsight, Inc. (Optum)", url: "https://www.optum.com" },
    { name: "Briljent, LLC", url: "https://www.briljent.com" },
    { name: "Last Call Media", url: "https://lastcallmedia.com" },
    { name: "Noridian Healthcare Solutions (Noridian)", url: "https://www.noridian.com" },
    { name: "IBM Consulting", url: "https://www.ibm.com/consulting" },
    { name: "Equifax Workforce Solutions LLC", url: "https://workforce.equifax.com" },
    { name: "Cloud Technology Innovations, LLC dba Healthcare Fraud Shield", url: "https://www.healthcarefraudshield.com" },
    { name: "CaseWorthy, Inc.", url: "https://www.caseworthy.com" },
    { name: "Elixir Lab USA Inc (d/b/a Cardinality.ai)", url: "https://www.cardinality.ai" },
    { name: "Skyward IT Solutions, LLC (Skyward)", url: "https://www.skywarditsolutions.com" },
    { name: "Solventum", url: "https://www.solventum.com" },
    { name: "Google LLC", url: "https://www.google.com" },
    { name: "Leidos, Inc.", url: "https://www.leidos.com" },
    { name: "FEI.com, Inc. dba FEI Systems (FEI)", url: "https://www.feisystems.com" },
    { name: "SteadyIQ", url: "https://www.steadyiq.com" },
    { name: "Insight Public Sector, Inc.", url: "https://www.insight.com/en_US/public-sector.html" },
    { name: "Flexion Inc.", url: "https://flexion.us" },
    { name: "Slalom", url: "https://www.slalom.com" },
    { name: "Paragon Employment Solutions, LLC dba Paragon IT Professionals", url: "https://www.paragonitprofessionals.com" },
    { name: "Microsoft Corporation", url: "https://www.microsoft.com" },
    { name: "Red Hat, Inc.", url: "https://www.redhat.com" },
    { name: "Merative US L.P.", url: "https://www.merative.com" },
    { name: "Quantiphi Inc.", url: "https://www.quantiphi.com" },
    { name: "Abt Global", url: "https://www.abtglobal.com" },
    { name: "Lotak LLC", url: "https://www.lotak.com" },
    { name: "Fortuna Health", url: "https://www.fortunahealth.com" },
    { name: "Deloitte Consulting LLP", url: "https://www2.deloitte.com/us/en/pages/consulting/solutions/consulting.html" },
    { name: "ID.me, LLC", url: "https://www.id.me" },
    { name: "HealthTech Solutions", url: null },
    { name: "Speridian Technologies, LLC", url: "https://www.speridian.com" }
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
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                  {vendors.map((vendor, index) => (
                    <li key={index} className="text-gray-800">
                      {vendor.url ? (
                        <a
                          href={vendor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-mn-accent-teal hover:text-mn-primary hover:underline transition-colors"
                        >
                          {vendor.name}
                        </a>
                      ) : (
                        <span className="text-gray-800">{vendor.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
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
