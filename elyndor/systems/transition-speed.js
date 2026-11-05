// Late water/foliage passes sample the finished terrain triangles instead of
// repeating the complete procedural height stack hundreds of thousands of
// times. This is the same surface the player sees, including final grading.
function terrainSampler64(){
 if(world.userData.terrainSampler64)return world.userData.terrainSampler64;
 const cells=new Map(),cell=4,a=V3(),b=V3(),c=V3();world.updateMatrixWorld(true);
 for(const m of world.userData.terrainChunks??[]){
  const g=m.userData.fullGeometry??m.geometry,p=g.attributes.position,index=g.index,n=index?.count??p.count;
  for(let i=0;i<n;i+=3){
   a.fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(m.matrixWorld);b.fromBufferAttribute(p,index?index.getX(i+1):i+1).applyMatrix4(m.matrixWorld);c.fromBufferAttribute(p,index?index.getX(i+2):i+2).applyMatrix4(m.matrixWorld);
   const ux=b.x-a.x,uz=b.z-a.z,vx=c.x-a.x,vz=c.z-a.z,det=ux*vz-uz*vx;if(Math.abs(det)<1e-9)continue;
   const t={x:a.x,z:a.z,y:a.y,ux,uz,vx,vz,uy:b.y-a.y,vy:c.y-a.y,inv:1/det};
   for(let z=Math.floor(Math.min(a.z,b.z,c.z)/cell);z<=Math.floor(Math.max(a.z,b.z,c.z)/cell);z++)for(let x=Math.floor(Math.min(a.x,b.x,c.x)/cell);x<=Math.floor(Math.max(a.x,b.x,c.x)/cell);x++){
    const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(t);
   }
  }
 }
 const fallback=groundAt;
 const sample=(x,z)=>{for(const t of cells.get(Math.floor(x/cell)+','+Math.floor(z/cell))??[]){const dx=x-t.x,dz=z-t.z,u=(dx*t.vz-dz*t.vx)*t.inv,v=(t.ux*dz-t.uz*dx)*t.inv;if(u>=-1e-7&&v>=-1e-7&&u+v<=1+1e-7)return t.y+u*t.uy+v*t.vy;}return fallback(x,z);};
 return world.userData.terrainSampler64={sample,cells:cells.size};
}
function withTerrainSampler64(fn,args){
 if(activeScene?.kind!=='poi')return fn(...args);
 const sample=terrainSampler64().sample,before=groundAt;groundAt=sample;
 try{return fn(...args);}finally{groundAt=before;}
}
const trimBefore64=trimCliffCover62;
trimCliffCover62=function(...args){return withTerrainSampler64(trimBefore64,args);};
const fieldBefore64=waterField62;
waterField62=function(...args){return withTerrainSampler64(fieldBefore64,args);};

// Construction asks thousands of identical navigation-grid questions for
// different residents and quest props. Cache only within a read-only phase;
// collider/road mutations invalidate the answers immediately.
let buildQueries64=null;
const constructionRoutes64={record:{},hits:0,misses:0};
function clearBuildQueries64(){if(buildQueries64){buildQueries64.free.clear();buildQueries64.stamp=null;}}
function hashConstruction64(text){let hash=2166136261;for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);return String(hash>>>0);}
function constructionStamp64(){
 const text=colliders.map(c=>[c.type,c.x,c.z,c.w,c.d,c.top,c.bottom,c.requestBoard32].join(',')).join(';')+'|'+!!state.flags.prologue_complete+(activeScene.key==='brookstead'?'|'+state.flags.gate_open+'|'+brookHydraulics.head.value:'');
 return hashConstruction64(text);
}
const constructionRouteBefore64=findRoute;
findRoute=function(from,to,avoid=[],...args){
 if(!buildQueries64||avoid.length)return constructionRouteBefore64(from,to,avoid,...args);
 const key=activeScene.key+'/'+buildQueries64.phase+'/'+from.x+','+from.z+'>'+to.x+','+to.z,stamp=buildQueries64.stamp??=constructionStamp64();
 const records=BAKED_WORLD36.routes64?.[key]??[],cached=records.find(r=>r.stamp===stamp)??records.find(r=>r.path);
 if(!window.__captureRoutes64&&cached){
  if(cached.stamp===stamp){constructionRoutes64.hits++;return cached.path?cached.path.map(p=>({...p})):null;}
  if(!cached.path&&cached.stamp===stamp){constructionRoutes64.hits++;return null;}
  if(cached.path){let previous=from,valid=true;for(const p of cached.path){if(!edgeFree(previous,p,.5)){valid=false;break;}previous=p;}if(valid){constructionRoutes64.hits++;return cached.path.map(p=>({...p}));}}
 }
 const result=constructionRouteBefore64(from,to,avoid,...args);constructionRoutes64.misses++;
 if(window.__captureRoutes64){const rows=constructionRoutes64.record[key]??=[];if(!rows.some(r=>r.stamp===stamp))rows.push({stamp,path:result?result.map(p=>({x:p.x,z:p.z})):null});}
 return result;
};
function withBuildQueries64(fn,args,phase){
 if(buildQueries64)return fn(...args);
 const before=staticFree;buildQueries64={free:new Map(),stamp:null,phase};
 const memo=(map,fn)=>(...a)=>{const key=a.join(',');if(map.has(key))return map.get(key);const value=fn(...a);map.set(key,value);return value;};
 staticFree=memo(buildQueries64.free,staticFree);
 try{return fn(...args);}finally{staticFree=before;buildQueries64=null;}
}

// Contours are pure functions of the authored boundary shapes. A matching
// shape hash reuses their exact points; changed layouts regenerate normally.
const contourRecords64={},contourBefore64=boundaryContour46;
boundaryContour46=function(field){
 const key=(field.overworld?'world':activeScene.key)+'/'+hashConstruction64(JSON.stringify([field.bounds,field.shapes.map(s=>[s.a,s.b,s.r])]));
 const cached=BAKED_WORLD36.contours64?.[key];if(cached&&!window.__captureRoutes64&&!window.__forceWorldBake36)return cached;
 const result=contourBefore64(field);if(window.__captureRoutes64||window.__forceWorldBake36)contourRecords64[key]=result;return result;
};
const planBefore64=makeLevelPlan42,requestsBefore64=buildLocalRequests16;
makeLevelPlan42=function(...args){return withBuildQueries64(planBefore64,args,'approaches');};
buildLocalRequests16=function(...args){return withBuildQueries64(requestsBefore64,args,'requests');};
for(const name of['clearRouteCover42','paintRoutes42','rebuildColliderGrid','settleRouteParty42','obstacle']){
 const before=window[name];window[name]=function(...args){clearBuildQueries64();return before.apply(this,args);};
}

// Native vegetation matrices and raw tree inputs are baked from the original
// generator. Replaying them avoids 468,000 random geography queries per trip,
// while retaining every tree/plant position, species and native 3D mesh.
const macroNatureBefore64=buildMacroNature15,vegetationCPU64=new Map();
function vegetationArray64(spec,double=false){
 if(vegetationCPU64.has(spec.data))return vegetationCPU64.get(spec.data);
 const raw=atob(spec.data),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 const result=double?new Float64Array(bytes.buffer):new Float32Array(bytes.buffer);vegetationCPU64.set(spec.data,result);return result;
}
buildMacroNature15=function(...args){
 if(loading36.mapPreparation)return macroNatureBefore64(...args);
 const baked=BAKED_WORLD36.vegetation64;
 if(!baked||window.__forceWorldBake36){
  if(!window.__captureVegetation64)return macroNatureBefore64(...args);
  const offsets=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,v])=>[k,v.length])),trees=[],before=buildSolidTree;
  buildSolidTree=function(x,z,scale,type,...rest){const t=before(x,z,scale,type,...rest);if(t)trees.push(x,z,scale,type==='pine'?1:0);return t;};
  try{const result=macroNatureBefore64(...args);world.userData.vegetationRecord64={trees:new Float64Array(trees),plants:Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,v])=>[k,new Float32Array(v.slice(offsets[k]??0).flatMap(m=>m.elements))]))};return result;}finally{buildSolidTree=before;}
 }
 geologicalDressing16(world);
 const trees=vegetationArray64(baked.trees,true);for(let i=0;i<trees.length;i+=4)buildSolidTree(trees[i],trees[i+1],trees[i+2],trees[i+3]?'pine':'oak',()=>.5);
 for(const[k,spec]of Object.entries(baked.plants)){const rows=vegetationArray64(spec),stride=spec.stride??16;for(let i=0;i<rows.length;i+=stride){const m=new THREE.Matrix4();if(stride===6){const e=m.elements;e[0]=e[10]=rows[i];e[2]=rows[i+1];e[8]=-rows[i+1];e[5]=rows[i+2];e[12]=rows[i+3];e[13]=rows[i+4];e[14]=rows[i+5];}else m.fromArray(rows,i);world.userData.plantMatrices[k].push(m);}}
 buildPlants();batchLandscape();world.userData.geographyVersion=17;buildBoundary46();
};

// Keep only program objects, never outgoing scene/material/actor closures.
// A bounded renderer-wide shader cache survives scene-owned resource disposal.
pinPrograms36=function(){for(const program of renderer.info.programs??[]){if(sceneProgramKeepers.has(program))continue;if(sceneProgramKeepers.size>=384)break;if(typeof program.usedTimes==='number'){program.usedTimes++;sceneProgramKeepers.set(program,true);}}};
const disposeSpeedBefore64=disposeContinuousWorld;
disposeContinuousWorld=function(...args){if(renderer)pinPrograms36();return disposeSpeedBefore64(...args);};
const transitionGraphics64={ready:false,runs:0,lastMs:0};
const graphicsBefore64=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){
 if(!transitionGraphics64.ready||loading36.booting){const result=await graphicsBefore64(...args);transitionGraphics64.ready=true;return result;}
 const start=performance.now();if(!loading36.active)beginLoad36();setLoadStage36(.4,'Preparing the destination…');
 await prepareSounds36();updateWorldWeather15(true);ensureCombatPointer15();initPixelRelease();
 updateCamera(1,true);updateLighting();updateRenderBudget(true);
 // Compile only the destination, not obsolete in-world battle arenas and
 // repeated distant/side-on views. Battles now own their separate 3D stages.
 // All shader families were prepared at boot. The covered destination frame
 // compiles/uploads its visible batches; traversing every distant batch again
 // adds delay without preparing anything needed by this handoff.
 settleArrival28();pinPrograms36();loading36.readyWorld=world;setLoadStage36(.99,'Ready');await yieldLoad36();finishLoad36();
 transitionGraphics64.lastMs=performance.now()-start;transitionGraphics64.runs++;
};
const releaseScratchBefore64=buildWorld;
buildWorld=function(...args){const result=releaseScratchBefore64(...args);delete world.userData.terrainSampler64;return result;};
