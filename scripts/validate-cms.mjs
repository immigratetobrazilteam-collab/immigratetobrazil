import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

function fail(message) {
  console.error(`CMS validation failed: ${message}`);
  process.exit(1);
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function readJson(relativePath) {
  const full = path.join(root, relativePath);
  const raw = await readFile(full, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    fail(`${relativePath} is not valid JSON`);
  }
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function extractUniqueMatches(text, regex) {
  const out = new Set();
  let m;
  while ((m = regex.exec(text)) !== null) {
    out.add(m[1]);
  }
  return out;
}

function validateStateTemplateSection(locale, sectionName, section, keyName) {
  assert(isObject(section), `state-copy/${locale}.json templates.${sectionName} must be an object`);
  assert(isNonEmptyString(section.title), `state-copy/${locale}.json templates.${sectionName}.title is required`);
  assert(isNonEmptyString(section.subtitle), `state-copy/${locale}.json templates.${sectionName}.subtitle is required`);
  assert(Array.isArray(section[keyName]) && section[keyName].length >= 3, `state-copy/${locale}.json templates.${sectionName}.${keyName} must have at least 3 items`);

  for (const [idx, item] of section[keyName].entries()) {
    assert(isObject(item), `state-copy/${locale}.json templates.${sectionName}.${keyName}[${idx}] must be an object`);
    if (keyName === 'qa') {
      assert(isNonEmptyString(item.q), `state-copy/${locale}.json templates.${sectionName}.qa[${idx}].q is required`);
      assert(isNonEmptyString(item.a), `state-copy/${locale}.json templates.${sectionName}.qa[${idx}].a is required`);
    } else {
      assert(isNonEmptyString(item.title), `state-copy/${locale}.json templates.${sectionName}.${keyName}[${idx}].title is required`);
      assert(isNonEmptyString(item.detail), `state-copy/${locale}.json templates.${sectionName}.${keyName}[${idx}].detail is required`);
    }
  }
}

function validateOverrideSection(locale, overrideIdx, sectionName, section, keyName) {
  if (section == null) return;
  assert(isObject(section), `state-copy/${locale}.json overrides[${overrideIdx}].${sectionName} must be an object`);

  if (section.title != null) assert(isNonEmptyString(section.title), `state-copy/${locale}.json overrides[${overrideIdx}].${sectionName}.title must be non-empty`);
  if (section.subtitle != null) assert(isNonEmptyString(section.subtitle), `state-copy/${locale}.json overrides[${overrideIdx}].${sectionName}.subtitle must be non-empty`);

  const items = section[keyName];
  if (items == null) return;

  assert(Array.isArray(items) && items.length >= 1, `state-copy/${locale}.json overrides[${overrideIdx}].${sectionName}.${keyName} must be a non-empty array`);

  for (const [itemIdx, item] of items.entries()) {
    assert(isObject(item), `state-copy/${locale}.json overrides[${overrideIdx}].${sectionName}.${keyName}[${itemIdx}] must be an object`);
    if (keyName === 'qa') {
      assert(isNonEmptyString(item.q), `state-copy/${locale}.json overrides[${overrideIdx}].${sectionName}.qa[${itemIdx}].q is required`);
      assert(isNonEmptyString(item.a), `state-copy/${locale}.json overrides[${overrideIdx}].${sectionName}.qa[${itemIdx}].a is required`);
    } else {
      assert(isNonEmptyString(item.title), `state-copy/${locale}.json overrides[${overrideIdx}].${sectionName}.${keyName}[${itemIdx}].title is required`);
      assert(isNonEmptyString(item.detail), `state-copy/${locale}.json overrides[${overrideIdx}].${sectionName}.${keyName}[${itemIdx}].detail is required`);
    }
  }
}

function validateManagedPagesValue(relativePath, fieldPath, value, template) {
  if (typeof template === 'string') {
    assert(isNonEmptyString(value), `${relativePath} ${fieldPath} must be a non-empty string`);
    return;
  }

  if (typeof template === 'boolean') {
    assert(typeof value === 'boolean', `${relativePath} ${fieldPath} must be a boolean`);
    return;
  }

  if (typeof template === 'number') {
    assert(typeof value === 'number' && Number.isFinite(value), `${relativePath} ${fieldPath} must be a finite number`);
    return;
  }

  if (Array.isArray(template)) {
    assert(Array.isArray(value), `${relativePath} ${fieldPath} must be an array`);
    if (template.length === 0) {
      return;
    }

    assert(value.length >= 1, `${relativePath} ${fieldPath} must include at least one item`);
    const sample = template[0];

    for (const [idx, item] of value.entries()) {
      validateManagedPagesValue(relativePath, `${fieldPath}[${idx}]`, item, sample);
    }

    return;
  }

  assert(isObject(template), `${relativePath} ${fieldPath} template must be an object`);
  assert(isObject(value), `${relativePath} ${fieldPath} must be an object`);

  for (const key of Object.keys(template)) {
    assert(
      Object.prototype.hasOwnProperty.call(value, key),
      `${relativePath} ${fieldPath}.${key} is missing (must match English managedPages schema)`,
    );
    validateManagedPagesValue(relativePath, `${fieldPath}.${key}`, value[key], template[key]);
  }
}

async function validateStateCopy(expectedStateSlugs) {
  for (const locale of ['en', 'es', 'pt', 'fr']) {
    const file = await readJson(`content/cms/state-copy/${locale}.json`);

    assert(file.locale === locale, `state-copy/${locale}.json locale must be '${locale}'`);
    assert(isObject(file.templates), `state-copy/${locale}.json templates is required`);

    validateStateTemplateSection(locale, 'contact', file.templates.contact, 'cards');
    validateStateTemplateSection(locale, 'faq', file.templates.faq, 'qa');
    validateStateTemplateSection(locale, 'services', file.templates.services, 'modules');
    validateStateTemplateSection(locale, 'blog', file.templates.blog, 'sections');

    assert(Array.isArray(file.overrides), `state-copy/${locale}.json overrides must be an array`);

    const seenOverrides = new Set();
    for (const [idx, override] of file.overrides.entries()) {
      assert(isObject(override), `state-copy/${locale}.json overrides[${idx}] must be an object`);
      assert(isNonEmptyString(override.slug), `state-copy/${locale}.json overrides[${idx}].slug is required`);
      assert(expectedStateSlugs.has(override.slug), `state-copy/${locale}.json overrides[${idx}].slug '${override.slug}' is not a known state slug`);
      assert(!seenOverrides.has(override.slug), `state-copy/${locale}.json has duplicate override slug '${override.slug}'`);
      seenOverrides.add(override.slug);

      validateOverrideSection(locale, idx, 'contact', override.contact, 'cards');
      validateOverrideSection(locale, idx, 'faq', override.faq, 'qa');
      validateOverrideSection(locale, idx, 'services', override.services, 'modules');
      validateOverrideSection(locale, idx, 'blog', override.blog, 'sections');
    }
  }
}

async function validatePolicies(expectedPolicySlugs) {
  for (const locale of ['en', 'es', 'pt', 'fr']) {
    const file = await readJson(`content/cms/policies/${locale}.json`);

    assert(file.locale === locale, `policies/${locale}.json locale must be '${locale}'`);
    assert(Array.isArray(file.policies), `policies/${locale}.json policies must be an array`);

    const seen = new Set();

    for (const [idx, policy] of file.policies.entries()) {
      assert(isObject(policy), `policies/${locale}.json policies[${idx}] must be an object`);
      assert(isNonEmptyString(policy.slug), `policies/${locale}.json policies[${idx}].slug is required`);
      assert(expectedPolicySlugs.has(policy.slug), `policies/${locale}.json policies[${idx}].slug '${policy.slug}' is not allowed`);
      assert(!seen.has(policy.slug), `policies/${locale}.json duplicate slug '${policy.slug}'`);
      seen.add(policy.slug);

      assert(isNonEmptyString(policy.title), `policies/${locale}.json policies[${idx}].title is required`);
      assert(Array.isArray(policy.paragraphs) && policy.paragraphs.length >= 3, `policies/${locale}.json policies[${idx}].paragraphs must have at least 3 entries`);

      for (const [pidx, paragraph] of policy.paragraphs.entries()) {
        assert(isNonEmptyString(paragraph), `policies/${locale}.json policies[${idx}].paragraphs[${pidx}] must be non-empty`);
      }
    }

    for (const slug of expectedPolicySlugs) {
      assert(seen.has(slug), `policies/${locale}.json missing required slug '${slug}'`);
    }
  }
}

async function validateSiteCopy() {
  const englishFile = await readJson('content/cms/site-copy/en.json');
  assert(isObject(englishFile.managedPages), 'site-copy/en.json managedPages must be an object');
  const managedPagesTemplate = englishFile.managedPages;

  for (const locale of ['en', 'es', 'pt', 'fr']) {
    const relativePath = `content/cms/site-copy/${locale}.json`;
    const file = locale === 'en' ? englishFile : await readJson(relativePath);

    assert(file.locale === locale, `site-copy/${locale}.json locale must be '${locale}'`);
    assert(isNonEmptyString(file.brand), `site-copy/${locale}.json brand is required`);

    assert(isObject(file.nav), `site-copy/${locale}.json nav must be an object`);
    for (const key of ['home', 'about', 'services', 'process', 'resources', 'blog', 'faq', 'library', 'contact']) {
      assert(isNonEmptyString(file.nav[key]), `site-copy/${locale}.json nav.${key} is required`);
    }

    assert(isObject(file.hero), `site-copy/${locale}.json hero must be an object`);
    for (const key of ['eyebrow', 'title', 'subtitle', 'primaryCta', 'secondaryCta', 'highlightsTitle']) {
      assert(isNonEmptyString(file.hero[key]), `site-copy/${locale}.json hero.${key} is required`);
    }
    assert(Array.isArray(file.hero.highlights) && file.hero.highlights.length >= 3, `site-copy/${locale}.json hero.highlights must have at least 3 items`);
    for (const [idx, item] of file.hero.highlights.entries()) {
      assert(isNonEmptyString(item), `site-copy/${locale}.json hero.highlights[${idx}] must be non-empty`);
    }

    assert(isObject(file.sections), `site-copy/${locale}.json sections must be an object`);
    for (const key of [
      'servicesTitle',
      'servicesSubtitle',
      'processTitle',
      'processSubtitle',
      'trustTitle',
      'migrationTitle',
      'migrationSubtitle',
      'blogTitle',
      'blogSubtitle',
    ]) {
      assert(isNonEmptyString(file.sections[key]), `site-copy/${locale}.json sections.${key} is required`);
    }

    assert(isObject(file.cta), `site-copy/${locale}.json cta must be an object`);
    for (const key of ['title', 'subtitle', 'button']) {
      assert(isNonEmptyString(file.cta[key]), `site-copy/${locale}.json cta.${key} is required`);
    }

    assert(isObject(file.contact), `site-copy/${locale}.json contact must be an object`);
    for (const key of ['title', 'subtitle', 'consultation', 'whatsapp', 'email']) {
      assert(isNonEmptyString(file.contact[key]), `site-copy/${locale}.json contact.${key} is required`);
    }

    assert(isObject(file.footer), `site-copy/${locale}.json footer must be an object`);
    for (const key of ['tagline', 'legal']) {
      assert(isNonEmptyString(file.footer[key]), `site-copy/${locale}.json footer.${key} is required`);
    }

    assert(isObject(file.headerNavigation), `site-copy/${locale}.json headerNavigation must be an object`);
    for (const key of ['brandTagline', 'allPagesButton']) {
      assert(isNonEmptyString(file.headerNavigation[key]), `site-copy/${locale}.json headerNavigation.${key} is required`);
    }
    assert(Array.isArray(file.headerNavigation.quickLinks) && file.headerNavigation.quickLinks.length >= 3, `site-copy/${locale}.json headerNavigation.quickLinks must have at least 3 items`);
    for (const [idx, link] of file.headerNavigation.quickLinks.entries()) {
      assert(isObject(link), `site-copy/${locale}.json headerNavigation.quickLinks[${idx}] must be an object`);
      assert(isNonEmptyString(link.href), `site-copy/${locale}.json headerNavigation.quickLinks[${idx}].href is required`);
      assert(isNonEmptyString(link.label), `site-copy/${locale}.json headerNavigation.quickLinks[${idx}].label is required`);
    }
    assert(isObject(file.headerNavigation.menuLabels), `site-copy/${locale}.json headerNavigation.menuLabels must be an object`);
    for (const key of ['aboutBrazil', 'aboutStates', 'services', 'resources', 'discover', 'blogByState', 'faqByState', 'contactByState']) {
      assert(isNonEmptyString(file.headerNavigation.menuLabels[key]), `site-copy/${locale}.json headerNavigation.menuLabels.${key} is required`);
    }
    assert(isObject(file.headerNavigation.sectionLabels), `site-copy/${locale}.json headerNavigation.sectionLabels must be an object`);
    for (const key of [
      'aboutBrazil',
      'aboutStates',
      'servicesCore',
      'servicesStates',
      'resourcesHubs',
      'resourcesPolicy',
      'discoverRegions',
      'discoverStates',
      'blogStates',
      'faqStates',
      'contactChannels',
      'contactStates',
    ]) {
      assert(isNonEmptyString(file.headerNavigation.sectionLabels[key]), `site-copy/${locale}.json headerNavigation.sectionLabels.${key} is required`);
    }
    assert(isObject(file.headerNavigation.regionLabels), `site-copy/${locale}.json headerNavigation.regionLabels must be an object`);
    for (const key of ['north', 'northeast', 'centralWest', 'southeast', 'south']) {
      assert(isNonEmptyString(file.headerNavigation.regionLabels[key]), `site-copy/${locale}.json headerNavigation.regionLabels.${key} is required`);
    }
    assert(isObject(file.headerNavigation.links), `site-copy/${locale}.json headerNavigation.links must be an object`);
    for (const key of [
      'aboutBrazilHub',
      'applyBrazil',
      'costOfLiving',
      'aboutStatesHub',
      'aboutUs',
      'values',
      'mission',
      'story',
      'visaServices',
      'visaCategories',
      'residencyServices',
      'naturalisationServices',
      'legalServices',
      'homeArchive',
      'policies',
      'cookies',
      'disclaimers',
      'gdpr',
      'privacy',
      'refund',
      'terms',
      'xmlSitemap',
      'discoverRegionsHub',
      'discoverStatesHub',
      'blogByStateHub',
      'faqByStateHub',
      'contactByStateHub',
    ]) {
      assert(isNonEmptyString(file.headerNavigation.links[key]), `site-copy/${locale}.json headerNavigation.links.${key} is required`);
    }

    assert(isObject(file.footerNavigation), `site-copy/${locale}.json footerNavigation must be an object`);
    for (const key of [
      'dropdownTitle',
      'aboutUsPagesTitle',
      'aboutBrazilPagesTitle',
      'supportTitle',
      'stateAbout',
      'stateServices',
      'stateContact',
      'stateBlog',
      'stateFaq',
      'allPages',
      'aboutUsHub',
      'aboutBrazilHub',
      'festivalsHub',
      'foodHub',
      'aboutBrazilCoreTitle',
      'aboutBrazilFestivalsTitle',
      'aboutBrazilFoodTitle',
      'menuAboutBrazil',
      'menuAboutStates',
      'menuServices',
      'menuResources',
      'menuDiscover',
      'menuBlog',
      'menuFaq',
      'menuContact',
      'contactBoxTitle',
      'rightsReserved',
    ]) {
      assert(isNonEmptyString(file.footerNavigation[key]), `site-copy/${locale}.json footerNavigation.${key} is required`);
    }

    assert(isObject(file.floatingActions), `site-copy/${locale}.json floatingActions must be an object`);
    for (const key of ['whatsapp', 'whatsappTag', 'top']) {
      assert(isNonEmptyString(file.floatingActions[key]), `site-copy/${locale}.json floatingActions.${key} is required`);
    }

    assert(isObject(file.upgradeNotice), `site-copy/${locale}.json upgradeNotice must be an object`);
    assert(typeof file.upgradeNotice.enabled === 'boolean', `site-copy/${locale}.json upgradeNotice.enabled must be boolean`);
    for (const key of ['eyebrow', 'title', 'body', 'whatsappButton', 'emailButton']) {
      assert(isNonEmptyString(file.upgradeNotice[key]), `site-copy/${locale}.json upgradeNotice.${key} is required`);
    }

    assert(isObject(file.homeContentMap), `site-copy/${locale}.json homeContentMap must be an object`);
    assert(isNonEmptyString(file.homeContentMap.eyebrow), `site-copy/${locale}.json homeContentMap.eyebrow is required`);
    assert(isNonEmptyString(file.homeContentMap.heading), `site-copy/${locale}.json homeContentMap.heading is required`);
    assert(Array.isArray(file.homeContentMap.links) && file.homeContentMap.links.length >= 3, `site-copy/${locale}.json homeContentMap.links must have at least 3 items`);
    for (const [idx, link] of file.homeContentMap.links.entries()) {
      assert(isObject(link), `site-copy/${locale}.json homeContentMap.links[${idx}] must be an object`);
      assert(isNonEmptyString(link.href), `site-copy/${locale}.json homeContentMap.links[${idx}].href is required`);
      assert(link.href.startsWith('/'), `site-copy/${locale}.json homeContentMap.links[${idx}].href must start with '/'`);
      assert(isNonEmptyString(link.label), `site-copy/${locale}.json homeContentMap.links[${idx}].label is required`);
    }

    assert(Array.isArray(file.trustStats) && file.trustStats.length >= 3, `site-copy/${locale}.json trustStats must have at least 3 entries`);
    for (const [idx, stat] of file.trustStats.entries()) {
      assert(isObject(stat), `site-copy/${locale}.json trustStats[${idx}] must be an object`);
      assert(isNonEmptyString(stat.value), `site-copy/${locale}.json trustStats[${idx}].value is required`);
      assert(isNonEmptyString(stat.label), `site-copy/${locale}.json trustStats[${idx}].label is required`);
    }

    assert(Array.isArray(file.serviceCards) && file.serviceCards.length >= 3, `site-copy/${locale}.json serviceCards must have at least 3 entries`);
    for (const [idx, card] of file.serviceCards.entries()) {
      assert(isObject(card), `site-copy/${locale}.json serviceCards[${idx}] must be an object`);
      for (const key of ['slug', 'title', 'description']) {
        assert(isNonEmptyString(card[key]), `site-copy/${locale}.json serviceCards[${idx}].${key} is required`);
      }
      assert(Array.isArray(card.highlights) && card.highlights.length >= 1, `site-copy/${locale}.json serviceCards[${idx}].highlights must have at least 1 entry`);
      for (const [hidx, highlight] of card.highlights.entries()) {
        assert(isNonEmptyString(highlight), `site-copy/${locale}.json serviceCards[${idx}].highlights[${hidx}] must be non-empty`);
      }
    }

    assert(Array.isArray(file.processSteps) && file.processSteps.length >= 3, `site-copy/${locale}.json processSteps must have at least 3 entries`);
    for (const [idx, step] of file.processSteps.entries()) {
      assert(isObject(step), `site-copy/${locale}.json processSteps[${idx}] must be an object`);
      assert(isNonEmptyString(step.title), `site-copy/${locale}.json processSteps[${idx}].title is required`);
      assert(isNonEmptyString(step.description), `site-copy/${locale}.json processSteps[${idx}].description is required`);
    }

    assert(Array.isArray(file.blogHighlights) && file.blogHighlights.length >= 3, `site-copy/${locale}.json blogHighlights must have at least 3 entries`);
    for (const [idx, item] of file.blogHighlights.entries()) {
      assert(isObject(item), `site-copy/${locale}.json blogHighlights[${idx}] must be an object`);
      for (const key of ['slug', 'title', 'summary']) {
        assert(isNonEmptyString(item[key]), `site-copy/${locale}.json blogHighlights[${idx}].${key} is required`);
      }
    }

    assert(isObject(file.managedPages), `site-copy/${locale}.json managedPages must be an object`);
    validateManagedPagesValue(relativePath, 'managedPages', file.managedPages, managedPagesTemplate);
  }
}

async function validateSiteSettings() {
  const relativePath = 'content/cms/settings/site-settings.json';
  const file = await readJson(relativePath);

  assert(isObject(file.brand), `${relativePath} brand must be an object`);
  for (const key of ['name', 'logoAlt', 'logoMarkPath', 'logoFullPath', 'logoSchemaPath', 'ogImagePath']) {
    assert(isNonEmptyString(file.brand[key]), `${relativePath} brand.${key} is required`);
  }

  assert(isObject(file.contact), `${relativePath} contact must be an object`);
  for (const key of [
    'primaryEmail',
    'consultationEmail',
    'clientEmail',
    'whatsappNumber',
    'whatsappLink',
    'whatsappProfileImage',
    'formspreeEndpoint',
  ]) {
    assert(isNonEmptyString(file.contact[key]), `${relativePath} contact.${key} is required`);
  }
  assert(file.contact.whatsappLink.startsWith('https://'), `${relativePath} contact.whatsappLink must start with https://`);
  assert(file.contact.formspreeEndpoint.startsWith('https://'), `${relativePath} contact.formspreeEndpoint must start with https://`);

  assert(isObject(file.seo), `${relativePath} seo must be an object`);
  assert(isNonEmptyString(file.seo.googleSiteVerification), `${relativePath} seo.googleSiteVerification is required`);
}

async function validateLegacyOverrides() {
  for (const locale of ['en', 'es', 'pt', 'fr']) {
    const relativePath = `content/cms/legacy-overrides/${locale}.json`;
    const file = await readJson(relativePath);

    assert(file.locale === locale, `legacy-overrides/${locale}.json locale must be '${locale}'`);
    assert(isObject(file.ui), `legacy-overrides/${locale}.json ui must be an object`);
    for (const key of ['keyPointsTitle', 'pathTitle', 'relatedPagesTitle', 'exploreTitle', 'sourceLabel']) {
      assert(isNonEmptyString(file.ui[key]), `legacy-overrides/${locale}.json ui.${key} is required`);
    }

    assert(Array.isArray(file.ui.exploreLinks) && file.ui.exploreLinks.length >= 1, `legacy-overrides/${locale}.json ui.exploreLinks must have at least 1 item`);
    for (const [idx, link] of file.ui.exploreLinks.entries()) {
      assert(isObject(link), `legacy-overrides/${locale}.json ui.exploreLinks[${idx}] must be an object`);
      assert(isNonEmptyString(link.href), `legacy-overrides/${locale}.json ui.exploreLinks[${idx}].href is required`);
      assert(isNonEmptyString(link.label), `legacy-overrides/${locale}.json ui.exploreLinks[${idx}].label is required`);
    }

    assert(Array.isArray(file.pages), `legacy-overrides/${locale}.json pages must be an array`);
    const seen = new Set();

    for (const [idx, page] of file.pages.entries()) {
      assert(isObject(page), `legacy-overrides/${locale}.json pages[${idx}] must be an object`);
      assert(isNonEmptyString(page.slug), `legacy-overrides/${locale}.json pages[${idx}].slug is required`);
      assert(!seen.has(page.slug), `legacy-overrides/${locale}.json duplicate slug '${page.slug}'`);
      seen.add(page.slug);

      for (const key of ['title', 'description', 'heading', 'sourcePath', 'heroImage', 'heroImageAlt']) {
        if (page[key] != null) {
          assert(isNonEmptyString(page[key]), `legacy-overrides/${locale}.json pages[${idx}].${key} must be non-empty`);
        }
      }

      if (page.sections != null) {
        assert(Array.isArray(page.sections), `legacy-overrides/${locale}.json pages[${idx}].sections must be an array`);
        for (const [sidx, section] of page.sections.entries()) {
          assert(isObject(section), `legacy-overrides/${locale}.json pages[${idx}].sections[${sidx}] must be an object`);
          assert(isNonEmptyString(section.title), `legacy-overrides/${locale}.json pages[${idx}].sections[${sidx}].title is required`);
          assert(
            Array.isArray(section.paragraphs) && section.paragraphs.length >= 1,
            `legacy-overrides/${locale}.json pages[${idx}].sections[${sidx}].paragraphs must have at least 1 item`,
          );
          for (const [pidx, paragraph] of section.paragraphs.entries()) {
            assert(
              isNonEmptyString(paragraph),
              `legacy-overrides/${locale}.json pages[${idx}].sections[${sidx}].paragraphs[${pidx}] must be non-empty`,
            );
          }
        }
      }

      if (page.bullets != null) {
        assert(Array.isArray(page.bullets), `legacy-overrides/${locale}.json pages[${idx}].bullets must be an array`);
        for (const [bidx, bullet] of page.bullets.entries()) {
          assert(isNonEmptyString(bullet), `legacy-overrides/${locale}.json pages[${idx}].bullets[${bidx}] must be non-empty`);
        }
      }
    }
  }
}

async function main() {
  const statesTs = await readText('content/curated/states.ts');
  const policyTs = await readText('lib/policy-slugs.ts');

  const expectedStateSlugs = extractUniqueMatches(statesTs, /slug:\s*'([^']+)'/g);
  const expectedPolicySlugs = extractUniqueMatches(policyTs, /'([^']+)'/g);

  assert(expectedStateSlugs.size >= 27, 'could not load expected state slugs from content/curated/states.ts');
  assert(expectedPolicySlugs.size >= 6, 'could not load expected policy slugs from lib/policy-slugs.ts');

  await validateStateCopy(expectedStateSlugs);
  await validatePolicies(expectedPolicySlugs);
  await validateSiteCopy();
  await validateSiteSettings();
  await validateLegacyOverrides();

  console.log('CMS validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
