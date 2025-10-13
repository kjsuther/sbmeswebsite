import { DocumentChunk } from '../lib/chatbot-types';

interface ContentSection {
  title: string;
  content: string;
  page: string;
  section?: string;
}

export const extractWebsiteContent = (): ContentSection[] => {
  const sections: ContentSection[] = [];

  sections.push({
    title: 'Home - MES Modernization Overview',
    page: '/',
    content: `MES Modernization MES Bake Off Challenge. Join us in transforming Minnesota's Medicaid Enterprise Systems through innovative partnerships, strategic collaboration, and cutting-edge technology solutions. This is your opportunity to shape the future of government services delivery.

Transforming Government Services. Our MES Modernization Strategy represents an innovative approach to digital transformation in transformation-resistant environments. Through common vision, outcome orientation, clear focus, and innovative approaches, we're building the foundation for next-generation government services.

Strategic Vision: An innovative approach for transforming our Medicaid Enterprise ecosystem to achieve better outcomes for Minnesotans.

Collaborative Approach: Engaging with industry partners, stakeholders, and the community to ensure our modernization efforts meet real-world needs and expectations.

Innovation Focus: Leveraging cutting-edge technology and innovative approaches to create scalable, sustainable solutions for Minnesota's future.`
  });

  sections.push({
    title: 'MES Modernization Strategy',
    page: '/mes-modernization',
    content: `MES Modernization Strategy - A focused, coherent approach to transforming Minnesota's Medicaid Enterprise Systems (MES).

Strategic Framework includes three key components:

Challenges Diagnosis: An assessment of the root cause issues preventing successful MES modernizations.

Guiding Approach Tenets: Key operating commitments Minnesota has made to directly address the diagnosed challenges.

Coherent Action Plan: An actionable framework and approach for applying the guiding approach tenets to overcome the challenges.`
  });

  sections.push({
    title: 'Great Bake Off - Overview',
    page: '/great-bake-off',
    content: `The Great MES Modernization Bake-Off. An innovative challenge process that brings together software providers and implementation teams to create fully-baked solutions one slice at a time.

The Bake-Off Process: Our innovative approach breaks down complex system modernization into manageable, deliverable slices.`
  });

  sections.push({
    title: 'Great Bake Off - Step 0: Ongoing Information Sessions',
    page: '/great-bake-off',
    section: 'Information Sessions',
    content: `Step 0: Ongoing Information Sessions. We hold information sessions on a recurring basis for any interested vendors to attend, providing opportunities to ask questions, identify dependencies, and stay updated on project developments.

Information sessions help vendors:
- Ask Questions: Get clarification on requirements, processes, and expectations
- Identify Dependencies: Discuss technical and operational dependencies that need consideration
- Project Updates: Stay informed about project progress, artifacts, and timeline changes

Check out our Mural board for the schedule of upcoming information sessions and web conference information at: https://app.mural.co/t/minnesotamesmodernizationcan3670/m/minnesotamesmodernizationcan3670/1754081683082/fccc2005d83a2d11a12bea54bf6c2caa55b5fdbc`
  });

  sections.push({
    title: 'Great Bake Off - Step 1: Fill the Cupboards',
    page: '/great-bake-off',
    section: 'Fill the Cupboards',
    content: `Step 1: Fill the Cupboards. The MES Modernization strategy is focused on selecting enterprise-standard components that align with our future-state vision criteria.

Ingredients are made available for bakers to choose from:

Enterprise Standard Products: Software products already available for enterprise use within Minnesota's environment.

Master Contracts: Products available through master contracts or resellers.

Challenge RFP Submissions: Software products submitted as part of this challenge RFP process. RFP responses remain in consideration until implemented or withdrawn. Vendors can submit new RFP responses at any time.

Ingredients that are most likely to be selected meet these conditions:
- Incur minimal cost until a decision is made to scale in a production environment
- Can be rapidly provisioned to any baker and can be used effectively without help from the manufacturer
- Provide transparent, understandable monthly costs with clear attribution to benefiting diners, enabling straightforward cost sharing when needed`
  });

  sections.push({
    title: 'Great Bake Off - Step 2: Cake Proposals',
    page: '/great-bake-off',
    section: 'Cake Proposals',
    content: `Step 2: Cake Proposals. Bakers may choose any ingredients from the cupboard and propose full cake concepts, with an initial effort scoped as a slice(s) or layer(s) to be served during the bake-off.

Slice-Focused Delivery Process:
1. Choose a slice focus from the delivery backlog (or propose your own)
2. Propose a cake solution, identifying ingredients needed and any dependencies/support required
3. Describe your baker team and why they are best equipped to deliver the tastiest cake - submit 1-3 expert baker resumes
4. List how much it will cost:
   - The cost of delivering a first slice of cake meeting the definition of done criteria
   - The estimated cost of your proposed cake batter when at scale
   - The monthly cost of your baker team to deliver additional slices from the backlog

Layer-Focused Delivery Process:
1. Choose a layer capability from the enablement backlog (or propose your own)
2. Propose the definition of done for layer completion and Service Level Agreements (SLAs) the team will support after delivery
3. Describe your layer support team and why they are best equipped to standardize and maintain a layer of the cake - submit 1-3 layer support team member resumes
4. List how much it will cost:
   - The cost to achieve the definition of done submitted
   - The monthly cost to ensure continued support ongoing

Important Notes:
1. Services costs must be between $1 and $10M
2. The end date of any resulting contract will be 9/30/2026
3. Vendors may submit multiple teams for different slices and layers`
  });

  sections.push({
    title: 'Great Bake Off - Step 3: Evaluation and Selection',
    page: '/great-bake-off',
    section: 'Evaluation and Selection',
    content: `Step 3: Evaluation and Selection. Submitted Delivery RFP responses are evaluated monthly using established criteria.

Process Steps:
1. RFP submissions received each month by 3:00 PM on the 15th of that month will be dispositioned by the end of the month
2. The disposition will be one of: A) Selected, B) Rejected, or C) Postponed to Next Month's Evaluation. Vendors with postponed submissions can withdraw at any time
3. If selected, the individuals submitted in the response must be available to start work by the 10th of the following month. If the submitted individuals are not available, the selection will be revoked
4. Selected teams will be entered into the contract, which will be auto-generated based on the contract template and the response

Slice submissions will be prioritized ahead of layer submissions. A layer submission will only be selected if it is a clear dependency for all slice work and cannot reasonably be delivered by the slice team. By default, layer submissions will be deferred until there is a confirmed, shared need.

Slice Evaluation Criteria:
- Assessment of the team's ability to deliver - 30%
- Cost of the initial slice - 20%
- Monthly cost of ongoing slice delivery and support - 40%
- Estimated ingredient cost at scale - 10%

Layer Evaluation Criteria:
- Assessment of the Definition of Done and SLAs - 20%
- Assessment of the Layer support team's ability to deliver - 20%
- Cost to achieve the definition of done - 30%
- Monthly cost to maintain the defined SLAs - 30%

Important Notes:
1. DHS intends to select a mix of vendor types to foster innovation and new perspectives
2. Multiple vendor teams can be selected from the same vendor, which is the primary mechanism by which vendors can expect to scale their involvement
3. DHS must cap vendor team selections once the monthly and deliverable based services cost reaches $10M by 9/30/2026`
  });

  sections.push({
    title: 'Great Bake Off - Step 4: Bake a Cake and Serve a Slice',
    page: '/great-bake-off',
    section: 'Bake and Serve',
    content: `Step 4: Bake a Cake and Serve a Slice.

Slice Delivery: Selected slice teams deliver full cakes and serve the selected end-to-end slice, achieving outcomes in an integrated environment while adhering to published guidelines, standards, and compliance requirements.

Delivery Process:
- Slice teams are responsible for delivering a complete end-to-end solution for their assigned slice
- Teams must include all skills and expertise required to complete their slice
- Any anticipated layer dependencies must be identified by the slice team
- Unresolved or unexpected dependencies may pause delivery until the necessary support is in place
- Each delivery must meet the established definition of done criteria before it is accepted

Payment Structure for Slice Teams:
- Teams receive the amount proposed for the slice in scope when the definition of done is met
- Teams receive the monthly amount proposed based on the delivery of a monthly value report
- The state will continually evaluate value delivered

Layer Delivery: Layer delivery teams deliver and support the proposed capability.

Delivery Process:
- Layer teams are responsible for completing the definition of done
- Once complete, the team is responsible for meeting the defined SLAs

Payment Structure for Layer Teams:
- Teams receive the amount proposed for the delivery of the layer when the definition of done is met
- Teams receive the monthly amount proposed based on the delivery of a monthly value report, including the SLAs defined in the submission
- The state will continually evaluate value delivered`
  });

  sections.push({
    title: 'Great Bake Off - Step 5: Cake Inspection and Slice Tasting',
    page: '/great-bake-off',
    section: 'Inspection and Tasting',
    content: `Step 5: Cake Inspection and Slice Tasting. Cakes are inspected for alignment to the future-state vision criteria. Slices are evaluated to ensure Definition of Done completion and "tastiness" of the outcomes.

Key evaluation questions:
- Is the solution secure?
- Does it integrate well with our existing environment?
- Can our people support it?
- Can we make changes rapidly?
- Do our customers like the slice we've served to them so far?`
  });

  sections.push({
    title: 'Great Bake Off - Step 6: Solution Confidence Achieved',
    page: '/great-bake-off',
    section: 'Solution Confidence',
    content: `Step 6: Solution Confidence Achieved - Launch the Scaling Phase! The process continues until an enterprise standard solution emerges that meets future-state vision criteria and we're ready to transition to the scaling phase.

Success criteria:
- We have validated a complete solution through multiple successful slice deliveries, each demonstrating the ability to achieve targeted outcomes while aligning with future-state vision criteria`
  });

  sections.push({
    title: 'FAQs - Budget and Funding',
    page: '/faqs',
    section: 'Budget',
    content: `What is the budget of the project? There is no fixed or definitive budget figure for this modernization effort. However, for planning and funding request purposes, we are submitting an APD funding request that includes $10 million for vendor services (referred to as 'bakers' in our analogy) and $3 million for software products (our 'ingredients') to cover the first year of the innovation phase. We are also including funding to cover a dedicated internal support team to support the effort. We expect to assess true budgetary needs and either increase or decrease the amount based on the value being delivered for the money expended. Most modernization efforts of this scope spend between $500M and $1B. We hope to come in significantly less than what other states are spending.`
  });

  sections.push({
    title: 'FAQs - Timeline',
    page: '/faqs',
    section: 'Timeline',
    content: `What is the timeline for the modernization phases? The project timeline follows a slice-based delivery model, working from a backlog rather than a traditional linear approach. Each slice represents a specific user journey or capability and is prioritized based on value and feasibility. Vendors and stakeholders can refer to the timeline section of our website for up-to-date details about which slices are currently in focus and projected future milestones. This approach allows for agile adaptation as new insights emerge.`
  });

  sections.push({
    title: 'FAQs - Vendor Participation',
    page: '/faqs',
    section: 'Vendor Participation',
    content: `How will vendors be selected and involved in the project? Vendors will be engaged through an open and competitive process we call the 'bake-off.' Rather than submitting lengthy proposals, vendors are invited to demonstrate their value by delivering working solutions aligned with our future-state vision. We emphasize rapid iteration, real outcomes, and transparency. The best performing teams will have opportunities to scale their involvement.

Why should vendors be interested in participating? This is a rare opportunity to play a key role in a transformative government modernization effort. Vendors will have the freedom to innovate and tackle meaningful, high-impact challenges that directly benefit the community. Unlike traditional procurements that rely on rigid, pre-negotiated contracts to determine future work, this approach rewards real performance. The more value you deliver, the more opportunities you'll earn.`
  });

  sections.push({
    title: 'FAQs - Vendor Performance',
    page: '/faqs',
    section: 'Performance',
    content: `How will vendors be evaluated and managed? Evaluation is outcome-driven and tailored to the type of vendor:

For software products, success is defined by your product's effectiveness in improving our prioritized outcomes while meeting our future-state vision criteria. Material investments in software licensing will only be made once we've empirically confirmed the product is a fit for our environment and supports the improvement of program outcomes.

For services vendors, evaluation is based on the outcomes delivered by your team. Teams must be collaborative, responsive, and able to demonstrate value in short intervals. Performance will be reviewed regularly, and vendors producing the highest performing teams will have opportunities to scale additional teams.

What are the key success criteria for vendors? Success looks different depending on the vendor type:

For product vendors: You must deliver a product that best fits our future-state vision criteria and the submission requirements as outlined in the challenge RFP process.

For services vendors: We're looking for high-performing teams who deliver value fast. We anticipate success from teams that are cross-functional, communicate clearly, and work collaboratively with others to achieve shared outcomes. Most importantly, vendors must understand and be willing to work within the framework defined in our strategic approach.`
  });

  sections.push({
    title: 'FAQs - Support for Vendors',
    page: '/faqs',
    section: 'Support',
    content: `What support and resources are available for vendors? We offer extensive support to help new vendors onboard effectively:

- A dedicated references section on the website includes architectural guidance, future-state vision documents, and technical specifications.
- A support team is available to help navigate both programmatic and technical questions.

Note: We also track the level of support required by each vendor and factor it into performance evaluation.`
  });

  sections.push({
    title: 'FAQs - Innovation and Adaptability',
    page: '/faqs',
    section: 'Innovation',
    content: `What are the opportunities for innovation? Innovation is at the heart of this approach. During the innovation phase, vendors can:

- Submit novel product solutions or propose unique combinations of existing components.
- Rapidly build and demo solutions in a non-production environment.

Stakeholders will be able to interact with working prototypes, which breaks down traditional barriers and enables real-world testing of new ideas. Innovation is not just welcomed—it's expected.

If focusing only on a small slice, how do we avoid getting locked into a poor solution early on that doesn't accommodate future capability needs? The innovation phase mitigates early lock-in by tying evaluation to our future-state vision criteria. The first slice delivered by a vendor is just the beginning. Each new slice considered during the innovation phase provides an opportunity to evaluate the adaptability and extensibility of the solution. We don't exit the innovation phase until we have gained sufficient solution confidence across a full range of business complexity.`
  });

  sections.push({
    title: 'FAQs - Legislation and Context',
    page: '/faqs',
    section: 'Legislation',
    content: `How does the new bill affect this work? Recent legislation, including work requirements, can create urgency and opportunities—but also misconceptions. Our strategy does not rely solely on these mandates to drive modernization. Instead, we design flexible solutions that ensure compliance with new requirements even as we modernize in parallel.`
  });

  sections.push({
    title: 'MES Training - Introduction',
    page: '/mes-training',
    section: 'Module 1',
    content: `Module 1: Introduction and Overview. Learn the key differences between traditional MES modernizations and Minnesota's innovative approach.

Training Objectives:
- Describe the key differences between traditional MES modernizations and Minnesota's MES modernization strategy
- Express your excitement for trying something new
- Name the key elements of the MES modernization strategy
- Be able to engage with the remaining MES modernization strategy content published as part of the MES modernization RFI

This module includes RFI Introduction and RFI Summary training units.`
  });

  sections.push({
    title: 'MES Training - Challenges Diagnosis',
    page: '/mes-training',
    section: 'Module 2',
    content: `Module 2: Challenges Diagnosis. Understand the root cause issues preventing successful MES modernizations.

Training Objectives:
- List the five summary root-cause challenges highlighted by the strategic challenges diagnosis
- Identify the difference between a root-cause challenge and a symptomatic challenge
- List two failure modes identified by the strategy for delivering enterprise modernization initiatives
- Identify modernization and governance structures in place today that continue to amplify the identified challenges

This module covers IT Delivery Model Challenges, Current-State Environment Challenges, Modernization and Governance Challenges, and Enterprise Architecture Challenges.`
  });

  sections.push({
    title: 'MES Training - Guiding Approach Tenets',
    page: '/mes-training',
    section: 'Module 3',
    content: `Module 3: Guiding Approach Tenets. Learn the key operating commitments Minnesota has made to address diagnosed challenges.

Training Objectives:
- List and define the eight guiding approach tenets proposed as operational commitments in the MES modernization strategy
- Describe the key guiding tenet that differentiates the MES modernization strategy from other state modernization efforts
- Describe the phasing structure and cutover approach anticipated when applying the guiding approach tenets
- Apply the guiding approach tenets to solve a challenge

This module includes Guiding Approach Tenets Summary and Deliver with Purpose training units.`
  });

  sections.push({
    title: 'MES Training - Coherent Action Plan',
    page: '/mes-training',
    section: 'Module 4',
    content: `Module 4: Coherent Action Plan. Explore the actionable framework for applying the guiding approach tenets to address the diagnosed challenges.

Training Objectives:
- Describe the future-state vision for MES modernization
- Name the outcome focus areas identified as the first areas of focus for the MES modernization strategy
- List the first narrow set of business conditions identified to establish the central capabilities needed to support the Medicaid enterprise
- Look up the specific outcomes and measures targeted as part of the initial effort
- Describe the procurement "bake-off" approach proposed in the strategy for engaging and performance managing vendors during the innovation phase
- Describe the executive engagement and support that will be needed to define, protect, and insulate the cucumber water environment`
  });

  sections.push({
    title: 'Software RFP Requirements',
    page: '/software-rfp-requirements',
    content: `Software RFP Requirements for the MES Challenge. Software providers can submit products to be added to the MES Cupboard for consideration by implementation teams. Products should align with future-state vision criteria including being rapidly provisionable, having minimal upfront costs, and providing transparent pricing for cost sharing.`
  });

  sections.push({
    title: 'Delivery Services Requirements',
    page: '/delivery-services-requirements',
    content: `Delivery Services Requirements for slice and layer implementation teams. Teams can submit proposals for either slice-focused delivery (delivering end-to-end user journeys) or layer-focused delivery (building foundational capabilities). Submissions should include team qualifications, cost estimates, and approach details.`
  });

  return sections;
};

export const chunkText = (text: string, maxChunkSize: number = 800, overlap: number = 100): string[] => {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  let currentChunk: string[] = [];
  let currentSize = 0;

  for (const word of words) {
    const wordSize = word.length + 1;

    if (currentSize + wordSize > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
      const overlapWords = currentChunk.slice(-Math.floor(overlap / 10));
      currentChunk = overlapWords;
      currentSize = overlapWords.join(' ').length;
    }

    currentChunk.push(word);
    currentSize += wordSize;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
};

export const createDocumentChunks = (): DocumentChunk[] => {
  const sections = extractWebsiteContent();
  const chunks: DocumentChunk[] = [];

  sections.forEach(section => {
    const textChunks = chunkText(section.content);

    textChunks.forEach((chunk, index) => {
      chunks.push({
        content: chunk,
        metadata: {
          title: section.title,
        },
        source_page: section.page,
        source_section: section.section,
        document_name: `Website Content - ${section.title}`,
        chunk_index: index,
      });
    });
  });

  return chunks;
};
