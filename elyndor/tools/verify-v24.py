"""Run one GPU browser at a time against the exact final artifact."""
from pathlib import Path
import hashlib,json,os,subprocess,sys
sys.stdout.reconfigure(encoding='utf-8')
root=Path(__file__).resolve().parents[2];out=root/'output/elyndor/pixellab-v24'
sha=hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
commands=[('cutaway-restoration',['node','elyndor/tools/cutaway-v24.mjs'],'cutaway/report.json'),('expanded-poi-atmosphere-ui',['node','elyndor/tools/revision-v24.mjs'],'revision/report.json'),('regression',['python','elyndor/tools/regression-v24.py','--resume'],None),('native-clarity',['node','elyndor/tools/clarity-v24.mjs'],'clarity/report.json'),('resident-navigation',['node','elyndor/tools/resident-navigation-v24.mjs'],'resident-navigation/report.json'),('extended-endurance',['node','elyndor/tools/endurance-v24.mjs'],'endurance/report.json')]
for name,args,report in commands:
 if report and (out/report).exists():
  q=json.loads((out/report).read_text(encoding='utf-8'))
  if q.get('sha256')==sha and q.get('pass'):
   print(name+': PASS (same artifact)',flush=True);continue
 print(name+': running',flush=True)
 with (out/(name+'-final.log')).open('w',encoding='utf-8') as log:r=subprocess.run(args,cwd=root,env={**os.environ,'ELY_NATIVE':'1'},stdout=log,stderr=subprocess.STDOUT)
 if r.returncode:
  print((out/(name+'-final.log')).read_text(encoding='utf-8',errors='replace')[-3500:],flush=True);sys.exit(r.returncode)
 assert hashlib.sha256((root/'index.html').read_bytes()).hexdigest()==sha
 print(name+': PASS',flush=True)
print('All 36 release checks passed: '+sha,flush=True)
