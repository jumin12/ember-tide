// One exterior is retained only while visiting its buildings. It is released
// when the player leaves that town, keeping memory bounded with the continent.
const nearbyScene69={saved:null,hits:0,released:0};
function holdNearbyResources69(q){
 const resources=new Set(),add=o=>{if(o.geometry)resources.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){resources.add(m);for(const t of Object.values(m))if(t?.isTexture)resources.add(t);for(const u of Object.values(m.uniforms??{}))if(u.value?.isTexture)resources.add(u.value);}if(o.customDepthMaterial)resources.add(o.customDepthMaterial);};q.world.traverse(add);for(const m of q.world.userData.weatherCache36?.pool.values()??[])add(m);
 q.held69=[];for(const resource of resources){if(!resource.dispose)continue;const entry={resource,original:resource.dispose,active:true};entry.wrapper=function(...args){if(!entry.active)return entry.original.apply(this,args);};resource.dispose=entry.wrapper;q.held69.push(entry);}
}
function releaseNearbyResources69(q){for(const e of q.held69??[]){e.active=false;if(e.resource.dispose===e.wrapper)e.resource.dispose=e.original;}q.held69=[];}
function captureNearby69(){
 const q=captureScene68();q.lamp69={map:lampField33.map.value,bounds:lampField33.bounds.value.clone()};q.shore69={map:shoreState62.texture.value,bounds:shoreState62.bounds.value.clone(),enabled:shoreState62.enabled.value};
 q.weather69={world:weatherField.world,chunks:new Map(weatherField.chunks),x:weatherField.lastX,z:weatherField.lastZ};return q;
}
function restoreNearby69(q){
 restoreScene68(q);lampField33.map.value=q.lamp69.map;lampField33.bounds.value.copy(q.lamp69.bounds);shoreState62.texture.value=q.shore69.map;shoreState62.bounds.value.copy(q.shore69.bounds);shoreState62.enabled.value=q.shore69.enabled;
 weatherField.world=q.weather69.world;weatherField.chunks=new Map(q.weather69.chunks);weatherField.lastX=q.weather69.x;weatherField.lastZ=q.weather69.z;weatherField.updates++;
 weather.height.value=activeScene.kind==='overworld'?70:55;weather.exterior.value=activeScene.kind==='interior'?0:1;
 cameraPresentation.world=null;static36.world=shadow36.world=reflect36.world=null;nearVegetationWorld26=null;
}
function discardNearby69(){
 if(!nearbyScene69.saved)return;const current=captureNearby69(),old=nearbyScene69.saved;nearbyScene69.saved=null;
 restoreNearby69(old);releaseNearbyResources69(old);disposeContinuousWorld();restoreNearby69(current);nearbyScene69.released++;
}
const nearbyBuildBefore69=buildWorld;
buildWorld=function(id='approach',spawn=null,...args){
 const next=scenePlan(id),saved=nearbyScene69.saved,returning=saved&&activeScene?.kind==='interior'&&next.kind==='poi'&&next.key===saved.activeScene.key&&state.mode!=='title';
 if(returning){
  disposeContinuousWorld();restoreNearby69(saved);releaseNearbyResources69(saved);nearbyScene69.saved=null;state.scene=id;state.poi=activeScene.key;state.lastScene=id;
  setupParty(spawn??POIS[activeScene.key].spawn);initCombatVfx();syncStoryWorld();refreshRequestProps16();for(const o of review68.chests){const q=o.chest68;if(state.flags[q.key]){q.open=true;q.started=null;q.hinge.rotation.x=-1.65;}}
  openWorldReady=true;loading36.readyWorld=world;sceneStats.loads++;nearbyScene69.hits++;buildingEntry48.dismissed=null;updateWeather(0);updateLighting();updateCamera(1,true);updateHUD();return;
 }
 const holding=activeScene?.kind==='poi'&&next.kind==='interior'&&INTERIORS[next.key]?.poi===activeScene.key&&state.mode!=='title';
 if(saved)discardNearby69();
 if(!holding)return nearbyBuildBefore69(id,spawn,...args);
 nearbyScene69.saved=captureNearby69();holdNearbyResources69(nearbyScene69.saved);const dispose=disposeContinuousWorld;disposeContinuousWorld=()=>scene.remove(world);
 try{return nearbyBuildBefore69(id,spawn,...args);}finally{disposeContinuousWorld=dispose;}
};

// Fine grass receives tree/party shadows. Its sub-pixel blades do not need a
// second complete animation draw into the dynamic sun shadow map.
const smallPlantBefore69=buildPlants;
buildPlants=function(...args){const r=smallPlantBefore69(...args);for(const m of world.userData.plantMeshes??[])if(['grassBlades','flowers','fern','shrub'].includes(m.userData.plantKey))m.castShadow=false;return r;};
