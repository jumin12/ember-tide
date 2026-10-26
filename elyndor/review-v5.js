// Immediate physical reflections, continuously moving shadow coverage, and a
// single connected river surface. This supersedes the earlier cached pass.
const liveSurfaceStats={reflections:0,shadowFrames:0,physicalTreeShadows:0};
// Preserve authored close-up pixels while filtering grazing roof/ground views.
// Reuse the existing mip chains and texture array; no extra scene draw passes.
const loadBeforeRefinedMaterials=loadAssets;
loadAssets=async function(){
 await loadBeforeRefinedMaterials();
 const anisotropy=Math.min(scenery.software?2:8,renderer.capabilities.getMaxAnisotropy());
 for(const key of terrainTileNames){
  const texture=textures[key];if(!texture)continue;
  texture.magFilter=THREE.NearestFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.anisotropy=anisotropy;texture.needsUpdate=true;
 }
 scenery.surfaceArray.anisotropy=anisotropy;scenery.surfaceArray.needsUpdate=true;
};
const liveWaterFrustum=new THREE.Frustum(),liveWaterMatrix=new THREE.Matrix4();
const budgetBeforeLiveSurfaces=applyCapabilityBudget;
applyCapabilityBudget=function(){budgetBeforeLiveSurfaces();const limited=softwareBudget(),high=state.settings.quality==='high';const size=limited?512:high?3072:2048;
 if(sun.shadow.mapSize.x!==size){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(size,size);}
 if(!limited)renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 sun.shadow.radius=2;sun.shadow.normalBias=.025;sun.shadow.bias=-.00018;
 const w=limited?320:high?1280:state.settings.quality==='low'?640:960;reflectionTarget.setSize(w,Math.round(w*9/16));
 installPhysicalTreeShadows();
};
function installPhysicalTreeShadows(){
 if(renderer.shadowMap.physicalTreeCutaways)return;
 const original=renderer.shadowMap.render;
 renderer.shadowMap.render=function(...args){
  if(args[2]!==camera||!this.needsUpdate&&!sun.shadow.needsUpdate)return original.apply(this,args);
  if((scenery.trees??[]).some(t=>t.hidden))liveSurfaceStats.physicalTreeShadows++;
  return original.apply(this,args);
 };
 renderer.shadowMap.physicalTreeCutaways=true;
}
// Keep physical instance transforms unchanged. Changing an instance matrix
// between depth and colour draws can be swallowed by the renderer's per-frame
// upload cache. A colour-only instance mask preserves real canopy shadows.
const prepareBeforeTreeMasks=prepareBudgetedWorld;
prepareBudgetedWorld=function(){prepareBeforeTreeMasks();
 for(const m of scenery.forestMeshes){
  const mask=m.userData.treeViewMask??new THREE.InstancedBufferAttribute(new Float32Array(m.count),1);m.userData.treeViewMask=mask;
  for(const g of new Set([m.geometry,m.userData.fullGeometry,m.userData.farGeometry,m.userData.simpleGeometry].filter(Boolean)))g.setAttribute('treeViewHidden',mask);
  const material=m.material,compile=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
  if(!material.userData.treeViewCompiled){
  material.onBeforeCompile=function(sh,...args){compile.call(this,sh,...args);sh.vertexShader='attribute float treeViewHidden;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','transformed*=1.-treeViewHidden;\n#include <project_vertex>');};
  material.customProgramCacheKey=()=>key()+'-view-mask-v5';material.needsUpdate=true;material.userData.treeViewCompiled=true;}
  m.onBeforeShadow=()=>{};m.onAfterShadow=()=>{};
 }
 for(const t of scenery.trees)for(const q of t.bindings)if(q.mesh.userData.treeViewMask){q.mesh.setMatrixAt(q.index,q.matrix);q.mesh.instanceMatrix.needsUpdate=true;q.mesh.userData.treeViewMask.setX(q.index,t.hidden?1:0);q.mesh.userData.treeViewMask.needsUpdate=true;}
};
hideTree=function(t,hidden){if(t.hidden===hidden)return;t.hidden=hidden;for(const q of t.bindings){
 const mask=q.mesh.userData.treeViewMask;
 if(mask){mask.setX(q.index,hidden?1:0);mask.needsUpdate=true;}
 else{q.mesh.setMatrixAt(q.index,hidden?new THREE.Matrix4().makeScale(0,0,0):q.matrix);q.mesh.instanceMatrix.needsUpdate=true;}
}};
updateReflection=function(){if(!water?.visible||!player)return;const near=channelDistance(player.x,player.z)<90||restoration;if(!near)return;
 // Skip a second scene pass only when the water is outside the camera view.
 // The first visible frame always receives a fresh reflection.
 camera.updateMatrixWorld();liveWaterMatrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);liveWaterFrustum.setFromProjectionMatrix(liveWaterMatrix);
 if(world.userData.waterPatches?.length&&!world.userData.waterPatches.some(b=>liveWaterFrustum.intersectsBox(b)))return;
 const pending=renderer.shadowMap.needsUpdate,lightPending=sun.shadow.needsUpdate;renderer.shadowMap.needsUpdate=false;sun.shadow.needsUpdate=false;
 const hidden=scenery.trees.filter(t=>t.hidden);for(const t of hidden)hideTree(t,false);
 try{physicalReflection();liveSurfaceStats.reflections++;perf.lastReflection=clock;}finally{for(const t of hidden)hideTree(t,true);renderer.shadowMap.needsUpdate=pending;sun.shadow.needsUpdate=lightPending;}
};
const renderBeforeLiveSurfaces=render;
render=function(){if(!renderer)return;renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;liveSurfaceStats.shadowFrames++;renderBeforeLiveSurfaces();};

const actorBeforeSoftShadow=createActor;
createActor=function(...args){const a=actorBeforeSoftShadow(...args);if(!a)return a;const m=a.shadow.material,u=m.uniforms;
 u.sunDirection={value:sceneryLight.direction.value.clone()};u.opacity={value:sceneryLight.shadowStrength.value};u.texel={value:new THREE.Vector2(1/a.mesh.material.map.image.width,1/a.mesh.material.map.image.height)};
 m.clipping=true;m.vertexShader='#include <clipping_planes_pars_vertex>\n'+m.vertexShader.replace('gl_Position=projectionMatrix*viewMatrix*w;','vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <clipping_planes_vertex>\n');
 m.fragmentShader='#include <clipping_planes_pars_fragment>\nuniform sampler2D map;uniform float opacity;uniform vec2 repeat,offset,texel;varying vec2 v;float silhouette(vec2 q){return texture2D(map,clamp(q,offset+texel*.5,offset+repeat-texel*.5)).a;}void main(){\n#include <clipping_planes_fragment>\nvec2 d=texel*1.25;float alpha=silhouette(v)*.4;alpha+=(silhouette(v+vec2(d.x,0.))+silhouette(v-vec2(d.x,0.))+silhouette(v+vec2(0.,d.y))+silhouette(v-vec2(0.,d.y)))*.1;alpha+=(silhouette(v+d)+silhouette(v-d)+silhouette(v+vec2(d.x,-d.y))+silhouette(v+vec2(-d.x,d.y)))*.05;gl_FragColor=vec4(.055,.07,.085,alpha*opacity);}';m.needsUpdate=true;return a;
};
const actorBeforeLocalShadow=updateActor;
updateActor=function(a,dt){actorBeforeLocalShadow(a,dt);if(!a.shadow.material.uniforms?.texel)return;const u=a.shadow.material.uniforms,tex=a.mesh.material.map;
 u.texel.value.set(1/tex.image.width,1/tex.image.height);let direction=sceneryLight.direction.value.clone(),lampWeight=0;
 // Blend local torch influence continuously instead of abruptly switching a
 // nearest-light identity at a threshold. Daylight remains dominant outdoors.
 const day=Math.max(0,Math.sin((state.worldMinutes/60%24-6)/12*Math.PI));
 for(const l of world.userData.lanterns??[]){const d=Math.hypot(l.position.x-a.x,l.position.z-a.z),w=Math.max(0,1-d/8)*Math.min(1,l.intensity/18)*((l.userData.effectUntil??0)>clock?1:Math.max(1-day,battle?.35:0));if(w<=0)continue;const q=l.position.clone().sub(V3(a.x,heightAt(a.x,a.z),a.z)).normalize();direction.addScaledVector(q,w*1.8);lampWeight+=w;}
 u.sunDirection.value.copy(direction.normalize());u.opacity.value=Math.min(.29,sceneryLight.shadowStrength.value+lampWeight*.12);
};
const replaceBeforeRegisteredShadow=replaceActorArt;
replaceActorArt=function(a,id){
 replaceBeforeRegisteredShadow(a,id);const meta=assets.sprites[id],unit=meta.unit??136,g=new THREE.PlaneGeometry(meta.w/unit*a.size,meta.h/unit*a.size);g.translate(0,(meta.h/2-(meta.gutter??8))/unit*a.size,0);a.mesh.geometry.dispose();a.mesh.geometry=g;
 const key=[a.action,'idle_'+a.face,a.face,'battleIdle','enemyIdle','south'].find(k=>meta.frames[k]?.length)??Object.keys(meta.frames)[0];setActorFrame(a,key,0);
 if(!meta.frames[a.action]&&!meta.frames[a.face]&&!meta.frames['idle_'+a.face]){a.action=key;a.actionTime=0;a.speed=0;}
 if(a.shadow?.material.uniforms?.texel){a.shadow.geometry.dispose();a.shadow.geometry=g.clone();const u=a.shadow.material.uniforms,t=a.mesh.material.map;u.map.value=t;u.repeat.value=t.repeat;u.offset.value=t.offset;u.texel.value.set(1/t.image.width,1/t.image.height);}
};

const CANAL_COURSE=[[-121,210],[-128,160],[-131.3,121],[-132,55],[-131.8,35],[-128,22],[-121,14],[-113,10]];
function canalDistance(x,z){const bound=Math.hypot(Math.max(-137-x,0,x+100),Math.max(1-z,0,z-216));if(bound>12)return bound+2;let d=Infinity;for(let i=1;i<CANAL_COURSE.length;i++)d=Math.min(d,segmentDistance(x,z,CANAL_COURSE[i-1],CANAL_COURSE[i])-3.4);return Math.min(d,Math.hypot(x+110,z-9)-7.2);}
channelDistance=function(x,z){return Math.min(Math.abs(x-riverX(z))-riverWidth(z),canalDistance(x,z));};
// Clip each grid triangle against the union's signed bank distance. The
// confluence, spring pool and canal share one surface: no coplanar ribbons.
buildGlobalWater=function(){buildWater({waterX:-43});const p=[],uv=[],across=[],normal=[],step=2,patches=new Map();
 const vertex=(a)=>{p.push(a.x,0,a.z);uv.push(a.x*.1,a.z*.1);across.push(clamp(1-Math.max(0,water.position.y-groundAt(a.x,a.z))/2.7,0,1));normal.push(0,1,0);const key=Math.floor(a.x/24)+','+Math.floor(a.z/24);let b=patches.get(key);if(!b){b=new THREE.Box3();patches.set(key,b);}b.expandByPoint(V3(a.x,water.position.y-.1,a.z));b.expandByPoint(V3(a.x,water.position.y+.1,a.z));};
 const clip=poly=>{const result=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],inside=a.d<=0,next=b.d<=0;if(inside)result.push(a);if(inside!==next){const t=a.d/(a.d-b.d);result.push({x:mix(a.x,b.x,t),z:mix(a.z,b.z,t),d:0});}}return result;};
 for(let z=-290;z<210;z+=step)for(let x=LAND.minX-30;x<LAND.maxX+30;x+=step){const q=[[x,z],[x,z+step],[x+step,z+step],[x+step,z]].map(([x,z])=>({x,z,d:channelDistance(x,z)-1.6}));for(const ids of[[0,1,2],[0,2,3]]){const poly=clip(ids.map(i=>q[i]));for(let i=1;i<poly.length-1;i++){vertex(poly[0]);vertex(poly[i]);vertex(poly[i+1]);}}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normal,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('riverAcross',new THREE.Float32BufferAttribute(across,1));g.computeBoundingSphere();water.geometry.dispose();water.geometry=g;
 for(let z=41;z<120;z+=1.5)for(const side of[-1,1]){const x=-132+Math.sin((z-55)*.009)*1.2+side*4.15,y=baseLand(x,z);box(x,(y-3.5)/2,z,.52,y+3.5,1.52,'wall','#b5b4a5');box(x,y+.1,z,.7,.2,1.53,'wall','#d4d0b7');if(!world.userData.bridges.some(b=>Math.abs(z-b.z)<b.width/2+.5&&Math.abs(x-b.x)<b.length/2))obstacle(x,z,.6,1.5,'canal parapet');}
 world.userData.waterCourse=CANAL_COURSE;world.userData.connectedWater=true;world.userData.waterPatches=[...patches.values()].map(b=>b.expandByVector(V3(step,.02,step)));
};
