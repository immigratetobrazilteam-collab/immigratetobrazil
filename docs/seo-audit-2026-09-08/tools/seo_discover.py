from pathlib import Path
from bs4 import BeautifulSoup
import requests,json,concurrent.futures,urllib.parse,collections,xml.etree.ElementTree as ET,time
ROOT=Path.cwd(); OUT=ROOT/'docs/seo-audit-2026-09-08'; BASE='https://immigratetobrazil.com'
exclude={'node_modules','.venv','.git','docs','reports','templates','partials','.codex-temp','path'}
files=[p for p in ROOT.rglob('*.html') if not exclude.intersection(p.relative_to(ROOT).parts)]
def extract(html,url):
 s=BeautifulSoup(html,'html.parser'); main=s.find('main') or s.body or s
 def meta(k):
  t=s.find('meta',attrs={'name':k}) or s.find('meta',attrs={'property':k});return t.get('content','') if t else ''
 can=s.find('link',rel='canonical'); schemas=[];errors=[]
 for t in s.find_all('script',type='application/ld+json'):
  try:schemas.append(json.loads(t.string or t.get_text()))
  except Exception as e:errors.append(str(e))
 headings=[{'level':t.name,'text':t.get_text(' ',strip=True)} for t in main.find_all(['h1','h2','h3'])]
 links=sorted(set(urllib.parse.urljoin(url,t['href']).split('#')[0] for t in s.find_all('a',href=True) if urllib.parse.urljoin(url,t['href']).startswith(BASE)))
 paras=[t.get_text(' ',strip=True) for t in main.find_all('p')]
 for t in main.find_all(['script','style','svg','nav','footer']):t.decompose()
 return dict(title=s.title.get_text(' ',strip=True) if s.title else '',description=meta('description'),robots=meta('robots'),canonical=can.get('href','') if can else '',lang=s.html.get('lang','') if s.html else '',h1=[x['text'] for x in headings if x['level']=='h1'],headings=headings,paragraphs=paras,words=len(main.get_text(' ',strip=True).split()),links=links,schemas=schemas,schema_errors=errors,hreflang={t.get('hreflang'):t.get('href') for t in s.find_all('link',hreflang=True)},og_image=meta('og:image'),og_title=meta('og:title'),images=[{'src':t.get('src',''),'alt':t.get('alt')} for t in main.find_all('img')],text=main.get_text(' ',strip=True))
rows={}
for p in files:
 rel=p.relative_to(ROOT).as_posix();route='/'+(rel[:-10] if rel.endswith('index.html') else rel);url=BASE+route
 rows[url]=dict(url=url,file=rel,local=extract(p.read_text(),url))
(OUT/'local-evidence.json').write_text(json.dumps(rows,ensure_ascii=False))
session=requests.Session();sm=set();sm_evidence=[]
def sitemap(url):
 try:
  r=session.get(url,timeout=30); sm_evidence.append({'url':url,'status':r.status_code});root=ET.fromstring(r.content)
  loc=[x.text for x in root.iter() if x.tag.endswith('loc')]
  if root.tag.endswith('sitemapindex'):
   for u in loc:sitemap(u)
  else:sm.update(loc)
 except Exception as e:sm_evidence.append({'url':url,'error':str(e)})
sitemap(BASE+'/sitemap.xml')
queue=set(rows)|sm; done={}
def fetch(u):
 try:
  r=requests.get(u,timeout=25);d=dict(url=u,status=r.status_code,final_url=r.url,redirects=[{'status':h.status_code,'url':h.url} for h in r.history],x_robots=r.headers.get('X-Robots-Tag',''),bytes=len(r.content))
  if 'text/html' in r.headers.get('Content-Type',''):d['live']=extract(r.text,r.url)
  return u,d
 except Exception as e:return u,dict(url=u,error=str(e))
while queue:
 batch=queue-set(done);queue=set()
 if not batch:break
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
  for u,d in ex.map(fetch,sorted(batch)):
   done[u]=d
   for v in d.get('live',{}).get('links',[]):
    parsed=urllib.parse.urlparse(v)
    if not parsed.query and (parsed.path.endswith('/') or parsed.path.endswith('.html')) and not exclude.intersection(parsed.path.split('/')) and v not in done:queue.add(v)
   if len(done)%100==0:print('Crawled',len(done),flush=True)
 (OUT/'live-evidence.json').write_text(json.dumps(done,ensure_ascii=False))
 if len(done)>5000:break
(OUT/'sitemap-evidence.json').write_text(json.dumps({'urls':sorted(sm),'fetches':sm_evidence},indent=2))
print('DONE',len(rows),len(done),len(sm),flush=True)
