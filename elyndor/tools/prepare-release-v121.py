"""Prepare Alpha 1.21 notes and an explicit, verified publication manifest."""
from pathlib import Path
import hashlib,json,re,subprocess,sys
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'output/release121';PRE=ROOT/'elyndor/previews/release-v121'
OUT.mkdir(parents=True,exist_ok=True)
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
entry={'version':'Alpha Version 1.21','date':'November 6, 2026','title':'Connected roads and steadier journeys','items':[
 'Rebuilt all fifteen overworld destinations as natural miniature settlements and landmarks, with individual grounded buildings, open ruins, cave outcrops, shrine rings and irregular groves.',
 'Replanned destination approaches around the regional roads. Twenty geographically appropriate entrances now match their local exits; removed unused gates instead of placing an exit in every direction.',
 'Connected roads directly to the visible destination gateways and settlement centers. Dry curved approaches reuse existing river crossings, and the invisible woodland boundaries follow the revised paths.',
 'Rebuilt all seven overworld bridges with open stone arches, masonry details, parapets and endpoint lamps. Raised decks and graded approaches cross continuous water; relocated the river-fork crossing away from the mid-span land spur.',
 'Smoothed world-road surfaces and shoulders while keeping the terrain, real 3D world map, miniatures and bridge approaches aligned.',
 'Fixed black flashes caused by adaptive resolution changes. Canvas resizing now completes its replacement frame before presentation and skips unchanged dimensions.',
 'Preserved named arrival and return gates after the final scene is ready, including cached scenes. Entry and exit use connected, dry and walkable points on the appropriate side.',
 'Separated overworld companions with a longer collision-aware trail, including five-member parties, while preserving local-scene spacing and movement speed.',
 'Escape now opens the opening game menu during play, with Resume game and access to New Game, Continue, Load Game, Settings and Credits. Resuming preserves the current scene and party position.',
 'Stopped enemy hover from changing the selected combat target. Click and Tab / Shift+Tab choose living targets while the ring and arrow stay on the selected enemy.',
 'Stabilized the combat tutorial dock and its Begin Lesson / Continue controls so pointer movement no longer makes the prompt jitter.',
 'Enlarged enemy status icons and turn counters and expanded their display space, including phone combat layouts, while keeping the battlefield and timing controls clear.',
 'Matched centered world narration to the approved ivory serif treatment with a stronger diffuse dark glow and a title-case The World header. Kept the scene visible without a panel and corrected phone centering and wrapping.',
 'Fixed shopkeepers turning backward inside forward-facing idle and walking animations by selecting verified native PixelLab poses. Counter staff hold the customer-facing direction while idle and face customers during service interactions.',
 'Audited eight service-character sprite sets across all eight directions. Preserved their original pixel art, proportions and ground anchors; verified inn service, supplies and equipment purchases.'
]}
source=ROOT/'elyndor/title-v19.js';text=source.read_text(encoding='utf-8');prefix='const CHANGELOG19=';start=text.index(prefix)+len(prefix);notes,end=json.JSONDecoder().raw_decode(text[start:])
if '--metadata' not in sys.argv:
 if notes[0]['version']!=entry['version']:
  source.write_text(text[:start]+json.dumps([entry,*notes],ensure_ascii=False,separators=(',',':'))+text[start+end:],encoding='utf-8',newline='\n')
 body=(ROOT/'README.md').read_text(encoding='utf-8');heading='## '+entry['version']+' — '+entry['title']
 if heading not in body:
  section=heading+'\n\n'+entry['date']+'\n\n'+'\n'.join('- '+item for item in entry['items'])+'\n\nValidation and the standalone checksum are recorded in `elyndor/previews/release-v121/verification.json`. Final release checks use native Chrome; phone layouts use browser emulation. Existing PixelLab art retains its native resolution.\n\n'
  at=body.index('## Alpha Version');(ROOT/'README.md').write_text(body[:at]+section+body[at:],encoding='utf-8',newline='\n')
 print('Prepared Alpha 1.21 in-game and README changelogs.');sys.exit()
PRE.mkdir(parents=True,exist_ok=True)
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':digest(ROOT/'index.html'),'offline':True}
qa=read('output/release121/qa/results.json');assert qa['pass'] and not qa['errors'] and qa['artifact']==artifact
client=OUT/'skill-final';assert not list(client.glob('*error*'));moves=[json.loads((client/f'state-{i}.json').read_text(encoding='utf-8'))['player'] for i in range(2)];assert moves[0]!=moves[1]
client_hash=digest(ROOT/'output/req001/web_game_playwright_client.mjs');assert client_hash==digest(Path.home()/'.codex/skills/develop-web-game/scripts/web_game_playwright_client.js')
graph=read('elyndor/build-manifest.json');selected=read('elyndor/assets/source/pixellab-v7/manifest.json');audit=read('elyndor/assets/packed/audit.json')
bake=json.JSONDecoder().raw_decode((ROOT/'elyndor/world-bake-v36.js').read_text(encoding='utf-8').split('const BAKED_WORLD36=',1)[1])[0];assert all(digest(ROOT/k)==v for k,v in bake['inputs'].items())
source_paths={f'elyndor/{p}' for group in graph['sections'].values() for p in group}|{f'elyndor/{p}' for p in graph['styles']}
source_paths|={'elyndor/index.source.html','elyndor/build-manifest.json','elyndor/tools/build.py','elyndor/tools/build-v7.py','elyndor/tools/asset_bundle_v36.py','elyndor/tools/pixellab-pack.py','elyndor/tools/bake-traversal-terrain.mjs','elyndor/tools/bake-world-v36.mjs'}
summary={'artifact':artifact,'source':{p:digest(ROOT/p) for p in sorted(source_paths)},'finalStandalone':qa,'standardClient':{'sha256':client_hash,'unchanged':True,'movement':moves,'browserErrors':[]},'nativeAssetAudit':{'runtimeFamilies':audit['spriteCount'],'poses':len(audit['poses'])},'componentEvidence':{'combatAndArrival':'Local 070: stable tutorial, explicit target selection, status icon and party-trail checks passed.','connectedWorld':'Local 071: all 20 named entrances and exits / 40 native transitions passed; all seven bridges cross continuous water with dry walkable approaches.','narrationAndSprites':'Local 072: 64 direction cases / 640 native service animation entries, 32 counter idle cases, 12 service interactions, five narration scene conditions and seven phone layouts passed.'},'scope':'Final standalone checked in native Chrome on the test PC. Earlier component checks describe their own local artifacts. Phone layouts use browser emulation; physical-phone performance has not been established.'}
(PRE/'verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
old=read('output/release121/previous-release.json');previous={'commit':'453f973d544d88d4f8ee146f3d4a8bc13a4a2cd2','version':old['version'],'sha256':old['artifact']['sha256']}
old.update(release='elyndor-alpha-1.21-connected-world-2026-11-06',version=entry['version'],artifact=artifact,changes=entry['items'],releaseNotes=notes,previousPublishedRelease=previous,validation={'file':'elyndor/previews/release-v121/verification.json','sha256':digest(PRE/'verification.json'),'finalStandalone':'PASS','nativeAssetAudit':summary['nativeAssetAudit']})
old['githubHistory']['previousRelease']=previous['commit'];old['art'].update(packedSpritePoses=len(audit['poses']),runtimeFamilies=audit['spriteCount'],newBundledImages=0,newImageKeys=[],referencePolicy='Existing native PixelLab sprites and surfaces. Verified front-facing source poses replace five backward-facing animation entries; no new generated or artificially upscaled artwork.')
old['performance']={'scope':'Adaptive-resolution repaint validated in native Chrome on the test PC. No universal frame-rate or physical-phone performance claim.','resizeAndRendering':qa['checks'].get('rendering',{}),'cachedBuildingReturns':qa['checks'].get('returns',[])}
(ROOT/'release.json').write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
names=source_paths|{'index.html','release.json','README.md','three.vendor.js','.nojekyll','elyndor/tools/prepare-release-v121.py','elyndor/assets/source/pixellab-v7/manifest.json','elyndor/assets/source/pixellab-v7/packed-review.json','.github/workflows/discord-changelog.yml','elyndor/tools/discord_changelog.py','elyndor/tools/test_discord_changelog.py','elyndor/docs/discord-changelog.md'}
for c in selected['characters']:
 folder=ROOT/c['folder'];names.add((folder/'metadata.json').relative_to(ROOT).as_posix());names.update(p.relative_to(ROOT).as_posix() for p in folder.rglob('*.png'))
for group in ['images','portraits','hudPortraits','guide']:names.update(selected.get(group,{}).values())
names.update(q['file'] for q in selected['loadingScreens'].values())
for name in ['elyndor/audio/manifest.json','elyndor/audio/sound-manifest.json']:
 names.add(name);data=read(name);names.update(q['file'] for q in data.get('lines',data.get('sounds',[])))
names|={f'elyndor/assets/source/pixellab-v7/combat65/{name}.png' for name in ['ability','status']};names.add('elyndor/previews/release-v121/verification.json')
from PIL import Image
for name in ['narration','innkeeper','overworld','main-menu','mobile-landscape','mobile-portrait']:
 with Image.open(OUT/'qa'/f'{name}.png') as im:im.convert('RGB').save(PRE/f'{name}.webp','WEBP',quality=90,method=4)
 names.add(f'elyndor/previews/release-v121/{name}.webp')
records=[]
for name in sorted(names):
 p=ROOT/name;assert p.is_file() and p.resolve().is_relative_to(ROOT.resolve()),name
 assert not name.startswith(('output/','design/','archive/')) and p.name!='progress.md' and not any(v.startswith('.env') for v in p.parts),name
 if p.suffix in ['.js','.css','.html','.json','.md','.py','.mjs','.yml']:
  text=p.read_text(encoding='utf-8');assert not re.search(r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}|[?&]X-Amz-|googleusercontent\.com|upload:[a-f0-9]{8}',text),name
 records.append({'file':name,'bytes':p.stat().st_size,'sha256':digest(p)})
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8',newline='\n');records.append({'file':'elyndor/previews/release-v121/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')})
(OUT/'publish-paths.nul').write_bytes(b'\0'.join(q['file'].encode() for q in records)+b'\0');(OUT/'records.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'version':entry['version'],'selectedFiles':len(records),'artifact':artifact,'publicationInputs':'PASS'}))
