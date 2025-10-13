export interface SoftwareProviderTestData {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productName: string;
  productDescription: string;
  trialCommitment: string;
  implementationModel: string;
  customImplementationDetails: string;
  licenseAgreementText: string;
  pricingModel: string;
  billingApproach: string;
  teamStructure: string;
  hasFedRAMP: boolean;
  otherCertifications: string;
  provisioningTimeline: string;
}

const companyNames = [
  'Acme Solutions',
  'TechVision Systems',
  'DataFlow Industries',
  'CloudScale Technologies',
  'Innovation Labs',
  'NextGen Software',
  'Enterprise Dynamics',
  'Digital Horizon',
  'Quantum Systems',
  'Velocity Tech'
];

const contactFirstNames = [
  'Sarah', 'Michael', 'Jennifer', 'David', 'Emily',
  'Robert', 'Jessica', 'James', 'Lisa', 'Christopher'
];

const contactLastNames = [
  'Johnson', 'Williams', 'Brown', 'Davis', 'Miller',
  'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'
];

const productNames = [
  'MES Cloud Platform',
  'Enterprise Workflow Suite',
  'DataStream Manager',
  'Integration Hub Pro',
  'Compliance Tracker',
  'Process Automation Engine',
  'Digital Transformation Suite',
  'Smart Operations Platform',
  'Analytics Dashboard Pro',
  'Unified Management System'
];

const implementationOptions = [
  'Any integration vendor can implement',
  'Specific partner list (provide details below)',
  'Our team only (exclusive implementation)'
];

const provisioningTimelines = [
  'Immediate',
  '24 hours',
  '2-3 business days',
  '3-5 business days',
  '1 week',
  '2 weeks'
];

const certifications = [
  'SOC 2 Type II',
  'ISO 27001',
  'NIST 800-53',
  'HIPAA',
  'PCI DSS',
  'StateRAMP'
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function generatePhoneNumber(): string {
  const areaCode = randomNumber(200, 999);
  const prefix = randomNumber(200, 999);
  const lineNumber = randomNumber(1000, 9999);
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

function generateProductDescription(): string {
  const features = [
    'real-time data synchronization',
    'advanced analytics and reporting',
    'seamless API integration',
    'role-based access control',
    'automated workflow management',
    'compliance tracking and audit trails',
    'cloud-native architecture',
    'microservices-based design',
    'scalable infrastructure',
    'enterprise-grade security'
  ];

  const benefits = [
    'streamlines operations',
    'reduces manual processes',
    'improves data accuracy',
    'enhances decision-making',
    'accelerates digital transformation',
    'ensures regulatory compliance',
    'optimizes resource allocation',
    'increases operational efficiency'
  ];

  const selectedFeatures = [randomElement(features), randomElement(features), randomElement(features)];
  const selectedBenefit = randomElement(benefits);

  return `Our comprehensive MES solution provides ${selectedFeatures[0]}, ${selectedFeatures[1]}, and ${selectedFeatures[2]}. The platform is designed specifically for modernizing legacy systems and ${selectedBenefit}.\n\nBuilt on modern cloud infrastructure, our solution integrates seamlessly with existing systems while providing the flexibility needed for future enhancements. The system supports multiple deployment models and can be configured to meet specific state and federal compliance requirements.\n\nKey capabilities include comprehensive data management, automated processing workflows, and advanced reporting tools that provide real-time visibility into operations and performance metrics.`;
}

function generateTrialCommitment(): string {
  const duration = randomNumber(30, 180);
  const supportHours = randomElement(['8x5', '12x5', '24x7']);

  return `We are fully committed to providing trial and limited-use licensing for the MES Modernization Challenge innovation phase. Our trial commitment includes:\n\n1. Trial Period: ${duration}-day full-featured trial license with no functional limitations\n\n2. Support Coverage: ${supportHours} technical support during the trial period, including dedicated support engineer assignment and priority response times\n\n3. Training and Onboarding: Comprehensive onboarding sessions, user training materials, and access to our documentation portal\n\n4. Environment Setup: Assistance with environment configuration, data migration support, and integration guidance\n\n5. Regular Check-ins: Weekly progress reviews and quarterly business reviews to ensure successful evaluation and address any concerns\n\nOur team will provide continuous support throughout the innovation phase to ensure your team can fully evaluate our solution's capabilities and fit for the modernization initiative.`;
}

function generateCustomImplementationDetails(): string {
  const partnerCount = randomNumber(3, 8);

  return `Our certified implementation partner network includes ${partnerCount} qualified organizations with deep expertise in government MES implementations.\n\nPartner Requirements:\n- Minimum 5 years experience with Medicaid systems\n- Certified technicians with platform-specific training\n- Active government security clearances\n- Proven track record of successful implementations\n\nCurrent certified partners include regional system integrators and specialized government technology consultants. All partners maintain up-to-date certifications and undergo annual recertification to ensure quality standards.\n\nWe provide comprehensive partner enablement including technical training, implementation playbooks, and ongoing support to ensure consistent, high-quality implementations across all partner engagements.`;
}

function generateLicenseAgreement(): string {
  const userTier = randomNumber(50, 500);

  return `Standard Software License Agreement with the following key terms:\n\n- License Type: Subscription-based SaaS model\n- User Tiers: Starting at ${userTier} concurrent users with scalable pricing\n- Term: Annual subscription with monthly payment options\n- Support: Included standard support (${randomElement(['8x5', '12x5', '24x7'])} coverage)\n- Updates: Automatic updates and security patches included\n- Data Ownership: Customer retains full ownership of all data\n- Termination: 90-day notice period with data export assistance\n- Liability: Standard limitation of liability provisions\n- Compliance: Meets federal and state regulatory requirements\n- Service Level Agreement: 99.9% uptime guarantee with credits for non-compliance`;
}

function generatePricingModel(): string {
  const basePrice = randomNumber(5000, 25000);
  const perUserPrice = randomNumber(50, 200);

  return `Our pricing model is designed for transparency and scalability:\n\nBase Platform License: $${basePrice.toLocaleString()}/month\n- Includes core MES functionality, infrastructure, and standard support\n- Covers up to 100 concurrent users\n\nPer-User Pricing (above 100 users): $${perUserPrice}/user/month\n- Linear scaling with volume discounts at 500+ and 1,000+ user tiers\n- Separate pricing for administrative vs. standard users\n\nCost Separation Methodology:\n- Software License: ${randomNumber(60, 75)}% of total cost\n- Infrastructure/Hosting: ${randomNumber(15, 25)}% of total cost\n- Support Services: ${randomNumber(10, 15)}% of total cost\n\nAll pricing includes standard maintenance, updates, and security patches. Optional add-ons for premium support, advanced analytics, and custom integrations available separately.`;
}

function generateBillingApproach(): string {
  return `We offer flexible monthly billing to align with government procurement preferences:\n\nBilling Frequency: Monthly invoicing with net-30 payment terms\n\nPayment Options:\n- Direct monthly billing via invoice\n- ACH/wire transfer accepted\n- Government purchase cards (P-cards) accepted\n- Integration with state procurement systems available\n\nBilling Transparency:\n- Itemized monthly statements showing license, usage, and support costs\n- Detailed usage metrics and cost allocation reports\n- No hidden fees or surprise charges\n- Annual true-up process for user count adjustments\n\nFlexibility:\n- Month-to-month with annual commitment\n- Quarterly payment option available\n- Ability to adjust user counts with 30-day notice\n- Seasonal usage patterns accommodated\n\nOur billing system integrates with standard government accounting systems and provides detailed cost tracking for budget management and reporting purposes.`;
}

function generateTeamStructure(): string {
  const devs = randomNumber(2, 4);
  const support = randomNumber(1, 3);

  return `The minimum team structure required to support a single slice implementation includes:\n\nTechnical Team:\n- ${devs} Full-Stack Developers: Application development, customization, and integration work\n- ${support} DevOps Engineer(s): Infrastructure management, deployment, and monitoring\n- 1 QA Engineer: Testing, quality assurance, and validation\n\nSupport Team:\n- 1 Technical Support Specialist: End-user support and issue resolution\n- 1 Implementation Consultant (part-time): Configuration guidance and best practices\n\nManagement:\n- 1 Project Manager (part-time): Coordination, status reporting, and stakeholder communication\n\nSkill Sets Required:\n- Modern web application development (React, Node.js, cloud platforms)\n- Database management and optimization\n- API integration and web services\n- Government systems and compliance knowledge\n- Agile development methodologies\n\nThis team composition ensures adequate coverage for development, support, and ongoing maintenance while maintaining cost efficiency. Team members are cross-trained to provide backup coverage and flexibility as needs evolve throughout the implementation.`;
}

function generateCertifications(): string {
  const certList = [randomElement(certifications), randomElement(certifications), randomElement(certifications)];
  const uniqueCerts = [...new Set(certList)];

  return `Our comprehensive security and compliance certifications include:\n\nCertifications:\n${uniqueCerts.map(cert => `- ${cert} certified`).join('\n')}\n- Ongoing security audits conducted annually\n- Penetration testing performed quarterly\n\nSecurity Measures:\n- End-to-end encryption for data in transit and at rest\n- Multi-factor authentication (MFA) enforced\n- Role-based access control (RBAC) with granular permissions\n- Comprehensive audit logging and monitoring\n- Regular vulnerability scanning and patching\n- Incident response plan with 24/7 security operations center\n\nCompliance Documentation:\n- Complete compliance documentation package available\n- System Security Plan (SSP) maintained and updated\n- Privacy Impact Assessment (PIA) completed\n- Security assessment reports available upon request\n\nWe maintain strict adherence to federal and state security requirements and undergo regular third-party assessments to validate our security posture.`;
}

export function generateSoftwareProviderTestData(): SoftwareProviderTestData {
  const uniqueId = generateUniqueId();
  const firstName = randomElement(contactFirstNames);
  const lastName = randomElement(contactLastNames);
  const company = randomElement(companyNames);
  const product = randomElement(productNames);
  const implementationModel = randomElement(implementationOptions);

  return {
    companyName: `${company} (TEST)`,
    contactName: `${firstName} ${lastName} (TEST)`,
    contactEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.test.${uniqueId}@example.com`,
    contactPhone: generatePhoneNumber(),
    productName: `${product} (TEST)`,
    productDescription: generateProductDescription(),
    trialCommitment: generateTrialCommitment(),
    implementationModel: implementationModel,
    customImplementationDetails: implementationModel === 'Specific partner list (provide details below)'
      ? generateCustomImplementationDetails()
      : '',
    licenseAgreementText: generateLicenseAgreement(),
    pricingModel: generatePricingModel(),
    billingApproach: generateBillingApproach(),
    teamStructure: generateTeamStructure(),
    hasFedRAMP: Math.random() > 0.5,
    otherCertifications: generateCertifications(),
    provisioningTimeline: randomElement(provisioningTimelines)
  };
}

// Slice RFP Test Data

export interface SliceRFPTestData {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  sliceFocus: string;
  customSliceFocus: string;
  cakeSolution: string;
  ingredientsNeeded: string;
  dependencies: string;
  teamDescription: string;
  firstSliceCost: string;
  cakeBatterScaleCost: string;
  monthlyTeamCost: string;
}

const sliceFocusOptions = [
  '1A - New applicant (ineligible for MA, but eligible for MSP)',
  '1B - Household Change',
  '1C - Reduce Income',
  '1D - Annual Redetermination (Version 1 - Auto Renew)',
  '1E - Annual Redetermination (Version 2 - Manual Review Required)',
  '1F - New Enrollment',
  '1G - Asset reduction increases coverage and authorized rep',
  '1H - Household Change and Spend-Down Transition',
  '1I - Asset change for household',
  '1J - Pregnancy',
  '1K - Give birth',
  '1L - Additional pregnancy',
  '1M - Remove child from the home',
  '1N - Foster Care',
  '1O - Adoption',
  '1P - Annual Reviews for automatically eligible cases',
  '2A - New Disability Application with Spenddown',
  '3A - New application for LTC Facility',
  '4A - Children with a MA basis due to disability turning 18',
  '5A - Tribal enrollment',
  '5B - Tribal and limited internet access enrollment',
  '6A - Multiple PMI – Newborn (also on a food support case)',
  '6B - Multiple PMI – Same person applies with alternative demographic details',
  '7A - MA-EPD New Application',
  '7B - MA-EPD – Income decrease due to job loss',
  '7C - MA-EPD – Income Increase due to marriage',
  '8A - Work Requirements ("Community Engagement") – New Enrollment',
  '8B - Work Requirements ("Community Engagement") – 6 Month renewal',
  '8C - Work Requirements ("Community Engagement") – No longer meeting work requirements',
  '8D - Work Requirements ("Community Engagement") – New enrollment with employment'
];

function generateSliceSolution(): string {
  const approaches = [
    'microservices architecture with containerized deployment',
    'serverless functions with event-driven processing',
    'API-first design with GraphQL interfaces',
    'cloud-native solution with auto-scaling capabilities'
  ];

  return `Our solution for this slice leverages ${randomElement(approaches)} to deliver a modern, scalable implementation.\n\nKey Components:\n- React-based frontend with responsive design\n- RESTful APIs for all data operations\n- Real-time notification system\n- Comprehensive audit logging\n- Role-based access control\n\nThe architecture is designed to integrate seamlessly with existing MES components while providing the flexibility needed for future enhancements. We utilize industry-standard protocols and modern development practices to ensure maintainability and scalability.\n\nOur approach emphasizes incremental delivery, allowing for early validation and feedback throughout the implementation process.`;
}

function generateIngredientsNeeded(): string {
  const ingredients = [
    'Access to existing member database (read-only)',
    'Authentication service endpoints and documentation',
    'Data schema documentation for relevant entities',
    'Test environment with representative data',
    'API keys for required third-party services',
    'Style guide and branding assets',
    'Existing workflow documentation',
    'Security and compliance requirements document'
  ];

  const selectedIngredients = [
    randomElement(ingredients),
    randomElement(ingredients),
    randomElement(ingredients),
    randomElement(ingredients)
  ].filter((item, index, self) => self.indexOf(item) === index);

  return `To successfully deliver this slice, we require the following from the state:\n\n${selectedIngredients.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n\nAdditional Requirements:\n- Dedicated point of contact for technical questions\n- Access to staging environment for integration testing\n- Weekly status meeting with state technical team\n- Documentation of existing business rules and workflows\n\nWe will work closely with the state team to ensure smooth coordination and timely access to required resources.`;
}

function generateDependencies(): string {
  return `Our slice implementation has the following dependencies:\n\nTechnical Dependencies:\n- Authentication service must be operational for user login\n- Database access layer must be available for data operations\n- Message queue service for asynchronous processing\n- File storage service for document management\n\nProcess Dependencies:\n- Approval of UI/UX designs before implementation begins\n- Sign-off on API specifications and data models\n- Completion of security review for production deployment\n- User acceptance testing completion\n\nExternal Dependencies:\n- Third-party API availability (if applicable)\n- Network connectivity and firewall rules configuration\n- SSL certificate provisioning for secure communications\n\nWe will provide a detailed dependency matrix and work with other teams to ensure all prerequisites are met according to the project timeline. Our team will proactively identify and escalate any blocking dependencies to maintain schedule adherence.`;
}

function generateSliceTeamDescription(): string {
  return `Our slice delivery team consists of experienced professionals with deep expertise in Medicaid systems:\n\nCore Team:\n- 1 Technical Lead (10+ years healthcare IT experience)\n- 2 Senior Full-Stack Developers (React, Node.js, cloud platforms)\n- 1 UI/UX Designer (specializing in government applications)\n- 1 QA Engineer (automation and manual testing expertise)\n- 1 DevOps Engineer (CI/CD, cloud infrastructure)\n\nSupport Team:\n- 1 Project Manager (Agile/Scrum certified)\n- 1 Business Analyst (part-time, Medicaid domain expertise)\n- 1 Technical Writer (documentation specialist)\n\nTeam Qualifications:\n- Combined 50+ years of Medicaid system experience\n- Prior implementations with 3+ state Medicaid agencies\n- Active security clearances for team members\n- Cross-trained for flexibility and coverage\n\nAll team members are US-based and available for collaboration during standard business hours across multiple time zones.`;
}

export function generateSliceRFPTestData(): SliceRFPTestData {
  const uniqueId = generateUniqueId();
  const firstName = randomElement(contactFirstNames);
  const lastName = randomElement(contactLastNames);
  const company = randomElement(companyNames);
  const sliceFocus = randomElement(sliceFocusOptions);

  return {
    companyName: `${company} (TEST)`,
    contactName: `${firstName} ${lastName} (TEST)`,
    contactEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.test.${uniqueId}@example.com`,
    contactPhone: generatePhoneNumber(),
    sliceFocus: sliceFocus,
    customSliceFocus: '',
    cakeSolution: generateSliceSolution(),
    ingredientsNeeded: generateIngredientsNeeded(),
    dependencies: generateDependencies(),
    teamDescription: generateSliceTeamDescription(),
    firstSliceCost: `$${(randomNumber(150, 400) * 1000).toLocaleString()}`,
    cakeBatterScaleCost: `$${(randomNumber(50, 150) * 1000).toLocaleString()}`,
    monthlyTeamCost: `$${(randomNumber(40, 100) * 1000).toLocaleString()}`
  };
}

// Layer RFP Test Data

export interface LayerRFPTestData {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  layerCapability: string;
  customLayerCapability: string;
  definitionOfDone: string;
  slaCommitments: string;
  teamDescription: string;
  definitionOfDoneCost: string;
  monthlySupportCost: string;
}

const layerCapabilityOptions = [
  'Identity & Access Management (IAM)',
  'API Gateway & Rate Limiting',
  'Data Validation & Transformation',
  'Audit Logging & Compliance',
  'Notification & Alerting',
  'Document Management & Storage'
];

function generateDefinitionOfDone(): string {
  return `Our Definition of Done for this layer capability includes comprehensive deliverables:\n\nTechnical Deliverables:\n- Fully functional service deployed to production environment\n- Complete API documentation with examples and use cases\n- Automated test suite with >90% code coverage\n- Infrastructure-as-code templates for deployment\n- Monitoring and alerting configuration\n- Performance benchmarking results\n\nDocumentation:\n- Technical architecture documentation\n- API reference guide with interactive examples\n- Operations runbook for troubleshooting\n- Security assessment and compliance documentation\n- Integration guide for consuming applications\n- Disaster recovery procedures\n\nQuality Gates:\n- All acceptance criteria met and verified\n- Security scan completed with no critical vulnerabilities\n- Performance requirements validated under load\n- User acceptance testing completed successfully\n- Code review completed by independent reviewer\n- Production deployment checklist completed\n\nKnowledge Transfer:\n- Training sessions for state technical team\n- Hands-on workshop for operations staff\n- Q&A sessions and documentation walkthrough\n\nAll deliverables will be provided in formats specified by the state and stored in designated repositories.`;
}

function generateSLACommitments(): string {
  const uptime = randomElement(['99.9%', '99.95%', '99.99%']);
  const responseTime = randomElement(['< 500ms', '< 200ms', '< 100ms']);

  return `We commit to the following Service Level Agreements:\n\nAvailability:\n- Uptime: ${uptime} measured monthly\n- Planned maintenance windows: < 4 hours/month\n- Advance notice: 5 business days for planned maintenance\n\nPerformance:\n- API response time: ${responseTime} for 95th percentile\n- Throughput: Support 1000+ requests per second\n- Data processing latency: < 5 seconds end-to-end\n\nSupport Response Times:\n- Critical (P1): 15-minute response, 2-hour resolution target\n- High (P2): 1-hour response, 4-hour resolution target\n- Medium (P3): 4-hour response, 24-hour resolution target\n- Low (P4): 8-hour response, 72-hour resolution target\n\nIncident Management:\n- 24/7 on-call support for critical issues\n- Root cause analysis within 48 hours of resolution\n- Monthly service review meetings\n- Quarterly disaster recovery drills\n\nRemediation:\n- SLA credits for unmet commitments\n- Transparent reporting of all incidents\n- Continuous improvement process\n\nAll SLAs are backed by detailed monitoring and reporting, with monthly service reports provided to stakeholders.`;
}

function generateLayerTeamDescription(): string {
  return `Our layer support team provides ongoing maintenance and enhancement:\n\nCore Support Team:\n- 1 Layer Technical Lead (senior architect level)\n- 2 Platform Engineers (infrastructure and services expertise)\n- 1 Security Engineer (part-time, security and compliance focus)\n- 1 DevOps Engineer (CI/CD and automation)\n\nOn-Call Coverage:\n- 24/7 on-call rotation for critical issues\n- Escalation path to senior architects\n- Average response time < 15 minutes for P1 incidents\n\nEnhancement Team:\n- 1 Product Owner (prioritization and roadmap)\n- Development resources allocated based on enhancement backlog\n- Quarterly planning for capability improvements\n\nTeam Expertise:\n- Cloud platform certifications (AWS/Azure/GCP)\n- Security certifications (CISSP, Security+)\n- 15+ years combined experience in government systems\n- Prior experience supporting mission-critical services\n\nSupport Model:\n- Proactive monitoring and issue detection\n- Regular health checks and optimization reviews\n- Continuous security patching and updates\n- Performance tuning and capacity planning\n\nThe team follows ITIL best practices for service management and maintains detailed runbooks for all operational procedures.`;
}

export function generateLayerRFPTestData(): LayerRFPTestData {
  const uniqueId = generateUniqueId();
  const firstName = randomElement(contactFirstNames);
  const lastName = randomElement(contactLastNames);
  const company = randomElement(companyNames);
  const layerCapability = randomElement(layerCapabilityOptions);

  return {
    companyName: `${company} (TEST)`,
    contactName: `${firstName} ${lastName} (TEST)`,
    contactEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.test.${uniqueId}@example.com`,
    contactPhone: generatePhoneNumber(),
    layerCapability: layerCapability,
    customLayerCapability: '',
    definitionOfDone: generateDefinitionOfDone(),
    slaCommitments: generateSLACommitments(),
    teamDescription: generateLayerTeamDescription(),
    definitionOfDoneCost: `$${(randomNumber(100, 300) * 1000).toLocaleString()}`,
    monthlySupportCost: `$${(randomNumber(15, 50) * 1000).toLocaleString()}`
  };
}
