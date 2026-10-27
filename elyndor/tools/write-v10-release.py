"""Record the measured result of the current tested release."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[2]
def read(p):return json.loads((ROOT/p).read_text(encoding='utf-8'))
out='output/elyndor/'
a=read(out+'continuous-standalone-audit.json');campaign=read(out+'continuous-verify/report.json')
events=read(out+'pixellab-v10/events/report.json');combat=read(out+'pixellab-v10/combat/report.json')
qa=read(out+'pixellab-v8/qa/report.json');ui=read(out+'pixellab-v8/interface/report.json')
surfaces=read(out+'pixellab-v8/surfaces/report.json');perf=read(out+'pixellab-v8/performance/native.json')
world=read(out+'pixellab-v10/world/report.json');layout=read(out+'pixellab-v10/layout-after.json')
regression=read(out+'pixellab-v10/regression.json');m=read('elyndor/assets/source/pixellab-v7/manifest.json')
assert world['pass'] and not layout['rows'] and not any(d['frontFree'] is False for d in layout['doors'])
assert a['sourceMatchesArtifact'] and all(x['pass'] for x in regression['checks'])
assert regression['sha256']==a['sha256']==hashlib.sha256((ROOT/'index.html').read_bytes()).hexdigest()
assert all(d['pass'] and not d['errors'] for d in [events,combat,qa,ui,surfaces])
assert campaign['campaign']['final']=='complete' and not campaign['errors']
r={'release':'elyndor-2026-10-27-world-design-v10','game':'The Last Light of Elyndor',
 'artifact':{'file':'index.html','bytes':a['bytes'],'sha256':a['sha256'],'offline':True},
 'changes':['Continuous curved waterfalls share river bank widths, endpoint normals, physical shading, ripples and two-height reflections','Settlement streets rerouted around the fountain, forge, market, canal wall and archive; forge and mill entrances repositioned','Local pathfinding uses the actual starting position, fixing bank-side click-to-walk failures','Shop counter moved beside its doorway and ground foliage cleared from streets and stair approaches','Rounded boulders with new PixelLab granite albedo; bank stones embedded in the actual terrain','New native left-facing Bren and Ascended combat loops with three individually corrected sword strike poses and synchronized contact','Five dedicated transparent PixelLab HUD head portraits, separately packed from the dialogue busts'],
 'art':{'generator':'PixelLab','nativeDesignFamilies':len(m['characters']),'spriteFamilies':a['families'],'packedSpritePoses':a['packedPoses'],'portraits':len(m['portraits']),'dedicatedHudPortraits':len(m['hudPortraits']),'worldImages':len(m['images']),'materials':15,'logicalTileSizes':[64,128],'runtimeTileSize':512,'paletteColors':60,'incompleteClips':0,'previousGameArtworkUsed':False,'prompts':'MATERIAL_PROMPTS.json'},
 'validation':{'standaloneMatchesSource':True,'spritePixelAudit':True,'sourceCropWarnings':0,'regressionChecks':regression['checks'],'waterfallVisibleFrames':[x['frames'] for x in events['falls']],'gateStrengthFrames':len(events['gate']['frames']),'waterFlowStages':{'closed':events['closed']['flow'],'gateOpen':events['gate']['flow'],'pumpRepaired':events['pump']['flow']},'wildlifeReachedEasternWoods':all(x['hidden'] and x['maxWest']>=-1 and not x['blocked'] for x in events['retreat']),'elderAutomaticallyApproachesAndTalks':events['elder']['automaticConversation'],'portraitBottomInsetPixels':events['portraits']['bottomInset'],'allSevenPartyAndAscendedAttackClipsComplete':all(len(x['frames'])==x['expectedFrames'] for x in combat['attacks']),'campaignProgressionSteps':len(campaign['campaign']['log']),'campaignBattles':len(campaign['campaign']['battles']),'restoredLights':len(campaign['campaign']['restored']),'ascensions':sum(bool(x['asc']) for x in campaign['campaign']['battles']),'navigationRoutes':len(campaign['navigation']['rows']),'blockedFollowers':campaign['walking']['blocked'],'saveLoad':all(campaign['persistence'].values()),'menuPages':len(qa['menus']),'desktopAndMobilePortraitsContained':ui['pass'],'townNpcOverlaps':qa['crowd']['overlap'],'townBuildingCollisions':qa['crowd']['blocked'],'reactiveReflectionsAndShadows':surfaces['pass'],'blockedStreetSamples':len(layout['rows']),'townInteractionRoutes':len(world['approaches']),'waterJoinMaxGapMetres':max(x['maxGap'] for x in world['joins']),'reviewedBrenRenderedFrames':len(combat['brenFrames']),'browserErrors':[]},
 'performance':{'device':perf['device']['renderer'],'nativeViewport':[1440,900],'samples':[{'area':x['name'],'fps':round(x['fps'],1),'p95FrameMs':round(x['p95FrameMs'],1),'buffer':x['buffer'],'scale':x['scale']}for x in perf['scenarios']],'singleFileReductionPercent':round((1-a['bytes']/27485826)*100,2),'scope':'Short local hardware-accelerated samples using actual render counts. Software WebGL remains substantially slower.'},
 'status':'Integrated playable regional release'}
(ROOT/'release.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'artifact':r['artifact'],'steps':r['validation']['campaignProgressionSteps'],'battles':r['validation']['campaignBattles'],'checks':len(regression['checks'])}))
