"""Prepare Alpha 1.22 notes and the exact, curated publication inputs."""
from pathlib import Path
import hashlib,json,re,subprocess,sys

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/release122'
PRE=ROOT/'elyndor/previews/release-v122'
OUT.mkdir(parents=True,exist_ok=True)

def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()

entry={'version':'Alpha Version 1.22','date':'November 7, 2026','title':'Renewed characters and layered battles','items':[
 'Rebuilt Bren with consistent proportions, clean native pixel edges, eight-direction full-run movement at both travel speeds, and breathing exploration idles.',
 'Replaced Bren\u2019s normal and Ascended combat animations with breathing ready poses, complete sword swings, Driving Slash, guard, recoil, Rally, injury and victory. Larger source frames preserve the full blade and hand placement.',
 'Rebuilt Soren\u2019s eight-direction movement and combat poses. His battle entrance lifts him into the approved slight hover, with a breathing ready loop, staff attacks, Arcane Pulse, Ward, guard, recoil, injury and victory.',
 'Added layered sword ribbons, impacts, runes and magic flashes whose colored light reaches nearby terrain, props and actors. Reusable effect pools clear correctly when encounters end.',
 'Replaced seventeen world NPC families with reviewed PixelLab designs, eight-direction movement and breathing idles. The other thirteen keep their current playable animation sets while their new designs remain available as staged developer previews.',
 'Upgraded exterior, overworld and interior material families with distinct wood, bark, stone, plaster, cloth, metal, pottery, leather and paper finishes. Native normal detail and surface-specific roughness keep matte surfaces matte.',
 'Reworked connected tree boughs, species-specific foliage and bark, fractured rock shapes, ground cover and interior material variation using the new native PixelLab art.',
 'Added an NPC, party and creature browser to the existing developer console, with animation selection, direction and frame controls, playback, contrasting preview backgrounds and current/staged NPC comparisons.',
 'Added PNG/JPG downloads for displayed sprites and ZIP exports for every frame of a selected animation or a character\u2019s complete animation set.',
 'Added combat enemy, enemy-count and encounter pickers to the developer console. The existing protected toolbar remains usable on portrait and landscape phones.',
 'Rebuilt all twenty battle environments around detailed physical foreground terrain, rooted 3D middle-distance scenery and the original paired day/night PixelLab paintings set farther behind the battlefield.',
 'Removed smeared picture colors from the terrain beneath fighters and reduced oversized foreground planting. Native trees, rocks, architecture, crystals and rotating windmill sails bridge the physical field and distant scenery.',
 'Added calibrated background depth, parallax, moving foliage and water, airborne effects, soft distant focus and restrained bloom. Cinematic reveals hand off to a stable gameplay view with sharp characters.',
 'Staged party members and enemies in staggered groups instead of a straight line. Native sprite silhouettes determine spacing, and action animations return actors to stable formation positions.',
 'Kept battle actors grounded when the viewport changes orientation, reserved space for combat controls, and moved large enemies clear of the phone landscape command dock.',
 'Restored the earlier river finish and joined background water to the POI water with matching material, flow, edge positions, depths and changing levels. Corrected stale and self-reflected background water at the join.',
 'Refined fountain and well water with the shared native ripple, shallow-depth and reflection treatment.',
 'Made ordinary human opponents and commanders use the same pixel defeat effect as other enemies, while retaining Soren\u2019s explicit story withdrawal. Enlarged commander presentation without changing ordinary enemy sizes.',
 'Added injury and recovery voice reactions for all five party members, with threshold tracking, serialized playback and safeguards against repeated or defeated-character reactions.',
 'Made reward notices remain visible for four seconds, added a brief slide transition, and preserved manual dismissal and queued rewards without duplicate grants.',
 'Made Escape reliably open the main menu around destination prompts, removed the duplicate main-menu action in Settings, and cleared residual battle interface after leaving an encounter.',
 'Reused scene geometry, native material batches, effect pools and the battle post-processing target. Background paintings decode on demand during the encounter transition, and owned combat resources are released on exit.'
]}

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
        section=heading+'\n\n'+entry['date']+'\n\n'+'\n'.join('- '+v for v in entry['items'])+'\n\nRelease verification and the standalone checksum are recorded in `elyndor/previews/release-v122/verification.json`. Browser checks use native Chrome; phone layouts use browser emulation. Existing PixelLab images retain their native resolution.\n\n'
        at=body.index('## Alpha Version');p.write_text(body[:at]+section+body[at:],encoding='utf-8',newline='\n')
    print(json.dumps({'version':entry['version'],'changelogItems':len(entry['items'])}));sys.exit()

PRE.mkdir(parents=True,exist_ok=True)
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':digest(ROOT/'index.html'),'offline':True}
qa=read('output/release122/qa/results.json')
assert qa['pass'] and not qa['errors'] and qa['artifact']==artifact
client=OUT/'skill-final'
assert not list(client.glob('*error*'))
moves=[read('output/release122/skill-final/state-'+str(i)+'.json')['player'] for i in range(2)]
assert moves[0]!=moves[1]
client_hash=digest(ROOT/'output/req001/web_game_playwright_client.mjs')
assert client_hash==digest(Path.home()/'.codex/skills/develop-web-game/scripts/web_game_playwright_client.js')
graph=read('elyndor/build-manifest.json');selected=read('elyndor/assets/source/pixellab-v7/manifest.json');audit=read('elyndor/assets/packed/audit.json')
bake=json.JSONDecoder().raw_decode((ROOT/'elyndor/world-bake-v36.js').read_text(encoding='utf-8').split('const BAKED_WORLD36=',1)[1])[0]
assert all(digest(ROOT/k)==v for k,v in bake['inputs'].items())
source_paths={f'elyndor/{p}' for group in graph['sections'].values() for p in group}|{f'elyndor/{p}' for p in graph['styles']}
source_paths|={'elyndor/index.source.html','elyndor/build-manifest.json','elyndor/tools/build.py','elyndor/tools/build-v7.py','elyndor/tools/asset_bundle_v36.py','elyndor/tools/pixellab-pack.py','elyndor/tools/bake-traversal-terrain.mjs','elyndor/tools/bake-world-v36.mjs'}
summary={'artifact':artifact,'source':{p:digest(ROOT/p) for p in sorted(source_paths)},'finalStandalone':qa,'standardClient':{'sha256':client_hash,'unchanged':True,'movement':moves,'browserErrors':[]},'nativeAssetAudit':{'runtimeFamilies':audit['spriteCount'],'poses':len(audit['poses']),'sourceBoundaryWarnings':audit['sourceBoundaryWarnings']},'componentEvidence':{
    'bren':'Reviewed final normal/Ascended source poses, native run cycles and sword-safe combat clips; three-hit chain, skills, items, guard and environmental effect lighting verified locally.',
    'soren':'Local 085: 625 native cells, eight world directions, hover entrance/ready, combat actions and environment lighting passed; other party art preserved.',
    'npcAndMaterials':'Local 086: seventeen completed NPC families activated, thirteen designs staged, 72 surface bindings, native pixels and distinct material response verified.',
    'developerAndCombatFixes':'Local 087: sprite preview/export, enemy selection, reward queue, human defeats, ten voice reactions, water and menu checks passed. Private Trello screenshot review remained pending at the user\u2019s request.',
    'hybridBattleScenes':'Local 090: twenty day/night scene pairs, physical foreground footing, native 3D scenery, eight camera paths, phone orientations, spell lighting and complete scene disposal passed.'
},'scope':'The final standalone is checked in native Chrome on the test PC. Component reports refer to their recorded local builds. Phone layouts use browser emulation; no universal frame-rate, physical-phone performance or perfect generated-anatomy claim.'}
(PRE/'verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
old=read('output/release122/previous-release.json')
previous={'commit':'54224d4b460da0a23c9115bad16beb4a7e28e2da','version':old['version'],'sha256':old['artifact']['sha256']}
old.update(release='elyndor-alpha-1.22-renewed-characters-layered-battles-2026-11-07',version=entry['version'],artifact=artifact,changes=entry['items'],releaseNotes=notes,previousPublishedRelease=previous,validation={'file':'elyndor/previews/release-v122/verification.json','sha256':digest(PRE/'verification.json'),'finalStandalone':'PASS','nativeAssetAudit':summary['nativeAssetAudit']})
old['githubHistory']['previousRelease']=previous['commit']
old['art'].update(packedSpritePoses=len(audit['poses']),runtimeFamilies=audit['spriteCount'],referencePolicy='Native PixelLab party, NPC and environment artwork; approved Bren and Soren replacements, seventeen completed NPC replacements, thirteen staged NPC design previews, original paired landscape paintings. No artificial image upscaling.')
prior_art=json.loads(subprocess.check_output(['git','show','HEAD:elyndor/assets/source/pixellab-v7/manifest.json']))
changed_images=sorted(k for k,v in selected.get('images',{}).items() if prior_art.get('images',{}).get(k)!=v)
old['art'].update(newBundledImages=len(changed_images),newImageKeys=changed_images)
old['performance']={'scope':'Final native Chrome functional and resource checks on the test PC; no universal frame-rate or physical-phone performance claim.','rendering':qa['checks'].get('rendering',{}),'combatResourceCleanup':qa['checks'].get('cleanup',{})}
(ROOT/'release.json').write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
names=source_paths|{'index.html','release.json','README.md','three.vendor.js','.nojekyll','elyndor/tools/prepare-release-v122.py','elyndor/assets/source/pixellab-v7/manifest.json','elyndor/assets/source/pixellab-v7/packed-review.json','.github/workflows/discord-changelog.yml','elyndor/tools/discord_changelog.py','elyndor/tools/test_discord_changelog.py','elyndor/docs/discord-changelog.md','elyndor/previews/release-v122/verification.json'}
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
    names.add(f'elyndor/previews/release-v122/{name}.webp')
records=[]
for name in sorted(names):
    p=ROOT/name;assert p.is_file() and p.resolve().is_relative_to(ROOT.resolve()),name
    assert not name.startswith(('output/','design/','archive/')) and p.name!='progress.md' and not any(v.startswith('.env') for v in p.parts),name
    if p.suffix in ['.js','.css','.html','.json','.md','.py','.mjs','.yml']:
        text=p.read_text(encoding='utf-8');assert not re.search(r'(?i)Bearer\s+[A-Za-z0-9._-]{16,}|sk[_-][A-Za-z0-9]{20,}|[?&]X-Amz-|googleusercontent\.com|upload:[a-f0-9]{8}',text),name
    records.append({'file':name,'bytes':p.stat().st_size,'sha256':digest(p)})
(PRE/'files.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8',newline='\n')
records.append({'file':'elyndor/previews/release-v122/files.json','bytes':(PRE/'files.json').stat().st_size,'sha256':digest(PRE/'files.json')})
(OUT/'publish-paths.nul').write_bytes(b'\0'.join(q['file'].encode() for q in records)+b'\0')
(OUT/'records.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'version':entry['version'],'selectedFiles':len(records),'artifact':artifact,'publicationInputs':'PASS'}))
