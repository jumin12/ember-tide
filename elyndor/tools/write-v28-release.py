from pathlib import Path
import json,hashlib
r=Path(__file__).resolve().parents[2];o=r/'output/elyndor/pixellab-v28'
read=lambda p:json.loads((o/p).read_text(encoding='utf-8'))
sha=hashlib.sha256((r/'index.html').read_bytes()).hexdigest();v=read('verification.json')
assert v['sha256']==sha and len(v['checks'])==17 and all(q['pass']for q in v['checks'])
proof={n:read(p)for n,p in {'travelAndHighDpi':'features/report.json','cutaways':'cutaway/report.json','targets':'targets/report.json','menus':'interface/report.json','routes':'revision/report.json','endurance':'endurance/report.json','campaign':'campaign/report.json','performance':'performance/native.json','atmosphere':'atmosphere/report.json','visuals':'visual/report.json'}.items()}
for n in ['travelAndHighDpi','cutaways','targets','menus','routes','endurance','atmosphere']:assert proof[n]['sha256']==sha and proof[n].get('pass',True)
assert proof['campaign']['campaign']['final']=='complete'
s=(r/'elyndor/title-v19.js').read_text(encoding='utf-8');notes,_=json.JSONDecoder().raw_decode(s.split('const CHANGELOG19=',1)[1])
rel=json.loads((r/'release.json').read_text(encoding='utf-8'));rel.update(release='elyndor-alpha-1.4-2026-10-30-v28',version='Alpha Version 1.4',artifact={'file':'index.html','bytes':(r/'index.html').stat().st_size,'sha256':sha,'offline':True},releaseNotes=notes,changes=notes[0]['items'])
rel['githubHistory']['previousRelease']='5bfea2a08bbf35880d11bc1cbc615ee0326fc0f7'
rel['graphics'].update(newPixelLabAssets=20,worldMaterialResolution=[512,512],nativeMaterialNormals=9,physicallyBasedWorld=True,instancedFoldedLeafCrowns=True,worldDustParticles=600,depthSelectiveFocus=True,visualParityWithConcept=False,existingSceneLayoutPreserved=True)
rel['validation']={**v,**proof,'sourceMatchesArtifact':True}
rel['performance']={'nativeScenarios':proof['performance'],'extended1080p':proof['endurance'],'highDpiSmallScreens':proof['travelAndHighDpi']['sizes'],'scope':proof['endurance']['scope']}
(r/'release.json').write_text(json.dumps(rel,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(json.dumps({'version':rel['version'],'artifact':rel['artifact'],'checks':len(v['checks'])}))
