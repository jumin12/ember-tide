"""Select the tested game and rebuild inputs; exclude private work files."""
from pathlib import Path
import json, hashlib, subprocess, re, shutil, sys
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/elyndor/world-v38/publish';OUT.mkdir(parents=True,exist_ok=True)
PRE=ROOT/'elyndor/previews/world-v39';PRE.mkdir(parents=True,exist_ok=True)
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
proof=read('output/elyndor/world-v38/verification.json')
assert proof['qa']['pass'] and proof['strictDeviceRepeat']['pass']
assert sha(ROOT/'index.html')==proof['sha256']
manifest=read('elyndor/assets/source/pixellab-v7/manifest.json')
audit=read('elyndor/assets/packed/audit.json')
packed=read('elyndor/assets/packed/assets.cache.json')
assert not manifest['preview'] and not packed['pixelLabAudit']['incompleteClips'] and not audit['sourceBoundaryWarnings']
paths=set()
def add(p):paths.add(p if isinstance(p,Path) else ROOT/p)
for item in manifest['characters']:
 folder=ROOT/item['folder'];add(folder/'metadata.json')
 for p in folder.rglob('*.png'):add(p)
for category in ['images','portraits','hudPortraits','guide']:
 for p in manifest.get(category,{}).values():add(p)
for q in manifest['loadingScreens'].values():add(q['file'])
for name in ['manifest.json','packed-review.json','checkpoint.json']:add('elyndor/assets/source/pixellab-v7/'+name)
for category in ['manifest.json','sound-manifest.json']:
 data=read('elyndor/audio/'+category);add('elyndor/audio/'+category)
 for q in data.get('lines',data.get('sounds',[])):add(q['file'])
for name in ['catalog.json','sound-catalog.json']:add('elyndor/audio/'+name)
for p in (ROOT/'elyndor').iterdir():
 if p.suffix in ['.js','.css','.html']:add(p)
for folder in ['systems','docs']:
 for p in (ROOT/'elyndor'/folder).iterdir():
  if p.is_file() and p.suffix in ['.js','.css','.md']:add(p)
add('elyndor/build-manifest.json');add('elyndor/README.md')
helpers=['build-v7.py','pixellab-pack.py','audit-continuous.py','bake-world-v36.mjs','check-simulation.mjs','check-combat.mjs','check-persistence.mjs','architecture-v37.mjs','campaign-v37.mjs','devices-v37.mjs','lifecycle-v37.mjs','extended-soak-v37.mjs','web_game_playwright_client.mjs','presentation-v37.mjs','tutorial-journey-v37.mjs','records-and-activities-v37.mjs','resume-restoration-v37.mjs','derive-world-v38.py','world-concept-audit-v38.mjs','world-entry-check-v39.mjs','world-proof-v38.mjs','world-qa-v38.mjs','levels-qa-v39.mjs','hydrology-check-v39.py','prepare-release-v39.py','live-release-v39.mjs']
for p in helpers:add('elyndor/tools/'+p)
for p in ['index.html','three.vendor.js','README.md','release.json','.gitattributes','.gitignore','.nojekyll']:add(p)
for source in list((ROOT/'output/elyndor/world-v38/proof').glob('*.png'))+[ROOT/'output/elyndor/world-v38/final-verified-qa/input/shot-0.png',ROOT/'output/elyndor/levels-v39/snow-tracks.png']:
 shutil.copyfile(source,PRE/source.name);add(PRE/source.name)
public_proof={k:v for k,v in proof.items() if k not in ['publication']};public_proof['publication']='Approved for GitHub publication; exact tested standalone retained.'
(PRE/'verification.json').write_text(json.dumps(public_proof,indent=2)+'\n',encoding='utf-8');add(PRE/'verification.json')
voice=read('elyndor/audio/manifest.json');sounds=read('elyndor/audio/sound-manifest.json')
notes=json.JSONDecoder().raw_decode((ROOT/'elyndor/title-v19.js').read_text(encoding='utf-8').split('const CHANGELOG19=',1)[1])[0]
old=read('release.json')
release={'release':'elyndor-alpha-1.13-world-rivers-2026-11-01','version':'Alpha Version 1.13','game':'The Last Light of Elyndor','artifact':{'file':'index.html','bytes':proof['bytes'],'sha256':proof['sha256'],'offline':True},'githubHistory':{**old['githubHistory'],'previousRelease':'0e85e68fdd979d8d47d9f5fdc11c3062abce88eb'},'changes':notes[0]['items']+notes[1]['items'],'releaseNotes':notes,'art':{'generator':'PixelLab','nativeSelectedFamilies':len(manifest['characters']),'runtimeFamilies':len(packed['sprites']),'packedSpritePoses':len(audit['poses']),'sourceCropWarnings':len(audit['sourceBoundaryWarnings']),'referencePolicy':manifest['referencePolicy']},'audio':{'provider':'ElevenLabs','recordedVoices':len(voice['lines']),'soundAssets':len(sounds['sounds']),'totalRecordings':len(voice['lines'])+len(sounds['sounds'])},'graphics':{'bakedHeightSamples':proof['heightSamples'],'bakedTreeCount':proof['bakedTreeCount'],'visualParityWithConcept':False,'hydrology':proof['hydrology']},'validation':public_proof,'performance':{'scope':proof['measurementLimitations'],'devices':proof['strictDeviceRepeat'],'soak':proof['soak'],'lifecycle':proof['lifecycle']}}
(ROOT/'release.json').write_text(json.dumps(release,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
checkpoint={'status':'Alpha Version 1.13: connected rivers, coherent crossings and distinct destinations','referencePolicy':manifest['referencePolicy'],'characterFamilies':len(manifest['characters']),'runtimeFamilies':len(packed['sprites']),'nativeSelectedPoses':len(audit['poses']),'artifact':release['artifact'],'incompleteClips':packed['pixelLabAudit']['incompleteClips'],'portraits':len(manifest['portraits']),'worldImages':len(manifest['images']),'voiceClips':len(voice['lines']),'soundAssets':len(sounds['sounds'])}
(ROOT/'elyndor/assets/source/pixellab-v7/checkpoint.json').write_text(json.dumps(checkpoint,indent=2)+'\n',encoding='utf-8')
records=[];errors=[]
for p in sorted(paths):
 name=p.resolve().relative_to(ROOT.resolve()).as_posix()
 if not p.is_file():errors.append('Missing file: '+name);continue
 if name.startswith(('design/','archive/','output/')) or p.name in ['progress.md','original.zip','source-signature.txt'] or any(q.startswith('.env') for q in p.parts):errors.append('Private path: '+name)
 if p.suffix=='.png':
  with Image.open(p) as im:im.verify()
 if p.suffix in ['.json','.js','.css','.html','.md','.py','.mjs']:
  text=p.read_text(encoding='utf-8')
  patterns={'credential':r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}','private_reference':r'upload:[a-f0-9]{8}|googleusercontent\.com|[?&]X-Amz-'}
  for rule,pattern in patterns.items():
   if re.search(pattern,text):errors.append(rule+': '+name)
 records.append({'file':name,'bytes':p.stat().st_size,'sha256':sha(p)})
(OUT/'privacy-check.json').write_text(json.dumps({'errors':errors},indent=2),encoding='utf-8')
if errors:print(json.dumps({'errors':errors}));raise SystemExit(1)
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8');records.append({'file':(PRE/'files.json').relative_to(ROOT).as_posix(),'bytes':(PRE/'files.json').stat().st_size,'sha256':sha(PRE/'files.json')})
names=[q['file'] for q in records]
(OUT/'records.json').write_text(json.dumps(records,indent=2),encoding='utf-8');(OUT/'publish-paths.json').write_text(json.dumps(names,indent=2),encoding='utf-8');(OUT/'publish-paths.nul').write_bytes(b'\0'.join(p.encode() for p in names)+b'\0')
if '--staged' in sys.argv:
 staged=set(subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=ROOT).decode().strip('\0').split('\0'))-{''}
 changed=set(subprocess.check_output(['git','diff','HEAD','--name-only','-z'],cwd=ROOT).decode().strip('\0').split('\0'))
 untracked=set(subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=ROOT).decode().strip('\0').split('\0'))
 assert staged==set(names)&(changed|untracked),'Unexpected staged paths'
 batch=subprocess.Popen(['git','cat-file','--batch'],cwd=ROOT,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
 for q in records:
  batch.stdin.write((':'+q['file']+'\n').encode());batch.stdin.flush()
  header=batch.stdout.readline().decode().strip().split()
  assert len(header)==3 and header[1]=='blob','Missing staged blob: '+q['file']
  blob=batch.stdout.read(int(header[2]));assert batch.stdout.read(1)==b'\n'
  assert hashlib.sha256(blob).hexdigest()==q['sha256'],'Staged bytes differ: '+q['file']
 batch.stdin.close();assert batch.wait()==0
print(json.dumps({'files':len(names),'bytes':sum(q['bytes'] for q in records),'artifact':release['artifact'],'privacy':'PASS','staged':'PASS' if '--staged' in sys.argv else 'not checked'}))
