"""Repair the saved proposal package and independently check every ledger entry.
Run from repository root. Does not edit production pages or deploy changes.
"""
from pathlib import Path
from collections import Counter, defaultdict
from urllib.parse import urlsplit
import csv, json, re, html, hashlib
P=Path('docs/seo-audit-2026-09-08')
def readcsv(name): return list(csv.DictReader((P/name).open()))
def writecsv(name, rows, fields=None):
 with (P/name).open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields or list(rows[0]));w.writeheader();w.writerows(rows)
ledger=readcsv('master-ledger.csv'); inventory=readcsv('02-url-inventory.csv'); assets=json.loads((P/'proposed-assets.json').read_text()); evidence=json.loads((P/'local-evidence.json').read_text())
byurl={a['url']:a for a in assets}; inv={a['url']:a for a in inventory}
issues=[]; changes=[]; unresolved=[]
for row in ledger:
 a=byurl[row['url']]; path=P/row['page_file']; text=path.read_text(); original=text
 # Remove a made-up query that was built by appending 'questions' to a title.
 text=re.sub(r'Secondary / long-tail candidates: \["[^\n]* questions"\]', 'Secondary / long-tail candidates: [] — no additional query evidence established; use the assigned topic.',text)
 title=a['title']; topic=a['h1'].split(' | ')[0]; ispt='/pt-br/' in row['url']; typ=inv[row['url']]['page_type']
 # Alternatives are hypotheses, never represented as measured SERP winners.
 if typ=='article':
  alternatives=('WITHHELD — recover the complete source and confirm the article’s subject.', 'WITHHELD — a title variation cannot repair missing article content.')
 else:
  candidates=[topic, topic+' | Monique Fernandes', topic+' | Immigrate to Brazil', ('Conheça: ' if ispt else 'Explore: ')+topic]
  alternatives=[]
  for candidate in candidates:
   if candidate!=title and candidate not in alternatives:alternatives.append(candidate)
   if len(alternatives)==2:break
 text=re.sub(r'^Alternative A:.*$', 'Alternative A: '+alternatives[0],text,flags=re.M)
 text=re.sub(r'^Alternative B:.*$', 'Alternative B: '+alternatives[1],text,flags=re.M)
 # Cloudflare's observed extension-normalized destination must match the proposal.
 if row['url'].endswith('/sitemap.html'):
  old=a['canonical']; new='https://immigratetobrazil.com/sitemap'; a['canonical']=new
  text=text.replace('Recommended URL: '+old,'Recommended URL: '+new).replace('Canonical: '+old,'Canonical: '+new)
  for key in ['metadata','schema']:
   f=P/row[key];f.write_text(f.read_text().replace(old,new))
 # Never imply a withheld rewrite has passed editorial QA.
 if 'SOURCE REVIEW' in row['status']:
  text=text.replace('AFTER title:', 'AFTER title (HOLD; not approved for publication):').replace('AFTER H1:', 'AFTER H1 (HOLD; not approved for publication):')
 if row['metadata']:
  f=P/row['metadata']; content=f.read_text()
  if '/assets/logo/logo.png' in content:content=content.replace('content="summary_large_image"','content="summary"')
  f.write_text(content)
 if text!=original:path.write_text(text);changes.append(row['url'])
 required=[row['page_file']]+[row[k] for k in ('metadata','schema') if row[k]]
 for name in required:
  if not (P/name).is_file():issues.append({'url':row['url'],'check':'missing artifact','detail':name})
 if row['schema']:
  try:
   schema=json.loads((P/row['schema']).read_text()); graph=schema.get('@graph',[])
   ids=[n['@id'] for n in graph if '@id' in n]
   if len(ids)!=len(set(ids)):issues.append({'url':row['url'],'check':'duplicate schema id','detail':str(ids)})
   for n in graph:
    if n.get('@type')=='BreadcrumbList':
     items=n['itemListElement']
     assert [x['position'] for x in items]==list(range(1,len(items)+1))
     for x in items:assert x['item'] in byurl or x['item']=='https://immigratetobrazil.com/sitemap'
    if n.get('@type') in ['Review','AggregateRating','FAQPage']:issues.append({'url':row['url'],'check':'unsupported schema','detail':n['@type']})
  except Exception as e:issues.append({'url':row['url'],'check':'schema validation','detail':str(e)})
 if 'DRAFT — editorial review required'!=row['status'] and not row['status'].startswith('UTILITY'):
  unresolved.append({'url':row['url'],'status':row['status'],'next_action': 'Recover the original full article and identify its distinct question before rewriting.' if typ=='article' else 'Complete the page-specific VERIFY and ADD instructions in '+row['page_file'], 'dossier':row['page_file']})
# Cross-page duplicates remain visible as source-content problems, not disguised with suffixes.
for field in ['title','description','h1']:
 groups=defaultdict(list)
 for a in assets:
  if 'noindex' not in a['robots']:groups[a[field]].append(a)
 for value,group in groups.items():
  if len(group)>1:
   for a in group:issues.append({'url':a['url'],'check':'duplicate '+field,'detail':value+' | '+ ('HELD SOURCE; NOT RELEASED' if 'SOURCE REVIEW' in a['state'] else 'REVIEW REQUIRED')})
links=readcsv('08-internal-link-plan.csv')
for row in links:
 for key in ['source','target']:
  if row[key] not in byurl:issues.append({'url':row['source'],'check':'unknown link '+key,'detail':row[key]})
 # Context identifies the actual subsection, not merely 'somewhere on the page'.
 target=row['target'];typ=inv.get(target,{}).get('page_type','');pt='/pt-br/' in row['source']
 if 'hub directory' not in row['location'].lower():
  if '/start-consultation/' in target:row['location']='Closing next-step paragraph after explaining scope; before the consultation request form.'
  elif '/services/residencies/' in target:row['location']='Paragraph distinguishing entry visas from residence authorization in Brazil.'
  elif '/services/visas/' in target:row['location']='Paragraph about applying from abroad and checking the relevant consular instructions.'
  elif '/about/profile/' in target:row['location']='Named lawyer / responsibility paragraph accompanying the service explanation.'
  elif '/countries/' in target:row['location']='Document-preparation paragraph discussing country of issue and current residence.'
  elif '/brazil/cities/' in target:row['location']='Relocation-planning paragraph after immigration pathway selection.'
  else:row['location']='Add immediately after the sentence introducing “'+row['anchor']+'”; add only if this subject belongs in the source page.'
 if inv.get(target,{}).get('page_type') in ['article','country guide']:row['status']='CONDITIONAL — source review / differentiation before adding promotion links'
writecsv('08-internal-link-plan.csv',links)
writecsv('qa-findings.csv',issues,['url','check','detail'])
writecsv('unfinished-editorial-ledger.csv',unresolved,['url','status','next_action','dossier'])
(P/'proposed-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
# Snapshot hashes identify changes since the original extraction and support reproducibility.
snapshot=[]
for row in inventory:
 f=Path(row['file'])
 snapshot.append({'url':row['url'],'file':row['file'],'sha256':hashlib.sha256(f.read_bytes()).hexdigest() if f.is_file() else 'MISSING'})
writecsv('source-manifest.csv',snapshot)
result={'urls':len(ledger),'dossiers':len(list((P/'pages').glob('*.md'))),'metadata':sum(bool(r['metadata']) for r in ledger),'schema':sum(bool(r['schema']) for r in ledger),'status_counts':dict(Counter(r['status'] for r in ledger)),'qa_findings':len(issues),'qa_checks':dict(Counter(r['check'] for r in issues)), 'editorial_dependencies':len(unresolved), 'production_files_changed':0,'deployment':'NOT PERFORMED','gsc':'NOT SUPPLIED','validation_scope':'All ledger artifacts, JSON syntax, breadcrumb positions and known targets, schema identifiers, duplicate proposals, internal link targets. Not a Google Rich Results Test or a legal review.'}
(P/'completion-summary.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
