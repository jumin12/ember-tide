// Keep native character pixels and responsive UI independent of the scenery
// budget. Phones must not prepare every NPC, monster and continent at boot.
const PARTY_SPRITES116=new Set(['bren','soren','tavin','mira','lysa']);
function mobileStartup116(){return matchMedia('(pointer:coarse)').matches||/Android|iPhone|iPad|iPod/.test(navigator.userAgent);}
const startup116={pending:new Map(),decoded:new Map(),errors:[],placeholder:document.createElement('canvas'),evictions:0};
startup116.placeholder.width=startup116.placeholder.height=1;
let environmentUrls116;
function fitEnvironmentImage116(image,url,dataKind=false){
 if(!mobileStartup116())return image;
 environmentUrls116??=new Set(Object.values(assets.environment103.images).flatMap(q=>[q.url,q.file]));
 if(!dataKind&&!environmentUrls116.has(url))return image;
 const cap=dataKind?256:512,scale=Math.min(1,cap/Math.max(image.width,image.height));if(scale===1)return image;
 const c=document.createElement('canvas');c.width=Math.max(1,Math.round(image.width*scale));c.height=Math.max(1,Math.round(image.height*scale));c.getContext('2d').drawImage(image,0,0,c.width,c.height);image.src='';return c;
}
async function loadImage116(url,label){
 for(let attempt=0;attempt<2;attempt++){
  const image=new Image();image.decoding='async';
  try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{image.onload=image.onerror=null;image.src='';reject(Error('Artwork request timed out: '+label));},30000);image.onload=()=>{clearTimeout(timer);image.onload=image.onerror=null;resolve();};image.onerror=()=>{clearTimeout(timer);image.onload=image.onerror=null;reject(Error('Could not load artwork: '+label));};image.src=url;});if(image.decode)await image.decode();return image;}
  catch(e){image.src='';if(attempt===1)throw e;await new Promise(r=>setTimeout(r,250));}
 }
}
function spriteReady116(id){return spriteImages[id]&&spriteImages[id]!==startup116.placeholder;}
function ensureSprite116(id){
 if(spriteReady116(id))return Promise.resolve(spriteImages[id]);
 if(startup116.pending.has(id))return startup116.pending.get(id);
 const meta=assets.sprites[id];if(!meta)return Promise.reject(Error('Unknown character '+id));
 const task=loadImage116(meta.url,id).then(image=>{
  spriteImages[id]=image;startup116.decoded.set(id,performance.now());rank87.silhouettes.delete(id);spriteAvatars27.delete(id);
  for(const a of actors)if((a.visualId??a.id)===id&&a.mesh?.material?.map){const q=a.mesh.material.map.userData.frame33;if(q){q.cell=-1;delete q.alignmentKey107;}setActorFrame(a,a.frame?.action??a.face,a.frame?.index??0);}
  sun.shadow.needsUpdate=renderer.shadowMap.needsUpdate=true;return image;
 }).catch(e=>{startup116.errors.push(e.message);throw e;}).finally(()=>startup116.pending.delete(id));
 startup116.pending.set(id,task);return task;
}
const actorBefore116=createActor;
const textureBefore116=actorTexture;
actorTexture=function(id){if(!spriteReady116(id)){spriteImages[id]=startup116.placeholder;ensureSprite116(id).catch(()=>{});}return textureBefore116(id);};
createActor=function(id,...args){
 if(!spriteReady116(id)){spriteImages[id]=startup116.placeholder;ensureSprite116(id).catch(()=>{});}
 return actorBefore116(id,...args);
};
async function settleSprites116(){while(startup116.pending.size)await Promise.all([...startup116.pending.values()]);}
function trimSprites116(){
 if(!mobileStartup116())return;
 const keep=new Set([...PARTY_SPRITES116,...actors.filter(a=>a.mesh?.parent).map(a=>a.visualId??a.id),...(continent68.saved?.actors??[]).map(a=>a.visualId??a.id)]);
 // A retained continent owns its small current-frame canvases, not full sheets.
 for(const[id,image]of Object.entries(spriteImages))if(!keep.has(id)&&image!==startup116.placeholder){image.src='';delete spriteImages[id];startup116.decoded.delete(id);startup116.evictions++;}
}
const graphicsBefore116=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){
 // A cached POI can restore its actors without calling createActor again.
 await Promise.all([...new Set(actors.filter(a=>a.mesh?.parent).map(a=>a.visualId??a.id))].map(ensureSprite116));await settleSprites116();trimSprites116();
 // Render only the destination being entered. Legacy warmup also builds an
 // unused continent and compiles every offscreen/battle geometry variation.
 if(!loading36.active)beginLoad36();setLoadStage36(.72,'Preparing this location…');await yieldLoad36();
 prepareSurface67();finishWorld102();completeArrival70();updateWorldWeather15(true);ensureCombatPointer15();initPixelRelease();
 await prepareSounds36();updateCamera(1,true);updateLighting();updateRenderBudget(true);
 settleArrival28();settleRequestTargets68();await compileVisible136();renderBeforeLoadingGate();pinPrograms36();
 const gl=renderer.getContext(),fence=gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE,0),deadline=performance.now()+2000;
 if(fence){gl.flush();try{while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED&&performance.now()<deadline&&!gl.isContextLost())await yieldLoad36();}finally{gl.deleteSync(fence);}}
 if(gl.isContextLost())throw Error('Graphics memory was exhausted. Reload to retry.');
 loading36.readyWorld=world;transitionGraphics64.ready=true;setLoadStage36(.99,'Ready');await yieldLoad36();finishLoad36();return;
};
// Select each roster once. Decode before silhouette-based formation; the
// battle constructor later consumes that same selection without another roll.
const rosterBefore116=encounterRoster;
encounterRoster=function(kind,...args){const q=startup116.roster;if(q?.kind===kind){startup116.roster=null;return rank87.roster=q.rows;}return rosterBefore116(kind,...args);};
const beginBattleBefore116=beginBattle;
beginBattle=function(kind,...args){
 if(battle||gameLoading||startup116.battleTask||encounter53.phase!=='idle'||sceneSwitchPending||poiFade.active||dialogue||eventAction||transition||restoration)return beginBattleBefore116(kind,...args);
 const rows=rosterBefore116(kind),ids=[...new Set([...rows.map(q=>q[0]),...rows.map(q=>assets.sprites[q[0]+'Battle35']?q[0]+'Battle35':q[0]),...state.members.map(id=>id+'Ascended').filter(id=>assets.sprites[id])])];
 startup116.roster={kind,rows};
 const missing=ids.filter(id=>!spriteReady116(id));if(!missing.length)return beginBattleBefore116(kind,...args);
 // Keep the scripted combat handoff covered too, rather than exposing empty
 // canvases or computing a zero-width enemy footprint while its art loads.
 setJourneyLoading(true);setLoadStage36(.5,'Preparing the encounter…');
 startup116.battleTask=Promise.all(missing.map(ensureSprite116)).then(()=>{setJourneyLoading(false);return beginBattleBefore116(kind,...args);}).catch(e=>{setJourneyLoading(false);$('#fatal-text').textContent=e.message;$('#fatal').classList.remove('hidden');startup116.roster=null;}).finally(()=>startup116.battleTask=null);
 return startup116.battleTask;
};
const coverBefore116=advanceEncounterCover53;
advanceEncounterCover53=function(dt){const c=encounter53;if(c.phase==='enter'&&!c.swapped&&startup116.pending.size&&c.time+dt>c.duration*.44){if(c.time<c.duration*.44)coverBefore116(c.duration*.44-c.time);return;}return coverBefore116(dt);};
// Native URLs can stream directly; converting them as base64 corrupts audio.
const audioUrlBefore116=audioURL;
audioURL=function(id){const source=assets.sounds?.[id];return source&&!source.startsWith('data:')?new URL(source,document.baseURI).href:audioUrlBefore116(id);};
// Build the exact playable continent when it is first requested, with a
// covered handoff; do not keep a second world beside the phone title screen.
const continentWarmBefore116=warmDestinationPrograms64;
warmDestinationPrograms64=async function(){if(mobileStartup116())return;return continentWarmBefore116();};
const titleBefore116=switchTitleScene19;
switchTitleScene19=async function(...args){
 if(!startup116.titleReused&&state.mode==='title'&&activeScene?.key==='brookstead'){
  // Boot has already built and prepared this exact river prospect. Rebuilding
  // it for the first title view doubles town construction and peak memory.
  startup116.titleReused=true;title19.scene='brookstead';title19.focus=[-161,102];title19.age=0;
  $('#title-location').textContent='Brookstead · The riverlands';hideTitleParty19();updateCamera(1,true);updateLighting();render();return;
 }
 return titleBefore116(...args);
};
const buildBefore116=buildWorld;
buildWorld=function(...args){if(loading36.mapPreparation)return;startup116.building=(startup116.building??0)+1;try{return buildBefore116(...args);}finally{startup116.building--;}};
// Cached-scene disposal can request a paint between removing its player and
// seating the next party. That intermediate graph is never a visible frame.
const coveredPaintBefore116=renderBeforeLoadingGate;
renderBeforeLoadingGate=function(...args){if(startup116.building||!player)return;return coveredPaintBefore116(...args);};
const paintBefore116=render;
render=function(...args){if(startup116.building||!player)return;return paintBefore116(...args);};
// Scene/battle restoration intentionally clears old travel history. Seed it
// from the restored formation before the next follower tick queries a point.
const trailBefore116=trailPoint;
trailPoint=function(distance){
 if(!trail.length){
  if(!player)return{x:cameraTarget.x,z:cameraTarget.z};
  const points=[...followers].reverse().concat(player);trailLength=0;
  trail=points.map((a,i)=>{if(i)trailLength+=dist(points[i-1],a);return{x:a.x,z:a.z,s:trailLength};});
 }
 return trailBefore116(distance);
};
const menuBefore116=openMenu;
openMenu=function(tab,...args){
 if(tab!=='map'||exactAtlas67.scene)return menuBefore116(tab,...args);
 if(startup116.mapTask)return startup116.mapTask;
 setJourneyLoading(true);setLoadStage36(.25,'Preparing the world map…');
 startup116.mapTask=(async()=>{try{await yieldLoad36();await ensureWorldData136(true);await continentWarmBefore116();await settleSprites116();setJourneyLoading(false);return menuBefore116(tab,...args);}catch(e){setJourneyLoading(false);$('#fatal-text').textContent=e.message;$('#fatal').classList.remove('hidden');}finally{startup116.mapTask=null;}})();return startup116.mapTask;
};
