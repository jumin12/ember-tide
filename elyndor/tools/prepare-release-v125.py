"""Prepare Alpha 1.25 notes and the exact, curated publication inputs."""
from pathlib import Path
import hashlib,json,re,subprocess,sys

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/release125'
PRE=ROOT/'elyndor/previews/release-v125'
OUT.mkdir(parents=True,exist_ok=True)

def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()

entry={'version': 'Alpha Version 1.25', 'date': 'November 8, 2026', 'title': 'Four-person parties and clearer battle staging', 'items': ['Limited the active traveling and combat party to four companions.', 'Added reserve companion controls to Party. Swap companions while exploring without losing their levels, equipment, HP or MP; story play keeps Bren in the active party.', 'Migrated existing five-person saves to four active companions plus a reserve, preserving all five characters and their progress.', 'Reframed combat around the reference composition: larger fighters, two staggered party ranks on the right, enemies on the left and a full-viewport desktop camera. The hooked-beak bird now uses its larger battle scale without enlarging overworld wildlife.', 'Refined distant landscape framing, clearing soil and planted scenery. Foreground trees are placed clear of the fighters, keeping faces and weapons visible.', 'Moved phone NPC and monster cards beneath their targets in portrait and landscape. Crowded large enemies use a compact row below the group, with individual connectors and working target taps.', 'Kept status effects, counters and discovered weaknesses visible on phone enemy cards, using consistently sized native icons in a horizontally scrollable row.', 'Updated the dev battle tester to use four as its full-party limit and retain a chosen four-person lineup when starting another battle.']}

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
        section=heading+'\n\n'+entry['date']+'\n\n'+'\n'.join('- '+v for v in entry['items'])+'\n\nRelease verification and the standalone checksum are recorded in `elyndor/previews/release-v125/verification.json`. Browser checks use native Chrome; phone layouts use browser emulation. Existing PixelLab images retain their native resolution.\n\n'
        at=body.index('## Alpha Version');p.write_text(body[:at]+section+body[at:],encoding='utf-8',newline='\n')
    print(json.dumps({'version':entry['version'],'changelogItems':len(entry['items'])}));sys.exit()

PRE.mkdir(parents=True,exist_ok=True)
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':digest(ROOT/'index.html'),'offline':True}
qa=read('output/release125/qa/results.json')
assert qa['pass'] and not qa['errors'] and qa['artifact']==artifact
client=OUT/'skill-final'
assert not list(client.glob('*error*'))
moves=[read('output/release125/skill-final/state-'+str(i)+'.json')['player'] for i in range(2)]
assert moves[0]!=moves[1]
client_hash=digest(ROOT/'output/req001/web_game_playwright_client.mjs')
assert client_hash==digest(Path.home()/'.codex/skills/develop-web-game/scripts/web_game_playwright_client.js')
graph=read('elyndor/build-manifest.json');selected=read('elyndor/assets/source/pixellab-v7/manifest.json');audit=read('elyndor/assets/packed/audit.json')
bake=json.JSONDecoder().raw_decode((ROOT/'elyndor/world-bake-v36.js').read_text(encoding='utf-8').split('const BAKED_WORLD36=',1)[1])[0]
assert all(digest(ROOT/k)==v for k,v in bake['inputs'].items())
source_paths={f'elyndor/{p}' for group in graph['sections'].values() for p in group}|{f'elyndor/{p}' for p in graph['styles']}
source_paths|={'elyndor/index.source.html','elyndor/build-manifest.json','elyndor/tools/build.py','elyndor/tools/build-v7.py','elyndor/tools/asset_bundle_v36.py','elyndor/tools/pixellab-pack.py','elyndor/tools/bake-traversal-terrain.mjs','elyndor/tools/bake-world-v36.mjs'}
summary={'artifact':artifact,'source':{p:digest(ROOT/p) for p in sorted(source_paths)},'finalStandalone':qa,'standardClient':{'sha256':client_hash,'unchanged':True,'movement':moves,'browserErrors':[]},'nativeAssetAudit':{'runtimeFamilies':audit['spriteCount'],'poses':len(audit['poses']),'sourceBoundaryWarnings':audit['sourceBoundaryWarnings']},'componentEvidence':{'localStagingReview': 'Local 096: five visual comparison passes; four-member cap, legacy five-member save migration, reserve swaps, unchanged character progression, dev-lineup retention, real action returns and cleanup verified.', 'responsiveCombat': 'Local 096: thirty-six phone card layouts, eighteen real story encounters, forty day/night stage renders, 130 cinematic layout/time cases and 5,200 reveal poses, three native-DPR emulated phone sizes and four nine-icon card stress sizes verified.', 'nativeArt': 'Existing native PixelLab art was reused unchanged. Camera, actor sizing, planted scenery and interface layout were revised; no source images were regenerated or artificially upscaled.'},'scope':'The final standalone is checked in native Chrome on the test PC. Component reports refer to their recorded local builds. Phone layouts use browser emulation; no universal frame-rate, physical-phone performance or perfect generated-anatomy claim.'}
(PRE/'verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
old=read('output/release125/previous-release.json')
previous={'commit':'b761868848688545b9ba6184f27dc881ada3d972','version':old['version'],'sha256':old['artifact']['sha256']}
old.update(release='elyndor-alpha-1.25-four-person-parties-battle-staging-2026-11-08',version=entry['version'],artifact=artifact,changes=entry['items'],releaseNotes=notes,previousPublishedRelease=previous,validation={'file':'elyndor/previews/release-v125/verification.json','sha256':digest(PRE/'verification.json'),'finalStandalone':'PASS','nativeAssetAudit':summary['nativeAssetAudit']})
old['githubHistory']['previousRelease']=previous['commit']
old['art'].update(packedSpritePoses=len(audit['poses']),runtimeFamilies=audit['spriteCount'],referencePolicy='Native PixelLab party, NPC and environment artwork; approved Bren and Soren replacements, seventeen completed NPC replacements, thirteen staged NPC design previews, original paired landscape paintings. No artificial image upscaling.')
prior_art=json.loads(subprocess.check_output(['git','show','HEAD:elyndor/assets/source/pixellab-v7/manifest.json']))
changed_images=sorted(k for k,v in selected.get('images',{}).items() if prior_art.get('images',{}).get(k)!=v)
old['art'].update(newBundledImages=len(changed_images),newImageKeys=changed_images)
old['performance']={'scope':'Final native Chrome functional and resource checks on the test PC; no universal frame-rate or physical-phone performance claim.','rendering':qa['checks'].get('rendering',{}),'combatResourceCleanup':qa['checks'].get('cleanup',{})}
(ROOT/'release.json').write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
names=source_paths|{'index.html','release.json','README.md','three.vendor.js','.nojekyll','elyndor/tools/prepare-release-v125.py','elyndor/assets/source/pixellab-v7/manifest.json','elyndor/assets/source/pixellab-v7/packed-review.json','.github/workflows/discord-changelog.yml','elyndor/tools/discord_changelog.py','elyndor/tools/test_discord_changelog.py','elyndor/docs/discord-changelog.md','elyndor/previews/release-v125/verification.json'}
for c in selected['characters']:
    folder=ROOT/c['folder'];names.add((folder/'metadata.json').relative_to(ROOT).as_posix());names.update(p.relative_to(ROOT).as_posix() for p in folder.rglob('*.png'))
for group in ['images','portraits','hudPortraits','guide']:names.update(selected.get(group,{}).values())
names.update(q['file'] for q in selected['loadingScreens'].values())
for name in ['elyndor/audio/manifest.json','elyndor/audio/sound-manifest.json']:
    names.add(name);data=read(name);names.update(q['file'] for q in data.get('lines',data.get('sounds',[])))
names|={f'elyndor/assets/source/pixellab-v7/combat65/{name}.png' for name in ['ability','status']}
names.add('elyndor/audio/catalog.json')
from PIL import Image
for name in ['changelog','bren','soren','npc-browser','interior','overworld','battle-day','battle-night','mobile-landscape','mobile-portrait','party-reserves']:
    with Image.open(OUT/'qa'/f'{name}.png') as im:im.convert('RGB').save(PRE/f'{name}.webp','WEBP',quality=90,method=4)
    names.add(f'elyndor/previews/release-v125/{name}.webp')
records=[]
for name in sorted(names):
    p=ROOT/name;assert p.is_file() and p.resolve().is_relative_to(ROOT.resolve()),name
    assert not name.startswith(('output/','design/','archive/')) and p.name!='progress.md' and not any(v.startswith('.env') for v in p.parts),name
    if p.suffix in ['.js','.css','.html','.json','.md','.py','.mjs','.yml']:
        text=p.read_text(encoding='utf-8');assert not re.search(r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}|[?&]X-Amz-|googleusercontent\.com|upload:[a-f0-9]{8}',text),name
    records.append({'file':name,'bytes':p.stat().st_size,'sha256':digest(p)})
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8',newline='\n')
records.append({'file':'elyndor/previews/release-v125/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')})
(OUT/'publish-paths.nul').write_bytes(b'\0'.join(q['file'].encode() for q in records)+b'\0')
(OUT/'records.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'version':entry['version'],'selectedFiles':len(records),'artifact':artifact,'publicationInputs':'PASS'}))
