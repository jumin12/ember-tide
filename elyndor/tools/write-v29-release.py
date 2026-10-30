from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[2];O=R/'output/elyndor/pixellab-v29';read=lambda p:json.loads((O/p).read_text(encoding='utf-8'))
sha=hashlib.sha256((R/'index.html').read_bytes()).hexdigest();v=read('verification.json');assert v['sha256']==sha and len(v['checks'])==19 and all(q['pass']for q in v['checks'])
proof={n:read(p)for n,p in {'interiorsAndRestraint':'interiors/report.json','loadingAndRoomSoak':'room-soak/report.json','travelAndHighDpi':'features/report.json','cutaways':'cutaway/report.json','targets':'targets/report.json','menus':'interface/report.json','routes':'revision/report.json','endurance':'endurance/report.json','campaign':'campaign/report.json','performance':'performance/native.json','atmosphere':'atmosphere/report.json','visuals':'visual/report.json'}.items()}
for n in ['interiorsAndRestraint','loadingAndRoomSoak','travelAndHighDpi','cutaways','targets','menus','routes','endurance','atmosphere']:assert proof[n]['sha256']==sha and proof[n].get('pass',True)
assert proof['campaign']['campaign']['final']=='complete'
s=(R/'elyndor/title-v19.js').read_text(encoding='utf-8');notes,_=json.JSONDecoder().raw_decode(s.split('const CHANGELOG19=',1)[1])
rel=json.loads((R/'release.json').read_text(encoding='utf-8'));rel.update(release='elyndor-alpha-1.5-2026-10-30-v29',version='Alpha Version 1.5',artifact={'file':'index.html','bytes':(R/'index.html').stat().st_size,'sha256':sha,'offline':True},releaseNotes=notes,changes=notes[0]['items'])
rel['githubHistory']['previousRelease']='243ecf085512788d05bf3c258424d58abb99e33b'
rel['graphics'].pop('existingSceneLayoutPreserved',None);rel['graphics'].update(newPixelLabAssets=4,interiorMaterialResolution=[512,512],nativeLoadingStills=4,loadingStillResolution=[1920,1080],interiorsRebuilt=7,interiorCameraPitchDegrees=25,chairsFaceTablesAndHearths=True,existingOutdoorSceneLayoutPreserved=True,visualParityWithConcept=False)
rel['validation']={**v,**proof,'sourceMatchesArtifact':True};rel['performance']={'nativeScenarios':proof['performance'],'extended1080p':proof['endurance'],'highDpiSmallScreens':proof['travelAndHighDpi']['sizes'],'interiorSoak':proof['loadingAndRoomSoak'],'scope':proof['endurance']['scope']}
(R/'release.json').write_text(json.dumps(rel,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(json.dumps({'version':rel['version'],'artifact':rel['artifact'],'checks':len(v['checks'])}))
