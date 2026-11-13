// Only scenery URLs are redirected. Native sprites, portraits and UI retain
// their original pixels and download/export paths.
const delivery138={requests:0,mobile:0,desktop:0,errors:[]};
const imageBefore138=loadImage116;
loadImage116=function(url,label){
 const row=assets?.delivery138?.[url];
 if(row){const tier=mobileStartup116()?'mobile':'desktop';delivery138.requests++;delivery138[tier]++;url=row[tier];}
 return imageBefore138(url,label);
};

const gpuDelivery138={promise:null,loader:null,arrays:{},bytes:0};
async function prepareGpuArrays138(){
 if(!assets?.gpu138||window.__disableGpu138)return false;
 if(gpuDelivery138.promise)return gpuDelivery138.promise;
 gpuDelivery138.promise=(async()=>{
  const config=assets.gpu138,{KTX2Loader}=await import('./'+config.loader),loader=new KTX2Loader().setTranscoderPath(config.transcoder).setWorkerLimit(mobileStartup116()?1:2).detectSupport(renderer);
  gpuDelivery138.loader=loader;const tier=mobileStartup116()?'mobile':'desktop';
  for(const [name,row]of Object.entries(config.arrays)){
   const meta=row[tier],texture=await loader.loadAsync(meta.url);
   texture.colorSpace=row.data?THREE.NoColorSpace:THREE.SRGBColorSpace;
   texture.wrapS=texture.wrapT=name==='leaves'?THREE.ClampToEdgeWrapping:THREE.RepeatWrapping;
   texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.userData={pinnedMap17:true,shared138:true,array138:name};pinMapResource17(texture);
   gpuDelivery138.arrays[name]=texture;gpuDelivery138.bytes+=meta.bytes;
  }
  return true;
 })().catch(error=>{delivery138.errors.push(error.message);for(const t of Object.values(gpuDelivery138.arrays))t.dispose();gpuDelivery138.arrays={};gpuDelivery138.loader?.dispose();gpuDelivery138.loader=null;return false;});
 return gpuDelivery138.promise;
}
async function packedPbr138(keys){
 if(!await prepareGpuArrays138())return false;
 const expected=assets.gpu138.arrays.surfaceData.keys;
 return expected.length===keys.length&&expected.every((key,i)=>key===keys[i]);
}
const assetsBefore138=loadAssets;
loadAssets=async function(...args){assets=ASSETS;const packed=prepareGpuArrays138();const result=await assetsBefore138(...args);await packed;return result;};
const loreBefore138=setLoadingLore;
setLoadingLore=function(...args){
 const previous=document.querySelector('.loading-scenery .lore-active');loreBefore138(...args);
 const next=document.querySelector('.loading-scenery .lore-active'),img=next?.querySelector('img');
 if(!img?.dataset.src||img.getAttribute('src'))return;
 if(previous&&previous!==next){next.classList.remove('lore-active');previous.classList.add('lore-active');}
 const ready=new Image();ready.onload=()=>{img.src=img.dataset.src;if($('#load-screen').dataset.lore===next.dataset.lore){previous?.classList.remove('lore-active');next.classList.add('lore-active');}};ready.src=img.dataset.src;
};
// Standalone props need only their current location's normal maps. Batched
// architecture and ground use their compressed arrays, not duplicate decodes.
const graphicsBefore138=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){
 if(assets.gpu138&&gpuDelivery138.arrays.surfaceData){
  const mats=new Set(),actorMats=new Set(actors.map(a=>a.mesh.material)),keys=new Set();
  world.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){if(actorMats.has(m)||!m.isMeshStandardMaterial||m.userData.environment103||m.userData.ground102||m.userData.water62)continue;const key=m.userData.pbr103?.key??m.map?.userData.canonical103??canonical103(m.userData.textureKey??m.userData.surface67);if(source103(key)?.pbr){keys.add(key);mats.add([m,key]);}}});
  await Promise.all([...keys].map(key=>texture103(key,'normalRough')));
  for(const [m,key]of mats){const nr=envPbr103.maps.get(key+':normalRough');if(nr&&m.normalMap!==nr&&!m.userData.botany102){m.normalMap=nr;m.normalScale.setScalar(.32);m.needsUpdate=true;}}
 }
 return graphicsBefore138(...args);
};

// Contact discs still sit on the actual rendered triangles. Index static walk
// surfaces once, rather than raycasting their entire high-detail mesh five
// times per moving actor. A weak owner releases the index with its location.
const floorIndices138=new WeakMap();
function floorIndex138(o){
 const g=o.geometry,p=g.attributes.position,version=p.version??0,prior=floorIndices138.get(o);
 if(prior&&prior.g===g&&prior.version===version&&prior.matrix.equals(o.matrixWorld))return prior;
 if(o.isInstancedMesh||o.isSkinnedMesh)return null;
 const q={g,version,matrix:o.matrixWorld.clone(),grid:new Map(),cell:4,triangles:0},a=V3(),b=V3(),c=V3(),idx=g.index,count=idx?.count??p.count,start=g.drawRange.start,end=Math.min(count,start+g.drawRange.count);
 for(let i=start;i+2<end;i+=3){
  a.fromBufferAttribute(p,idx?idx.getX(i):i).applyMatrix4(o.matrixWorld);b.fromBufferAttribute(p,idx?idx.getX(i+1):i+1).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(p,idx?idx.getX(i+2):i+2).applyMatrix4(o.matrixWorld);
  const det=(b.x-a.x)*(c.z-a.z)-(c.x-a.x)*(b.z-a.z);if(Math.abs(det)<1e-10)continue;
  const group=g.groups.find(v=>i>=v.start&&i<v.start+v.count),m=Array.isArray(o.material)?o.material[group?.materialIndex??0]:o.material;
  if(m?.side===THREE.FrontSide&&det>0||m?.side===THREE.BackSide&&det<0)continue;
  const t=[a.x,a.y,a.z,b.x-a.x,b.y-a.y,b.z-a.z,c.x-a.x,c.y-a.y,c.z-a.z,1/det];q.triangles++;
  for(let x=Math.floor(Math.min(a.x,b.x,c.x)/4);x<=Math.floor(Math.max(a.x,b.x,c.x)/4);x++)for(let z=Math.floor(Math.min(a.z,b.z,c.z)/4);z<=Math.floor(Math.max(a.z,b.z,c.z)/4);z++){const k=x+','+z;if(!q.grid.has(k))q.grid.set(k,[]);q.grid.get(k).push(t);}
 }
 floorIndices138.set(o,q);return q;
}
function floorHeight138(floors,x,z,analytic){
 let height=-Infinity;
 for(const o of floors){const q=floorIndex138(o);if(!q){contactFloor133.ray.set(V3(x,analytic+2,z),contactFloor133.down);contactFloor133.ray.far=4;for(const hit of contactFloor133.ray.intersectObject(o,false))if(Math.abs(hit.point.y-analytic)<1.4)height=Math.max(height,hit.point.y);continue;}
  for(const t of q.grid.get(Math.floor(x/4)+','+Math.floor(z/4))??[]){const dx=x-t[0],dz=z-t[2],u=(dx*t[8]-t[6]*dz)*t[9],v=(t[3]*dz-dx*t[5])*t[9];if(u< -1e-8||v< -1e-8||u+v>1+1e-8)continue;const y=t[1]+u*t[4]+v*t[7];if(Math.abs(y-analytic)<1.4)height=Math.max(height,y);}
 }
 return height===-Infinity?analytic:height;
}
contactSeat133=function(a,size){
 const q=contactFloor133,p=a.mesh.position;
 if(q.world!==world){q.world=world;q.sample=terrainSampler64().sample;q.surfaces=[...new Set([...(world.userData.walkSurfaces??[]),...(world.userData.routeSupports32?.group.children??[])])].filter(o=>o.isMesh).map(o=>{o.updateMatrixWorld(true);return{o,box:new THREE.Box3().setFromObject(o)};});}
 const old=a.contactSeat133;if(old?.world===world&&Math.hypot(old.x-p.x,old.z-p.z)<.10&&Math.abs(old.size-size)<.001)return old;
 const floors=q.surfaces.filter(v=>p.x>=v.box.min.x-size&&p.x<=v.box.max.x+size&&p.z>=v.box.min.z-size&&p.z<=v.box.max.z+size).map(v=>v.o),sample=(x,z)=>floorHeight138(floors,x,z,q.sample(x,z)),r=size*.28,y=sample(p.x,p.z),sx=(sample(p.x+r,p.z)-sample(p.x-r,p.z))/(2*r),sz=(sample(p.x,p.z+r)-sample(p.x,p.z-r))/(2*r);
 return a.contactSeat133={world,x:p.x,z:p.z,size,y:y+.045,sx:clamp(sx,-.9,.9),sz:clamp(sz,-.9,.9)};
};

// Keep sharp, live mirrors without re-drawing every river level on every
// simulation step. Camera motion invalidates immediately; idle ripples and
// actors refresh at a bounded cadence. Reflection matrices are retained with
// their exact image, and scene/light changes always force a fresh capture.
const mirrors138={world:null,at:-Infinity,camera:V3(),rotation:new THREE.Quaternion(),resizes:-1,phase:null,frames:0,reuses:0};
const reflectionBefore138=updateReflection;
updateReflection=function(...args){
 const q=mirrors138,now=performance.now(),phone=touchDevice33(),period=phone?66:40,phase=activeScene?.key==='brookstead'?damState108().phase.value:null;
 const fresh=q.world===world&&q.resizes===device33.resizes&&q.phase===phase&&q.camera.distanceToSquared(camera.position)<.5625&&Math.abs(q.rotation.dot(camera.quaternion))>.99996;
 if(!gameLoading&&!loading36.active&&!encounter53.active&&fresh&&now-q.at<period){q.reuses++;return;}
 const before=mirrors111.frames,result=reflectionBefore138(...args);
 if(mirrors111.frames!==before){Object.assign(q,{world,at:now,resizes:device33.resizes,phase});q.camera.copy(camera.position);q.rotation.copy(camera.quaternion);q.frames++;}
 return result;
};

const shadowFitBefore138=fitVisibleShadows,shadowBudget138={world:null,at:-Infinity,camera:V3(),resize:-1,frames:0,reuses:0};
fitVisibleShadows=function(...args){
 if(!world||encounter53.active||!['poi','overworld'].includes(activeScene?.kind))return shadowFitBefore138(...args);
 const q=shadowBudget138,period=touchDevice33()?1/24:1/40,forced=gameLoading||loading36.active||q.world!==world||q.resize!==device33.resizes||!sun.shadow.map||shadow36.last< -10||q.camera.distanceToSquared(camera.position)>1;
 if(!forced&&clock-q.at<period){shadow36.due=false;shadow36.skips++;q.reuses++;return;}
 // The old live-water wrapper forced a new shadow render on every call.
 // Keep its sharp penumbra but enter the fitted-shadow owner directly.
 shadow36.last=-100;const result=shadowFitBefore111(...args);sun.shadow.radius=.35;
 renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;
 Object.assign(q,{world,at:clock,resize:device33.resizes});q.camera.copy(camera.position);q.frames++;return result;
};

// Save loading keeps its synchronous acceptance result, while the existing
// covered handoff waits for continent data before rebuilding an overworld save.
const saveLoadBefore138=loadSlot;let saveDataTask138=null;
loadSlot=function(slot='auto',...args){
 if(BAKED_WORLD36.vegetation64||devConsole60.active)return saveLoadBefore138(slot,...args);
 if(saveDataTask138||gameLoading||loading36.pendingSave||!readSave(slot))return false;
 setJourneyLoading(true);
 const task=(async()=>{try{await ensureWorldData136(true);setJourneyLoading(false);const accepted=saveLoadBefore138(slot,...args),ready=window.journeyGraphicsReady;if(ready&&ready!==task)await ready;return accepted;}catch(error){setJourneyLoading(false);$('#fatal-text').textContent=error.message;$('#fatal').classList.remove('hidden');return false;}finally{saveDataTask138=null;}})();
 saveDataTask138=task;window.journeyGraphicsReady=task;return true;
};

const worldBefore138=buildWorld;
buildWorld=function(...args){
 const result=worldBefore138(...args);
 if(mirrors138.world!==world)mirrors138.world=null;
 if(shadowBudget138.world!==world)shadowBudget138.world=null;
 return result;
};
