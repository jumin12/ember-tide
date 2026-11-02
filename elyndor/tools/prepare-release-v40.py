"""Publish the rendering hotfix with the unchanged approved native art selection."""
from pathlib import Path
import hashlib,json,re,shutil,subprocess,sys
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/elyndor/flicker-v40/publish';OUT.mkdir(parents=True,exist_ok=True)
PRE=ROOT/'elyndor/previews/render-v40';PRE.mkdir(parents=True,exist_ok=True)
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':digest(ROOT/'index.html'),'offline':True}
qa=read('output/elyndor/flicker-v40/qa/report.json')
assert qa['renderingHotfixVerified'] and qa['functionalPass'] and qa['unchanged'] and qa['sha256']==artifact['sha256']
assert [q['name'] for q in qa['cases']]==['source','stability','air','devices','campaign','lifecycle','input']
before=read('output/elyndor/flicker-v40/baseline/report.json');after=read('output/elyndor/flicker-v40/fixed/report.json')
air_before=read('output/elyndor/flicker-v40/air-baseline.json');air_after=read('output/elyndor/flicker-v40/air-fixed.json')
devices=read('output/elyndor/stabilization/devices/report.json');lifecycle=read('output/elyndor/stabilization/lifecycle/report.json')
initial_devices=read('output/elyndor/flicker-v40/devices-initial.json');matched=read('output/elyndor/flicker-v40/matched-performance.json');baseline_devices=read('output/elyndor/flicker-v40/devices-baseline/report.json')
assert matched['pass'] and matched['sha256']==artifact['sha256'] and matched['baselineSha256']==before['sha256']
for report in [after,air_after,lifecycle]:assert report['pass'] and report['sha256']==artifact['sha256']
assert devices['sha256']==artifact['sha256'] and not devices['errors'] and devices['desktopResize']['pass'] and devices['phone-high-dpiResize']['pass']
assert all(s['fps']>=50 for s in devices['samples'] if s['throttle']==1)
campaign=read('output/elyndor/stabilization/campaign/report.json');campaign_ok=not campaign['errors'] and campaign['campaign']['final']=='complete' and all(campaign['persistence'].values());assert campaign_ok
notes=json.JSONDecoder().raw_decode((ROOT/'elyndor/title-v19.js').read_text(encoding='utf-8').split('const CHANGELOG19=',1)[1])[0]
assert notes[0]['version']=='Alpha Version 1.14'
summary={'version':notes[0]['version'],'artifact':artifact,'qa':qa,'detailStability':{'cases':len(after['cases']),'tiers':sorted(set(q['tier'] for q in after['cases'])),'oscillationMetres':.05,'baselineFlips':sum(q['flips'] for q in before['cases']),'fixedFlips':sum(q['flips'] for q in after['cases']),'largerDistanceChangesRetained':all(q['stillAdapts'] for q in after['cases'])},'atmosphereContinuity':{'scope':'Native GPU, controlled 40m depth plane and white shadow fixture; native cloud texture; 25 world-cell boundaries. This isolates sampling continuity rather than scoring an entire scene image.','baselineMaximumJump':air_before['gpu']['maxBoundaryDelta'],'fixedMaximumJump':air_after['gpu']['maxBoundaryDelta'],'reductionFactorLowerBound':air_before['gpu']['maxBoundaryDelta']/max(air_after['gpu']['maxBoundaryDelta'],1/32768),'quantizationLimited':air_after['gpu']['maxBoundaryDelta']<=1/32768},'performance':{'scope':'Native test PC and browser CPU/touch emulation. Physical phones were not measured. The initial strict 4x CPU sweep fell below the absolute floor; its raw observations are retained. The controlled original-versus-fixed comparison showed no patch slowdown.','initialStrictSweep':initial_devices,'baselineStrictSweep':baseline_devices,'matchedComparison':matched,'devices':devices,'lifecycle':lifecycle},'campaign':{'pass':campaign_ok,'battles':len(campaign['campaign']['battles']),'restoredLights':campaign['campaign']['restored'],'persistence':campaign['persistence']},'errors':after['errors']+air_after['errors'],'extraGpuResources':0,'additionalScatteringSteps':0}
(PRE/'verification.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
old=read('release.json')
previous={'commit':'ff55d2583391b1718eab8b823b794dfaaad3e871','version':'Alpha Version 1.13','sha256':'d88753f9277bbe738ea680d5194e959098cec690ad6fb702b20fe7324606df6d'}
release={**old,'release':'elyndor-alpha-1.14-render-stability-2026-11-01','version':notes[0]['version'],'artifact':artifact,'githubHistory':{**old['githubHistory'],'previousRelease':previous['commit']},'previousPublishedRelease':previous,'changes':notes[0]['items'],'releaseNotes':notes,'validation':summary,'performance':summary['performance']}
(ROOT/'release.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
checkpoint=read('elyndor/assets/source/pixellab-v7/checkpoint.json');checkpoint['status']='Alpha Version 1.14: stable distance detail, shadows and atmospheric sampling';checkpoint['artifact']=artifact
(ROOT/'elyndor/assets/source/pixellab-v7/checkpoint.json').write_text(json.dumps(checkpoint,indent=2)+'\n',encoding='utf-8')
# These native art sources are exactly the preceding release's selection.
# Refuse to accidentally omit a newly selected asset in a future art release.
previous_files=read('elyndor/previews/world-v39/files.json');selection=next(q for q in previous_files if q['file']=='elyndor/assets/source/pixellab-v7/manifest.json')
assert digest(ROOT/selection['file'])==selection['sha256'],'Art selection changed; regenerate full source curation'
names={q['file'] for q in previous_files}|{'elyndor/previews/world-v39/files.json','elyndor/tools/texture-stability-v40.mjs','elyndor/tools/air-stability-v40.mjs','elyndor/tools/render-qa-v40.mjs','elyndor/tools/render-performance-v40.mjs','elyndor/tools/prepare-release-v40.py','elyndor/previews/render-v40/verification.json'}
sources=[ROOT/'output/elyndor/flicker-v40/fixed'/name for name in ['entrance.png','brookInn.png','fern.png']]+[ROOT/'output/elyndor/flicker-v40/qa/input/shot-0.png']
for source in sources:shutil.copyfile(source,PRE/source.name);names.add((PRE/source.name).relative_to(ROOT).as_posix())
# Preserve the original source-file newline convention. The builder normalizes
# newlines while reading, so this does not alter the tested standalone bytes.
for name in ['README.md','elyndor/title-v19.js','elyndor/tools/devices-v37.mjs']:
 p=ROOT/name;original=subprocess.check_output(['git','show','HEAD:'+name],cwd=ROOT)
 if b'\r\n' in original:p.write_bytes(p.read_bytes().replace(b'\r\n',b'\n').replace(b'\n',b'\r\n'))
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
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8');records.append({'file':'elyndor/previews/render-v40/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')});names={q['file'] for q in records}
(OUT/'records.json').write_text(json.dumps(records,indent=2),encoding='utf-8');(OUT/'publish-paths.nul').write_bytes(b'\0'.join(n.encode() for n in sorted(names))+b'\0')
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
