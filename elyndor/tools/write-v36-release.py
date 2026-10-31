"""Record only evidence from the exact final standalone artifact."""
from pathlib import Path
import hashlib,json
R=Path(__file__).resolve().parents[2];O=R/'output/elyndor/runtime-v36'
read=lambda name:json.loads((O/name).read_text(encoding='utf-8'))
sha=hashlib.sha256((R/'index.html').read_bytes()).hexdigest();suite=read('verification.json')
assert suite['sha256']==sha and len(suite['checks'])==21 and all(q['pass'] for q in suite['checks'])
paths={'lighting':'presentation/report.json','solarCycle':'sky/report.json','foliageVisibility':'foliage/report.json','waterReflections':'reflections/report.json','cutaways':'cutaway/report.json','atmosphere':'atmosphere/report.json','controls':'controls/report.json','menus':'interface/report.json','campaign':'campaign/report.json','performance':'performance/native.json','endurance':'endurance/report.json','deviceSizes':'devices/report.json','abilities':'features/report.json','loadingAndRunning':'validation/report.json','resourceLifecycle':'lifecycle/report.json','beforeAfterPerformance':'benchmark/report.json'}
proof={k:read(p) for k,p in paths.items()}
for key,q in proof.items():
 assert not q.get('errors'),key
 if 'sha256' in q:assert q['sha256']==sha,key
 if 'pass' in q:assert q['pass'],key
assert proof['campaign']['campaign']['final']=='complete'
assert all(q['sha256']==sha for q in proof['beforeAfterPerformance']['runs'] if q['label']=='after')
assert proof['resourceLifecycle']['worldOwners'] and len(proof['resourceLifecycle']['worldOwners'])==1
bake=read('world-bake.json');bake['grid'].pop('data',None);bake['trees'].pop('data',None);rel=json.loads((R/'release.json').read_text(encoding='utf-8'));old=rel['validation']
rel.update(version='Alpha Version 1.11',release='elyndor-alpha-1.11-device-runtime-2026-10-31-v36',artifact={'file':'index.html','bytes':(R/'index.html').stat().st_size,'sha256':sha,'offline':True},changes=['Streamed embedded asset decoding with real staged loading, texture and geometry uploads, sound preparation and GPU completion before entry.','Baked native overworld heights and exact tree positions, with a compact matching discovery atlas.','Released departed scene materials, shared immutable geometry and actor planes, and bounded weather and program caches.','Batched world weather, conservative visibility, device calibration and stable adaptive detail with paired cached shadows and reflections.','Deferred saved-scene rebuilds until the loading screen has painted; preserved native artwork, voices, story and controls.'])
rel['githubHistory']['previousRelease']='906f92816bae04b29ae4d171a5502aae2303ee66'
manifest=json.loads((R/'elyndor/assets/source/pixellab-v7/manifest.json').read_text(encoding='utf-8'));packed=json.loads((R/'elyndor/assets/packed/assets.cache.json').read_text(encoding='utf-8'));audit=json.loads((R/'elyndor/assets/packed/audit.json').read_text(encoding='utf-8'))
rel['art'].update(nativeSelectedFamilies=len(manifest['characters']),runtimeFamilies=len(packed['sprites']),packedSpritePoses=len(audit['poses']),newGeneratedAssets=0,sourceCropWarnings=0)
rel['releaseNotes']=json.JSONDecoder().raw_decode((R/'elyndor/title-v19.js').read_text(encoding='utf-8').split('const CHANGELOG19=',1)[1])[0]
rel['graphics'].update(newPixelLabAssets=0,balancedPixelCeiling=2400000,highPixelCeiling=4200000,forestBatchMetres=64,meadowBatchMetres=96,qualityPixelCeilings=[650000,1050000,2400000,4200000],qualityMultisamples=[0,2,4,4],constrainedShadowReflectionHz=30,weatherDraws=1,bakedHeightSamples=bake['grid']['count'],bakedTreeCount=bake['trees']['count'],stagedLoading=True,visualParityWithConcept=False)
rel['validation']={'gameplaySuite':suite,'previousWorldAudit':old.get('previousWorldAudit'),**proof,'bakedWorld':bake,'sourceMatchesArtifact':True}
rel['performance']={'nativeScenarios':proof['performance'],'extended1080p':proof['endurance'],'deviceSizes':proof['deviceSizes'],'beforeAfter':proof['beforeAfterPerformance'],'running':proof['loadingAndRunning'],'lifecycle':proof['resourceLifecycle'],'scope':'Native Chrome on this PC plus emulated touch, DPR and synthetic 4x CPU slowdown. Physical phone performance and universal 60 FPS are not established.'}
(R/'release.json').write_text(json.dumps(rel,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'artifact':rel['artifact'],'checks':len(suite['checks']),'improvement':proof['beforeAfterPerformance']['improvement']}))
