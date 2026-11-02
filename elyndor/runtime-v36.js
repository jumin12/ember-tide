// Loading work, resource ownership and device performance share one budget.
// The embedded art remains native resolution on every graphics tier.
const loading36={active:true,generation:0,progress:0,stage:'assets',assetDone:0,assetTotal:0,started:performance.now(),history:[],completed:0,textureUploads:0,readyWorld:null};
function yieldLoad36(){return new Promise(resolve=>requestAnimationFrame(()=>resolve()));}
function setLoadStage36(fraction,label){
 if(!loading36.active)return;const next=Math.max(loading36.progress,Math.min(.99,fraction));loading36.progress=next;loading36.stage=label;
 const fill=$('#load-fill'),screen=$('#load-screen');if(fill)fill.style.width=(next*100).toFixed(1)+'%';if(label)$('#load-label').textContent=label;
 const track=screen.querySelector('.load-track');track.setAttribute('role','progressbar');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(Math.round(next*100)));track.setAttribute('aria-valuetext',Math.round(next*100)+'% · '+label);
 loading36.history.push({progress:next,stage:label,at:performance.now()-loading36.started});if(loading36.history.length>256)loading36.history.shift();
}
function beginLoad36(){const first=loading36.generation===0;loading36.active=true;loading36.generation++;loading36.progress=0;loading36.started=performance.now();loading36.history=[];setLoadStage36((first&&window.__assetReading36?.complete)? .12:0,'Opening the riverlands…');}
function finishLoad36(){if(!loading36.active||loading36.booting)return;loading36.progress=1;$('#load-fill').style.width='100%';$('#load-screen .load-track').setAttribute('aria-valuenow','100');loading36.history.push({progress:1,stage:'Ready',at:performance.now()-loading36.started});if(loading36.history.length>256)loading36.history.shift();loading36.active=false;loading36.completed++;loading36.lastMs=performance.now()-loading36.started;}
function reportAssetLoaded36(done,total){loading36.assetDone=done;loading36.assetTotal=total;setLoadStage36(.12+.18*done/total,'Decoding artwork · '+done+' / '+total);}
// Immutable vertex data may share GPU buffers. Instance masks remain owned by
// each batch. BufferGeometry.clone unnecessarily duplicated every leaf spray.
function shareGeometry36(source){const g=new THREE.BufferGeometry();g.index=source.index;for(const [name,a]of Object.entries(source.attributes))g.setAttribute(name,a);g.groups=source.groups.map(q=>({...q}));g.drawRange={...source.drawRange};g.boundingBox=source.boundingBox?.clone()??null;g.boundingSphere=source.boundingSphere?.clone()??null;return g;}
const loadingAssetsBefore36=loadAssets;
loadAssets=async function(){beginLoad36();await loadingAssetsBefore36();setLoadStage36(.32,'Preparing world textures…');await yieldLoad36();};
const journeyLoadingBefore36=setJourneyLoading;
setJourneyLoading=function(value){if(value)beginLoad36();journeyLoadingBefore36(value);if(value)setLoadStage36(0,'Preparing the next location…');else if(loading36.active)finishLoad36();};
const graphicsBefore36=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){
 if(loading36.readyWorld===world){settleArrival28();renderBeforeLoadingGate();await yieldLoad36();return;}
 if(!loading36.active)beginLoad36();setLoadStage36(.345,'Preparing sounds and scene resources…');await yieldLoad36();
 await prepareSounds36();await prepareWeatherCache36();const result=await graphicsBefore36(...args);
 // Upload every loaded material image, including native VFX and all array
 // layers. No first-use texture upload is left to the first ability cast.
 const all=new Set([...Object.values(textures),scenery.surfaceArray,materials28.normalArray,forest30.array].filter(t=>t?.isTexture));let done=0;
 for(const t of all){renderer.initTexture(t);loading36.textureUploads++;setLoadStage36(.90+.065*++done/all.size,'Uploading textures · '+done+' / '+all.size);if(done%8===0)await yieldLoad36();}
 setLoadStage36(.97,'Finishing lighting and reflections…');settleArrival28();updateRenderBudget(true);renderBeforeLoadingGate();
 const gl=renderer.getContext();if(gl.fenceSync){const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();try{while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await yieldLoad36();}finally{gl.deleteSync(fence);}}
 await calibrateDevice36();loading36.readyWorld=world;setLoadStage36(.99,'Ready');await yieldLoad36();finishLoad36();await yieldLoad36();return result;
};
// Scene builders and shader warm-up own their covered frames. Running the
// normal update chain alongside them needlessly competed with loader work.
// Loading is gated by the single systems/runtime.js presentation loop.
// The map preserves the playable terrain and every tree's real position, but
// never retains all the continent's grass, close-up canopy buffers and masks.
function addMapTrees36(parent){
 const rows=bakedFloat36(BAKED_WORLD36.trees.data),n=BAKED_WORLD36.trees.count;
 const g=shareGeometry36(sprayGeometry30(28)),species=new THREE.InstancedBufferAttribute(Float32Array.from({length:n},(_,i)=>rows[i*6+5]),1);
 g.setAttribute('treeKind',new THREE.InstancedBufferAttribute(new Float32Array(n),1));g.setAttribute('treeSpecies30',species);g.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(n),1));
 const m=forestMaterial30(false);mapFog17(m);const o=new THREE.InstancedMesh(g,m,n),dummy=new THREE.Object3D();
 for(let i=0;i<n;i++){const at=i*6,x=rows[at],y=rows[at+1],z=rows[at+2],h=rows[at+3],scale=rows[at+4];dummy.position.set(x,y+h*.72,z);dummy.rotation.y=x*.17+z*.13;dummy.scale.set(scale*2.9,h*.40,scale*2.9);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);}
 o.computeBoundingSphere();o.userData={sameTreePositions17:true,atlasAlways36:true,compactAtlas36:true};o.onBeforeRender=()=>{forest30.main.value=0;};parent.add(o);macroMap17.far.push(o);
 const bark=new THREE.CylinderGeometry(.11,.22,1,5,1);bark.setAttribute('treeKind',new THREE.InstancedBufferAttribute(new Float32Array(n).fill(1),1));bark.setAttribute('treeSpecies30',species);bark.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(n),1));const bm=forestMaterial30(true);mapFog17(bm);const trunks=new THREE.InstancedMesh(bark,bm,n);
 for(let i=0;i<n;i++){const at=i*6,h=rows[at+3],scale=rows[at+4];dummy.position.set(rows[at],rows[at+1]+h*.36,rows[at+2]);dummy.rotation.set(0,0,0);dummy.scale.set(scale,h*.72,scale);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);trunks.setColorAt(i,new THREE.Color('#c7b394'));}trunks.computeBoundingSphere();trunks.userData={sameTreePositions17:true,atlasAlways36:true,compactAtlasBark36:true};trunks.onBeforeRender=()=>{forest30.main.value=0;};parent.add(trunks);macroMap17.far.push(trunks);
}
function updatePartyCards36(id){const node=$('#'+id);const key=JSON.stringify([!!battle,document.body.classList.contains('compact33'),state.members.map(id=>[id,state.characters[id],stats(id)])]);if(node.dataset.cards36===key)return;node.dataset.cards36=key;node.innerHTML=state.members.map(id=>card(id)).join('');}
// Cull complete static branches using all views that can contribute pixels.
// Keep shadow reach and reflection bounds, including an 8m prefetch margin.
const static36={main:new THREE.Frustum(),mirror:new THREE.Frustum(),matrix:new THREE.Matrix4(),sphere:new THREE.Sphere(),camera:new THREE.PerspectiveCamera(),at:-1,world:null,visible:0,total:0};
const buildBefore36=buildWorld;
buildWorld=function(...args){if(state.mode==='title'&&world?.userData.poi===poiFor(args[0])&&args[0]!=='overworld'&&!INTERIORS[args[0]]){state.scene=args[0];setupParty(args[1]??POIS[world.userData.poi].spawn);updateLighting();updateCamera(1,true);return;}const result=buildBefore36(...args);const roots=new Set(world.userData.staticChunks??[]),branches=[];
 for(const root of roots){if(!root.parent||root.userData.mechanism||root.userData.dynamicFX||root===world.userData.gate)continue;let moving=false;root.traverse(o=>{if(o.isLight||actors.some(a=>a.mesh===o||a.shadow===o))moving=true;});if(moving)continue;
  const box=new THREE.Box3().setFromObject(root);if(box.isEmpty())continue;const parent=root.parent,g=new THREE.Group();g.name='static-visibility-branch36';parent.add(g);g.attach(root);g.userData.bounds36=box.getBoundingSphere(new THREE.Sphere());g.userData.bounds36.radius+=8;g.updateMatrixWorld(true);g.matrixAutoUpdate=g.matrixWorldAutoUpdate=false;
  const update=root.updateMatrixWorld;root.updateMatrixWorld=function(force){if(force)return update.call(this,force);};branches.push(g);
 }
 world.userData.branches36=branches;static36.world=null;return result;};
const budgetBefore36=updateRenderBudget;
updateRenderBudget=function(force=false){const result=budgetBefore36(force);if(!world||!player||!force&&static36.world===world&&clock-static36.at<.10)return result;static36.world=world;static36.at=clock;
 camera.updateMatrixWorld();const q=static36;q.main.setFromProjectionMatrix(q.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 q.camera.copy(camera);const level=water?.position.y??0;q.camera.position.y=2*level-camera.position.y;q.camera.up.set(0,-1,0);q.camera.lookAt(cameraTarget.x,2*level-cameraTarget.y,cameraTarget.z);q.camera.updateMatrixWorld();q.mirror.setFromProjectionMatrix(q.matrix.multiplyMatrices(q.camera.projectionMatrix,q.camera.matrixWorldInverse));
 const reflect=!!water?.visible||(world.userData.waterPools??[]).some(p=>p.visible),ground=heightAt(player.x,player.z);let visible=0;
 for(const branch of world.userData.branches36??[]){const b=branch.userData.bounds36;q.sphere.copy(b);const reach=clamp((b.center.y-ground+b.radius)/Math.max(.15,weather.sun.value.y),0,100);q.sphere.center.addScaledVector(weather.sun.value,-reach);q.sphere.radius+=12;branch.visible=q.main.intersectsSphere(b)||reflect&&q.mirror.intersectsSphere(b)||q.main.intersectsSphere(q.sphere);visible+=branch.visible;}
 q.visible=visible;q.total=world.userData.branches36?.length??0;return result;};
// Shader recipes are immutable between material revisions. Nested historical
// shader decorators were rebuilding long cache-key strings for every draw.
function cacheOneMaterial36(m){if(m.userData.cacheKey36)return;m.userData.cacheKey36=true;const original=m.customProgramCacheKey.bind(m);let revision=-1,key='';m.customProgramCacheKey=function(){if(this.version!==revision){revision=this.version;key=original();}return key;};}
function cacheMaterialKeys36(root){root?.traverse(o=>{for(const m of [...(o.material?(Array.isArray(o.material)?o.material:[o.material]):[]),o.customDepthMaterial].filter(Boolean))cacheOneMaterial36(m);});}
const buildKeysBefore36=buildWorld;
buildWorld=function(...args){const result=buildKeysBefore36(...args);cacheMaterialKeys36(world);cacheMaterialKeys36(atlas3d.scene??macroMap17.scene);
 // Scene roots never move. Avoid marking every descendant transform dirty on
 // each pass; actors, lights, weather and other children still update normally.
 scene.matrixAutoUpdate=false;world.matrixAutoUpdate=false;scene.updateMatrix();world.updateMatrix();scene.updateMatrixWorld(true);return result;};
function bakedFloat36(source){const raw=atob(source),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return new Float32Array(bytes.buffer);}
const gridBefore36=prepareMacroGrid15;
prepareMacroGrid15=function(){if(window.__forceWorldBake36)return gridBefore36();if(!macroGrid15)macroGrid15=bakedFloat36(BAKED_WORLD36.grid.data);};
const natureBefore36=buildMacroNature15;
buildMacroNature15=function(...args){
 if(!loading36.mapPreparation)return natureBefore36(...args);
 // Only the atlas is being prepared. Buildings and bridges use the real world
 // builders; its exact trees and height field were baked during development.
 geologicalDressing16(world);const forest=buildSolidForest;buildSolidForest=function(){scenery.trees=[];scenery.forestMeshes=[];world.userData.solidTrees=[];world.userData.treePoints=[];};
 try{batchLandscape();}finally{buildSolidForest=forest;}world.userData.geographyVersion=17;
};
// Reuse physical shadow/reflection targets at 30 Hz on constrained hardware.
// View matrices stay paired with the frame that produced the cached texture.
// Large camera jumps and the first visible frame always invalidate the cache.
const shadow36={world:null,last:-100,due:true,camera:new THREE.Vector3(),frames:0,skips:0},reflect36={world:null,last:-100,camera:new THREE.Vector3(),skips:0};
const shadowFitBefore36=fitVisibleShadows;
fitVisibleShadows=function(){const fast=profile33()>1,loading=gameLoading||loading36.active;shadow36.due=loading||fast||shadow36.world!==world||shadow36.resize!==device33.resizes||!sun.shadow.map||clock-shadow36.last>=1/30||shadow36.camera.distanceToSquared(camera.position)>.25;if(!shadow36.due){shadow36.skips++;return;}shadow36.world=world;shadow36.resize=device33.resizes;shadow36.last=clock;shadow36.camera.copy(camera.position);return shadowFitBefore36();};
const setupBefore36=setupPost;
setupPost=function(){setupBefore36();const draw=renderer.shadowMap.render;renderer.shadowMap.render=function(lights,s,c){if(c===camera&&!shadow36.due){this.needsUpdate=false;sun.shadow.needsUpdate=false;return;}shadow36.frames++;return draw.call(this,lights,s,c);};};
const reflectionBefore36=updateReflection;
updateReflection=function(...args){if(profile33()<2&&!gameLoading&&!loading36.active&&reflect36.world===world&&reflect36.resize===device33.resizes&&clock-reflect36.last<1/30&&reflect36.camera.distanceToSquared(camera.position)<.25){reflect36.skips++;return;}const before=liveSurfaceStats.reflections,result=reflectionBefore36(...args);if(liveSurfaceStats.reflections!==before){reflect36.world=world;reflect36.resize=device33.resizes;reflect36.last=clock;reflect36.camera.copy(camera.position);}return result;};
const settingsBefore36=loadSettings;
loadSettings=function(){settingsBefore36();if(state.settings.quality!=='balanced')return;const memory=navigator.deviceMemory??8,cores=navigator.hardwareConcurrency??8;if(softwareBudget()||touchDevice33()&&memory<=4)device33.tier=0;else if(touchDevice33()||cores<=4)device33.tier=Math.min(1,device33.tier);};
const densityBefore36=updateRenderBudget;
updateRenderBudget=function(force=false){const result=densityBefore36(force);if(!world)return result;const t=profile33();for(const m of perf.plants){const total=m.userData.total??m.count;if(m.userData.plantKey==='grassBlades')m.count=Math.max(1,Math.floor(total*[.62,.82,1,1][t]));}return result;};
async function calibrateDevice36(){
 if(state.settings.quality!=='balanced')return;setLoadStage36(.98,'Checking this device’s graphics budget…');const samples=[];
 for(let i=0;i<4;i++){await yieldLoad36();const start=performance.now();renderBeforeLoadingGate();samples.push(performance.now()-start);}
 const steady=samples.slice(1).sort((a,b)=>a-b),cpu=steady[1],suggested=cpu>11?0:cpu>6.5?1:2;loading36.calibration={cpuMs:cpu,hardwareMemory:navigator.deviceMemory??null,cores:navigator.hardwareConcurrency??null};
 if(suggested<device33.tier){device33.tier=suggested;device33.profile='';applyCapabilityBudget();resizeNow33();updateRenderBudget(true);renderBeforeLoadingGate();await yieldLoad36();}
}
function makeWarmRepresentatives36(position){
 const list=[],keys=new Set();world.traverse(o=>{if(!o.isMesh||o.userData.dynamicFX&&o!==world.userData.contacts35&&o!==world.userData.weatherBatch36)return;
  const lods=new Set([o.geometry,o.userData.fullGeometry,o.userData.farGeometry,o.userData.simpleGeometry,o.userData.detailedGeometry,o.userData.distantGeometry,...o.userData.nativeLods30??[]].filter(Boolean));
  for(const geometry of lods){const materials=Array.isArray(o.material)?o.material:[o.material],key=materials.map(m=>m.uuid).join(',')+'|'+geometry.uuid+'|'+!!o.isInstancedMesh+'|'+!!o.instanceColor;if(keys.has(key))continue;keys.add(key);let mesh;
   if(o.isInstancedMesh){mesh=new THREE.InstancedMesh(geometry,o.material,1);mesh.instanceMatrix=o.instanceMatrix;if(o.instanceColor)mesh.instanceColor=o.instanceColor;mesh.userData.borrowedInstances36=true;}else mesh=new THREE.Mesh(geometry,o.material);
   mesh.position.copy(position);mesh.scale.setScalar(.0001);mesh.frustumCulled=false;mesh.receiveShadow=o.receiveShadow;mesh.castShadow=o.castShadow;mesh.customDepthMaterial=o.customDepthMaterial;mesh.userData.graphicsWarmup=true;list.push(mesh);
  }
 });loading36.geometryTotal=list.length;return list;
}
const bootBefore36=boot;
boot=async function(){loading36.booting=true;await bootBefore36();loading36.booting=false;if(!window.__ely)return;finishLoad36();await yieldLoad36();$('#load-screen').classList.add('hidden');};
// The old HUD built a retired full-region SVG and immediately replaced it with
// the location radar. Keep one radar and preserve its DOM while nothing changes.
function updateRadar36(node){const key=[world.userData.serial,Math.round(player.x*2),Math.round(player.z*2),state.beat,state.trackedPoi,state.visited?.length,state.flags.gate_open,state.flags.prologue_complete].join('|');if(node.dataset.radar36===key)return;node.dataset.radar36=key;node.innerHTML=journeyMapSVG(true);}
const hex36=Array.from({length:256},(_,i)=>i.toString(16).padStart(2,'0'));
commitExploration=function(){const size=ATLAS_GRID.w*ATLAS_GRID.h,parts=new Array(size);let count=0;for(let i=0;i<size;i++){const n=atlas3d.mask[i*4];parts[i]=hex36[n];count+=n>127;}state.exploredTerrain=parts.join('');atlas3d.revealed=count;};
// Reuse the finished native billboard geometry for each family/size. A new
// encounter still owns its material, canvas and animation state, while its
// immutable plane is already resident on the GPU from loading-screen warm-up.
const actorBefore36=createActor;
createActor=function(...args){const a=actorBefore36(...args);if(!a)return a;const g=a.mesh.geometry,p=g.attributes.position,key='actor36-'+(a.visualId??a.id)+'-'+a.size+'-'+Array.from(p.array).join(',');if(sharedGeo[key]){a.mesh.geometry=sharedGeo[key];g.dispose();}else{sharedGeo[key]=g;g.userData.sharedActor36=true;g.dispose=retainResource36;}return a;};
function retainResource36(){}
// Recruitment, respawning and returning from the title replace the party in
// the same scene. Release the outgoing owned canvases and materials there too.
const partyBefore36=setupParty;
setupParty=function(...args){const outgoing=[player,...followers].filter(Boolean),result=partyBefore36(...args),live=new Set([player,...followers]);
 for(const a of outgoing){if(live.has(a)||a.mesh.parent)continue;const t=a.mesh.material.map;t?.dispose();if(t?.userData.frame33){t.userData.frame33.canvas.width=t.userData.frame33.canvas.height=1;}a.mesh.material.dispose();a.mesh.geometry.dispose();a.shadow.material.dispose();a.shadow.geometry.dispose();}
 return result;};
// Rain/snow samples are fixed in world space. Cache their terrain queries and
// submit the visible neighbourhood as one reusable draw instead of 49 draws.
const weatherChunkBefore36=weatherChunk15;
weatherChunk15=function(ix,iz){const q=world.userData.weatherCache36??={pool:new Map(),idle:0,key:'',pending:[]},key=ix+','+iz;let mesh=q.pool.get(key);if(mesh){weatherField.reused++;world.add(mesh);return mesh;}mesh=weatherChunkBefore36(ix,iz);q.pool.set(key,mesh);return mesh;};
function weatherBatch36(){let mesh=world.userData.weatherBatch36;if(mesh)return mesh;const g=new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1,1));g.setAttribute('weatherSample',new THREE.InstancedBufferAttribute(new Float32Array(49*112*4),4).setUsage(THREE.DynamicDrawUsage));g.instanceCount=0;g.boundingSphere=new THREE.Sphere();mesh=new THREE.Mesh(g,weatherField.material);mesh.userData.dynamicFX=true;mesh.renderOrder=7;mesh.visible=false;world.add(mesh);world.userData.weatherBatch36=mesh;return mesh;}
const weatherUpdateBefore36=updateWorldWeather15;
updateWorldWeather15=function(...args){weatherUpdateBefore36(...args);if(!world||activeScene.kind==='interior'||!weatherField.material)return;const batch=weatherBatch36();if(batch.userData.revision36!==weatherField.updates){const a=batch.geometry.attributes.weatherSample;let count=0;batch.geometry.boundingSphere.makeEmpty();for(const m of weatherField.chunks.values()){const n=m.geometry.instanceCount;a.array.set(m.geometry.attributes.weatherSample.array.subarray(0,n*4),count*4);count+=n;batch.geometry.boundingSphere.union(m.geometry.boundingSphere);m.removeFromParent();}batch.geometry.instanceCount=count;a.needsUpdate=true;batch.userData.revision36=weatherField.updates;}
 batch.visible=weather.rain.value+weather.snow.value>.015;
 const q=world.userData.weatherCache36;if(q&&activeScene.kind==='overworld'&&!gameLoading&&!loading36.active){const key=weatherField.lastX+','+weatherField.lastZ;if(q.key!==key){q.key=key;q.pending=[];for(let x=weatherField.lastX-4;x<=weatherField.lastX+4;x++)for(let z=weatherField.lastZ-4;z<=weatherField.lastZ+4;z++)if(!q.pool.has(x+','+z))q.pending.push([x,z]);queueWeather36(q,world);}}
};
function queueWeather36(q,owner){if(q.idle||!q.pending.length)return;const work=()=>{q.idle=0;if(owner!==world)return;const start=performance.now();while(q.pending.length&&performance.now()-start<2){const[x,z]=q.pending.shift(),m=weatherChunk15(x,z);if(!weatherField.chunks.has(x+','+z))m.removeFromParent();}if(q.pool.size>150){for(const[key,m]of q.pool){const p=m.geometry.boundingSphere.center;if(weatherField.chunks.has(key)||Math.abs(p.x/32-weatherField.lastX)<6&&Math.abs(p.z/32-weatherField.lastZ)<6)continue;m.geometry.dispose();q.pool.delete(key);if(q.pool.size<=130)break;}}queueWeather36(q,owner);};q.idle=window.requestIdleCallback?requestIdleCallback(work,{timeout:200}):setTimeout(work,30);}
async function prepareWeatherCache36(){if(activeScene.kind==='interior')return;const q=world.userData.weatherCache36;if(!q)return;const macro=activeScene.kind==='overworld',b=activeScene.bounds,range=macro?[weatherField.lastX-4,weatherField.lastX+4,weatherField.lastZ-4,weatherField.lastZ+4]:[Math.floor((b[0]-128)/32),Math.floor((b[1]+128)/32),Math.floor((b[2]-128)/32),Math.floor((b[3]+128)/32)],total=(range[1]-range[0]+1)*(range[3]-range[2]+1);let done=0;
 for(let x=range[0];x<=range[1];x++)for(let z=range[2];z<=range[3];z++){const mesh=weatherChunk15(x,z);if(!weatherField.chunks.has(x+','+z))mesh.removeFromParent();done++;setLoadStage36(.38+.035*done/total,'Preparing weather terrain · '+done+' / '+total);if(done%12===0)await yieldLoad36();}loading36.weatherPrepared=q.pool.size;}
const weatherReflectBefore36=updateReflection;
updateReflection=function(...args){const mesh=world?.userData.weatherBatch36,visible=mesh?.visible;if(mesh)mesh.visible=false;try{return weatherReflectBefore36(...args);}finally{if(mesh)mesh.visible=visible;}};
const weatherDisposeBefore36=disposeContinuousWorld;
disposeContinuousWorld=function(...args){nearVegetationWorld26=null;static36.world=null;shadow36.world=null;reflect36.world=null;loading36.readyWorld=null;const q=world?.userData.weatherCache36;if(q){if(q.idle){if(window.cancelIdleCallback)cancelIdleCallback(q.idle);else clearTimeout(q.idle);}for(const m of q.pool.values()){m.removeFromParent();m.geometry.dispose();}q.pool.clear();q.pending.length=0;}return weatherDisposeBefore36(...args);};
// Pin compiled programs, not the scene's actor-bound materials. Retaining a
// material's shader callback can otherwise keep an entire departed world alive.
// This uses the pinned local Three.js program reference counter (vendor file).
function pinPrograms36(){for(const program of renderer.info.programs??[]){if(sceneProgramKeepers.has(program))continue;if(sceneProgramKeepers.size>=112)break;if(typeof program.usedTimes==='number'){program.usedTimes++;sceneProgramKeepers.set(program,true);}}}
// Audio decoding belongs behind the loader, rather than starting a burst of
// 70+ decoders on the first movement/click. Music remains compressed streaming.
const audio36={ready:false,voices:false,shortEffects:0,decoded:0,bytes:0};
function embeddedBlob36(source,type){const raw=atob(source.slice(source.indexOf(',')+1)),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);audio36.bytes+=bytes.length;return URL.createObjectURL(new Blob([bytes],{type}));}
async function prepareSounds36(){
 if(!audio36.voices){const entries=Object.entries(assets.voices??{});for(let i=0;i<entries.length;i++){const[key,source]=entries[i];if(source.startsWith('data:'))assets.voices[key]=embeddedBlob36(source,'audio/ogg');if(i%24===0){setLoadStage36(.345+.004*(i+1)/entries.length,'Preparing voices · '+(i+1)+' / '+entries.length);await yieldLoad36();}}audio36.voices=true;}
 if(audio36.ready)return;try{if(!ambience)ambience=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});}catch{audio36.unavailable=true;return;}
 const ids=Object.keys(assets.sounds??{}).filter(id=>!id.startsWith('theme-')&&!id.startsWith('ambient-')||id==='theme-rest');let next=0,done=0;audio36.shortEffects=ids.length;
 async function decode(){while(next<ids.length){const id=ids[next++];await decodeSound(id);done++;setLoadStage36(.35+.025*done/ids.length,'Preparing sounds · '+done+' / '+ids.length);if(done%6===0)await yieldLoad36();}}
 await Promise.all([decode(),decode()]);audio36.decoded=soundscape.buffers.size;audio36.ready=true;
}
const loadSlotBefore36=loadSlot;
// Preserve the public acceptance result, but paint the loader before rebuilding
// a saved scene. Gameplay remains locked until its real warm-up promise ends.
loadSlot=function(slot='auto',...args){if(gameLoading||loading36.pendingSave||!readSave(slot))return false;setJourneyLoading(true);loading36.pendingSave=slot;
 const task=(async()=>{try{await yieldLoad36();await yieldLoad36();gameLoading=false;window.gameLoading=false;const ok=loadSlotBefore36(slot,...args);if(!ok){setJourneyLoading(false);return false;}const ready=window.journeyGraphicsReady;if(ready&&ready!==task)await ready;return true;}catch(e){setJourneyLoading(false);console.error(e);$('#fatal-text').textContent=e.message;$('#fatal').classList.remove('hidden');return false;}finally{loading36.pendingSave=null;lastFrame=0;window.journeyGraphicsReady=task;}})();window.journeyGraphicsReady=task;return true;};
