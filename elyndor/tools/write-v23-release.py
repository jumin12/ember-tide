"""Publish metadata only after the exact sharp-rendering release passes QA."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[2]
base=root/'output/elyndor/pixellab-v23'
def read(name):return json.loads((base/name).read_text(encoding='utf-8'))
sha=hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
reg=read('regression.json')
source=json.loads((root/'output/elyndor/continuous-standalone-audit.json').read_text(encoding='utf-8'))
assert reg['sha256']==source['sha256']==sha and source['sourceMatchesArtifact']
assert len(reg['checks'])==31 and all(q['pass']for q in reg['checks'])
clarity=read('clarity/report.json');endurance=read('endurance/report.json');resident=read('resident-navigation/report.json')
assert clarity['pass'] and endurance['pass'] and resident['pass']
assert clarity['sha256']==endurance['sha256']==resident['sha256']==sha
assert not clarity['errors'] and not endurance['errors']
campaign=read('campaign/report.json');assert campaign['campaign']['final']=='complete' and not campaign['errors']
r=json.loads((root/'release.json').read_text(encoding='utf-8'))
r['release']='elyndor-alpha-1.0-2026-10-29-clarity-v23'
r['artifact']={'file':'index.html','bytes':(root/'index.html').stat().st_size,'sha256':sha,'offline':True}
r['githubHistory']['previousRelease']='5758c72749025d54889a3206c7a4d49ee97e84bc'
r['changes']=[
 'Full native 1920x1080 on the tested device replaces the hidden 1.4-megapixel rendering cap; four-sample scene antialiasing smooths geometry silhouettes',
 'World textures retain their native source detail with mipmapped filtering and up to16x anisotropy; sprite atlases retain nearest filtering and native frame padding',
 'The playable scene stays sharp at every depth; subtle focus is confined to the extreme lens edges, with restrained bloom and vignette',
 'Warm front-side sunlight, stronger sky bounce and balanced daylight brighten facades and sprites; canopy grading restores restrained olive greens',
 'A downward oblique exploration camera shows the starting bridge diagonally and exposes building side faces; screen-relative WASD, arrows and eight-direction art remain consistent',
 'Forest batches share material programs; static transforms are cached across all POIs, and individual-tree cutaways use a nearby spatial grid',
 'Padded visibility budgets and offscreen-water rejection reduce repeated scene work; bounded asynchronous GPU queries control pixel pressure without reacting to quest or garbage-collection CPU spikes',
 'NPC errands use resumable A-star jobs with one shared per-frame budget, removing the measured 84ms synchronous route-planning hitch',
 'Existing tutorial text, entrance and inn saves, inn recovery, voiced story, battle effects and side-on battle staging are preserved'
]
r['graphics']={'sceneSamples':clarity['graphics']['samples'],'worldAnisotropy':clarity['graphics']['worldAnisotropy'],'spritesKeepNativeNearestFiltering':clarity['graphics']['spriteNearest'],'camera':{'yawDegrees':clarity['graphics']['yaw'],'pitchDegrees':clarity['graphics']['pitch']},'fullSceneDepthBlur':False,'balancedPixelCeiling':3700000,'highPixelCeiling':5500000,'sourceArtRegenerated':False}
r['validation']={'checks':reg['checks']+[{'name':'native-1080p-clarity-camera-input','pass':True},{'name':'extended-native-1080p-endurance','pass':True},{'name':'bounded-resident-route-planning','pass':True}],'sourceMatchesArtifact':True,'sharpRenderingAndControls':clarity,'endurance':endurance,'residentNavigation':resident,'locations':read('locations/report.json'),'newFeatures':read('revision/report.json'),'storyProgressionSteps':len(campaign['campaign']['log']),'storyBattles':len(campaign['campaign']['battles']),'restoredLights':len(campaign['campaign']['restored']),'saveLoad':campaign['persistence']}
r['performance']={'nativeScenarios':read('performance/native.json'),'extended1080p':endurance,'repeatedDryPlay':read('soak-release-dry.json'),'repeatedStormPlay':read('soak-release-storm.json'),'pump':read('pump-fixed.json'),'tutorial':read('onboarding-performance.json'),'combat':read('combat-profile-final.json'),'atlas':read('atlas-performance.json'),'scope':endurance['scope']}
(root/'release.json').write_text(json.dumps(r,indent=2,ensure_ascii=False)+'\n',encoding='utf-8',newline='\n')
print(json.dumps({'release':r['release'],'sha256':sha,'checks':34,'bytes':r['artifact']['bytes']}))
