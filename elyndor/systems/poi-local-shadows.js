// Use the same physical fixtures for direct lighting and occlusion. The six
// existing light slots still belong to combat when an encounter takes over.
const lanternBeforeFixtureMount=lantern;
lantern=function(...args){
 const body=lanternBeforeFixtureMount(...args);
 if(body)body.userData.lanternCenter=0;
 return body;
};
function poiFixtureSources(){
 const data=world.userData;
 if(data.poiFixtures)return data.poiFixtures;
 const fixtures=[],room=activeScene.kind==='interior';
 world.updateMatrixWorld(true);
 function add(position,kind,legacy=false,site=null){
  if(fixtures.some(f=>f.position.distanceToSquared(position)<(legacy?4:.16)))return;
  fixtures.push({position,kind,site});
 }
 // The scene budget detaches the original crystal PointLight, but keeps it
 // as the story's restoration/intensity control. Give its light a live slot.
 for(const s of data.lightSites??[])if(!s.glow.parent)add(s.core.getWorldPosition(V3()),'crystal',false,s);
 world.traverse(o=>{
  const fire=o.userData.environmentFire163,center=o.userData.lanternCenter;
  if(center!=null)add(o.localToWorld(V3(0,center,0)),'lantern');
  if(fire&&fire!=='candle')add(o.localToWorld(V3(0,.40,.05)),'fire');
 });
 if(!room)for(const p of data.lampSources??[])if(inSceneBounds(p.x,p.z,0))add(p,'lantern',true);
 return data.poiFixtures=fixtures;
}
const fixtureColours={lantern:new THREE.Color('#ffca90'),fire:new THREE.Color('#ffad65'),crystal:new THREE.Color('#9ce6ed')};
function placePoiLights(){
 if(!world||!player||battle||encounter53.active||!['poi','interior'].includes(activeScene?.kind))return;
 const fixtures=poiFixtureSources(),room=activeScene.kind==='interior';
 if(!fixtures.length)return;
 const data=world.userData,pool=data.lanterns,day=room?0:celestial31.day.value;
 lampField33.power.value=room?.28:mix(.39,.035,day);
 const count=Math.min(room?6:4,pool?.length??0);
 const slots=data.fixtureSlots??=Array.from({length:count},()=>({source:null,target:null,gain:0}));
 const focus=cameraTarget;
 if(!data.fixtureFocus||data.fixtureFocus.distanceToSquared(focus)>1||data.fixtureRankAt>clock){
  for(const f of fixtures){
   const dx=f.position.x-focus.x,dz=f.position.z-focus.z;
   f.rank=(dx*dx+dz*dz)/(f.site?2.3:f.kind==='fire'?1.65:1)*(slots.some(s=>s.target===f)?.8:1);
  }
  const desired=new Set(fixtures.slice().sort((a,b)=>a.rank-b.rank).slice(0,count));
  for(const s of slots){if(!desired.delete(s.target))s.target=null;}
  for(const f of desired){const slot=slots.find(s=>!s.target);slot.target=f;}
  (data.fixtureFocus??=V3()).copy(focus);data.fixtureRankAt=clock;
 }
 const dt=clamp(clock-(data.fixtureTime??clock),0,.15);data.fixtureTime=clock;
 for(let i=0;i<count;i++){
  const l=pool[i],s=slots[i];
  if(l.userData.effectUntil>clock)continue;
  if(!s.source){s.source=s.target;s.gain=1;}
  if(s.source!==s.target){s.gain=Math.max(0,s.gain-4*dt);if(!s.gain)s.source=s.target;}
  else s.gain=Math.min(1,s.gain+4*dt);
  const f=s.source;
  if(!f){l.intensity=0;continue;}
  if(f.site)f.site.core.getWorldPosition(f.position);
  l.position.copy(f.position);l.color.copy(fixtureColours[f.kind]);l.decay=2;l.userData.emitterKind=f.kind;
  l.distance=f.site?19:f.kind==='fire'?14:room?10:13;
  if(f.site)l.intensity=29+Math.max(f.site.glow.intensity,state.restoredLights?.includes(f.site.id)?12:0)*1.5;
  else l.intensity=f.kind==='fire'?(room?32:23)*firelight163(clock,f.position.x):room?16:mix(12.5,1.6,day);
  l.intensity*=s.gain;
 }
}
const fixtureLightBefore=updateLighting;
updateLighting=function(...args){const r=fixtureLightBefore(...args);placePoiLights();return r;};
const fixtureBuildBefore=buildWorld;
buildWorld=function(...args){
 const result=fixtureBuildBefore(...args);
 if(world&&['poi','interior'].includes(activeScene?.kind)){
  const data=world.userData;
  if(!data.fixtureFieldReady){
   delete data.poiFixtures;delete data.fixtureSlots;delete data.fixtureFocus;
   const warm=poiFixtureSources().filter(f=>!f.site).map(f=>f.position);
   buildLampField33(warm);data.fixtureFieldReady=true;
  }
  for(const a of actors)actorLampCaster(a);
  placePoiLights();
 }
 return result;
};

function actorLampCaster(actor){
 const mesh=actor.mesh;if(!mesh||mesh.customDistanceMaterial)return;
 prepareTravelLighting150(actor);
 const m=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide});
 // A sprite is camera-facing in the colour pass. Give the lamp a vertical
 // view of the current animation frame, even when it stands beside the actor.
 m.onBeforeCompile=s=>{
  s.vertexShader='uniform vec3 referencePosition;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec3 foot=modelMatrix[3].xyz;
   vec2 toLight=referencePosition.xz-foot.xz;
   vec2 side=length(toLight)>.001?normalize(vec2(toLight.y,-toLight.x)):vec2(1.,0.);
   vec3 upright=foot+vec3(side.x,0.,side.y)*(position.x*length(modelMatrix[0].xyz))
                    +vec3(0.,position.y*length(modelMatrix[1].xyz),0.);
   transformed=(inverse(modelMatrix)*vec4(upright,1.)).xyz;`);
 };
 m.customProgramCacheKey=()=>'lamp-sprite-distance';mesh.customDistanceMaterial=m;
 mesh.material.addEventListener('dispose',()=>m.dispose());
 // Match the receiver to the upright silhouette used by the lamp. A tilted
 // camera card otherwise shadows its own chest when the source is behind it.
 const skin=mesh.material,compile=skin.onBeforeCompile,key=skin.customProgramCacheKey();
 skin.onBeforeCompile=function(s,...rest){
  compile.call(this,s,...rest);
  const native=THREE.ShaderChunk.shadowmap_vertex;
  const from='vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;';
  s.vertexShader=s.vertexShader.replace('#include <shadowmap_vertex>',native.replace(from,`{
   vec3 foot=modelMatrix[3].xyz;
   vec2 toLamp=-pointShadowMatrix[ i ][3].xz-foot.xz;
   vec2 side=normalize(vec2(toLamp.y,-toLamp.x)+vec2(.00001,0.));
   vec3 body=foot+vec3(side.x,0.,side.y)*position.x*length(modelMatrix[0].xyz)+vec3(0.,position.y*length(modelMatrix[1].xyz),0.);
   vPointShadowCoord[ i ]=pointShadowMatrix[ i ]*vec4(body,1.);
   vPointShadowCoord[ i ].xyz*=.989;
  }`));
  // Roll the painted surface gently at the sides so an off-axis lamp can
  // catch one shoulder. The original texture supplies all outline and detail.
  s.uniforms.lampSpriteWidth={value:Math.max(.35,actor.size*.29)};
  s.vertexShader='uniform float lampSpriteWidth;varying float lampSpriteSide;varying vec3 lampSpriteAxis;\n'+s.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nlampSpriteSide=clamp(position.x/lampSpriteWidth,-1.,1.);lampSpriteAxis=normalize(modelViewMatrix[0].xyz);');
  s.fragmentShader='varying float lampSpriteSide;varying vec3 lampSpriteAxis;\n'+s.fragmentShader.replace('#include <lights_fragment_begin>',
   '#if NUM_POINT_LIGHT_SHADOWS > 0\nnormal=normalize(normal+lampSpriteAxis*lampSpriteSide*1.4);\n#endif\n#include <lights_fragment_begin>');
 };
 skin.customProgramCacheKey=()=>key+'-lamp-sprite-shading';skin.needsUpdate=true;
}
const actorBeforeFixtureShadows=createActor;
createActor=function(...args){
 const actor=actorBeforeFixtureShadows(...args);
 if(!encounter53.active&&['poi','interior'].includes(activeScene?.kind))actorLampCaster(actor);
 return actor;
};
const shadowsForWorld=new WeakMap();
let activeFixtureWorld=null;
function releaseFixtureShadows(w){
 const info=shadowsForWorld.get(w);if(!info)return;
 for(const l of info.chosen){l.castShadow=false;l.shadow.needsUpdate=false;l.userData.casterStamp?.clear();}
 info.chosen.clear();info.at=info.scanAt=-Infinity;
}
function updateFixtureShadows(){
 const enabled=world&&player&&!battle&&!encounter53.active&&['poi','interior'].includes(activeScene?.kind);
 if(activeFixtureWorld&&(!enabled||activeFixtureWorld!==world)){releaseFixtureShadows(activeFixtureWorld);activeFixtureWorld=null;}
 if(!enabled)return;
 activeFixtureWorld=world;
 const data=world.userData,pool=data.lanterns??[];
 let info=shadowsForWorld.get(world);
 if(!info){info={chosen:new Set(),at:-Infinity};shadowsForWorld.set(world,info);}
 const mobile=touchDevice33()||state.settings.quality==='low',budget=mobile?1:2,interval=mobile?1/12:1/18;
 if(info.scanAt<=clock&&clock-info.scanAt<interval)return;
 info.scanAt=clock;
 const lights=pool.slice(0,activeScene.kind==='interior'?6:4);
 for(const site of data.lightSites??[])if(site.glow?.parent)lights.push(site.glow);
 const candidates=[];
 for(const light of lights){
  if(!light.visible)continue;
  const p=light.getWorldPosition(V3()),distance=Math.hypot(p.x-player.x,p.z-player.z);
  // A fire on the street behind the camera must not take the shadow slot
  // from the lantern lighting the visible porch. Keep nearby edge lights
  // eligible because their pools can extend into the view.
  const screen=p.clone().project(camera);
  const outside=screen.z>1||screen.z< -1?2:Math.max(0,Math.abs(screen.x)-.92,Math.abs(screen.y)-.92);
  // Always keep the same number of shadow samplers in the material program.
  // Dim or distant fixtures fill any spare slot without changing the shader.
  const inactive=light.intensity<1||light.userData.effectUntil>clock;
  const rank=(inactive?1e8:0)+(distance*distance+5)*(1+Math.min(3,outside)*1.8)/Math.max(.1,light.intensity);
  candidates.push({light,p,rank:rank*(info.chosen.has(light)?.85:1)});
 }
 candidates.sort((a,b)=>a.rank-b.rank);
 const picks=candidates.slice(0,budget),next=new Set(picks.map(c=>c.light));
 const spare=[];
 for(const l of info.chosen)if(!next.has(l)){
  l.castShadow=false;l.userData.casterStamp?.clear();
  if(l.shadow.map){spare.push(l.shadow.map);l.shadow.map=null;}
 }
 let dirty=false;
 for(const {light:l,p} of picks){
  const sh=l.shadow,moved=!l.userData.shadowOrigin||l.userData.shadowOrigin.distanceToSquared(p)>.0004;
  l.castShadow=true;sh.autoUpdate=false;
  const size=mobile?256:512,near=l.userData.emitterKind==='crystal'?3.3:.43;
  if(sh.mapSize.x!==size){sh.map?.dispose();sh.map=null;sh.mapSize.setScalar(size);}
  // All point-light atlases use the same layout. A reassigned slot can reuse
  // the old allocation after rendering its six faces from the new fixture.
  if(!sh.map&&spare.length){
   const atlas=spare.pop(),extent=sh.getFrameExtents();
   if(atlas.width===size*extent.x&&atlas.height===size*extent.y)sh.map=atlas;
   else atlas.dispose();
  }
  if(sh.camera.near!==near){sh.camera.near=near;sh.camera.updateProjectionMatrix();sh.needsUpdate=true;}
  sh.bias=-.00065;sh.normalBias=.024;sh.radius=2.1;
  // Only silhouette or position changes inside this light's radius invalidate
  // its six depth faces. Foliage and other animated scenery get a slow refresh.
  const stamp=l.userData.casterStamp??=new Map();let changed=false;
  for(const a of actors){
   const mesh=a.mesh;if(!mesh?.visible||mesh.position.distanceToSquared(p)>l.distance*l.distance)continue;
   const pos=mesh.position,cell=a.frame?.cell??0,prev=stamp.get(mesh);
   if(!prev||prev.pos.distanceToSquared(pos)>.0064||prev.cell!==cell){
    if(prev){prev.pos.copy(pos);prev.cell=cell;}else stamp.set(mesh,{pos:pos.clone(),cell,seen:clock});
    changed=true;
   }
   if(prev)prev.seen=clock;
  }
  for(const [mesh,entry]of stamp)if(entry.seen!==clock){stamp.delete(mesh);changed=true;}
  if(moved||changed||!info.chosen.has(l)||!sh.map||clock<(l.userData.depthAt??0)||clock-(l.userData.depthAt??0)>=.24){
   sh.needsUpdate=true;(l.userData.shadowOrigin??=V3()).copy(p);dirty=true;
   l.userData.depthAt=clock;
  }
 }
 for(const atlas of spare)atlas.dispose();
 info.chosen=next;
 if(dirty){
  for(const a of actors)if(a.mesh?.visible)actorLampCaster(a);
  info.at=clock;shadow36.due=true;renderer.shadowMap.needsUpdate=true;
 }
}
const fixtureFitBefore=fitVisibleShadows;
fitVisibleShadows=function(...args){placePoiLights();const r=fixtureFitBefore(...args);updateFixtureShadows();return r;};
const stageBeforeLocalShadows=activateStage53;
activateStage53=function(...args){
 if(activeFixtureWorld){releaseFixtureShadows(activeFixtureWorld);activeFixtureWorld=null;}
 return stageBeforeLocalShadows(...args);
};
const fixtureDisposeBefore=disposeContinuousWorld;
disposeContinuousWorld=function(...args){
 if(world){
  releaseFixtureShadows(world);
  for(const l of [...world.userData.lanterns??[],...(world.userData.lightSites??[]).map(s=>s.glow)].filter(Boolean)){
   l.userData.casterStamp?.clear();
   if(l.shadow){l.shadow.dispose();l.shadow.map=null;l.shadow.mapPass=null;}
  }
  if(activeFixtureWorld===world)activeFixtureWorld=null;
 }
 return fixtureDisposeBefore(...args);
};
