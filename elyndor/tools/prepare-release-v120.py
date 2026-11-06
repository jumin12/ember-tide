"""Prepare the verified Alpha 1.20 release and its explicit publication file list."""
from pathlib import Path
import hashlib,json,re,subprocess,sys
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'output/release120';PRE=ROOT/'elyndor/previews/release-v120'
OUT.mkdir(parents=True,exist_ok=True)
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
entry={'version':'Alpha Version 1.20','date':'November 5, 2026','title':'Clearer combat and a smoother journey','items':[
 'Rebuilt mobile combat around a visible battlefield, compact party cards and a bottom command dock. Portrait and landscape layouts keep the fighters clear of controls and readouts.',
 'Aligned the battle camera, painted backgrounds and 3D ground. Landscape scenes retain the lower clearing so characters stay planted in both day and night.',
 'Made phone rotation resize the battle render immediately. Whole-device-pixel rendering, up to 2x on compatible phones, keeps the original sprites sharper; Performance mode retains its lighter render budget.',
 'Moved optional combat guidance into Help on phones while preserving held tutorial lessons, Continue controls, MP costs and the full icon legend.',
 'Kept tutorial prompts and enemy HP panels clear of the attack timing meter on desktop and phones. Three-hit attack chains and target selection retain their normal controls.',
 'Defeating the selected enemy now moves selection to a living enemy automatically. Target arrows and rings disappear when no valid enemy remains.',
 'Rebuilt treasure chests with a hollow lined interior, curved wooden lid, brass fittings and a smooth hinge animation with a brief glow and drifting motes.',
 'Opened chests stay open after returning. Stable chest identities across town districts preserve old saves and prevent repeated loot grants.',
 'Restored reliable inn and shop interaction anchors on the customer side of counters. Hosts and vendors face customers from their actual positions before service menus open.',
 'Added confirmation and cancel controls for abandoning accepted optional requests in the Journal. Abandoned requests can be accepted again; story objectives and claimed rewards remain protected.',
 'Moved blocked local request objectives onto connected, walkable paths. A Clear Way Home can be completed inside the playable boundary, with rewards granted once.',
 'Restored the map marker and interaction for A Choice of Restraint in Fern Hollow when Tavin is the controlled character.',
 'Made POI re-entry follow the current approach side instead of a remembered previous exit. Interaction anchors remain aligned with their visible diorama gateways.',
 'Restored Escape menu access beside overworld destination prompts. Resume game / Esc and a prominent Main menu button now appear at the top of Settings.',
 'Revealed the complete minimap layout immediately inside entered towns, interiors and other local locations. Overworld exploration and undiscovered service details retain their discovery rules.',
 'Straightened Fern Hollow camera alignment and kept its north/south road centred on the leader.',
 'Corrected sprite depth at walls and counters, removing false silhouettes while preserving the outline when scenery truly hides a character.',
 'Rebalanced overworld party size for readability while preserving proportions, local-scene scale, movement speed and collision. Mirrored sprites keep their upright vertical scale.',
 'Refined phone exploration, maps, menus, weather, touch controls and the developer console across portrait and landscape screens, including safe areas and scrolling.',
 'Replaced four outdated loading images with native 1920x1080 game photographs showing walking, conversation, shopping and reading, with characters clear of furniture.',
 'Reused the completed continent during travel and retained one town exterior while visiting its buildings. Cached GPU resources avoid repeated rebuilding and shader preparation on return.',
 'Bounded nearby weather preparation and packed visible rain into one batch. Detached hidden rain cells prevent duplicate draws after building visits, and fine grass avoids a redundant animated shadow pass.',
 'Kept atmospheric haze and sun shafts above horizontal ground so paving and terrain shadows stay clear while the surrounding air retains its atmosphere.'
]}
source=ROOT/'elyndor/title-v19.js';text=source.read_text(encoding='utf-8');prefix='const CHANGELOG19=';start=text.index(prefix)+len(prefix);notes,end=json.JSONDecoder().raw_decode(text[start:])
if '--metadata' not in sys.argv:
 if notes[0]['version']!=entry['version']:
  source.write_text(text[:start]+json.dumps([entry,*notes],ensure_ascii=False,separators=(',',':'))+text[start+end:],encoding='utf-8',newline='\n')
 readme=ROOT/'README.md';body=readme.read_text(encoding='utf-8');heading='## '+entry['version']+' — '+entry['title']
 if heading not in body:
  section=heading+'\n\n'+entry['date']+'\n\n'+'\n'.join('- '+s for s in entry['items'])+'\n\nValidation and the standalone checksum are recorded in `elyndor/previews/release-v120/verification.json`. Layout checks use native Chrome with emulated phone screens. Performance figures describe the test PC; physical-phone frame rates have not been established. Battle art retains its approved native PixelLab resolution.\n\n'
  pos=body.index('## Alpha Version');readme.write_text(body[:pos]+section+body[pos:],encoding='utf-8',newline='\n')
 print('Prepared Alpha 1.20 in-game and README changelogs.');sys.exit()

PRE.mkdir(parents=True,exist_ok=True);old=read('output/release120/previous-release.json');artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':digest(ROOT/'index.html'),'offline':True}
qa=read('output/release120/qa/results.json');assert not qa['errors'] and qa['pass'] and qa['artifact']==artifact
client=OUT/'skill';assert not list(client.glob('*error*'));moves=[json.loads((client/f'state-{i}.json').read_text(encoding='utf-8'))['player'] for i in range(2)];assert moves[0]!=moves[1]
client_hash=digest(ROOT/'output/req001/web_game_playwright_client.mjs');assert client_hash==digest(Path.home()/'.codex/skills/develop-web-game/scripts/web_game_playwright_client.js')
graph=read('elyndor/build-manifest.json');selected=read('elyndor/assets/source/pixellab-v7/manifest.json');audit=read('elyndor/assets/packed/audit.json')
bake=json.JSONDecoder().raw_decode((ROOT/'elyndor/world-bake-v36.js').read_text(encoding='utf-8').split('const BAKED_WORLD36=',1)[1])[0];assert all(digest(ROOT/k)==v for k,v in bake['inputs'].items())
source_paths={f'elyndor/{p}' for group in graph['sections'].values() for p in group}|{f'elyndor/{p}' for p in graph['styles']}
source_paths|={'elyndor/index.source.html','elyndor/build-manifest.json','elyndor/tools/build.py','elyndor/tools/build-v7.py','elyndor/tools/asset_bundle_v36.py','elyndor/tools/pixellab-pack.py','elyndor/tools/bake-traversal-terrain.mjs','elyndor/tools/bake-world-v36.mjs'}
summary={'artifact':artifact,'source':{p:digest(ROOT/p) for p in sorted(source_paths)},'finalStandalone':qa,'component068':read('output/inprogress068/final-checks.json'),'component069':read('output/local069/final-validation.json'),'phoneGroundContact':read('output/local069/stages/results.json')['results']['contact'],'nativeAssetAudit':{'runtimeFamilies':len({q['id'] for q in audit['poses']}),'poses':len(audit['poses'])},'scope':'Final standalone checked in native Chrome on the test PC. Earlier local component evidence describes its own tested artifact. Phone screen sizes and touch are browser emulation; physical-phone performance has not been measured.'}
summary['standardClient']={'sha256':client_hash,'unchanged':True,'movement':moves,'browserErrors':[]};summary['chestInspection']=read('output/release120/qa/chest-proof.json');assert not summary['chestInspection']['errors']
(PRE/'verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
previous={'commit':'3248d100523a1d9f6eeb058282ecb10be6db77b4','version':old['version'],'sha256':old['artifact']['sha256']}
old.update(release='elyndor-alpha-1.20-combat-and-journey-2026-11-05',version=entry['version'],artifact=artifact,changes=entry['items'],releaseNotes=notes,previousPublishedRelease=previous,validation=summary)
old['githubHistory']['previousRelease']=previous['commit'];old['art'].update(packedSpritePoses=len(audit['poses']),runtimeFamilies=51,newBundledImages=4,newImageKeys=list(selected['loadingScreens']),referencePolicy='Existing native PixelLab character and environment art; four native in-engine loading photographs. No artwork was artificially upscaled.')
old['performance']={'scope':'Native Chrome on the test PC. Repeated building returns include fades; first visits still construct destinations. These measurements do not establish physical-phone frame rates.','finalRelease':qa['checks'].get('returns',[]),'componentReturnMilliseconds':[q['ms'] for q in read('output/local069/finish/results.json')['results']['returns']],'componentRain':read('output/local069/last-pass/results.json')['results']['rain']}
(ROOT/'release.json').write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
names=source_paths|{'index.html','release.json','README.md','three.vendor.js','.nojekyll','elyndor/tools/prepare-release-v120.py','elyndor/assets/source/pixellab-v7/manifest.json','.github/workflows/discord-changelog.yml','elyndor/tools/discord_changelog.py','elyndor/tools/test_discord_changelog.py','elyndor/docs/discord-changelog.md'}
for c in selected['characters']:
 folder=ROOT/c['folder'];names.add((folder/'metadata.json').relative_to(ROOT).as_posix());names.update(p.relative_to(ROOT).as_posix() for p in folder.rglob('*.png'))
for group in ['images','portraits','hudPortraits','guide']:names.update(selected.get(group,{}).values())
names.update(q['file'] for q in selected['loadingScreens'].values())
for name in ['elyndor/audio/manifest.json','elyndor/audio/sound-manifest.json']:
 names.add(name);data=read(name);names.update(q['file'] for q in data.get('lines',data.get('sounds',[])))
names|={f'elyndor/assets/source/pixellab-v7/combat65/{name}.png' for name in ['ability','status']}
names.add('elyndor/previews/release-v120/verification.json')
for name in ['mobile-landscape','mobile-portrait','chest-open','main-menu']:
 from PIL import Image
 with Image.open(OUT/'qa'/f'{name}.png') as im:im.convert('RGB').save(PRE/f'{name}.webp','WEBP',quality=90,method=4)
 names.add(f'elyndor/previews/release-v120/{name}.webp')
records=[]
for name in sorted(names):
 p=ROOT/name;assert p.is_file() and p.resolve().is_relative_to(ROOT.resolve()),name
 assert not name.startswith(('output/','design/','archive/')) and p.name!='progress.md' and not any(v.startswith('.env') for v in p.parts),name
 if p.suffix in ['.js','.css','.html','.json','.md','.py','.mjs','.yml']:
  text=p.read_text(encoding='utf-8');assert not re.search(r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}|[?&]X-Amz-|googleusercontent\.com|upload:[a-f0-9]{8}',text),name
 records.append({'file':name,'bytes':p.stat().st_size,'sha256':digest(p)})
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8',newline='\n');records.append({'file':'elyndor/previews/release-v120/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')})
(OUT/'publish-paths.nul').write_bytes(b'\0'.join(q['file'].encode() for q in records)+b'\0');(OUT/'records.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'version':entry['version'],'selectedFiles':len(records),'artifact':artifact,'publicationInputs':'PASS'}))
