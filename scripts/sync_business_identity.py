#!/usr/bin/env python3
"""Build-time sync for canonical business identity and page-level JSON-LD.

Run from the repository root after changing data/business-profile.json. The
script keeps page-specific Article/Service/Breadcrumb data intact while
normalizing shared entities and adding a canonical WebPage node where missing.
"""
from __future__ import annotations
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE = json.loads((ROOT / 'data/business-profile.json').read_text(encoding='utf-8'))
IDS = {
    'practice': 'https://monique-fernandes.com/#legal-practice',
    'person': 'https://monique-fernandes.com/#attorney',
    'contact': 'https://monique-fernandes.com/#primary-contact-point',
}
SITE_ID = 'https://immigratetobrazil.com#website'
HOURS = {'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 'opens': '06:00', 'closes': '22:00'}
ADDRESS = {'@type': 'PostalAddress', 'addressLocality': 'Londrina', 'addressRegion': 'PR', 'addressCountry': 'BR'}


class PageMetadata(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.lang = 'en'
        self.title = ''
        self.description = ''
        self.canonical = ''
        self.in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == 'html':
            self.lang = values.get('lang') or self.lang
        elif tag == 'title':
            self.in_title = True
        elif tag == 'meta' and values.get('name', '').lower() == 'description':
            self.description = values.get('content') or ''
        elif tag == 'link' and 'canonical' in (values.get('rel') or '').lower().split():
            self.canonical = values.get('href') or ''

    def handle_endtag(self, tag: str) -> None:
        if tag == 'title':
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data


def node_types(node: dict) -> set[str]:
    value = node.get('@type')
    return set(value) if isinstance(value, list) else {value} if isinstance(value, str) else set()


def update_schema(match: re.Match[str], meta: PageMetadata) -> str:
    try:
        data = json.loads(match.group(1))
    except json.JSONDecodeError:
        return match.group(0)
    nodes = data if isinstance(data, list) else [data]
    localized_description = PROFILE['descriptions']['standard_pt_br'] if meta.lang.lower() == 'pt-br' else PROFILE['descriptions']['standard']

    # Merge duplicate Organization + LegalService records for the same practice.
    orgs = [n for n in nodes if isinstance(n, dict) and n.get('@id') == IDS['practice'] and 'Organization' in node_types(n)]
    legal = next((n for n in nodes if isinstance(n, dict) and n.get('@id') == IDS['practice'] and 'LegalService' in node_types(n)), None)
    if legal is None and orgs:
        legal = orgs[0]
        legal['@type'] = 'LegalService'
    if legal is not None:
        for org in orgs:
            if org is not legal:
                for key, value in org.items():
                    if key not in {'@context', '@type', '@id'}:
                        legal.setdefault(key, value)
                nodes.remove(org)
        legal.update({
            'name': PROFILE['public_name'],
            'description': localized_description,
            'legalName': PROFILE['registered_business_name'],
            'taxID': PROFILE['cnpj_display'],
            'identifier': {'@type':'PropertyValue','propertyID':'CNPJ','value':PROFILE['cnpj']},
            'telephone': PROFILE['contact']['telephone_e164'],
            'email': PROFILE['contact']['email'],
            'address': ADDRESS,
            'openingHoursSpecification': HOURS,
            'paymentAccepted': ', '.join(PROFILE['payment_methods_confirmed']),
            'serviceType': 'Brazilian immigration legal services',
            'areaServed': {'@type':'Country','name':'Brazil'},
            'availableLanguage': PROFILE['consultation_languages'],
            'founder': {'@id':IDS['person']},
            'employee': {'@id':IDS['person']},
            'contactPoint': {'@id':IDS['contact']},
            'url': PROFILE['domains']['primary'],
            'sameAs': [PROFILE['domains']['primary'], PROFILE['domains']['specialist']],
        })
        if legal.get('provider', {}).get('@id') == IDS['practice']:
            legal.pop('provider', None)

    for node in nodes:
        if not isinstance(node, dict):
            continue
        types = node_types(node)
        if node.get('@id') == IDS['person'] and 'Person' in types:
            node.update({
                'name': PROFILE['public_name'],
                'legalName': PROFILE['legal_person_name'],
                'jobTitle': 'Brazilian Attorney',
                'identifier': {'@type':'PropertyValue','propertyID':'OAB/PR','value':'108.616'},
                'worksFor': {'@id':IDS['practice']},
                'knowsLanguage': PROFILE['consultation_languages'],
                'knowsAbout': ['Brazilian immigration law','Brazilian visas','Brazilian residence permits','Brazilian citizenship and naturalisation','Brazilian family law','Brazilian civil law','Civil litigation','Real estate contracts','Human rights law','Legal documentation'],
                'hasCredential': [
                    {'@type':'EducationalOccupationalCredential','name':q,'credentialCategory':'Academic qualification'}
                    for q in PROFILE['qualifications']
                ] + [{'@type':'EducationalOccupationalCredential','name':'OAB/PR registration 108.616','credentialCategory':'Professional legal registration in Brazil'}],
            })
        elif node.get('@id') == IDS['contact'] and 'ContactPoint' in types:
            node.update({'telephone':PROFILE['contact']['telephone_e164'],'email':PROFILE['contact']['email'],'availableLanguage':PROFILE['consultation_languages']})

    canonical = meta.canonical or PROFILE['domains']['specialist']
    webpage_id = canonical + '#webpage'
    if not any(isinstance(n, dict) and 'WebPage' in node_types(n) for n in nodes):
        main = next((n for n in nodes if isinstance(n, dict) and n.get('url') == canonical and ('Article' in node_types(n) or 'Service' in node_types(n))), None)
        breadcrumb = next((n for n in nodes if isinstance(n, dict) and 'BreadcrumbList' in node_types(n)), None)
        image = next((n for n in nodes if isinstance(n, dict) and 'ImageObject' in node_types(n) and n.get('representativeOfPage')), None)
        webpage = {
            '@context':'https://schema.org','@type':'WebPage','@id':webpage_id,
            'url':canonical,'name':re.sub(r'\s+',' ',meta.title).strip(),
            'description':meta.description,'isPartOf':{'@id':SITE_ID},
            'inLanguage':meta.lang,'mainEntity':{'@id':main.get('@id')} if main and main.get('@id') else {'@id':IDS['practice']},
        }
        if breadcrumb and breadcrumb.get('@id'):
            webpage['breadcrumb'] = {'@id':breadcrumb['@id']}
        if image and image.get('@id'):
            webpage['primaryImageOfPage'] = {'@id':image['@id']}
        nodes.append(webpage)

    # A number of templates already described the page as Article,
    # CollectionPage, AboutPage, or ContactPage. That is the same page entity,
    # so merge the shared WebPage properties instead of duplicating its @id.
    page_entity_types = {'WebPage','Article','CollectionPage','AboutPage','ContactPage','SearchResultsPage','ProfilePage'}
    existing_pages = [n for n in nodes if isinstance(n, dict) and (n.get('@id') == webpage_id or ('WebPage' in node_types(n) and n.get('url') == canonical)) and (node_types(n) & page_entity_types)]
    if len(existing_pages) > 1:
        primary = next((n for n in existing_pages if 'WebPage' not in node_types(n)), existing_pages[0])
        merged_types: list[str] = []
        for entity in existing_pages:
            for typ in (entity.get('@type') if isinstance(entity.get('@type'), list) else [entity.get('@type')]):
                if typ and typ not in merged_types:
                    merged_types.append(typ)
            if entity is not primary:
                for key, value in entity.items():
                    if key not in {'@context','@type','@id'}:
                        primary.setdefault(key, value)
                nodes.remove(entity)
        if 'WebPage' not in merged_types:
            merged_types.append('WebPage')
        primary['@type'] = merged_types
        primary['@id'] = webpage_id
    elif existing_pages:
        existing_pages[0]['@id'] = webpage_id

    result = nodes if isinstance(data, list) else nodes[0]
    return '<script type="application/ld+json">' + json.dumps(result, ensure_ascii=False, separators=(',',':')) + '</script>'


def sync_config(match: re.Match[str]) -> str:
    try:
        config = json.loads(match.group(1))
    except json.JSONDecodeError:
        return match.group(0)
    policy = config.get('consultationPolicy')
    if isinstance(policy, dict) and 'paymentMethods' in policy:
        policy['paymentMethods'] = PROFILE['payment_methods_confirmed']
    contact = config.get('contact')
    if isinstance(contact, dict):
        contact.update({'email':PROFILE['contact']['email'], 'phone':PROFILE['contact']['telephone_display']})
        if contact.get('whatsappUrl'):
            contact['whatsappUrl'] = re.sub(r'phone=\d+', 'phone='+PROFILE['contact']['telephone_e164'].lstrip('+'), contact['whatsappUrl'])
    return 'window.ITB_SITE = ' + json.dumps(config, ensure_ascii=False, separators=(',',':')) + ';'


def main() -> int:
    pages = updated = schema_pages = 0
    for path in ROOT.rglob('*.html'):
        if '.git' in path.parts or 'assets' in path.parts:
            continue
        pages += 1
        source = path.read_text(encoding='utf-8', errors='ignore')
        before = source
        meta = PageMetadata()
        meta.feed(source)
        source = re.sub(r'window\.ITB_SITE\s*=\s*(\{.*?\})\s*;', sync_config, source, flags=re.S)
        source, count = re.subn(r'<script\s+type=["\']application/ld\+json["\']\s*>(.*?)</script>', lambda m: update_schema(m, meta), source, flags=re.I|re.S)
        if count:
            schema_pages += 1
        if source != before:
            path.write_text(source, encoding='utf-8')
            updated += 1
    print(f'Synchronized {updated} pages ({schema_pages} with JSON-LD) from the canonical business profile.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
