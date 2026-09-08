import json,collections,csv,re,urllib.parse
from pathlib import Path
O=Path('docs/seo-audit-2026-09-08'); L=json.loads((O/'local-evidence.json').read_text()); D=json.loads((O/'live-evidence.json').read_text());S=json.loads((O/'sitemap-evidence.json').read_text())
B='https://immigratetobrazil.com'
def norm(u):return B+'/' if u==B else u
D={norm(u):d for u,d in D.items()}; urls=set(D);incoming=collections.defaultdict(set);edges=[]
for u,d in D.items():
 for v in d.get('live',{}).get('links',[]):
  v=norm(v);incoming[v].add(u);edges.append({'source':u,'target':v,'target_in_inventory':v in urls})
depth={B+'/':0};q=collections.deque(depth)
while q:
 u=q.popleft()
 for v in D[u].get('live',{}).get('links',[]):
  v=norm(v)
  if v in D and v not in depth:depth[v]=depth[u]+1;q.append(v)
issues=[];inventory=[];sset={norm(u) for u in S['urls']}
for u,d in D.items():
 x=d.get('live',{});local=L.get(u,{}).get('local',{});path=urllib.parse.urlparse(u).path;parts=path.strip('/').split('/');base=path.removeprefix('/pt-br');parts2=base.strip('/').split('/');section=parts2[0] or 'home';ptype='article' if section=='insights' and len(parts2)>2 else 'country guide' if section=='countries' and len(parts2)>1 else 'city guide' if '/brazil/cities/' in base and len(parts2)>2 else 'service' if section=='services' else section
 action='OPTIMIZE'
 if 'noindex' in x.get('robots',''):action='NOINDEX'
 elif ptype in ['article','country guide']:action='EXPAND' if ptype=='country guide' else 'INVESTIGATE FURTHER'
 elif base in ['/countries/brazil/','/services/visas/educational/','/services/residencies/educational/']:action='INVESTIGATE FURTHER'
 elif 'google55' in path:action='KEEP'
 h1=local.get('h1',[])
 inventory.append(dict(url=u,file=L.get(u,{}).get('file',''),status=d.get('status','UNKNOWN'),final_url=d.get('final_url',''),indexability='NOINDEX' if 'noindex' in x.get('robots','')+d.get('x_robots','') else 'POTENTIALLY INDEXABLE; Google state unavailable',robots=x.get('robots',''),x_robots=d.get('x_robots',''),canonical=x.get('canonical',''),google_selected_canonical='NOT PROVIDED',page_type=ptype,language=x.get('lang',''),title=x.get('title',''),h1=' | '.join(h1),description=x.get('description',''),purpose=(x.get('paragraphs') or [''])[0],main_words=x.get('words',0),internal_in=len(incoming[u]),internal_out=len(x.get('links',[])),click_depth=depth.get(u,'UNREACHED IN RAW HTML'),sitemap=u in sset,performance='NOT PROVIDED',apparent_topic=x.get('title','').split(' | ')[0],action=action,evidence='OBSERVED HTTP and HTML; INFERENCE topic/action'))
 if x.get('canonical') and norm(x['canonical'])!=norm(d.get('final_url','')):issues.append(dict(url=u,type='canonical differs from final URL',detail=x['canonical']))
 for lang,v in x.get('hreflang',{}).items():
  v=norm(v)
  if v not in D:issues.append(dict(url=u,type='hreflang missing target',detail=v))
  elif lang!='x-default' and norm(u) not in {norm(z) for z in D[v].get('live',{}).get('hreflang',{}).values()}:issues.append(dict(url=u,type='nonreciprocal hreflang',detail=v))
 for er in x.get('schema_errors',[]):issues.append(dict(url=u,type='invalid JSON-LD',detail=er))
def csvout(name,rows,fields=None):
 with (O/name).open('w') as f:
  w=csv.DictWriter(f,fieldnames=fields or list(rows[0]) if rows else fields or ['none']);w.writeheader();w.writerows(rows)
csvout('02-url-inventory.csv',sorted(inventory,key=lambda x:x['url']));csvout('internal-link-edges.csv',edges);csvout('technical-issues.csv',issues,['url','type','detail'])
# Repeated substantive paragraphs: exact matching, not a semantic-equivalence claim.
para=collections.defaultdict(set)
for u,d in D.items():
 for p in d.get('live',{}).get('paragraphs',[]):
  if len(p.split())>=20:para[p].add(u)
repeated=[{'paragraph':p,'pages':len(v),'urls':' | '.join(sorted(v))} for p,v in para.items() if len(v)>3]
csvout('repeated-paragraphs.csv',sorted(repeated,key=lambda x:-x['pages']))
summary=dict(urls=len(D),sitemap_urls=len(sset),status=dict(collections.Counter(d.get('status','error') for d in D.values())),types=dict(collections.Counter(x['page_type'] for x in inventory)),actions=dict(collections.Counter(x['action'] for x in inventory)),unreached=[x['url'] for x in inventory if isinstance(x['click_depth'],str)],zero_inlinks=[x['url'] for x in inventory if not x['internal_in']],max_depth=max(depth.values()),issues=len(issues),repeated_paragraphs=len(repeated))
(O/'audit-summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2)[:6500])
