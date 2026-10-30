"""Sequential release verification; never compete for the GPU."""
from pathlib import Path
import hashlib,json,os,subprocess,sys
sys.stdout.reconfigure(encoding='utf-8')
R=Path(__file__).resolve().parents[2];O=R/'output/elyndor/pixellab-v26';O.mkdir(parents=True,exist_ok=True);sha=hashlib.sha256((R/'index.html').read_bytes()).hexdigest()
commands=[('interface',['node','elyndor/tools/menu-layout-v26.mjs'],'interface/report.json'),('riverlands',['node','elyndor/tools/riverlands-v26.mjs'],'riverlands/report.json'),('cutaway',['node','elyndor/tools/cutaway-v26.mjs'],'cutaway/report.json'),('districts',['node','elyndor/tools/revision-v26.mjs'],'revision/report.json'),('regression',['python','elyndor/tools/regression-v26.py','--resume'],None),('clarity',['node','elyndor/tools/clarity-v26.mjs'],'clarity/report.json'),('resident',['node','elyndor/tools/resident-navigation-v26.mjs'],'resident-navigation/report.json'),('endurance',['node','elyndor/tools/endurance-v26.mjs'],'endurance/report.json'),('capture',['node','elyndor/tools/capture-atmosphere-v26.mjs'],'atmosphere/report.json')]
for name,args,report in commands:
 if report and (O/report).exists():
  q=json.loads((O/report).read_text(encoding='utf-8'))
  if q.get('sha256')==sha and q.get('pass'):print(name+': PASS (same artifact)',flush=True);continue
 print(name+': running',flush=True)
 with (O/(name+'-final.log')).open('w',encoding='utf-8') as log:r=subprocess.run(args,cwd=R,env={**os.environ,'ELY_NATIVE':'1'},stdout=log,stderr=subprocess.STDOUT)
 if r.returncode:print((O/(name+'-final.log')).read_text(encoding='utf-8',errors='replace')[-3000:],flush=True);sys.exit(r.returncode)
 assert hashlib.sha256((R/'index.html').read_bytes()).hexdigest()==sha
 print(name+': PASS',flush=True)
print('V26 final verification passed: '+sha,flush=True)
