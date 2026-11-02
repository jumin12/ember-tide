"""Curate only approved project sources and verified native rendering evidence."""
from pathlib import Path
import hashlib,json,re,shutil,subprocess,sys
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'output/elyndor/flicker-v41/publish';PRE=ROOT/'elyndor/previews/render-v41'
OUT.mkdir(parents=True,exist_ok=True);PRE.mkdir(parents=True,exist_ok=True)
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':digest(ROOT/'index.html'),'offline':True}
qa=read('output/elyndor/flicker-v41/qa/report.json');assert qa['pass'] and qa['unchanged'] and qa['sha256']==artifact['sha256']
assert [c['name'] for c in qa['cases']]==['source','simulation','combat','persistence','rendering','air','devices','campaign','lifecycle','input','terrain','devices-repeat']
before=read('output/elyndor/flicker-v41/baseline/report.json');after=read('output/elyndor/flicker-v41/qa/rendering.json');air=read('output/elyndor/flicker-v41/qa/air.json');devices=read('output/elyndor/flicker-v41/qa/devices.json');life=read('output/elyndor/flicker-v41/qa/lifecycle.json');campaign=read('output/elyndor/flicker-v41/qa/campaign.json');terrain=read('output/elyndor/flicker-v41/qa/terrain.json');repeat=read('output/elyndor/flicker-v41/qa/devices-repeat.json');initial=read('output/elyndor/flicker-v41/devices-initial-failure.json')
for report in [after,air,devices,life,terrain,repeat]:assert report['pass'] and report['sha256']==artifact['sha256']
assert campaign['campaign']['final']=='complete' and len(campaign['campaign']['battles'])==6 and all(campaign['persistence'].values()) and not campaign['errors']
notes=json.JSONDecoder().raw_decode((ROOT/'elyndor/title-v19.js').read_text(encoding='utf-8').split('const CHANGELOG19=',1)[1])[0];assert notes[0]['version']=='Alpha Version 1.15'
summary={'artifact':artifact,'suite':qa,'baseline':{'version':'Alpha Version 1.14','sha256':before['sha256']},'water':{'waterSurfacesSeenInReflectionBefore':before['runtime']['qa']['feedback'],'after':after['runtime']['qa']['feedback'],'gateOpenedByStoryAction':after['gate']['opened'],'fullRefill':after['flow'][-1],'allReflectionTargetsReadyAfterResize':after['resizes']},'shadows':{'before':before['shadows'],'after':after['shadows']},'cameraPresentation':{'scope':'Constant-velocity presentation test inside native Chrome, not five physical monitors. Authoritative simulation values are restored after rendering.','samples':after['camera']},'particles':after['particles'],'exactTerrainCache':terrain,'scattering':{'maxBoundaryDelta':air['gpu']['maxBoundaryDelta'],'maxControlDelta':air['gpu']['maxControlDelta'],'format':air['gpu']['format']},'performance':devices,'repeatedDeviceSweep':repeat,'initialStressCandidateBeforeCatchupFix':initial,'cleanup':life,'campaign':{'complete':True,'battles':6,'regionalLights':4,'persistence':campaign['persistence'],'errors':campaign['errors']},'sprint':after['sprint'],'scope':'Native Chrome on the test PC and emulated phone layouts. No physical-phone or universal 60 FPS claim.'}
(PRE/'verification.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
old=read('release.json');previous={'commit':'a43ffd87f2f9703be752a8f14182c2250ac51886','version':'Alpha Version 1.14','sha256':before['sha256']}
release={**old,'release':'elyndor-alpha-1.15-motion-water-light-2026-11-02','version':notes[0]['version'],'artifact':artifact,'githubHistory':{**old['githubHistory'],'previousRelease':previous['commit']},'previousPublishedRelease':previous,'changes':notes[0]['items'],'releaseNotes':notes,'validation':summary,'performance':summary['performance']}
(ROOT/'release.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
checkpoint=read('elyndor/assets/source/pixellab-v7/checkpoint.json');checkpoint['status']='Alpha Version 1.15: smooth camera, coherent canal and shadows, world-space illuminated dust';checkpoint['artifact']=artifact
(ROOT/'elyndor/assets/source/pixellab-v7/checkpoint.json').write_text(json.dumps(checkpoint,indent=2)+'\n',encoding='utf-8')
previous_files=read('elyndor/previews/render-v40/files.json');selection=next(q for q in previous_files if q['file']=='elyndor/assets/source/pixellab-v7/manifest.json');assert digest(ROOT/selection['file'])==selection['sha256'],'Art selection changed; regenerate full curation'
names={q['file'] for q in previous_files}|{'elyndor/previews/render-v40/files.json','elyndor/systems/rendering.js','elyndor/tools/rendering-v41.mjs','elyndor/tools/height-cache-v41.mjs','elyndor/tools/check-simulation.mjs','elyndor/tools/render-qa-v41.py','elyndor/tools/prepare-release-v41.py','elyndor/previews/render-v41/verification.json'}
for source,name in [('output/elyndor/flicker-v41/fixed/gate.png','gate.png'),('output/elyndor/flicker-v41/fixed/flow-90.png','flow.png'),('output/elyndor/flicker-v41/fixed/sprint.png','sprint.png'),('output/elyndor/flicker-v41/qa/input/shot-0.png','input.png')]:shutil.copyfile(ROOT/source,PRE/name);names.add((PRE/name).relative_to(ROOT).as_posix())
records=[];errors=[]
for name in sorted(names):
 p=ROOT/name;assert p.resolve().is_relative_to(ROOT.resolve()) and p.is_file(),name
 assert not name.startswith(('design/','archive/','output/')) and p.name not in ['progress.md','original.zip','source-signature.txt'] and not any(q.startswith('.env') for q in p.parts),name
 if p.suffix in ['.json','.js','.css','.html','.md','.py','.mjs']:
  text=p.read_text(encoding='utf-8')
  for rule,pattern in {'credential':r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}','private_reference':r'upload:[a-f0-9]{8}|googleusercontent\.com|[?&]X-Amz-'}.items():
   if re.search(pattern,text):errors.append(rule+': '+name)
 records.append({'file':name,'bytes':p.stat().st_size,'sha256':digest(p)})
assert not errors,errors
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8');records.append({'file':'elyndor/previews/render-v41/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')})
names={q['file'] for q in records};(OUT/'records.json').write_text(json.dumps(records,indent=2),encoding='utf-8');(OUT/'publish-paths.nul').write_bytes(b'\0'.join(n.encode() for n in sorted(names))+b'\0')
if '--staged' in sys.argv:
 staged=set(subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=ROOT).decode().strip('\0').split('\0'))-{''}
 changed=set(subprocess.check_output(['git','diff','HEAD','--name-only','-z'],cwd=ROOT).decode().strip('\0').split('\0'));untracked=set(subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=ROOT).decode().strip('\0').split('\0'))
 assert staged==names&(changed|untracked),'Unexpected staged paths'
 batch=subprocess.Popen(['git','cat-file','--batch'],cwd=ROOT,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
 for q in records:
  batch.stdin.write((':'+q['file']+'\n').encode());batch.stdin.flush();header=batch.stdout.readline().decode().split();assert len(header)==3 and header[1]=='blob',q['file'];blob=batch.stdout.read(int(header[2]));assert batch.stdout.read(1)==b'\n';assert hashlib.sha256(blob).hexdigest()==q['sha256'],q['file']
 batch.stdin.close();assert batch.wait()==0
assert artifact['sha256']==digest(ROOT/'index.html')
print(json.dumps({'files':len(records),'artifact':artifact,'privacy':'PASS','staged':'PASS' if '--staged' in sys.argv else 'not checked'}))
