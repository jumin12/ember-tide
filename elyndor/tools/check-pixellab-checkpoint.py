"""Validate the exact public checkpoint paths before a Git commit."""
from pathlib import Path
import json,re,hashlib,subprocess,sys
root=Path(__file__).resolve().parents[2]
out=root/'output/elyndor/pixellab-v7'
paths=json.loads((out/'publish-art-paths.json').read_text())
paths.extend(p.relative_to(root).as_posix() for p in root.joinpath('elyndor').iterdir() if p.suffix in ('.js','.css','.html'))
paths.extend(['.gitattributes','.gitignore','README.md','PIXELLAB_REBUILD.md','elyndor/tools/pixellab-pack.py',
 'elyndor/tools/prepare-pixellab-checkpoint.py','elyndor/tools/check-pixellab-checkpoint.py'])
paths=sorted(set(paths));errors=[]
for path in paths:
 p=(root/path).resolve();p.relative_to(root)
 if not p.is_file():errors.append('Missing: '+path);continue
 if path.startswith(('design/','archive/')) or p.name in ['original.zip','source-signature.txt']:errors.append('Private source: '+path)
 if p.suffix in ['.json','.js','.css','.html','.md','.py']:
  text=p.read_text(encoding='utf-8')
  if re.search(r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk-[A-Za-z0-9]{20,}|upload:[a-f0-9]{8}|googleusercontent\.com|[?&]X-Amz-',text):errors.append('Private reference or credential: '+path)
for entry in json.loads((root/'elyndor/previews/pixellab-v7/files.json').read_text()):
 if hashlib.sha256((root/entry['file']).read_bytes()).hexdigest()!=entry['sha256']:errors.append('Changed asset: '+entry['file'])
for p in root.joinpath('elyndor').glob('*.js'):
 checked=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 if checked.returncode:errors.append(checked.stderr)
checkpoint=json.loads((root/'elyndor/assets/source/pixellab-v7/checkpoint.json').read_text())
if checkpoint['characterFamilies']!=37:errors.append('Incorrect character inventory')
if hashlib.sha256((root/'index.html').read_bytes()).hexdigest()!=checkpoint['liveArtifactUnchanged']['sha256']:errors.append('Live artifact unexpectedly changed')
if errors:
 print(json.dumps({'errors':errors},indent=2));raise SystemExit(1)
(out/'publish-paths.nul').write_bytes(b'\0'.join(p.encode('utf-8') for p in paths)+b'\0')
(out/'checkpoint-publish-check.json').write_text(json.dumps({'files':len(paths),'bytes':sum((root/p).stat().st_size for p in paths),'errors':errors},indent=2))
print((out/'checkpoint-publish-check.json').read_text())
if '--staged' in sys.argv:
 actual=set(subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=root).decode().strip('\0').split('\0'))
 if actual!=set(paths):raise ValueError('Staged paths differ from the checked publish list')
 entries=json.loads((root/'elyndor/previews/pixellab-v7/files.json').read_text())
 request=''.join(':'+e['file']+'\n' for e in entries).encode()
 data=subprocess.run(['git','cat-file','--batch'],input=request,stdout=subprocess.PIPE,cwd=root,check=True).stdout
 offset=0
 for entry in entries:
  end=data.index(b'\n',offset);header=data[offset:end].decode();size=int(header.split()[-1]);offset=end+1
  blob=data[offset:offset+size];offset+=size+1
  if hashlib.sha256(blob).hexdigest()!=entry['sha256']:raise ValueError('Staged asset changed: '+entry['file'])
 print(json.dumps({'stagedFiles':len(actual),'assetHashesVerified':len(entries),'unrelatedStagedFiles':0,'privateReferencesStaged':0}))
