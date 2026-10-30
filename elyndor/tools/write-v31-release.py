from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[2];O=R/'output/elyndor/pixellab-v31';read=lambda p:json.loads((O/p).read_text(encoding='utf-8'))
sha=hashlib.sha256((R/'index.html').read_bytes()).hexdigest();v=read('verification.json');assert v['sha256']==sha and len(v['checks'])==23 and all(q['pass']for q in v['checks'])
proof={n:read(p)for n,p in {'solarCycle':'sky/report.json','architecture':'architecture/report.json','nativeWaterReflections':'reflections/report.json','nativeFoliageVisibility':'foliage/report.json','interiorsAndRestraint':'interiors/report.json','loadingAndRoomSoak':'room-soak/report.json','travelAndHighDpi':'features/report.json','cutaways':'cutaway/report.json','targets':'targets/report.json','menus':'interface/report.json','routes':'revision/report.json','endurance':'endurance/report.json','campaign':'campaign/report.json','performance':'performance/native.json','atmosphere':'atmosphere/report.json','visuals':'visual/report.json'}.items()}
for n in ['solarCycle','architecture','nativeWaterReflections','nativeFoliageVisibility','interiorsAndRestraint','loadingAndRoomSoak','travelAndHighDpi','cutaways','targets','menus','routes','endurance','atmosphere']:assert proof[n]['sha256']==sha and proof[n].get('pass',True)
assert proof['campaign']['campaign']['final']=='complete'
proof['comparisons']=read('comparison/provenance.json');assert proof['comparisons']['pass'] and proof['comparisons']['after']['sha256']==sha
s=(R/'elyndor/title-v19.js').read_text(encoding='utf-8');notes,_=json.JSONDecoder().raw_decode(s.split('const CHANGELOG19=',1)[1])
rel=json.loads((R/'release.json').read_text(encoding='utf-8'));rel.update(release='elyndor-alpha-1.7-2026-10-30-v31',version='Alpha Version 1.7',artifact={'file':'index.html','bytes':(R/'index.html').stat().st_size,'sha256':sha,'offline':True},releaseNotes=notes,changes=notes[0]['items'])
rel['githubHistory']['previousRelease']='fd5611432bdb9ccda472137c07d9f8d55d586343'
rel['graphics'].update(newPixelLabAssets=0,continuousSolarOrbit=True,diurnalColourKeys=14,cloudLinkedLighting=True,fittedArchitecture=True,botanicalSpecies=6,flowerForms=5,nativeBotanicalResolution=[512,512],materialNormalMaps=5,nativeLoadingStills=4,loadingStillResolution=[1920,1080],treeCutawaysEveryLod=True,realShadowsAndReflectionsPreserved=True,explorationCameraPitchDegrees=23.97,explorationCameraYawDegrees=4.78,visualParityWithConcept=False)
rel['validation']={**v,**proof,'sourceMatchesArtifact':True};rel['performance']={'nativeScenarios':proof['performance'],'extended1080p':proof['endurance'],'highDpiSmallScreens':proof['travelAndHighDpi']['sizes'],'interiorSoak':proof['loadingAndRoomSoak'],'scope':proof['endurance']['scope']}
initial=O/'endurance/first-run.json'
if initial.exists():
 first=json.loads(initial.read_text(encoding='utf-8'));rel['performance']['initialColdSample']={'sample':first['phases'][0],'note':'The first 1080p run missed the frame-time threshold during its initial sample. The same artifact was repeated without code changes; that complete repeated run passed. This initial observation is retained rather than implying a universal 60 FPS guarantee.'}
(R/'release.json').write_text(json.dumps(rel,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(json.dumps({'version':rel['version'],'artifact':rel['artifact'],'checks':len(v['checks'])}))
