import React, { useState } from 'react';
import { Trophy, Users, Calendar, FileText, ChefHat, Package, Utensils, CheckCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const GreatBakeOff: React.FC = () => {
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    setOpenSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-mn-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              The Great MES Modernization Bake-Off
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              An innovative challenge process that brings together software providers and implementation teams to create fully-baked solutions one slice at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              The Bake-Off Process
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our innovative approach breaks down complex system modernization into manageable, deliverable slices.
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 0 - Ongoing */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-neutral-accent">
              <button
                onClick={() => toggleStep(0)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openSteps.has(0)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-neutral-accent rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-mn-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Ongoing Information Sessions
                  </h3>
                </div>
                {openSteps.has(0) ? (
                  <ChevronUp className="h-6 w-6 text-mn-neutral-accent flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-neutral-accent flex-shrink-0" />
                )}
              </button>
              {openSteps.has(0) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 mb-4">
                    We hold information sessions on a recurring basis for any interested vendors to attend, providing opportunities to ask questions, identify dependencies, and stay updated on project developments.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-mn-primary mb-2">Ask Questions</h4>
                      <p className="text-sm text-gray-600">Get clarification on requirements, processes, and expectations</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-mn-primary mb-2">Identify Dependencies</h4>
                      <p className="text-sm text-gray-600">Discuss technical and operational dependencies that need consideration</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-mn-primary mb-2">Project Updates</h4>
                      <p className="text-sm text-gray-600">Stay informed about project progress, artifacts, and timeline changes</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-mn-neutral-lightblue bg-opacity-20 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      Check out our{' '}
                      <a
                        href="https://app.mural.co/t/minnesotamesmodernizationcan3670/m/minnesotamesmodernizationcan3670/1754081683082/fccc2005d83a2d11a12bea54bf6c2caa55b5fdbc?sender=uc99ad10c761de24074363019"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mn-accent-teal font-semibold hover:text-mn-primary transition-colors underline"
                      >
                        Mural board
                      </a>
                      {' '}for the schedule of upcoming information sessions and web conference information.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 1 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-secondary">
              <button
                onClick={() => toggleStep(1)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openSteps.has(1)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-secondary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Step 1: Fill the Cupboards
                  </h3>
                </div>
                {openSteps.has(1) ? (
                  <ChevronUp className="h-6 w-6 text-mn-secondary flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-secondary flex-shrink-0" />
                )}
              </button>
              {openSteps.has(1) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 mb-4">
                    The MES Modernization strategy is focused on selecting enterprise-standard components that align with our future-state vision criteria.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Options */}
                    <div>
                      <h4 className="text-lg font-semibold text-mn-primary mb-4">Ingredients are made available for bakers to choose from:</h4>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-mn-primary mb-2">Enterprise Standard Products</h5>
                          <p className="text-sm text-gray-600">Software products already available for enterprise use within Minnesota's environment</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-mn-primary mb-2">Master Contracts</h5>
                          <p className="text-sm text-gray-600">Products available through master contracts or resellers</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-mn-primary mb-2">Challenge RFP Submissions</h5>
                          <p className="text-sm text-gray-600">Software products submitted as part of this challenge RFP process</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <p>• RFP responses remain in consideration until implemented or withdrawn</p>
                            <p>• Vendors can submit new RFP responses at any time</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selection Criteria */}
                    <div>
                      <h4 className="text-lg font-semibold text-mn-primary mb-4">Ingredients that are most likely to be selected will meet the following conditions:</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-mn-secondary rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">Incur <strong>minimal cost</strong> until a decision is made to scale in a production environment</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-mn-secondary rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">Can be <strong>rapidly provisioned</strong> to any baker and can be used effectively without help from the manufacturer</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-mn-secondary rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">Provide transparent, understandable monthly costs with clear attribution to benefiting diners, enabling <strong>straightforward cost sharing</strong> when needed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/software-rfp-requirements"
                      className="inline-flex items-center text-mn-accent-teal font-semibold hover:text-mn-primary transition-colors"
                    >
                      View Software RFP Requirements
                      <FileText className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-accent-teal">
              <button
                onClick={() => toggleStep(2)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openSteps.has(2)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-accent-teal rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Step 2: Cake Proposals
                  </h3>
                </div>
                {openSteps.has(2) ? (
                  <ChevronUp className="h-6 w-6 text-mn-accent-teal flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-accent-teal flex-shrink-0" />
                )}
              </button>
              {openSteps.has(2) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 mb-4">
                    Bakers may choose any ingredients from the cupboard and propose full cake concepts, with an initial effort scoped as a slice(s) or layer(s) to be served during the bake-off.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Slice-Focused Delivery */}
                    <div>
                      <h4 className="text-lg font-semibold text-mn-primary mb-4">Slice-Focused Delivery</h4>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-mn-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">1</span>
                            </div>
                            <p className="text-sm text-gray-700">Choose a <strong>slice focus</strong> from the delivery backlog (or propose your own)</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-mn-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">2</span>
                            </div>
                            <p className="text-sm text-gray-700">Propose a <strong>cake solution</strong>, identifying ingredients needed and any dependencies / support required</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-mn-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">3</span>
                            </div>
                            <p className="text-sm text-gray-700">Describe your <strong>baker team</strong> and why they are best equipped to deliver the tastiest cake - submit 1-3 expert baker resumes.</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-mn-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">4</span>
                            </div>
                            <div className="text-sm text-gray-700">
                              <p className="mb-2">List how much it will <strong><u>cost</u></strong>:</p>
                              <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-mn-secondary rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-700">The cost of delivering a <strong><em>first slice</em></strong> of cake meeting the definition of done criteria</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-mn-secondary rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-700">The estimated cost of your <strong><em>proposed cake</em></strong> batter when at scale</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-mn-secondary rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-700">The monthly cost of your <strong><em>baker team</em></strong> to deliver additional slices from the backlog</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/slice-rfp-response"
                        className="inline-flex items-center text-mn-accent-teal font-semibold hover:text-mn-primary transition-colors"
                      >
                        Submit Slice RFP Response
                        <FileText className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                    
                    {/* Layer-Focused Delivery */}
                    <div>
                      <h4 className="text-lg font-semibold text-mn-primary mb-4">Layer-Focused Delivery</h4>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-mn-accent-teal rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">1</span>
                            </div>
                            <p className="text-sm text-gray-700">Chose a <strong>layer capability</strong> from the enablement backlog (or propose your own)</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-mn-accent-teal rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">2</span>
                            </div>
                            <p className="text-sm text-gray-700">Propose the <strong>definition of done</strong> for layer completion and <strong>Service Level Agreements (SLAs)</strong> the team will support after delivery</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-mn-accent-teal rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">3</span>
                            </div>
                            <p className="text-sm text-gray-700">Describe your <strong>layer support team</strong> and why they are the best equipped to standardize and maintain a layer of the cake - submit 1-3 layer support team member resumes</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-mn-accent-teal rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">4</span>
                            </div>
                            <div className="text-sm text-gray-700">
                              <p className="mb-2">List how much it will <strong><u>cost</u></strong>:</p>
                              <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-mn-accent-teal rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-700">The cost to <strong><em>achieve the definition of done</em></strong> submitted</p>
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-mn-accent-teal rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-700">The <strong><em>monthly cost</em></strong> to ensure continued support ongoing</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/layer-rfp-response"
                        className="inline-flex items-center text-mn-accent-teal font-semibold hover:text-mn-primary transition-colors"
                      >
                        Submit Layer RFP Response
                        <FileText className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-6 bg-mn-neutral-lightblue bg-opacity-20 rounded-lg p-4">
                    <h4 className="font-semibold text-mn-primary mb-2">Important Notes:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>1) Services costs must be between $1 and $10M</li>
                      <li>2) The end date of any resulting contract will be 9/30/2026</li>
                      <li>3) Vendors may submit multiple teams for different slices and layers</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-accent-yellow">
              <button
                onClick={() => toggleStep(3)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openSteps.has(3)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-accent-yellow rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-mn-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Step 3: Evaluation and Selection
                  </h3>
                </div>
                {openSteps.has(3) ? (
                  <ChevronUp className="h-6 w-6 text-mn-accent-yellow flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-accent-yellow flex-shrink-0" />
                )}
              </button>
              {openSteps.has(3) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 mb-4">
                    Submitted Delivery RFP responses are <strong>evaluated monthly</strong> using established criteria.
                  </p>
                  
                  {/* Process Steps */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-mn-primary mb-4">Process Steps</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-mn-accent-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-mn-primary text-xs font-bold">1</span>
                          </div>
                          <p className="text-sm text-gray-700">RFP submissions received each month by 3:00 PM on the 15th of that month will be dispositioned by the end of the month</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-mn-accent-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-mn-primary text-xs font-bold">2</span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <p className="mb-2">The disposition will be one of the following:</p>
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-gray-700">A) Selected</p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-gray-700">B) Rejected</p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-gray-700">C) Postponed to Next Month's Evaluation. Vendors with postponed submissions can withdraw at any time</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-mn-accent-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-mn-primary text-xs font-bold">3</span>
                          </div>
                          <p className="text-sm text-gray-700">If selected, the individuals submitted in the response must be available to start work by the 10th of the following month. If the submitted individuals are not available, the selection will be revoked</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-mn-accent-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-mn-primary text-xs font-bold">4</span>
                          </div>
                          <p className="text-sm text-gray-700">Selected teams will be entered into the contract, which will be auto-generated based on the contract template and the response</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Criteria */}
                  <div>
                    <h4 className="text-lg font-semibold text-mn-primary mb-4">Evaluation Criteria</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-6">
                        Slice submissions will be prioritized ahead of layer submissions. A layer submission will only be selected if it is a clear dependency for all slice work and cannot reasonably be delivered by the slice team. By default, layer submissions will be deferred until there is a confirmed, shared need.
                      </p>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Slice Evaluation Criteria */}
                        <div>
                          <h5 className="text-lg font-semibold text-mn-primary mb-4">Slice Evaluation Criteria</h5>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">Assessment of the team's ability to deliver - 30%</p>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">Cost of the initial slice - 20%</p>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">Monthly cost of ongoing slice delivery and support - 40%</p>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">Estimated ingredient cost at scale - 10%</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Layer Evaluation Criteria */}
                        <div>
                          <h5 className="text-lg font-semibold text-mn-primary mb-4">Layer Evaluation Criteria</h5>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">Assessment of the Definition of Done and SLAs - 20%</p>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">Assessment of the Layer support team's ability to deliver - 20%</p>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">Cost to achieve the definition of done - 30%</p>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-mn-accent-yellow rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">Monthly cost to maintain the defined SLAs - 30%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 bg-mn-neutral-lightblue bg-opacity-20 rounded-lg p-4">
                    <h4 className="font-semibold text-mn-primary mb-2">Important Notes:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>1) DHS intends to select a mix of vendor types to foster innovation and new perspectives</li>
                      <li>2) Multiple vendor teams can be selected from the same vendor, which is the primary mechanism by which vendors can expect to scale their involvement</li>
                      <li>3) DHS must cap vendor team selections once the monthly and deliverable based services cost reaches $10M by 9/30/2026</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-accent-brown">
              <button
                onClick={() => toggleStep(4)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openSteps.has(4)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-accent-brown rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <ChefHat className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Step 4: Bake a Cake and Serve a Slice
                  </h3>
                </div>
                {openSteps.has(4) ? (
                  <ChevronUp className="h-6 w-6 text-mn-accent-brown flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-accent-brown flex-shrink-0" />
                )}
              </button>
              {openSteps.has(4) && (
                <div className="px-8 pb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Slice Delivery */}
                    <div>
                      <h4 className="text-xl font-semibold text-mn-primary mb-6">Slice Delivery</h4>
                      <p className="text-gray-700 mb-6">
                        Selected slice teams deliver full cakes and serve the selected end-to-end slice, achieving outcomes in an integrated environment while adhering to published guidelines, standards, and compliance requirements.
                      </p>
                      
                      <h5 className="text-lg font-semibold text-mn-primary mb-4">Delivery Process</h5>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Slice teams are responsible for delivering a complete end-to-end solution for their assigned slice</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Teams must include all skills and expertise required to complete their slice</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Any anticipated layer dependencies must be identified by the slice team</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Unresolved or unexpected dependencies may pause delivery until the necessary support is in place</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Each delivery must meet the established definition of done criteria before it is accepted</p>
                          </div>
                        </div>
                      </div>
                      
                      <h5 className="text-lg font-semibold text-mn-primary mb-4 mt-6">Payment Structure</h5>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Teams receive the amount proposed for the slice in scope when the definition of done is met</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Teams receive the monthly amount proposed based on the delivery of a monthly value report</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">The state will continually evaluate value delivered</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Layer Delivery */}
                    <div>
                      <h4 className="text-xl font-semibold text-mn-primary mb-6">Layer Delivery</h4>
                      <p className="text-gray-700 mb-6">
                        Layer delivery teams deliver and support the proposed capability.
                      </p>
                      
                      <h5 className="text-lg font-semibold text-mn-primary mb-4">Delivery Process</h5>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Layer teams are responsible for completing the definition of done</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Once complete, the team is responsible for meeting the defined SLAs</p>
                          </div>
                        </div>
                      </div>
                      
                      <h5 className="text-lg font-semibold text-mn-primary mb-4 mt-6">Payment Structure</h5>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Teams receive the amount proposed for the delivery of the layer when the definition of done is met</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">Teams receive the monthly amount proposed based on the delivery of a monthly value report, including the SLAs defined in the submission</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-mn-accent-brown rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">The state will continually evaluate value delivered</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-accent-purple">
              <button
                onClick={() => toggleStep(5)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openSteps.has(5)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-accent-purple rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Step 5: Cake Inspection and Slice Tasting
                  </h3>
                </div>
                {openSteps.has(5) ? (
                  <ChevronUp className="h-6 w-6 text-mn-accent-purple flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-accent-purple flex-shrink-0" />
                )}
              </button>
              {openSteps.has(5) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 mb-4">
                    Cakes are inspected for alignment to the future-state vision criteria. Slices are evaluated to ensure Definition of Done completion and "tastiness" of the outcomes.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Is the solution secure?</li>
                      <li>• Does it integrate well with our existing environment?</li>
                      <li>• Can our people support it?</li>
                      <li>• Can we make changes rapidly?</li>
                      <li>• Do our customers like the slice we've served to them so far?</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Step 6 */}
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-mn-secondary">
              <button
                onClick={() => toggleStep(6)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                aria-expanded={openSteps.has(6)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-mn-secondary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-mn-primary">
                    Solution Confidence Achieved - Launch the Scaling Phase!
                  </h3>
                </div>
                {openSteps.has(6) ? (
                  <ChevronUp className="h-6 w-6 text-mn-secondary flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-mn-secondary flex-shrink-0" />
                )}
              </button>
              {openSteps.has(6) && (
                <div className="px-8 pb-8">
                  <p className="text-gray-700 mb-4">
                    The process continues until an enterprise standard solution emerges that meets future-state vision criteria and we're ready to transition to the scaling phase.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• We have validated a complete solution through multiple successful slice deliveries, each demonstrating the ability to achieve targeted outcomes while aligning with future-state vision criteria</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              Get Started
            </h2>
            <p className="text-xl text-gray-700">
              Ready to participate? Choose your path below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-mn-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-mn-primary mb-4">Software Providers</h3>
              <p className="text-gray-700 mb-6">
                Add your product to the MES Cupboard
              </p>
              <Link
                to="/software-rfp-requirements"
                className="inline-flex items-center justify-center px-6 py-3 bg-mn-secondary text-white font-semibold rounded-lg hover:bg-mn-accent-teal transition-colors"
              >
                View Software Requirements
              </Link>
            </div>

            <div className="text-center">
              <Users className="h-12 w-12 text-mn-accent-teal mx-auto mb-4" />
              <h3 className="text-xl font-bold text-mn-primary mb-4">System Integration Teams</h3>
              <p className="text-gray-700 mb-6">
                Propose your team of expert bakers to bake us a cake and serve a slice
              </p>
              <Link
                to="/slice-rfp-response"
                className="inline-flex items-center justify-center px-6 py-3 bg-mn-accent-teal text-white font-semibold rounded-lg hover:bg-mn-secondary transition-colors"
              >
                Submit Slice RFP Response
              </Link>
            </div>

            <div className="text-center">
              <Users className="h-12 w-12 text-mn-accent-brown mx-auto mb-4" />
              <h3 className="text-xl font-bold text-mn-primary mb-4">Capability Providers</h3>
              <p className="text-gray-700 mb-6">
                Help fill a gap or dependency in our current cake baking capabilities
              </p>
              <Link
                to="/layer-rfp-response"
                className="inline-flex items-center justify-center px-6 py-3 bg-mn-accent-brown text-white font-semibold rounded-lg hover:bg-mn-secondary transition-colors"
              >
                Submit Layer RFP Response
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GreatBakeOff;