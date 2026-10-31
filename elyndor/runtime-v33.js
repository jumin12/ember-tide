// A display change never changes the art direction or simulation rate.
// Resolution, geometric detail and shadow cadence have independent budgets.
const device33={tier:2,scale:1,cost:0,cpu:0,interval:16.67,frame:0,last:0,slow:0,fast:0,resizes:0,allocations:0,resizeAt:0,key:'',profile:'',samples:[],forceTier:null};
// Terrain already samples on a quarter-metre grid. Cache live road lookups on
// a finer 1/16m grid; construction and authored surfaces remain exact.
const roadsBefore33=roadInfo,roadCache33={world:null,cells:new Map(),hits:0,misses:0};
roadInfo=function(x,z){if(perf.building||sceneBuildFilter)return roadsBefore33(x,z);if(roadCache33.world!==world){roadCache33.world=world;roadCache33.cells.clear();}const ix=Math.round(x*16),iz=Math.round(z*16),key=ix+','+iz;if(roadCache33.cells.has(key)){roadCache33.hits++;return roadCache33.cells.get(key);}const r=roadsBefore33(ix/16,iz/16);if(roadCache33.cells.size>=12000)roadCache33.cells.delete(roadCache33.cells.keys().next().value);roadCache33.cells.set(key,r);roadCache33.misses++;return r;};
// Upload the current native frame, not an entire multi-megapixel atlas for
// every actor. Each character owns its canvas, with no scaling or recropping.
actorTexture=function(id){const meta=assets.sprites[id],canvas=document.createElement('canvas');canvas.width=meta.w;canvas.height=meta.h;const context=canvas.getContext('2d',{alpha:true});context.imageSmoothingEnabled=false;const first=meta.frames.south[0];context.drawImage(spriteImages[id],first%meta.cols*meta.w,Math.floor(first/meta.cols)*meta.h,meta.w,meta.h,0,0,meta.w,meta.h);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.userData.frame33={canvas,context,id,cell:first};return t;};
const frameBefore33=setActorFrame;
setActorFrame=function(a,...args){frameBefore33(a,...args);const t=a.mesh.material.map,q=t.userData.frame33;if(!q)return;const id=a.visualId??a.id,meta=assets.sprites[id],cell=a.frame.cell;if(q.cell!==cell||q.id!==id){q.context.clearRect(0,0,meta.w,meta.h);q.context.drawImage(spriteImages[id],cell%meta.cols*meta.w,Math.floor(cell/meta.cols)*meta.h,meta.w,meta.h,0,0,meta.w,meta.h);q.cell=cell;q.id=id;t.needsUpdate=true;}t.repeat.set(1,1);t.offset.set(0,0);};
function tier33(){return device33.forceTier??device33.tier;}
function touchDevice33(){return matchMedia('(pointer:coarse)').matches;}
function profile33(){const q=state.settings.quality;return softwareBudget()?0:q==='low'?0:q==='high'?3:tier33();}
const loadSettingsBefore33=loadSettings;
loadSettings=function(){loadSettingsBefore33();device33.tier=softwareBudget()?0:touchDevice33()?1:2;device33.scale=softwareBudget()?.7:1;};
applyCapabilityBudget=function(){
 if(!renderer||!sun)return;const t=profile33(),size=[768,1024,1536,2048][t],key=t+'|'+world?.uuid;
 if(device33.profile===key&&sun.shadow.mapSize.x===size)return;device33.profile=key;
 if(sun.shadow.mapSize.x!==size){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(size,size);renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;device33.allocations++;}
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const width=[384,512,768,1024][t];if(reflectionTarget.width!==width){reflectionTarget.setSize(width,Math.round(width*9/16));device33.allocations++;}
 const samples=Math.min(t<2?2:4,renderer.capabilities.maxSamples);if(post.target.samples!==samples){post.target.dispose();post.target.samples=samples;device33.allocations++;}
 // Keep the light count constant. Zero-intensity slots remain in the shader.
 for(const l of world?.userData.lanterns??[])l.visible=true;
 installPhysicalTreeShadows();
};
resize=function(){
 if(!renderer||!post.target)return;scenery.pausedTab=null;const t=profile33(),pixels=[650000,1050000,2400000,4200000][t],w=Math.max(1,innerWidth),h=Math.max(1,innerHeight);
 const ratio=Math.min(devicePixelRatio||1,t===3?1.75:1.5,Math.sqrt(pixels/(w*h)))*device33.scale;
 const rw=Math.max(160,Math.round(w*ratio)),rh=Math.max(160,Math.round(h*ratio)),key=rw+'|'+rh;
 if(device33.key!==key){device33.key=key;renderer.setPixelRatio(1);renderer.setSize(rw,rh,false);post.target.setSize(rw,rh);post.material.uniforms.resolution.value.set(rw,rh);device33.resizes++;}if(post.material.uniforms.pixelRatio33)post.material.uniforms.pixelRatio33.value=rw/w;
 camera.aspect=w/h;camera.updateProjectionMatrix();applyCapabilityBudget();
 if(typeof layoutMobile33==='function')layoutMobile33();
};
// The registered resize listener calls this final binding. Coalesce resize
// storms from browser chrome, orientation changes and desktop window drags.
const resizeNow33=resize;
resize=function(){if(!renderer)return;if(!device33.key||gameLoading||state.mode==='title'){resizeNow33();return;}device33.resizeAt=performance.now()+110;};
const budgetBefore33=updateRenderBudget;
const frustum33=new THREE.Frustum(),matrix33=new THREE.Matrix4();let budgetAt33=-1,budgetWorld33=null;
const mirror33=new THREE.PerspectiveCamera(),mirrorFrustum33=new THREE.Frustum(),shadowSphere33=new THREE.Sphere();
const buildGroupsBefore33=buildWorld;
buildWorld=function(...args){const r=buildGroupsBefore33(...args);if(activeScene.kind==='poi'){
 const groups=new Map();for(const m of[...perf.plants,...scenery.forestMeshes]){if(m.parent!==world||!m.userData.center)continue;const c=m.userData.center,key=Math.floor(c.x/40)+','+Math.floor(c.z/40);let g=groups.get(key);if(!g){g=new THREE.Group();g.userData.vegetationBucket21=true;world.add(g);groups.set(key,g);}g.add(m);}
 for(const g of groups.values()){const b=new THREE.Sphere();b.makeEmpty();for(const m of g.children){if(!m.boundingSphere)m.computeBoundingSphere();b.union(m.boundingSphere);}b.radius+=12;g.userData.bounds21=b;g.updateMatrixWorld(true);g.matrixAutoUpdate=false;}
 world.userData.vegetationBuckets21=[...groups.values()];
}return r;};
updateRenderBudget=function(force=false){
 if(!world||!player||(!force&&world===budgetWorld33&&clock-budgetAt33<.12))return;const r=budgetBefore33(force);budgetAt33=clock;budgetWorld33=world;
 camera.updateMatrixWorld();frustum33.setFromProjectionMatrix(matrix33.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 const t=profile33(),p=restoration?cameraTarget:player;
 for(const im of perf.plants){
  const c=im.userData.center,d=Math.hypot(c.x-p.x,c.z-p.z),far=activeScene.kind==='overworld'?230:185;
  im.visible=d<far+35;im.count=im.userData.total??im.count;
  if(im.userData.detailedGeometry){im.geometry=d<[18,23,34,42][t]?im.userData.detailedGeometry:im.userData.distantGeometry;im.material.uniformsForDistance?.range.value.set(far-35,far);}
  im.castShadow=t>0&&d<(im.userData.plantKey==='grassBlades'?(t>1?32:20):t>1?65:38);
 }
 for(const m of scenery.forestMeshes){const d=Math.hypot(m.userData.center.x-p.x,m.userData.center.z-p.z),lod=m.userData.nativeLods30;
  if(lod)m.geometry=lod[d<[35,46,65,85][t]?(t===0?1:0):d<145?1:2];m.visible=d<350;m.castShadow=d<(t<2?85:145);
 }
 // Reject complete offscreen branches before Three visits their leaf meshes.
 // Include the reflected view and the projected footprint of tall casters.
 const reflects=(world.userData.waterPools??[]).some(p=>p.visible&&p.userData.poolPatches?.some(b=>frustum33.intersectsBox(b)))||water?.visible&&(world.userData.waterPatches??[]).some(b=>frustum33.intersectsBox(b));
 if(reflects){mirror33.copy(camera);const y=water?.position.y??0;mirror33.position.y=2*y-camera.position.y;mirror33.up.set(0,-1,0);mirror33.lookAt(V3(cameraTarget.x,2*y-cameraTarget.y,cameraTarget.z));mirror33.updateMatrixWorld();mirrorFrustum33.setFromProjectionMatrix(matrix33.multiplyMatrices(mirror33.projectionMatrix,mirror33.matrixWorldInverse));}
 for(const g of world.userData.vegetationBuckets21??[]){const b=g.userData.bounds21;shadowSphere33.copy(b);const reach=clamp((b.center.y-heightAt(p.x,p.z)+b.radius)/Math.max(.15,weather.sun.value.y),0,85);shadowSphere33.center.addScaledVector(weather.sun.value,-reach);shadowSphere33.radius+=18;g.visible=frustum33.intersectsSphere(b)||reflects&&mirrorFrustum33.intersectsSphere(b)||frustum33.intersectsSphere(shadowSphere33);}
 return r;
};
// The outer forest cutaway used to visit every tree, despite the spatial grid
// already maintained for it. Retain hidden trees until their fade completes.
const cutsBefore33=updateCutaways;
updateCutaways=function(...args){
 const all=scenery.trees,q=world?.userData.clarity23;if(!q||!player)return cutsBefore33(...args);
 const key=Math.floor(player.x/16)+','+Math.floor(player.z/16);if(q.nearKey33!==key){q.nearKey33=key;const next=new Set(all.filter(t=>t.hidden));for(let x=Math.floor((player.x-75)/32);x<=Math.floor((player.x+75)/32);x++)for(let z=Math.floor((player.z-75)/32);z<=Math.floor((player.z+75)/32);z++)for(const t of q.treeGrid.get(x+','+z)??[])next.add(t);q.near33=[...next];}
 scenery.trees=q.near33;try{return cutsBefore33(...args);}finally{scenery.trees=all;}
};
const renderBefore33=render;
render=function(...args){
 if(!renderer)return;const lights=world?.userData.lanterns??[],t=profile33();
 // Legacy software rendering hides effect slots 4/5; do not use that path.
 // All six slots are fixed and prewarmed on every supported graphics tier.
 for(const l of lights)l.visible=true;
 const r=renderBefore33(...args);for(const l of lights)l.visible=true;return r;
};
loop=function(now){
 requestAnimationFrame(loop);if(document.hidden){lastFrame=0;device33.last=0;keys.clear();return;}
 if(device33.resizeAt&&now>=device33.resizeAt){device33.resizeAt=0;resizeNow33();}
 const gap=device33.last?now-device33.last:16.67;device33.last=now;
 if(gap>3&&gap<24&&device33.samples.length<90){device33.samples.push(gap);if(device33.samples.length===90){const a=device33.samples.slice().sort((a,b)=>a-b);device33.interval=a[Math.floor(a.length*.2)];}}
 const divisor=Math.max(1,Math.floor(1000/device33.interval/59));if(++device33.frame%divisor)return;
 if(!lastFrame)lastFrame=now;const elapsed=Math.min((now-lastFrame)/1000,.12);lastFrame=now;
 if(menu){if(scenery.pausedTab!==menu.tab){render();scenery.pausedTab=menu.tab;}return;}scenery.pausedTab=null;
 const live=performance.now()>manualUntil,start=performance.now();if(live)for(let remaining=elapsed;remaining>.00001;remaining-=1/30)tick(Math.min(remaining,1/30));render();
 const cost=performance.now()-start;device33.cpu=mix(device33.cpu,cost,.06);const gpu=clarity23.gpuSamples?clarity23.gpuMs:0,missed=elapsed*1000>device33.interval*divisor*1.35?elapsed*1000/divisor:0;device33.cost=Math.max(device33.cpu,gpu,missed);
 runtime28.frames++;runtime28.cost=device33.cpu;if(typeof updateMobile33==='function')updateMobile33();
 if(!live||gameLoading||state.mode==='title'||state.settings.quality==='high')return;
 const budget=Math.min(16.1,device33.interval*divisor*.90);device33.slow=device33.cost>budget?device33.slow+elapsed:Math.max(0,device33.slow-elapsed);device33.fast=device33.cost<budget*.60?device33.fast+elapsed:0;
 if(device33.slow>2.2){if(device33.tier>0){device33.tier--;device33.profile='';applyCapabilityBudget();updateRenderBudget(true);}else if(device33.scale>.6)device33.scale=Math.max(.6,device33.scale-.08);device33.slow=device33.fast=0;resizeNow33();}
 else if(device33.fast>24&&device33.scale<1){device33.scale=Math.min(1,device33.scale+.04);device33.fast=0;resizeNow33();}
 else if(device33.fast>36&&device33.tier<(touchDevice33()?1:2)){device33.tier++;device33.profile='';device33.fast=0;resizeNow33();updateRenderBudget(true);}
};
const disposeBefore33=disposeContinuousWorld;
disposeContinuousWorld=function(...args){
 treeCutCache30=null;occlusionCache=null;budgetWorld33=null;device33.samples.length=0;roadCache33.world=null;roadCache33.cells.clear();
 const r=disposeBefore33(...args);return r;
};
const warmBefore33=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){const r=await warmBefore33(...args);resizeNow33();updateRenderBudget(true);return r;};
