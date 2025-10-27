import React, { useState } from 'react';
import { AlertCircle, ExternalLink, TrendingUp, ChevronDown, ChevronUp, Building2, AlertTriangle, Lightbulb, MessageSquare } from 'lucide-react';

const RFIEngagementInsights: React.FC = () => {
  const [isVendorsOpen, setIsVendorsOpen] = useState(false);
  const [openRisks, setOpenRisks] = useState<Set<number>>(new Set());
  const [openRecommendations, setOpenRecommendations] = useState<Set<number>>(new Set());

  const toggleRisk = (riskNumber: number) => {
    setOpenRisks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(riskNumber)) {
        newSet.delete(riskNumber);
      } else {
        newSet.add(riskNumber);
      }
      return newSet;
    });
  };

  const toggleRecommendation = (recNumber: number) => {
    setOpenRecommendations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recNumber)) {
        newSet.delete(recNumber);
      } else {
        newSet.add(recNumber);
      }
      return newSet;
    });
  };

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
          <div className="space-y-6">
            {/* Risk Theme #5 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-red-500">
              <button
                onClick={() => toggleRisk(5)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRisks.has(5)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Operational and Organizational Capacity
                  </h3>
                </div>
                {openRisks.has(5) ? (
                  <ChevronUp className="h-6 w-6 text-red-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-red-500 flex-shrink-0" />
                )}
              </button>
              {openRisks.has(5) && (
                <div className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">Summary Risk</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Execution depends on a limited pool of SMEs, policy staff, and state resources. Vendors flagged that state capacity bottlenecks could slow delivery, especially with multiple vendors working in parallel. Risks include unclear roles for state product owners, uneven readiness of support staff, and vendors overwhelming state staff with deliverables. There's also concern that without embedded knowledge transfer, the state will remain dependent on vendors long-term.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">DHS Comments, Clarifications, and Mitigations</h4>
                    <p className="text-gray-700 leading-relaxed">
                      We recognize that limited state capacity is a critical risk, but our approach is designed to mitigate it more effectively than traditional strategies. Instead of creating urgency through a large vendor contract with fixed deliverable milestones, we plan to move at the pace the organization can support. During the innovation phase, the rate of new bake offs will be governed by the state's readiness, creating a flywheel effect that may start slowly but will gain momentum as social proof builds. Early on, the focus is on ensuring that the small number of people involved are aligned and pushing in the same direction.
                      <br /><br />
                      As momentum grows, we will learn where vendor skills can be absorbed by state staff and where ongoing vendor support will be needed. These decisions will be central to evaluating total cost of ownership. The same flywheel approach applies to scaling. We may begin with a handful of users, refine through real production experience, and then expand at a pace acceptable to staff and operations.
                      <br /><br />
                      Some vendors noted that there may not be a sharp line between the innovation and scaling phases. We agree and anticipate operating in a discovery and delivery mode with two flywheels running in parallel. One will focus on gaining solution confidence while the other builds operational confidence. Both will always turn at a rate that matches state capacity and include tight feedback loops to understand where there are gaps before we push faster.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Theme #6 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500">
              <button
                onClick={() => toggleRisk(6)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRisks.has(6)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Cultural and Change Management
                  </h3>
                </div>
                {openRisks.has(6) ? (
                  <ChevronUp className="h-6 w-6 text-orange-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-orange-500 flex-shrink-0" />
                )}
              </button>
              {openRisks.has(6) && (
                <div className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">Summary Risk</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Many vendors identified organizational change management as the single largest risk. They noted that without strong executive sponsorship, cultural alignment, and dedicated change management resources, even technically sound solutions could fail to be adopted. Vendors pointed to the high rate of failure in large transformations tied to weak leadership and OCM as evidence of this risk.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">DHS Comments, Clarifications, and Mitigations</h4>
                    <p className="text-gray-700 leading-relaxed">
                      We agree this remains one of the most significant risks in any modernization effort. Our strategy was intentionally designed to mitigate it, but we also acknowledge it requires constant focus and energy. The guiding tenet of Cultivate Culture is our primary mitigation. We start with willing champions in a cucumber water environment that is separated from the existing brine. The goal is to invite and inspire participation, not assign it through a resource allocation process. We are taking time to build a team that has fully internalized what this strategy means before moving ahead.
                      <br /><br />
                      This vendor engagement process is itself an extension of that invitation. Only vendors who can embrace the guiding tenets and work differently will be able to support this effort effectively. We also recognize that the effort will only move as fast as the organization is able to change. We cannot scale faster than this pace.
                      <br /><br />
                      Even with these mitigations, executive leadership challenges remain real. The current environment leaves leaders with little capacity to think about the future. We need to balance where we must demonstrate value before gaining full support, yet that support is itself essential to sustaining value delivery.
                      <br /><br />
                      We must continue balancing the delivery of visible value in the present with maintaining a clear focus on the future so that executive support is both sustained and strengthened. Our strategy is designed to make this balancing act possible, and we welcome creative solutions from the vendor community to help achieve it.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Theme #7 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-yellow-500">
              <button
                onClick={() => toggleRisk(7)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRisks.has(7)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Outcome Definition and Measurement
                  </h3>
                </div>
                {openRisks.has(7) ? (
                  <ChevronUp className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                )}
              </button>
              {openRisks.has(7) && (
                <div className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">Summary Risk</h4>
                    <p className="text-gray-700 leading-relaxed">
                      The model hinges on outcomes-based procurement, but vendors cautioned that outcomes are not yet clearly defined, benchmarked, or measurable. Risks include disputes over payments, inconsistent evaluation across vendors, and a lack of baseline data to prove improvements. Without objective, transparent metrics and standardized evaluation frameworks, the program risks confusion and conflict.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">DHS Comments, Clarifications, and Mitigations</h4>
                    <p className="text-gray-700 leading-relaxed">
                      We found it noteworthy that despite the strategy's heavy emphasis on outcomes, vendors still identified outcomes and measurement as a primary risk. This reinforces our view that weak outcome focus is a central problem in most modernization efforts. It also validates the inclusion of "focus on outcomes" as a guiding tenet and the detailed outcomes and measurement framework presented in Appendix E and F of the RFI Summary. In other words, vendors highlighting this risk tells us we are targeting the right issue.
                      <br /><br />
                      We recognize that the lack of available baselines is a challenge. To address this, we plan to embed outcome results directly into the definition of done for all work delivered. The plan is to establish a baseline from the very first slice, which can be evaluated against the current experience and enable progress to be measured going forward.
                      <br /><br />
                      We also recognize that outcomes may be harder to measure in the early innovation phase, which complicates vendor evaluation. To manage this, our procurement approach emphasizes relative evaluation (comparing vendor teams against one another) rather than relying solely on pre-determined quantitative targets. This allows us to reward the teams that demonstrate the most learning, adaptability, and progress toward outcomes, even in the absence of complete baseline data.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Theme #8 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500">
              <button
                onClick={() => toggleRisk(8)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRisks.has(8)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Compliance, Certification, and Federal Alignment
                  </h3>
                </div>
                {openRisks.has(8) ? (
                  <ChevronUp className="h-6 w-6 text-green-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-green-500 flex-shrink-0" />
                )}
              </button>
              {openRisks.has(8) && (
                <div className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">Summary Risk</h4>
                    <p className="text-gray-700 leading-relaxed">
                      A few vendors flagged the risk of unclear CMS certification pathways. If slice-based delivery can't be aligned to CMS requirements incrementally, the state may face delays or retroactive compliance work that negates the benefits of agility.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">DHS Comments, Clarifications, and Mitigations</h4>
                    <p className="text-gray-700 leading-relaxed">
                      We have engaged CMS leadership from the earliest stages of developing this strategy and have their support and understanding as we pursue a novel approach. CMS has communicated that there is considerable flexibility in the regulations and a willingness to work with states experimenting with new models.
                      <br /><br />
                      It is also important to note that the innovation phase is being conducted under a planning APD. For CMS purposes, this phase functions much like a strategy engagement: it is a product evaluation and alternatives analysis that precedes any request for implementation funding. The IAPD stage is when the majority of certification requirements apply, and part of the exit criteria of the innovation phase will be to establish the approach for meeting those requirements.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Theme #9 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500">
              <button
                onClick={() => toggleRisk(9)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRisks.has(9)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Scope, Slice Sizing, and Sequencing
                  </h3>
                </div>
                {openRisks.has(9) ? (
                  <ChevronUp className="h-6 w-6 text-blue-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-blue-500 flex-shrink-0" />
                )}
              </button>
              {openRisks.has(9) && (
                <div className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">Summary Risk</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Several responses noted that slices may work in isolation but fail to scale into enterprise-wide solutions. Without early attention to architecture, performance, and reusability, small "wins" could lead to expensive rework later. There was a concern that focusing too narrowly on slices could cause the state to miss bigger cross-program opportunities, creating solutions that aren't reusable or broadly impactful.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">DHS Comments, Clarifications, and Mitigations</h4>
                    <p className="text-gray-700 leading-relaxed">
                      As covered in the RFI summary document, we recognize this risk as a new intentional tradeoff we are accepting to mitigate the root cause challenges outlined in the strategy videos.
                      <br /><br />
                      One key mitigation is adherence to the future state vision criteria. These criteria act as safeguards to ensure that any cake solutions demonstrated through a delivery slice meet enterprise architectural standards and establish capabilities that are reusable, adaptable, extensible, and scalable. The central questions are whether the solution can be changed easily and whether new slices can be added without difficulty. Our goal is to answer these questions in the lowest risk way possible before committing to scale.
                      <br /><br />
                      Reusability across outcomes and slices, particularly for central capabilities, is paramount. This is a core purpose of the innovation phase and of the bake offs, which are designed to reveal how well solutions handle change and reuse. The hypothesis is that this can be discovered faster and with less risk by observing vendors deliver multiple slices and adapt them, rather than by attempting to design and build entire layers upfront.
                      <br /><br />
                      At the same time, we recognize there may be situations where a layer first approach is more effective. For that reason, a layer RFP option has been incorporated into the procurement approach so that layers can be pursued when clearly beneficial.
                      <br /><br />
                      In summary, this risk is known, understood, and deliberately accepted as part of the slice driven strategy. We expect to identify areas that will require further mitigation, but we believe the risks inherent in traditional approaches, which were identified in the diagnostic videos, are larger and more difficult to address than this tradeoff.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Theme #10 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-purple-500">
              <button
                onClick={() => toggleRisk(10)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRisks.has(10)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Legislative and Policy Volatility
                  </h3>
                </div>
                {openRisks.has(10) ? (
                  <ChevronUp className="h-6 w-6 text-purple-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-purple-500 flex-shrink-0" />
                )}
              </button>
              {openRisks.has(10) && (
                <div className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">Summary Risk</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Vendors emphasized that shifting federal or state policy requirements (e.g., work requirements, new reporting rules) could upend modernization priorities midstream. If slices aren't designed with policy adaptability, projects could be derailed.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">DHS Comments, Clarifications, and Mitigations</h4>
                    <p className="text-gray-700 leading-relaxed">
                      This risk is more pressing today than ever. As highlighted in the strategic challenges diagnosis, the enterprise is under constant pressure from new regulatory mandates and media-driven priorities that may prove difficult to implement without stable central capabilities. No modernization strategy can fully escape this risk, but our approach is intentionally designed to mitigate it as much as possible.
                      <br /><br />
                      For example, the week after the H.R.1 bill passed, our action planning team added work requirement slices to the backlog, which could be elevated in priority if the modernized environment must take on responsibility for meeting those requirements. Even with this adaptive approach, shifting policy and prioritization will likely remain a major risk to disrupting modernization work.
                      <br /><br />
                      We continue to welcome vendor input, engagement, and support in identifying ways to mitigate this risk.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Theme #11 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-pink-500">
              <button
                onClick={() => toggleRisk(11)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRisks.has(11)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-pink-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Vendor Capability Gaps and Readiness
                  </h3>
                </div>
                {openRisks.has(11) ? (
                  <ChevronUp className="h-6 w-6 text-pink-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-pink-500 flex-shrink-0" />
                )}
              </button>
              {openRisks.has(11) && (
                <div className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">Summary Risk</h4>
                    <p className="text-gray-700 leading-relaxed">
                      New entrants may lack Medicaid expertise, while incumbents may offer rigid, "black-box" products that aren't easily configurable. Both pose risks of cost overruns, misalignment, and failed outcomes if vendor readiness isn't addressed.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-mn-primary mb-3">DHS Comments, Clarifications, and Mitigations</h4>
                    <p className="text-gray-700 leading-relaxed">
                      The innovation phase is designed to mitigate these risks while still leaving the door open for new entrants. By structuring the effort as a product evaluation exercise, the state can vet vendor teams in smaller increments before scaling, creating a low-risk way to build confidence in both their capabilities and their fit.
                      <br /><br />
                      This approach also allows us to test whether black box solutions are truly viable. If a solution can reliably achieve outcomes end to end and demonstrate flexibility across a variety of slices, it may be a strong candidate to scale. If it cannot, that limitation will become evident during the innovation phase, before major commitments are made.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-mn-accent-teal rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-mn-primary mb-4">
                  Vendor Recommendations
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Vendors provided detailed recommendations for how Minnesota can strengthen the MES Modernization approach. The most common suggestions are summarized below.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Recommendation Theme #1 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-secondary">
              <button
                onClick={() => toggleRecommendation(1)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRecommendations.has(1)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-secondary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Strengthen Governance and Coordination
                  </h3>
                </div>
                {openRecommendations.has(1) ? (
                  <ChevronUp className="h-6 w-6 text-mn-secondary flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-secondary flex-shrink-0" />
                )}
              </button>
              {openRecommendations.has(1) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Vendors emphasized that modernization success will depend on clear, empowered governance structures to drive decisions, resolve conflicts, and align multiple vendors.
                  </p>
                  <h4 className="text-lg font-semibold text-mn-primary mb-3">Suggestions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Establish a Strategic Transformation Office or Transformation Management Office (TMO) to manage cross-agency coordination.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Stand up a Slice Coordination Council including DHS, MNIT, and vendors to oversee dependencies and shared standards.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Define escalation protocols and conflict-resolution pathways with time-bound steps.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Appoint strong state-side product owners and technical liaisons for each slice.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Protect executive sponsorship with leadership coaching and OCM support for executives.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation Theme #2 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-accent-teal">
              <button
                onClick={() => toggleRecommendation(2)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRecommendations.has(2)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-accent-teal rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Build Enterprise Foundations First
                  </h3>
                </div>
                {openRecommendations.has(2) ? (
                  <ChevronUp className="h-6 w-6 text-mn-accent-teal flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-accent-teal flex-shrink-0" />
                )}
              </button>
              {openRecommendations.has(2) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Vendors urged Minnesota to avoid fragmentation by standing up shared platforms and guardrails early so that slices align to a common enterprise vision.
                  </p>
                  <h4 className="text-lg font-semibold text-mn-primary mb-3">Suggestions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Invest in identity and access management, integration middleware, and data standards upfront.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Fund a foundational "Layer 0" platform team responsible for CI/CD pipelines, observability, data exchange, and security.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Lock in core architectural standards (APIs, UX patterns, data models) once proven in production.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Treat integration and master data services as strategic products with SLAs and ongoing ownership.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Create sandbox environments and mock datasets for vendors to test against before onboarding.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation Theme #3 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-accent-yellow">
              <button
                onClick={() => toggleRecommendation(3)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRecommendations.has(3)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-accent-yellow rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-mn-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Refine Procurement and Contracting Models
                  </h3>
                </div>
                {openRecommendations.has(3) ? (
                  <ChevronUp className="h-6 w-6 text-mn-accent-yellow flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-accent-yellow flex-shrink-0" />
                )}
              </button>
              {openRecommendations.has(3) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Vendors recommended adapting the procurement model to reduce financial volatility and sunk costs. Their aim was to make participation sustainable while still holding vendors accountable to performance.
                  </p>
                  <h4 className="text-lg font-semibold text-mn-primary mb-3">Suggestions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Introduce tiered contracts (short bake-off → longer scaling contract upon meeting KPIs).</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Provide stipends or partial compensation for non-selected vendors to offset upfront costs.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Define transparent on-ramp and off-ramp criteria, including automatic extension triggers for successful vendors.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Offer options for bundled slices or multi-slice engagements to reduce rebid volume.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Be flexible on license vs service separation — allow vendors to propose integrated solutions if needed.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation Theme #4 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-600">
              <button
                onClick={() => toggleRecommendation(4)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRecommendations.has(4)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Embed Financial Discipline and Outcome Measurement
                  </h3>
                </div>
                {openRecommendations.has(4) ? (
                  <ChevronUp className="h-6 w-6 text-green-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-green-600 flex-shrink-0" />
                )}
              </button>
              {openRecommendations.has(4) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To make outcome-based contracting workable, vendors recommended a disciplined approach to measurement. Their suggestions focused on transparency and consistency, reducing ambiguity that could otherwise stall payments or erode trust.
                  </p>
                  <h4 className="text-lg font-semibold text-mn-primary mb-3">Suggestions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Establish baseline outcome measurements before starting slices.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Use standardized evaluation frameworks across vendors for fair comparison.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Maintain an outcomes tracker that quantifies savings, reinvestment, and ROI.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Tie payment milestones to clearly defined benchmarks, with transparent review and dispute resolution protocols.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Stand up a FinOps discipline to track spend by slice, layer, and outcome.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation Theme #5 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-600">
              <button
                onClick={() => toggleRecommendation(5)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRecommendations.has(5)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Manage Organizational and Cultural Change
                  </h3>
                </div>
                {openRecommendations.has(5) ? (
                  <ChevronUp className="h-6 w-6 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-blue-600 flex-shrink-0" />
                )}
              </button>
              {openRecommendations.has(5) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Vendors cautioned that modernization cannot succeed if cultural readiness lags behind technical progress. Recommendations focused on deliberate training, communication, and incremental change management to sustain stakeholder support.
                  </p>
                  <h4 className="text-lg font-semibold text-mn-primary mb-3">Suggestions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Ensure executives understand agile principles, mindset, and what to expect.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Provide comprehensive staff training on agile, outcomes measurement, and new workflows.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Establish change champion networks across DHS, counties, and partner agencies.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Continuously communicate wins and lessons learned to sustain momentum.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Include vendors with robust OCM frameworks in delivery teams.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Manage perception as an asset: report failures transparently as learning, not vendor failure.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation Theme #6 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-purple-600">
              <button
                onClick={() => toggleRecommendation(6)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRecommendations.has(6)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Clarify Scope, Slice Sizing, and Sequencing
                  </h3>
                </div>
                {openRecommendations.has(6) ? (
                  <ChevronUp className="h-6 w-6 text-purple-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-purple-600 flex-shrink-0" />
                )}
              </button>
              {openRecommendations.has(6) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Vendors gave divergent but related advice: scope must balance feasibility and impact. They pushed DHS to refine how slices are defined and sequenced so that effort produces meaningful value without bogging down in interim complexity.
                  </p>
                  <h4 className="text-lg font-semibold text-mn-primary mb-3">Suggestions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Larger functional modules:</strong> Some suggested broader, module-like increments to achieve visible impact and reduce interim bridges.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Ultra-narrow slices:</strong> Others urged narrowing scope to simple conditions (e.g., one intake path for one program) to reduce complexity at startup.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Layer RFPs:</strong> Introduce parallel "layer-focused" procurements (e.g., document verification, identity services) to deliver early wins.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Incremental production releases:</strong> Allow partial deployments of layers or slices into production to build trust and momentum.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation Theme #7 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-pink-600">
              <button
                onClick={() => toggleRecommendation(7)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRecommendations.has(7)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-pink-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Prioritize User-Centered Design and Whole-Person Outcomes
                  </h3>
                </div>
                {openRecommendations.has(7) ? (
                  <ChevronUp className="h-6 w-6 text-pink-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-pink-600 flex-shrink-0" />
                )}
              </button>
              {openRecommendations.has(7) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Recommendations emphasized making user needs central to both evaluation and delivery. Vendors urged that usability not be sidelined in technical bake-offs but treated as a required outcome.
                  </p>
                  <h4 className="text-lg font-semibold text-mn-primary mb-3">Suggestions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Integrate user research and human-centered design into every slice.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Require multilingual, mobile-first, accessible interfaces in every slice.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Integrate behavioral, community, and justice data for holistic care models.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Include usability and accessibility testing in slice definitions of done.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Design workflows around caseworkers and staff to reduce administrative burden.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Use automation and AI to support case managers with data-heavy tasks.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendation Theme #8 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-indigo-600">
              <button
                onClick={() => toggleRecommendation(8)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openRecommendations.has(8)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Enhance Transparency, Discovery, and Vendor Engagement
                  </h3>
                </div>
                {openRecommendations.has(8) ? (
                  <ChevronUp className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                )}
              </button>
              {openRecommendations.has(8) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Vendors asked for clarity and collaboration throughout the process to lower participation risk.
                  </p>
                  <h4 className="text-lg font-semibold text-mn-primary mb-3">Suggestions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Publish draft challenge RFPs for vendor feedback before finalization.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Share evaluation criteria, cadence, and contract mechanics openly.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Provide onboarding programs, sample slices, and orientation materials.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Keep communication channels open with transparent reporting of progress, challenges, and pivots.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Emphasize discovery and human-centered design in bake-offs, not just speed of technical delivery.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-mn-accent-yellow rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-mn-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-mn-primary mb-4">
                  Ongoing Engagement
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We're continuing to learn from the RFI and vendor Q&A sessions. Future updates will share progress on how vendor feedback is being incorporated into upcoming challenge-based RFPs and pilot opportunities.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-mn-primary mb-4">
              Join Our Vendor Q&A Sessions
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              To view the upcoming vendor Q&A sessions and learn how to contact us directly, visit our public Mural board. This collaborative space provides the latest information on engagement opportunities, session schedules, and direct contact methods.
            </p>
            <a
              href="https://app.mural.co/t/minnesotamesmodernizationcan3670/m/minnesotamesmodernizationcan3670/1754081683082/fccc2005d83a2d11a12bea54bf6c2caa55b5fdbc?sender=uc99ad10c761de24074363019"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-mn-accent-teal text-white text-lg font-semibold rounded-lg hover:bg-mn-primary transition-colors shadow-lg"
            >
              <ExternalLink className="mr-3 h-6 w-6" />
              Visit Minnesota MES Modernization Canvas
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RFIEngagementInsights;
