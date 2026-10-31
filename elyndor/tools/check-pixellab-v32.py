"""Check the exact selected public release files, optionally their Git blobs."""
from pathlib import Path
import json,re,hashlib,subprocess,sys
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'output/elyndor/pixellab-v32'
paths=json.loads((OUT/'publish-paths.json').read_text(encoding='utf-8'));errors=[]
if any(p.endswith(('presentation-v26/panorama.png','presentation-v26/day-panorama.png'))for p in paths):errors.append('Rejected painted panorama selected for publication')
for path in paths:
 p=(ROOT/path).resolve();p.relative_to(ROOT.resolve())
 if path.startswith(('design/','archive/','elyndor/audio/source-v13/','elyndor/audio/source-v14/','elyndor/audio/source-v15/')) or p.name in ['progress.md','original.zip','source-signature.txt']:errors.append('Private file: '+path)
 if p.suffix in ['.json','.js','.css','.html','.md','.py']:
  text=p.read_text(encoding='utf-8')
  if re.search(r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}|upload:[a-f0-9]{8}|googleusercontent\.com|[?&]X-Amz-',text):errors.append('Private reference or credential: '+path)
records=json.loads((ROOT/'elyndor/previews/pixellab-v32/files.json').read_text(encoding='utf-8'))
for e in records:
 if hashlib.sha256((ROOT/e['file']).read_bytes()).hexdigest()!=e['sha256']:errors.append('File changed: '+e['file'])
checkpoint=json.loads((ROOT/'elyndor/assets/source/pixellab-v7/checkpoint.json').read_text(encoding='utf-8'))
if checkpoint['characterFamilies']!=41 or checkpoint['incompleteClips']:errors.append('Incomplete cast')
if '--staged' in sys.argv:
 actual=set(subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=ROOT).decode().strip('\0').split('\0'))
 changed=set(subprocess.check_output(['git','diff','HEAD','--name-only','-z'],cwd=ROOT).decode().strip('\0').split('\0'));untracked=set(subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=ROOT).decode().strip('\0').split('\0'));expected=set(paths)&(changed|untracked)
 if actual!=expected:errors.append('Staged paths differ from changed checked release files')
 request=''.join(':'+e['file']+'\n' for e in records).encode();data=subprocess.run(['git','cat-file','--batch'],input=request,stdout=subprocess.PIPE,cwd=ROOT,check=True).stdout;offset=0
 for e in records:
  end=data.index(b'\n',offset);size=int(data[offset:end].decode().split()[-1]);offset=end+1;blob=data[offset:offset+size];offset+=size+1
  if hashlib.sha256(blob).hexdigest()!=e['sha256']:errors.append('Staged bytes differ: '+e['file'])
report={'files':len(paths),'artifact':checkpoint['artifact'],'errors':errors};(OUT/'publish-check.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
if errors:raise SystemExit(1)
