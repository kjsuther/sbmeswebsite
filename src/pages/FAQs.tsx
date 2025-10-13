import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQs: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      category: "Budget and Funding",
      question: "What is the budget of the project?",
      answer: "There is no fixed or definitive budget figure for this modernization effort. However, for planning and funding request purposes, we are submitting an APD funding request that includes $10 million for vendor services (referred to as 'bakers' in our analogy) and $3 million for software products (our 'ingredients') to cover the first year of the innovation phase. We are also including funding to cover a dedicated internal support team to support the effort. We expect to assess true budgetary needs and either increase or decrease the amount based on the value being delivered for the money expended. Most modernization efforts of this scope spend between $500M and $1B. We hope to come in significantly less than what other states are spending."
    },
    {
      category: "Timeline",
      question: "What is the timeline for the modernization phases?",
      answer: "The project timeline follows a slice-based delivery model, working from a backlog rather than a traditional linear approach. Each slice represents a specific user journey or capability and is prioritized based on value and feasibility. Vendors and stakeholders can refer to the timeline section of our website for up-to-date details about which slices are currently in focus and projected future milestones. This approach allows for agile adaptation as new insights emerge."
    },
    {
      category: "Vendor Participation",
      question: "How will vendors be selected and involved in the project?",
      answer: "Vendors will be engaged through an open and competitive process we call the 'bake-off.' Rather than submitting lengthy proposals, vendors are invited to demonstrate their value by delivering working solutions aligned with our future-state vision. We emphasize rapid iteration, real outcomes, and transparency. The best performing teams will have opportunities to scale their involvement."
    },
    {
      category: "Vendor Participation",
      question: "Why should vendors be interested in participating?",
      answer: "This is a rare opportunity to play a key role in a transformative government modernization effort. Vendors will have the freedom to innovate and tackle meaningful, high-impact challenges that directly benefit the community. Unlike traditional procurements that rely on rigid, pre-negotiated contracts to determine future work, this approach rewards real performance. The more value you deliver, the more opportunities you'll earn."
    },
    {
      category: "Vendor Performance and Evaluation",
      question: "How will vendors be evaluated and managed?",
      answer: "Evaluation is outcome-driven and tailored to the type of vendor:\n\n• For software products, success is defined by your product's effectiveness in improving our prioritized outcomes while meeting our future-state vision criteria. Material investments in software licensing will only be made once we've empirically confirmed the product is a fit for our environment and supports the improvement of program outcomes.\n\n• For services vendors, evaluation is based on the outcomes delivered by your team. Teams must be collaborative, responsive, and able to demonstrate value in short intervals. Performance will be reviewed regularly, and vendors producing the highest performing teams will have opportunities to scale additional teams."
    },
    {
      category: "Vendor Performance and Evaluation",
      question: "What are the key success criteria for vendors?",
      answer: "Success looks different depending on the vendor type:\n\n• For product vendors: You must deliver a product that best fits our future-state vision criteria and the submission requirements as outlined in the challenge RFP process.\n\n• For services vendors: We're looking for high-performing teams who deliver value fast. We anticipate success from teams that are cross-functional, communicate clearly, and work collaboratively with others to achieve shared outcomes. Most importantly, vendors must understand and be willing to work within the framework defined in our strategic approach."
    },
    {
      category: "Support for Vendors",
      question: "What support and resources are available for vendors?",
      answer: "We offer extensive support to help new vendors onboard effectively:\n\n• A dedicated references section on the website includes architectural guidance, future-state vision documents, and technical specifications.\n\n• A support team is available to help navigate both programmatic and technical questions.\n\n• Note: We also track the level of support required by each vendor and factor it into performance evaluation."
    },
    {
      category: "Innovation and Adaptability",
      question: "What are the opportunities for innovation?",
      answer: "Innovation is at the heart of this approach. During the innovation phase, vendors can:\n\n• Submit novel product solutions or propose unique combinations of existing components.\n\n• Rapidly build and demo solutions in a non-production environment.\n\nStakeholders will be able to interact with working prototypes, which breaks down traditional barriers and enables real-world testing of new ideas. Innovation is not just welcomed—it's expected."
    },
    {
      category: "Innovation and Adaptability",
      question: "If focusing only on a small slice, how do we avoid getting locked into a poor solution early on that doesn't accommodate future capability needs?",
      answer: "The innovation phase mitigates early lock-in by tying evaluation to our future-state vision criteria. The first slice delivered by a vendor is just the beginning. Each new slice considered during the innovation phase provides an opportunity to evaluate the adaptability and extensibility of the solution. We don't exit the innovation phase until we have gained sufficient solution confidence across a full range of business complexity."
    },
    {
      category: "Legislation and Context",
      question: "How does the new bill affect this work?",
      answer: "Recent legislation, including work requirements, can create urgency and opportunities—but also misconceptions. Our strategy does not rely solely on these mandates to drive modernization. Instead, we design flexible solutions that ensure compliance with new requirements even as we modernize in parallel."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq, index) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push({ ...faq, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<typeof faqs[0] & { originalIndex: number }>>);

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-mn-accent-purple text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Find answers to common questions about the MES modernization initiative and challenge process.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl font-bold text-mn-primary border-b-2 border-mn-accent-teal pb-2">
                  {category}
                </h2>
                <div className="space-y-4">
                  {categoryFAQs.map((faq) => (
                    <div key={faq.originalIndex} className="bg-white rounded-xl shadow-lg border border-gray-200">
                      <button
                        onClick={() => toggleFAQ(faq.originalIndex)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                        aria-expanded={openFAQ === faq.originalIndex}
                      >
                        <h3 className="text-lg font-semibold text-mn-primary pr-4">
                          {faq.question}
                        </h3>
                        {openFAQ === faq.originalIndex ? (
                          <ChevronUp className="h-5 w-5 text-mn-accent-teal flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-mn-accent-teal flex-shrink-0" />
                        )}
                      </button>
                      {openFAQ === faq.originalIndex && (
                        <div className="px-6 pb-6">
                          <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-mn-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-mn-primary mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our team is here to help. Reach out through any of our available channels for additional support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/feedback"
                className="inline-flex items-center justify-center px-8 py-3 bg-mn-primary text-white font-semibold rounded-lg hover:bg-mn-accent-teal transition-colors"
              >
                Submit a Question
              </a>
              <a
                href="mailto:mes.modernization.dhs@state.mn.us"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-mn-primary text-mn-primary font-semibold rounded-lg hover:bg-mn-primary hover:text-white transition-colors"
              >
                Email Us Directly
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQs;