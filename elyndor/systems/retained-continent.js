// Keep one completed continent between visits. Its exact atlas already owns
// the static GPU resources; reusing the live instance buffers avoids rebuilding
// tens of thousands of trees and grass matrices on every village exit.
const continent68={saved:null,warming:false,hits:0};
function captureScene68(){return{world,activeScene,actors,player,followers,npcs,interactables,colliders,water,scenery:{...scenery},perf:{...perf,heights:new Map(perf.heights)},release:{owner:pixelRelease.world,pools:pixelRelease.pools},background:scene.background.clone(),fog:scene.fog.clone()};}
function restoreScene68(q){
 world=q.world;activeScene=q.activeScene;actors=q.actors;player=q.player;followers=q.followers;npcs=q.npcs;interactables=q.interactables;colliders=q.colliders;water=q.water;
 Object.assign(scenery,q.scenery);Object.assign(perf,q.perf);scene.background.copy(q.background);scene.fog=q.fog.clone();scene.add(world);sceneBuildFilter=false;fx=[];route=null;trail=[];trailLength=0;roadNavGraph=null;rebuildColliderGrid();
 scenery.pausedTab=null;minimap51.baseKey='';minimap51.markerKey='';visibility63.world=null;occlusionCache=null;sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;
 review68.chests.clear();for(const o of interactables)if(o.chest68)review68.chests.add(o);
 heightCache41.cells.clear();heightCache41.frame=-1;
 // The retained world owns these instance buffers too. Reattach its existing
 // release pool instead of adding five more invisible banks on every visit.
 if(q.release.owner===world){pixelRelease.world=world;pixelRelease.pools=q.release.pools;for(const bank of pixelRelease.pools){bank.active=false;bank.o.visible=false;bank.t.value=10;}}
}
const retainedBuildBefore68=buildWorld;
buildWorld=function(id='approach',spawn=null,...args){
 const isWorld=scenePlan(id).kind==='overworld';
 if(isWorld&&continent68.saved&&!continent68.warming){
  if(world!==continent68.saved.world)disposeContinuousWorld();restoreScene68(continent68.saved);
  state.scene='overworld';state.poi='overworld';state.lastScene='overworld';const p=spawn??state.overworldPosition??PLACES.overworld;
  setupParty(p);initCombatVfx();openWorldReady=true;sceneStats.loads++;continent68.hits++;
  updateLighting();updateCamera(1,true);updateHUD();return;
 }
 const retain=activeScene?.kind==='overworld'&&!isWorld&&!continent68.warming;
 if(retain)continent68.saved=captureScene68();
 const dispose=disposeContinuousWorld;if(retain)disposeContinuousWorld=()=>scene.remove(world);
 try{return retainedBuildBefore68(id,spawn,...args);}finally{disposeContinuousWorld=dispose;}
};
// Prepare the one shared continent under the initial loader, while retaining
// the title village. Travel no longer pays this construction cost under black.
warmDestinationPrograms64=async function(){
 if(destinationWarm64.ready)return;destinationWarm64.ready=true;continent68.warming=true;
 const original=captureScene68(),saved={scene:state.scene,poi:state.poi,lastScene:state.lastScene,mode:state.mode},dispose=disposeContinuousWorld;
 try{
  setLoadStage36(.98,'Preparing the connected continent…');await yieldLoad36();disposeContinuousWorld=()=>scene.remove(world);state.mode='explore';
  buildWorld('overworld',[POIS.brookstead.node[0],POIS.brookstead.node[1]+16]);updateCamera(1,true);updateLighting();updateRenderBudget(true);renderBeforeLoadingGate();
  continent68.saved=captureScene68();pinPrograms36();destinationWarm64.scenes=['retained connected continent'];destinationWarm64.programs=sceneProgramKeepers.size;
  await yieldLoad36();
 }finally{scene.remove(world);disposeContinuousWorld=dispose;Object.assign(state,saved);restoreScene68(original);continent68.warming=false;updateLighting();updateCamera(1,true);updateHUD();loading36.readyWorld=world;}
};
// The handoff's final covered frame owns destination painting. Legacy arrival
// wrappers still settle cameras/actors, but do not render the same scene three
// more times while its first shaders are being linked.
const coveredRenderBefore68=render;
render=function(...args){if(poiFade.active&&poiFade.phase==='loading'&&!poiFade.paintReady68)return;return coveredRenderBefore68(...args);};
