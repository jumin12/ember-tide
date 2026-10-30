"""Prepare the tested integrated release, excluding private references."""
from pathlib import Path
from PIL import Image
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'elyndor/assets/source/pixellab-v7'
OUT=ROOT/'output/elyndor/pixellab-v30'
PRE=ROOT/'elyndor/previews/pixellab-v30';PRE.mkdir(parents=True,exist_ok=True)
manifest=json.loads((SRC/'manifest.json').read_text(encoding='utf-8'))
audit=json.loads((ROOT/'elyndor/assets/packed/audit.json').read_text(encoding='utf-8'))
assets=json.loads((ROOT/'elyndor/assets/packed/assets.cache.json').read_text(encoding='utf-8'))
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
voice=json.loads((ROOT/'elyndor/audio/manifest.json').read_text(encoding='utf-8'))
paths.extend(ROOT/q['file'] for q in voice['lines'])
paths.extend(ROOT/'elyndor/audio'/name for name in ['catalog.json','manifest.json'])
sounds=json.loads((ROOT/'elyndor/audio/sound-manifest.json').read_text(encoding='utf-8'))
paths.extend(ROOT/q['file'] for q in sounds['sounds'])
paths.extend(ROOT/'elyndor/audio'/name for name in ['sound-catalog.json','sound-manifest.json'])
selected_previews={'interiors':['brookInn.png','brookForge.png','council.png','archives.png','quest-marker.png','quest-complete.png'],'room-soak':['loading-brookInn.png','loading-archives.png','inn-390.png'],'visual':['river.png','bridge.png','map-hover.png','title.png','street.png','bridge-match.png','waterworks-match.png'],'interface':['equipment-1672.png','inventory-1672.png','party-1672.png','equipment-390.png','inventory-390.png'],'targets':['gate-visible.png','battle-selected.png','turn-after-action.png'],'cutaway':['alder-arrival.png'],'official':['shot-0.png'],'revision':['poi-highmere.png','poi-relief.png','poi-brookstead.png']}
selected_previews['foliage']=['party-behind-canopy.png','street-recovered.png']
for folder,names in selected_previews.items():
 for name in names:shutil.copyfile(OUT/folder/name,PRE/(folder+'-'+name))
paths.extend(PRE.glob('*.png'));paths.append(SRC/'interface-v26/provenance.json');paths.append(SRC/'interface-v27/provenance.json')
paths.extend(p for p in (ROOT/'elyndor').iterdir() if p.suffix in ['.js','.css','.html'])
helpers=['write-v13-release.py','regression-v13.py','navigation-v13.mjs','features-v13.mjs','traversal-v13.mjs','campaign-v13.mjs','events-v13.mjs','combat-v13.mjs','party-v13.mjs','hydraulics-v13.mjs','menus-v13.mjs','portraits-v13.mjs','capture-scenes-v13.mjs','loading-photos-v13.py','profile-v13.mjs','profile-combat-v13.mjs','audit-audio-v13.py','audit-soundtrack-v13.py','load-profile-v13.mjs','locations-v13.mjs','smoke-v13.mjs','soundtrack-v13.py','compress-soundtrack-v13.py','import-combat-v13.py','live-release-v13.mjs','write-v12-release.py','regression-v12.py','navigation-v12.mjs','features-v12.mjs','traversal-v12.mjs','campaign-v12.mjs','events-v12.mjs','combat-v12.mjs','party-v12.mjs','hydraulics-v12.mjs','menus-v12.mjs','portraits-v12.mjs','capture-scenes-v12.mjs','loading-photos-v12.py','profile-v12.mjs','profile-combat-v12.mjs','audit-audio-v12.py','voice_credentials.py','voice-catalog-v12.py','generate-voices-v12.py','compress-voices-v12.py','live-release-v12.mjs','write-v11-release.py','regression-v11.py','world-design-v11.mjs','party-v11.mjs','combat-v11.mjs','hydraulics-v11.mjs','view-loading-v11.mjs','audit-cities-v11.mjs','profile-combat-v11.mjs','capture-scenes-v11.mjs','loading-photos-v11.py','write-v10-release.py','regression-v10.py','town-events-v10.mjs','combat-v10.mjs','layout-v10.mjs','world-design-v10.mjs','write-v9-release.py','regression-v9.py','town-events-v9.mjs','combat-v9.mjs','ui-previews-v8.mjs','live-release-check.mjs','battle-layout-v8.mjs','build.py','build-v7.py','pixellab-pack.py','review-pixellab-character.py','audit-continuous.py','audit-runtime-sprites.py','prepare-pixellab-checkpoint.py','check-pixellab-checkpoint.py','web_game_playwright_client.mjs','smoke-actions.json','continuous-verify.mjs','inspect-town-v8.mjs','qa-town-v8.mjs','keys-combat-v8.mjs','surfaces-town-v8.mjs','four-edge-check.mjs','profile-town-v8.mjs','sustained-check.mjs']
helpers += ['write-v14-release.py','regression-v14.py','navigation-v14.mjs','features-v14.mjs','traversal-v14.mjs','campaign-v14.mjs','events-v14.mjs','combat-v14.mjs','party-v14.mjs','hydraulics-v14.mjs','menus-v14.mjs','portraits-v14.mjs','capture-scenes-v14.mjs','profile-v14.mjs','profile-combat-v14.mjs','profile-atlas-v14.mjs','audit-audio-v14.py','audit-soundtrack-v14.py','load-profile-v14.mjs','locations-v14.mjs','smoke-v14.mjs','lighting-v14.mjs','live-release-v14.mjs','voice-design-v14.py','recast-voices-v14.py']
helpers += ['regression-v15.py','features-v15.mjs','presentation-v15.mjs','prepare-pixellab-v22.py','check-pixellab-v22.py','write-v15-release.py','import-materials-v15.py','recast-voices-v15.py','soundtrack-v15.py','compress-soundtrack-v15.py','roads-diagnose-v15.mjs','derive-relief-v15.py','live-release-v15.mjs']
helpers += [name+'-v15'+('.py' if name.startswith('audit') else '.mjs') for name in ['locations','smoke','audit-soundtrack','navigation','traversal','campaign','events','combat','party','hydraulics','menus','portraits','profile','profile-combat','profile-atlas','audit-audio','lighting','load-profile']]
helpers += ['transcript-audit-v15.py','refine-dialogue-v15.py','voice-qa-v15.mjs','write-voice-qa-v15.py']
helpers += ['capture-overworld-v16.mjs','journey-v16.mjs','onboarding-performance-v16.mjs','write-v16-release.py','prepare-pixellab-v22.py','check-pixellab-v22.py','regression-v16.py','live-release-v16.mjs']
helpers += [name+'-v16'+('.py' if name.startswith('audit') else '.mjs') for name in ['locations','smoke','audit-soundtrack','navigation','features','presentation','traversal','campaign','events','combat','party','hydraulics','menus','portraits','profile','profile-combat','profile-atlas','audit-audio','lighting']]
paths.extend([ROOT/'elyndor/audio/transcription-audit.json',ROOT/'elyndor/audio/transcription-audit-v17.json'])
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v17*') if p.suffix in ['.py','.mjs'] and p.name!='occlusion-diagnose-v17.mjs']
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v18*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('read-atlas','atlas-images','occlusion-diagnose'))]
paths.append(ROOT/'elyndor/audio/transcription-audit-v18.json')
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v19*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('diagnose','surfaces','read-atlas','atlas-images','occlusion-diagnose'))]
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v20*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('diagnose','inspect-gap','obstacle','surfaces','read-atlas','atlas-images','occlusion-diagnose'))]
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v21*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('diagnose','passes','occlusion-diagnose'))]
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v22*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('inspect','diagnose','passes','occlusion-diagnose'))]
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v23*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('inspect','diagnose','passes','occlusion-diagnose'))]
paths.append(ROOT/'elyndor/audio/transcription-audit-v22.json')
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v24*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('inspect','diagnose','download','import-surfaces','prepare-art','finalize-code','prepare-tests'))]
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v25*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('inspect','diagnose'))]
helpers += ['riverlands-v26.mjs','verify-v26.py','write-v26-release.py','prepare-pixellab-v30.py','check-pixellab-v30.py','live-release-v26.mjs']
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*-v26.mjs') if not p.name.startswith(('inspect','composition'))]
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*-v27.mjs') if not p.name.startswith(('diagnose','inspect'))]
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v28*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('diagnose','import','select','notes','setup','review'))]
helpers += ['verify-v27.py','write-v27-release.py','prepare-pixellab-v30.py','check-pixellab-v30.py']
helpers += ['regression-v26.py','audit-audio-v26.py','audit-soundtrack-v26.py']
paths.append(SRC/'materials-v28/provenance.json')
paths.extend([SRC/'interiors-v29/provenance.json',SRC/'presentation-v29/provenance.json',SRC/'presentation-v30/provenance.json',SRC/'botany-v30/provenance.json'])
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v29*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('inspect','import','setup','notes','prepare-tests'))]
paths.extend([SRC/'interface-v24/provenance.json',SRC/'materials-v24/provenance.json',SRC/'presentation-v26/provenance.json'])
helpers += [p.name for p in (ROOT/'elyndor/tools').glob('*v30*') if p.suffix in ['.py','.mjs'] and not p.name.startswith(('inspect','import','setup','notes','prepare-tests','upload','baseline'))]
paths.extend(ROOT/'elyndor/tools'/p for p in helpers)
paths.extend(ROOT/p for p in ['index.html','three.vendor.js','README.md','ASSET_NOTES.md','PIXELLAB_REBUILD.md','MATERIAL_PROMPTS.json','release.json','.gitattributes','.gitignore','.nojekyll','tools/build.py'])
artifact={'file':'index.html','bytes':(ROOT/'index.html').stat().st_size,'sha256':hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest(),'offline':True}
checkpoint={'status':'Alpha Version 1.6: native botanical variation, reliable tree cutaways and clearer lighting','referencePolicy':manifest['referencePolicy'],'characterFamilies':len(manifest['characters']),'runtimeFamilies':len(assets['sprites']),'nativeSelectedPoses':len(audit['poses']),'portraits':len(manifest['portraits']),'dedicatedHudPortraits':len(manifest['hudPortraits']),'worldImages':len(manifest['images']),'artifact':artifact,'incompleteClips':assets['pixelLabAudit']['incompleteClips'],'worldSystem':'Reference-atlas overworld with 15 points of interest and seven interiors','voiceModel':voice['model'],'voiceClips':len(voice['lines']),'voiceProvider':voice['provider'],'soundAssets':len(sounds['sounds']),'soundProvider':sounds['provider']}
(SRC/'checkpoint.json').write_text(json.dumps(checkpoint,indent=2),encoding='utf-8',newline='\n')
paths=sorted(set(paths));records=[]
for p in paths:
 p.resolve().relative_to(ROOT.resolve())
 assert p.is_file(),p
 if p.suffix=='.png':
  with Image.open(p) as im:im.verify()
 records.append({'file':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(PRE/'files.json').write_text(json.dumps(records,indent=2),encoding='utf-8',newline='\n');paths.append(PRE/'files.json')
(OUT/'publish-paths.json').write_text(json.dumps([p.relative_to(ROOT).as_posix() for p in paths],indent=2),encoding='utf-8',newline='\n')
(OUT/'publish-paths.nul').write_bytes(b'\0'.join(p.relative_to(ROOT).as_posix().encode() for p in paths)+b'\0')
print(json.dumps({**checkpoint,'publishFiles':len(paths),'publishBytes':sum(p.stat().st_size for p in paths)}))
