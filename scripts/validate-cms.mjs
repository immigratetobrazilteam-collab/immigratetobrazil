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

function validateTitleDetailItems(relativePath, fieldPath, items, min = 1) {
  assert(Array.isArray(items) && items.length >= min, `${relativePath} ${fieldPath} must have at least ${min} items`);
  for (const [idx, item] of items.entries()) {
    assert(isObject(item), `${relativePath} ${fieldPath}[${idx}] must be an object`);
    assert(isNonEmptyString(item.title), `${relativePath} ${fieldPath}[${idx}].title is required`);
    assert(isNonEmptyString(item.detail), `${relativePath} ${fieldPath}[${idx}].detail is required`);
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
  for (const locale of ['en', 'es', 'pt', 'fr']) {
    const relativePath = `content/cms/site-copy/${locale}.json`;
    const file = await readJson(relativePath);

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
  }
}

async function validatePageCopy() {
  for (const locale of ['en', 'es', 'pt', 'fr']) {
    const relativePath = `content/cms/page-copy/${locale}.json`;
    const file = await readJson(relativePath);

    assert(file.locale === locale, `page-copy/${locale}.json locale must be '${locale}'`);

    assert(isObject(file.applyBrazil), `page-copy/${locale}.json applyBrazil must be an object`);
    for (const key of ['eyebrow', 'title', 'subtitle', 'checklistTitle', 'buttonLabel']) {
      assert(isNonEmptyString(file.applyBrazil[key]), `page-copy/${locale}.json applyBrazil.${key} is required`);
    }
    validateTitleDetailItems(relativePath, 'applyBrazil.steps', file.applyBrazil.steps, 3);
    assert(Array.isArray(file.applyBrazil.checklist) && file.applyBrazil.checklist.length >= 3, `page-copy/${locale}.json applyBrazil.checklist must have at least 3 items`);
    for (const [idx, item] of file.applyBrazil.checklist.entries()) {
      assert(isNonEmptyString(item), `page-copy/${locale}.json applyBrazil.checklist[${idx}] must be non-empty`);
    }

    assert(isObject(file.costOfLivingBrazil), `page-copy/${locale}.json costOfLivingBrazil must be an object`);
    for (const key of ['eyebrow', 'title', 'subtitle']) {
      assert(isNonEmptyString(file.costOfLivingBrazil[key]), `page-copy/${locale}.json costOfLivingBrazil.${key} is required`);
    }
    validateTitleDetailItems(relativePath, 'costOfLivingBrazil.cards', file.costOfLivingBrazil.cards, 3);

    assert(isObject(file.resourcesGuidesBrazil), `page-copy/${locale}.json resourcesGuidesBrazil must be an object`);
    for (const key of ['eyebrow', 'title', 'subtitle', 'legacyArchiveTitle', 'legacyArchiveSubtitle']) {
      assert(isNonEmptyString(file.resourcesGuidesBrazil[key]), `page-copy/${locale}.json resourcesGuidesBrazil.${key} is required`);
    }
    validateTitleDetailItems(relativePath, 'resourcesGuidesBrazil.items', file.resourcesGuidesBrazil.items, 3);

    assert(isObject(file.visaConsultation), `page-copy/${locale}.json visaConsultation must be an object`);
    for (const key of ['eyebrow', 'title', 'subtitle']) {
      assert(isNonEmptyString(file.visaConsultation[key]), `page-copy/${locale}.json visaConsultation.${key} is required`);
    }
    validateTitleDetailItems(relativePath, 'visaConsultation.blocks', file.visaConsultation.blocks, 3);
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
  await validatePageCopy();

  console.log('CMS validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
