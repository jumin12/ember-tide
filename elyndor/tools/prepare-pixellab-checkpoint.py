"""Prepare the tested integrated release, excluding private references."""
from pathlib import Path
from PIL import Image
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'elyndor/assets/source/pixellab-v7'
OUT=ROOT/'output/elyndor/pixellab-v8'
PRE=ROOT/'elyndor/previews/pixellab-v8';PRE.mkdir(parents=True,exist_ok=True)
manifest=json.loads((SRC/'manifest.json').read_text())
audit=json.loads((ROOT/'elyndor/assets/packed/audit.json').read_text())
assets=json.loads((ROOT/'elyndor/assets/packed/assets.cache.json').read_text())
assert not manifest['preview'] and not assets['pixelLabAudit']['incompleteClips']
assert len(manifest['characters'])==41 and len(assets['sprites'])==42
paths=[]
for item in manifest['characters']:
 folder=ROOT/item['folder'];paths.append(folder/'metadata.json');paths.extend(folder.rglob('*.png'))
for category in ['images','portraits','guide']:
 paths.extend(ROOT/p for p in manifest[category].values())
# Previously published candidates remain present; current selection is explicit.
paths.extend([SRC/'manifest.json',SRC/'packed-review.json',SRC/'checkpoint.json'])
for name in ['title','bridge','plaza','mill','town-overview','town-night','inventory','map']:
 shutil.copyfile(OUT/'town'/f'{name}.png',PRE/f'{name}.png')
paths.extend(PRE.glob('*.png'))
paths.extend(p for p in (ROOT/'elyndor').iterdir() if p.suffix in ['.js','.css','.html'])
helpers=['ui-previews-v8.mjs','live-release-check.mjs','battle-layout-v8.mjs','build.py','build-v7.py','pixellab-pack.py','review-pixellab-character.py','audit-continuous.py','audit-runtime-sprites.py','prepare-pixellab-checkpoint.py','check-pixellab-checkpoint.py','web_game_playwright_client.mjs','smoke-actions.json','continuous-verify.mjs','inspect-town-v8.mjs','qa-town-v8.mjs','keys-combat-v8.mjs','surfaces-town-v8.mjs','four-edge-check.mjs','profile-town-v8.mjs','sustained-check.mjs']
paths.extend(ROOT/'elyndor/tools'/p for p in helpers)
paths.extend(ROOT/p for p in ['index.html','three.vendor.js','README.md','ASSET_NOTES.md','PIXELLAB_REBUILD.md','MATERIAL_PROMPTS.json','release.json','.gitattributes','.gitignore','.nojekyll','tools/build.py'])
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'offline':True}
checkpoint={'status':'Integrated playable release','referencePolicy':manifest['referencePolicy'],'characterFamilies':len(manifest['characters']),'runtimeFamilies':len(assets['sprites']),'nativeSelectedPoses':len(audit['poses']),'portraits':len(manifest['portraits']),'worldImages':len(manifest['images']),'artifact':artifact,'incompleteClips':assets['pixelLabAudit']['incompleteClips']}
(SRC/'checkpoint.json').write_text(json.dumps(checkpoint,indent=2),encoding='utf-8')
paths=sorted(set(paths));records=[]
for p in paths:
 p.resolve().relative_to(ROOT.resolve())
 assert p.is_file(),p
 if p.suffix=='.png':
  with Image.open(p) as im:im.verify()
 records.append({'file':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(PRE/'files.json').write_text(json.dumps(records,indent=2),encoding='utf-8');paths.append(PRE/'files.json')
(OUT/'publish-paths.json').write_text(json.dumps([p.relative_to(ROOT).as_posix() for p in paths],indent=2),encoding='utf-8')
(OUT/'publish-paths.nul').write_bytes(b'\0'.join(p.relative_to(ROOT).as_posix().encode() for p in paths)+b'\0')
print(json.dumps({**checkpoint,'publishFiles':len(paths),'publishBytes':sum(p.stat().st_size for p in paths)}))
