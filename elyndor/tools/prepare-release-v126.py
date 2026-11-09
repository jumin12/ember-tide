"""Prepare Alpha 1.26 notes and curated, privacy-checked publication inputs."""
from pathlib import Path
from PIL import Image
import hashlib,json,re,subprocess,sys
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'output/release126';PRE=ROOT/'elyndor/previews/release-v126';OUT.mkdir(parents=True,exist_ok=True)
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8'))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
entry={'version':'Alpha Version 1.26','date':'November 9, 2026','title':'HD worlds and living scenery','items':[
 'Replaced all twenty battle landscapes with newly generated native HD day/night pairs. Refined panorama size, perspective, distant focus and sampling while keeping characters and interface text sharp.',
 'Matched physical battle scenery to each landscape: ruined arcades, orchard walls and sheds, cypress avenues, cave crystals, alpine ledges, snowy cornices, coastal chalk, windmills, standing stones and seasonal planting.',
 'Added regional battle mist, light shafts, waterfall spray, sea haze, smoke, cold drift, crystal light and moving foliage. Cinematic and action cameras retain bounded landscape coverage across desktop and phone views.',
 'Replaced environment surface art throughout the overworld, POIs, interiors and battles with native HD materials and matched normal, roughness and surface data. Wood, soil and stone remain matte; glass, polished metals and water retain their appropriate reflections.',
 'Introduced varied meadow, forest-floor, trail and paving textures, with irregular patches and continuous world-space blending to reduce repeated ground patterns.',
 'Rebuilt grass, ferns, flowers, leaves and connected woody shoots as modeled 3D vegetation. Added fuller species-specific crowns, needle clusters, orchard blossoms, autumn colors, snow cover and wind motion shared with their shadows.',
 'Reworked rocks into varied weathered forms with rounded edges, strata, cracks, mineral detail and habitat-aware moss. Added location-specific gardens, undergrowth, scree and coastal planting.',
 'Made battle planting follow the actual paving, slope, rock, water and building-footing exclusions. Removed the retained old grass pass from stone floors and kept the fighting field readable.',
 'Replaced plaster window panels with reflective glazing and recessed room imagery. Corrected authored house and hall orientations toward their streets, completed residential walls and gables, and fitted masonry bases and entrance treads to the terrain.',
 'Rebuilt town wells with hollow stone bowls, recessed rippling water and connected posts, winding beams, ropes and buckets.',
 'Refined landscape lighting, sky fill, air depth and material response. Updated river normals, shallow-water detail, foam and caustics while preserving the exact shared water join between POIs and their background.',
 'Cleared large foreground tree crowns from the party view without removing their shadows or reflections. Refreshed loading views, retained bounded phone texture budgets, and preserved the approved party, NPC, monster and interface artwork.'
]}
notesSource=ROOT/'elyndor/title-v19.js';text=notesSource.read_text(encoding='utf-8');start=text.index('const CHANGELOG19=')+len('const CHANGELOG19=');notes,end=json.JSONDecoder().raw_decode(text[start:]);notes=[entry,*[r for r in notes if r['version']!=entry['version']]]
if '--metadata' not in sys.argv:
 old=read('release.json');(OUT/'previous-release.json').write_text(json.dumps(old,indent=2)+'\n')
 notesSource.write_text(text[:start]+json.dumps(notes,ensure_ascii=False,separators=(',',':'))+text[start+end:],encoding='utf-8',newline='\n')
 p=ROOT/'README.md';s=p.read_text(encoding='utf-8');heading='## '+entry['version']+' — '+entry['title']
 if heading not in s:
  section=heading+'\n\n'+entry['date']+'\n\n'+'\n'.join('- '+v for v in entry['items'])+'\n\nRelease evidence and checksums: `elyndor/previews/release-v126/verification.json`. Native Chrome checks include browser-emulated phone layouts. HD material files are served alongside the main game HTML.\n\n';at=s.index('## Alpha Version');s=s[:at]+section+s[at:]
 p.write_text(s,encoding='utf-8',newline='\n');(OUT/'entry.json').write_text(json.dumps(entry,indent=2)+'\n');print(json.dumps({'version':entry['version'],'changelogItems':len(entry['items'])}));sys.exit()

PRE.mkdir(parents=True,exist_ok=True);artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':digest(ROOT/'index.html'),'offline':False,'delivery':'HTML with same-origin native HD environment assets'}
qa=read('output/release126/qa/results.json');assert qa['pass'] and not qa['errors'] and qa['artifact']==artifact
assert not list((OUT/'skill-final').glob('errors-*.json'))
states=[read('output/release126/skill-final/state-'+str(i)+'.json') for i in range(2)];assert states[0]['player']!=states[1]['player']
graph=read('elyndor/build-manifest.json');sourcePaths={f'elyndor/{p}' for group in graph['sections'].values() for p in group}|{f'elyndor/{p}' for p in graph['styles']}
sourcePaths|={'elyndor/index.source.html','elyndor/build-manifest.json','elyndor/tools/build.py','elyndor/tools/build-v7.py','elyndor/tools/asset_bundle_v36.py','elyndor/tools/pixellab-pack.py','elyndor/tools/bake-traversal-terrain.mjs','elyndor/tools/bake-world-v36.mjs','elyndor/tools/battle_assets_v99.py','elyndor/tools/battle_materials_v100.py','elyndor/tools/battle_props_v101.py','elyndor/tools/world_materials_v102.py','elyndor/tools/environment_materials_v103.py','elyndor/tools/prepare-release-v126.py'}
bake=json.JSONDecoder().raw_decode((ROOT/'elyndor/world-bake-v36.js').read_text(encoding='utf-8').split('const BAKED_WORLD36=',1)[1])[0];assert all(digest(ROOT/k)==v for k,v in bake['inputs'].items())
checks=read('output/world104/final-check.json');summary={'artifact':artifact,'finalRelease':qa,'componentEvidence':{'scenery':checks,'scope':'Component evidence belongs to the final local scenery build before changelog packaging. Final release checks cover the published runtime and dependency files.'},'source':{p:digest(ROOT/p) for p in sorted(sourcePaths)},'standardClient':{'movement':[s['player'] for s in states],'browserErrors':[]},'scope':'Native Chrome on the test PC, with browser emulation for phone layouts. No physical-phone performance or universal frame-rate claim.'}
(PRE/'verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
old=read('output/release126/previous-release.json');previous={'commit':'3f139825535c6f02383369edde282b8a82742435','version':old['version'],'sha256':old['artifact']['sha256']};old.update(release='elyndor-alpha-1.26-hd-worlds-living-scenery-2026-11-09',version=entry['version'],artifact=artifact,changes=entry['items'],releaseNotes=notes,previousPublishedRelease=previous,validation={'file':'elyndor/previews/release-v126/verification.json','sha256':digest(PRE/'verification.json'),'finalRelease':'PASS','sceneryViews':16,'pairedBattleViews':40})
old['githubHistory']['previousRelease']=previous['commit'];old['art'].update(generator='PixelLab character/UI art and built-in image_gen HD environment art',referencePolicy='Approved native party, NPC, monster and UI artwork preserved. Forty native HD day/night battle landscapes and ninety-three environment assets; no artificial image upscaling.',newBundledImages=133,battleBackgrounds=40,nativeBattleResolution=[1672,941],nativeEnvironmentResolution='Native dimensions recorded per asset; commonly 1254 square',runtimeFamilies=51,packedSpritePoses=6044);old['art'].pop('newImageKeys',None)
old['performance']={'scope':'Final native Chrome functional/resource checks and emulated phone layouts; no universal frame-rate claim.','textureBudgets':{'desktopAlbedo':1024,'touchAlbedo':768,'dataMaps':512},'battleCleanup':qa['checks'].get('cleanup',{})}
(ROOT/'release.json').write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
names=sourcePaths|{'index.html','release.json','README.md','elyndor/README.md','three.vendor.js','.nojekyll','elyndor/assets/source/pixellab-v7/manifest.json','elyndor/assets/source/pixellab-v7/packed-review.json','.github/workflows/discord-changelog.yml','elyndor/tools/discord_changelog.py','elyndor/tools/test_discord_changelog.py','elyndor/docs/discord-changelog.md','elyndor/previews/release-v126/verification.json'}
selected=read('elyndor/assets/source/pixellab-v7/manifest.json')
for c in selected['characters']:
 folder=ROOT/c['folder'];names.add((folder/'metadata.json').relative_to(ROOT).as_posix());names.update(p.relative_to(ROOT).as_posix() for p in folder.rglob('*.png'))
for group in ['images','portraits','hudPortraits','guide']:names.update(selected.get(group,{}).values())
names.update(q['file'] for q in selected['loadingScreens'].values());names|={f'elyndor/assets/source/pixellab-v7/combat65/{name}.png' for name in ['ability','status']}
for name in ['elyndor/audio/manifest.json','elyndor/audio/sound-manifest.json']:
 names.add(name);d=read(name);names.update(q['file'] for q in d.get('lines',d.get('sounds',[])))
names.add('elyndor/audio/catalog.json')
libraries=['battle-hd-v99','battle-materials-v100','battle-props-v101','world-hd-v102','environment-pbr-v103','scenery-v104'];overrides={}
def scrub(v):
 if isinstance(v,list):return [scrub(q) for q in v]
 if isinstance(v,dict):return {k:scrub(q) for k,q in v.items() if k not in {'master','source','prompt','sourcePath','generated','receipt','downloadUrl','download_url','originalUrl'}}
 return v
for library in libraries:
 folder=ROOT/'elyndor/assets/source'/library
 names.update(p.relative_to(ROOT).as_posix() for p in folder.rglob('*') if p.is_file() and p.suffix in {'.webp','.png'})
 for name in ['manifest.json','registry.json','loading/manifest.json']:
  p=folder/name
  if p.exists():
   rel=p.relative_to(ROOT).as_posix();names.add(rel);target=OUT/'public'/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(scrub(json.loads(p.read_text(encoding='utf-8'))),indent=2)+'\n',encoding='utf-8');overrides[rel]=target
for name,p in {'changelog':OUT/'qa/changelog.png','overworld':ROOT/'output/world104/after/overworld.png','village':ROOT/'output/world104/after/brookstead.png','windows-day':ROOT/'output/world104/facades/brookstead-day.png','windows-night':ROOT/'output/world104/facades/brookstead-night.png','battle-day':ROOT/'output/world104/battles/woodland-day.png','battle-night':ROOT/'output/world104/battles/woodland-night.png','mobile-portrait':ROOT/'output/world104/mobile/battle-390x844.png','mobile-landscape':ROOT/'output/world104/mobile/battle-844x390.png'}.items():
 with Image.open(p) as im:im.convert('RGB').save(PRE/(name+'.webp'),'WEBP',quality=90,method=4)
 names.add((PRE/(name+'.webp')).relative_to(ROOT).as_posix())
records=[]
for name in sorted(names):
 p=overrides.get(name,ROOT/name);assert p.is_file() and p.resolve().is_relative_to(ROOT.resolve()),name
 assert not name.startswith(('output/','design/','archive/')) and Path(name).name!='progress.md',name
 if p.suffix in {'.js','.css','.html','.json','.md','.py','.mjs','.yml'}:
  body=p.read_text(encoding='utf-8');assert not re.search(r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}|[?&]X-Amz-|googleusercontent\.com|upload:[a-f0-9]{8}|C:[\\/]+Users[\\/]',body),name
 records.append({'file':name,'bytes':p.stat().st_size,'sha256':digest(p),**({'override':p.relative_to(ROOT).as_posix()} if name in overrides else {})})
(PRE/'files.json').write_text(json.dumps([{k:v for k,v in r.items() if k!='override'} for r in records],indent=2)+'\n');records.append({'file':'elyndor/previews/release-v126/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')})
(OUT/'publish-paths.nul').write_bytes(b'\0'.join(r['file'].encode() for r in records)+b'\0');(OUT/'records.json').write_text(json.dumps(records,indent=2)+'\n');print(json.dumps({'version':entry['version'],'selectedFiles':len(records),'publicMetadataOverrides':len(overrides),'artifact':artifact}))
