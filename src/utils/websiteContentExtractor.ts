export interface WebsiteContentItem {
  page: string;
  title: string;
  content: string;
  category?: string;
}

export const extractWebsiteContent = (): WebsiteContentItem[] => {
  const content: WebsiteContentItem[] = [];

  content.push({
    page: 'Home',
    title: 'MES Modernization - MES Bake Off Challenge',
    content: `MES Modernization MES Bake Off Challenge. Join us in transforming Minnesota's Medicaid Enterprise Systems through innovative partnerships, strategic collaboration, and cutting-edge technology solutions. This is your opportunity to shape the future of government services delivery. Strategic Transformation. Collaborative Innovation. Future-Ready Solutions.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Budget and Funding - What is the budget of the project?',
    category: 'Budget and Funding',
    content: `What is the budget of the project? There is no fixed or definitive budget figure for this modernization effort. However, for planning and funding request purposes, we are submitting an APD funding request that includes $10 million for vendor services (referred to as 'bakers' in our analogy) and $3 million for software products (our 'ingredients') to cover the first year of the innovation phase. We are also including funding to cover a dedicated internal support team to support the effort. We expect to assess true budgetary needs and either increase or decrease the amount based on the value being delivered for the money expended. Most modernization efforts of this scope spend between $500M and $1B. We hope to come in significantly less than what other states are spending.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Timeline - What is the timeline for the modernization phases?',
    category: 'Timeline',
    content: `What is the timeline for the modernization phases? The project timeline follows a slice-based delivery model, working from a backlog rather than a traditional linear approach. Each slice represents a specific user journey or capability and is prioritized based on value and feasibility. Vendors and stakeholders can refer to the timeline section of our website for up-to-date details about which slices are currently in focus and projected future milestones. This approach allows for agile adaptation as new insights emerge.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Vendor Participation - How will vendors be selected and involved in the project?',
    category: 'Vendor Participation',
    content: `How will vendors be selected and involved in the project? Vendors will be engaged through an open and competitive process we call the 'bake-off.' Rather than submitting lengthy proposals, vendors are invited to demonstrate their value by delivering working solutions aligned with our future-state vision. We emphasize rapid iteration, real outcomes, and transparency. The best performing teams will have opportunities to scale their involvement.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Vendor Participation - Why should vendors be interested in participating?',
    category: 'Vendor Participation',
    content: `Why should vendors be interested in participating? This is a rare opportunity to play a key role in a transformative government modernization effort. Vendors will have the freedom to innovate and tackle meaningful, high-impact challenges that directly benefit the community. Unlike traditional procurements that rely on rigid, pre-negotiated contracts to determine future work, this approach rewards real performance. The more value you deliver, the more opportunities you'll earn.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Vendor Performance and Evaluation - How will vendors be evaluated and managed?',
    category: 'Vendor Performance and Evaluation',
    content: `How will vendors be evaluated and managed? Evaluation is outcome-driven and tailored to the type of vendor. For software products, success is defined by your product's effectiveness in improving our prioritized outcomes while meeting our future-state vision criteria. Material investments in software licensing will only be made once we've empirically confirmed the product is a fit for our environment and supports the improvement of program outcomes. For services vendors, evaluation is based on the outcomes delivered by your team. Teams must be collaborative, responsive, and able to demonstrate value in short intervals. Performance will be reviewed regularly, and vendors producing the highest performing teams will have opportunities to scale additional teams.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Vendor Performance and Evaluation - What are the key success criteria for vendors?',
    category: 'Vendor Performance and Evaluation',
    content: `What are the key success criteria for vendors? Success looks different depending on the vendor type. For product vendors: You must deliver a product that best fits our future-state vision criteria and the submission requirements as outlined in the challenge RFP process. For services vendors: We're looking for high-performing teams who deliver value fast. We anticipate success from teams that are cross-functional, communicate clearly, and work collaboratively with others to achieve shared outcomes. Most importantly, vendors must understand and be willing to work within the framework defined in our strategic approach.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Support for Vendors - What support and resources are available for vendors?',
    category: 'Support for Vendors',
    content: `What support and resources are available for vendors? We offer extensive support to help new vendors onboard effectively. A dedicated references section on the website includes architectural guidance, future-state vision documents, and technical specifications. A support team is available to help navigate both programmatic and technical questions. Note: We also track the level of support required by each vendor and factor it into performance evaluation.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Innovation and Adaptability - What are the opportunities for innovation?',
    category: 'Innovation and Adaptability',
    content: `What are the opportunities for innovation? Innovation is at the heart of this approach. During the innovation phase, vendors can submit novel product solutions or propose unique combinations of existing components, and rapidly build and demo solutions in a non-production environment. Stakeholders will be able to interact with working prototypes, which breaks down traditional barriers and enables real-world testing of new ideas. Innovation is not just welcomed—it's expected.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Innovation and Adaptability - How do we avoid getting locked into a poor solution early on?',
    category: 'Innovation and Adaptability',
    content: `If focusing only on a small slice, how do we avoid getting locked into a poor solution early on that doesn't accommodate future capability needs? The innovation phase mitigates early lock-in by tying evaluation to our future-state vision criteria. The first slice delivered by a vendor is just the beginning. Each new slice considered during the innovation phase provides an opportunity to evaluate the adaptability and extensibility of the solution. We don't exit the innovation phase until we have gained sufficient solution confidence across a full range of business complexity.`,
  });

  content.push({
    page: 'FAQs',
    title: 'Legislation and Context - How does the new bill affect this work?',
    category: 'Legislation and Context',
    content: `How does the new bill affect this work? Recent legislation, including work requirements, can create urgency and opportunities—but also misconceptions. Our strategy does not rely solely on these mandates to drive modernization. Instead, we design flexible solutions that ensure compliance with new requirements even as we modernize in parallel.`,
  });

  content.push({
    page: 'MES Modernization Strategy',
    title: 'MES Modernization Strategy',
    content: `A focused, coherent approach to transforming Minnesota's Medicaid Enterprise Systems (MES). Strategic Framework includes three components: Challenges Diagnosis - An assessment of the root cause issues preventing successful MES modernizations. Guiding Approach Tenets - Key operating commitments Minnesota has made to directly address the diagnosed challenges. Coherent Action Plan - An actionable framework and approach for applying the guiding approach tenets to overcome the challenges.`,
  });

  content.push({
    page: 'Great Bake-Off',
    title: 'The Great MES Modernization Bake-Off',
    content: `An innovative challenge process that brings together software providers and implementation teams to create fully-baked solutions one slice at a time. Our innovative approach breaks down complex system modernization into manageable, deliverable slices.`,
  });

  content.push({
    page: 'Great Bake-Off',
    title: 'Ongoing Information Sessions',
    content: `We hold information sessions on a recurring basis for any interested vendors to attend, providing opportunities to ask questions, identify dependencies, and stay updated on project developments. Information sessions cover: Ask Questions - Get clarification on requirements, processes, and expectations. Identify Dependencies - Discuss technical and operational dependencies that need consideration. Project Updates - Stay informed about project progress, artifacts, and timeline changes.`,
  });

  return content;
};
