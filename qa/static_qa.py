#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {'.git', 'node_modules', 'test-results', 'playwright-report'}

class AuditParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.refs=[]; self.buttons=[]; self.controls=[]; self.labels_for=set(); self.label_depth=0
        self.has_viewport=False; self.has_title=False; self.has_description=False; self.blank_links=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); tag=tag.lower()
        if a.get('id'): self.ids.append(a['id'])
        if tag=='meta' and a.get('name','').lower()=='viewport': self.has_viewport=True
        if tag=='meta' and a.get('name','').lower()=='description': self.has_description=True
        if tag=='title': self.has_title=True
        if tag=='label':
            self.label_depth+=1
            if a.get('for'): self.labels_for.add(a['for'])
        if tag in ('input','select','textarea') and a.get('type','').lower()!='hidden':
            self.controls.append((tag,a.get('id'),self.label_depth>0,a.get('aria-label'),a.get('name')))
        if tag=='button': self.buttons.append({'text':False,'aria':a.get('aria-label') or a.get('title')})
        if tag in ('a','link') and a.get('href'): self.refs.append(('href',a['href']))
        if tag in ('script','img','iframe','source') and a.get('src'): self.refs.append(('src',a['src']))
        if tag=='a' and a.get('target')=='_blank': self.blank_links.append((a.get('href',''),set((a.get('rel') or '').split())))
    def handle_endtag(self, tag):
        if tag.lower()=='label' and self.label_depth: self.label_depth-=1
    def handle_data(self, data):
        if self.buttons and data.strip(): self.buttons[-1]['text']=True

def local_target(current:Path, ref:str):
    ref=ref.strip()
    if not ref or ref.startswith(('#','mailto:','tel:','javascript:','data:')) or '://' in ref or ref.startswith('//'): return None
    path=unquote(urlsplit(ref).path)
    if not path: return None
    target=(ROOT / path.lstrip('/')) if path.startswith('/') else (current.parent / path)
    if target.suffix=='': target=target/'index.html'
    return target.resolve()

def ignored(path:Path): return any(part in SKIP_DIRS for part in path.parts)

errors=[]; warnings=[]; files=[p for p in ROOT.rglob('*.html') if not ignored(p)]
for file in files:
    rel=file.relative_to(ROOT); p=AuditParser()
    try: p.feed(file.read_text(encoding='utf-8'))
    except Exception as exc: errors.append(f'{rel}: HTML parser error: {exc}'); continue
    dup=sorted({i for i in p.ids if p.ids.count(i)>1})
    if dup: errors.append(f'{rel}: duplicate ids: {", ".join(dup)}')
    if not p.has_viewport: errors.append(f'{rel}: missing viewport meta')
    if not p.has_title: errors.append(f'{rel}: missing title')
    if not p.has_description: warnings.append(f'{rel}: missing meta description')
    for i,b in enumerate(p.buttons,1):
        if not b['text'] and not b['aria']: errors.append(f'{rel}: button #{i} has no accessible name')
    for tag,cid,nested,aria,name in p.controls:
        if not nested and not aria and not (cid and cid in p.labels_for): warnings.append(f'{rel}: {tag} {name or cid or "(unnamed)"} has no explicit label')
    for href,rels in p.blank_links:
        if not {'noopener','noreferrer'}.intersection(rels): warnings.append(f'{rel}: target=_blank without rel on {href}')
    for kind,ref in p.refs:
        target=local_target(file,ref)
        if target and ROOT in target.parents and not target.exists(): errors.append(f'{rel}: broken local {kind} {ref} -> {target.relative_to(ROOT)}')

print(f'QA static: {len(files)} HTML files audited')
for w in warnings: print('WARNING:',w)
if errors:
    for e in errors: print('ERROR:',e)
    print(f'FAILED: {len(errors)} errors, {len(warnings)} warnings')
    sys.exit(1)
print(f'PASSED: 0 errors, {len(warnings)} warnings')
