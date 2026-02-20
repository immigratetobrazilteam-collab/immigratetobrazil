export type AboutUsMetric = {
  value: string;
  label: string;
};

export type AboutUsPillar = {
  title: string;
  detail: string;
};

export type AboutUsSignatureTheme = {
  badge: string;
  heroLead: string;
  stats: AboutUsMetric[];
  pillars: AboutUsPillar[];
  variant: 'prestige' | 'advisory' | 'clarity' | 'support';
};

const themes: Record<string, AboutUsSignatureTheme> = {
  '10-awards': {
    badge: 'Recognition',
    heroLead: 'Independent recognition only matters when it reflects real execution quality, client outcomes, and legal precision.',
    variant: 'prestige',
    stats: [
      { value: '10', label: 'Awards and recognitions' },
      { value: 'Premium', label: 'Service positioning' },
      { value: 'Verified', label: 'Quality track record' },
    ],
    pillars: [
      { title: 'External validation', detail: 'Awards reinforce trust by showing sustained standards over time, not one-off campaigns.' },
      { title: 'Operational consistency', detail: 'Recognition follows repeatable case quality and disciplined delivery at every stage.' },
      { title: 'Credibility for clients', detail: 'Clear market signals help clients choose an advisory with proven professional standards.' },
    ],
  },
  '10-experts': {
    badge: 'Team Depth',
    heroLead: 'Complex immigration outcomes require a multidisciplinary team, not one isolated advisor.',
    variant: 'advisory',
    stats: [
      { value: '10', label: 'Expert roles mapped' },
      { value: '1', label: 'Unified client workflow' },
      { value: '360', label: 'Case lifecycle coverage' },
    ],
    pillars: [
      { title: 'Role specialization', detail: 'Legal, documentation, onboarding, and compliance specialists reduce bottlenecks and errors.' },
      { title: 'Cross-functional review', detail: 'Critical filings are reviewed from multiple lenses before submission.' },
      { title: 'Single strategic direction', detail: 'The client experiences one coherent plan, not fragmented advice.' },
    ],
  },
  '10-press-mentions': {
    badge: 'Public Credibility',
    heroLead: 'Press mentions reflect visibility, but their value comes from transparent expertise and accountable communication.',
    variant: 'prestige',
    stats: [
      { value: '10+', label: 'Media references' },
      { value: 'Global', label: 'Audience reach' },
      { value: 'Trusted', label: 'Public narrative' },
    ],
    pillars: [
      { title: 'Thought leadership', detail: 'Public commentary demonstrates command of legal pathways and migration strategy.' },
      { title: 'Transparent messaging', detail: 'Consistent communication reduces confusion in high-stakes relocation decisions.' },
      { title: 'Reputation resilience', detail: 'A public track record strengthens confidence for new clients and partners.' },
    ],
  },
  '10-reasons-choose-us': {
    badge: 'Decision Clarity',
    heroLead: 'Clients choose high-end immigration counsel for control, transparency, and execution strength.',
    variant: 'support',
    stats: [
      { value: '10', label: 'Decision factors' },
      { value: 'Low-risk', label: 'Execution model' },
      { value: 'Client-first', label: 'Advisory posture' },
    ],
    pillars: [
      { title: 'Structured roadmaps', detail: 'Every client receives a defined sequence of legal and operational checkpoints.' },
      { title: 'Proactive risk flags', detail: 'Potential denial drivers are identified early, before filing pressure increases.' },
      { title: 'Premium communication', detail: 'Clients stay informed with concise updates and decision-ready guidance.' },
    ],
  },
  '10-reasons-not-alone': {
    badge: 'Support Framework',
    heroLead: 'Immigration becomes safer when clients are guided by a system instead of navigating alone.',
    variant: 'support',
    stats: [
      { value: '10', label: 'Support advantages' },
      { value: 'Human', label: 'Case accompaniment' },
      { value: 'Clear', label: 'Decision pathways' },
    ],
    pillars: [
      { title: 'Guided sequencing', detail: 'Tasks are prioritized so clients focus only on what moves the case forward.' },
      { title: 'Confidence under pressure', detail: 'Professional support reduces uncertainty during documentation and submissions.' },
      { title: 'Continuity of support', detail: 'Assistance extends from planning through post-approval integration stages.' },
    ],
  },
  '10-success-stories': {
    badge: 'Client Outcomes',
    heroLead: 'Success stories matter when they show replicable execution, not just isolated wins.',
    variant: 'support',
    stats: [
      { value: '10', label: 'Outcome snapshots' },
      { value: 'Multi-profile', label: 'Client coverage' },
      { value: 'Replicable', label: 'Method consistency' },
    ],
    pillars: [
      { title: 'Outcome architecture', detail: 'Each successful case follows a disciplined strategy from intake to resolution.' },
      { title: 'Context-specific planning', detail: 'Different client profiles demand tailored legal and relocation decisions.' },
      { title: 'Proof of reliability', detail: 'Past outcomes show the team can execute under real-world constraints.' },
    ],
  },
  'common-mistakes': {
    badge: 'Risk Intelligence',
    heroLead: 'Most immigration setbacks are predictable and preventable with proper planning.',
    variant: 'clarity',
    stats: [
      { value: 'Top', label: 'Mistakes cataloged' },
      { value: 'Early', label: 'Risk detection' },
      { value: 'Preventive', label: 'Advisory method' },
    ],
    pillars: [
      { title: 'Documentation errors', detail: 'Incomplete or inconsistent records remain one of the main rejection factors.' },
      { title: 'Category misalignment', detail: 'Choosing the wrong visa or residency basis can create avoidable delays.' },
      { title: 'Timeline mismanagement', detail: 'Late actions around validity windows increase legal and operational risk.' },
    ],
  },
  'how-it-works': {
    badge: 'Execution Model',
    heroLead: 'A premium process should be transparent, measurable, and clearly staged.',
    variant: 'clarity',
    stats: [
      { value: '4', label: 'Core delivery phases' },
      { value: 'Mapped', label: 'Milestones and owners' },
      { value: 'Controlled', label: 'Quality checkpoints' },
    ],
    pillars: [
      { title: 'Structured intake', detail: 'Cases start with profile mapping, constraints analysis, and route validation.' },
      { title: 'Build and submit', detail: 'Document architecture and filing strategy are aligned before execution.' },
      { title: 'Track and stabilize', detail: 'Monitoring and post-approval support keep legal continuity intact.' },
    ],
  },
  'immigration-done-right': {
    badge: 'Quality Standard',
    heroLead: 'Doing immigration right means protecting legal position, timeline integrity, and long-term stability.',
    variant: 'clarity',
    stats: [
      { value: 'High', label: 'Quality threshold' },
      { value: 'Strict', label: 'Compliance discipline' },
      { value: 'Long-term', label: 'Residency mindset' },
    ],
    pillars: [
      { title: 'Preparation discipline', detail: 'Robust preparation reduces rework and prevents avoidable refusals.' },
      { title: 'Evidence coherence', detail: 'Every filing element must support one consistent legal narrative.' },
      { title: 'Lifecycle thinking', detail: 'Advisory decisions account for renewals, transitions, and future options.' },
    ],
  },
  'legal-compliance-standards': {
    badge: 'Compliance Standards',
    heroLead: 'Legal quality depends on controlled process, documented standards, and accountable execution.',
    variant: 'advisory',
    stats: [
      { value: 'Documented', label: 'Compliance protocols' },
      { value: 'Auditable', label: 'Case governance' },
      { value: 'Consistent', label: 'Service standards' },
    ],
    pillars: [
      { title: 'Policy alignment', detail: 'Internal workflows are designed around official procedural requirements.' },
      { title: 'Decision traceability', detail: 'Key choices are documented to maintain clarity and accountability.' },
      { title: 'Risk mitigation controls', detail: 'Quality gates are applied before high-impact submissions.' },
    ],
  },
  mission: {
    badge: 'Mission',
    heroLead: 'Our mission is to deliver legally sound, strategically clear relocation outcomes to Brazil.',
    variant: 'advisory',
    stats: [
      { value: 'Client', label: 'Outcome orientation' },
      { value: 'Legal', label: 'Integrity first' },
      { value: 'Strategic', label: 'Long-term focus' },
    ],
    pillars: [
      { title: 'Purpose with discipline', detail: 'Mission is translated into concrete service standards and measurable delivery.' },
      { title: 'Clarity for clients', detail: 'Clients receive direct guidance that reduces ambiguity and decision fatigue.' },
      { title: 'Sustainable impact', detail: 'The goal is lasting legal stability, not short-term transactional wins.' },
    ],
  },
  'mission-values-ethics': {
    badge: 'Values and Ethics',
    heroLead: 'Values define how we advise, communicate, and protect client interests under pressure.',
    variant: 'advisory',
    stats: [
      { value: 'Core', label: 'Ethical principles' },
      { value: 'Transparent', label: 'Communication model' },
      { value: 'Responsible', label: 'Client advocacy' },
    ],
    pillars: [
      { title: 'Ethical consistency', detail: 'Professional standards are applied evenly across every profile and case size.' },
      { title: 'Truth over convenience', detail: 'Advice is based on legal reality, even when difficult tradeoffs are involved.' },
      { title: 'Respectful partnership', detail: 'Client relationships are built on honesty, discretion, and accountability.' },
    ],
  },
  'trusted-worldwide': {
    badge: 'Global Trust',
    heroLead: 'International clients choose advisors who can bridge legal complexity with practical relocation confidence.',
    variant: 'prestige',
    stats: [
      { value: 'Worldwide', label: 'Client base' },
      { value: 'Cross-border', label: 'Case exposure' },
      { value: 'Trusted', label: 'Advisory reputation' },
    ],
    pillars: [
      { title: 'International perspective', detail: 'Advice is adapted for cross-border realities, documentation, and travel timelines.' },
      { title: 'Cultural fluency', detail: 'Communication considers language, expectations, and decision context.' },
      { title: 'Stable delivery', detail: 'Global trust is sustained through reliable execution and consistent outcomes.' },
    ],
  },
  'years-experience': {
    badge: 'Experience',
    heroLead: 'Years of experience matter when converted into repeatable systems and better client outcomes.',
    variant: 'prestige',
    stats: [
      { value: 'Years', label: 'Accumulated practice' },
      { value: 'Refined', label: 'Operational playbooks' },
      { value: 'Proven', label: 'Case maturity' },
    ],
    pillars: [
      { title: 'Pattern recognition', detail: 'Experience helps identify critical risks before they escalate.' },
      { title: 'Process maturity', detail: 'Long-term practice improves sequencing, communication, and error prevention.' },
      { title: 'Strategic confidence', detail: 'Clients benefit from judgment built through diverse real-world scenarios.' },
    ],
  },
};

function fallbackTheme(slug: string): AboutUsSignatureTheme {
  const label = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    badge: 'About Us',
    heroLead: 'A premium advisory page focused on trust, legal quality, and execution clarity.',
    variant: 'advisory',
    stats: [
      { value: 'Premium', label: 'Service model' },
      { value: 'Structured', label: 'Delivery approach' },
      { value: label, label: 'Featured topic' },
    ],
    pillars: [
      { title: 'Strategic clarity', detail: 'Clients get clear steps and realistic decision frameworks.' },
      { title: 'Compliance discipline', detail: 'Legal precision is embedded in every phase of delivery.' },
      { title: 'Outcome focus', detail: 'Execution remains anchored on measurable client results.' },
    ],
  };
}

export function getAboutUsSignatureTheme(slug: string): AboutUsSignatureTheme {
  return themes[slug] || fallbackTheme(slug);
}
