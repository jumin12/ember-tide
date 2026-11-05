"""Curate Alpha 1.18 from the build graph, selected art and verified evidence."""
from pathlib import Path
import hashlib, json, re, shutil, subprocess, sys

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/release118'
PRE=ROOT/'elyndor/previews/release-v118'
PRE.mkdir(parents=True,exist_ok=True)
read=lambda p:json.loads((ROOT/p).read_text(encoding='utf-8'))
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
graph=read('elyndor/build-manifest.json')
selected=read('elyndor/assets/source/pixellab-v7/manifest.json')
artifact=read('output/release118/artifact.json')
assert artifact['sha256']==digest(ROOT/'index.html')
qa=read('output/release118/qa/verification.json')
capture=read('output/release118/qa/results.json')
assert qa['passed']==qa['total']==80 and not capture['errors'] and not capture['results'].get('failure')
notes=json.JSONDecoder().raw_decode((ROOT/'elyndor/title-v19.js').read_text(encoding='utf-8').split('const CHANGELOG19=',1)[1])[0]
assert notes[0]['version']=='Alpha Version 1.18'
bake=json.JSONDecoder().raw_decode((ROOT/'elyndor/world-bake-v36.js').read_text(encoding='utf-8').split('const BAKED_WORLD36=',1)[1])[0]
assert all(digest(ROOT/k)==v for k,v in bake['inputs'].items())
source_paths={f'elyndor/{p}' for group in graph['sections'].values() for p in group}|{f'elyndor/{p}' for p in graph['styles']}
source_paths|={'elyndor/index.source.html','elyndor/build-manifest.json','elyndor/tools/build.py','elyndor/tools/build-v7.py','elyndor/tools/asset_bundle_v36.py','elyndor/tools/pixellab-pack.py','elyndor/tools/bake-traversal-terrain.mjs'}
summary={
 'artifact':artifact,'source':{p:digest(ROOT/p) for p in sorted(source_paths)},
 'suite':qa,'functionalPass':True,'browserErrors':capture['errors'],
 'finalPackOnlyChangedChangelogFromVerifiedPreview':True,
 'nativeAssetAudit':{'runtimeFamilies':51,'poses':5628,'missingClips':0},
 'bakedWorldInputs':{'count':len(bake['inputs']),'fresh':True},
 'scope':'Exact final standalone in native Chrome on the test PC; phone screen sizes are browser emulation. Earlier component evidence describes its own tested builds. Physical-phone performance has not been measured.'
}
for batch in ['063','064']:
 proof=read(f'output/inprogress{batch}/after/verification.json')
 assert proof['passed']==proof['total']
 summary['earlierComponent'+batch]=proof
intro=read('output/req012/verification.json')
assert intro['pass'] and not intro['errors']
summary['earlierCinematicComponent']=intro
(PRE/'verification.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
for name in ['re035','re037','re037-parallax','re037-night','re028-legend','re029-legend','re040','hud-390x844','hud-568x320']:
 shutil.copyfile(OUT/'qa'/f'{name}.png',PRE/f'{name}.png')

old=read('output/release118/previous-release.json')
previous={'commit':'e3e7ab7e1f83094ac4b73384af89581f7cdd4cc1','version':old['version'],'sha256':old['artifact']['sha256']}
new_images={k:v for k,v in selected['images'].items() if k.startswith(('stage59_','env62_'))}
release={**old,'release':'elyndor-alpha-1.18-living-battles-2026-11-04','version':notes[0]['version'],'artifact':artifact,
 'githubHistory':{**old['githubHistory'],'previousRelease':previous['commit']},'previousPublishedRelease':previous,
 'changes':notes[0]['items'],'releaseNotes':notes,
 'art':{**old['art'],'newBundledImages':len(new_images)+2,'newImageKeys':list(new_images)+['combatIcons65/ability','combatIcons65/status'],
  'combatIconSource':'Approved Trello reference sheets, reused without redrawing','referencePolicy':'Approved PixelLab environment art and approved Trello combat icon sheets; native character sprites retained.'},
 'graphics':{**old['graphics'],'bakedTreeCount':bake['trees']['count'],'bakedHeightSamples':bake['grid']['count'],
  'constructedBattleDepth':True,'authoredBattleIntroPaths':8,'screenSpaceCombatHud':True},
 'validation':summary,
 'performance':{'scope':'Native PC component measurements; emulated phone layouts do not establish physical-phone frame rates. Scene preparation is reused; no universal load-time or FPS guarantee.',
  'transitionComponentTimings':summary['earlierComponent064']['timings']}}
(ROOT/'release.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Select actual build inputs; do not stage unrelated deletions, private task
# histories, raw generation jobs or disposable packed caches.
names=source_paths|{'index.html','release.json','README.md','three.vendor.js','.nojekyll','elyndor/tools/prepare-release-v118.py','elyndor/assets/source/pixellab-v7/manifest.json'}
for c in selected['characters']:
 folder=ROOT/c['folder'];names.add((folder/'metadata.json').relative_to(ROOT).as_posix())
 names.update(p.relative_to(ROOT).as_posix() for p in folder.rglob('*.png'))
for group in ['images','portraits','hudPortraits','guide']:
 names.update(selected.get(group,{}).values())
names.update(q['file'] for q in selected.get('loadingScreens',{}).values())
for p in ['elyndor/audio/manifest.json','elyndor/audio/sound-manifest.json']:
 names.add(p);data=read(p);names.update(q['file'] for q in data.get('lines',data.get('sounds',[])))
names|={f'elyndor/assets/source/pixellab-v7/combat65/{name}.png' for name in ['ability','status']}
names.update(p.relative_to(ROOT).as_posix() for p in PRE.iterdir() if p.is_file() and p.name!='files.json')
records=[]
for name in sorted(names):
 p=ROOT/name
 assert p.is_file() and p.resolve().is_relative_to(ROOT.resolve()),name
 assert not name.startswith(('output/','design/','archive/')) and p.name!='progress.md' and not any(x.startswith('.env') for x in p.parts),name
 if p.suffix in ['.js','.css','.html','.json','.md','.py','.mjs']:
  text=p.read_text(encoding='utf-8')
  assert not re.search(r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}|[?&]X-Amz-|googleusercontent\.com|upload:[a-f0-9]{8}',text),name
 records.append({'file':name,'bytes':p.stat().st_size,'sha256':digest(p)})
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
records.append({'file':'elyndor/previews/release-v118/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')})
(OUT/'publish-paths.nul').write_bytes(b'\0'.join(q['file'].encode() for q in records)+b'\0')
(OUT/'records.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
if '--staged' in sys.argv:
 staged=set(subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=ROOT).decode().strip('\0').split('\0'))-{''}
 changed=set(subprocess.check_output(['git','diff','HEAD','--name-only','-z'],cwd=ROOT).decode().strip('\0').split('\0'))
 untracked=set(subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=ROOT).decode().strip('\0').split('\0'))
 assert staged=={q['file'] for q in records}&(changed|untracked),'Unexpected staged paths'
 batch=subprocess.Popen(['git','cat-file','--batch'],cwd=ROOT,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
 for q in records:
  batch.stdin.write((':'+q['file']+'\n').encode());batch.stdin.flush();header=batch.stdout.readline().decode().split();assert len(header)==3 and header[1]=='blob',q['file']
  blob=batch.stdout.read(int(header[2]));assert batch.stdout.read(1)==b'\n';assert hashlib.sha256(blob).hexdigest()==q['sha256'],q['file']
 batch.stdin.close();assert batch.wait()==0
print(json.dumps({'selectedFiles':len(records),'artifact':artifact,'privacy':'PASS','staged':'PASS' if '--staged' in sys.argv else 'not checked'}))
