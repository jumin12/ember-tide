from pathlib import Path
import hashlib,json
r=Path(__file__).resolve().parents[2];o=r/'output/elyndor/pixellab-v35';read=lambda p:json.loads((o/p).read_text(encoding='utf-8'))
sha=hashlib.sha256((r/'index.html').read_bytes()).hexdigest();v=read('verification.json');c=read('comparison/provenance.json')
assert len(v['checks'])==19 and all(q['pass'] for q in v['checks']) and v['sha256']==sha
assert c['pass'] and c['after']['sha256']==sha
paths={'lighting':'presentation/report.json','solarCycle':'sky/report.json','foliageVisibility':'foliage/report.json','waterReflections':'reflections/report.json','cutaways':'cutaway/report.json','atmosphere':'atmosphere/report.json','controls':'controls/report.json','menus':'interface/report.json','campaign':'campaign/report.json','performance':'performance/native.json','endurance':'endurance/report.json','deviceSizes':'devices/report.json','abilities':'features/report.json','beforeAfterPerformance':'benchmark/report.json'}
proof={k:read(p) for k,p in paths.items()}
for k,p in proof.items():
 assert not p.get('errors'),k
 if 'sha256' in p:assert p['sha256']==sha,k
 if 'pass' in p:assert p['pass'],k
assert proof['campaign']['campaign']['final']=='complete'
assert proof['abilities']['contactRenderChanged']
assert proof['beforeAfterPerformance']['drawReduction']>.25
p=r/'release.json';rel=json.loads(p.read_text(encoding='utf-8'));baseline=rel['validation']
rel.update(version='Alpha Version 1.10',release='elyndor-alpha-1.10-elemental-atmosphere-2026-10-31-v35',artifact={'file':'index.html','bytes':(r/'index.html').stat().st_size,'sha256':sha,'offline':True},changes=['New native PixelLab side-profile wolf and boar combat sets with reviewed breathing, lunge, recoil and recovery frames.','Six high resolution PixelLab effects animate in bounded depth-tested world pools with real scene lighting.','Pooled actor contact occlusion and cloud/shadow-aware volumetric light scattering.','Batched bridge stonework while retaining authored deck geometry, walking surfaces and collision.','Cached particle uploads, bounded diagnostics and scalable rendering detail.'])
rel['githubHistory']['previousRelease']='2fbc70ff72363c6be2a6346f6147b2346ee150a3'
manifest=json.loads((r/'elyndor/assets/source/pixellab-v7/manifest.json').read_text(encoding='utf-8'));packed=json.loads((r/'elyndor/assets/packed/assets.cache.json').read_text(encoding='utf-8'));audit=json.loads((r/'elyndor/assets/packed/audit.json').read_text(encoding='utf-8'))
rel['art'].update(nativeSelectedFamilies=len(manifest['characters']),runtimeFamilies=len(packed['sprites']),packedSpritePoses=len(audit['poses']),newGeneratedAssets=8,sourceCropWarnings=0)
rel['releaseNotes']=json.JSONDecoder().raw_decode((r/'elyndor/title-v19.js').read_text(encoding='utf-8').split('const CHANGELOG19=',1)[1])[0]
rel['graphics'].update(newPixelLabAssets=8,balancedPixelCeiling=2400000,highPixelCeiling=4200000,forestBatchMetres=64,meadowBatchMetres=48,sideViewCreatureCombat=True,nativeEffectImages=6,contactShadowDraws=1,volumetricLightIntegration=True,visualParityWithConcept=False)
rel['validation']={'gameplaySuite':v,'previousWorldAudit':baseline.get('previousWorldAudit'),**proof,'comparisons':c,'sourceMatchesArtifact':True}
rel['performance']={'nativeScenarios':proof['performance'],'extended1080p':proof['endurance'],'deviceSizes':proof['deviceSizes'],'beforeAfter':proof['beforeAfterPerformance'],'scope':'Native PC and emulated touch tests, plus synthetic 4x CPU stress. Physical phone performance and universal 60 FPS are not established.'}
p.write_text(json.dumps(rel,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(json.dumps({'artifact':rel['artifact'],'checks':19}))
