"""Prepare Alpha 1.23 notes and the exact, curated publication inputs."""
from pathlib import Path
import hashlib,json,re,subprocess,sys

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/release123'
PRE=ROOT/'elyndor/previews/release-v123'
OUT.mkdir(parents=True,exist_ok=True)

def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()

entry={'version': 'Alpha Version 1.23', 'date': 'November 8, 2026', 'title': 'Richer battles and sharper phone visuals', 'items': ['Placed enemies on the left and the party on the right in staggered rows, with spacing fitted to the actual character silhouettes across desktop, ultrawide and phone layouts.', 'Refined battle distance and perspective, lowered the portrait-phone camera, and preserved the proportions of the distant scenery.', 'Restored the eight cinematic reveals and the earlier attack-camera pans and pushes, with gentler phone motion, stable handoffs and respect for reduced-motion settings.', 'Bound cinematic and action cameras to the landscape coverage so reveals keep the picture edges and backstage space out of view. Corrected transparent borders and cloud blending around the paintings.', 'Shaped every battle stage around raised, uneven banks and a clear fighting hollow, with layered stone ledges and foreground framing that retain real depth during camera moves.', 'Added rooted groves, ferns, flowers, fallen wood, rubble, small stones, farm details and regional landmarks between the fighters and the original day/night paintings.', 'Gave all twenty stages regional lighting and ground palettes, with warmer orchards and sunsets, cooler snow and caves, and lighting matched to the selected daytime or nighttime landscape.', 'Added restrained background waterfall flow, moving water highlights, foliage and cloud shading, crystal glow, drifting leaves and airborne effects where they suit the scene.', 'Matched orchard trees to the green apple trees in their painting, added attached fruit, and restored snow cover to the snowfield branches.', 'Seated arch legs and building foundations on the terrain, rebuilt fence rails and royal walls to follow their banks, and connected stone bridge decks to their approaches.', 'Rendered common phone screens at their native 2x or 3x density within a pixel budget, preserved crisp sprite filtering, and reduced excessive battle blur on phones.', 'Enlarged small phone HUD, combat and menu labels and reduced text glow, while preserving the approved character artwork and its native pixel resolution.', 'Kept fighters grounded through screen rotation and deferred formation changes during active attacks. Characters return to the correct new positions when their action ends.', 'Kept scenery and effects batched, cached stable camera checks, retained low-quality rendering options, and verified that animations reuse geometry and battle resources are released on exit.']}

source=ROOT/'elyndor/title-v19.js'
text=source.read_text(encoding='utf-8')
start=text.index('const CHANGELOG19=')+len('const CHANGELOG19=')
notes,end=json.JSONDecoder().raw_decode(text[start:])
if '--metadata' not in sys.argv:
    notes=[entry,*[q for q in notes if q['version']!=entry['version']]]
    source.write_text(text[:start]+json.dumps(notes,ensure_ascii=False,separators=(',',':'))+text[start+end:],encoding='utf-8',newline='\n')
    p=ROOT/'README.md';body=p.read_text(encoding='utf-8')
    heading='## '+entry['version']+' — '+entry['title']
    if heading not in body:
        section=heading+'\n\n'+entry['date']+'\n\n'+'\n'.join('- '+v for v in entry['items'])+'\n\nRelease verification and the standalone checksum are recorded in `elyndor/previews/release-v123/verification.json`. Browser checks use native Chrome; phone layouts use browser emulation. Existing PixelLab images retain their native resolution.\n\n'
        at=body.index('## Alpha Version');p.write_text(body[:at]+section+body[at:],encoding='utf-8',newline='\n')
    print(json.dumps({'version':entry['version'],'changelogItems':len(entry['items'])}));sys.exit()

PRE.mkdir(parents=True,exist_ok=True)
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':digest(ROOT/'index.html'),'offline':True}
qa=read('output/release123/qa/results.json')
assert qa['pass'] and not qa['errors'] and qa['artifact']==artifact
client=OUT/'skill-final'
assert not list(client.glob('*error*'))
moves=[read('output/release123/skill-final/state-'+str(i)+'.json')['player'] for i in range(2)]
assert moves[0]!=moves[1]
client_hash=digest(ROOT/'output/req001/web_game_playwright_client.mjs')
assert client_hash==digest(Path.home()/'.codex/skills/develop-web-game/scripts/web_game_playwright_client.js')
graph=read('elyndor/build-manifest.json');selected=read('elyndor/assets/source/pixellab-v7/manifest.json');audit=read('elyndor/assets/packed/audit.json')
bake=json.JSONDecoder().raw_decode((ROOT/'elyndor/world-bake-v36.js').read_text(encoding='utf-8').split('const BAKED_WORLD36=',1)[1])[0]
assert all(digest(ROOT/k)==v for k,v in bake['inputs'].items())
source_paths={f'elyndor/{p}' for group in graph['sections'].values() for p in group}|{f'elyndor/{p}' for p in graph['styles']}
source_paths|={'elyndor/index.source.html','elyndor/build-manifest.json','elyndor/tools/build.py','elyndor/tools/build-v7.py','elyndor/tools/asset_bundle_v36.py','elyndor/tools/pixellab-pack.py','elyndor/tools/bake-traversal-terrain.mjs','elyndor/tools/bake-world-v36.mjs'}
summary={'artifact':artifact,'source':{p:digest(ROOT/p) for p in sorted(source_paths)},'finalStandalone':qa,'standardClient':{'sha256':client_hash,'unchanged':True,'movement':moves,'browserErrors':[]},'nativeAssetAudit':{'runtimeFamilies':audit['spriteCount'],'poses':len(audit['poses']),'sourceBoundaryWarnings':audit['sourceBoundaryWarnings']},'componentEvidence':{'battlePresentation': 'Local 091: reference side formations, lower portrait camera, eight reveal paths and original action-camera motion verified across eight layouts.', 'phoneClarityAndDepth': 'Local 092-093: six native-3x phone layouts, readable menus, physical raised terrain, grounded actors and complete scene cleanup verified.', 'stagePolishAndCameraBounds': 'Local 094: twenty day/night stage pairs, 5,200 sampled cinematic poses over desktop, portrait, landscape and selected ultrawide views, terrain-seated props, regional lighting and background effects verified.'},'scope':'The final standalone is checked in native Chrome on the test PC. Component reports refer to their recorded local builds. Phone layouts use browser emulation; no universal frame-rate, physical-phone performance or perfect generated-anatomy claim.'}
(PRE/'verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
old=read('output/release123/previous-release.json')
previous={'commit':'dd3a785b9c3096cd34c6d2e61178525dfd327fc1','version':old['version'],'sha256':old['artifact']['sha256']}
old.update(release='elyndor-alpha-1.23-richer-battles-sharper-phones-2026-11-08',version=entry['version'],artifact=artifact,changes=entry['items'],releaseNotes=notes,previousPublishedRelease=previous,validation={'file':'elyndor/previews/release-v123/verification.json','sha256':digest(PRE/'verification.json'),'finalStandalone':'PASS','nativeAssetAudit':summary['nativeAssetAudit']})
old['githubHistory']['previousRelease']=previous['commit']
old['art'].update(packedSpritePoses=len(audit['poses']),runtimeFamilies=audit['spriteCount'],referencePolicy='Native PixelLab party, NPC and environment artwork; approved Bren and Soren replacements, seventeen completed NPC replacements, thirteen staged NPC design previews, original paired landscape paintings. No artificial image upscaling.')
prior_art=json.loads(subprocess.check_output(['git','show','HEAD:elyndor/assets/source/pixellab-v7/manifest.json']))
changed_images=sorted(k for k,v in selected.get('images',{}).items() if prior_art.get('images',{}).get(k)!=v)
old['art'].update(newBundledImages=len(changed_images),newImageKeys=changed_images)
old['performance']={'scope':'Final native Chrome functional and resource checks on the test PC; no universal frame-rate or physical-phone performance claim.','rendering':qa['checks'].get('rendering',{}),'combatResourceCleanup':qa['checks'].get('cleanup',{})}
(ROOT/'release.json').write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
names=source_paths|{'index.html','release.json','README.md','three.vendor.js','.nojekyll','elyndor/tools/prepare-release-v123.py','elyndor/assets/source/pixellab-v7/manifest.json','elyndor/assets/source/pixellab-v7/packed-review.json','.github/workflows/discord-changelog.yml','elyndor/tools/discord_changelog.py','elyndor/tools/test_discord_changelog.py','elyndor/docs/discord-changelog.md','elyndor/previews/release-v123/verification.json'}
for c in selected['characters']:
    folder=ROOT/c['folder'];names.add((folder/'metadata.json').relative_to(ROOT).as_posix());names.update(p.relative_to(ROOT).as_posix() for p in folder.rglob('*.png'))
for group in ['images','portraits','hudPortraits','guide']:names.update(selected.get(group,{}).values())
names.update(q['file'] for q in selected['loadingScreens'].values())
for name in ['elyndor/audio/manifest.json','elyndor/audio/sound-manifest.json']:
    names.add(name);data=read(name);names.update(q['file'] for q in data.get('lines',data.get('sounds',[])))
names|={f'elyndor/assets/source/pixellab-v7/combat65/{name}.png' for name in ['ability','status']}
names.add('elyndor/audio/catalog.json')
from PIL import Image
for name in ['changelog','bren','soren','npc-browser','interior','overworld','battle-day','battle-night','mobile-landscape','mobile-portrait']:
    with Image.open(OUT/'qa'/f'{name}.png') as im:im.convert('RGB').save(PRE/f'{name}.webp','WEBP',quality=90,method=4)
    names.add(f'elyndor/previews/release-v123/{name}.webp')
records=[]
for name in sorted(names):
    p=ROOT/name;assert p.is_file() and p.resolve().is_relative_to(ROOT.resolve()),name
    assert not name.startswith(('output/','design/','archive/')) and p.name!='progress.md' and not any(v.startswith('.env') for v in p.parts),name
    if p.suffix in ['.js','.css','.html','.json','.md','.py','.mjs','.yml']:
        text=p.read_text(encoding='utf-8');assert not re.search(r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}|[?&]X-Amz-|googleusercontent\.com|upload:[a-f0-9]{8}',text),name
    records.append({'file':name,'bytes':p.stat().st_size,'sha256':digest(p)})
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8',newline='\n')
records.append({'file':'elyndor/previews/release-v123/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')})
(OUT/'publish-paths.nul').write_bytes(b'\0'.join(q['file'].encode() for q in records)+b'\0')
(OUT/'records.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'version':entry['version'],'selectedFiles':len(records),'artifact':artifact,'publicationInputs':'PASS'}))
