const service = ({
  label,
  href,
  description,
  serviceInterest,
  topicInterest,
  preferredSource,
  imageQueries,
  imageAlt,
  icon
}) => ({
  label,
  href,
  description,
  consultation: { serviceInterest, topicInterest },
  preferredSource,
  imageQueries,
  imageAlt,
  icon
});

export const SERVICES_ALL_PAGE_COPY = {
  heroLede:
    "Every Brazil immigration service Monique Fernandes provides is defined here in one place. Discover clear, comprehensive explanations of the expert legal support we deliver for Brazilian immigration matters, designed to guide you through every stage with precision, strategy, and full regulatory compliance."
};

export const SERVICES_ALL_FAMILIES = [
  {
    key: "visas",
    eyebrow: "Visa Routes Into Brazil",
    heading: "Visa routes",
    intro:
      "Visa route services cover every type of entry into Brazil, ensuring the purpose of your travel perfectly matches the correct visa category from the outset, with expert preparation of supporting documentation, consular strategy, and entry compliance.",
    preferredSource: "stocksnap",
    fallbackQueries: ["passport table", "airport terminal", "business meeting"],
    services: [
      service({
        label: "Tourist Visa",
        href: "/services/visas/tourist/",
        description:
          "Tourist visa services help plan visitor entry to Brazil with clear guidance on duration limits, required documentation, travel expectations, and full compliance with Brazilian entry regulations for short-term stays.",
        serviceInterest: "Tourist Visa",
        imageQueries: ["passport table", "passport travel", "airport terminal"],
        imageAlt: "Passport and travel documents prepared for a tourist visa route into Brazil.",
        icon: "plane"
      }),
      service({
        label: "Digital Nomad Visa",
        href: "/services/visas/nomad/",
        description:
          "Digital nomad visa services align remote-work arrangements, eligibility criteria, professional documentation, and immigration planning to secure a smooth, regulation-compliant nomad route into Brazil.",
        serviceInterest: "Nomad Visa",
        topicInterest: "Digital Nomad Visa",
        preferredSource: "",
        imageQueries: ["women in tech laptop", "black woman laptop", "woman working laptop"],
        imageAlt: "Remote work setup for a digital nomad visa plan into Brazil.",
        icon: "laptop-minimal"
      }),
      service({
        label: "Work Visa",
        href: "/services/visas/work/",
        description:
          "Work visa services structure employer sponsorship, employment contracts, immigration timing, and all necessary approvals before any work activity begins in Brazil, ensuring complete legal authorisation.",
        serviceInterest: "Work Visa",
        preferredSource: "",
        imageQueries: ["women in tech", "black woman office meeting", "women office meeting"],
        imageAlt: "Professional office setting prepared for a work visa application to Brazil.",
        icon: "briefcase-business"
      }),
      service({
        label: "Student Visa",
        href: "/services/visas/student/",
        description:
          "Student visa services prepare academic-entry pathways with coordinated institutional documentation, study programme alignment, timing, and all supporting evidence required for Brazilian student immigration approval.",
        serviceInterest: "Student Visa",
        imageQueries: ["student studying", "library books", "writing papers"],
        imageAlt: "Student study materials prepared for a Brazilian student visa route.",
        icon: "graduation-cap"
      }),
      service({
        label: "Investor Visa",
        href: "/services/visas/investor/",
        description:
          "Investor visa services connect capital investment plans, business intentions, and comprehensive immigration strategy, ensuring proper structuring and documentation before relocation to Brazil.",
        serviceInterest: "Investor Visa",
        preferredSource: "",
        imageQueries: ["women in tech meeting", "women office meeting", "black woman startup"],
        imageAlt: "Investment planning documents for a Brazil investor visa strategy.",
        icon: "hand-coins"
      }),
      service({
        label: "Family Visa",
        href: "/services/visas/family/",
        description:
          "Family visa services utilise family connections to prepare entry applications with verified relationship evidence, supporting records, and precise alignment to Brazilian family-based immigration criteria.",
        serviceInterest: "Family Visa",
        imageQueries: ["black family", "family together", "children happy"],
        imageAlt: "Family travel planning and documentation for a Brazil family visa route.",
        icon: "users"
      }),
      service({
        label: "Religious Visa",
        href: "/services/visas/religious/",
        description:
          "Religious visa services support mission, church, or faith-based entry by aligning purpose statements, sponsorship documentation, and consular preparation with Brazilian immigration requirements for religious activities.",
        serviceInterest: "Religious Visa",
        imageQueries: ["church interior", "cathedral dome", "architecture building"],
        imageAlt: "Church setting supporting a religious visa route into Brazil.",
        icon: "church"
      }),
      service({
        label: "Journalist Visa",
        href: "/services/visas/journalist/",
        description:
          "Journalist visa services plan media or reporting entry with professional purpose framing, supporting credentials, and complete consular documentation tailored to Brazilian journalistic immigration rules.",
        serviceInterest: "Journalist Visa",
        imageQueries: ["photographer woman", "camera girl", "camera hands"],
        imageAlt: "Camera equipment prepared for a journalist visa route into Brazil.",
        icon: "camera"
      }),
      service({
        label: "Medical Visa",
        href: "/services/visas/medical/",
        description:
          "Medical visa services organise treatment-related entry by coordinating medical purpose documentation, treatment timelines, and all required supporting evidence for compliant access to Brazil.",
        serviceInterest: "Medical Visa",
        imageQueries: ["caregiver nurse", "doctor patient woman", "senior healthcare"],
        imageAlt: "Clinical consultation setting for a Brazil medical visa application.",
        icon: "cross"
      }),
      service({
        label: "Diplomatic Visa",
        href: "/services/visas/diplomatic/",
        description:
          "Diplomatic visa services prepare official or state-linked entry through the correct diplomatic channels, with specialised documentation and protocol alignment under Brazilian immigration procedures.",
        serviceInterest: "Diplomatic Visa",
        preferredSource: "",
        imageQueries: ["women in tech meeting", "business people women", "conference women"],
        imageAlt: "Official diplomatic meeting prepared for visa protocol into Brazil.",
        icon: "handshake"
      }),
      service({
        label: "Research Visa",
        href: "/services/visas/research/",
        description:
          "Research visa services support academic or institutional research entry by matching project requirements with the appropriate visa route and comprehensive documentary preparation.",
        serviceInterest: "Research Visa",
        preferredSource: "",
        imageQueries: ["scientist research laboratory", "research lab equipment", "academic research workspace"],
        imageAlt: "Research laboratory scene for a Brazil research visa route.",
        icon: "flask-conical"
      }),
      service({
        label: "Sports Visa",
        href: "/services/visas/sports/",
        description:
          "Sports visa services structure athlete, coach, or sports-related entry with proper sponsorship evidence, activity documentation, and full compliance for Brazilian sports immigration pathways.",
        serviceInterest: "Sports Visa",
        imageQueries: ["boxing asia", "sports training", "woman sneakers"],
        imageAlt: "Sports training environment for a Brazil sports visa application.",
        icon: "trophy"
      }),
      service({
        label: "Startup Visa",
        href: "/services/visas/startup/",
        description:
          "Startup visa services connect innovation projects, founder objectives, and immigration timing to create a compliant startup entry route into Brazil’s entrepreneurial ecosystem.",
        serviceInterest: "Startup Visa",
        imageQueries: ["startup office team", "founder workspace startup", "innovation team meeting"],
        imageAlt: "Startup team workspace supporting a Brazil startup visa strategy.",
        icon: "rocket"
      }),
      service({
        label: "Volunteer Visa",
        href: "/services/visas/volunteer/",
        description:
          "Volunteer visa services prepare service-oriented entry with sponsoring organisation documentation, clear purpose alignment, and timeframe compliance under Brazilian volunteer immigration rules.",
        serviceInterest: "Volunteer Visa",
        imageQueries: ["community volunteer group", "volunteer service event", "charity volunteers"],
        imageAlt: "Volunteer activity prepared for a Brazil volunteer visa route.",
        icon: "heart-handshake"
      }),
      service({
        label: "Artistic Visa",
        href: "/services/visas/artistic/",
        description:
          "Artistic visa services support cultural or artistic entry by preparing project records, invitation letters, and complete route documentation for seamless Brazilian approval.",
        serviceInterest: "Artistic Visa",
        imageQueries: ["artist studio painting", "art gallery exhibition", "creative workspace canvas"],
        imageAlt: "Artist studio scene prepared for an artistic visa route into Brazil.",
        icon: "palette"
      }),
      service({
        label: "Educational Exchange Visa",
        href: "/services/visas/exchange/",
        description:
          "Educational exchange visa services facilitate mobility programmes, placement coordination, and timing alignment for approved educational exchange entry into Brazil.",
        serviceInterest: "Exchange Visa",
        topicInterest: "Educational Exchange Visa",
        imageQueries: ["student studying", "library books", "people girls"],
        imageAlt: "Student exchange setting for an educational exchange visa route into Brazil.",
        icon: "globe"
      }),
      service({
        label: "Transit Visa",
        href: "/services/visas/transit/",
        description:
          "Transit visa services clarify short-term transit requirements, preventing travel complications and ensuring smooth passage through Brazilian immigration controls.",
        serviceInterest: "Transit Visa",
        imageQueries: ["airport terminal", "airport airplanes", "passport table"],
        imageAlt: "Airport transit scene for a Brazil transit visa route.",
        icon: "waypoints"
      }),
      service({
        label: "Business Visa",
        href: "/services/visas/business/",
        description:
          "Business visa services prepare commercial meetings, trade visits, and business entry with precise purpose documentation and full regulatory compliance for Brazilian business travel.",
        serviceInterest: "Business Visa",
        preferredSource: "",
        imageQueries: ["women in tech meeting", "business people women", "working together women"],
        imageAlt: "Business meeting setting prepared for a Brazil business visa route.",
        icon: "presentation"
      })
    ]
  },
  {
    key: "residencies",
    eyebrow: "Residency Pathways",
    heading: "Residency pathways",
    intro:
      "Residency pathway services provide expert guidance when Brazil becomes your long-term home, delivering lawful continuity, status maintenance, and structured progression beyond initial entry.",
    preferredSource: "stocksnap",
    fallbackQueries: ["city buildings", "home office", "happy family"],
    services: [
      service({
        label: "Residency",
        href: "/services/residencies/",
        description:
          "Residency services help identify and prepare the most suitable long-term residence option in Brazil, with detailed pathway analysis and personalised planning for stable, compliant settlement.",
        serviceInterest: "Not sure yet",
        topicInterest: "Residency",
        imageQueries: ["city buildings", "urban city", "buildings highrises"],
        imageAlt: "City housing scene for long-term residency planning in Brazil.",
        icon: "house"
      }),
      service({
        label: "MERCOSUL Residency",
        href: "/services/residencies/mercosul/",
        description:
          "MERCOSUL residency services optimise regional residence rights through strategic timing, registration planning, and continuity measures under Brazilian MERCOSUL immigration frameworks.",
        serviceInterest: "MERCOSUL Residency",
        imageQueries: ["city buildings", "urban city", "city buildings skyline"],
        imageAlt: "Regional city setting for MERCOSUL residency planning in Brazil.",
        icon: "map-pinned"
      }),
      service({
        label: "CPLP Residency",
        href: "/services/residencies/cplp/",
        description:
          "CPLP residency services structure community-based residence applications using nationality eligibility, comprehensive documentation, and clear next-step strategies within Brazilian CPLP rules.",
        serviceInterest: "CPLP Residency",
        imageQueries: ["passport table", "paperwork desk", "writing papers"],
        imageAlt: "Passport and language documents for a CPLP residency route in Brazil.",
        icon: "languages"
      }),
      service({
        label: "Family Reunion Residency",
        href: "/services/residencies/reunion/",
        description:
          "Family reunion residency services build long-term residence through verified family ties, relationship evidence, and orderly documentation compliant with Brazilian family immigration law.",
        serviceInterest: "Reunion Residency",
        topicInterest: "Family Reunion Residency",
        imageQueries: ["black family", "family together", "children happy"],
        imageAlt: "Family home scene prepared for family reunion residency in Brazil.",
        icon: "house-plus"
      }),
      service({
        label: "Health Residency",
        href: "/services/residencies/health/",
        description:
          "Health residency services support residence applications based on health-related grounds with careful medical documentation planning and full regulatory alignment in Brazil.",
        serviceInterest: "Health Residency",
        imageQueries: ["caregiver nurse", "doctor patient woman", "senior healthcare"],
        imageAlt: "Medical consultation scene for health residency planning in Brazil.",
        icon: "stethoscope"
      }),
      service({
        label: "Humanitarian Residency",
        href: "/services/residencies/humanitarian/",
        description:
          "Humanitarian residency services manage protection-based residence applications with compassionate, precise legal framing and complete documentary support under Brazilian humanitarian pathways.",
        serviceInterest: "Humanitarian Residency",
        imageQueries: ["black family", "people helping", "community support women"],
        imageAlt: "Supportive humanitarian scene for residency protection planning in Brazil.",
        icon: "life-buoy"
      }),
      service({
        label: "Investor Residency",
        href: "/services/residencies/investor/",
        description:
          "Investor residency services align investment structures, proof of funds, and long-term settlement goals for compliant investor-based residence in Brazil.",
        serviceInterest: "Investor Residency",
        imageQueries: ["business meeting", "city buildings", "office meeting"],
        imageAlt: "Investment planning scene for investor residency in Brazil.",
        icon: "piggy-bank"
      }),
      service({
        label: "Religious Residency",
        href: "/services/residencies/religious/",
        description:
          "Religious residency services plan faith-based long-term residence with proper sponsorship, purpose documentation, and ongoing compliance under Brazilian religious immigration rules.",
        serviceInterest: "Religious Residency",
        imageQueries: ["church interior", "cathedral dome", "architecture building"],
        imageAlt: "Faith community setting for religious residency planning in Brazil.",
        icon: "landmark"
      }),
      service({
        label: "Retirement Residency",
        href: "/services/residencies/retiree/",
        description:
          "Retirement residency services prepare income-based residence applications with verified financial proof, continuity planning, and practical settlement support for Brazil.",
        serviceInterest: "Retiree Residency",
        topicInterest: "Retirement Residency",
        imageQueries: ["senior woman", "senior couple", "elderly woman"],
        imageAlt: "Retirement lifestyle scene for long-term residency planning in Brazil.",
        icon: "sun"
      }),
      service({
        label: "Research Residency",
        href: "/services/residencies/research/",
        description:
          "Research residency services support extended academic or institutional research stays through institutional backing and complete documentary preparation for Brazilian residency approval.",
        serviceInterest: "Research Residency",
        preferredSource: "",
        imageQueries: ["black woman scientist", "women in tech laboratory", "scientist research institute"],
        imageAlt: "Research workspace prepared for long-term research residency in Brazil.",
        icon: "microscope"
      }),
      service({
        label: "Skilled Residency",
        href: "/services/residencies/skilled/",
        description:
          "Skilled residency services evaluate professional profiles and legal eligibility to secure skills-based long-term residence in Brazil.",
        serviceInterest: "Skilled Residency",
        imageQueries: ["office meeting", "paperwork desk", "business meeting"],
        imageAlt: "Professional planning scene for skilled residency in Brazil.",
        icon: "badge-check"
      }),
      service({
        label: "Study Residency",
        href: "/services/residencies/study/",
        description:
          "Study residency services transition temporary student arrangements into longer-term lawful residence connected to ongoing education in Brazil.",
        serviceInterest: "Study Residency",
        imageQueries: ["student studying", "library books", "writing papers"],
        imageAlt: "University study environment for study residency planning in Brazil.",
        icon: "book-open-text"
      }),
      service({
        label: "Work Residency",
        href: "/services/residencies/work/",
        description:
          "Work residency services establish residence around sustained employment, proper registration, and continuous lawful status in Brazil.",
        serviceInterest: "Work Residency",
        imageQueries: ["city buildings", "office meeting", "paperwork desk"],
        imageAlt: "Professional workspace for work residency planning in Brazil.",
        icon: "hard-hat"
      }),
      service({
        label: "Youth Residency",
        href: "/services/residencies/youth/",
        description:
          "Youth residency services review age-specific pathways, timing requirements, and documentary needs for youth-focused Brazilian residence options.",
        serviceInterest: "Youth Residency",
        imageQueries: ["young people city", "people city", "couple love"],
        imageAlt: "Young adults planning a youth residency route in Brazil.",
        icon: "sparkles"
      }),
      service({
        label: "Volunteer Residency",
        href: "/services/residencies/volunteer/",
        description:
          "Volunteer residency services support extended volunteer-based stays with appropriate sponsorship, compliance planning, and long-term documentation.",
        serviceInterest: "Volunteer Residency",
        preferredSource: "",
        imageQueries: ["community volunteers long term", "volunteer group planning", "service community support"],
        imageAlt: "Volunteer community setting for volunteer residency planning in Brazil.",
        icon: "user-round-plus"
      }),
      service({
        label: "Nomad Residency",
        href: "/services/residencies/nomad/",
        description:
          "Nomad residency services structure long-term remote-work residence with registration, continuity planning, and practical lifestyle integration in Brazil.",
        serviceInterest: "Nomad Residency",
        imageQueries: ["home office", "workspace desk", "remote work laptop"],
        imageAlt: "Remote work apartment setting for nomad residency in Brazil.",
        icon: "wifi"
      })
    ]
  },
  {
    key: "naturalisation",
    eyebrow: "Citizenship And Naturalisation",
    heading: "Citizenship and naturalisation",
    intro:
      "Citizenship and naturalisation services address questions of formal belonging, nationality acquisition, and long-term legal integration into Brazilian society.",
    preferredSource: "stocksnap",
    fallbackQueries: ["female professional laptop", "woman office", "woman desk"],
    services: [
      service({
        label: "Citizenship",
        href: "/services/naturalisation/",
        description:
          "Citizenship services guide you when the goal shifts from temporary or long-term stay in Brazil to full formal belonging and nationality.",
        serviceInterest: "Not sure yet",
        topicInterest: "Citizenship",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Citizenship documents and passport prepared for a Brazil nationality route.",
        icon: "flag"
      }),
      service({
        label: "Naturalisation",
        href: "/services/naturalisation/",
        description:
          "Naturalisation services provide a complete review of all available categories to identify the route that best matches your personal history and timeline in Brazil.",
        serviceInterest: "Not sure yet",
        topicInterest: "Naturalisation",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Naturalisation paperwork reviewed for a Brazil nationality application.",
        icon: "scroll-text"
      }),
      service({
        label: "Ordinary Naturalisation",
        href: "/services/naturalisation/ordinary/",
        description:
          "Ordinary naturalisation services support the standard pathway when lawful residence, continuity, and eligibility criteria have been fully satisfied over time.",
        serviceInterest: "Ordinary Naturalisation",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Identity documents prepared for ordinary naturalisation in Brazil.",
        icon: "id-card"
      }),
      service({
        label: "Extraordinary Naturalisation",
        href: "/services/naturalisation/extraordinary/",
        description:
          "Extraordinary naturalisation services assess whether extended residence periods and exceptional circumstances qualify you for this accelerated Brazilian nationality route.",
        serviceInterest: "Extraordinary Naturalisation",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Formal recognition setting for extraordinary naturalisation in Brazil.",
        icon: "star"
      }),
      service({
        label: "Provisional Naturalisation",
        href: "/services/naturalisation/provisional/",
        description:
          "Provisional naturalisation services evaluate temporary or conditional nationality options based on your current status and required timing under Brazilian law.",
        serviceInterest: "Provisional Naturalisation",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Temporary legal documents prepared for provisional naturalisation in Brazil.",
        icon: "hourglass"
      }),
      service({
        label: "Special Naturalisation",
        href: "/services/naturalisation/special/",
        description:
          "Special naturalisation services identify and prepare applications under narrower, category-specific Brazilian nationality provisions when your facts align.",
        serviceInterest: "Special Naturalisation",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Official certificate and documents for special naturalisation in Brazil.",
        icon: "gem"
      }),
      service({
        label: "Renunciation of Nationality",
        href: "/services/naturalisation/renunciation/",
        description:
          "Renunciation of nationality services deliver expert legal guidance before any decision to relinquish existing Brazilian nationality.",
        serviceInterest: "Renunciation Naturalisation",
        topicInterest: "Renunciation of Nationality",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Passport and legal paperwork reviewed for nationality renunciation in Brazil.",
        icon: "log-out"
      }),
      service({
        label: "Reacquisition of Nationality",
        href: "/services/naturalisation/reacquisition/",
        description:
          "Reacquisition of nationality services review eligibility and provide step-by-step legal support for recovering previously held Brazilian nationality.",
        serviceInterest: "Reacquisition Naturalisation",
        topicInterest: "Reacquisition of Nationality",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Official identity documents reviewed for reacquiring Brazilian nationality.",
        icon: "rotate-ccw"
      })
    ]
  },
  {
    key: "defense",
    eyebrow: "Defense And Urgent Matters",
    heading: "Defense and urgent matters",
    intro:
      "Defense and urgent matter services activate immediately when immigration issues become time-sensitive, exposed, or require a strong, defensible legal response.",
    preferredSource: "stocksnap",
    fallbackQueries: ["paperwork desk", "courthouse", "airport terminal"],
    services: [
      service({
        label: "Deportation Defense",
        href: "/services/defense/deportation/",
        description:
          "Deportation defense services provide rapid attorney intervention when removal risk, procedural chronology, and immediate legal protection are critical.",
        serviceInterest: "Deportation",
        imageQueries: ["airport terminal", "passport table", "paperwork desk"],
        imageAlt: "Urgent airport paperwork prepared for deportation defense in Brazil.",
        icon: "shield-alert"
      }),
      service({
        label: "Expulsion Defense",
        href: "/services/defense/expulsion/",
        description:
          "Expulsion defense services stabilise and resolve expulsion-related matters before they escalate into permanent immigration barriers in Brazil.",
        serviceInterest: "Expulsion",
        imageQueries: ["paperwork desk", "writing papers", "courthouse"],
        imageAlt: "Legal file review for expulsion defense in Brazil.",
        icon: "ban"
      }),
      service({
        label: "Extradition Defense",
        href: "/services/defense/extradition/",
        description:
          "Extradition defense services coordinate comprehensive legal strategy and international compliance when facing extradition exposure.",
        serviceInterest: "Extradition",
        imageQueries: ["courthouse", "paperwork desk", "writing papers"],
        imageAlt: "Formal justice setting for extradition defense involving Brazil.",
        icon: "scale-3d"
      }),
      service({
        label: "Appeals",
        href: "/services/defense/appeals/",
        description:
          "Appeals services challenge unfavourable Brazilian immigration decisions with strengthened records, procedural review, and strategic next-step planning.",
        serviceInterest: "Appeals",
        preferredSource: "",
        imageQueries: ["women office meeting", "woman working", "black woman lawyer client"],
        imageAlt: "Legal appeal documents prepared for Brazilian immigration review.",
        icon: "file-pen-line"
      }),
      service({
        label: "Fines",
        href: "/services/defense/fines/",
        description:
          "Fines services analyse penalties, outstanding obligations, and resolution options to prevent minor issues from creating major immigration complications.",
        serviceInterest: "Fines",
        preferredSource: "",
        imageQueries: ["woman working", "writing papers woman", "women office meeting"],
        imageAlt: "Penalty paperwork reviewed to resolve immigration fines in Brazil.",
        icon: "receipt"
      }),
      service({
        label: "Litigation",
        href: "/services/defense/litigation/",
        description:
          "Litigation services deliver full legal escalation and court representation when matters move beyond administrative processing into formal judicial proceedings.",
        serviceInterest: "Litigation",
        imageQueries: ["courthouse", "architecture column", "paperwork desk"],
        imageAlt: "Courthouse exterior representing immigration litigation in Brazil.",
        icon: "building"
      })
    ]
  },
  {
    key: "support",
    eyebrow: "Supporting Services",
    heading: "Supporting services",
    intro:
      "Supporting services maintain all ancillary elements - consular actions, translations, records, and status corrections - so your core Brazilian immigration strategy remains effective and usable.",
    preferredSource: "stocksnap",
    fallbackQueries: ["paperwork desk", "passport table", "writing papers"],
    services: [
      service({
        label: "Consular Records",
        href: "/services/other/consular/",
        description:
          "Consular records services manage appointments, document preparation, and record-linked steps that strengthen and support your overall Brazilian immigration file.",
        serviceInterest: "Consular",
        topicInterest: "Consular Records",
        imageQueries: ["passport table", "paperwork desk", "business meeting"],
        imageAlt: "Consular documents prepared to support a Brazil immigration file.",
        icon: "file-stack"
      }),
      service({
        label: "Translation",
        href: "/services/other/translation/",
        description:
          "Translation services ensure all sworn translations and supporting documents meet Brazilian immigration standards for seamless processing and acceptance.",
        serviceInterest: "Translation",
        imageQueries: ["paperwork desk", "writing papers", "home office"],
        imageAlt: "Translated documents prepared for Brazilian immigration processing.",
        icon: "notebook-pen"
      }),
      service({
        label: "Regularisation",
        href: "/services/other/regularization/",
        description:
          "Regularisation services correct, renew, convert, or stabilise your current immigration status before any manageable issue develops into a significant setback.",
        serviceInterest: "Regularization",
        topicInterest: "Regularisation",
        imageQueries: ["passport table", "paperwork desk", "writing papers"],
        imageAlt: "Immigration paperwork prepared for regularisation in Brazil.",
        icon: "refresh-cw"
      })
    ]
  },
  {
    key: "advisory",
    eyebrow: "Advisory And Planning",
    heading: "Advisory and planning",
    intro:
      "Comprehensive advisory and planning services where we analyse your personal situation, compare all available Brazilian immigration pathways, evaluate timing and strategic options, and establish the optimal legal sequence of actions before any filing, travel, investment, or relocation begins.",
    preferredSource: "",
    fallbackQueries: ["women in tech", "black woman office meeting", "women office meeting"],
    services: [
      service({
        label: "Advisory",
        href: "/services/advisory/",
        description:
          "Begin with dedicated advisory services where Monique Fernandes delivers in-depth route comparisons, timing evaluations, risk assessments, and strategic fit analysis tailored to your goals, ensuring you select the most suitable Brazilian immigration path before committing resources or making life-changing decisions.",
        serviceInterest: "Not sure yet",
        topicInterest: "Advisory",
        imageQueries: ["women in tech", "women office meeting", "black woman office meeting"],
        imageAlt: "Attorney-led advisory meeting for planning a Brazil immigration route.",
        icon: "scale"
      }),
      service({
        label: "Consultation",
        href: "/services/advisory/consultation/",
        description:
          "Private consultation services provide focused, one-on-one guidance when your Brazilian immigration route depends on your specific facts, document history, personal chronology, and individual circumstances, allowing precise clarification and next-step planning.",
        serviceInterest: "Consultation",
        preferredSource: "woc_tech",
        imageQueries: ["black woman office meeting", "women office meeting", "women in tech"],
        imageAlt: "Private consultation meeting about a Brazilian immigration matter.",
        icon: "messages-square"
      }),
      service({
        label: "Strategy",
        href: "/services/advisory/strategy/",
        description:
          "Strategic planning services focus on building the complete legal order of operations, sequencing every required step, aligning documentation, and creating a robust roadmap before you file, travel, invest, or relocate under Brazilian immigration rules.",
        serviceInterest: "Strategy",
        preferredSource: "stocksnap",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Strategic planning documents arranged for a Brazil immigration process.",
        icon: "route"
      }),
      service({
        label: "Compliance",
        href: "/services/advisory/compliance/",
        description:
          "Ongoing compliance services ensure your Brazilian immigration status, deadlines, renewals, reporting obligations, and all documentary requirements remain fully aligned with current Brazilian regulations, preventing gaps and maintaining continuous lawful presence.",
        serviceInterest: "Compliance",
        preferredSource: "stocksnap",
        imageQueries: ["female professional laptop", "woman office", "woman desk"],
        imageAlt: "Checklist and passport documents prepared for immigration compliance in Brazil.",
        icon: "shield-check"
      }),
      service({
        label: "Representation",
        href: "/services/advisory/representation/",
        description:
          "Legal representation services transition from general advice to direct, attorney-led support, providing a professional legal voice in all communications, submissions, and interactions with Brazilian immigration authorities when your process requires formal advocacy.",
        serviceInterest: "Representation",
        imageQueries: ["women in tech", "black woman office meeting", "women office meeting"],
        imageAlt: "Attorney-led representation meeting for a Brazil immigration matter.",
        icon: "speech"
      }),
      service({
        label: "Corporate Immigration",
        href: "/services/advisory/corporate/",
        description:
          "Corporate immigration services deliver specialist support for founders, investors, executives, and companies relocating talent or operations to Brazil, covering structured employer sponsorship, business mobility planning, and seamless integration into the Brazilian immigration framework.",
        serviceInterest: "Corporate",
        imageQueries: ["women in tech", "diverse women startup team", "black woman startup"],
        imageAlt: "Corporate planning meeting for immigration support into Brazil.",
        icon: "building-2"
      })
    ]
  }
];
