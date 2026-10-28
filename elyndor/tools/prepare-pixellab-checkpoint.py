"""Prepare the tested integrated release, excluding private references."""
from pathlib import Path
from PIL import Image
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'elyndor/assets/source/pixellab-v7'
OUT=ROOT/'output/elyndor/pixellab-v12'
PRE=ROOT/'elyndor/previews/pixellab-v12';PRE.mkdir(parents=True,exist_ok=True)
manifest=json.loads((SRC/'manifest.json').read_text())
audit=json.loads((ROOT/'elyndor/assets/packed/audit.json').read_text())
assets=json.loads((ROOT/'elyndor/assets/packed/assets.cache.json').read_text())
assert not manifest['preview'] and not assets['pixelLabAudit']['incompleteClips']
assert len(manifest['characters'])==41 and len(assets['sprites'])==42
paths=[]
for item in manifest['characters']:
 folder=ROOT/item['folder'];paths.append(folder/'metadata.json');paths.extend(folder.rglob('*.png'))
for category in ['images','portraits','hudPortraits','guide']:
 paths.extend(ROOT/p for p in manifest[category].values())
paths.extend(ROOT/q['file'] for q in manifest['loadingScreens'].values())
# Previously published candidates remain present; current selection is explicit.
paths.extend([SRC/'manifest.json',SRC/'packed-review.json',SRC/'checkpoint.json'])
for name in ['brookstead','waterworks','overworld','shop','inn','highmere']:
 shutil.copyfile(OUT/'scenes'/f'{name}.png',PRE/f'{name}.png')
for name in ['side-battle','spell','results','growth','growth-mobile','weather-rain','weather-snow']:
 shutil.copyfile(OUT/'features'/f'{name}.png',PRE/f'{name}.png')
for name in ['main-menu','loading-layout','dialogue-bren','dialogue-soren','dialogue-mobile']:
 shutil.copyfile(OUT/'portraits'/f'{name}.png',PRE/f'{name}.png')
voice=json.loads((ROOT/'elyndor/audio/manifest.json').read_text(encoding='utf-8'))
paths.extend(ROOT/q['file'] for q in voice['lines'])
paths.extend(ROOT/'elyndor/audio'/name for name in ['catalog.json','manifest.json'])
for name in ['title','atlas']:shutil.copyfile(OUT/'navigation'/f'{name}.png',PRE/f'{name}.png')
paths.extend(PRE.glob('*.png'))
paths.extend(p for p in (ROOT/'elyndor').iterdir() if p.suffix in ['.js','.css','.html'])
helpers=['write-v12-release.py','regression-v12.py','navigation-v12.mjs','features-v12.mjs','traversal-v12.mjs','campaign-v12.mjs','events-v12.mjs','combat-v12.mjs','party-v12.mjs','hydraulics-v12.mjs','menus-v12.mjs','portraits-v12.mjs','capture-scenes-v12.mjs','loading-photos-v12.py','profile-v12.mjs','profile-combat-v12.mjs','audit-audio-v12.py','voice_credentials.py','voice-catalog-v12.py','generate-voices-v12.py','compress-voices-v12.py','live-release-v12.mjs','write-v11-release.py','regression-v11.py','world-design-v11.mjs','party-v11.mjs','combat-v11.mjs','hydraulics-v11.mjs','view-loading-v11.mjs','audit-cities-v11.mjs','profile-combat-v11.mjs','capture-scenes-v11.mjs','loading-photos-v11.py','write-v10-release.py','regression-v10.py','town-events-v10.mjs','combat-v10.mjs','layout-v10.mjs','world-design-v10.mjs','write-v9-release.py','regression-v9.py','town-events-v9.mjs','combat-v9.mjs','ui-previews-v8.mjs','live-release-check.mjs','battle-layout-v8.mjs','build.py','build-v7.py','pixellab-pack.py','review-pixellab-character.py','audit-continuous.py','audit-runtime-sprites.py','prepare-pixellab-checkpoint.py','check-pixellab-checkpoint.py','web_game_playwright_client.mjs','smoke-actions.json','continuous-verify.mjs','inspect-town-v8.mjs','qa-town-v8.mjs','keys-combat-v8.mjs','surfaces-town-v8.mjs','four-edge-check.mjs','profile-town-v8.mjs','sustained-check.mjs']
paths.extend(ROOT/'elyndor/tools'/p for p in helpers)
paths.extend(ROOT/p for p in ['index.html','three.vendor.js','README.md','ASSET_NOTES.md','PIXELLAB_REBUILD.md','MATERIAL_PROMPTS.json','release.json','.gitattributes','.gitignore','.nojekyll','tools/build.py'])
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'offline':True}
checkpoint={'status':'Integrated playable release','referencePolicy':manifest['referencePolicy'],'characterFamilies':len(manifest['characters']),'runtimeFamilies':len(assets['sprites']),'nativeSelectedPoses':len(audit['poses']),'portraits':len(manifest['portraits']),'dedicatedHudPortraits':len(manifest['hudPortraits']),'worldImages':len(manifest['images']),'artifact':artifact,'incompleteClips':assets['pixelLabAudit']['incompleteClips'],'worldSystem':'Overworld with 14 points of interest and eight interiors','voiceClips':len(voice['lines']),'voiceProvider':voice['provider']}
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
