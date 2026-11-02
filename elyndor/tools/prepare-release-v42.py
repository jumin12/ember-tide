"""Curate the verified POI and party update without unrelated workspace files."""
from pathlib import Path
import hashlib,json,re,shutil,subprocess,sys
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'output/elyndor/levels-v42/publish';PRE=ROOT/'elyndor/previews/levels-v42'
OUT.mkdir(parents=True,exist_ok=True);PRE.mkdir(parents=True,exist_ok=True)
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':digest(ROOT/'index.html'),'offline':True}
qa=read('output/elyndor/levels-v42/qa/report.json')
assert qa['functionalPass'] and qa['unchanged'] and qa['sha256']==artifact['sha256']
assert [c['name'] for c in qa['cases']]==['source','simulation','combat','persistence','layouts','party-shadows','transitions','air','devices','campaign','lifecycle','input','terrain','devices-repeat']
proof={name:read('output/elyndor/levels-v42/qa/'+name+'.json') for name in ['layouts','party-shadows','transitions','air','devices','campaign','lifecycle','terrain','devices-repeat']}
for name,q in proof.items():
 assert q.get('sha256',artifact['sha256'])==artifact['sha256'],name
 if name not in ['campaign','devices','devices-repeat']:assert q['pass'],name
for name in ['devices','devices-repeat']:
 q=proof[name];assert not q['errors'] and q['desktopResize']['pass'] and q['phone-high-dpiResize']['pass'] and all(s['fps']>=50 for s in q['samples'] if s['throttle']==1),name
campaign=proof['campaign'];assert campaign['campaign']['final']=='complete' and len(campaign['campaign']['battles'])==6 and all(campaign['persistence'].values()) and not campaign['errors']
notes=json.JSONDecoder().raw_decode((ROOT/'elyndor/title-v19.js').read_text(encoding='utf-8').split('const CHANGELOG19=',1)[1])[0];assert notes[0]['version']=='Alpha Version 1.16'
initial=read('output/elyndor/levels-v42/qa/devices-initial-failure.json');comparison=read('output/elyndor/levels-v42/cpu-review/chain-report.json')
summary={'artifact':artifact,'suite':qa,'strictSuitePass':qa['pass'],'performanceLimitation':'The strict 45 FPS floor under 4x CPU emulation is not consistently met. The initial candidate and the preceding published game both reproduced this slowdown in a matched resize-chain profile. Raw failures are retained; functional checks and normal viewport measurements are evaluated separately.','initialCandidateStressFailure':initial,'initialCandidateMatchedProfile':{'sha256':'2dfd3260fe9bcb408ed40369ffffc00fd7c4d5da024dd683e5b641d5bdf91576','previousPublishedSha256':'571c29e62dc59d57157a7e23504851cb156330e897e62493ec9df578140e1ca1','samples':comparison,'scope':'Diagnostic profiles of the initial candidate and previous release; not a final-build benchmark or proof of a statistically significant speedup.'},'proof':proof,'scope':'Native Chrome on the test PC, including high-DPI phone viewport and 4x CPU emulation. Physical phones and every hardware configuration have not been measured. Layout overview captures temporarily hide sky clouds because their inspection camera is above the normal playable camera; gameplay clouds remain enabled.'}
(PRE/'verification.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
old=read('release.json');previous={'commit':'453b677fbfdcd644f44b2d567191bc2cb02a208d','version':'Alpha Version 1.15','sha256':'571c29e62dc59d57157a7e23504851cb156330e897e62493ec9df578140e1ca1'}
release={**old,'release':'elyndor-alpha-1.16-planned-paths-party-2026-11-02','version':notes[0]['version'],'artifact':artifact,'githubHistory':{**old['githubHistory'],'previousRelease':previous['commit']},'previousPublishedRelease':previous,'changes':notes[0]['items'],'releaseNotes':notes,'validation':summary,'performance':proof['devices']}
(ROOT/'release.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
checkpoint=read('elyndor/assets/source/pixellab-v7/checkpoint.json');checkpoint['status']='Alpha Version 1.16: deliberate POI paths, grounded sprinting party and smooth wind shadows';checkpoint['artifact']=artifact
(ROOT/'elyndor/assets/source/pixellab-v7/checkpoint.json').write_text(json.dumps(checkpoint,indent=2)+'\n',encoding='utf-8')
previous_files=read('elyndor/previews/render-v41/files.json');selection=next(q for q in previous_files if q['file']=='elyndor/assets/source/pixellab-v7/manifest.json');assert digest(ROOT/selection['file'])==selection['sha256'],'Approved art selection changed'
names={q['file'] for q in previous_files}|{'elyndor/previews/render-v41/files.json','elyndor/systems/level-plans.js','elyndor/tools/levels-v42.mjs','elyndor/tools/party-shadow-v42.mjs','elyndor/tools/levels-qa-v42.py','elyndor/tools/prepare-release-v42.py','elyndor/docs/planned-levels.md','elyndor/previews/levels-v42/verification.json'}
images=[('before-after.png','before-after.png'),('final/all-pois.png','all-pois.png'),('final/patrol.png','woodland-path.png'),('final/fern.png','fern-layout.png'),('motion/contact-bridge.png','bridge-shadow.png'),('motion/contact-stairs.png','stair-shadow.png'),('motion/contact-inn.png','inn-shadow.png'),('motion/five-party.png','sprinting-party.png'),('qa/input/shot-0.png','input.png')]
for source,name in images:
 shutil.copyfile(ROOT/'output/elyndor/levels-v42'/source,PRE/name);names.add((PRE/name).relative_to(ROOT).as_posix())
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
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8');records.append({'file':'elyndor/previews/levels-v42/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')})
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
