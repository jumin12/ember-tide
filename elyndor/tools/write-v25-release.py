"""Describe the exact fully validated Alpha 1.1 standalone artifact."""
from pathlib import Path
import hashlib,json
R=Path(__file__).resolve().parents[2];O=R/'output/elyndor/pixellab-v25'
read=lambda p:json.loads((O/p).read_text(encoding='utf-8'))
sha=hashlib.sha256((R/'index.html').read_bytes()).hexdigest()
reg=read('regression.json');source=json.loads((R/'output/elyndor/continuous-standalone-audit.json').read_text())
assert reg['sha256']==source['sha256']==sha and source['sourceMatchesArtifact'] and len(reg['checks'])==31 and all(q['pass'] for q in reg['checks'])
paths={'weatherResponsive':'weather-ui/report.json','districts':'revision/report.json','clarity':'clarity/report.json','endurance':'endurance/report.json','resident':'resident-navigation/report.json','cutaway':'cutaway/report.json'}
proof={k:read(p) for k,p in paths.items()};assert all(q['pass'] and q['sha256']==sha for q in proof.values())
capture=read('atmosphere/report.json');assert capture['pass'] and capture['sha256']==sha
campaign=read('campaign/report.json');assert campaign['campaign']['final']=='complete' and not campaign['errors']
s=(R/'elyndor/title-v19.js').read_text(encoding='utf-8');notes,_=json.JSONDecoder().raw_decode(s.split('const CHANGELOG19=',1)[1])
r=json.loads((R/'release.json').read_text(encoding='utf-8'));r.update(release='elyndor-alpha-1.1-2026-10-29-presentation-v25',version='Alpha Version 1.1',artifact={'file':'index.html','bytes':(R/'index.html').stat().st_size,'sha256':sha,'offline':True},releaseNotes=notes)
r.pop('featureCatalogue',None);r['githubHistory']['previousRelease']='75e7f4e105ff0ca5b6009b374617e747c0a974ea'
r['changes']=notes[0]['items'];c=proof['clarity']['graphics']
r['graphics']={'sceneSamples':c['samples'],'worldAnisotropy':c['worldAnisotropy'],'spritesKeepNativeNearestFiltering':c['spriteNearest'],'camera':{'yawDegrees':c['yaw'],'pitchDegrees':c['pitch']},'realAnimatedSpriteShadowMap':True,'legacyProjectedSilhouettes':False,'worldHeightCloudVolumes':True,'groundConformingPuddles':True,'materialSpecificWetness':True,'fullSceneDepthBlur':False,'balancedPixelCeiling':3700000,'highPixelCeiling':5500000,'sourceArtRegenerated':False,'newSelectedAssets':0}
r['validation']={'checks':reg['checks']+[{'name':k,'pass':True} for k in proof],'sourceMatchesArtifact':True,**proof,'staticWorldAndPresentationCapture':capture,'locations':read('locations/report.json'),'services':read('services/report.json'),'storyProgressionSteps':len(campaign['campaign']['log']),'storyBattles':len(campaign['campaign']['battles']),'restoredLights':len(campaign['campaign']['restored']),'saveLoad':campaign['persistence']}
r['performance']={'nativeScenarios':read('performance/native.json'),'extended1080p':proof['endurance'],'repeatedDryPlay':read('soak-release-dry.json'),'repeatedStormPlay':read('soak-release-storm.json'),'pump':read('pump-fixed.json'),'tutorial':read('onboarding-performance.json'),'combat':read('combat-profile-final.json'),'atlas':read('atlas-performance.json'),'scope':proof['endurance']['scope']}
(R/'release.json').write_text(json.dumps(r,indent=2,ensure_ascii=False)+'\n',encoding='utf-8',newline='\n');print(json.dumps({'version':r['version'],'sha256':sha,'checks':37,'bytes':r['artifact']['bytes']}))
