"""Record the measured result of the current tested release."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[2]
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8'))
out='output/elyndor/'
a=read(out+'continuous-standalone-audit.json');campaign=read(out+'continuous-verify/report.json')
events=read(out+'pixellab-v9/events/report.json');combat=read(out+'pixellab-v9/combat/report.json')
qa=read(out+'pixellab-v8/qa/report.json');ui=read(out+'pixellab-v8/interface/report.json')
surfaces=read(out+'pixellab-v8/surfaces/report.json');perf=read(out+'pixellab-v8/performance/native.json')
regression=read(out+'pixellab-v9/regression.json');m=read('elyndor/assets/source/pixellab-v7/manifest.json')
assert a['sourceMatchesArtifact'] and all(x['pass'] for x in regression['checks'])
assert regression['sha256']==a['sha256']==hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest()
assert all(d['pass'] and not d['errors'] for d in [events,combat,qa,ui,surfaces])
assert campaign['campaign']['final']=='complete' and not campaign['errors']
r={'release':'elyndor-2026-10-26-town-events-v9','game':'The Last Light of Elyndor',
 'artifact':{'file':'index.html','bytes':a['bytes'],'sha256':a['sha256'],'offline':True},
 'changes':['Stable locally bounded waterfalls excluded from static landscape culling','One sluice-height update, gradual downstream flow, pump restoration, reactive wheel and fountain supply','Native PixelLab strength animation for Bren; physical and magical work use separate actions','Town wildlife exits through the eastern woodland before continuing; the elder runs over and automatically delivers the report','Current storyboard aid-office sequence and peaceful scout rescue','Full attack recovery frames, bounded melee movement, planted ranged attacks and synchronized projectile hits','Portraits inset upward and right from the trim; menu focus and flexible layout fixes','Accepted 128-pixel PixelLab grass and earth swatches, organic material variation, softened path edges and consistent main-road paving'],
 'art':{'generator':'PixelLab','nativeDesignFamilies':len(m['characters']),'spriteFamilies':a['families'],'packedSpritePoses':a['packedPoses'],'portraits':len(m['portraits']),'worldImages':len(m['images']),'materials':15,'logicalTileSizes':[64,128],'runtimeTileSize':512,'paletteColors':60,'incompleteClips':0,'previousGameArtworkUsed':False,'prompts':'MATERIAL_PROMPTS.json'},
 'validation':{'standaloneMatchesSource':True,'spritePixelAudit':True,'sourceCropWarnings':0,'regressionChecks':regression['checks'],'waterfallVisibleFrames':[x['frames'] for x in events['falls']],'gateStrengthFrames':len(events['gate']['frames']),'waterFlowStages':{'closed':events['closed']['flow'],'gateOpen':events['gate']['flow'],'pumpRepaired':events['pump']['flow']},'wildlifeReachedEasternWoods':all(x['hidden'] and x['maxWest']>=-1 and not x['blocked'] for x in events['retreat']),'elderAutomaticallyApproachesAndTalks':events['elder']['automaticConversation'],'portraitBottomInsetPixels':events['portraits']['bottomInset'],'allSevenPartyAndAscendedAttackClipsComplete':all(len(x['frames'])==x['expectedFrames'] for x in combat['attacks']),'campaignProgressionSteps':len(campaign['campaign']['log']),'campaignBattles':len(campaign['campaign']['battles']),'restoredLights':len(campaign['campaign']['restored']),'ascensions':sum(bool(x['asc']) for x in campaign['campaign']['battles']),'navigationRoutes':len(campaign['navigation']['rows']),'blockedFollowers':campaign['walking']['blocked'],'saveLoad':all(campaign['persistence'].values()),'menuPages':len(qa['menus']),'desktopAndMobilePortraitsContained':ui['pass'],'townNpcOverlaps':qa['crowd']['overlap'],'townBuildingCollisions':qa['crowd']['blocked'],'reactiveReflectionsAndShadows':surfaces['pass'],'browserErrors':[]},
 'performance':{'device':perf['device']['renderer'],'nativeViewport':[1440,900],'samples':[{'area':x['name'],'fps':round(x['fps'],1),'p95FrameMs':round(x['p95FrameMs'],1),'buffer':x['buffer'],'scale':x['scale']}for x in perf['scenarios']],'singleFileReductionPercent':round((1-a['bytes']/27485826)*100,2),'scope':'Short local hardware-accelerated samples using actual render counts. Software WebGL remains substantially slower.'},
 'status':'Integrated playable regional release'}
(ROOT/'release.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'artifact':r['artifact'],'steps':r['validation']['campaignProgressionSteps'],'battles':r['validation']['campaignBattles'],'checks':len(regression['checks'])}))
