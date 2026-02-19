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

async function validateStateCopy(expectedStateSlugs) {
  for (const locale of ['en', 'es', 'pt']) {
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
  for (const locale of ['en', 'es', 'pt']) {
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

async function main() {
  const statesTs = await readText('content/curated/states.ts');
  const policyTs = await readText('lib/policy-slugs.ts');

  const expectedStateSlugs = extractUniqueMatches(statesTs, /slug:\s*'([^']+)'/g);
  const expectedPolicySlugs = extractUniqueMatches(policyTs, /'([^']+)'/g);

  assert(expectedStateSlugs.size >= 27, 'could not load expected state slugs from content/curated/states.ts');
  assert(expectedPolicySlugs.size >= 6, 'could not load expected policy slugs from lib/policy-slugs.ts');

  await validateStateCopy(expectedStateSlugs);
  await validatePolicies(expectedPolicySlugs);

  console.log('CMS validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
