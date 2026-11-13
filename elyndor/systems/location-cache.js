// One inactive outdoor location can be retained alongside the current scene.
// Story/quality changes and new journeys invalidate it. Interiors keep their
// existing exterior cache; all entries share reference-counted GPU ownership.
const locations137={entries:new Map(),metadata:new WeakMap(),owner:null,pending:null,hits:0,misses:0,evictions:0,bytes:0};
const heldResources137=new WeakMap();
holdNearbyResources69=function(q){
 const resources=new Set(),add=o=>{if(o===visibility63.mesh)return;if(o.geometry)resources.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){resources.add(m);for(const t of Object.values(m))if(t?.isTexture)resources.add(t);for(const u of Object.values(m.uniforms??{}))if(u.value?.isTexture)resources.add(u.value);}if(o.customDepthMaterial)resources.add(o.customDepthMaterial);};
 q.world.traverse(add);for(const m of q.world.userData.weatherCache36?.pool.values()??[])add(m);q.held69=[];
 for(const resource of resources){if(!resource.dispose)continue;let entry=heldResources137.get(resource);if(!entry){entry={base:resource.dispose,owners:new Set()};entry.wrapper=function(...args){if(!entry.owners.size)return entry.base.apply(this,args);};heldResources137.set(resource,entry);resource.dispose=entry.wrapper;}entry.owners.add(q);q.held69.push(resource);}
};
releaseNearbyResources69=function(q){
 for(const resource of q.held69??[]){const entry=heldResources137.get(resource);if(!entry)continue;entry.owners.delete(q);if(!entry.owners.size){if(resource.dispose===entry.wrapper)resource.dispose=entry.base;heldResources137.delete(resource);}}q.held69=[];
};
const captureLocationBefore137=captureNearby69;
captureNearby69=function(){const q=captureLocationBefore137();q.locals137={roads:[...ROADS],segments:[...ROAD_SEGMENTS],grid:new Map(ROAD_GRID),pointer:{world:combatPointer.world,ring:combatPointer.ring},bounds:landscapeBounds26&&[...landscapeBounds26],mirrors:new Map(mirrors111.owned),mill:{world:mill111.world,angle:mill111.angle,previous:mill111.previous,speed:mill111.speed,spray:mill111.spray,contact:mill111.contact.value.clone(),wake:mill111.wake.value.clone()}};return q;};
const restoreLocationBefore137=restoreNearby69;
restoreNearby69=function(q){
 restoreLocationBefore137(q);const p=q.locals137;if(!p)return;
 ROADS.splice(0,ROADS.length,...p.roads);ROAD_SEGMENTS.splice(0,ROAD_SEGMENTS.length,...p.segments);ROAD_GRID.clear();for(const[k,v]of p.grid)ROAD_GRID.set(k,v);
 Object.assign(combatPointer,p.pointer,{hover:null,focus:null});
 roadGrades27.clear();continuationCache32.clear();constructionCache.world=roadCache33.world=null;landscapeBounds26=p.bounds&&[...p.bounds];mirrors111.owned=new Map(p.mirrors);
 Object.assign(mill111,{world:p.mill.world,angle:p.mill.angle,previous:p.mill.previous,speed:p.mill.speed,spray:p.mill.spray});mill111.contact.value.copy(p.mill.contact);mill111.wake.value.copy(p.mill.wake);
};
function locationStamp137(){return JSON.stringify([state.flags,state.restoredLights,state.settings.quality,state.river17?.released,!!state.regionalRestoration]);}
function locationBytes137(q){
 const buffers=new Set();let matrices=0;
 q.world.traverse(o=>{for(const g of new Set([o.geometry,o.userData.fullGeometry,o.userData.farGeometry,o.userData.detailedGeometry,o.userData.distantGeometry].filter(Boolean))){if(g.index)buffers.add(g.index.array.buffer);for(const a of Object.values(g.attributes))buffers.add(a.array.buffer);}if(o.instanceMatrix)buffers.add(o.instanceMatrix.array.buffer);if(o.instanceColor)buffers.add(o.instanceColor.array.buffer);matrices+=(o.userData.plantOriginal?.length??0)*160;});
 return [...buffers].reduce((n,b)=>n+b.byteLength,matrices);
}
function evictLocation137(key){
 const q=locations137.entries.get(key);if(!q)return;locations137.entries.delete(key);locations137.bytes-=q.bytes137;
 const current=captureNearby69();holdNearbyResources69(current);try{restoreNearby69(q);releaseNearbyResources69(q);disposeContinuousWorld();}finally{restoreNearby69(current);releaseNearbyResources69(current);}locations137.evictions++;
}
function detachLocationGlobals137(){mirrors111.owned=new Map();mill111.world=null;mill111.spray=null;}
function clearLocations137(){for(const key of [...locations137.entries.keys()])evictLocation137(key);}
function restorePoi137(id,spawn){
 const q=locations137.pending;if(!q)return false;locations137.pending=null;
 if(world!==q.world)disposeContinuousWorld();restoreNearby69(q);releaseNearbyResources69(q);state.scene=id;state.poi=activeScene.key;state.lastScene=id;
 setupParty(spawn??POIS[activeScene.key].spawn);initCombatVfx();syncStoryWorld();refreshRequestProps16();openWorldReady=true;loading36.readyWorld=world;sceneStats.loads++;buildingEntry48.dismissed=null;
 updateWeather(0);updateLighting();updateCamera(1,true);updateHUD();locations137.hits++;return true;
}
const locationBuildBefore137=buildWorld;
buildWorld=function(id='approach',spawn=null,...args){
 if(loading36.mapPreparation)return locationBuildBefore137(id,spawn,...args);
 const next=scenePlan(id),stamp=locationStamp137();
 if(locations137.owner!==state){clearLocations137();locations137.owner=state;}
 for(const[key,q]of locations137.entries)if(q.stamp137!==stamp)evictLocation137(key);
 let cached=next.kind==='poi'&&locations137.entries.get(next.key),retain=null;
 if(cached){locations137.entries.delete(next.key);locations137.bytes-=cached.bytes137;locations137.pending=cached;}
 const meta=locations137.metadata.get(world),leaving=activeScene?.kind==='poi'&&next.kind!=='interior'&&next.key!==activeScene.key&&state.mode!=='title'&&!continent68.warming;
 if(leaving&&meta?.owner===state&&meta.stamp===stamp){
  const q=captureNearby69();q.bytes137=locationBytes137(q);q.stamp137=stamp;
  const cap=(mobileStartup116()?64:128)*1024*1024;
  if(q.bytes137<=cap){while(locations137.entries.size)evictLocation137(locations137.entries.keys().next().value);holdNearbyResources69(q);locations137.entries.set(activeScene.key,q);locations137.bytes+=q.bytes137;retain=q;}
 }
 const retainContinent=!!cached&&activeScene?.kind==='overworld'&&!continent68.warming;
 if(retainContinent)continent68.saved=captureNearby69();
 const dispose=disposeContinuousWorld;
 if(retain||retainContinent){disposeContinuousWorld=()=>scene.remove(world);detachLocationGlobals137();}
 try{const r=locationBuildBefore137(id,spawn,...args);locations137.metadata.set(world,{owner:state,stamp:locationStamp137(),key:activeScene.key});if(!cached&&next.kind==='poi')locations137.misses++;return r;}
 finally{disposeContinuousWorld=dispose;locations137.pending=null;}
};

// A retained house can be prepared again. Stacking these callbacks would save
// an already-hidden draw range and permanently hide its geometry on return.
const configuredViews137=new WeakSet(),configureViewBefore137=configureViewMesh;
configureViewMesh=function(o){
 if(!o.isMesh)return;if(configuredViews137.has(o)){o.userData.viewHidden=false;return;}
 configuredViews137.add(o);return configureViewBefore137(o);
};
