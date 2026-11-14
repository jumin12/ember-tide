// Keep the private yard and room resident across their doorway. The native
// location cache still owns the return town; these two entries have a separate
// geometry budget and are invalidated by ownership, layout and finish changes.
const homeResident151={entries:new Map(),owner:null,bytes:0,hits:0,builds:0,evictions:0};
function prepareHomeLights151(){
 if(!isHomeScene139())return;let count=0;scene.traverse(o=>{if(o.isPointLight&&o.visible)count++;});for(let i=count;i<12;i++){const light=new THREE.PointLight('#ffd39a',0,5,2);light.userData.emptySlot64=true;world.add(light);}
 world.userData.homeDecorLights151=world.children.filter(o=>o.isPointLight&&o.userData.emptySlot64).slice(0,mobileStartup116()?4:8);updateHomeLights151();
}
function updateHomeLights151(){
 const slots=world?.userData.homeDecorLights151;if(!slots)return;const rows=[];
 for(const root of world.userData.homeDecorRoots139?.values()??[])root.traverse(o=>{if(o.isPointLight&&o.userData.homeSource151){o.visible=false;if(root.visible){const pos=o.getWorldPosition(V3());rows.push({light:o,pos,d:Math.hypot(pos.x-player.x,pos.z-player.z)});}}});rows.sort((a,b)=>a.d-b.d);
 for(let i=0;i<slots.length;i++){const source=rows[i],slot=slots[i];slot.intensity=source?.light.intensity??0;if(source){slot.position.copy(source.pos);slot.color.copy(source.light.color);slot.distance=source.light.distance;}}
}
const homeLightModelBefore151=homeDecorModel139;
homeDecorModel139=function(item,parent,...args){const root=homeLightModelBefore151(item,parent,...args);if(parent===world)root.traverse(o=>{if(o.isPointLight){o.userData.homeSource151=true;o.visible=false;}});return root;};
const homeLightUpdateBefore151=updateHomeDecor139;
updateHomeDecor139=function(...args){const r=homeLightUpdateBefore151(...args);updateHomeLights151();return r;};
const homeLightCancelBefore151=cancelHomeDraft139;
cancelHomeDraft139=function(...args){const r=homeLightCancelBefore151(...args);updateHomeLights151();return r;};
const homeItemPrograms151=new WeakMap();
function warmHomeItem151(item){
 if(!isHomeScene139()||!renderer.compileAsync)return;let cache=homeItemPrograms151.get(world);if(!cache){cache=new Map();homeItemPrograms151.set(world,cache);}if(cache.has(item))return cache.get(item);
 const owner=world,holder=new THREE.Group(),model=homeDecorModel139(item,holder),visible=new THREE.Group();model.traverse(o=>{if(o.isLight)o.visible=false;});visible.traverse=fn=>model.traverse(o=>{if(o.isMesh)fn(o);});visible.traverseVisible=()=>{};
 const target=renderer.getRenderTarget();renderer.setRenderTarget(post.target);const task=renderer.compileAsync(visible,camera,scene).then(()=>{if(world===owner)pinPrograms36();}).finally(()=>{renderer.setRenderTarget(target);disposeHomeObject139(model);});cache.set(item,task);task.catch(e=>console.error('Furniture materials could not prepare',e));return task;
}
const homeItemSelectBefore151=selectHomeItem139;
selectHomeItem139=function(...args){const r=homeItemSelectBefore151(...args);if(homeDecor139.draft)warmHomeItem151(homeDecor139.draft.item);return r;};
function disposeResidentParty151(){
 const shared=new Set(Object.values(sharedGeo));for(const a of [player,...followers])for(const o of [a?.mesh,a?.shadow].filter(Boolean)){if(o.geometry&&!shared.has(o.geometry))o.geometry.dispose();o.customDepthMaterial?.dispose();if(o===a.mesh)o.material.map?.dispose();o.material.dispose();}
}
function homeResidentKey151(){return JSON.stringify([housing139().home?.region,housing139().home?.layout,homeAppearance139(),state.settings.quality]);}
function evictHomeResident151(id){
 const q=homeResident151.entries.get(id);if(!q)return;homeResident151.entries.delete(id);homeResident151.bytes-=q.bytes137;
 const live=captureNearby69();holdNearbyResources69(live);try{restoreNearby69(q);releaseNearbyResources69(q);disposeContinuousWorld();}finally{restoreNearby69(live);releaseNearbyResources69(live);}homeResident151.evictions++;
}
const homeResidentBuildBefore151=buildWorld;
buildWorld=function(id='approach',spawn=null,...args){
 if(loading36.mapPreparation)return homeResidentBuildBefore151(id,spawn,...args);
 const c=homeResident151,key=homeResidentKey151();if(c.owner!==state){for(const id of [...c.entries.keys()])evictHomeResident151(id);c.owner=state;}
 for(const [id,q]of c.entries)if(q.homeKey151!==key||!housing139().home)evictHomeResident151(id);
 let cached=isHomeScene139(id)&&c.entries.get(id),retained=null;
 if(cached){c.entries.delete(id);c.bytes-=cached.bytes137;}
 if(housing139().home&&isHomeScene139()&&state.scene!==id&&world?.userData.homeResidentKey151===key&&state.mode!=='title'){
  const q=captureNearby69();q.bytes137=locationBytes137(q);q.homeKey151=key;const cap=(mobileStartup116()?64:128)*1024*1024;
  if(q.bytes137<=cap){while(c.entries.size&&c.bytes+q.bytes137>cap)evictHomeResident151(c.entries.keys().next().value);holdNearbyResources69(q);c.entries.set(state.scene,q);c.bytes+=q.bytes137;retained=q;}
 }
 const dispose=disposeContinuousWorld;if(retained){disposeContinuousWorld=()=>scene.remove(world);detachLocationGlobals137();}
 try{
  if(!cached){const r=homeResidentBuildBefore151(id,spawn,...args);if(isHomeScene139(id)){world.userData.homeResidentKey151=key;prepareHomeLights151();c.builds++;}return r;}
  if(world!==cached.world)disposeContinuousWorld();restoreNearby69(cached);releaseNearbyResources69(cached);state.scene=id;state.poi='homePlot139';state.lastScene=id;
  for(const p of world.userData.homePortals139??[]){p.energy=p.material.uniforms.energy.value=0;if(p.threshold151){p.threshold151.root.visible=false;p.threshold151.u.time151.value=clock;for(const h of p.threshold151.hits)h.w=0;}}
  document.body.classList.add('home-scene139');camera.far=280;post.material.uniforms.nearFar.value.y=280;disposeResidentParty151();setupParty(spawn??(id==='homePlot139'?[7.5,19]:[0,homeLayout139().d/2-3.6]));rebuildHomeDecor139();updateHomeLights151();initCombatVfx();openWorldReady=true;loading36.readyWorld=world;buildingEntry48.dismissed=null;sceneStats.loads++;updateWeather(0);updateLighting();updateCamera(1,true);updateHUD();c.hits++;return;
 }finally{disposeContinuousWorld=dispose;}
};

// Asset decoding alone does not prepare the first GPU draw. Compile the real
// hidden threshold, spell and cast sprite against the destination's HDR target
// while the purchase catalogue is open, including their custom shadow shaders.
const homeWarm151={tasks:new WeakMap(),completed:0};
async function warmHomePrograms151(){
 const owner=world,p=owner?.userData.homePortals139?.[0],keeper=owner?.userData.homeKeeper139?.a;if(!p||!keeper)return;
 if(homeWarm151.tasks.has(owner))return homeWarm151.tasks.get(owner);
 const task=(async()=>{
  await Promise.all([warmReturnArt148(),warmPortalAudio149(),ensureSprite116('azarithCast146')]);if(world!==owner)return;
  bindReturnLayers148(p);const proxy=new THREE.Group(),materials=new Set(),original=renderer.getRenderTarget(),show=new Set();
  const collect=root=>root.traverse(o=>{if(!o.isMesh&&!o.isPoints)return;if(o.parent===p.return148.retired||!o.geometry)return;show.add(o);materials.add(o.material);if(o.customDepthMaterial){const depth=new THREE.Mesh(o.geometry,o.customDepthMaterial);proxy.add(depth);}});
  // Retired generic layers are deliberately excluded from preparation too.
  for(const child of p.group.children)if(child!==p.return148.retired)collect(child);collect(p.fx146.group);show.add(keeper.mesh);
  const actor=createActor('azarithCast146',keeper.x,keeper.z,keeper.size);actors.splice(actors.indexOf(actor),1);actor.mesh.removeFromParent();actor.shadow?.removeFromParent();show.add(actor.mesh);
  const visible=new THREE.Group();visible.traverse=fn=>{for(const o of show)fn(o);proxy.traverse(fn);};visible.traverseVisible=()=>{};
  const clipping=renderer.clippingPlanes;
  try{renderer.setRenderTarget(post.target);await renderer.compileAsync(visible,camera,scene);
   if(water?.visible){renderer.setRenderTarget(reflectionTarget);renderer.clippingPlanes=[new THREE.Plane(V3(0,1,0),-water.position.y-.015)];renderer.render(new THREE.Scene(),camera);await renderer.compileAsync(visible,camera,scene);renderer.clippingPlanes=clipping;}
   if(world!==owner)return;for(const t of [returnArt148.texture,...returnArt148.layers,actor.mesh.material.map])if(t?.isTexture)renderer.initTexture(t);
   // A real covered draw also uploads vertex buffers and prepares the shadow
   // pass, which compileAsync alone does not visit. No screen pixels change.
   const saved={viewport:renderer.getViewport(new THREE.Vector4()),scissor:renderer.getScissor(new THREE.Vector4()),test:renderer.getScissorTest(),open:p.open146.value,stone:p.stoneReveal146.value,group:p.group.visible,fx:p.fx146.group.visible,threshold:p.threshold151.root.visible},hidden=[];
   owner.traverse(o=>{if((o.isMesh||o.isPoints)&&!show.has(o)){hidden.push([o,o.visible]);o.visible=false;}});owner.add(actor.mesh);p.group.visible=p.fx146.group.visible=p.threshold151.root.visible=true;p.open146.value=p.stoneReveal146.value=1;
   try{const eye=camera.clone(),target=p.group.localToWorld(V3(0,2.1,0));eye.position.copy(target).add(V3(0,.3,6));eye.lookAt(target);eye.updateMatrixWorld(true);renderer.setRenderTarget(post.target);renderer.setViewport(0,0,2,2);renderer.setScissor(0,0,2,2);renderer.setScissorTest(true);renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;renderer.render(scene,eye);if(water?.visible){renderer.setRenderTarget(reflectionTarget);renderer.clippingPlanes=[new THREE.Plane(V3(0,1,0),-water.position.y-.015)];renderer.render(scene,eye);renderer.clippingPlanes=clipping;}}
   finally{actor.mesh.removeFromParent();for(const [o,value]of hidden)o.visible=value;p.group.visible=saved.group;p.fx146.group.visible=saved.fx;p.threshold151.root.visible=saved.threshold;p.open146.value=saved.open;p.stoneReveal146.value=saved.stone;renderer.setViewport(saved.viewport);renderer.setScissor(saved.scissor);renderer.setScissorTest(saved.test);renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;shadowBudget138.at=-Infinity;}
   pinPrograms36();homeWarm151.completed++;}
  finally{renderer.clippingPlanes=clipping;renderer.setRenderTarget(original);actor.mesh.geometry.dispose();actor.mesh.material.map?.dispose();actor.mesh.material.dispose();actor.shadow?.geometry.dispose();actor.shadow?.material.dispose();}
 })().catch(e=>{homeWarm151.tasks.delete(owner);throw e;});homeWarm151.tasks.set(owner,task);return task;
}
const homeWarmCastBefore151=warmHomeCast146;
warmHomeCast146=function(){return Promise.all([homeWarmCastBefore151(),warmHomePrograms151()]).then(([cast])=>cast);};
const homeReadyBefore151=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){const r=await homeReadyBefore151(...args);if(isHomeScene139())homePreviewStudio147();if(housing139().home&&world?.userData.homePortals139?.length)await warmHomePrograms151();return r;};
const homePerformanceBootBefore151=boot;
boot=async function(...args){const r=await homePerformanceBootBefore151(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const d=JSON.parse(before());d.homePerformance151={resident:[...homeResident151.entries.keys()],residentBytes:homeResident151.bytes,hits:homeResident151.hits,builds:homeResident151.builds,evictions:homeResident151.evictions,spellPrograms:homeWarm151.completed,gpuPreview:!!homeCraft147.renderer};return JSON.stringify(d);};return r;};
