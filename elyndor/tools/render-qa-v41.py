"""Serial native-GPU regression suite for the motion/water/lighting patch."""
from pathlib import Path
import hashlib,json,os,shutil,subprocess,sys,time
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/elyndor/flicker-v41/qa';OUT.mkdir(parents=True,exist_ok=True)
os.chdir(ROOT)
digest=lambda:hashlib.sha256(Path('index.html').read_bytes()).hexdigest()
sha=digest();env={**os.environ,'ELY_NATIVE':'1','ELY_AIR_OUT':'output/elyndor/flicker-v41','ELY_DEVICE_OUT':'output/elyndor/flicker-v41/devices','ELY_GAME_INPUT':'index.html'}
cases=[('source',[sys.executable,'-X','utf8','elyndor/tools/audit-continuous.py'],None),('simulation',['node','elyndor/tools/check-simulation.mjs'],None),('combat',['node','elyndor/tools/check-combat.mjs'],None),('persistence',['node','elyndor/tools/check-persistence.mjs'],None),('rendering',['node','elyndor/tools/rendering-v41.mjs'],'output/elyndor/flicker-v41/fixed/report.json'),('air',['node','elyndor/tools/air-stability-v40.mjs'],'output/elyndor/flicker-v41/air-fixed.json'),('devices',['node','elyndor/tools/devices-v37.mjs'],'output/elyndor/flicker-v41/devices/report.json'),('campaign',['node','elyndor/tools/campaign-v37.mjs','index.html'],'output/elyndor/stabilization/campaign/report.json'),('lifecycle',['node','elyndor/tools/lifecycle-v37.mjs'],'output/elyndor/stabilization/lifecycle/report.json'),('input',['node','elyndor/tools/web_game_playwright_client.mjs','--url',(ROOT/'index.html').as_uri(),'--click-selector','#start-btn','--actions-file','output/elyndor/flicker-v41/actions.json','--iterations','1','--pause-ms','150','--screenshot-dir',str(OUT/'input'),'--mute-voices'],None),('terrain',['node','elyndor/tools/height-cache-v41.mjs'],'output/elyndor/flicker-v41/height-cache.json'),('devices-repeat',['node','elyndor/tools/devices-v37.mjs'],'output/elyndor/flicker-v41/devices-repeat/report.json')]
start=sys.argv[sys.argv.index('--from')+1] if '--from' in sys.argv else None
report={'sha256':sha,'cases':[],'pass':False}
if start:
 old=json.loads((OUT/'report.json').read_text());assert old['sha256']==sha
 report['cases']=old['cases'][:[c[0] for c in cases].index(start)]
else:start=cases[0][0]
for name,command,evidence in cases[[c[0] for c in cases].index(start):]:
 print('RUN '+name,flush=True);at=time.monotonic()
 with (OUT/(name+'.log')).open('w',encoding='utf-8') as log:
  try:code=subprocess.run(command,env={**env,**({'ELY_DEVICE_OUT':'output/elyndor/flicker-v41/devices-repeat'} if name=='devices-repeat' else {})},stdout=log,stderr=subprocess.STDOUT,timeout=480).returncode
  except subprocess.TimeoutExpired:code=-1
 unchanged=digest()==sha;row={'name':name,'pass':code==0 and unchanged,'exit':code,'seconds':round(time.monotonic()-at,2),'sha256':sha}
 if evidence:
  evidence_data=json.loads((ROOT/evidence).read_text());assert evidence_data.get('sha256',sha)==sha
  (OUT/(name+'.json')).write_text(json.dumps(evidence_data,indent=2)+'\n',encoding='utf-8')
 report['cases'].append(row);report['unchanged']=unchanged
 (OUT/'report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
 print(('PASS ' if row['pass'] else 'FAIL ')+name+' '+str(row['seconds'])+'s',flush=True)
 if not row['pass']:sys.exit(1)
report['pass']=len(report['cases'])==len(cases) and all(c['pass'] for c in report['cases']) and digest()==sha
(OUT/'report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report),flush=True)
