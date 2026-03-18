import { FORM_GROUP_LABELS, PROFESSIONAL_REFERENCE, SOURCE_SETS } from "./config.js";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makePage({
  key,
  title,
  route,
  family,
  pageType,
  sectionStyle,
  formGroup,
  topics,
  heroTheme,
  summary,
  officialSourceSet,
  noindex = false,
  includeTestimonials = false,
  utility = false
}) {
  return {
    key,
    title,
    route,
    family,
    pageType,
    sectionStyle,
    formGroup,
    formGroupLabel: FORM_GROUP_LABELS[formGroup] || "",
    topics,
    heroTheme,
    summary,
    officialSourceSet,
    noindex,
    includeTestimonials,
    utility
  };
}

const aboutPages = [
  ["profile", "Profile", "Professional Identification; Areas of Practice; Immigration Focus; Types of Legal Matters; Jurisdiction and Scope; Languages of Service"],
  ["about", "About", "Institutional Overview; Purpose; Scope of Services; Structure of Information; Target Audience; Operational Context"],
  ["mission", "Mission", "Defined Purpose; Role in Immigration Context; Approach to Service Delivery; Legal Boundaries of Activity; Relationship to Applicable Law"],
  ["philosophy", "Philosophy", "Approach to Legal Interpretation; Perspective on Immigration Procedures; Method of Case Handling; Position on Documentation; View on Compliance"],
  ["story", "Story", "Origin of the Practice; Development Timeline; Expansion of Services; Evolution of Focus; Current Structure"],
  ["values", "Values", "Legal Integrity; Accuracy in Documentation; Procedural Consistency; Transparency in Communication; Confidentiality; Regulatory Compliance"],
  ["lawyer", "Lawyer", "Full Identification; Academic Background; Professional Qualifications; Areas of Practice; Immigration Experience; Languages"],
  ["whyus", "Why Us", "Structural Approach to Cases; Organization of Procedures; Documentation Methodology; Communication Structure; Compliance Orientation; Scope Limitations"],
  ["results", "Results", "Nature of Administrative Outcomes; Factors Affecting Decisions; Variability of Processes; Case Dependency; Limitations of Predictability"],
  ["stories", "Stories", "General Case Scenarios; Immigration Pathway Examples; Procedural Descriptions; Common Situations Observed; Informational Context"],
  ["clients", "Clients", "Client Categories; Individuals; Families; Companies; Geographic Scope; Typical Needs"],
  ["testimonials", "Testimonials", "Nature of Statements; Context of Feedback; Format of Presentation; Representational Limitations; Neutrality Clarification"],
  ["governance", "Governance", "Organizational Structure; Roles and Responsibilities; Decision-Making Process; Oversight Mechanisms; Administrative Coordination"],
  ["compliance", "Compliance", "Legal Compliance Framework; Immigration Law Alignment; OAB Compliance; Data Protection (LGPD); Documentation Control"],
  ["ethics", "Ethics", "Ethical Principles; Professional Conduct; Confidentiality Obligations; Conflict of Interest Handling; Client Relationship Boundaries"],
  ["standards", "Standards", "Documentation Standards; Internal Procedures; Quality Control Measures; Review Processes; Consistency Framework"],
  ["regulatory", "Regulatory", "Applicable Laws; Immigration Regulations; Competent Authorities; OAB Framework; Administrative Rules; Legal Limitations"]
].map(([slug, title, topicString]) =>
  makePage({
    key: `about-${slug}`,
    title,
    route: `/about/${slug}/`,
    family: "about",
    pageType: "about",
    sectionStyle: slug === "lawyer" ? "lawyer" : "about",
    formGroup: "xaqpaodd",
    topics: topicString.split("; ").map((value) => value.trim()),
    heroTheme: `Brazil legal practice ${title.toLowerCase()} landscape`,
    summary:
      slug === "lawyer"
        ? "Public professional profile of the named attorney reference used on this site."
        : `Contextual overview of ${title.toLowerCase()} within the Immigrate to Brazil platform.`,
    officialSourceSet: SOURCE_SETS.about,
    includeTestimonials: slug === "testimonials"
  })
);

const brazilPages = [
  ["brazil", "Brazil", "Geographic Overview; Legal Environment; Institutional Framework; Migration Context; Economic Position; International Relations; Demographic Profile; Infrastructure Overview; Regional Diversity; Administrative Structure", "mqeywqdy", "brazil"],
  ["investment", "Investment", "Foreign Investment Framework; Legal Structures for Investment; Regulatory Requirements; Entry of Foreign Capital; Corporate Structures in Brazil; Tax Considerations (general); Sector Distribution; Licensing and Authorizations; Compliance Obligations; Reporting Requirements", "mqeywqdy", "brazil"],
  ["economy", "Economy", "Economic Structure; Key Sectors; Monetary System; Inflation and Currency Context; Trade Environment; Export and Import Structure; Labor Market Overview; Public Finance Context; Institutional Bodies; Economic Indicators", "mqeywqdy", "brazil"],
  ["quality", "Quality", "Quality of Life Indicators; Public Infrastructure; Access to Services; Environmental Conditions; Urban versus Rural Differences; Social Development Indicators; Regional Disparities; Mobility and Transport; Public Utilities; Living Standards Context", "mqeywqdy", "brazilLiving"],
  ["living", "Living", "Daily Life Structure; Legal Residency Context; Administrative Requirements; Access to Services; Transportation Systems; Communication and Connectivity; Cultural Adaptation; Language Environment; Urban versus Regional Living; Integration Considerations", "mqeywqdy", "brazilLiving"],
  ["cost", "Cost", "Cost Structure Overview; Housing Costs; Food and Daily Expenses; Utilities and Services; Transportation Costs; Regional Cost Variation; Currency and Exchange Impact; Inflation Considerations; Lifestyle Variables; Budget Planning Context", "mqeywqdy", "brazilLiving"],
  ["housing", "Housing", "Property Types; Rental Framework; Lease Agreements; Purchase Regulations; Foreign Ownership Rules; Documentation Requirements; Financing Possibilities; Urban versus Regional Availability; Market Variations; Legal Considerations", "mqeywqdy", "brazilLiving"],
  ["healthcare", "Healthcare", "Public System (SUS); Private Healthcare; Access Requirements; Health Insurance Structures; Emergency Services; Regional Availability; Quality Variations; Administrative Procedures; Cost Considerations; Regulatory Oversight", "mqeywqdy", "brazilLiving"],
  ["education", "Education", "Education System Structure; Public versus Private Education; Primary and Secondary Education; Higher Education; Enrollment Requirements; Language Requirements; Accreditation and Recognition; International Students; Costs and Funding; Regulatory Framework", "mqeywqdy", "brazilLiving"],
  ["safety", "Safety", "Public Safety Framework; Law Enforcement Structure; Crime Data Context (general); Regional Differences; Urban versus Rural Safety; Preventive Measures; Emergency Services; Legal Protections; Institutional Responsibilities; Risk Awareness", "mqeywqdy", "brazilLiving"],
  ["north", "North", "Regional Overview; States Composition; Geographic Characteristics; Climate Profile; Economic Activities; Infrastructure Development; Urban Centers; Demographic Profile; Cultural Characteristics; Development Indicators", "myknlwdl", "brazil"],
  ["northeast", "Northeast", "Regional Overview; States Composition; Geographic Characteristics; Climate Profile; Economic Activities; Infrastructure Development; Urban Centers; Demographic Profile; Cultural Characteristics; Development Indicators", "myknlwdl", "brazil"],
  ["central-west", "Central-West", "Regional Overview; States Composition; Geographic Characteristics; Climate Profile; Economic Activities; Infrastructure Development; Urban Centers; Demographic Profile; Cultural Characteristics; Development Indicators", "myknlwdl", "brazil"],
  ["southeast", "Southeast", "Regional Overview; States Composition; Geographic Characteristics; Climate Profile; Economic Activities; Infrastructure Development; Urban Centers; Demographic Profile; Cultural Characteristics; Development Indicators", "myknlwdl", "brazil"],
  ["south", "South", "Regional Overview; States Composition; Geographic Characteristics; Climate Profile; Economic Activities; Infrastructure Development; Urban Centers; Demographic Profile; Cultural Characteristics; Development Indicators", "myknlwdl", "brazil"],
  ["states", "States", "Federal Structure; State-Level Governance; Legal Competencies; Economic Distribution; Population Distribution; Regional Roles; Infrastructure Differences; Administrative Autonomy; Public Services; Fiscal Context", "myknlwdl", "brazil"],
  ["cities", "Cities", "Urban Organization; Municipal Governance; Infrastructure Systems; Population Density; Economic Activities; Public Services; Transportation; Housing Context; Regional Differences; Administrative Structure", "myknlwdl", "brazil"],
  ["directory", "Directory", "Purpose of Directory; Categorization Criteria; Sector Classification; Geographic Organization; Data Sources; Inclusion Criteria; Navigation Structure; Update Methodology; User Interaction; Limitations", "myknlwdl", "brazil"],
  ["municipalities", "Municipalities", "Municipal Structure; Governance Model; Administrative Responsibilities; Local Legislation; Public Services; Revenue Sources; Territorial Organization; Population Distribution; Infrastructure; Intergovernmental Relations", "myknlwdl", "brazil"],
  ["search", "Search", "Search Function Purpose; Data Indexing; Filtering Options; Categorization Logic; Geographic Filters; Keyword Structure; Result Presentation; Navigation Flow; User Interaction; System Limitations", "myknlwdl", "brazil"],
  ["culture", "Culture", "Cultural Diversity; Historical Influences; Regional Variations; Language Context; Social Practices; Arts and Expression; Institutional Support; Cultural Policies; Public Participation; International Influence", "myknlwdl", "brazil"],
  ["festivals", "Festivals", "Types of Festivals; Cultural Significance; Regional Distribution; Seasonal Calendar; Public versus Private Events; Participation Structure; Economic Impact; Regulatory Aspects; Tourism Context; Organization", "myknlwdl", "brazil"],
  ["cuisine", "Cuisine", "Regional Food Traditions; Ingredients and Products; Preparation Methods; Cultural Influences; Dining Practices; Regional Variations; Market Availability; Agricultural Context; Food Industry; Consumption Patterns", "myknlwdl", "brazil"],
  ["events", "Events", "Event Categories; Cultural Events; Business and Professional Events; Public versus Private; Regional Distribution; Scheduling Patterns; Participation Requirements; Organizational Structure; Regulatory Aspects; Economic Impact", "myknlwdl", "brazil"],
  ["guides", "Guides", "Purpose of Guides; Topic Organization; Information Structure; Navigation Logic; Practical Orientation; Reference Materials; Target Audience; Update Frequency; Content Limitations; Usage Context", "myknlwdl", "brazil"],
  ["faqs", "Faqs", "General relocation questions; Immigration context questions; Brazil-living questions; Service-boundary questions; Compliance questions", "myknlwdl", "brazil"]
].map(([slug, title, topicString, formGroup, sourceSetKey]) =>
  makePage({
    key: `brazil-${slug}`,
    title,
    route: `/brazil/${slug}/`,
    family: "brazil",
    pageType: "brazil",
    sectionStyle: slug === "search" ? "brazil-search" : "brazil",
    formGroup,
    topics: topicString.split("; ").map((value) => value.trim()),
    heroTheme: `Brazil ${title.toLowerCase()} cinematic landscape`,
    summary: `Informational context on ${title.toLowerCase()} in Brazil for relocation, compliance, and practical planning.`,
    officialSourceSet: SOURCE_SETS[sourceSetKey]
  })
);

const processPages = [
  ["consultation", "Consultation", "Purpose of Initial Consultation; Scope of Discussion; Information Provided by Client; Preliminary Legal Context; Limitations of Initial Analysis; Next Steps After Consultation", "mzdjyrao"],
  ["assessment", "Assessment", "Case Evaluation Criteria; Review of Documents; Identification of Legal Options; Eligibility Considerations; Risk Identification; Outcome Variability", "mzdjyrao"],
  ["strategy", "Strategy", "Definition of Legal Approach; Selection of Immigration Pathway; Structuring of Application; Documentation Planning; Risk Mitigation Measures; Adjustment Based on Case Specifics", "mzdjyrao"],
  ["filing", "Filing", "Preparation of Documentation; Review and Verification; Submission Procedures; Competent Authorities; Formal Requirements; Confirmation of Submission", "mzdjyrao"],
  ["approval", "Approval", "Administrative Decision Process; Possible Outcomes; Conditions of Approval; Post-Approval Requirements; Registration Obligations; Legal Effects of Approval", "mzdjyrao"],
  ["mistakes", "Mistakes", "Common Application Errors; Documentation Issues; Incorrect Visa or Residency Selection; Procedural Missteps; Misinterpretation of Requirements; Impact on Applications", "meervgld"],
  ["failures", "Failures", "Reasons for Denial; Incomplete or Incorrect Submissions; Legal Ineligibility; Administrative Rejection; Consequences of Refusal; Possibility of Reapplication", "meervgld"],
  ["deadlines", "Deadlines", "Legal Time Limits; Administrative Deadlines; Filing Windows; Renewal Deadlines; Consequences of Missing Deadlines; Monitoring Responsibilities", "meervgld"],
  ["obligations", "Obligations", "Legal Duties of the Applicant; Documentation Requirements; Reporting Obligations; Compliance with Visa Conditions; Updates to Authorities; Consequences of Non-Compliance", "meervgld"],
  ["alone", "Alone", "Self-Representation Possibility; Responsibilities Without Legal Assistance; Risks of Independent Filing; Procedural Complexity; Common Difficulties; Legal Implications", "meervgld"],
  ["transparency", "Transparency", "Scope of Information Provided; Communication Structure; Case Updates; Limitations of Predictability; Documentation Clarity; Client Access to Information", "xojkydnz"],
  ["fees", "Fees", "Nature of Legal Fees; Structure of Charges; Scope of Services Included; Additional Costs (government fees, etc.); Payment Conditions; Variability Based on Case", "xojkydnz"],
  ["refund", "Refund", "Conditions for Refund; Non-Refundable Services; Stage-Based Considerations; Contractual Terms; Legal Limitations; Administrative Handling", "xojkydnz"],
  ["timeline", "Timeline", "General Processing Phases; Estimated Timeframes (where possible); Variability Factors; Authority Processing Times; Delays and External Factors; Case-Specific Differences", "xojkydnz"],
  ["responsibilities", "Responsibilities", "Responsibilities of the Lawyer; Responsibilities of the Client; Shared Responsibilities; Documentation Accuracy; Communication Duties; Procedural Cooperation", "xojkydnz"],
  ["rights", "Rights", "Client Rights; Access to Information; Confidentiality; Right to Representation; Right to Withdraw; Legal Protections", "xojkydnz"],
  ["aftercare", "Aftercare", "Post-Approval Guidance; Registration Requirements; Ongoing Compliance; Document Maintenance; Status Monitoring; Future Steps", "mgonrklj"],
  ["renewal", "Renewal", "Renewal Eligibility; Timing Requirements; Documentation for Renewal; Legal Conditions; Risks of Expiry; Administrative Process", "mgonrklj"],
  ["permanent", "Permanent", "Transition to Permanent Status; Eligibility Criteria; Legal Requirements; Time-Based Conditions; Documentation; Administrative Procedures", "mgonrklj"],
  ["naturalisation", "Naturalisation", "Eligibility for Citizenship; Legal Requirements; Residency Conditions; Documentation; Application Procedure; Legal Effects", "mgonrklj"],
  ["compliance", "Compliance", "Immigration Law Compliance; Visa or Residency Conditions; Reporting Requirements; Documentation Maintenance; Monitoring Status; Legal Consequences", "mgonrklj"],
  ["conversion", "Conversion", "Change of Visa or Residency Type; Legal Possibility of Conversion; Requirements; Timing Considerations; Administrative Procedure; Risks and Limitations", "mgonrklj"],
  ["regularization", "Regularization", "Irregular Status Situations; Legal Pathways to Regularization; Documentation Requirements; Administrative Procedures; Risks Involved; Legal Consequences", "mgonrklj"],
  ["planning", "Planning", "Long-Term Immigration Planning; Sequencing of Applications; Status Progression; Risk Anticipation; Legal Strategy Over Time; Alignment with Personal or Business Objectives", "mgonrklj"]
].map(([slug, title, topicString, formGroup]) =>
  makePage({
    key: `process-${slug}`,
    title,
    route: `/process/${slug}/`,
    family: "process",
    pageType: "process",
    sectionStyle: "process",
    formGroup,
    topics: topicString.split("; ").map((value) => value.trim()),
    heroTheme: `Brazil immigration ${title.toLowerCase()} landscape`,
    summary: `Process guidance on ${title.toLowerCase()} within Brazilian immigration procedures and compliance planning.`,
    officialSourceSet: SOURCE_SETS.process
  })
);

const visaChildren = [
  ["artistic", "Artistic", "Legal qualification of artistic or cultural activity; Assessment under visa rules; Participation structuring; Category alignment; Application positioning; Relevant-entity coordination; Monitoring; Ongoing guidance", "xjgajway"],
  ["business", "Business", "Business-entry evaluation; Correct classification; Structuring within legal limits; Regulatory alignment; Permitted business actions; Case positioning; Monitoring; Ongoing support", "mvzwdabe"],
  ["educational", "Educational", "Academic or training objectives; Institutional alignment; Study-path structuring; Educational classification; Positioning; Institutional coordination; Monitoring; Ongoing support", "mwvraore"],
  ["exchange", "Exchange", "Exchange participation structuring; Program alignment; Temporary-activity framing; Rule evaluation; Positioning; Monitoring; Ongoing support", "mwvraore"],
  ["nomad", "Nomad", "Remote-work eligibility; Brazilian requirements; Income and activity alignment; Category positioning; Compliance considerations; Monitoring; Ongoing support", "mwvraore"],
  ["diplomatic", "Diplomatic", "Diplomatic or official status; International and Brazilian frameworks; Entry structuring; Authority coordination; Procedural positioning; Monitoring; Ongoing support", "xjgajway"],
  ["family", "Family", "Family relationship analysis; Family-tie structuring; Category alignment; Relationship recognition; Family-framework positioning; Monitoring; Ongoing assistance", "mreyrqyg"],
  ["humanitarian", "Humanitarian", "Humanitarian or protection context; Structuring under Brazilian provisions; Exceptional-framework alignment; Administrative positioning; Monitoring; Ongoing support", "mreyrqyg"],
  ["investor", "Investor", "Investment-option analysis; Investment structuring; Regulatory alignment; Economic-activity positioning; Strategy review; Monitoring; Ongoing support", "mvzwdabe"],
  ["journalist", "Journalist", "Journalistic activity classification; Regulatory assessment; Professional-framework structuring; Media and institutional alignment; Positioning; Monitoring; Ongoing support", "xjgajway"],
  ["medical", "Medical", "Medical-activity assessment; Immigration classification; Authorized-scope structuring; Institutional alignment; Positioning; Monitoring; Ongoing support", "mreyrqyg"],
  ["religious", "Religious", "Religious-activity qualification; Regulatory assessment; Institutional structuring; Category alignment; Positioning; Monitoring; Ongoing support", "mreyrqyg"],
  ["research", "Research", "Research-activity assessment; Academic and institutional alignment; Pathway structuring; Legal classification; Positioning; Monitoring; Ongoing support", "mwvraore"],
  ["retiree", "Retiree", "Retirement eligibility; Long-term stay structuring; Immigration alignment; Retirement-provision positioning; Compliance review; Monitoring; Ongoing support", "mreyrqyg"],
  ["sports", "Sports", "Sports-activity classification; Regulatory assessment; Club and organization structuring; Framework alignment; Positioning; Monitoring; Ongoing support", "xjgajway"],
  ["startup", "Startup", "Startup-activity evaluation; Immigration structuring; Innovation and business alignment; Legal positioning; Strategy review; Monitoring; Ongoing support", "mvzwdabe"],
  ["student", "Student", "Study-based entry assessment; Institutional alignment; Academic-path structuring; Legal classification; Positioning; Monitoring; Ongoing support", "mwvraore"],
  ["tourist", "Tourist", "Short-term entry framework; Permitted and restricted activities; Misuse risks; Travel-purpose positioning; Preventive orientation", "xjgajway"],
  ["transit", "Transit", "Transit eligibility; Travel purpose and duration; Legal limitations; Positioning; Preventive guidance", "xjgajway"],
  ["volunteer", "Volunteer", "Volunteer-activity qualification; Category assessment; Institutional structuring; Rule alignment; Positioning; Monitoring; Ongoing support", "mwvraore"],
  ["work", "Work", "Employment eligibility; Employer-sponsored path; Labor and immigration alignment; Work-authorization review; Authority coordination; Monitoring; Ongoing support", "mvzwdabe"]
];

const residencyChildren = [
  ["cplp", "CPLP", "Eligibility under CPLP; Simplified structuring; Nationality-based alignment; Legal positioning; Monitoring; Ongoing support", "mdawygwg"],
  ["mercosul", "MERCOSUL", "MERCOSUL evaluation; Residency-path structuring; Regional-agreement alignment; Positioning; Monitoring; Ongoing support", "mdawygwg"],
  ["nomad", "Nomad", "Remote-work continuity; Residence-permit basis; Documentation alignment; Compliance monitoring; Registration flow; Ongoing support", "maqpaopj"],
  ["educational", "Educational", "Educational residence basis; Institutional continuity; Documentation planning; Compliance monitoring; Registration flow; Ongoing support", "maqpaopj"],
  ["exchange", "Exchange", "Exchange-program residence basis; Rule alignment; Documentation planning; Compliance monitoring; Registration flow; Ongoing support", "maqpaopj"],
  ["reunion", "Reunion", "Family-based residence eligibility; Relationship recognition; Documentation structure; Registration flow; Compliance duties; Ongoing support", "xqeywqyl"],
  ["health", "Health", "Health-treatment basis; Medical coordination context; Documentation planning; Residence viability; Registration flow; Ongoing support", "xqeywqyl"],
  ["humanitarian", "Humanitarian", "Protection basis; Residence framing; Documentation planning; Administrative positioning; Registration flow; Ongoing support", "xqeywqyl"],
  ["investor", "Investor", "Investment residence basis; Capital-entry structure; Documentation planning; Registration flow; Compliance duties; Ongoing support", "maqpaopj"],
  ["religious", "Religious", "Religious residence basis; Institutional sponsorship; Documentation structure; Registration flow; Compliance duties; Ongoing support", "xqeywqyl"],
  ["retiree", "Retiree", "Retirement income basis; Residence structuring; Documentation planning; Registration flow; Compliance duties; Ongoing support", "xqeywqyl"],
  ["research", "Research", "Research residence basis; Institutional affiliation; Documentation structure; Registration flow; Compliance duties; Ongoing support", "maqpaopj"],
  ["skilled", "Skilled", "Skilled-worker basis; Qualification alignment; Employer coordination; Documentation structure; Registration flow; Ongoing support", "maqpaopj"],
  ["study", "Study", "Study residence basis; Institutional continuity; Documentation structure; Registration flow; Compliance duties; Ongoing support", "maqpaopj"],
  ["work", "Work", "Employment residence basis; Employer coordination; Documentation structure; Registration flow; Compliance duties; Ongoing support", "maqpaopj"],
  ["youth", "Youth", "Youth-mobility basis; Program alignment; Documentation structure; Registration flow; Compliance duties; Ongoing support", "mdawygwg"],
  ["volunteer", "Volunteer", "Volunteer residence basis; Institutional alignment; Documentation structure; Registration flow; Compliance duties; Ongoing support", "maqpaopj"]
];

const naturalisationChildren = [
  ["ordinary", "Ordinary", "Category basis; Legal context; Documentation framework; Authority review context; Legal effects", "xyknlwnn"],
  ["extraordinary", "Extraordinary", "Category basis; Legal context; Documentation framework; Authority review context; Legal effects", "xyknlwnn"],
  ["provisional", "Provisional", "Category basis; Legal context; Documentation framework; Authority review context; Legal effects", "xyknlwnn"],
  ["special", "Special", "Category basis; Legal context; Documentation framework; Authority review context; Legal effects", "xyknlwnn"],
  ["renunciation", "Renunciation", "Category basis; Legal context; Documentation framework; Authority review context; Legal effects", "xyknlwnn"],
  ["reacquisition", "Reacquisition", "Category basis; Legal context; Documentation framework; Authority review context; Legal effects", "xyknlwnn"]
];

const defenseChildren = [
  ["deportation", "Deportation"],
  ["expulsion", "Expulsion"],
  ["extradition", "Extradition"],
  ["appeals", "Appeals"],
  ["fines", "Fines"],
  ["litigation", "Litigation"]
].map(([slug, title]) => [
  slug,
  title,
  "Legal context; Response structure; Authority interaction; Evidence and document strategy; Ongoing service support",
  "xzdjyrjk"
]);

const otherChildren = [
  ["consular", "Consular", "Consular coordination; Appointment and document logic; Authentication context; Communication structure; Ongoing support", "xeervgrv"],
  ["records", "Records", "Record retrieval strategy; Civil and criminal record context; Authority interaction; Documentation chain; Ongoing support", "xeervgrv"],
  ["translation", "Translation", "Translation scope; Sworn-translation context; Cross-border document use; Review process; Ongoing support", "xeervgrv"],
  ["regularization", "Regularization", "Status diagnosis; Route identification; Documentation structure; Authority interaction; Ongoing support", "xeervgrv"]
];

const advisoryChildren = [
  ["consultation", "Consultation", "Advisory scope; Intake structure; Legal framing; Documentation review; Decision support; Ongoing support", "mojkydkr"],
  ["strategy", "Strategy", "Strategic planning scope; Route comparison; Documentation sequencing; Risk calibration; Decision support; Ongoing support", "mojkydkr"],
  ["compliance", "Compliance", "Monitoring scope; Legal duties; Status controls; Documentation upkeep; Decision support; Ongoing support", "mojkydkr"],
  ["representation", "Representation", "Representation scope; Authority interaction; File management; Response structure; Decision support; Ongoing support", "mojkydkr"],
  ["corporate", "Corporate", "Corporate advisory scope; Cross-border mobility context; Workforce planning; Employer-side compliance; Decision support; Ongoing support", "mojkydkr"]
];

function serviceHub(route, key, title, summary, topicString, sourceSetKey, formGroup, sectionStyle = "service-hub") {
  return makePage({
    key,
    title,
    route,
    family: "services",
    pageType: "service-hub",
    sectionStyle,
    formGroup,
    topics: topicString.split("; ").map((value) => value.trim()),
    heroTheme: `Brazil ${title.toLowerCase()} cinematic landscape`,
    summary,
    officialSourceSet: SOURCE_SETS[sourceSetKey],
    includeTestimonials: true
  });
}

const servicesLanding = makePage({
  key: "services-home",
  title: "Services",
  route: "/services/",
  family: "services",
  pageType: "services-home",
  sectionStyle: "services-home",
  formGroup: "mvzwdabe",
  topics: [
    "Visa and residency pathways",
    "Naturalisation and citizenship planning",
    "Defense and regularization support",
    "Document-driven advisory services",
    "Nationwide online service delivery",
    "Consultation and case-structuring flow"
  ],
  heroTheme: "Brazil coastline panorama",
  summary:
    "Hub page for immigration advisory pathways, organized by visas, residencies, naturalisation, defense, supporting services, and strategic advisory work.",
  officialSourceSet: SOURCE_SETS.foundation,
  includeTestimonials: true
});

const servicePages = [
  servicesLanding,
  serviceHub(
    "/services/visas/",
    "services-visas",
    "Visas",
    "Service-centered overview of visa categories, purpose analysis, documentation logic, and positioning.",
    "Scope of Visa Services; Identification of applicable visa categories; Legal analysis of intended activity and purpose of entry; Structuring of pathways; Regulatory and consular alignment; Application positioning; Coordination with consulates and authorities; Monitoring; Ongoing legal guidance; Child cards",
    "visas",
    "mvzwdabe"
  ),
  ...visaChildren.map(([slug, title, topicString, formGroup]) =>
    makePage({
      key: `visa-${slug}`,
      title: `${title} Visa`,
      route: `/services/visas/${slug}/`,
      family: "services",
      pageType: "service-child",
      sectionStyle: "service-child",
      formGroup,
      topics: topicString.split("; ").map((value) => value.trim()),
      heroTheme: `Brazil ${title.toLowerCase()} travel landscape`,
      summary: `Service page for ${title.toLowerCase()} visa planning, documentation, authority interaction, and compliance framing.`,
      officialSourceSet: SOURCE_SETS.visas
    })
  ),
  serviceHub(
    "/services/residencies/",
    "services-residencies",
    "Residencies",
    "Service-centered overview of residence permits, eligibility analysis, registration logic, and long-term compliance.",
    "Eligibility for residence; Category identification; Long-term path structuring; Visa-to-residency transition; Legal and regulatory alignment; Monitoring; Compliance guidance; Child cards",
    "residencies",
    "mdawygwg"
  ),
  ...residencyChildren.map(([slug, title, topicString, formGroup]) =>
    makePage({
      key: `residency-${slug}`,
      title: `${title} Residency`,
      route: `/services/residencies/${slug}/`,
      family: "services",
      pageType: "service-child",
      sectionStyle: "service-child",
      formGroup,
      topics: topicString.split("; ").map((value) => value.trim()),
      heroTheme: `Brazil ${title.toLowerCase()} residence landscape`,
      summary: `Service page for ${title.toLowerCase()} residence planning, registration, status management, and compliance monitoring.`,
      officialSourceSet: SOURCE_SETS.residencies
    })
  ),
  serviceHub(
    "/services/naturalisation/",
    "services-naturalisation",
    "Naturalisation",
    "Service-centered overview of citizenship categories, residence-history review, documentary preparation, and authority-facing process support.",
    "Citizenship eligibility; Applicable categories; Residency-history review; Statutory alignment; Monitoring; Ongoing support; Child cards",
    "naturalisation",
    "xyknlwnn"
  ),
  ...naturalisationChildren.map(([slug, title, topicString, formGroup]) =>
    makePage({
      key: `naturalisation-${slug}`,
      title: `${title} Naturalisation`,
      route: `/services/naturalisation/${slug}/`,
      family: "services",
      pageType: "service-child",
      sectionStyle: "service-child",
      formGroup,
      topics: topicString.split("; ").map((value) => value.trim()),
      heroTheme: `Brazil ${title.toLowerCase()} citizenship landscape`,
      summary: `Service page for ${title.toLowerCase()} naturalisation analysis, documentary preparation, filing context, and post-decision effects.`,
      officialSourceSet: SOURCE_SETS.naturalisation
    })
  ),
  serviceHub(
    "/services/defense/",
    "services-defense",
    "Defense",
    "Service-centered overview of enforcement situations, response planning, documentary strategy, and representation before authorities.",
    "Enforcement-situation analysis; Legal protections; Defense structuring; Representation before authorities; Monitoring; Ongoing support; Child cards",
    "defense",
    "xzdjyrjk"
  ),
  ...defenseChildren.map(([slug, title, topicString, formGroup]) =>
    makePage({
      key: `defense-${slug}`,
      title,
      route: `/services/defense/${slug}/`,
      family: "services",
      pageType: "service-child",
      sectionStyle: "service-child",
      formGroup,
      topics: topicString.split("; ").map((value) => value.trim()),
      heroTheme: `Brazil ${title.toLowerCase()} legal landscape`,
      summary: `Service page for ${title.toLowerCase()} response planning, evidence strategy, authority interaction, and ongoing support.`,
      officialSourceSet: SOURCE_SETS.defense
    })
  ),
  serviceHub(
    "/services/other/",
    "services-other",
    "Other",
    "Service-centered overview of supporting legal services connected to immigration documentation, authority coordination, and procedural regularity.",
    "Supporting-legal-services scope; Administrative and procedural requirements; Coordination with authorities; Documentation structuring; Alignment with Brazilian standards; Ongoing support; Child cards",
    "other",
    "xeervgrv"
  ),
  ...otherChildren.map(([slug, title, topicString, formGroup]) =>
    makePage({
      key: `other-${slug}`,
      title,
      route: `/services/other/${slug}/`,
      family: "services",
      pageType: "service-child",
      sectionStyle: "service-child",
      formGroup,
      topics: topicString.split("; ").map((value) => value.trim()),
      heroTheme: `Brazil ${title.toLowerCase()} document landscape`,
      summary: `Service page for ${title.toLowerCase()} support, documentation structure, procedural coordination, and practical next steps.`,
      officialSourceSet: SOURCE_SETS.other
    })
  ),
  serviceHub(
    "/services/advisory/",
    "services-advisory",
    "Advisory",
    "Service-centered overview of preventive analysis, strategic structuring, monitoring, and informed decision support.",
    "Advisory scope; Preventive analysis; Strategy structuring; Compliance monitoring; Decision-making support; Child cards",
    "advisory",
    "mojkydkr"
  ),
  ...advisoryChildren.map(([slug, title, topicString, formGroup]) =>
    makePage({
      key: `advisory-${slug}`,
      title,
      route: `/services/advisory/${slug}/`,
      family: "services",
      pageType: "service-child",
      sectionStyle: "service-child",
      formGroup,
      topics: topicString.split("; ").map((value) => value.trim()),
      heroTheme: `Brazil ${title.toLowerCase()} planning landscape`,
      summary: `Service page for ${title.toLowerCase()} advisory support, documentation planning, compliance visibility, and structured decision-making.`,
      officialSourceSet: SOURCE_SETS.advisory
    })
  )
];

const insightsPages = [
  ["general", "General", "Overview of Brazilian immigration system and structure; General legal concepts; Institutional roles and administrative bodies; Distinction between visa, residency, and citizenship; Contextual explanation of immigration categories; Common misunderstandings; Orientation purpose"],
  ["visa", "Visa", "General explanation of visa categories; Temporary versus specific-purpose distinctions; Institutional handling; Legal limitations; Orientation purpose"],
  ["residency", "Residency", "Residence-permit overview; Legal bases; Visa and residency relationship; Rights and obligations; Administrative structure; Orientation purpose"],
  ["naturalisation", "Naturalisation", "Citizenship framework; Legal categories; Competent authority; High-level requirements; Legal consequences; Orientation purpose"],
  ["process", "Process", "Institutional roles; General sequence of procedures; Administrative versus judicial distinction; Compliance concept; Orientation purpose"],
  ["blog", "Blog", "Publication hub; Recurring immigration themes; Subject organization; Ongoing informational publishing"],
  ["updates", "Updates", "Regulatory changes; Institutional announcements; Policy updates; Awareness purpose"],
  ["guides", "Guides", "Structured immigration overviews; Terminology clarification; Framework explanations; Orientation purpose"]
].map(([slug, title, topicString]) =>
  makePage({
    key: `insights-${slug}`,
    title,
    route: `/insights/${slug}/`,
    family: "insights",
    pageType: "insight",
    sectionStyle: "insight",
    formGroup: "xgonrknq",
    topics: topicString.split("; ").map((value) => value.trim()),
    heroTheme: `Brazil ${title.toLowerCase()} overview landscape`,
    summary: `Editorial-style guidance page covering ${title.toLowerCase()} in the Brazilian immigration context.`,
    officialSourceSet: SOURCE_SETS.insights
  })
);

const legalPages = [
  makePage({
    key: "legal-payment",
    title: "Payment",
    route: "/legal/payment/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "payment",
    formGroup: "xgonrknq",
    topics: [
      "Consultation payment explanation",
      "Payment methods",
      "Payment receiver email",
      "Proof-of-payment instruction",
      "WhatsApp assistance",
      "Manual confirmation workflow",
      "36-hour scheduling rule"
    ],
    heroTheme: "Brazil night skyline secure payment",
    summary: "Operational payment page for consultations, proof-of-payment handling, and appointment confirmation.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-form",
    title: "Form",
    route: "/legal/form/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "form",
    formGroup: "xgonrknq",
    topics: [
      "Full Name",
      "Email",
      "Phone or WhatsApp",
      "Occupation",
      "Country",
      "Current immigration stage",
      "Select your service",
      "Case reference optional",
      "Upload documents",
      "Notes and message"
    ],
    heroTheme: "Brazil desk documents landscape",
    summary: "Detailed intake form page describing required fields, file uploads, and what the team reviews before confirmation.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-emergency",
    title: "Emergency",
    route: "/legal/emergency/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "emergency",
    formGroup: "xgonrknq",
    topics: [
      "Email",
      "Phone",
      "WhatsApp instruction",
      "Emergency-only guidance",
      "Existing-client handling note",
      "Nature of urgent immigration events",
      "Immediate authority-first actions"
    ],
    heroTheme: "Brazil city lights urgent support",
    summary: "Emergency contact guidance directing urgent matters to WhatsApp with context about what should be treated as an emergency.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-search",
    title: "Search",
    route: "/legal/search/",
    family: "legal",
    pageType: "search",
    sectionStyle: "search",
    formGroup: "xgonrknq",
    topics: ["Search results"],
    heroTheme: "Brazil map search landscape",
    summary: "Functional site-search page for route discovery.",
    officialSourceSet: SOURCE_SETS.legalPrivacy,
    noindex: true,
    utility: true
  }),
  makePage({
    key: "legal-privacy",
    title: "Privacy",
    route: "/legal/privacy/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "legal",
    formGroup: "xgonrknq",
    topics: [
      "Privacy practices",
      "Data collection",
      "Lawful bases",
      "Data retention",
      "Rights",
      "Contact channel"
    ],
    heroTheme: "Brazil data privacy landscape",
    summary: "Privacy notice for site visitors and consultation inquirers, grounded in LGPD principles and operational transparency.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-cookies",
    title: "Cookies",
    route: "/legal/cookies/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "legal",
    formGroup: "xgonrknq",
    topics: [
      "Cookie categories",
      "Consent management",
      "Analytics logic",
      "Essential cookies",
      "Opt-in and opt-out",
      "Retention and browser controls"
    ],
    heroTheme: "Brazil browser security landscape",
    summary: "Cookie notice describing essential behaviour, analytics consent, and how visitors can revisit preferences.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-terms",
    title: "Terms",
    route: "/legal/terms/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "legal",
    formGroup: "xgonrknq",
    topics: [
      "Informational-website terms",
      "Acceptable use",
      "Contact usage",
      "Limitation language",
      "Governing framework",
      "Intellectual-property notice"
    ],
    heroTheme: "Brazil courthouse skyline landscape",
    summary: "Terms governing the use of the informational website, contact channels, and public materials.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-refund",
    title: "Refund",
    route: "/legal/refund/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "legal",
    formGroup: "xgonrknq",
    topics: [
      "Refund conditions",
      "Non-refundable stages",
      "Timing and processing",
      "Service boundaries",
      "Contractual framing",
      "Administrative handling"
    ],
    heroTheme: "Brazil receipt compliance landscape",
    summary: "Refund framework tied to staged work, consultation completion, and explicit engagement boundaries.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-gdpr",
    title: "Gdpr",
    route: "/legal/gdpr/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "legal",
    formGroup: "xgonrknq",
    topics: [
      "International-visitor privacy best practices",
      "Rights summary",
      "Lawful processing explanation",
      "International transfer framing",
      "Representative limitations",
      "Contact route"
    ],
    heroTheme: "Brazil international privacy landscape",
    summary: "International privacy guidance for visitors who may expect GDPR-style transparency in addition to Brazilian LGPD protections.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-lgpd",
    title: "Lgpd",
    route: "/legal/lgpd/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "legal",
    formGroup: "xgonrknq",
    topics: [
      "Brazil-first privacy compliance",
      "Legal bases",
      "Data subject rights",
      "Contact and requests",
      "Brazil-centered processing framework",
      "Retention and security"
    ],
    heroTheme: "Brazil compliance data landscape",
    summary: "Brazil-first privacy page focused on LGPD concepts, rights, and handling of consultation requests.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-accessibility",
    title: "Accessibility",
    route: "/legal/accessibility/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "legal",
    formGroup: "xgonrknq",
    topics: [
      "Accessibility commitment",
      "Current measures",
      "Compatibility goals",
      "Known limitations",
      "Support contact",
      "Feedback mechanism"
    ],
    heroTheme: "Brazil inclusive access landscape",
    summary: "Accessibility statement covering the controls built into the site, compatibility goals, and support channels.",
    officialSourceSet: SOURCE_SETS.legalAccessibility
  }),
  makePage({
    key: "legal-disclaimer",
    title: "Disclaimer",
    route: "/legal/disclaimer/",
    family: "legal",
    pageType: "legal",
    sectionStyle: "legal",
    formGroup: "xgonrknq",
    topics: [
      "Informational only",
      "Not legal advice",
      "No guarantee",
      "Case-specific variability",
      "No lawyer-client relationship by website use alone",
      "Authority-driven outcomes"
    ],
    heroTheme: "Brazil legal disclaimer landscape",
    summary: "Core disclaimer for informational website use, scope boundaries, and authority-driven decision-making.",
    officialSourceSet: SOURCE_SETS.legalPrivacy
  }),
  makePage({
    key: "legal-404",
    title: "404",
    route: "/legal/404/",
    family: "legal",
    pageType: "utility",
    sectionStyle: "404",
    formGroup: "xgonrknq",
    topics: ["Page not found", "Search", "Main navigation", "CTA", "Helpful recovery links"],
    heroTheme: "Brazil roadfinding landscape",
    summary: "Helpful recovery page for missing routes.",
    officialSourceSet: SOURCE_SETS.legalPrivacy,
    noindex: true,
    utility: true
  })
];

const foundationPages = [
  makePage({
    key: "home",
    title: "Home",
    route: "/",
    family: "foundation",
    pageType: "home",
    sectionStyle: "home",
    formGroup: "xdawygld",
    topics: [
      "Immigration pathways overview",
      "Consultation flow",
      "Trust markers",
      "Nationwide online support",
      "Service categories",
      "Official-resource orientation",
      "Process and compliance framing"
    ],
    heroTheme: "Brazil atlantic coast sunrise",
    summary:
      "Home page introducing immigration pathways, advisory boundaries, consultation flow, and cross-linked route families.",
    officialSourceSet: SOURCE_SETS.foundation,
    includeTestimonials: true
  }),
  makePage({
    key: "start-consultation",
    title: "Start Consultation",
    route: "/start-consultation/",
    family: "foundation",
    pageType: "consultation",
    sectionStyle: "consultation",
    formGroup: "xdawygld",
    topics: [
      "Consultation request flow",
      "Payment before scheduling",
      "36-hour timing rule",
      "Manual review and confirmation",
      "What to prepare",
      "Intake fields",
      "Document uploads",
      "Scope boundaries"
    ],
    heroTheme: "Brazil consultation planning landscape",
    summary:
      "High-intent intake page explaining the consultation workflow, payment sequence, scheduling rule, and preparation steps.",
    officialSourceSet: SOURCE_SETS.foundation
  })
];

export const PAGES = [
  ...foundationPages,
  ...aboutPages,
  ...brazilPages,
  ...processPages,
  ...servicePages,
  ...insightsPages,
  ...legalPages
];

export const NAVIGATION = {
  about: aboutPages.map((page) => ({ label: page.title, route: page.route })),
  brazil: brazilPages.map((page) => ({ label: page.title, route: page.route })),
  process: processPages.map((page) => ({ label: page.title, route: page.route })),
  services: [
    {
      label: "Overview",
      links: [{ label: "Services", route: "/services/" }]
    },
    {
      label: "Visas",
      links: [
        { label: "Visas", route: "/services/visas/" },
        ...visaChildren.map(([slug, title]) => ({ label: title, route: `/services/visas/${slug}/` }))
      ]
    },
    {
      label: "Residencies",
      links: [
        { label: "Residencies", route: "/services/residencies/" },
        ...residencyChildren.map(([slug, title]) => ({ label: title, route: `/services/residencies/${slug}/` }))
      ]
    },
    {
      label: "Naturalisation",
      links: [
        { label: "Naturalisation", route: "/services/naturalisation/" },
        ...naturalisationChildren.map(([slug, title]) => ({
          label: title,
          route: `/services/naturalisation/${slug}/`
        }))
      ]
    },
    {
      label: "Defense",
      links: [
        { label: "Defense", route: "/services/defense/" },
        ...defenseChildren.map(([slug, title]) => ({ label: title, route: `/services/defense/${slug}/` }))
      ]
    },
    {
      label: "Services",
      links: [
        { label: "Services", route: "/services/other/" },
        ...otherChildren.map(([slug, title]) => ({ label: title, route: `/services/other/${slug}/` }))
      ]
    },
    {
      label: "Advisory",
      links: [
        { label: "Advisory", route: "/services/advisory/" },
        ...advisoryChildren.map(([slug, title]) => ({ label: title, route: `/services/advisory/${slug}/` }))
      ]
    }
  ],
  insights: insightsPages.map((page) => ({ label: page.title, route: page.route })),
  legal: legalPages
    .filter((page) => page.route !== "/legal/404/")
    .map((page) => ({ label: page.title, route: page.route }))
};

export const LAWYER_FACTS = {
  publicName: PROFESSIONAL_REFERENCE.publicName,
  legalName: PROFESSIONAL_REFERENCE.fullName,
  oab: PROFESSIONAL_REFERENCE.oab,
  languages: PROFESSIONAL_REFERENCE.languages,
  notes: PROFESSIONAL_REFERENCE.factualNotes
};

export function pageLookup(route) {
  return PAGES.find((page) => page.route === route);
}

export function routeKey(route) {
  if (route === "/") return "home";
  return route
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((part) => slugify(part))
    .join("-");
}
