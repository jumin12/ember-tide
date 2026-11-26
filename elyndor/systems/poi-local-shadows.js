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
 world.traverseVisible(o=>{
  const fire=o.userData.environmentFire163,center=o.userData.lanternCenter;
  if(center!=null)add(o.localToWorld(V3(0,center,0)),'lantern');
  if(fire&&fire!=='candle')add(o.localToWorld(V3(0,.40,.05)),'fire');
 });
 if(!room)for(const p of data.lampSources??[])if(inSceneBounds(p.x,p.z,0))add(p,'lantern',true);
 return data.poiFixtures=fixtures;
}
const fixtureColours={lantern:new THREE.Color('#ffd49b'),fire:new THREE.Color('#ffad65'),crystal:new THREE.Color('#9ce6ed')};
function placePoiLights(){
 if(!world||!player||battle||encounter53.active||!['poi','interior'].includes(activeScene?.kind))return;
 const fixtures=poiFixtureSources(),room=activeScene.kind==='interior';
 if(!fixtures.length)return;
 const pool=world.userData.lanterns,day=room?0:celestial31.day.value;
 // Keep the same lights when two fixtures are almost equidistant. Only
 // overlapping pools of light can affect actors and walls at this distance.
 for(const f of fixtures){
  if(f.site)f.site.core.getWorldPosition(f.position);
  const dx=f.position.x-player.x,dz=f.position.z-player.z;
  f.rank=(dx*dx+dz*dz)/(f.site?2.3:f.kind==='fire'?1.65:1)-(f.selected?2:0);
 }
 fixtures.sort((a,b)=>a.rank-b.rank);
 for(const f of fixtures)f.selected=false;
 const count=Math.min(room?6:4,pool?.length??0);
 for(let i=0;i<count;i++){
  const l=pool[i],f=fixtures[i];
  if(l.userData.effectUntil>clock)continue;
  if(!f){l.intensity=0;continue;}
  f.selected=i<2;
  l.position.copy(f.position);l.color.copy(fixtureColours[f.kind]);l.decay=2;l.userData.emitterKind=f.kind;
  l.distance=f.site?19:f.kind==='fire'?14:room?10:13;
  if(f.site)l.intensity=29+Math.max(f.site.glow.intensity,state.restoredLights?.includes(f.site.id)?12:0)*1.5;
  else l.intensity=f.kind==='fire'?(room?32:23)*firelight163(clock,f.position.x):room?16:mix(17,1.6,day);
 }
}
const fixtureLightBefore=updateLighting;
updateLighting=function(...args){const r=fixtureLightBefore(...args);placePoiLights();return r;};
const fixtureBuildBefore=buildWorld;
buildWorld=function(...args){
 const result=fixtureBuildBefore(...args);
 if(world&&['poi','interior'].includes(activeScene?.kind)){delete world.userData.poiFixtures;placePoiLights();}
 return result;
};

function actorLampCaster(actor){
 const mesh=actor.mesh;if(!mesh||mesh.customDistanceMaterial)return;
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
const shadowsForWorld=new WeakMap();
let activeFixtureWorld=null;
function releaseFixtureShadows(w){
 const info=shadowsForWorld.get(w);if(!info)return;
 for(const l of info.chosen){l.castShadow=false;l.shadow.needsUpdate=false;}
 info.chosen.clear();info.at=-Infinity;
}
function updateFixtureShadows(){
 const enabled=world&&player&&!battle&&!encounter53.active&&['poi','interior'].includes(activeScene?.kind);
 if(activeFixtureWorld&&(!enabled||activeFixtureWorld!==world)){releaseFixtureShadows(activeFixtureWorld);activeFixtureWorld=null;}
 if(!enabled)return;
 activeFixtureWorld=world;
 const data=world.userData,pool=data.lanterns??[];
 let info=shadowsForWorld.get(world);
 if(!info){info={chosen:new Set(),at:-Infinity};shadowsForWorld.set(world,info);}
 const mobile=touchDevice33()||state.settings.quality==='low',budget=mobile?1:2,interval=mobile?1/12:1/20;
 const lights=pool.slice(0,activeScene.kind==='interior'?6:4);
 for(const site of data.lightSites??[])if(site.glow?.parent)lights.push(site.glow);
 const candidates=[];
 for(const light of lights){
  if(!light.visible||light.intensity<1||light.userData.effectUntil>clock)continue;
  const p=light.getWorldPosition(V3()),distance=Math.hypot(p.x-player.x,p.z-player.z);
  if(distance>light.distance+10)continue;
  candidates.push({light,p,rank:(distance*distance+5)/light.intensity*(info.chosen.has(light)?.85:1)});
 }
 candidates.sort((a,b)=>a.rank-b.rank);
 const picks=candidates.slice(0,budget),next=new Set(picks.map(c=>c.light));
 for(const l of info.chosen)if(!next.has(l))l.castShadow=false;
 let dirty=false;
 for(const {light:l,p} of picks){
  const sh=l.shadow,moved=!l.userData.shadowOrigin||l.userData.shadowOrigin.distanceToSquared(p)>.0004;
  l.castShadow=true;sh.autoUpdate=false;
  const size=mobile?256:512,near=l.userData.emitterKind==='crystal'?3.3:.43;
  if(sh.mapSize.x!==size){sh.map?.dispose();sh.map=null;sh.mapSize.setScalar(size);}
  if(sh.camera.near!==near){sh.camera.near=near;sh.camera.updateProjectionMatrix();sh.needsUpdate=true;}
  sh.bias=-.00065;sh.normalBias=.024;sh.radius=2.1;
  if(moved||!info.chosen.has(l)||!sh.map||clock<info.at||clock-info.at>=interval){
   sh.needsUpdate=true;(l.userData.shadowOrigin??=V3()).copy(p);dirty=true;
  }
 }
 info.chosen=next;
 if(dirty){
  for(const a of actors)if(a.mesh?.visible)actorLampCaster(a);
  info.at=clock;shadow36.due=true;renderer.shadowMap.needsUpdate=true;
 }
}
const fixtureFitBefore=fitVisibleShadows;
fitVisibleShadows=function(...args){const r=fixtureFitBefore(...args);updateFixtureShadows();return r;};
const stageBeforeLocalShadows=activateStage53;
activateStage53=function(...args){
 if(activeFixtureWorld){releaseFixtureShadows(activeFixtureWorld);activeFixtureWorld=null;}
 return stageBeforeLocalShadows(...args);
};
const fixtureDisposeBefore=disposeContinuousWorld;
disposeContinuousWorld=function(...args){
 if(world){
  releaseFixtureShadows(world);
  for(const l of [...world.userData.lanterns??[],...(world.userData.lightSites??[]).map(s=>s.glow)].filter(Boolean))l.shadow?.dispose();
  if(activeFixtureWorld===world)activeFixtureWorld=null;
 }
 return fixtureDisposeBefore(...args);
};
