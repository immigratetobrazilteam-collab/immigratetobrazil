export const ABOUT_BRAZIL_HUB_NAV_LINK_IDS = {
  discover: ['brazil_why_brazil', 'brazil_investment', 'brazil_economy', 'brazil_quality'],
  living: ['brazil_cost', 'brazil_housing', 'brazil_healthcare', 'brazil_education', 'brazil_safety'],
  regions: ['brazil_north', 'brazil_northeast', 'brazil_central_west', 'brazil_southeast', 'brazil_south'],
  states: ['brazil_directory'],
  cities: ['brazil_guides', 'brazil_municipalities', 'brazil_search'],
  culture: ['brazil_festivals', 'brazil_cuisine', 'brazil_events', 'brazil_blogs', 'brazil_faqs'],
} as const;

export function getAboutBrazilHubRequiredLinkIds() {
  return [
    ...ABOUT_BRAZIL_HUB_NAV_LINK_IDS.discover,
    ...ABOUT_BRAZIL_HUB_NAV_LINK_IDS.living,
    ...ABOUT_BRAZIL_HUB_NAV_LINK_IDS.regions,
    ...ABOUT_BRAZIL_HUB_NAV_LINK_IDS.states,
    ...ABOUT_BRAZIL_HUB_NAV_LINK_IDS.cities,
    ...ABOUT_BRAZIL_HUB_NAV_LINK_IDS.culture,
  ];
}
