"""Run the release's behavior and visual checks in one browser at a time."""
from pathlib import Path
import os,json,subprocess,hashlib,sys
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/elyndor/pixellab-v9';OUT.mkdir(parents=True,exist_ok=True)
env={**os.environ,'ELY_NATIVE':'1'}
checks=[
 ('campaign',['node','elyndor/tools/continuous-verify.mjs','index.html']),
 ('events',['node','elyndor/tools/town-events-v9.mjs','index.html']),
 ('combat',['node','elyndor/tools/combat-v9.mjs','index.html']),
 ('menus',['node','elyndor/tools/qa-town-v8.mjs','index.html']),
 ('portraits',['node','elyndor/tools/ui-previews-v8.mjs','index.html']),
 ('surfaces',['node','elyndor/tools/surfaces-town-v8.mjs','index.html']),
 ('town',['node','elyndor/tools/inspect-town-v8.mjs','index.html']),
 ('official',['node','elyndor/tools/web_game_playwright_client.mjs','--url',(ROOT/'index.html').as_uri(),'--actions-file','elyndor/tools/smoke-actions.json','--click-selector','#start-btn','--iterations','1','--pause-ms','250','--screenshot-dir',str(OUT/'official')]),
 ('performance',['node','elyndor/tools/profile-town-v8.mjs','index.html'])]
report={'sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'checks':[]}
for name,args in checks:
 with (OUT/(name+'-run.log')).open('w',encoding='utf-8') as log:
  result=subprocess.run(args,cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT)
 report['checks'].append({'name':name,'pass':result.returncode==0})
 (OUT/'regression.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
 print(name+': '+('PASS'if result.returncode==0 else'FAILED'),flush=True)
 if result.returncode:
  print((OUT/(name+'-run.log')).read_text(encoding='utf-8')[-3500:]);sys.exit(result.returncode)
