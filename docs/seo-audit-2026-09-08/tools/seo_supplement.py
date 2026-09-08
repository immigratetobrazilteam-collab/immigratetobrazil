import json,re,html,requests,concurrent.futures
from pathlib import Path
O=Path('docs/seo-audit-2026-09-08'); D=json.loads((O/'local-evidence.json').read_text())
def clean(s):return ' '.join(html.unescape(re.sub('<[^>]+>',' ',s)).split())
def get(raw):
 return {'h1':[clean(x) for x in re.findall(r'<h1\b[^>]*>(.*?)</h1>',raw,re.S|re.I)],'hero_opening':[clean(x) for x in re.findall(r'<p\b[^>]*class="[^"]*hero-summary[^"]*"[^>]*>(.*?)</p>',raw,re.S|re.I)],'all_headings':[{'level':'h'+n,'text':clean(t)} for n,t in re.findall(r'<h([123])\b[^>]*>(.*?)</h\1>',raw,re.S|re.I)]}
for d in D.values():d['local'].update(get(Path(d['file']).read_text()))
(O/'local-evidence.json').write_text(json.dumps(D,ensure_ascii=False))
def f(u):
 try:
  r=requests.get(u,timeout=20);return u,dict(status=r.status_code,**get(r.text))
 except Exception as e:return u,{'error':str(e)}
R={}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
 for u,d in ex.map(f,D):R[u]=d
(O/'heading-live-evidence.json').write_text(json.dumps(R,ensure_ascii=False));print('Headings verified',len(R))
