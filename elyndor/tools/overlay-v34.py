"""Verify that the post-soak change is confined to the tutorial card CSS."""
from pathlib import Path
import hashlib,json,subprocess,os,sys
r=Path(__file__).resolve().parents[2];o=r/'output/elyndor/pixellab-v34'
old=(o/'before-overlay.html').read_text(encoding='utf-8');new=(r/'index.html').read_text(encoding='utf-8');css=(r/'elyndor/lighting-v34.css').read_text(encoding='utf-8')
assert new.replace('\n'+css,'',1)==old,'A change outside the isolated overlay stylesheet requires new runtime validation'
q={'sha256':hashlib.sha256(new.encode()).hexdigest(),'gameplaySha256':hashlib.sha256(old.encode()).hexdigest(),'onlyChange':'Tutorial card placement in lighting-v34.css; complete embedded game JavaScript and assets are byte-identical.','checks':[]}
steps=[('source-parity',['python','elyndor/tools/audit-continuous.py']),('official-movement',['node','elyndor/tools/web_game_playwright_client.mjs','--url',(r/'index.html').as_uri(),'--actions-file','elyndor/tools/smoke-actions.json','--mute-voices','--click-selector','#start-btn','--iterations','1','--pause-ms','250','--screenshot-dir',str(o/'official')]),('touch-controls',['node','elyndor/tools/controls-v34.mjs']),('responsive-menus',['node','elyndor/tools/menu-layout-v34.mjs'])]
for name,args in steps:
 with (o/('overlay-'+name+'.log')).open('w',encoding='utf-8') as f:rc=subprocess.run(args,cwd=r,env={**os.environ,'ELY_NATIVE':'1'},stdout=f,stderr=subprocess.STDOUT).returncode
 q['checks'].append({'name':name,'pass':rc==0});(o/'overlay-verification.json').write_text(json.dumps(q,indent=2),encoding='utf-8');print(name+': '+str(rc==0),flush=True)
 if rc:raise SystemExit(rc)
